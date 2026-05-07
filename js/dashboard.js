const percentageValue = 55;
const tasksInformations = 5;


const taskData = {
    courseName: "Computer Networks",
    taskStatus: "Completed",
    taskTitle: "TCP/IP Protocol",
    progressPercentage: 55,
    taskDate: "2024-06-30",
    daysLeft: 5
};

filterButton();
summary_values()
progressBar()
individualCardInformation()

function individualCardInformation() {

    const courseName = document.querySelector('.course_name_individual_task_card');
    const taskStatus = document.querySelector('.status_task_individual_task_card');
    const taskTitle = document.querySelector('.task_title_individual');
    const progressPercentage = document.querySelector('.progress_percentage');
    const taskDate = document.querySelector('.date_task_individual');
    const daysLeft = document.querySelector('.days_left_individual');


    courseName.textContent = taskData.courseName;

    taskStatus.textContent = taskData.taskStatus;

    taskTitle.textContent = taskData.taskTitle;

    progressPercentage.textContent = `${taskData.progressPercentage}%`;

    taskDate.textContent = taskData.taskDate;

    daysLeft.textContent = `${taskData.daysLeft} days left`;

}

function progressBar() {
    const progressBars = document.querySelectorAll(".overall_progress");

    progressBars.forEach(progress => {
        const value = percentageValue; // This value should be dynamically calculated based on the tasks data
        progress.dataset.progress = value;
        progress.style.setProperty("--progress", `${value * 3.6}deg`);
    });
}

function summary_values() {
    const total_tasks_value = document.querySelector('.total_tasks_value');
    const completed_tasks_value = document.querySelector('.completed_tasks_value');
    const pending_tasks_value = document.querySelector('.pending_tasks_value');
    const late_tasks_value = document.querySelector('.late_tasks_value');

    total_tasks_value.textContent = tasksInformations;
    completed_tasks_value.textContent = tasksInformations;
    pending_tasks_value.textContent = tasksInformations;
    late_tasks_value.textContent = tasksInformations;
}

function filterButton() {
    const filterCards = document.querySelectorAll('.filter_card');

    filterCards.forEach(card => {
        const buttons = card.querySelectorAll('.filter_btn');

        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();

                buttons.forEach(btn => btn.classList.remove('active'));

                button.classList.add('active');
            });
        });
    });
}