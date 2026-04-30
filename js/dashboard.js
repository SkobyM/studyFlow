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