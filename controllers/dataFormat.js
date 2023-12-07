// Main function to generate messages
function generateMessages(goals, updatedSubjects, taskSessions, tasks) {
  let messages = [];
  // Calculate goals past their deadline
  let goalsPastDeadline = calculateDaysToGoalDeadline(goals);
  // Create a message for missed deadlines
  if (goalsPastDeadline.length > 0) {
    messages.push(createMissedDeadlineMessage(goalsPastDeadline));
  }
  // Check for excessive time spent on subjects
  messages.push(checkExcessiveTimeSpent(updatedSubjects, 1.5));
  // Calculate time spent on each goal
  let newGoalArray = timeOnEachGoal(goals, tasks, taskSessions);
  // Check if the time spent on goals aligns with their priority
  let priorityErrors = checkPriorityTimeSpent(newGoalArray);
  messages.push(...priorityErrors);
  return messages;
}

// Update subjects with accumulated time based on events, taskSessions, tasks, and goals
function updateSubjectsWithAccumulatedTime(subjects, events, taskSessions, tasks, goals) {
  let eTime = eventTime(events); // Calculate time spent on events
  let gTime = goalTime(tasks, taskSessions, goals); // Calculate time spent on goals
  console.log(tasks,taskSessions, goals)
  // Combine the time spent on events and goals
  let combinedTime = [];

  let allSubjects = new Set([...Object.keys(eTime), ...Object.keys(gTime)]);
  for (const subject of allSubjects) {
    let subjectTime = (eTime[subject] || 0) + (gTime[subject] || 0);
    if (subjectTime > 0) {
      combinedTime.push({ [subject]: subjectTime });
    }
  }// Assign the combined time to the subjects
  const timeDataObj = Object.assign({}, ...combinedTime);
  return subjects.map(subject => {
    const id = subject.id;
    const accHours = timeDataObj.hasOwnProperty(id) ? timeDataObj[id] : null;
    return { ...subject, accHours };
  });
}
  
  
// Formats task sessions data for use in a calendar
function formatTaskSessionsForCalendar(taskSessions, tasks, goals, subjects) {
  return taskSessions.map(obj => {
    const task = tasks.find(t => t.id === obj.task);
    const goal = goals.find(g => g.id === task.goal);
    const subject = subjects.find(sub => sub.id === goal.subject);

    // Parse date without timezone
    var date = parseDateWithoutTimezone(obj.date);

    return {
      id: obj.id,
      taskId: task.id,
      title: task.name,
      start: date.split('T')[0] + 'T' + obj.start,
      end: date.split('T')[0] + 'T' + obj.end,
      type: 'taskSession',
      rrule: null,
      color: subject.colour
    };
  });
}
  
// Creates a message for missed goal deadlines
function createMissedDeadlineMessage(goalsPastDeadline) {
    var message = 'You have missed the deadline for ';
    for (var i = 0; i < goalsPastDeadline.length; i++) {
      message += goalsPastDeadline[i].name + (i < goalsPastDeadline.length - 1 ? ', ' : '.');
    }
    message += ' Use the search barto find the tasks associated with these goals and reschedule them to catch up.';
      return message;
    }


  
  // Merges event data with subject data based on the subject id
  function mergeEventDataWithSubjectData(events, subjects) {

    return events.map((event) => {
      const subjectObj = subjects.find((subject) => subject.id === event.subject);
      return { ...event, ...subjectObj, id: event.id };
    });
  }
  
// Formats merged event data into the format required by a calendar
function formatEventDataForCalendar(mergedArray) {
  return mergedArray.map((obj) => {
    const date = parseDateWithoutTimezone(obj.date);
    
    const eventObj = {
      id: obj.id,
      title: obj.name,
      start: date.split("T")[0] + "T" + obj.start,
      end: date.split("T")[0] + "T" + obj.end,
      type: "event",
      eventType: obj.type,
      location: obj.location,
      subject: obj.subject,
      color: obj.colour,
    };


    if (obj.repeatdays) {
      eventObj.rrule = {
        freq: "weekly",
        byweekday: obj.repeatdays.split(",").map(Number),
        dtstart: date.split("T")[0] + "T" + obj.start,
        until: obj.repeatuntil,
      };
    } else {
      eventObj.rrule = null;
    }

    return eventObj;
  });
}

