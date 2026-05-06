const menu = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menu.addEventListener("click", () => {
    navLinks.classList.toggle("active");

    if (navLinks.classList.contains("active")) {
        menu.textContent = "✕";
    } else {
        menu.textContent = "☰";
    }
});