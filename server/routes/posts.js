var express = require('express');
var router = express.Router();

// Gets all posts made by ANY branch
router.get('/', (req, res) => {
    const q = 'select *  from Events WHERE publicity LIKE ? ORDER BY id DESC;';

    const publicity = req.session.user ? '%' : 'public';

    req.pool.getConnection(function (err, connection) {
        if (err) {
            res.sendStatus(500);
            console.log('connection err');
            return;
        }
        connection.query(q, [publicity], function (qerr, rows, fields) {

            connection.release();
            if (qerr) {
                res.sendStatus(500);
                console.log('q err');
                return;
            }

            res.send(JSON.stringify(rows));
        });
    });
});

// Gets all posts made by a particular branch
router.get('/branch', (req, res) => {
    const q = 'select * from Events WHERE author_id=? AND publicity LIKE ? ORDER BY id DESC;';

    const publicity = req.session.user ? '%' : 'public';

    req.pool.getConnection(function (err, connection) {
        if (err) {
            res.sendStatus(500);
            console.log('connection err');
            return;
        }
        connection.query(q, [req.query.id, publicity], function (qerr, rows, fields) {

            connection.release();
            if (qerr) {
                res.sendStatus(500);
                console.log('q err');
                return;
            }

            res.send(JSON.stringify(rows));
        });
    });
});

router.use((req, res, next) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    next();
});

// Email notification stuff //
// (The basic create/get post stuff is below)

// Sends the emails to the list of users subscribed to a branch that made a new post
function SendSubscribedUserEmails(req, author_name, recipient_emails) {
    // New posts' information
    const imgURL = req.body.imgURL;
    const description = req.body.description;
    const date = req.body.date;
    const location = req.body.location;

    let info = req.emailer.sendMail({
        from: req.emailer.senderAddress, // sender address
        to: recipient_emails, // list of receivers
        subject: "New post from " + author_name, // Subject line
        text: "Date: " + date + "\nLocation: " + location + "\n\n" + description, // plain text body
        // VVV Pretty sure this is a security issue, need some way of sanitising the input of html tags
        // html: "<img src='" + imgURL + "'><br><br>" + "<b>" + "Date: " + date + "<br>Location: " + location + "</b><br><br>" + description // html body
    });
}

// Gets the list of users that are subscribed to receive notifications from the branch that made the post
function GetSubscribedUserEmails(req, author_name) {
    // Next, we need to get an array of all user's emails we need to send an email to
    const query = 'SELECT email FROM Events INNER JOIN Branch_members ON Events.author_id = Branch_members.branch_id INNER JOIN Users ON Branch_members.user_id = Users.id WHERE Branch_members.notifications=1 AND Events.author_id = ?;';

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.log('Email notification get email list SQL connection error');
            return;
        }
        connection.query(query, [req.body.author_id], function (qerr, rows, fields) {

            connection.release();

            if (qerr) {
                console.log('Email notification get email list SQL query error');
                return;
            } else if (rows.length === 0) {
                console.log('No emails to send a notification to');
                return;
            }

            let recipient_emails = [];
            for (const row of rows) {
                if (!recipient_emails.includes(row.email)) {
                    recipient_emails.push(row.email);
                }
            }

            SendSubscribedUserEmails(req, author_name, recipient_emails);
        });
    });
}

// Sends an email to the provided address
function SendEmailNotifications(req) {
    // First, we need to get the branches' name that made the post
    const query = "SELECT name FROM Branches WHERE id = ?;";

    req.pool.getConnection(function (err, connection) {
        if (err) {
            console.log('Email notification branch name SQL connection error');
            return;
        }
        connection.query(query, [req.body.author_id], function (qerr, rows, fields) {
            connection.release();

            if (qerr) {
                console.log('Email notification branch name SQL query error');
                return;
            }

            let author_name = rows[0].name;

            GetSubscribedUserEmails(req, author_name);
        });
    });
}

// Post creating/getting //

// Create a new post
// (Which triggers an email notification for users that have set to receive one)
router.post('/create', (req, res) => {
    const q = 'INSERT INTO Events(imgURL, description, publicity, date, location, author_id) VALUES (?, ?, ?, ?, ?, ?);';
    const r = 'SELECT email FROM Events INNER JOIN Branch_members ON Events.author_id = Branch_members.branch_id INNER JOIN Users ON Branch_members.user_id = Users.id WHERE Branch_members.notifications=1 AND Events.author_id = ?;';
    req.pool.getConnection(function (err, connection) {
        if (err) {
            res.sendStatus(500);
            console.log('connection err');
            return;
        }
        connection.query(q, Object.values(req.body), function (qerr, rows, fields) {

            connection.release();
            if (qerr) {
                res.sendStatus(500);
                console.log('q err');
                return;
            }

            SendEmailNotifications(req);
            res.send(JSON.stringify(rows));
        });
    });
});

// Gets all posts from branches a given user is following
router.get('/following', (req, res) => {
    const q = 'select * from Events INNER JOIN Branch_members ON Events.author_id = Branch_members.branch_id WHERE Branch.user_id=1 ORDER BY Events.id DESC;;';

    req.pool.getConnection(function (err, connection) {
        if (err) {
            res.sendStatus(500);
            console.log('connection err');
            return;
        }
        connection.query(q, function (qerr, rows, fields) {

            connection.release();
            if (qerr) {
                res.sendStatus(500);
                console.log('q err');
                return;
            }

            res.send(JSON.stringify(rows));
        });
    });
});

module.exports = router;
