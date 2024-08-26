# Setup
Open a terminal window in the /client directory, and one in the /server directory.\
In both the client and server terminal window run:

```sh
npm install
```

For the server, you may need to run each of these commands to manually install the required packages it uses:

```sh
npm install express
npm install body-parser
npm install express-session
npm install dotenv
npm install express-flash
npm install --save mysql
npm install nodemailer
```

Setup server database with:

```sh
service mysql start
mysql < server/database/reset-database.sql
```

You need a ".env" file with a SESSION_SECRET environment variable set to a cryptographically secure pseudo random string for server sessions to work; however, for your convenience, this has been commented out and replaced with a basic string, as the .env file was never uploaded to the GitHub repository for security.\
\
\
To test the email notifications feature, go to: https://ethereal.email/create \
And fill in the generated email address and password in at the top of the server/app.js file

Run the server terminal window with:

```sh
node app.js
```

Then run the client terminal window with:

```sh
npm run dev
```

