const mysql = require("mysql");
const dotenv = require('dotenv');
const util = require('util');
const moment = require('moment');
var sessionTask;
var sessionId = 0;

// Load environment variables from the configuration file
dotenv.config({ path: './.env' });

// Configure and establish a database connection
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

// Promisify the db.query method for easier async/await usage
const dbQuery = util.promisify(db.query).bind(db);


//Function to update tasksession
  exports.editSession = async (req, res) => {
    try {
      const session = req.body;
      const id = getSessionId();
      const dbInsert = { task: sessionTask, start: session.startTime, end: session.endTime, date: session.date };
      const sql = 'UPDATE tasksession SET ? WHERE id = ?';
      await dbQuery(sql, [dbInsert, id]);
      sessionTask = null;
      res.redirect('/dashboard');
    } catch (err) {
      console.log(err);
    }
  };

  //function to add new task session  
  exports.addTaskSession = async (req, res) => {
    try {
      const session = req.body;
      let start = moment(session.start).format('HH:mm:ss');
      let end = moment(session.end).format('HH:mm:ss');
      let date = moment(session.start).format('YYYY-MM-DD');
      const dbInsert = [session.taskId, start, end, date];
      const sql = 'INSERT INTO tasksession (task, start, end, date) VALUES (?)';
      await dbQuery(sql, [dbInsert]);
      res.redirect('/dashboard');
    } catch (err) {
      console.log(err);
    }
  };
  

  //function to get id of task session selected
  exports.editTaskSession = (req, res) => {
    setSessionId(req.body.event.id);
    res.redirect('/editSession');
  };
  

  //Function to open edit task session form
  exports.openEditSession = async (req, res) => {
    try {
      const sql = 'SELECT * FROM tasksession WHERE id=?';
      const sessId = getSessionId();
      const results = await dbQuery(sql, sessId);
      const sessionData = Object.values(JSON.parse(JSON.stringify(results)));
      sessionTask = sessionData[0].task;
      res.render('editSession.ejs', { session: sessionData[0] });
    } catch (err) {
      console.log(err);
    }
  };
  
  //Function to delete task session
  exports.delTaskSession = async (req, res) => {
    try {
      const eventId = (req.params['id'].replace(':', ''));
      const sql = 'DELETE FROM tasksession WHERE id = ?';
      await dbQuery(sql, parseInt(eventId, 10));
      res.redirect('/dashboard');
    } catch (err) {
      console.log(err);
    }
  };

  //Function to update task session
  exports.editSession = async (req, res) => {
    try {
      const session = req.body;
      const id = getSessionId();
      const dbInsert = { task: sessionTask, start: session.startTime, end: session.endTime, date: session.date };
      const sql = 'UPDATE tasksession SET ? WHERE id = ?';
      await dbQuery(sql, [dbInsert, id]);
      sessionTask = null;
      res.redirect('/dashboard');
    } catch (err) {
      console.log(err);
    }
  };

function setSessionId(sesId) {
    sessionId = sesId;
  }
  
  function getSessionId() {
    return sessionId;
  }