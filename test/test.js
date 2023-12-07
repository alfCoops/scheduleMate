const assert=require('assert');


//----------Unit test 1 - function
function parseDateWithoutTimezone(dateString) {
    const date = new Date(dateString);
    const localOffset = date.getTimezoneOffset() * 60 * 1000;
    const localDate = new Date(date.getTime() - localOffset);
    return localDate.toISOString();
}

//----------Unit test 1 - test
describe('parseDateWithoutTimezone', () => {
    it('should parse a date string without timezone iformation and return an ISO string with local timezone offset', () => {
      const dateString = '2023-04-04T23:00:00.000Z';
      const expectedOutput = '2023-04-05T00:00:00.000Z'; 
  
      const result = parseDateWithoutTimezone(dateString);
  
      assert.strictEqual(result, expectedOutput);
    });
  });

//----------Unit test 2 - function
  function checkPriorityTimeSpent(goals) {
    messages=[]
    let error = null;
    goals.forEach((goal1) => {
        goals.forEach((goal2) => {
          if (parseInt(goal1.priority) < parseInt(goal2.priority) && goal1.timeSpent < goal2.timeSpent) {
            error = `More time spent on lower priority goal '${goal2.name}' than on higher priority goal '${goal1.name}'`;
            messages.push(error);
          }
        });
      });

    return messages;
  }

//----------Unit test 2 - test
describe('checkPriorityTimeSpent', () => {
    it('should return an error message if more time is spent on a lower priority goal than on a higher priority goal', () => {
      const goals = [      { name: 'Goal A', priority: '4', timeSpent: 10 },      { name: 'Goal B', priority: '3', timeSpent: 5 },      
      { name: 'Goal C', priority: '2', timeSpent: 12 },      { name: 'Goal D', priority: '1', timeSpent: 13 }    ];
      const expectedOutput = ["More time spent on lower priority goal 'Goal A' than on higher priority goal 'Goal B'"];
  
      const result = checkPriorityTimeSpent(goals);
  
      assert.deepStrictEqual(result, expectedOutput);
    });
  
    it('should return an empty array if no errors are found', () => {
      const goals = [      { name: 'Goal A', priority: '4', timeSpent: 10 },      { name: 'Goal B', priority: '3', timeSpent: 15 },      
      { name: 'Goal C', priority: '2', timeSpent: 20 },      { name: 'Goal D', priority: '1', timeSpent: 25 }    ];
      const expectedOutput = [];
  
      const result = checkPriorityTimeSpent(goals);
  
      assert.deepStrictEqual(result, expectedOutput);
    });
  });

