
document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8080/api/tasks";

    const taskList = document.getElementById("taskList");
    const taskInput = document.getElementById("taskInput");
    const dueDateInput = document.getElementById("dueDateInput");
    const priorityInput = document.getElementById("priorityInput");
    const folderInput = document.getElementById("folderInput");
    const addTaskButton = document.getElementById("addTaskButton");
    const searchInput = document.getElementById("searchTaskInput");
    const statusFilter = document.getElementById("taskStatusFilter");
    const folderFilter = document.getElementById("folderFilter");
    const folderList = document.getElementById("folderList");
    const createFolderForm = document.getElementById("createFolderForm");
    const folderNameInput = document.getElementById("folderNameInput");
    const taskSectionTitle = document.getElementById("taskSectionTitle");

    let tasks = [];
    let selectedDueDate = "";

    
let currentUserId =
    localStorage.getItem("userId") ||
    sessionStorage.getItem("userId");

const currentUserName =
    (
        sessionStorage.getItem("userName") ||
        localStorage.getItem("userName") ||
        ""
    ).trim();

const formattedUserName = currentUserName
    ? currentUserName.charAt(0).toUpperCase() + currentUserName.slice(1)
    : "";

const welcomeMessage = document.getElementById("welcomeMessage");

if (welcomeMessage && formattedUserName) {
    welcomeMessage.textContent =
        `Welcome back, ${formattedUserName}! Ready to make today count?`;
}

    const folderStorageKey = `studyTrackFolders_${currentUserId || "guest"}`;

    let folders = loadFolders();

    function loadFolders() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(folderStorageKey) || "[]"
            );

            const validFolders = Array.isArray(saved)
                ? saved.filter(name =>
                    typeof name === "string" && name.trim()
                )
                : [];

            if (!validFolders.some(name => name === "Uncategorized")) {
                validFolders.unshift("Uncategorized");
            }

            return [...new Set(validFolders)];
        } catch {
            return ["Uncategorized"];
        }
    }

    function saveFolders() {
        localStorage.setItem(folderStorageKey, JSON.stringify(folders));
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function getTaskURL(taskId = "") {
        return `${API_URL}${taskId ? `/${taskId}` : ""}?userId=${encodeURIComponent(currentUserId || "")}`;
    }

    async function request(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        });

        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || `Request failed (${response.status})`);
        }

        if (response.status === 204) return null;

        const text = await response.text();
        return text ? JSON.parse(text) : null;
    }

    function getFolder(task) {
        const name = task.folderName;

        return name && folders.includes(name)
            ? name
            : "Uncategorized";
    }

    function renderFolderOptions() {
        if (folderInput) {
            const selected = folderInput.value;

            folderInput.innerHTML = folders.map(name =>
                `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`
            ).join("");

            folderInput.value = folders.includes(selected)
                ? selected
                : "Uncategorized";
        }

        if (folderFilter) {
            const selected = folderFilter.value || "all";

            folderFilter.innerHTML =
                `<option value="all">All Folders</option>` +
                folders.map(name =>
                    `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`
                ).join("");

            folderFilter.value =
                selected === "all" || folders.includes(selected)
                    ? selected
                    : "all";
        }
    }

    function renderFolders() {
        if (!folderList) return;

        renderFolderOptions();

        const activeFolder = folderFilter?.value || "all";

        const allCard = `
            <button type="button"
                class="folder-card ${activeFolder === "all" ? "active-folder" : ""}"
                data-folder="all">
                <span class="folder-icon">📁</span>
                <span class="folder-card-name">All Tasks</span>
                <span class="folder-card-count">${tasks.length} tasks</span>
            </button>
        `;

        const folderCards = folders.map(name => {
            const folderTasks = tasks.filter(task => getFolder(task) === name);
            const completed = folderTasks.filter(task => task.completed).length;

            return `
                <button type="button"
                    class="folder-card ${activeFolder === name ? "active-folder" : ""}"
                    data-folder="${escapeHTML(name)}">
                    <span class="folder-icon">📁</span>
                    <span class="folder-card-name">${escapeHTML(name)}</span>
                    <span class="folder-card-count">
                        ${folderTasks.length} tasks · ${completed} completed
                    </span>
                </button>
            `;
        }).join("");

        folderList.innerHTML = allCard + folderCards;

        folderList.querySelectorAll("[data-folder]").forEach(button => {
            button.addEventListener("click", () => {
                if (folderFilter) {
                    folderFilter.value = button.dataset.folder;
                }

                renderFolders();
                renderTasks();
            });
        });
    }

    function getDeadline(task) {
        if (task.completed) return "Completed";
        if (!task.dueDate) return "No due date";

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const due = new Date(`${task.dueDate}T00:00:00`);

        if (Number.isNaN(due.getTime())) return "No due date";
        if (due < today) return "Overdue";
        if (due.getTime() === today.getTime()) return "Due Today";

        return "Upcoming";
    }

    function renderTasks() {
        if (!taskList) return;

        const query = (searchInput?.value || "").trim().toLowerCase();
        const filter = statusFilter?.value || "all";
        const selectedFolder = folderFilter?.value || "all";

        const dateFilter = selectedDueDate;

        const filteredTasks = tasks.filter(task => {
            const matchesSearch =
                (task.title || "").toLowerCase().includes(query);

            const deadline = getDeadline(task);

            let matchesStatus = true;

            if (filter === "completed") {
                matchesStatus = !!task.completed;
            } else if (filter === "pending") {
                matchesStatus = !task.completed;
            } else if (filter === "overdue") {
                matchesStatus = deadline === "Overdue";
            } else if (filter === "today") {
                matchesStatus = deadline === "Due Today";
            } else if (filter === "upcoming") {
                matchesStatus = deadline === "Upcoming";
            }

           const matchesFolder =
    selectedFolder === "all" ||
    getFolder(task) === selectedFolder;

const matchesDate =
    !selectedDueDate || task.dueDate === selectedDueDate;

return matchesSearch &&
       matchesStatus &&
       matchesFolder &&
       matchesDate;
            

        });

        if (taskSectionTitle) {
            taskSectionTitle.textContent =
                selectedFolder === "all" ? "All Tasks" : selectedFolder;
        }

        taskList.innerHTML = "";

        if (filteredTasks.length === 0) {
            taskList.innerHTML =
                "<li class='empty-task-message'>No tasks found in this view.</li>";
        }

        filteredTasks.forEach(task => {
            const li = document.createElement("li");
            li.className = `task-card ${task.completed ? "completed" : ""}`;

            const priority = ["High", "Medium", "Low"].includes(task.priority)
                ? task.priority
                : "Medium";

            const folderName = getFolder(task);
            const deadline = getDeadline(task);

            li.innerHTML = `
                <div class="task-card-heading">
                    <label class="task-title-wrap">
                        <input type="checkbox"
                            class="task-checkbox"
                            ${task.completed ? "checked" : ""}
                            aria-label="Mark task completed">
                        <span class="task-title">${escapeHTML(task.title)}</span>
                    </label>

                    <span class="task-status ${task.completed ? "status-completed" : "status-pending"}">
                        ${task.completed ? "Completed" : "Pending"}
                    </span>
                </div>

                <div class="task-card-details">
                    <div class="task-detail-row">
                        <span class="detail-label">Folder</span>
                        <span>${escapeHTML(folderName)}</span>
                    </div>

                    <div class="task-detail-row">
                        <span class="detail-label">Priority</span>
                        <span class="priority-badge priority-${priority.toLowerCase()}">
                            ${priority}
                        </span>
                    </div>

                    <div class="task-detail-row">
                        <span class="detail-label">Due date</span>
                        <span>${escapeHTML(task.dueDate || "Not set")}</span>
                    </div>

                    <div class="task-detail-row">
                        <span class="detail-label">Deadline status</span>
                       <span class="deadline-status ${
    deadline === "Overdue" ? "deadline-overdue" :
    deadline === "Due Today" ? "deadline-today" :
    deadline === "Upcoming" ? "deadline-upcoming" :
    deadline === "Completed" ? "deadline-completed" :
    "deadline-none"
}">
    ${deadline}
</span>
                    </div>
                </div>

                <div class="task-card-actions">
                    <button type="button" class="edit-task-button">Edit</button>
                    <button type="button" class="delete-task-button">Delete</button>
                </div>
            `;

            li.querySelector(".task-checkbox").addEventListener("change", async event => {
                await updateTask(task, { completed: event.target.checked });
            });

            li.querySelector(".edit-task-button").addEventListener("click", async () => {
                const title = prompt("Edit task title:", task.title);
                if (title === null || !title.trim()) return;

                const dueDate = prompt(
                    "Enter due date (YYYY-MM-DD), or leave blank:",
                    task.dueDate || ""
                );

                if (dueDate === null) return;

                const priorityChoice = prompt(
                    "Choose priority: High, Medium, or Low",
                    priority
                );

                if (priorityChoice === null) return;

                const priorityMap = {
                    high: "High",
                    medium: "Medium",
                    low: "Low"
                };

                const normalizedPriority = priorityChoice.trim().toLowerCase();

                if (!priorityMap[normalizedPriority]) {
                    alert("Priority must be High, Medium, or Low.");
                    return;
                }

                const folderChoice = prompt(
                    `Enter a folder name:\n${folders.join(", ")}`,
                    folderName
                );

                if (folderChoice === null) return;

                const trimmedFolder = folderChoice.trim();

                if (!folders.includes(trimmedFolder)) {
                    alert("That folder doesn't exist. Create it first.");
                    return;
                }

                await updateTask(task, {
                    title: title.trim(),
                    dueDate: dueDate.trim() || null,
                    priority: priorityMap[normalizedPriority],
                    folderName: trimmedFolder
                });
            });

            li.querySelector(".delete-task-button").addEventListener("click", async () => {
                if (!confirm("Are you sure you want to delete this task?")) return;

                try {
                    await request(getTaskURL(task.id), { method: "DELETE" });
                    tasks = tasks.filter(item => item.id !== task.id);
                    renderFolders();
                    renderTasks();
                } catch (error) {
                    console.error("Could not delete task:", error);
                    alert("Could not delete task. Please try again.");
                }
            });

            taskList.appendChild(li);
        });

        updateCounters();
        updateAnalytics();
        updateDeadlineReminders();
    }

    async function updateTask(task, changes) {
        const updatedTask = {
            ...task,
            ...changes,
            priority: changes.priority ?? task.priority ?? "Medium",
            folderName: changes.folderName ?? getFolder(task)
        };

        try {
            const saved = await request(getTaskURL(task.id), {
                method: "PUT",
                body: JSON.stringify(updatedTask)
            });

            tasks = tasks.map(item =>
                item.id === task.id ? (saved || updatedTask) : item
            );

            renderFolders();
            renderTasks();
        } catch (error) {
            console.error("Could not update task:", error);
            alert("Could not save your task changes.");
            await loadTasks();
        }
    }

    function updateCounters() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const pending = total - completed;

        const totalElement = document.getElementById("totalTasks");
        const completedElement = document.getElementById("completedTasks");
        const pendingElement = document.getElementById("pendingTasks");

        if (totalElement) totalElement.textContent = total;
        if (completedElement) completedElement.textContent = completed;
        if (pendingElement) pendingElement.textContent = pending;
    }

    
