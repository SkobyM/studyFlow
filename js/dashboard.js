const STORAGE_KEY = "tasks";
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

let tasks = loadTasks();
let activeTaskId = null;
let selectedStatusFilter = "all";
let selectedTypeFilter = "all";

const addTaskForm = document.querySelector(".add_task_form");
const addTaskButton = document.querySelector(".add_task_btn a");
const addTaskModal = document.querySelector(".modal_overlay");
const taskDetailsModal = document.querySelector(".modal_overlay_detail_info");
const closeAddTaskButton = document.querySelector(".close_modal_btn");
const closeDetailsButton = document.querySelector(".close_modal_btn_detail");
const taskCardsContainer = document.querySelector(".individual_tasks_container");
const taskDetailsContainer = document.querySelector(".task_information_container");

renderDashboard();

addTaskForm.addEventListener("submit", handleAddTask);
addTaskButton.addEventListener("click", openAddTaskModal);
closeAddTaskButton.addEventListener("click", closeAddTaskModal);
closeDetailsButton.addEventListener("click", closeTaskDetailsModal);
taskCardsContainer.addEventListener("click", handleTaskCardClick);
taskDetailsModal.addEventListener("click", handleTaskDetailsClick);
taskDetailsModal.addEventListener("keydown", handleTaskDetailsKeydown);
taskDetailsContainer.addEventListener("submit", handleTaskDetailsSubmit);
document.addEventListener("keydown", closeModalsWithEscape);
setupFilterButtons();

function loadTasks() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderDashboard() {
    refreshTaskStatuses();
    renderTasks();
    renderSummary();
    renderOverallProgress();
}

function openAddTaskModal(event) {
    event.preventDefault();
    addTaskModal.classList.remove("hidden");
}

function closeAddTaskModal() {
    addTaskModal.classList.add("hidden");
    addTaskForm.reset();
}

function closeTaskDetailsModal() {
    taskDetailsModal.classList.add("hidden");
    taskDetailsModal.classList.remove("editing");
    activeTaskId = null;
}

function closeModalsWithEscape(event) {
    if (event.key !== "Escape") return;

    closeAddTaskModal();
    closeTaskDetailsModal();
}

function handleAddTask(event) {
    event.preventDefault();

    const newTask = {
        id: Date.now(),
        courseName: document.querySelector(".course_input").value.trim(),
        taskTitle: document.querySelector(".title_input").value.trim(),
        taskDate: document.querySelector(".date_input").value,
        taskType: document.querySelector(".type_select").value,
        taskStatus: "In Progress",
        progressPercentage: 0,
        subtasks: []
    };

    tasks.push(newTask);
    saveTasks();
    renderDashboard();
    closeAddTaskModal();
}

function handleTaskCardClick(event) {
    const taskCard = event.target.closest(".individual_tasks_card");
    if (!taskCard) return;

    activeTaskId = Number(taskCard.dataset.id);
    renderTaskDetails(activeTaskId);
    taskDetailsModal.classList.remove("hidden");
}

function handleTaskDetailsClick(event) {
    const editButton = event.target.closest(".edit_task_btn");
    const deleteButton = event.target.closest(".delete_task_btn");
    const cancelEditButton = event.target.closest(".cancel_edit_btn");
    const addEditSubtaskButton = event.target.closest(".add_edit_subtask_btn");
    const deleteEditSubtaskButton = event.target.closest(".delete_edit_subtask_btn");
    const checkbox = event.target.closest(".subtask_checkbox");
    const addSubtaskButton = event.target.closest(".add_subtask_btn");

    if (editButton) {
        renderEditTaskForm(activeTaskId);
        return;
    }

    if (deleteButton) {
        deleteActiveTask();
        return;
    }

    if (cancelEditButton) {
        renderTaskDetails(activeTaskId);
        return;
    }

    if (deleteEditSubtaskButton) {
        deleteEditSubtaskButton.closest(".edit_subtask_item").remove();
        return;
    }

    if (addEditSubtaskButton) {
        addEditSubtaskRow();
        return;
    }

    if (checkbox) {
        toggleSubtask(Number(checkbox.dataset.index));
        return;
    }

    if (addSubtaskButton) {
        addSubtask();
    }
}

