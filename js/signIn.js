const form = document.querySelector(".signin_form");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.querySelector(
        'input[name="email"]'
    ).value.trim();

    const password = document.querySelector(
        'input[name="password"]'
    ).value;

    try {

        const response = await fetch(
            "http://localhost:3000/signin",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        alert(data.message);

        if (response.ok) {

            // Save the basic user info so other pages know someone is signed in.
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            window.location.href =
                "../html/dashboard.html";
        }

    } catch (error) {

        console.log(error);
        alert("Could not connect to the server. Make sure the backend is running.");

    }

});
