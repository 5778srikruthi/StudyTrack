
document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8080/api/tasks";

    const calendarGrid = document.getElementById("calendarGrid");
    const monthYear = document.getElementById("calendarMonthYear");
    const selectedDateHeading = document.getElementById("selectedDateHeading");
    const calendarTaskList = document.getElementById("calendarTaskList");

    const previousMonthButton = document.getElementById("previousMonth");
    const nextMonthButton = document.getElementById("nextMonth");
    const todayButton = document.getElementById("todayButton");
    const logoutButton = document.getElementById("logoutButton");

    const userId =
        localStorage.getItem("userId") ||
        sessionStorage.getItem("userId");

    let tasks = [];
    let selectedDate = formatDate(new Date());
    let displayedMonth = new Date();
    displayedMonth.setDate(1);

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
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

    async function loadTasks() {
        if (!userId) {
            calendarTaskList.innerHTML =
                "<li class='empty-task-message'>Please log in to view your tasks.</li>";
            renderCalendar();
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}?userId=${encodeURIComponent(userId)}`
            );

            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }

            const result = await response.json();
            tasks = Array.isArray(result) ? result : [];

            renderCalendar();
            renderSelectedDateTasks();
        } catch (error) {
            console.error("Could not load calendar tasks:", error);

            calendarTaskList.innerHTML =
                "<li class='empty-task-message'>Could not load tasks. Please check that the backend is running.</li>";

            renderCalendar();
        }
    }

    function renderCalendar() {
        const year = displayedMonth.getFullYear();
        const month = displayedMonth.getMonth();

        monthYear.textContent = displayedMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = formatDate(new Date());

        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        let html = weekdays.map(day =>
            `<div class="calendar-weekday">${day}</div>`
        ).join("");

        // Empty cells before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            html += `<div class="calendar-day calendar-empty"></div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = formatDate(new Date(year, month, day));
            const dateTasks = tasks.filter(task => task.dueDate === date);
            const completedCount = dateTasks.filter(task => task.completed).length;

            const isToday = date === today;
            const isSelected = date === selectedDate;

            const classes = [
                "calendar-day",
                isToday ? "calendar-today" : "",
                isSelected ? "calendar-selected" : "",
                dateTasks.length ? "calendar-has-tasks" : ""
            ].filter(Boolean).join(" ");

            let indicator = "";

            if (dateTasks.length > 0) {
                const allCompleted = completedCount === dateTasks.length;

                indicator = `
                    <span class="calendar-task-indicator ${allCompleted ? "all-tasks-completed" : ""}">
                        ${dateTasks.length} ${dateTasks.length === 1 ? "task" : "tasks"}
                    </span>
                `;
            }

            html += `
                <button
                    type="button"
                    class="${classes}"
                    data-date="${date}"
                    aria-label="${date}, ${dateTasks.length} tasks"
                    aria-pressed="${isSelected}"
                >
                    <span class="calendar-day-number">${day}</span>
                    ${indicator}
                </button>
            `;
        }

        const totalCells = firstDay + daysInMonth;
        const trailingCells = (7 - (totalCells % 7)) % 7;

        for (let i = 0; i < trailingCells; i++) {
            html += `<div class="calendar-day calendar-empty"></div>`;
        }

        calendarGrid.innerHTML = html;

        calendarGrid.querySelectorAll("[data-date]").forEach(button => {
            button.addEventListener("click", () => {
                selectedDate = button.dataset.date;
                renderCalendar();
                renderSelectedDateTasks();
            });
        });
    }

    function renderSelectedDateTasks() {
    const date = new Date(`${selectedDate}T00:00:00`);

    selectedDateHeading.textContent =
        `Tasks for ${date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        })}`;

    const dateTasks = tasks.filter(task => task.dueDate === selectedDate);

    calendarTaskList.innerHTML = "";

    if (dateTasks.length === 0) {
        calendarTaskList.innerHTML =
            "<li class='empty-task-message'>No tasks scheduled for this date. Enjoy the free time or plan a study session! 💜</li>";
        return;
    }

    dateTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = `task-card ${task.completed ? "completed" : ""}`;

        const priority = ["High", "Medium", "Low"].includes(task.priority)
            ? task.priority
            : "Medium";

        li.innerHTML = `
            <div class="task-card-heading">
                <label class="calendar-task-checkbox">
                    <input
                        type="checkbox"
                        class="calendar-complete-checkbox"
                        ${task.completed ? "checked" : ""}
                        aria-label="Mark ${escapeHTML(task.title)} as completed"
                    >
                    <span class="task-title">${escapeHTML(task.title)}</span>
                </label>

                <span class="task-status ${task.completed ? "status-completed" : "status-pending"}">
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
                    <span class="detail-label">Folder</span>
                    <span>${escapeHTML(task.folderName || "Uncategorized")}</span>
                </div>
            </div>
        `;

        calendarTaskList.appendChild(li);

        const checkbox = li.querySelector(".calendar-complete-checkbox");

        checkbox.addEventListener("change", async () => {
            const previousCompleted = task.completed;
            const newCompleted = checkbox.checked;

            checkbox.disabled = true;

            try {
                const response = await fetch(
                    `${API_URL}/${task.id}?userId=${encodeURIComponent(userId)}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            title: task.title,
                            completed: newCompleted,
                            dueDate: task.dueDate,
                            priority: task.priority,
                            folderName: task.folderName
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error(`Update failed: ${response.status}`);
                }

                const updatedTask = await response.json();
                task.completed = updatedTask.completed;

                renderCalendar();
                renderSelectedDateTasks();
            } catch (error) {
                console.error("Could not update task completion:", error);
                task.completed = previousCompleted;
                checkbox.checked = previousCompleted;

                alert("Could not update the task. Please try again.");
            }
        });
    });
}

    previousMonthButton.addEventListener("click", () => {
        displayedMonth.setMonth(displayedMonth.getMonth() - 1);
        renderCalendar();
    });

    nextMonthButton.addEventListener("click", () => {
        displayedMonth.setMonth(displayedMonth.getMonth() + 1);
        renderCalendar();
    });

    todayButton.addEventListener("click", () => {
        const today = new Date();

        displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        selectedDate = formatDate(today);

        renderCalendar();
        renderSelectedDateTasks();
    });

    logoutButton?.addEventListener("click", event => {
        event.preventDefault();

        localStorage.removeItem("userId");
        sessionStorage.removeItem("userId");

        window.location.href = "login.html";
    });

    renderCalendar();
    loadTasks();
});
