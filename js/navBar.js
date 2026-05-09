const menu = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

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

try {
    user = JSON.parse(localStorage.getItem("user"));
} catch (error) {
    localStorage.removeItem("user");
}

if (user) {
    navAuthBtns.forEach((btn) => {
        btn.classList.add("hidden");
    });
}
