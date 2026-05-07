
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
filterButton();
summary_values()
progressBar()
renderTasks();

const form = document.querySelector('.add_task_form');
const addTaskBtn = document.querySelector('.add_task_btn a');
const modal = document.querySelector('.modal_overlay');
const modalDetail = document.querySelector('.modal_overlay_detail_info');
const closeModalBtn = document.querySelector('.close_modal_btn');
const closeModalBtnDetail = document.querySelector('.close_modal_btn_detail');


closeModalBtnDetail.addEventListener('click', () => {
    modalDetail.classList.add('hidden');
});


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
        subtasks: [],
        id: Date.now(),
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    modal.classList.add('hidden');
    form.reset();
    summary_values();
    progressBar();
}

function getTaskDetails(taskId) {
    const container = document.querySelector('.task_information_container');
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        let statusColor = "#3b82f6";

        if (task.taskStatus === "Completed") {
            statusColor = "#22c55e";
        }

        if (task.taskStatus === "Late") {
            statusColor = "#ef4444";
        }

        const subtasksHTML = task.subtasks.map((subtask, index) => {

            return `
        <li 
            class="${subtask.completed ? 'checked' : ''}"
            data-index="${index}"
        >
            ${subtask.text}
        </li>
    `;

        }).join('');
        return container.innerHTML = `


                <p class="text_muted">${task.courseName}</p>
                <h2 class="task_title_detail">${task.taskTitle}</h2>

                <div class="progress_status_date">
                    <p class="status_task_individual_task_card">${task.taskStatus}</p>
                    <p class="text_muted">${task.taskDate}</p>
                </div>

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

                <div class="subtask_container">
                    <div class="subtask_title_container">
                        <h4>Subtasks</h4>
                        <p class="remaining_subtask text_muted">3/4</p>
                    </div>


                    <ul id="myUL">
                        ${task.subtasks.length === 0
                ? `
                            <p class="paragraph_if_no_subtask">
                                No subtasks yet — break this task into smaller steps
                            </p>
                            `
                : subtasksHTML
            }
                    </ul>

                    <div id="myDIV" class="header">
                        <input type="text" id="myInput" placeholder="Add a new subtask">
                        <span onclick="newElement(${task.id})" class="addBtn">+</span>
                    </div>
                </div>
        `;
    } else {
        return "<p>Task not found.</p>";
    }
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
    data-id="${task.id}"
    style="border-left: 5px solid ${statusColor};"
>

    <div class="course_name_status_task">
        <p class="text_muted">
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
        <p class="text_muted">
            ${task.taskDate}
        </p>

        <p class="text_muted">
            ${task.daysLeft} days left
        </p>
    </div>

</div>
`;
    });

    addTaskCardEventsRender();
}

function addTaskCardEventsRender() {

    const taskCards = document.querySelectorAll('.individual_tasks_card');

    taskCards.forEach(card => {

        card.addEventListener('click', (e) => {

            e.preventDefault();

            const taskId = Number(card.dataset.id);

            modalDetail.classList.remove('hidden');

            getTaskDetails(taskId);
            // Add a "checked" symbol when clicking on a list item
            const list = document.querySelector('#myUL');

            list.addEventListener('click', (ev) => {

                if (ev.target.tagName === 'LI') {

                    const subtaskIndex =
                        Number(ev.target.dataset.index);

                    const task =
                        tasks.find(t => t.id === taskId);

                    task.subtasks[subtaskIndex].completed =
                        !task.subtasks[subtaskIndex].completed;

                    updateTaskProgress(task);

                    saveTasks();

                    modalDetail.classList.remove('hidden');

                    getTaskDetails(taskId);

                    addTaskCardEventsRender();

                }

            });

        });
    });
}



function progressBar() {

    const progress = document.querySelector(".overall_progress");

    if (tasks.length === 0) {

        progress.dataset.progress = 0;

        progress.style.setProperty("--progress", `0deg`);

        return;
    }

    const totalProgress =
        tasks.reduce((sum, task) =>
            sum + task.progressPercentage, 0);

    const averageProgress =
        Math.round(totalProgress / tasks.length);

    progress.dataset.progress = averageProgress;

    progress.style.setProperty(
        "--progress",
        `${averageProgress * 3.6}deg`
    );
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


// Create a "close" button and append it to each list item




// Create a new list item when clicking on the "Add" button
function newElement(taskId) {
    const input = document.getElementById("myInput");

    const inputValue = input.value;

    const task = tasks.find(t => t.id === taskId);

    if (inputValue === '') {

        alert("You must write something!");

        return;
    }

    task.subtasks.push({
        text: inputValue,
        completed: false
    });

    input.value = "";

    saveTasks();

    getTaskDetails(taskId);

    updateTaskProgress(task);

}

function updateTaskProgress(task) {

    if (task.subtasks.length === 0) {

        task.progressPercentage = 0;

        return;
    }

    const completedSubtasks =
        task.subtasks.filter(subtask =>
            subtask.completed
        ).length;

    task.progressPercentage =
        Math.round(
            (completedSubtasks / task.subtasks.length) * 100
        );

    if (task.progressPercentage === 100) {

        task.taskStatus = "Completed";

    } else {

        task.taskStatus = "In Progress";

    }

    saveTasks();

    renderTasks();
    summary_values();
    progressBar();
}
