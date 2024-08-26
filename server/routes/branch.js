var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    const q = 'select * from Branches;';

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

router.get('/branchID', (req, res) => {
    const q = 'SELECT * from Branches WHERE id=?;';

    req.pool.getConnection(function (err, connection) {
        if (err) {
            res.sendStatus(500);
            console.log('connection err');
            return;
        }
        connection.query(q, [req.query.r], function (qerr, rows, fields) {

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

router.post('/create', (req, res) => {
    const q = 'INSERT INTO Branches(name, imgURL) VALUES(?, ?);';

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

            res.sendStatus(200);
        });
    });
});

router.get('/members', (req, res) => {
    const q = 'SELECT Users.id, Users.username, Branch_members.isManager from Users INNER JOIN Branch_members on Users.id = Branch_members.user_id WHERE branch_id=? AND Users.level="user"';

    req.pool.getConnection(function (err, connection) {
        if (err) {
            res.sendStatus(500);
            console.log('connection err');
            return;
        }
        connection.query(q, [req.query.BID], function (qerr, rows, fields) {

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


router.post('/delete', (req, res) => {
    const q = 'DELETE FROM Branches WHERE id=?;';

    req.pool.getConnection(function (err, connection) {
        if (err) {
            res.sendStatus(500);
            console.log('connection err');
            return;
        }
        connection.query(q, [req.query.r], function (qerr, rows, fields) {

            connection.release();
            if (qerr) {
                res.sendStatus(500);
                console.log('q err');
                return;
            }

            res.sendStatus(200);
        });
    });
});

router.post('/followAction', (req, res) => {
    // remove duplicate user_id

    req.pool.getConnection(function (err, connection) {
        if (err) {
            res.sendStatus(500);
            console.log('connection err');
            return;
        }

        const q = 'DELETE FROM Branch_members WHERE branch_id=? AND user_id=?;';

        connection.query(q, [req.query.BID, req.session.user.id], function (qerr, rows, fields) {

            connection.release();
            if (qerr) {
                res.sendStatus(500);
                console.log('q err');
                return;
            }
        });
    });

    // add follower
    req.pool.getConnection(function (err, connection) {
        if (err) {
            res.sendStatus(500);
            console.log('New branch follower SQL connection error');
            return;
        }

        const query = 'INSERT INTO Branch_members(branch_id, user_id, notifications) VALUES(?, ?, ?);';
        const parms = [req.query.BID, req.session.user.id, req.query.followStatus];

        connection.query(query, parms, function (qerr, rows, fields) {

            connection.release();
            if (qerr) {
                res.sendStatus(500);
                console.log('New branch follower SQL query error');
                return;
            }

            res.sendStatus(200);
        });
    });
});

router.post('/unfollow', (req, res) => {
    const q = 'DELETE FROM Branch_members WHERE branch_id=? AND user_id=?;';

    req.pool.getConnection(function (err, connection) {
        if (err) {
            res.sendStatus(500);
            console.log('connection err');
            return;
        }
        connection.query(q, [req.query.BID, req.session.user.id], function (qerr, rows, fields) {

            connection.release();
            if (qerr) {
                res.sendStatus(500);
                console.log('q err');
                return;
            }

            res.sendStatus(200);
        });
    });
});

router.get('/followStatus', (req, res) => {
    const q = 'select notifications from Branch_members where branch_id=? and user_id=?;';

    req.pool.getConnection((err, connection) => {
        if (err) {
            res.sendStatus(500);
            console.log('connection err');
            return;
        }
        connection.query(q, [req.query.BID, req.session.user.id], function (qerr, rows, fields) {

            connection.release();
            if (qerr) {
                res.sendStatus(500);
                console.log('q err');
                return;
            }

            if (rows.length === 0)
                res.send(JSON.stringify({ notifications: -1 }));
            else res.send(JSON.stringify(rows[0]));
        });
    });
});

router.post('/addManager', (req, res) => {
    //delete duplicate row
    req.pool.getConnection(function (err, connection) {
        if (err) {
            res.sendStatus(500);
            console.log('connection err');
            return;
        }
        const q = 'delete from Branch_members WHERE branch_id = ? AND user_id=?;';

        connection.query(q, [req.query.BID, req.query.UID], function (qerr, rows, fields) {

            connection.release();
            if (qerr) {
                res.sendStatus(500);
                console.log('q err');
                return;
            }
        });
    });

    // add Manager
    req.pool.getConnection(function (err, connection) {
        if (err) {
            res.sendStatus(500);
            console.log('connection err');
            return;
        }
        const q = 'INSERT INTO Branch_members(branch_id, user_id, isManager) VALUES (?, ?, 1);';

        connection.query(q, [req.query.BID, req.query.UID], function (qerr, rows, fields) {

            connection.release();
            if (qerr) {
                res.sendStatus(500);
                console.log('q err');
                return;
            }

            res.sendStatus(200);
        });
    });
});

router.post('/removeManager', (req, res) => {
    const q = 'DELETE FROM Branch_members WHERE branch_id=? AND user_id=?;';

    req.pool.getConnection(function (err, connection) {
        if (err) {
            res.sendStatus(500);
            console.log('connection err');
            return;
        }
        connection.query(q, [req.query.BID, req.query.UID], function (qerr, rows, fields) {

            connection.release();
            if (qerr) {
                res.sendStatus(500);
                console.log('q err');
                return;
            }

            res.sendStatus(200);
        });
    });
});

router.get('/isManager', (req, res) => {
    req.pool.getConnection((err, connection) => {
        if (err) {
            res.sendStatus(500);
            console.log('connection err');
            return;
        }

        const q = 'select * from Branch_members where branch_id = ? and user_id = ? ;';

        connection.query(q, [req.query.BID, req.session.user.id], function (qerr, rows, fields) {

            connection.release();
            if (qerr) {
                res.sendStatus(500);
                console.log('q err');
                return;
            }

            if (rows.length !== 0 && rows[0].isManager)
                res.send(JSON.stringify({ res: true }));
            else res.send(JSON.stringify({ res: false }));
        });
    });
});

module.exports = router;