function handleTaskDetailsKeydown(event) {
    const isSubtaskInput = event.target.classList.contains("subtask_input");
    const isEditSubtaskInput = event.target.classList.contains("edit_new_subtask_input");

    if (isSubtaskInput && event.key === "Enter") {
        event.preventDefault();
        addSubtask();
    }

    if (isEditSubtaskInput && event.key === "Enter") {
        event.preventDefault();
        addEditSubtaskRow();
    }
}

function handleTaskDetailsSubmit(event) {
    if (!event.target.classList.contains("edit_task_form")) return;

    event.preventDefault();
    saveEditedTask(event.target);
}

function getTaskById(taskId) {
    return tasks.find((task) => task.id === taskId);
}

function getFilteredTasks() {
    return tasks.filter((task) => {
        const statusMatches = selectedStatusFilter === "all" || task.taskStatus === selectedStatusFilter;
        const typeMatches = selectedTypeFilter === "all" || getTaskType(task) === selectedTypeFilter;

        return statusMatches && typeMatches;
    });
}

function renderTasks() {
    const visibleTasks = getFilteredTasks();

    if (visibleTasks.length === 0) {
        taskCardsContainer.innerHTML = `
            <p class="empty_tasks_message">
                No tasks match the selected filters.
            </p>
        `;
        return;
    }

    taskCardsContainer.innerHTML = visibleTasks.map((task) => {
        const status = getStatusStyle(task.taskStatus);
        const dueDate = getDueDateInfo(task.taskDate);

        return `
            <article
                class="individual_tasks_card"
                data-id="${task.id}"
                style="border-left-color: ${status.color};"
            >
                <div class="course_name_status_task">
                    <p class="text_muted">${escapeHTML(task.courseName)}</p>
                    ${renderStatusBadge(task.taskStatus)}
                </div>

                <h3 class="task_title_individual">${escapeHTML(task.taskTitle)}</h3>

                <div class="progress_texts_container">
                    <p>Progress</p>
                    <h4 class="progress_percentage">${task.progressPercentage}%</h4>
                </div>

                <div class="progress_bar" aria-label="Task progress">
                    <div
                        class="progress_fill"
                        style="width: ${task.progressPercentage}%; background: ${status.color};"
                    ></div>
                </div>

                <div class="task_information_individual">
                    <p class="${dueDate.isOverdue ? "date_overdue" : "text_muted"}">${dueDate.shortText}</p>
                    <p class="text_muted">${dueDate.relativeText}</p>
                </div>
            </article>
        `;
    }).join("");
}

function renderTaskDetails(taskId) {
    const task = getTaskById(taskId);
    taskDetailsModal.classList.remove("editing");

    if (!task) {
        taskDetailsContainer.innerHTML = `<p class="text_muted">Task not found.</p>`;
        return;
    }

    const status = getStatusStyle(task.taskStatus);
    const dueDate = getDueDateInfo(task.taskDate);
    const completedSubtasks = countCompletedSubtasks(task);
    const totalSubtasks = task.subtasks.length;

    taskDetailsContainer.innerHTML = `
        <p class="text_muted task_course_detail">${escapeHTML(task.courseName)}</p>
        <h2 class="task_title_detail">${escapeHTML(task.taskTitle)}</h2>

        <div class="progress_status_date">
            ${renderStatusBadge(task.taskStatus)}
            <p class="task_due_date ${dueDate.isOverdue ? "date_overdue" : "text_muted"}">
                <span class="calendar_icon" aria-hidden="true">&#128197;</span>
                ${dueDate.longText}
            </p>
        </div>

        <div class="detail_section_header">
            <h3>Progress</h3>
            <p class="text_muted">${completedSubtasks} of ${totalSubtasks} completed</p>
        </div>

        <div class="progress_texts_container progress_detail_text">
            <p class="text_muted">Progress</p>
            <h4 class="progress_percentage">${task.progressPercentage}%</h4>
        </div>

        <div class="progress_bar detail_progress_bar" aria-label="Task progress">
            <div
                class="progress_fill"
                style="width: ${task.progressPercentage}%; background: ${status.color};"
            ></div>
        </div>

        <div class="subtask_container">
            <div class="detail_section_header">
                <h3>Subtasks</h3>
                <p class="text_muted">${completedSubtasks}/${totalSubtasks}</p>
            </div>

            <ul class="subtask_list">
                ${renderSubtasks(task)}
            </ul>

            <div class="add_subtask_row">
                <input
                    type="text"
                    class="subtask_input"
                    placeholder="Add a new subtask..."
                    aria-label="Add a new subtask"
                >
                <button class="add_subtask_btn" type="button" aria-label="Add subtask">+</button>
            </div>
        </div>
    `;
}

