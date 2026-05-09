const contactForm = document.querySelector(".contact_form");
const contactMessage = document.querySelector(".contact_form_message");

contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const contactData = {
        first_name: String(formData.get("first_name") || "").trim(),
        last_name: String(formData.get("last_name") || "").trim(),
        gender: String(formData.get("gender") || ""),
        mobile: String(formData.get("mobile_number") || "").trim(),
        date_of_birth: String(formData.get("date_of_birth") || ""),
        email: String(formData.get("email") || "").trim(),
        language: String(formData.get("language") || ""),
        message: String(formData.get("message") || "").trim()
    };

    const validationMessage = validateContactData(contactData);

    if (validationMessage) {
        showContactMessage(validationMessage, true);
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(contactData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        contactForm.reset();
        showContactMessage(data.message || "Message sent successfully.", false);
    } catch (error) {
        showContactMessage(error.message || "Could not send message.", true);
    }
});

function validateContactData(data) {
    if (!hasLength(data.first_name, 2, 40)) {
        return "First name must be 2-40 characters.";
    }

    if (!hasLength(data.last_name, 2, 40)) {
        return "Last name must be 2-40 characters.";
    }

    if (!["male", "female"].includes(data.gender)) {
        return "Please select a valid gender.";
    }

    if (!/^05[0-9]{8}$/.test(data.mobile)) {
        return "Mobile number must start with 05 and contain 10 digits.";
    }

    if (!isPastDate(data.date_of_birth)) {
        return "Please enter a valid date of birth.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.email.length > 120) {
        return "Please enter a valid email address.";
    }

    if (!["Arabic", "English", "French"].includes(data.language)) {
        return "Please select a valid language.";
    }

    if (!hasLength(data.message, 10, 1000)) {
        return "Message must be 10-1000 characters.";
    }

    return "";
}

function hasLength(value, min, max) {
    return value.length >= min && value.length <= max;
}

function isPastDate(dateValue) {
    const date = new Date(dateValue);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    return !Number.isNaN(date.getTime()) && date < today;
}

function showContactMessage(message, isError) {
    contactMessage.textContent = message;
    contactMessage.classList.toggle("error", isError);
    contactMessage.classList.toggle("success", !isError);
}
