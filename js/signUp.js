const form = document.querySelector(".signup_form");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const full_name = document.querySelector('input[name="name"]').value;

    const email = document.querySelector('input[name="email"]').value;

    const password = document.querySelector('input[name="password"]').value;

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

    }

});