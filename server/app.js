// !!! Go to: https://ethereal.email/create to get a testing email address and password !!!
// (Need to get a new one and put it in here whenever you close your web browser window)
const senderAddress = 'giles.ohara@ethereal.email';
const emailPassword = 'dWwTJNc6Mx3cakCjXq';



var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postsRouter = require('./routes/posts');
var branchRouter = require('./routes/branch');

var session = require('express-session');
var dotenv = require('dotenv');
dotenv.config();

var mysql = require('mysql');
var nodemailer = require('nodemailer');

var dbConnectionPool = mysql.createPool({
    host: 'localhost',
    database: 'website_database'
});

var app = express();

app.use(function (req, res, next) {
    req.pool = dbConnectionPool;
    next();
});

// Making email notification emailer avaliable in all routes
// Setup for email notifications to work
var emailer = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
        user: senderAddress,
        pass: emailPassword
    }
});
emailer.senderAddress = senderAddress;
emailer.password = emailPassword;

app.use(function (req, res, next) {
    req.emailer = emailer;
    next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('secret'));

// User sessions
app.use(session({
    // secret: process.env.SESSION_SECRET,
    secret: "this is bad security, this is just here to make running the server for you as easy as possible, in practice the above commented line would be here instead",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/branch', branchRouter);

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3000;

// Middleware function to protect login-required webpages!
app.use(function (req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(200).send('login failure');
    }
});
// Any routes placed in the "routes/users.js" will be re-directed to the login page if not logged in!
app.use('/users', usersRouter);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
