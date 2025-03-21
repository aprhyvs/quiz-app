document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");
    const responseMessage = document.getElementById("responseMessage");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Create FormData object from form fields
        const formData = new FormData(form);
        const jsonData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch("/api/login/student", {  // Adjust endpoint if needed
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCSRFToken(), // CSRF token for Django
                },
                body: JSON.stringify(jsonData),
            });

            const data = await response.json();

            if (response.ok) {
                responseMessage.textContent = "Login successful!";
                responseMessage.style.color = "green";
                form.reset();
            } else {
                responseMessage.textContent = data.error || "Login failed!";
                responseMessage.style.color = "red";
            }
        } catch (error) {
            responseMessage.textContent = "An error occurred. Please try again.";
            responseMessage.style.color = "red";
        }
    });

    // Function to get CSRF token from Django
    function getCSRFToken() {
        const cookieValue = document.cookie
            .split("; ")
            .find((row) => row.startsWith("csrftoken="))
            ?.split("=")[1];
        return cookieValue || "";
    }
});