
document.addEventListener("DOMContentLoaded", () => {
    const dateSearchForm = document.getElementById("dateSearchForm");
    const dateInput = document.getElementById("taskDateSearch");

    if (!dateSearchForm || !dateInput) {
        console.error("Date search form or date input not found.");
        return;
    }

    dateSearchForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const selectedDate = dateInput.value;

        if (!selectedDate) {
            alert("Please select a date.");
            return;
        }

        // Reuse the existing task list and date filter.
        const dueDateInput = document.getElementById("dueDateInput");

        if (dueDateInput) {
            dueDateInput.value = selectedDate;
        }

        const taskSection = document.getElementById("tasksSection");
        const taskSectionTitle = document.getElementById("taskSectionTitle");

        if (taskSectionTitle) {
            taskSectionTitle.textContent = `Tasks due on ${selectedDate}`;
        }

        // Ask the existing dashboard to display tasks for this date.
        document.dispatchEvent(
            new CustomEvent("studytrack:filter-by-date", {
                detail: { date: selectedDate }
            })
        );

        taskSection?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});
