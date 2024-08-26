var express = require('express');
var crypto = require("crypto");
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

//
// Any routes/middleware defined here should have a requirement of the user being logged in!
// (Define publicly avaliable routes in in routes/index.js!)
//

// Logging the user out
router.get('/logout', function (req, res, next) {
    if (req.session.user) {
        delete req.session.user;
    }
    res.sendStatus(200);
});

// Checking if the user is logged in
router.get('/logincheck', function (req, res, next) {
    if (!req.session.user) return;

    const q = 'SELECT level from Users WHERE id=?';

    req.pool.getConnection(function (err, connection) {
        if (err) {
            res.sendStatus(500);
            console.log('connection err');
            return;
        }
        connection.query(q, [req.session.user.id], function (qerr, rows, fields) {

            connection.release();
            if (qerr) {
                res.sendStatus(500);
                console.log('q err');
                return;
            }

            res.send(JSON.stringify(rows[0]));
        });
    });
});

router.get('/get', (req, res) => {
    res.send(JSON.stringify({ username: req.session.user.username, email: req.session.user.email }));
});

// Updating user info stuff //

// Helper function to handle adding a user into the database once they've signed up
function UpdateUserInfoIntoDatabase(req, res, username, email, password, oldUsername) {
    const salt = crypto.randomBytes(32).toString("hex");
    // Using sha512 as it's basically the accepted standard hashing algorithm
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");

    const query = "UPDATE Users SET username = ?, hash = ?, salt = ?, email = ? WHERE username = ?;";

    req.pool.getConnection(function (err, connection) {
        if (err) {
            res.sendStatus(500);
            console.log("Update user info MySQL connection error:", err);
            return;
        }
        connection.query(query, [username, hash, salt, email, oldUsername], function (qerr, rows, fields) {
            connection.release();

            if (qerr) {
                res.sendStatus(500);
                console.log("Update user info MySQL query error:", qerr);
                return;
            } else {
                req.session.user.username = username;
                req.session.user.email = email;
                req.session.user.hash = hash;
                req.session.user.salt = salt;
                res.status(200).send("success");
            }
        });
    });
}

// POST request handling a user updating their profile
router.post("/updateprofile", function (req, res, next) {
    const oldUsername = req.body.oldUsername;
    const username = req.body.username;
    const email = req.body.email;

    // Check if the user is updating their password or not,
    // Old password, and a username and email are required fields and should always be there
    let password = req.body.newPassword;
    if (password === '') {
        password = req.body.oldPassword;
    }

    // First check if the user is an admin, or the user is updating their own account
    if (oldUsername !== req.session.user.username && req.session.user.level !== 'admin') {
        res.status(200).send("You don't have permission to perform that action, try refreshing the page");
        return;
    }

    // First check that their new username/email isn't already taken, and current ignore the user themselves
    const uniqueUsernameQuery = "SELECT username, email FROM Users WHERE (username = ? OR email = ?) AND id <> ?;";

    req.pool.getConnection(function (err, connection) {
        if (err) {
            res.sendStatus(500);
            console.log("Unique username update profile MySQL connection error:", err);
            return;
        }
        connection.query(uniqueUsernameQuery, [username, email, req.session.user.id], function (qerr, rows, fields) {
            connection.release();

            if (qerr) {
                res.sendStatus(500);
                console.log("Unique username update profile MySQL query error:", qerr);
                return;

            } else if (rows.length !== 0) {
                res.status(200).send("Username or email already taken");
                return;

            } else {
                UpdateUserInfoIntoDatabase(req, res, username, email, password, oldUsername);
            }
        });
    });
});

function DeleteUserFromDatabase(req, res, username, selfDelete) {
    // Now delete the user from the database
    const deleteUserQuery = "DELETE FROM Users WHERE username = ?;";

    req.pool.getConnection(function (err, connection) {
        if (err) {
            res.sendStatus(500);
            console.log("Delete user MySQL connection error:", err);
            return;
        }
        connection.query(deleteUserQuery, [username], function (qerr, rows, fields) {
            connection.release();

            if (qerr) {
                res.sendStatus(500);
                console.log("Delete user MySQL query error:", qerr);
                return;

            } else {
                // Delete the user's current session if they are deleting their own account
                if (selfDelete && req.session.user) {
                    delete req.session.user;
                }
                res.status(200).send("success");
            }
        });
    });
}

// POST request handling a user deleting their account
router.post("/delete", function (req, res, next) {
    const username = req.body.username;
    let selfDelete = false;

    // First check if the user is an admin, or the user is deleting their own account
    if (username === req.session.user.username) {
        selfDelete = true;
    } else if (username !== req.session.user.username && req.session.user.level !== 'admin') {
        res.status(200).send("You don't have permission to perform that action, try refreshing the page");
        return;
    }

    // Then check that the user to delete currently exists
    const userExistsQuery = "SELECT username FROM Users WHERE username = ?;";

    req.pool.getConnection(function (err, connection) {
        if (err) {
            res.sendStatus(500);
            console.log("User exists check delete user MySQL connection error:", err);
            return;
        }
        connection.query(userExistsQuery, [username], function (qerr, rows, fields) {
            connection.release();

            if (qerr) {
                res.sendStatus(500);
                console.log("User exists check delete user MySQL query error:", qerr);
                return;

            } else if (rows.length === 0) {
                res.status(200).send("Invalid login, try refreshing the page");
                return;

            } else {
                DeleteUserFromDatabase(req, res, username, selfDelete);
            }
        });
    });
});

module.exports = router;
