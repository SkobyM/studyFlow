const form = document.querySelector(".signin_form");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.querySelector(
        'input[name="email"]'
    ).value;

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

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            window.location.href =
                "../html/dashboard.html";
        }

    } catch (error) {

        console.log(error);

    }

});