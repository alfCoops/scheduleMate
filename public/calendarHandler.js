var start,end,taskId;

function displayForm(submitButtonHandler) {
    const popup = document.getElementById("popup");
    const submitButton = document.getElementById("submit-button");
    submitButton.addEventListener("click", submitButtonHandler);
    popup.style.display = "block";
  }
  
  function hideForm(submitButtonHandler) {
    const submitButton = document.getElementById("submit-button");
    const popup = document.getElementById("popup");
    submitButton.removeEventListener("click", submitButtonHandler);
    popup.style.display = "none";
  }
  
  export function handleSelect(info, calendar, tasksArr, goalArr, subArr) {
    const start = moment(info.startStr).toDate();
    const end = moment(info.endStr).toDate();
  
    const submitButtonHandler = (e) => {
      e.preventDefault();
      submitButtonHandlerImpl(e, start, end, calendar, tasksArr, goalArr, subArr);
    };
  
    displayForm(submitButtonHandler);
  }
  
  function submitButtonHandlerImpl(e, start, end, calendar, tasksArr, goalArr, subArr) {
    // Get the selected goal and task IDs
    taskId = taskSelect.value;
    goalId = goalSelect.value
    // Find the goal and task objects by ID
    let task = tasksArr.find(t => t.id == taskId);
    if (task == null) {
      console.error(`Task with ID ${taskId} not found`);
      return;
    }
    const goal = goalArr.find(g => g.id === task.goal); // find the goal object that corresponds to the task's goal
    const taskDueDate = new Date(goal.dueDate);
    const sessionStart = new Date(start);
    var subject = subArr.find(sub => sub.id === goal.subject);
    if (subject) {
      goal.subjectColor = subject.colour;
    } else {
      console.error(`Subject ${goal.subject} not found`);
    }
    if(sessionStart>taskDueDate){
      alert('The session start date is later than the task due date!');
    }else{
    // Create the event data 
    let eventData = {
      taskId: task.id,
      title: task.name,
      start: start,
      end: end,
      subject:goal.subject,
      type: "session",
      color:subject.colour
    };

    // Hide the form
    submitButton.removeEventListener("click", submitButtonHandler);
    popup.style.display = "none";
    taskSelect.value = "";
    addTaskSession(eventData);
  }
  calendar.unselect();
    hideForm(submitButtonHandlerImpl);
  }
  
  export function handleEventClick(info, subArr) {
    if(info.event.extendedProps.type == "event"){
        xhr.open('POST','/editEvent/getId');
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8", true);
        xhr.onload = function() {
        //Redirect to event page
        window.location.href = '/editevent';
        };
        xhr.send(JSON.stringify(info));
    }else{
        xhr.open('POST','/editSession');
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8", true);
        xhr.send(JSON.stringify(info));
        xhr.onload = function() {
            //Redirect to event page
            window.location.href = '/editSession';
        };
    }
  }
  
  export function createEventContent(info, tasksArr, goalArr, subArr) {
        const eventContentEl = document.createElement('div');
        // Create a span element for the subject text and add it to the eventContentEl element
        var subjectEl = document.createElement('span');
        // Check if the event is a task session or an event
        if (info.event.extendedProps.type === "event") {
          var event =info.event.extendedProps;
          var subject = subArr.find(sub =>sub.id === event.subject)
          subjectEl.innerText = subject.name;
          eventContentEl.appendChild(subjectEl);
          var eventTypeEl = document.createElement('div');
          eventTypeEl.innerText = event.eventType;
          eventContentEl.appendChild(eventTypeEl);
      
          var locationEl = document.createElement('div');
          locationEl.innerText = info.event.extendedProps.location;
          eventContentEl.appendChild(locationEl);
          
        } else {
          let task = tasksArr.find(t => t.id  == info.event.extendedProps.taskId);//finding task
          if (task == null) {
            console.error(`Task with ID ${info.event.id} not found`);
            return;
          }
          const goal = goalArr.find(g => g.id === task.goal);
          const sub = subArr.find(s => s.id === goal.subject);
          //Display event data
          subjectEl.innerText =  sub.name;
          eventContentEl.appendChild(subjectEl);
          var taskNameEl = document.createElement('div');
          taskNameEl.innerText = task.name;
          eventContentEl.appendChild(taskNameEl);
        }
        var editIconEl = document.createElement("div");
        editIconEl.innerHTML = '<i class="fa-sharp fa-solid fa-pen fa-xs"></i>';
        editIconEl.style.position = "absolute";
        editIconEl.style.top = "0";
        editIconEl.style.right = "0";
        editIconEl.style.color = "#ffffffb3";
        eventContentEl.appendChild(editIconEl);
      
        // Style the subjectEl element
        subjectEl.style.fontWeight = "bold";
        subjectEl.style.fontSize = "14px";
    return eventContentEl;
  }

  module.exports = {
    handleSelect,
    handleEventClick,
    createEventContent
  };