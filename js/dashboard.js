const totalTasks = 5;
const completedTasks = 1;
const pendingTasks = 3;
const lateTasks = 1;
const progressValue = 66;

summaryValues();
progressBar();
filterButton();

function summaryValues() {
    const totalTasksValue = document.querySelector(".total_tasks_value");
    const completedTasksValue = document.querySelector(".completed_tasks_value");
    const pendingTasksValue = document.querySelector(".pending_tasks_value");
    const lateTasksValue = document.querySelector(".late_tasks_value");

    totalTasksValue.textContent = totalTasks;
    completedTasksValue.textContent = completedTasks;
    pendingTasksValue.textContent = pendingTasks;
    lateTasksValue.textContent = lateTasks;
}

function progressBar() {
    const progressBars = document.querySelectorAll(".overall_progress");

    progressBars.forEach((progress) => {
        progress.dataset.progress = progressValue;
        progress.style.setProperty("--progress", `${progressValue * 3.6}deg`);
        progress.setAttribute("aria-valuenow", progressValue);
    });
}

function filterButton() {
    const filterCards = document.querySelectorAll(".filter_card");

    filterCards.forEach((card) => {
        const buttons = card.querySelectorAll(".filter_btn");

        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                buttons.forEach((currentButton) => {
                    currentButton.classList.remove("active");
                });

                button.classList.add("active");
            });
        });
    });
}
