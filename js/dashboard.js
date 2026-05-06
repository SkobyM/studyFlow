filterButton();
summary_values()
progressBar()

function progressBar() {
    const progressBars = document.querySelectorAll(".overall_progress");

    progressBars.forEach(progress => {
        const value = 66; // This value should be dynamically calculated based on the tasks data
        progress.dataset.progress = value;
        progress.style.setProperty("--progress", `${value * 3.6}deg`);
    });
}

function summary_values() {
    const total_tasks_value = document.querySelector('.total_tasks_value');
    const completed_tasks_value = document.querySelector('.completed_tasks_value');
    const pending_tasks_value = document.querySelector('.pending_tasks_value');
    const late_tasks_value = document.querySelector('.late_tasks_value');

    total_tasks_value.textContent = 0;
    completed_tasks_value.textContent = 0;
    pending_tasks_value.textContent = 0;
    late_tasks_value.textContent = 0;
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