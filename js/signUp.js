const form = document.querySelector(".signup_form");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const full_name = document.querySelector('input[name="name"]').value.trim();

    const email = document.querySelector('input[name="email"]').value.trim();

    const password = document.querySelector('input[name="password"]').value;

    const confirmPassword = document.querySelector('input[name="confirm_password"]').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    if (password.length < 8) {
        alert("Password must be at least 8 characters");
        return;
    }

    try {

        const response = await fetch("http://localhost:3000/signup", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                full_name,
                email,
                password
            })

        });

        const data = await response.json();

        alert(data.message);

        if (response.ok) {
            window.location.href = "../html/signIn.html";
        }

    } catch (error) {

        console.log(error);
        alert("Could not connect to the server. Make sure the backend is running.");

    }

});
