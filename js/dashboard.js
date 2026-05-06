const totalTasks = 5;
const completedTasks = 1;
const pendingTasks = 3;
const lateTasks = 1;
const progressValue = 66;

updateSummaryValues();
updateProgressBar();
setupFilterButtons();

function updateSummaryValues() {
    const totalTasksValue = document.querySelector(".total-tasks-value");
    const completedTasksValue = document.querySelector(".completed-tasks-value");
    const pendingTasksValue = document.querySelector(".pending-tasks-value");
    const lateTasksValue = document.querySelector(".late-tasks-value");

    totalTasksValue.textContent = totalTasks;
    completedTasksValue.textContent = completedTasks;
    pendingTasksValue.textContent = pendingTasks;
    lateTasksValue.textContent = lateTasks;
}

function updateProgressBar() {
    const progressBars = document.querySelectorAll(".overall-progress");

    progressBars.forEach((progress) => {
        progress.dataset.progress = progressValue;
        progress.style.setProperty("--progress", `${progressValue * 3.6}deg`);
        progress.setAttribute("aria-valuenow", progressValue);
    });
}

function setupFilterButtons() {
    const filterCards = document.querySelectorAll(".filter-card");

    filterCards.forEach((card) => {
        const buttons = card.querySelectorAll(".filter-button");

        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                buttons.forEach((currentButton) => {
                    currentButton.classList.remove("active");
                    currentButton.setAttribute("aria-pressed", "false");
                });

                button.classList.add("active");
                button.setAttribute("aria-pressed", "true");
            });
        });
    });
}
