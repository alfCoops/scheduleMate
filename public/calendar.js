let xhr = new XMLHttpRequest(); //Variable to send http requests

//----------Code that runs when the web page is loaded
document.addEventListener('DOMContentLoaded', function() {
  var start,end,taskId,goalId;
  var calendarElement = document.getElementById('calendar');//getting calendar html element
  //Defining calendar properties
  var calendar = new FullCalendar.Calendar(calendarElement, {
    locale:'en-gb',
    initialView: 'timeGridWeek',
    selectable:true,
    allDaySlot: false,
    headerToolbar: {
      start: '',
      center: 'title',
      end: 'prev,today,next'
    },
    events:taskSesArr.concat(eventsArr),// Events

    //Function when area on calendar is selected, used for creating task session
    select: function(info) {
      // Parse the start and end times into a Date object
      start = moment(info.startStr).toDate();
      end = moment(info.endStr).toDate();

      // Get the goal and task select elements
      const goalSelect = document.getElementById('goaldropdown');
      const taskSelect = document.getElementById('task-selector');

      // Display the form
      const popup = document.getElementById("popup");
      const submitButton = document.getElementById("submit-button");
      submitButton.addEventListener("click", submitButtonHandler);
      popup.style.display = "block";

      //Function that occurs when submit button is pressed
      function submitButtonHandler() {
        taskId = taskSelect.value;
        goalId = goalSelect.value;
        let task = tasksArr.find(t => t.id == taskId);
        if (task == null) {
          console.error(`Task with ID ${taskId} not found`);
          return;
        }
        const goal = goalArr.find(g => g.id === task.goal); 
        const taskDueDate = new Date(goal.dueDate);
        const sessionStart = new Date(start);
        var subject = subArr.find(sub => sub.id === goal.subject);
        //Add colour to task session
        if (subject) {
          goal.subjectColor = subject.colour;
        } else {
          console.error(`Subject ${goal.subject} not found`);
        }
        //If session is after the due date
        if(sessionStart>taskDueDate){
          alert('The session start date is later than the task due date!');
        }else{
        //Defining the task session
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
        calendar.unselect();//Remove selection
      }
    },

    //Function when an event on the calendar is pressed
    eventClick: function(info) {
      //Check whether the selected event is a task session or event
      //The event data is sent to backend
      if(info.event.extendedProps.type == "event"){
          xhr.open('POST','/editEvent/getId');
          xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8", true);
          xhr.onload = function() {
            window.location.href = '/editevent';
          };
          xhr.send(JSON.stringify(info));
      }else{
          xhr.open('POST','/editSession');
          xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8", true);
          xhr.send(JSON.stringify(info));
          xhr.onload = function() {
              window.location.href = '/editSession';
          };
      }
    },

    //Defines the display of each event
    eventContent: function(info) {
      var eventContentElement = document.createElement('div');
      // Create a span element for the subject text and add it to the eventContentEl element
      var subjectElement = document.createElement('span');
      // Check if the event is a task session or an event
      if (info.event.extendedProps.type === "event") {
        var event =info.event.extendedProps;
        //Add subject to display
        var subject = subArr.find(sub =>sub.id === event.subject)
        subjectElement.innerText = subject.name;
        eventContentElement.appendChild(subjectElement);
        //Add event type to display
        var eventTypeElement = document.createElement('div');
        eventTypeElement.innerText = event.eventType;
        eventContentElement.appendChild(eventTypeElement);
        //Add location to display
        var locationElement = document.createElement('div');
        locationElement.innerText = info.event.extendedProps.location;
        eventContentElement.appendChild(locationElement);
      } else {
          let task = tasksArr.find(t => t.id  == info.event.extendedProps.taskId);//finding task
          if (task == null) {
              console.error(`Task with ID ${info.event.id} not found`);
            return;
          }
        const goal = goalArr.find(g => g.id === task.goal);
        const sub = subArr.find(s => s.id === goal.subject);
        //Display event data
        subjectElement.innerText =  sub.name;
        eventContentElement.appendChild(subjectElement);
        var taskNameElement = document.createElement('div');
        taskNameElement.innerText = task.name;
        eventContentElement.appendChild(taskNameElement);
      }
      //Adding edit icon to display
      var editIconElement = document.createElement("div");
      editIconElement.innerHTML = '<i class="fa-sharp fa-solid fa-pen fa-xs"></i>';
      editIconElement.style.position = "absolute";
      editIconElement.style.top = "0";
      editIconElement.style.right = "0";
      editIconElement.style.color = "#ffffffb3";
      eventContentElement.appendChild(editIconElement);
    
      // Style the subject element element
      subjectElement.style.fontWeight = "bold";
      subjectElement.style.fontSize = "14px";
    
      return { domNodes: [eventContentElement] };
    }
  })

  //Updating notification icon
  var notificationsBtn = document.getElementById("notifications-btn");
  var badge = notificationsBtn.querySelector(".badge");
  // Check if there are messages to display and update the badge and icon accordingly
  if (mesArr[0]!=null) {
    badge.textContent = mesArr.length;
  } else {
    badge.style.display = "none";
  }

  //Function to send task session data to backend
  function addTaskSession(session){
      xhr.open('POST','/addTaskSession');
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8", true);
      xhr.send(JSON.stringify(session));
      xhr.onload = function() {
        //Redirect to event page
        window.location.href = '/dashboard';
    };
  }

    // Get the goal and task select elements
    var goalSelect = document.getElementById('goaldropdown');
    var taskSelect = document.getElementById('task-selector');
  
    // Event listener for the goal select
    goalSelect.addEventListener('change', () => {
      // Clear the task select element
      taskSelect.innerHTML = '';
  
      // Get the selected goal id
      const goalId = goalSelect.value;
      // Filter the tasks array to get only tasks associated with the selected goal
      const goalTasks = tasksArr.filter(task => task.goal== goalId);
      
      // Populate the task select element with options for each task
      goalTasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task.id;
        option.text = task.name;
        taskSelect.add(option);
      });
      const selfStudy=document.createElement('option');
      selfStudy.value = 'selfStudy'
      selfStudy.text = 'Self Study'
      taskSelect.add(selfStudy);
    });
    var progressBar,progressBarContainer;

    //Hours per subject progress bar
    // loop through each subject element
    for (let i = 0; i < subArr.length; i++) {
      // get the progress bar and container elements
      progressBar = document.querySelector(`#progress-bar-${subArr[i].id}`);
      progressBarContainer = document.querySelector(`#progress-bar-container-${subArr[i].id}`);
      var progress;
      // calculate the progress as a percentage
      var requiredHours = subArr[i].hours;
      var scheduledHours = subArr[i].accHours || 0;
      if(requiredHours<= scheduledHours){
        progress =  100;
      }else{
      progress = scheduledHours / requiredHours * 100;
      }
      // set the width of the progress bar
      progressBar.style.width = `${progress}%`;

      // show the progress bar container if there are scheduled hours
      if (scheduledHours > 0) {
        progressBarContainer.style.display = "block";
      } else {
        progressBarContainer.style.display = "none";
      }
    }

    //Task checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(function(checkbox) {
      checkbox.addEventListener('change', function() {
        var taskId=this.value;
        let task = tasksArr.find(t => t.id == taskId);
        var goalId = goalArr.find(g => g.id === task.goal).id;
        var goal = document.getElementById(goalId);
        var checkboxes = goal.querySelectorAll('input[type="checkbox"]');
        var checkedCount = 0;

        // count the number of checkboxes that are checked
        checkboxes.forEach(function(checkbox) {
          if (checkbox.checked) {
            checkedCount++;
          }
        });

        // check if all checkboxes are checked and display the remove button if so
        if (checkedCount === checkboxes.length) {
          var removeButton = goal.querySelector('.remove-button');
          if (!removeButton) {
            removeButton = document.createElement('button');
            removeButton.className = 'remove-button';
            removeButton.innerText = 'X';
            //If checkbox is checked its information is sent to backend
            removeButton.addEventListener('click', function() {
              var url = '/deleteGoal:'+goalId;
              xhr.open('GET',url);
              xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8", true);
              xhr.send();
              xhr.onload = function() {
                window.location.href = url;
            };
            });
            goal.appendChild(removeButton);
          }
        } else {
          var removeButton = goal.querySelector('.remove-button');
          if (removeButton) {
            goal.removeChild(removeButton);
          }
        }
        
        if (this.checked) {
          xhr.open('POST','/checkTask');
          xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8", true);
          xhr.send(JSON.stringify({task:taskId}));
        }else{
          xhr.open('POST','/uncheckTask');
          xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8", true);
          xhr.send(JSON.stringify({task:taskId}));
        }
      })})
    
      //How to add study session video
      const addTaskSessionBtn = document.getElementById('addTaskSessionBtn');
      const videoPopup = document.getElementById('video-popup');
      const closeVideoPopupBtn = document.getElementById('close-video-popup');

      addTaskSessionBtn.addEventListener('click', () => {
        videoPopup.style.display = 'flex';
      });

      closeVideoPopupBtn.addEventListener('click', () => {
        videoPopup.style.display = 'none';
      });
      



      //Display notifiactions
      var notificationsBtn = document.getElementById("notifications-btn");
      var closePopupBtn = document.getElementById("close-popup-btn");
      var notificationsPopup = document.getElementById("notifications-popup");
      var notificationsList = document.getElementById("notifications-list");
    
      var messages = mesArr;

      function showNotifications() {
        notificationsList.innerHTML = "";

        if (messages[0] == null) {
          var noMessagesMessage = document.createElement("li");
          noMessagesMessage.innerText = "You have no notifications! Use the searchbar to help with any time management issues";
          notificationsList.appendChild(noMessagesMessage);
        } else {
          messages.forEach(function (message) {
            var listItem = document.createElement("li");
            listItem.innerText = message;
            notificationsList.appendChild(listItem);
          });
          var searchMsg = document.createElement("li");
            searchMsg.innerText = 'Use the search bar below to help with any time management issues';
            searchMsg.style.listStyle = "none";
            notificationsList.appendChild(searchMsg);
        }
        notificationsPopup.style.display = "flex";
      }
      function closeNotifications() {
        notificationsPopup.style.display = "none";
      }
    
      notificationsBtn.addEventListener("click", showNotifications);
      closePopupBtn.addEventListener("click", closeNotifications);

      //Time management solution
      
      const getSolutionBtn = document.querySelector('#getSolutionBtn');
      
      getSolutionBtn.addEventListener('click', event => {
        event.preventDefault();
        var issueInput = document.querySelector('#issueInp').value;
        fetch('/sendProblem', {
          method: 'POST',
          body: JSON.stringify({ issueInput }),
          headers: { 'Content-Type': 'application/json' }
        })
          .then(response => response.json())
          .then(data => {
            // Update the content of the issueSolution div with the response
        
            const issueSolution = document.querySelector('#IssueSolution');
            const formattedSolution = data.solutionData.replace(/\n/g, '<br>');
            issueSolution.innerHTML = formattedSolution;
          })
          .catch(error => console.error(error));
      });
      
      //changing subject colour
      // Loop through each subject element
      var subjectElements = document.querySelectorAll(".subject-name");
      subjectElements.forEach(function(subjectElement) {
        var subjectId = subjectElement.getAttribute("data-id");
        var subjectData = subArr.find(function(subject) {
          return subject.id == subjectId;
        });
        if(subjectData.colour==""){
          subjectElement.style.setProperty("--subject-color", '#358ad9');
        }else{
          subjectElement.style.setProperty("--subject-color", subjectData.colour);
        }
      });

      //Goal colour
      var goalElements = document.querySelectorAll(".goal");
      goalElements.forEach(function(goalElement) {
        var goalId = goalElement.getAttribute("id");
        const goal = goalArr.find(g => g.id == goalId);
        var subjectData = subArr.find(function(subject) {
          return subject.id == goal.subject;
        });
        
        if(subjectData.colour==""){
          goalElement.style.setProperty("--goalSubject-color", '#358ad9');
        }else{
          goalElement.style.setProperty("--goalSubject-color", subjectData.colour);
        }
      });
      
      
    calendar.render();
  });


  
