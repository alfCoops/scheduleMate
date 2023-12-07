window.onload=function(){
    const todoList = [];
    // Create a new XMLHttpRequest object
let xhr = new XMLHttpRequest();

// Select the unordered list element with the ID "myUL"
const todoListElement = document.querySelector("#myUL");

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

        // Update the displayed todos
        displayTodos();
    }
}

// Add an event listener for form submission
document.querySelector('#newGoalForm').addEventListener('submit', function (event) {
    event.preventDefault(); // prevent default form submission behavior
    var form = document.querySelector('#newGoalForm');
    let formData = new FormData(form);
    let formObject = Object.fromEntries(formData.entries());

    // Sending data to the backend
    xhr.open('POST', '/createGoal');
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8", true);
    dataObj = { data: todoList, form: formObject };
    xhr.send(JSON.stringify(dataObj));

    // Open dashboard
    xhr.onload = function () {
        // Redirect to the event page
        window.location.href = '/dashboard';
    };
});

// Function to delete a todo item
function deleteItem(x, delId) {
    // Remove the item from the todoList array
    todoList.splice(
        todoList.findIndex((item) => item.id == delId),
        1
    );

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
            const delId = e.target.getAttribute("data-id");

            // Call the deleteItem function to delete the item and update the displayed todos
            deleteItem(delId);
        });

        // Append the list element and the delete button to the todoListElement
        todoListElement.appendChild(listElement);
        listElement.appendChild(delBtn);
    });
}

}