function updateAnalytics() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    const overdue = tasks.filter(task =>
        !task.completed &&
        task.dueDate &&
        task.dueDate < todayString
    ).length;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    const percentageElement =
        document.getElementById("completionPercentage");

    const circle = document.getElementById("progressCircle");
    const completedElement =
        document.getElementById("analyticsCompleted");
    const pendingElement =
        document.getElementById("analyticsPending");
    const overdueElement =
        document.getElementById("analyticsOverdue");

    if (percentageElement) {
        percentageElement.textContent = `${percentage}%`;
    }

    if (circle) {
        circle.style.setProperty("--progress", `${percentage}%`);
        circle.setAttribute(
            "aria-label",
            `${percentage}% of tasks completed`
        );
    }

    if (completedElement) completedElement.textContent = completed;
    if (pendingElement) pendingElement.textContent = pending;
    if (overdueElement) overdueElement.textContent = overdue;

    renderWeeklyChart();
}

function updateDeadlineReminders() {
    const todayList = document.getElementById("dueTodayList");
    const tomorrowList = document.getElementById("dueTomorrowList");

    if (!todayList || !tomorrowList) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const todayString = formatDate(today);
    const tomorrowString = formatDate(tomorrow);

    const todayTasks = tasks.filter(task =>
        !task.completed && task.dueDate === todayString
    );

    const tomorrowTasks = tasks.filter(task =>
        !task.completed && task.dueDate === tomorrowString
    );

    const renderReminderList = (list, matchingTasks) => {
        if (matchingTasks.length === 0) {
            list.innerHTML = "<li>No pending tasks. You're all caught up! 💜</li>";
            return;
        }

        list.innerHTML = matchingTasks.map(task =>
            `<li>${escapeHTML(task.title)} <span>— ${escapeHTML(task.dueDate)}</span></li>`
        ).join("");
    };

    renderReminderList(todayList, todayTasks);
    renderReminderList(tomorrowList, tomorrowTasks);
}


