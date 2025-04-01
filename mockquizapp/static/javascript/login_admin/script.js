document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm"); 

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Create FormData object from form fields
        const formData = new FormData(form);

        try {
            const response = await fetch("/api/login/admin", {  // Adjust endpoint if needed
                method: "POST",
                headers: {
                    "X-CSRFToken": csrf_token, // CSRF token for Django
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                // responseMessage.textContent = "Login successful!";
                // responseMessage.style.color = "var(--green)";
                window.location.href = adminDashboardUrl;
                form.reset();
            } else {
                // responseMessage.textContent = data.error || "Login failed!";
                // responseMessage.style.color = "var(--red)";
            }
        } catch (error) {
            // responseMessage.textContent = "An error occurred. Please try again.";
            // responseMessage.style.color = "var(--red)";
        }
    });

    // Function to get CSRF token from Django
});