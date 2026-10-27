
document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8080/api/tasks";

    const folderList = document.getElementById("folderList");
    const folderSummary = document.getElementById("folderSummary");
    const createFolderForm = document.getElementById("createFolderForm");
    const folderNameInput = document.getElementById("folderNameInput");
    const folderTasksTitle = document.getElementById("folderTasksTitle");
    const folderTaskList = document.getElementById("folderTaskList");
    const showAllButton = document.getElementById("showAllFolderTasks");
    const logoutButton = document.getElementById("logoutButton");

    const userId =
        localStorage.getItem("userId") ||
        sessionStorage.getItem("userId");

    const storageKey = `studyTrackFolders_${userId || "guest"}`;

    let folders = loadFolders();
    let tasks = [];
    let selectedFolder = "";

    function loadFolders() {
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
            const valid = Array.isArray(saved)
                ? saved.filter(name => typeof name === "string" && name.trim())
                : [];

            if (!valid.includes("Uncategorized")) {
                valid.unshift("Uncategorized");
            }

            return [...new Set(valid)];
        } catch {
            return ["Uncategorized"];
        }
    }

    function saveFolders() {
        localStorage.setItem(storageKey, JSON.stringify(folders));
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

    function getFolder(task) {
        return task.folderName && folders.includes(task.folderName)
            ? task.folderName
            : "Uncategorized";
    }

    async function loadTasks() {
        if (!userId) {
            folderSummary.textContent = "Please log in to view your folders.";
            folderTaskList.innerHTML =
                "<li class='empty-task-message'>Please log in to view your tasks.</li>";
            renderFolders();
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}?userId=${encodeURIComponent(userId)}`
            );

            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }

            const data = await response.json();
            tasks = Array.isArray(data) ? data : [];

            renderFolders();
            renderFolderTasks();
        } catch (error) {
            console.error("Could not load folder tasks:", error);
            folderSummary.textContent = "Could not load your tasks.";
            folderTaskList.innerHTML =
                "<li class='empty-task-message'>Check that your backend is running, then refresh this page.</li>";
            renderFolders();
        }
    }

    function renderFolders() {
        const totalCompleted = tasks.filter(task => task.completed).length;

        folderSummary.textContent =
            `${folders.length} folders · ${tasks.length} tasks · ${totalCompleted} completed`;

        folderList.innerHTML = "";

        folders.forEach(name => {
            const folderTasks = tasks.filter(task => getFolder(task) === name);
            const completed = folderTasks.filter(task => task.completed).length;

            const card = document.createElement("button");
            card.type = "button";
            card.className =
                `folder-card ${selectedFolder === name ? "active-folder" : ""}`;

            card.innerHTML = `
    <span class="folder-icon">📁</span>
    <span class="folder-card-name">${escapeHTML(name)}</span>
    <span class="folder-card-count">
        ${folderTasks.length} tasks · ${completed} completed
    </span>
    ${
        name !== "Uncategorized"
            ? `<span class="delete-folder-button" role="button" tabindex="0"
                title="Delete folder" aria-label="Delete ${escapeHTML(name)}">🗑️</span>`
            : ""
    }
`;

const deleteButton = card.querySelector(".delete-folder-button");

if (deleteButton) {
    const deleteFolder = event => {
        event.stopPropagation();

        if (!confirm(
            `Delete "${name}"? Its tasks will be moved to Uncategorized.`
        )) {
            return;
        }

        folders = folders.filter(folder => folder !== name);
        saveFolders();

        if (selectedFolder === name) {
            selectedFolder = "";
        }

        renderFolders();
        renderFolderTasks();
    };

    deleteButton.addEventListener("click", deleteFolder);

    deleteButton.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            deleteFolder(event);
        }
    });
}

            card.addEventListener("click", () => {
                selectedFolder = name;
                renderFolders();
                renderFolderTasks();
            });

            folderList.appendChild(card);
        });
    }

    function renderFolderTasks() {
        const visibleTasks = selectedFolder
            ? tasks.filter(task => getFolder(task) === selectedFolder)
            : tasks;

        folderTasksTitle.textContent = selectedFolder || "All tasks";
        folderTaskList.innerHTML = "";

        if (visibleTasks.length === 0) {
            folderTaskList.innerHTML =
                "<li class='empty-task-message'>No tasks in this folder yet.</li>";
            return;
        }

        visibleTasks.forEach(task => {
            const li = document.createElement("li");
            li.className = `task-card ${task.completed ? "completed" : ""}`;

            const priority = ["High", "Medium", "Low"].includes(task.priority)
                ? task.priority
                : "Medium";

            li.innerHTML = `
                <div class="task-card-heading">
                    <span class="task-title">${escapeHTML(task.title)}</span>
                    <span class="task-status ${
                        task.completed ? "status-completed" : "status-pending"
                    }">
                        ${task.completed ? "Completed" : "Pending"}
                    </span>
                </div>

                <div class="task-card-details">
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
                </div>
            `;

            folderTaskList.appendChild(li);
        });
    }

    createFolderForm.addEventListener("submit", event => {
        event.preventDefault();

        const name = folderNameInput.value.trim();
        if (!name) return;

        if (folders.some(folder => folder.toLowerCase() === name.toLowerCase())) {
            alert("A folder with that name already exists.");
            return;
        }

        folders.push(name);
        saveFolders();

        selectedFolder = name;
        folderNameInput.value = "";

        renderFolders();
        renderFolderTasks();
    });

    showAllButton.addEventListener("click", () => {
        selectedFolder = "";
        renderFolders();
        renderFolderTasks();
    });

    logoutButton?.addEventListener("click", event => {
        event.preventDefault();
        localStorage.removeItem("userId");
        sessionStorage.removeItem("userId");
        window.location.href = "login.html";
    });

    renderFolders();
    loadTasks();
});