function renderWeeklyChart() {
    const chart = document.getElementById("weeklyChart");
    if (!chart) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find Monday of the current week.
    const monday = new Date(today);
    const dayOffset = (today.getDay() + 6) % 7;
    monday.setDate(today.getDate() - dayOffset);

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const weekData = days.map((day, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const dayNumber = String(date.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${dayNumber}`;

        const count = tasks.filter(task =>
            task.dueDate === dateString
        ).length;

        return {
            day,
            dateString,
            count,
            isToday: dateString === [
                today.getFullYear(),
                String(today.getMonth() + 1).padStart(2, "0"),
                String(today.getDate()).padStart(2, "0")
            ].join("-")
        };
    });

    const maximum = Math.max(1, ...weekData.map(item => item.count));

    chart.innerHTML = weekData.map(item => {
        const height = item.count === 0
            ? 4
            : Math.max(8, (item.count / maximum) * 100);

        return `
            <div class="weekly-day ${item.isToday ? "today" : ""}">
                <span class="weekly-day-count">${item.count}</span>
                <div class="weekly-bar-area">
                    <div
                        class="weekly-bar"
                        style="height: ${height}%"
                        title="${item.count} tasks due on ${item.dateString}"
                    ></div>
                </div>
                <span class="weekly-day-label">${item.day}</span>
            </div>
        `;
    }).join("");
}


    async function addTask() {
        const title = taskInput?.value.trim();

        if (!title) {
            alert("Please enter a task title.");
            return;
        }

        const priority = priorityInput?.value || "Medium";
        const dueDate = dueDateInput?.value || null;
        const folderName = folderInput?.value || "Uncategorized";

        try {
            const createdTask = await request(getTaskURL(), {
                method: "POST",
                body: JSON.stringify({
                    title,
                    completed: false,
                    dueDate,
                    priority,
                    folderName
                })
            });

            tasks.push({
                ...createdTask,
                folderName: createdTask.folderName || folderName
            });

            taskInput.value = "";
            if (dueDateInput) dueDateInput.value = "";
            if (priorityInput) priorityInput.value = "Medium";

            renderFolders();
            renderTasks();
        } catch (error) {
            console.error("Could not add task:", error);
            alert("Could not add task. Please check your backend.");
        }
    }

    createFolderForm?.addEventListener("submit", event => {
        event.preventDefault();

        const name = folderNameInput?.value.trim();

        if (!name) return;

        if (folders.some(folder => folder.toLowerCase() === name.toLowerCase())) {
            alert("A folder with that name already exists.");
            return;
        }

        folders.push(name);
        saveFolders();

        if (folderNameInput) folderNameInput.value = "";

        renderFolders();
        renderTasks();
    });

    addTaskButton?.addEventListener("click", addTask);

    taskInput?.addEventListener("keydown", event => {
        if (event.key === "Enter") addTask();
    });

    searchInput?.addEventListener("input", renderTasks);
    statusFilter?.addEventListener("change", renderTasks);

    folderFilter?.addEventListener("change", () => {
        renderFolders();
        renderTasks();
    });

    document.addEventListener("studytrack:filter-by-date", event => {
    selectedDueDate = event.detail.date;

    if (statusFilter) statusFilter.value = "all";
    if (folderFilter) folderFilter.value = "all";

    renderFolders();
    renderTasks();
});

    const logoutButton = document.getElementById("logoutButton");

    logoutButton?.addEventListener("click", () => {
        localStorage.removeItem("userId");
        sessionStorage.removeItem("userId");
        window.location.href = "login.html";
    });

    async function loadTasks() {
        try {
            const result = await request(getTaskURL());

            tasks = Array.isArray(result)
                ? result.map(task => ({
                    ...task,
                    folderName: task.folderName || "Uncategorized"
                }))
                : [];

            renderFolders();
            renderTasks();
        } catch (error) {
            console.error("Could not load tasks:", error);

            if (taskList) {
                taskList.innerHTML =
                    "<li class='empty-task-message'>Could not load tasks. Check that the backend is running.</li>";
            }
        }
    }

    renderFolders();
    loadTasks();
});