function renderEditTaskForm(taskId) {
    const task = getTaskById(taskId);
    if (!task) return;

    taskDetailsModal.classList.add("editing");

    taskDetailsContainer.innerHTML = `
        <form class="edit_task_form">
            <div class="edit_field">
                <label for="edit_course_name">Course Name</label>
                <input
                    id="edit_course_name"
                    name="courseName"
                    type="text"
                    value="${escapeHTML(task.courseName)}"
                    required
                >
            </div>

            <div class="edit_field">
                <label for="edit_task_title">Task Title</label>
                <input
                    id="edit_task_title"
                    name="taskTitle"
                    type="text"
                    value="${escapeHTML(task.taskTitle)}"
                    required
                >
            </div>

            <div class="edit_field">
                <label for="edit_task_date">Deadline</label>
                <input
                    id="edit_task_date"
                    name="taskDate"
                    type="date"
                    value="${escapeHTML(task.taskDate)}"
                    required
                >
            </div>

            <div class="edit_field">
                <label for="edit_task_type">Task Type</label>
                <select id="edit_task_type" name="taskType" required>
                    <option value="individual" ${getTaskType(task) === "individual" ? "selected" : ""}>Individual</option>
                    <option value="group" ${getTaskType(task) === "group" ? "selected" : ""}>Group</option>
                </select>
            </div>

            <div class="edit_action_row">
                <button class="cancel_edit_btn" type="button">Cancel</button>
                <button class="save_edit_btn" type="submit">Save Changes</button>
            </div>

            <div class="edit_subtasks_section">
                <h3>Subtasks</h3>

                <ul class="edit_subtask_list">
                    ${renderEditSubtasks(task)}
                </ul>

                <div class="add_subtask_row">
                    <input
                        type="text"
                        class="edit_new_subtask_input"
                        placeholder="Add a new subtask..."
                        aria-label="Add a new subtask"
                    >
                    <button class="add_edit_subtask_btn" type="button" aria-label="Add subtask">+</button>
                </div>
            </div>
        </form>
    `;
}

function renderSubtasks(task) {
    if (task.subtasks.length === 0) {
        return `
            <li class="paragraph_if_no_subtask">
                No subtasks yet - break this task into smaller steps.
            </li>
        `;
    }

    return task.subtasks.map((subtask, index) => `
        <li class="subtask_item ${subtask.completed ? "checked" : ""}">
            <button
                class="subtask_checkbox"
                type="button"
                data-index="${index}"
                aria-label="Toggle subtask"
                aria-pressed="${subtask.completed}"
            ></button>
            <span>${escapeHTML(subtask.text)}</span>
        </li>
    `).join("");
}

function renderEditSubtasks(task) {
    return task.subtasks.map((subtask) => getEditSubtaskMarkup(subtask.text, subtask.completed)).join("");
}

