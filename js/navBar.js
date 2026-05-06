const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {
    menuButton.addEventListener("click", toggleMenu);
}

function toggleMenu() {
    navLinks.classList.toggle("active");

    if (navLinks.classList.contains("active")) {
        menuButton.innerHTML = "&times;";
        menuButton.setAttribute("aria-expanded", "true");
        menuButton.setAttribute("aria-label", "Close menu");
    } else {
        closeMenu();
    }
}

function closeMenu() {
    navLinks.classList.remove("active");
    menuButton.innerHTML = "&#9776;";
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
}
