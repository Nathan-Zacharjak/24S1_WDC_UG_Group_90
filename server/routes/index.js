var express = require('express');
var crypto = require("crypto");
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

// User Login/Signup stuff //

// Helper function to handle adding a user into the database once they've signed up
function InsertNewUserIntoDatabase(req, res, username, password, email) {
    const salt = crypto.randomBytes(32).toString("hex");
    // Using sha512 as it's basically the accepted standard hashing algorithm
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");

    const query = "INSERT INTO Users(username, hash, salt, email, level) VALUES(?, ?, ?, ?, 'User');";

    req.pool.getConnection(function (err, connection) {
        if (err) {
            res.sendStatus(500);
            console.log("Signup MySQL connection error:", err);
            return;
        }
        connection.query(query, [username, hash, salt, email], function (qerr, rows, fields) {
            connection.release();

            if (qerr) {
                res.sendStatus(500);
                console.log("Signup MySQL query error:", qerr);
                return;
            } else {
                res.status(200).send("success");
            }
        });
    });
}

// POST request handling a user signing up
router.post("/signup", function (req, res, next) {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    // First check that the username/email is not already taken
    const uniqueUsernameQuery = "SELECT username, email FROM Users WHERE username = ? OR email = ?";

    req.pool.getConnection(function (err, connection) {
        if (err) {
            res.sendStatus(500);
            console.log("Unique username signup MySQL connection error:", err);
            return;
        }
        connection.query(uniqueUsernameQuery, [username, email], function (qerr, rows, fields) {
            connection.release();

            if (qerr) {
                res.sendStatus(500);
                console.log("Unique username signup MySQL query error:", qerr);
                return;

            } else if (rows.length !== 0) {
                res.status(200).send("Username or email already taken");
                return;

            } else {
                InsertNewUserIntoDatabase(req, res, username, password, email);
            }
        });
    });
});

// *THE* POST request that handles users logging in
// Sent when a user clicks on the "Login" button
router.post("/login", function (req, res, next) {
    const username = req.body.username;
    const password = req.body.password;
    const query = "SELECT * FROM Users WHERE username = ?;";

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.log("Login MySQL connection error:", err);
            return;
        }

        connection.query(query, [username], function (qerr, rows, fields) {
            connection.release();
            let user = null;

            if (qerr) {
                console.log("Login MySQL query error:", qerr);
                return;
            } else if (rows.length === 0) {
                user = null;
                res.status(200).send("Username or password incorrect!");
            } else {
                user = rows[0];

                if (!user) {
                    res.status(200).send("Username or password incorrect!");
                }

                let validPassword = false;
                // Using sha512 as it's basically the accepted standard hashing algorithm
                var hashVerify = crypto.pbkdf2Sync(password, user.salt, 10000, 64, "sha512").toString("hex");
                if (user.hash === hashVerify) {
                    validPassword = true;
                }

                if (validPassword) {
                    req.session.user = user;
                    res.status(200).send("success");
                } else {
                    res.status(200).send("Username or password incorrect!");
                }
            }
        });
    });
});

module.exports = router;
