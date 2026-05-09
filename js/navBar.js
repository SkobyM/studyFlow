const menu = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

// This file is shared, so check first in case a page has no navbar.
if (menu && navLinks) {
    menu.addEventListener("click", () => {
        navLinks.classList.toggle("active");

        if (navLinks.classList.contains("active")) {
            menu.textContent = "\u2715";
        } else {
            menu.textContent = "\u2630";
        }
    });
}

const navAuthBtns = document.querySelectorAll(".nav_auth_btn");

let user = null;

// Bad localStorage data can break JSON.parse, so clear it and continue.
try {
    user = JSON.parse(localStorage.getItem("user"));
} catch (error) {
    localStorage.removeItem("user");
}

// Logged-in users should not keep seeing Sign In in the navbar.
if (user) {
    navAuthBtns.forEach((btn) => {
        btn.classList.add("hidden");
    });
}
