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
const userNameNavBar = document.querySelector(".user_name");
const navbar = document.querySelector(".navbar");
const logoutBtn = document.querySelector(".logout_button");

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

    if (userNameNavBar) {
        userNameNavBar.style.display = "block";
        userNameNavBar.textContent = user.full_name || user.name || user.email || "User";
    }
    if (logoutBtn) {
        logoutBtn.style.display = "block";
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("user");
            window.location.href = "../index.html";
        });
    }
}

if (navbar) {
    navbar.classList.add("auth-ready");
}
