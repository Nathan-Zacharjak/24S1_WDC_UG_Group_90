DROP DATABASE IF EXISTS website_database;

CREATE DATABASE website_database;

USE website_database;

/*CREATE TABLE 'Users' (
    'id' int;
    'username' varchar(100);
    'hash' varchar(100);
    'salt' varchar(100);
    'email' varchar(100);
    'level' varchar(15);
)*/

CREATE TABLE Users(id int AUTO_INCREMENT PRIMARY KEY, username varchar(256), hash varchar(512), salt varchar(256), email varchar(256), level varchar(15));

/*CREATE TABLE 'Branches' (
    'id' int;
    'name' varchar(100);
)*/

CREATE TABLE Branches(id int AUTO_INCREMENT PRIMARY KEY, name varchar(100), imgURL varchar(250));

/*CREATE TABLE 'Branch_members' (
    'branch_id' int;
    'user_id' int;
)*/

CREATE TABLE Branch_members(branch_id int, user_id int, notifications int DEFAULT 1, isManager int DEFAULT 0, PRIMARY KEY(branch_id, user_id), FOREIGN KEY(branch_id) REFERENCES Branches(id));

/*CREATE TABLE 'Events' (
    'id' int;
    'imgURL' varchar(250);
    'description' varchar(1000);
    'publicity' varchar(10);
    'date' varchar(50);
    'location' varchar(150);
    'author_id' int;
)*/

CREATE TABLE Events(id int AUTO_INCREMENT PRIMARY KEY, imgURL varchar(250), description varchar(1000), publicity varchar(10), date varchar(50), location varchar(150), author_id int, FOREIGN KEY(author_id) REFERENCES Branches(id));

/*CREATE 'Event_attendees'(
    'event_id' int;
    'user_id' int;
)*/

CREATE TABLE Event_attendees(event_id int, user_id int, PRIMARY KEY(event_id, user_id), FOREIGN KEY (event_id) REFERENCES Events(id), FOREIGN KEY(user_id) REFERENCES Users(id));

/* root user */
INSERT INTO Users(username, hash, salt, email, level) Values ('Mr. Krabs', '9322bf1ed3c721a9476e161f9df79dd5e67a285c43f102d98a3e7328695c588e237ca16f1e6f5e2650af6c71adfb35f9627c294bd924a677c4773377447d9b1f', '3e99bf8d9518884303c03933b3b25501a671c040af57d3bf5c87081c0ec5881a', 'admin@admin.com', 'admin');
INSERT INTO Branches(name) VALUES('branch1');
-- INSERT INTO Events(description, publicity, date, location, author_id) VALUES('first one', 'public', '21/09/2024', 'adelaide uni', 1);
