const mysql = require("mysql");
const dotenv = require('dotenv');
const util = require('util');
var currentTasks = [];


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

// Load the create goal page with user's subjects
exports.loadCreateGoal = async (req, res) => {
  try {
    const userId = req.cookies.userId;
    currentTasks = [];
    const results3 = await dbQuery('SELECT * FROM subjects WHERE userId = ?', userId);
    const subjects = Object.values(JSON.parse(JSON.stringify(results3)));
    res.render('newGoal.ejs', { subData: subjects });
  } catch (err) {
    console.log('Error in loadCreateGoal:', err);
    res.status(500).send('Internal server error');
  }
};

// Initialise the task array with the provided tasks
exports.initialiseTaskArray = (req, res) => {
  const tasks = req.body;
  for (let i = 0; i < tasks.length; i++) {
    currentTasks.push(tasks[i].todoText);
  }
  console.log(currentTasks);
};

// Add a task to the currentTasks array
exports.addTask = (req, res) => {
  currentTasks.push(req.body.todoText);
};

// Delete a task from the currentTasks array
exports.deleteTask = (req, res) => {
  const task = req.body.taskId;
  const index = currentTasks.indexOf(task);
  if (index > -1) {
    currentTasks.splice(index, 1);
  }
  console.log(currentTasks);
};

// Insert a goal and its tasks into the database
exports.insertGoal = async (req, res) => {
  try {
    const tasks = req.body.data;
    const goalName = req.body.form.goalName;
    const goalDueDate = req.body.form.goalDueDate;
    const subject = req.body.form.eventSubject;
    const priority = req.body.form.goalPriority;
    const userId = req.cookies.userId;

    const dbInsert = [goalName, goalDueDate, priority, subject, userId];
    const sql = 'INSERT INTO goals (name, dueDate, priority, subject, userId) VALUES (?)';

    // Insert the goal into the database
    const goalInsert = await dbQuery(sql, [dbInsert]);

    const id = goalInsert.insertId;
    const tasksInsert = [];
    for (let i = 0; i < tasks.length; i++) {
      tasksInsert.push([id, tasks[i].todoText, 0]);
    }
    // Insert the tasks into the database
    await dbQuery('INSERT INTO tasks (goal, name, completed) VALUES ?', [tasksInsert]);
    res.redirect('/dashboard');
  } catch (err) {
    console.log('Error in insertGoal:', err);
    res.status(500).send('Internal server error');
  }
};


  
  //function to mark task as complete
  exports.taskComplete = async (req, res) => {
    try {
      const sql = 'UPDATE tasks SET completed=? WHERE id = ?';
      const completed = parseInt(req.body.task);
      await dbQuery(sql, [1, completed]);
    } catch (err) {
      console.log(err);
    }
  };
  

  //function to mark task as uncomplete
  exports.taskUncomplete = async (req, res) => {
    try {
      const sql = 'UPDATE tasks SET completed=? WHERE id = ?';
      const completed = parseInt(req.body.task);
      await dbQuery(sql, [0, completed]);
    } catch (err) {
      console.log(err);
    }
  };


//function to open edit goal form
exports.openEditGoal = async (req, res) => {
  try {
    currentTasks = [];
    const id = (req.params['id'].replace(':', ''));
    const sql = 'SELECT * FROM goals WHERE id=?';
    const goalData = await dbQuery(sql, parseInt(id, 10));
    const taskData = await dbQuery('SELECT * FROM tasks WHERE goal = ?', parseInt(id, 10));
    const subjects = await dbQuery('SELECT * FROM subjects');
    res.render('editGoal.ejs', { data: { task: taskData, goal: goalData[0], subData: subjects } });
} catch (err) {
  console.log(err);
}
};

//function to update goal
exports.insertEditGoal = async (req, res) => {
    try {
      const id = (req.params['id'].replace(':', ''));
      const goalName = req.body.goalName;
      const goalDueDate = req.body.goalDueDate;
      const sub = req.body.eventSubject;
      const goalPriority = req.body.goalPriority;
      const dbInsert = { name: goalName, dueDate: goalDueDate, priority: goalPriority, subject: sub };
      const sql = 'UPDATE goals SET ? WHERE id = ?';
      await dbQuery(sql, [dbInsert, parseInt(id, 10)]);
  
      await dbQuery('DELETE FROM tasks WHERE goal = ?', parseInt(id, 10));
  
      const tasks = currentTasks;
      const tasksInsert = [];
      for (let i = 0; i < tasks.length; i++) {
        tasksInsert.push([parseInt(id, 10), tasks[i]]);
      }
  
      await dbQuery('INSERT INTO tasks (goal, name) VALUES ?', [tasksInsert]);
      res.redirect('/dashboard');
    } catch (err) {
      console.log(err);
    }
  };
  

  //Function to open delete goal confirmation
  exports.delGoalCon = (req, res) => {
    const goalId = (req.params['id'].replace(':', ''));
    res.render('deleteGoalConfirm.ejs', { id: parseInt(goalId, 10) });
  };

//function to delete goal  
  exports.delGoal = async (req, res) => {
    try {
      const goalId = (req.params['id'].replace(':', ''));
      const sql = 'DELETE FROM goals WHERE id = ?';
      await dbQuery(sql, parseInt(goalId, 10));
  
      await dbQuery('DELETE FROM tasks WHERE goal = ?', parseInt(goalId, 10));
      res.redirect('/dashboard');
    } catch (err) {
      console.log(err);
    }
  };
  
//Function to mark task as completed
  exports.taskComplete = async (req, res) => {
    try {
      const sql = 'UPDATE tasks SET completed=? WHERE id = ?';
      const completed = parseInt(req.body.task);
      await dbQuery(sql, [1, completed]);
    } catch (err) {
      console.log(err);
    }
  };
  
//Function to mark task as uncompleted
  exports.taskUncomplete = async (req, res) => {
    try {
      const sql = 'UPDATE tasks SET completed=? WHERE id = ?';
      const completed = parseInt(req.body.task);
      await dbQuery(sql, [0, completed]);
    } catch (err) {
      console.log(err);
    }
  };
  
