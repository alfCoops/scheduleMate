//Execute script when window is loaded
window.onload=function(){
    const todoList=[];
    // Create a new XMLHttpRequest object
let xhr = new XMLHttpRequest();

// Select the unordered list element with the ID "myUL"
const todoListElement = document.querySelector("#myUL");

// Iterate through the taskList array and create task objects
for (var i = 0; i < taskList.length; i++) {
    const taskObject = {
        id: taskList[i].id,
        todoText: taskList[i].name,
    };
    // Add the task object to the beginning of the todoList array
    todoList.unshift(taskObject);
}

// Send the initial todo list to the server
xhr.open('POST', '/initialiseTask');
xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
xhr.send(JSON.stringify(todoList));

// Display the current todos on the page
displayTodos();

// Add an event listener for the "addTask" button
document.querySelector("#addTask").addEventListener("click", addTodo);

// Function to add a new todo item
function addTodo() {
    // Get the input value from the "taskInput" element
    const todoText = document.querySelector("#taskInput").value;

    // Check if the input is empty
    if (todoText == "") {
        alert("You did not enter any item");
    } else {
        const todoObject = {
            id: todoList.length,
            todoText: todoText,
        };

        // Add the new todo object to the beginning of the todoList array
        todoList.unshift(todoObject);

        // Send the new todo item to the server
        xhr.open('POST', '/createGoal/addTask');
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8", true);
        xhr.send(JSON.stringify(todoObject));

        // Update the displayed todos
        displayTodos();
    }
}

// Function to delete a todo item
function deleteItem(x, delId) {
    // Remove the item from the todoList array
    todoList.splice(
        todoList.findIndex((item) => item.id == delId),
        1
    );

    // Create an object to send the deleted task's ID
    const delTask = {
        taskId: x
    };

    // Send the deleted task's ID to the server
    xhr.open('POST', '/createGoal/delTask');
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8", true);
    xhr.send(JSON.stringify(delTask));

    // Update the displayed todos
    displayTodos();
}

// Function to display the todo items on the page
function displayTodos() {
    // Clear the todo list element's inner HTML
    todoListElement.innerHTML = "";

    // Clear the "taskInput" element's value
    document.querySelector("#taskInput").value = "";

    // Iterate through the todoList array and create list elements for each item
    todoList.forEach((item) => {
        const listElement = document.createElement("li");
        const delBtn = document.createElement("i");
        listElement.innerHTML = item.todoText;
        listElement.setAttribute("data-id", item.id);

        // Create a delete button for each list item
        delBtn.innerHTML = ("  <i class='fa-solid fa-trash fa-xs'></i>");
        delBtn.setAttribute("data-id", item.id);
        delBtn.addEventListener("click", function (e) {
                          // Get the ID of the item to be deleted
            const delId = e.target.parentElement.getAttribute("data-id");

            // Find the task object in the taskList array with the same ID
            const task = taskList.find(t => t.id == delId);

            // Call the deleteItem function to delete the item and update the displayed todos
            deleteItem(task.name, delId);
        });

        // Append the list element and the delete button to the todoListElement
        todoListElement.appendChild(listElement);
        listElement.appendChild(delBtn);
    });
    }
}