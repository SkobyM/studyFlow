const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {
    menuButton.addEventListener("click", toggleMenu);
    navLinks.addEventListener("click", closeMenuWhenLinkIsClicked);
    document.addEventListener("keydown", closeMenuWhenEscapeIsPressed);
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

function closeMenuWhenLinkIsClicked(event) {
    if (event.target.tagName === "A") {
        closeMenu();
    }
}

function closeMenuWhenEscapeIsPressed(event) {
    if (event.key === "Escape") {
        closeMenu();
    }
}
