const percentageValue = 55;

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

filterButton();
summary_values()
progressBar()
renderTasks();

const form = document.querySelector('.add_task_form');
const addTaskBtn = document.querySelector('.add_task_btn a');
const modal = document.querySelector('.modal_overlay');
const closeModalBtn = document.querySelector('.close_modal_btn');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask();
});

addTaskBtn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
    const newTask = {
        courseName: document.querySelector('.course_input').value,
        taskTitle: document.querySelector('.title_input').value,
        taskDate: document.querySelector('.date_input').value,
        daysLeft: 7,
        taskStatus: "In Progress",
        progressPercentage: 0,
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    modal.classList.add('hidden');
    form.reset();
    summary_values();
}

function renderTasks() {

    const container = document.querySelector('.individual_tasks_container');

    container.innerHTML = "";

    tasks.forEach(task => {

        let statusColor = "#3b82f6";

        if (task.taskStatus === "Completed") {
            statusColor = "#22c55e";
        }

        if (task.taskStatus === "Late") {
            statusColor = "#ef4444";
        }

        container.innerHTML += `

<div 
    class="individual_tasks_card"
    style="border-left: 5px solid ${statusColor};"
>

    <div class="course_name_status_task">
        <p class="course_name_individual_task_card">
            ${task.courseName}
        </p>

        <p 
            class="status_task_individual_task_card"
            style="
                background:${statusColor}20;
                color:${statusColor};
                border:1px solid ${statusColor}50;
            "
        >
            ${task.taskStatus}
        </p>
    </div>

    <h3 class="task_title_individual">
        ${task.taskTitle}
    </h3>

    <div class="progress_texts_container">
        <p>Progress</p>

        <h4 class="progress_percentage">
            ${task.progressPercentage}%
        </h4>
    </div>

    <div class="progress_bar">
        <div 
            class="progress_fill"
            style="
                width:${task.progressPercentage}%;
                background:${statusColor};
            "
        >
        </div>
    </div>

    <div class="task_information_individual">
        <p class="date_task_individual">
            ${task.taskDate}
        </p>

        <p class="days_left_individual">
            ${task.daysLeft} days left
        </p>
    </div>

</div>
`;
    });


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
    const tasksInformations = tasks.length;
    const total_tasks_value = document.querySelector('.total_tasks_value');
    const completed_tasks_value = document.querySelector('.completed_tasks_value');
    const pending_tasks_value = document.querySelector('.pending_tasks_value');
    const late_tasks_value = document.querySelector('.late_tasks_value');

    let completedCount = 0;
    let inProgressCount = 0;
    let pendingCount = 0;
    let lateCount = 0;

    tasks.forEach(task => {
        if (task.taskStatus === "Completed") {
                completedCount++;
        } else if (task.taskStatus === "In Progress") {
            inProgressCount++;
        } else if (task.taskStatus === "Late") {
            lateCount++;
        }
    });

    completed_tasks_value.textContent = completedCount;
    pending_tasks_value.textContent = inProgressCount;
    late_tasks_value.textContent = lateCount;
    total_tasks_value.textContent = tasksInformations;
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
