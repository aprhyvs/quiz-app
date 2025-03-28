document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");
    const usernameField = document.getElementById("username");
    const passwordField = document.getElementById("password");
    const responseMessage = document.getElementById("responseMessage");
    const errorText1 = document.getElementById("errorText1");
    const errorText2 = document.getElementById("errorText2");
    const errorIcon1 = document.getElementById("errorIcon1");
    const errorIcon2 = document.getElementById("errorIcon2");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Reset previous errors
        responseMessage.style.display = "none";
        errorText1.textContent = ""; 
        errorIcon1.style.display = "none";
        errorText2.textContent = ""; 
        errorIcon2.style.display = "none";
        usernameField.classList.remove("error");
        passwordField.classList.remove("error");

        // Create FormData object
        const formData = new FormData(form);

        try {
            const response = await fetch("/api/login/student", {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrf_token, // CSRF token for Django
                },
                body: formData,
            });
            
            const data = await response.json();

            if (response.ok) {
                // Hide error messages and reset styling on success
                responseMessage.style.display = "none";
                errorIcon1.style.display = "none";
                errorIcon2.style.display = "none";
                usernameField.classList.remove("error");
                passwordField.classList.remove("error");
                window.location.href = data.url;
                form.reset();
            } else {
                // Show error message
                responseMessage.style.display = "flex";
                // Show SVG for any error
               

                // Check which field to highlight
                if (data.error === "Enter a valid username") {
                    errorText1.textContent = data.error; //span
                    errorIcon1.style.display = "inline";
                    usernameField.classList.add("error"); // Red border for 
                }
                if (data.error === "Enter password") {
                    errorText2.textContent = data.error; 
                    errorIcon2.style.display = "inline";
                    passwordField.classList.add("error"); // Red border for password
                }
                if (data.error === "Invalid Username") {
                    errorText1.textContent = "Invalid username"; 
                    errorIcon1.style.display = "inline";
                    usernameField.classList.add("error");
                }
                if (data.error === "Invalid Password") {
                    errorText2.textContent = "Invalid Password"; 
                    errorIcon2.style.display = "inline";
                    passwordField.classList.add("error");
                }
            }
        } catch (error) {
            errorText.textContent = "An error occurred. Please try again.";
            responseMessage.style.display = "flex";
            errorIcon.style.display = "inline";
            usernameField.classList.add("error");
            passwordField.classList.add("error");
        }
    });

    document.querySelector(".signup").addEventListener("click", async function (event) { 
        window.location.href="/register-student";
    });

});