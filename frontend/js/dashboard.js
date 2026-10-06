
const welcomeMessage = document.getElementById("welcomeMessage");

welcomeMessage.textContent =
    "Welcome to StudyTrack! Let's make today productive.";


// Get the task elements from HTML
const taskInput = document.getElementById("taskInput");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");


// Handle the Add Task button
addTaskButton.addEventListener("click", function() {

    const task = taskInput.value.trim();

    if (task === "") {
        alert("Please enter a task.");
        return;
    }

    // Remove the default message when adding the first task
    if (taskList.children.length === 1 &&
        taskList.children[0].textContent === "No tasks yet.") {
        taskList.innerHTML = "";
    }

    // Create a new list item
    const li = document.createElement("li");
    
const checkbox = document.createElement("input");
checkbox.type = "checkbox";

const taskText = document.createElement("span");
taskText.textContent = task;

li.appendChild(checkbox);
li.appendChild(taskText);

checkbox.addEventListener("change", function() {
    let completed = taskList.querySelectorAll(
        'input[type="checkbox"]:checked'
    ).length;

    let total = taskList.querySelectorAll(
        'input[type="checkbox"]'
    ).length;

    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = total - completed;
});


    // Add the task to the list
    taskList.appendChild(li);
    document.getElementById("totalTasks").textContent =
    taskList.querySelectorAll("li").length;

document.getElementById("pendingTasks").textContent =
    taskList.querySelectorAll("li").length;

    // Clear the input field
    taskInput.value = "";
});