function getEditSubtaskMarkup(text = "", completed = false) {
    return `
        <li class="edit_subtask_item">
            <input
                class="edit_subtask_checkbox"
                type="checkbox"
                ${completed ? "checked" : ""}
                aria-label="Mark subtask complete"
            >
            <input
                class="edit_subtask_text"
                type="text"
                value="${escapeHTML(text)}"
                placeholder="Subtask name"
                required
            >
            <button class="delete_edit_subtask_btn" type="button" aria-label="Delete subtask">&times;</button>
        </li>
    `;
}

function addEditSubtaskRow() {
    const input = taskDetailsContainer.querySelector(".edit_new_subtask_input");
    const subtaskList = taskDetailsContainer.querySelector(".edit_subtask_list");
    if (!input || !subtaskList) return;

    const subtaskText = input.value.trim();

    if (subtaskText === "") {
        input.focus();
        return;
    }

    subtaskList.insertAdjacentHTML("beforeend", getEditSubtaskMarkup(subtaskText, false));
    input.value = "";
    input.focus();
}

function saveEditedTask(form) {
    const task = getTaskById(activeTaskId);
    if (!task) return;

    const formData = new FormData(form);
    const editedSubtasks = [...form.querySelectorAll(".edit_subtask_item")]
        .map((item) => ({
            text: item.querySelector(".edit_subtask_text").value.trim(),
            completed: item.querySelector(".edit_subtask_checkbox").checked
        }))
        .filter((subtask) => subtask.text !== "");

    task.courseName = formData.get("courseName").trim();
    task.taskTitle = formData.get("taskTitle").trim();
    task.taskDate = formData.get("taskDate");
    task.taskType = formData.get("taskType");
    task.subtasks = editedSubtasks;

    updateTaskProgress(task);
    saveTasks();
    renderDashboard();
    renderTaskDetails(task.id);
}

function deleteActiveTask() {
    const task = getTaskById(activeTaskId);
    if (!task) return;

    const shouldDelete = window.confirm(`Delete "${task.taskTitle}"? This cannot be undone.`);
    if (!shouldDelete) return;

    tasks = tasks.filter((savedTask) => savedTask.id !== activeTaskId);
    saveTasks();
    closeTaskDetailsModal();
    renderDashboard();
}

function addSubtask() {
    const task = getTaskById(activeTaskId);
    const input = taskDetailsContainer.querySelector(".subtask_input");
    if (!input) return;

    const subtaskText = input.value.trim();

    if (!task || subtaskText === "") {
        input.focus();
        return;
    }

    task.subtasks.push({
        text: subtaskText,
        completed: false
    });

    updateTaskProgress(task);
    saveTasks();
    renderDashboard();
    renderTaskDetails(task.id);
}

function toggleSubtask(subtaskIndex) {
    const task = getTaskById(activeTaskId);
    if (!task || !task.subtasks[subtaskIndex]) return;

    task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;
    updateTaskProgress(task);
    saveTasks();
    renderDashboard();
    renderTaskDetails(task.id);
}

function updateTaskProgress(task) {
    if (task.subtasks.length === 0) {
        task.progressPercentage = 0;
        task.taskStatus = isTaskOverdue(task) ? "Late" : "In Progress";
        return;
    }

    const completedSubtasks = countCompletedSubtasks(task);

    task.progressPercentage = Math.round((completedSubtasks / task.subtasks.length) * 100);
    if (task.progressPercentage === 100) {
        task.taskStatus = "Completed";
        return;
    }

    task.taskStatus = isTaskOverdue(task) ? "Late" : "In Progress";
}

function countCompletedSubtasks(task) {
    return task.subtasks.filter((subtask) => subtask.completed).length;
}

function renderSummary() {
    const totalTasksValue = document.querySelector(".total_tasks_value");
    const completedTasksValue = document.querySelector(".completed_tasks_value");
    const inProgressTasksValue = document.querySelector(".pending_tasks_value");
    const lateTasksValue = document.querySelector(".late_tasks_value");

    totalTasksValue.textContent = tasks.length;
    completedTasksValue.textContent = countTasksByStatus("Completed");
    inProgressTasksValue.textContent = countTasksByStatus("In Progress");
    lateTasksValue.textContent = countTasksByStatus("Late");
}