//-------Unit test 3 - function
function timeOnEachGoal(goals,tasks,taskSession){
    // First, create an object to store the time spent on each goal
    const timeSpentPerGoal = {};
  
    // Iterate through the taskSession array to calculate the time spent on each task session
    taskSession.forEach(session => {
        const task = tasks.find(t => t.id === session.task);
        const goal = goals.find(g => g.id === task.goal);
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


  //Unit test 3 - test
  describe('timeOnEachGoal', () => {
    it('should calculate the time spent on each goal based on task sessions', () => {
      const goals = [
        { id: 1, name: 'Goal A' },
        { id: 2, name: 'Goal B' },
        { id: 3, name: 'Goal C' }
      ];
      const tasks = [
        { id: 1, name: 'Task 1', goal: 1 },
        { id: 2, name: 'Task 2', goal: 2 },
        { id: 3, name: 'Task 3', goal: 3 }
      ];
      const taskSession = [
        { task: 1, start: '01:00:00', end: '01:30:00' },
        { task: 2, start: '02:00:00', end: '03:00:00' },
        { task: 3, start: '03:30:00', end: '04:30:00' },
        { task: 1, start: '05:00:00', end: '06:00:00' },
        { task: 2, start: '06:30:00', end: '07:00:00' }
      ];
      const expectedOutput = [
        { id: 1, name: 'Goal A', timeSpent: 90 },
        { id: 2, name: 'Goal B', timeSpent: 90 },
        { id: 3, name: 'Goal C', timeSpent: 60 }
      ];
  
      const result = timeOnEachGoal(goals, tasks, taskSession);
  
      assert.deepStrictEqual(result, expectedOutput);
    });
  
    it('should return an empty array if no task sessions are provided', () => {
      const goals = [
        { id: 1, name: 'Goal A' },
        { id: 2, name: 'Goal B' },
        { id: 3, name: 'Goal C' }
      ];
      const tasks = [
        { id: 1, name: 'Task 1', goal: 1 },
        { id: 2, name: 'Task 2', goal: 2 },
        { id: 3, name: 'Task 3', goal: 3 }
      ];
      const taskSession = [];
      const expectedOutput = [
        { id: 1, name: 'Goal A', timeSpent: 0 },
        { id: 2, name: 'Goal B', timeSpent: 0 },
        { id: 3, name: 'Goal C', timeSpent: 0 }
      ];
  
      const result = timeOnEachGoal(goals, tasks, taskSession);
  
      assert.deepStrictEqual(result, expectedOutput);
    });
  });

  //-----Unit test 4 - Function
  function checkExcessiveTimeSpent(subjects, multiple) {
    const sortedSubjects = subjects.slice().sort((a, b) => b.accHours - a.accHours);
    const difference = sortedSubjects[0].accHours - sortedSubjects[sortedSubjects.length - 1].accHours;
    
    if (sortedSubjects[0].accHours >= sortedSubjects[sortedSubjects.length - 1].accHours * multiple) {
      const message = `You are spending ${difference} additional hours on ${sortedSubjects[0].name} compared to ${sortedSubjects[sortedSubjects.length - 1].name}. Consider reallocating your time to other subjects.`;
      return [message];
    } else {
      return [];
    }
  }

  //-----Unit test 4 - Test

  describe('checkExcessiveTimeSpent', () => {
    it('should return an error message for the largest difference in hours', () => {
      const subjects = [
        { id: 1, name: 'Math', accHours: 20 },
        { id: 2, name: 'English', accHours: 16 },
        { id: 3, name: 'History', accHours: 8 },
        { id: 4, name: 'Science', accHours: 6 },
      ];
      const multiple = 1.5;
      const expectedOutput = [
        'You are spending 14 additional hours on Math compared to Science. Consider reallocating your time to other subjects.',
      ];
  
      const result = checkExcessiveTimeSpent(subjects, multiple);
  
      assert.deepStrictEqual(result, expectedOutput);
    });
  
    it('should return an empty array if there are no errors', () => {
      const subjects = [
        { id: 1, name: 'Math', accHours: 10 },
        { id: 2, name: 'English', accHours: 8 },
        { id: 3, name: 'History', accHours: 6 },
        { id: 4, name: 'Science', accHours: 6 },
      ];
      const multiple = 2;
      const expectedOutput = [];
  
      const result = checkExcessiveTimeSpent(subjects, multiple);
  
      assert.deepStrictEqual(result, expectedOutput);
    });
  });

  //------Unit test 5 - function
  function eventTime(events){
    // get the start and end of the current week
    const currentDate = new Date(); // use the current date
    const startOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() + 1); // set the start to the previous Monday
    const endOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() + 7); // set the end to the following Sunday

    // filter the events that fall within the current week and have a subject property
    const eventsWithSubjectInCurrentWeek = events.filter(event => {
    const eventDate = new Date(event.start);
    return event.subject !== '' && eventDate >= startOfWeek && eventDate <= endOfWeek;
    });console.log(eventsWithSubjectInCurrentWeek)

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

//-------Unit test 5 - test
describe('eventTime', () => {
    it('should return an object with time spent by subject in current week', () => {
        const events = [
          {
            id: 43,
            title: 'CS123',
            start: '2023-04-21T12:00:00',
            end: '2023-04-21T14:00:00',
            type: 'event',
            eventType: 'seminar',
            location: 'hall',
            subject: 17,
            color: '#dcf971',
            rrule: null
          },
          {
            id: 44,
            title: 'CS124',
            start: '2023-04-21T09:00:00',
            end: '2023-04-21T11:00:00',
            type: 'event',
            eventType: 'lecture',
            location: 'classroom',
            subject: 16,
            color: '#f00505',
            rrule: null
          },
          {
            id: 45,
            title: 'MA123',
            start: '2023-04-21T14:00:00',
            end: '2023-04-21T16:00:00',
            type: 'event',
            eventType: 'tutorial',
            location: 'lab',
            subject: 19,
            color: '#4153af',
            rrule: null
          }
        ];
        const expectedOutput = {
          16: 2,
          17: 2,
          19: 2
        };
    
        const result = eventTime(events);
    
        assert.deepStrictEqual(result, expectedOutput);
      });
  
    it('should return an empty object if no events fall within the current week or have no subject', () => {
      const events = [
        { start: '2023-04-27T15:00:00Z', end: '2023-03-27T16:30:00Z', subject: 'Math' },
        { start: '2023-04-02T17:00:00Z', end: '2023-04-02T18:00:00Z', subject: 'English' },
        { start: '2023-04-04T12:00:00Z', end: '2023-04-04T14:00:00Z', subject: '' },
      ];
      const expectedOutput = {};
  
      const result = eventTime(events);
  
      assert.deepStrictEqual(result, expectedOutput);
    });
  });

//----Unit test 5 - function
function goalTime(tasks, taskSessions, goals) {
  // Get the start and end dates for the current week
  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 6);

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

  const timeSpentBySubject = Object.keys(tasksBySubject).reduce((result, subject) => {
      const tasks = tasksBySubject[subject];
      const sessions = taskSessions.filter(session => {
          const sessionDate = new Date(session.start);
          return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
      }).filter(session => tasks.some(task => task.id === session.taskId));
      
      const durationInMs = sessions.reduce((totalDuration, session) => {
          const startMs = new Date(session.start).getTime();
          const endMs = new Date(session.end).getTime();
          return totalDuration + (endMs - startMs);
      }, 0);
      
      const durationInHours = durationInMs / (1000 * 60 * 60);
      result[subject] = durationInHours;
      return result;
  }, {});

  return timeSpentBySubject;
}
      
//----Unit test - test
describe('goalTime', () => {
    it('should return an object with the time spent on each subject for the current week', () => {
      const tasks = [
        {
          id: 87,
          goal: 93,
          name: 'Finish essay',
          completed: 1
        },
    {
          id: 88,
          goal: 93,
          name: 'Watch lecture 2',
          completed: 0
        },
       {
          id: 95,
          goal: 95,
          name: 'Watch Lectur 3',
          completed: 0
        },
        RowDataPacket {
          id: 96,
          goal: 95,
          name: 'Watch lecture 4',
          completed: 0
        }
      ];
      const taskSession = [
        { task: 1, date: '2023-04-21', start: '08:00:00', end: '10:00:00' },
        { task: 2, date: '2023-04-21', start: '10:00:00', end: '12:00:00' },
        { task: 3, date: '2023-04-21', start: '14:00:00', end: '16:00:00' },
        { task: 4, date: '2023-04-21', start: '08:00:00', end: '10:00:00' },
        { task: 5, date: '2023-04-21', start: '10:00:00', end: '12:00:00' },
        { task: 6, date: '2023-04-21', start: '12:00:00', end: '14:00:00' },
      ];
      const goals = [
        { id: 1, subject: 17 },
        { id: 2, subject: 20 },
        { id: 3, subject: 16 },
        { id: 4, subject: 20 },
      ];
  
      const result = goalTime(tasks, taskSession, goals);
  
      assert.deepStrictEqual(result, {
        17: 4,
        20: 4,
        16: 4
      });
    });
  });         
          
      
    

  