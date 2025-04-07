document.addEventListener("DOMContentLoaded", function () { 
    const edit_form_pop = document.getElementById("edit-form-pop");
    const formtag = document.getElementById("loginForm");

    document.getElementById("understand-but").addEventListener("click", async function (event) {
        event.preventDefault(); 
        edit_form_pop.style.display = "none"; 
    });

    formtag.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Create FormData object from form fields
        const formData = new FormData(formtag);

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
                formtag.reset();
            } else {
                // responseMessage.textContent = data.error || "Login failed!";
                // responseMessage.style.color = "var(--red)";
                document.getElementById("edit-text").textContent = `The username or password is incorrect.`;
                edit_form_pop.style.display = "flex";
            }
        } catch (error) {
            // responseMessage.textContent = "An error occurred. Please try again.";
            // responseMessage.style.color = "var(--red)";
            document.getElementById("edit-text").textContent = `An error occurred. Please try again.`;
            edit_form_pop.style.display = "flex";

        }
    });

    // Function to get CSRF token from Django

});