/*
sample queries
*/

/* to retrieve username and password*/
SELECT username, password FROM Users WHERE (username = ? AND password = ?);

/* to insert username and password*/
INSERT INTO Users(username, password) VALUES (?,?);

/* to retrieve event information */
SELECT imgURL, description, publicity, date, location, author_id FROM Events WHERE id = ?;

/* to insert event information */
INSERT INTO Events(id, imgURL, description, publicity, date, location, author_id) VALUES();

/* to retrieve event attendees */
SELECT user_id FROM Event_attendees WHERE event_id = ?;

/* to insert event attendees */
INSERT INTO Event_attendees(event_id, user_id) VALUES(?,?);
