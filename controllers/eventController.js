// Import required modules
const mysql = require('mysql');
const dotenv = require('dotenv');
const util = require('util');
const formatHelpers = require("./dataFormat.js"); // Helper functions for data formatting

// Variable to store the event ID for editing
let editEventId;

// Load configuration file with environment variables
dotenv.config({ path: './.env' });

// Create a database connection object
const db = mysql.createConnection({
host: process.env.DATABASE_HOST,
user: process.env.DATABASE_USER,
password: process.env.DATABASE_PASSWORD,
database: process.env.DATABASE
});

// Promisify the query function to support async/await syntax
const dbQuery = util.promisify(db.query).bind(db);

// Load the Create Event page with subject data
exports.loadCreateEvent = async (req, res) => {
  const userId = req.cookies.userId;
  try {
    const results = await dbQuery('SELECT * FROM subjects WHERE userId = ?', userId);
    const subjects = results.length > 0 ? Object.values(JSON.parse(JSON.stringify(results))) : [];
    res.render('newEvent.ejs', { subData: subjects });
  } catch (err) {
    console.log(err);
    return res.status(500).send('Error retrieving subjects');
  }
};

// Insert a new event into the database
exports.insertEvent = async (req, res) => {
  const dbInsert = formatHelpers.formatEventData(req.body);
  const userId = req.cookies.userId;
  dbInsert.push(userId);
  const sql = 'INSERT INTO event (date, subject, type, location, start, end, repeatDays, repeatUntil, userId) VALUES (?)';
  try {
    await dbQuery(sql, [dbInsert]);
    res.redirect('/dashboard');
  } catch (err) {
    console.log(err);
    return res.status(500).send('Error inserting event');
  }
};

// Set the event ID for editing and redirect to the Edit Event page
exports.setEventId = (req, res) => {
  editEventId = req.body.event.id;
  res.redirect('/editEvent');
};

// Load the Edit Event page with event and subject data
exports.editEvent = async (req, res) => {
  const userId = req.cookies.userId;
  try {
    const eventData = await dbQuery('SELECT * FROM event WHERE id = ?', editEventId);
    const subjects = await dbQuery('SELECT * FROM subjects WHERE userId = ?', userId);
    res.render('editEvent.ejs', { data: { event: eventData[0], subData: subjects } });
  } catch (err) {
    console.log(err);
    return res.status(500).send('Error editing event');
  }
};

// Update an existing event in the database
exports.insertEditEvent = async (req, res) => {
  const eventId = (req.params['id'].replace(':', ''));
  console.log(eventId);
  const dbInsert = formatHelpers.formatEventData(req.body);
  const sql = 'UPDATE event SET ? WHERE id = ?';
  try {
    await dbQuery(sql, [{ date: dbInsert[0], subject: dbInsert[1], type: dbInsert[2], location: dbInsert[3], allDayEvent: dbInsert[4], start: dbInsert[5], end: dbInsert[6], reminderTime: dbInsert[7], repeatdays: dbInsert[8] }, eventId]);
    res.redirect('/dashboard');
  } catch (err) {
    console.log(err);
    return res.status(500).send('Error updating event');
  }
};

// Render the Delete Event confirmation page with event ID
exports.delEventCon = (req, res) => {
  const eventId = (req.params['id'].replace(':', ''));
  const parsedEventId = parseInt(eventId, 10);
  res.render('deleteEventConfirm.ejs', { id: parsedEventId });
};
  
  // Delete an event from the database
exports.deleteEvent = async (req, res) => {
  const eventId = (req.params['id'].replace(':', ''));
  const parsedEventId = parseInt(eventId, 10);
  const sql = 'DELETE FROM event WHERE id = ?';
  try {
    await dbQuery(sql, parsedEventId);
    res.redirect('/dashboard');
  } catch (err) {
    console.log(err);
  }
};