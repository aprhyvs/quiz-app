document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");
    const responseMessage = document.getElementById("responseMessage");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Create FormData object from form fields
        const formData = new FormData(form);

        try {
            const response = await fetch("/api/login/student", {  // Adjust endpoint if needed
                method: "POST",
                headers: {
                    "X-CSRFToken": csrf_token, // CSRF token for Django
                },
                body: formData,  // Directly send FormData
            });

            const data = await response.json();

            if (response.ok) {
                responseMessage.textContent = "Login successful!";
                responseMessage.style.color = "green";
                window.location.href = studentDashboardUrl; // Redirect to dashboard
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

    document.querySelector(".signup").addEventListener("click", async function (event) { 
        window.location.href="/register-student";
    });

});