function countTasksByStatus(status) {
    return tasks.filter((task) => task.taskStatus === status).length;
}

function refreshTaskStatuses() {
    let hasChanges = false;

    tasks.forEach((task) => {
        const previousStatus = task.taskStatus;
        const previousProgress = task.progressPercentage;
        updateTaskProgress(task);

        if (task.taskStatus !== previousStatus || task.progressPercentage !== previousProgress) {
            hasChanges = true;
        }
    });

    if (hasChanges) {
        saveTasks();
    }
}

function renderOverallProgress() {
    const progressCircle = document.querySelector(".overall_progress");

    if (tasks.length === 0) {
        progressCircle.dataset.progress = 0;
        progressCircle.style.setProperty("--progress", "0deg");
        return;
    }

    const totalProgress = tasks.reduce((sum, task) => sum + task.progressPercentage, 0);
    const averageProgress = Math.round(totalProgress / tasks.length);

    progressCircle.dataset.progress = averageProgress;
    progressCircle.style.setProperty("--progress", `${averageProgress * 3.6}deg`);
}

function setupFilterButtons() {
    document.querySelectorAll(".filter_card").forEach((filterCard) => {
        filterCard.addEventListener("click", (event) => {
            const clickedButton = event.target.closest(".filter_btn");
            if (!clickedButton) return;

            event.preventDefault();
            setActiveFilterButton(filterCard, clickedButton);
            updateSelectedFilter(clickedButton);
            renderTasks();
        });
    });
}

function setActiveFilterButton(filterCard, clickedButton) {
    filterCard.querySelectorAll(".filter_btn").forEach((button) => {
        button.classList.remove("active");
    });

    clickedButton.classList.add("active");
}

function updateSelectedFilter(button) {
    if (button.dataset.filterGroup === "status") {
        selectedStatusFilter = button.dataset.filterValue;
    }

    if (button.dataset.filterGroup === "type") {
        selectedTypeFilter = button.dataset.filterValue;
    }
}

function getStatusStyle(status) {
    const styles = {
        Completed: {
            color: "#00c853",
            background: "#dcfce7",
            border: "#86efac"
        },
        Late: {
            color: "#ef4444",
            background: "#fee2e2",
            border: "#fecaca"
        },
        "In Progress": {
            color: "#2563eb",
            background: "#dbeafe",
            border: "#bfdbfe"
        }
    };

    return styles[status] || styles["In Progress"];
}

function renderStatusBadge(status) {
    const style = getStatusStyle(status);

    return `
        <p
            class="status_task_individual_task_card"
            style="background: ${style.background}; color: ${style.color}; border-color: ${style.border};"
        >
            ${status}
        </p>
    `;
}

function getDueDateInfo(dateValue) {
    const dueDate = parseLocalDate(dateValue);
    const today = getTodayAtMidnight();
    const remainingDays = Math.ceil((dueDate - today) / ONE_DAY_IN_MS);
    const formattedDate = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    }).format(dueDate);

    return {
        isOverdue: remainingDays < 0,
        shortText: formattedDate,
        longText: `${formattedDate} (${getRelativeDueText(remainingDays)})`,
        relativeText: getRelativeDueText(remainingDays)
    };
}

function getRelativeDueText(remainingDays) {
    const absoluteDays = Math.abs(remainingDays);

    if (remainingDays < 0) {
        return `${absoluteDays} ${absoluteDays === 1 ? "day" : "days"} overdue`;
    }

    if (remainingDays === 0) {
        return "due today";
    }

    return `${remainingDays} ${remainingDays === 1 ? "day" : "days"} left`;
}

function parseLocalDate(dateValue) {
    const [year, month, day] = dateValue.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function isTaskOverdue(task) {
    const dueDate = parseLocalDate(task.taskDate);
    return dueDate < getTodayAtMidnight();
}

function getTaskType(task) {
    return task.taskType || "individual";
}

function getTodayAtMidnight() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