// Calculates the number of days left until the deadline for each goal
function calculateDaysToGoalDeadline(goals) {
  const dateNow = new Date();
  const daysToDeadline = [];
  

  for (let i = 0; i < goals.length; i++) {
    const dateGoal = new Date(goals[i].dueDate);
    const daysLeft = Math.floor((dateGoal - dateNow) / (1000 * 60 * 60 * 24)) + 1;
    if (daysLeft < 1) {
      daysToDeadline.push(goals[i]);
    } 
  }

  return daysToDeadline;
}
  
  
// Parses a date string without a timezone and converts it to ISO format
function parseDateWithoutTimezone(dateString) {
    const date = new Date(dateString);
    const localOffset = date.getTimezoneOffset() * 60 * 1000;
    const localDate = new Date(date.getTime() - localOffset);
    return localDate.toISOString();
}

// Checks if more time is spent on lower priority goals compared to higher priority goals
function checkPriorityTimeSpent(goals) {
    let errors = [];
    goals.forEach((goal1) => {
        goals.forEach((goal2) => {
          if (parseInt(goal1.priority) < parseInt(goal2.priority) && goal1.timeSpent < goal2.timeSpent) {
            errors.push(`More time spent on lower priority goal '${goal2.name}'  than on higher priority goal '${goal1.name}`);
          }
        });
      });

    return errors;
  }

  // Calculates the time spent on each goal based on the time spent on each task session
  function timeOnEachGoal(goals,tasks,taskSession){
    // First, create an object to store the time spent on each goal
    const timeSpentPerGoal = {};
  
    // Iterate through the taskSession array to calculate the time spent on each task session
    taskSession.forEach(session => {
        const task = tasks.find(t => t.id == session.taskId);
        const goal = goals.find(g => g.id == task.goal);
        const timeDiffMs = Date.parse(`1970-01-01T${session.end}Z`) - Date.parse(`1970-01-01T${session.start}Z`);
        const timeDiffMin = timeDiffMs / (1000 * 60);
        
        if (!timeSpentPerGoal[goal.id]) {
            timeSpentPerGoal[goal.id] = 0;
        }
      
        timeSpentPerGoal[goal.id] += timeDiffMin;
        });
  
        // Create a new array of goals with the extra timeSpent field
        const goalsWithTimeSpent = goals.map(goal => {
        const goalTime = Object.entries(timeSpentPerGoal)
            .filter(([goalId]) => goalId === goal.id.toString())
            .reduce((total, [, time]) => total + time, 0);
            
        return {
            ...goal,
            timeSpent: goalTime
        };
        });
  
        return goalsWithTimeSpent;
  
  }
  
  //functions to calculate if one subject is being prioritized
  function checkExcessiveTimeSpent(subjects, multiple) {
      const sortedSubjects = subjects.slice().sort((a, b) => b.accHours - a.accHours);
       const difference = sortedSubjects[0].accHours - sortedSubjects[sortedSubjects.length - 1].accHours;
        
    
        if (sortedSubjects[0].accHours >= sortedSubjects[sortedSubjects.length - 1].accHours * multiple) {
          var message =  `You are spending ${difference} additional hours on ${sortedSubjects[0].name} compared to ${sortedSubjects[sortedSubjects.length - 1].name}. Consider reallocating your time to other subjects.`;
          return message;
        }
  }  
  
  
  //Function to get the time spent on each event per subject
  function eventTime(events){
      // get the start and end of the current week
      const currentDate = new Date(); // use the current date
      const startOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() + 1); // set the start to the previous Monday
      const endOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() + 7); // set the end to the following Sunday
  
      // filter the events that fall within the current week and have a subject property
      const eventsWithSubjectInCurrentWeek = events.filter(event => {
      const eventDate = new Date(event.start);
      return event.subject !== '' && eventDate >= startOfWeek && eventDate <= endOfWeek;
      });
  
      // group the events by subject and sum the duration of each group
      const timeSpentBySubjectInCurrentWeek = eventsWithSubjectInCurrentWeek.reduce((result, event) => {
      const {subject, start, end} = event;
      const durationInMs = new Date(end) - new Date(start); // calculate duration in milliseconds
      const durationInHours = durationInMs / (1000 * 60 * 60); // convert to hours
      if (result[subject]) {
          result[subject] += durationInHours;
      } else {
          result[subject] = durationInHours;
      }
      return result;
      }, {});
  
      return timeSpentBySubjectInCurrentWeek;
  }
  
  //function to get the time spent on each goal for each subject
  function goalTime(tasks, taskSessions, goals) {
    // Get the start and end dates for the current week
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 6);
    // Group tasks by their subject using the goal information
    const tasksBySubject = tasks.reduce((result, task) => {
        const goal = goals.find(goal => goal.id === task.goal);
        const subject = goal ? goal.subject : null;
        if (subject) {
            if (result[subject]) {
                result[subject].push(task);
            } else {
                result[subject] = [task];
            }
        }
        return result;
    }, {});
    // Calculate the time spent on each subject
    const timeSpentBySubject = Object.keys(tasksBySubject).reduce((result, subject) => {
        const tasks = tasksBySubject[subject];
        const sessions = taskSessions.filter(session => {
            const sessionDate = new Date(session.start);
            return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
        }).filter(session => tasks.some(task => task.id === session.taskId));
        // Calculate the total duration of the sessions in milliseconds
        const durationInMs = sessions.reduce((totalDuration, session) => {
            const startMs = new Date(session.start).getTime();
            const endMs = new Date(session.end).getTime();
            return totalDuration + (endMs - startMs);
        }, 0);
        // Convert the duration to hours
        const durationInHours = durationInMs / (1000 * 60 * 60);
        result[subject] = durationInHours;
        return result;
    }, {});

    return timeSpentBySubject;
}

