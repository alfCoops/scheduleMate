// Import required modules and libraries
const mysql = require("mysql"); // MySQL library for database operations
const dotenv = require("dotenv"); // dotenv library to manage environment variables
const nlpProcessor = require("../public/nlpProcessor"); // Custom NLP processor module
const formatHelpers = require("./dataFormat.js"); // Helper functions for data formatting

// Import promisify from the 'util' module to convert callback-based functions into promise-based functions
const { promisify } = require('util');

// Load environment variables from the .env file
dotenv.config({ path: "./.env" });

// Declare global variables
var goalsPastDeadline;
var updatedSubjects;

// Create a connection to the database using environment variables
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

// Promisify the query function from the 'mysql' library and bind it to the 'db' object
const query = promisify(db.query).bind(db);

// Route handler to load the landing page
exports.loadLandingPage = (req, res) => {
  res.render("landing.ejs");
};

// Route handler to load the dashboard page
exports.loadDashboard = async (req, res) => {
  try {
    // Get user ID from cookies
    const userId = req.cookies.userId;

    // Perform multiple database queries in parallel using Promise.all
    const [
      subjects,
      eventResult,
      taskSessionRes,
      goalsResults,
      tasksResults,
      username
    ] = await Promise.all([
      query('SELECT * FROM subjects WHERE userId=?', [userId]),
      query('SELECT * FROM event WHERE userId = ?', [userId]),
      query('SELECT * FROM tasksession'),
      query('SELECT * FROM goals'),
      query('SELECT * FROM tasks'),
      query('SELECT name FROM user WHERE id=?', userId)
    ]);

    // Merge the event data with the subject data
    const mergedArray = formatHelpers.mergeEventDataWithSubjectData(eventResult, subjects);
    // Format the event data for display in the calendar
    const events = formatHelpers.formatEventDataForCalendar(mergedArray);
    // Format the task session data for display in the calendar
    const taskSessions = formatHelpers.formatTaskSessionsForCalendar(taskSessionRes, tasksResults, goalsResults, subjects);
    // Update subjects with accumulated time
    const updatedSubjects = formatHelpers.updateSubjectsWithAccumulatedTime(subjects, events, taskSessions, tasksResults, goalsResults);
    // Calculate the days remaining until the deadline
    const daysToDeadline = [];
    // Generate messages based on goal results, updated subjects, task sessions, and task results
    const messages = formatHelpers.generateMessages(goalsResults, updatedSubjects, taskSessions, tasksResults);
    // Render the dashboard page with the collected data
    console.log(messages);
    res.render('dashboard.ejs', {
      data: {
        eventData: events,
        goalData: goalsResults,
        taskData: tasksResults,
        deadline: daysToDeadline,
        taskSessionData: taskSessions,
        subjectData: updatedSubjects,
        messageData: messages,
        nameData: username[0].name,
      },
    });
  } catch (err) {
    // Log any errors that occur during execution
    console.log(err);
  }
};

//Function to open notification        
exports.getSolutionPage = async (req, res) => {
  const solution = '';
  res.render('suggestion.ejs', {
    data: {
      solutionData: solution,
      goalData: goalsPastDeadline,
      subjectData: updatedSubjects,
    },
  });
};

//Function to display the solution
exports.showSolution = async (req, res) => {
  const userInput = req.body.issueInput;
  const matchingIssues = nlpProcessor.findBestMatchingIssues(userInput);//gets solution to time management issue
  let solution;
  //Format solution message
  if (matchingIssues.length > 0) {
    solution = matchingIssues.map((issue, index) => `Solution ${index + 1}: ${issue.solution}`).join('\n');
  } else {
    solution = "I'm not sure how to help with that issue. Can you please provide more information?";
  }
  res.json({ solutionData: solution });
};


    
