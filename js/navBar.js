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

const navAuthBtns = document.querySelectorAll(".nav_auth_btn");

const user = JSON.parse(localStorage.getItem("user"));

if (user) {

    navAuthBtns.forEach(btn => {
        btn.classList.add("hidden");
    });

}