function formatEventData(data){
  const daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
  const daysOfWeekForm = ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'];
  var repeatDays=[];
  var date = data.date;
  var start;
  var end;
  if(data.allDayEvent === 'on'){
      allDayEvent=true;
      start, end = null;
  }else{
      allDayEvent=false;
      start = data.startTime;
      end = data.endTime;
  }
  var subject = data.eventSubject;
  var type = data.eventType;
  var location = data.location;
  var reminder;
  var repeatUntil;
  if(data.reminderCheck === 'on'){
      reminder=data.reminderTime;
  }else{
      reminder=null;
  }
  if(data.repeatCheckbox==='on'){
      for(var i=0; i<daysOfWeek.length; i++){
          if(data.hasOwnProperty(daysOfWeekForm[i])){
              repeatDays.push(daysOfWeek[i]);
          }
      }
      repeatDays = repeatDays.join(',');
      repeatUntil = data.repeatUntilDate;
  }else{
      repeatDays=null;
  }
  dbInsert=[date,subject,type,location, start, end,repeatDays,repeatUntil];
  return dbInsert;
}


  module.exports = {
    generateMessages,
    updateSubjectsWithAccumulatedTime,
    formatTaskSessionsForCalendar,
    createMissedDeadlineMessage,
    mergeEventDataWithSubjectData,
    formatEventDataForCalendar,
    calculateDaysToGoalDeadline,
    parseDateWithoutTimezone,
    checkPriorityTimeSpent,
    timeOnEachGoal,
    checkExcessiveTimeSpent,
    eventTime,
    goalTime,
    formatEventData
  };
  