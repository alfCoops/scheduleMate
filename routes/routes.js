//Importing controllers
const express = require("express");
let router = express.Router();
const controller = require('../controllers/controller.js')
const eventController = require('../controllers/eventController.js')
const goalController = require('../controllers/goalController.js')
const accountController = require('../controllers/accountController.js')
const subjectController = require('../controllers/subjectController.js')
const taskSessionController = require('../controllers/taskSessionController.js')

//Route to get landing page
router.get('/landingPage', controller.loadLandingPage);

//Route to get dashboard
router.get('/dashboard', controller.loadDashboard);

//Routes for authentication
router.post('/register', accountController.createAccount);
router.post('/login', accountController.login);
router.get('/logout', accountController.logout);

//Routes for event handling
router.get('/createEvent', eventController.loadCreateEvent);
router.post('/createEvent', eventController.insertEvent);
router.post('/editEvent/getId', eventController.setEventId);
router.post('/editEvent/insert', eventController.insertEditEvent);
router.get('/editEvent', eventController.editEvent);
router.get('/delEventCon:id', eventController.delEventCon);
router.post('/delEvent:id', eventController.deleteEvent);

//Routes for goal handling
router.get('/createGoal', goalController.loadCreateGoal);
router.post('/createGoal/addTask', goalController.addTask);
router.post('/createGoal/delTask', goalController.deleteTask);
router.post('/createGoal', goalController.insertGoal);
router.get('/editGoal:id', goalController.openEditGoal)
router.post('/editGoal:id', goalController.insertEditGoal)
router.post('/initialiseTask', goalController.initialiseTaskArray)
router.get('/deleteGoal:id', goalController.delGoalCon);
router.post('/delGoal:id', goalController.delGoal);

//Routes for task session handling
router.post('/addTaskSession',taskSessionController.addTaskSession);
router.post('/editSession', taskSessionController.editTaskSession);
router.get('/editSession', taskSessionController.openEditSession);
router.post('/editSession/insert',taskSessionController.editSession);
router.get('/delSession:id',taskSessionController.delTaskSession);

//Routes for subject handling
router.get('/getSubject', subjectController.getSubject)
router.get('/editSubject:id', subjectController.openEditSub)
router.post('/editSubject:id', subjectController.editSubject)
router.get('/deleteSubject:id', subjectController.openDeleteSubject);
router.post('/deleteSubject:id', subjectController.deleteSubject);
router.post('/addSubject', subjectController.addSubject);

//Routes for task handling
router.post('/checkTask', goalController.taskComplete);
router.post('/uncheckTask', goalController.taskUncomplete)

//Routes for time management issue handling
router.get('/getReview',controller.getSolutionPage);
router.post('/sendProblem',controller.showSolution)
  
module.exports=router;