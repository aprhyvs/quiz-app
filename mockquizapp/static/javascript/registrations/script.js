const edit_form_pop = document.getElementById("edit-form-pop");

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
                    "X-CSRFToken": csrf_token, // CSRF token for Django
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
});

document.getElementById("register").addEventListener("click", async function (event){ 
    event.preventDefault();
    // Check if the input is valid
    if (!fname.value ||!mname.value ||!lname.value ||!gmail.value ||!school.value ||!address.value ||!phone.value ||!username.value ) {
        alert("Please fill in all the required fields"); 
        return;
    }
    document.getElementById("edit-text").textContent = `Is all of the information correct?`;
    edit_form_pop.style.display = "flex";
});

document.getElementById("cancel-save-but").addEventListener("click", function () {
    edit_form_pop.style.display = "none";
});

document.getElementById("save-but").addEventListener("click", async function (){
    if (document.getElementById("save-but").disabled) return;
    document.getElementById("save-but").disabled = true;
    
    // Check if the input is valid
    if (!fname.value ||!mname.value ||!lname.value ||!gmail.value ||!school.value ||!address.value ||!phone.value ||!username.value) {
        alert("Please fill in all the required fields");
        document.getElementById("save-but").disabled = false;
        return;
    }
}
)

// success modal

document.getElementById("success-but").addEventListener('click', function(){
    document.getElementById("success-form-pop").style.display = "none";
    window.location.href = "../login";
});