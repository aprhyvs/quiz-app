document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registerForm");
    const responseMessage = document.getElementById("responseMessage");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Create FormData object from form fields
        const formData = new FormData(form);

        try {
            const response = await fetch("/api/register/student", {  // Adjust endpoint if needed
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFToken(), // CSRF token for Django
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                responseMessage.textContent = "Registration successful! Redirecting to Login Page...";
                responseMessage.style.color = "green";

                setTimeout(function() {
                    window.location.href = studentLoginUrl;
                }, 2000); // Delay in milliseconds (2000ms = 2 seconds)
                form.reset();
            } else {
                responseMessage.textContent = data.error || "Registration failed!";
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