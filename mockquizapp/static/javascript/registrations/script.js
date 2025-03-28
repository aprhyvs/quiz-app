const edit_form_pop = document.getElementById("edit-form-pop");
const error_pop_up = document.getElementById("error-form-pop");
const error_pop_up_text = document.getElementById("error-text");
const success_pop_up = document.getElementById("success-form-pop");
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registerForm");

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

            if (response.ok) { // if successful...
                success_pop_up.style.display = "flex";
                
            } else { // If the server returns an error related to form data...
                edit_form_pop.style.display = "none";
                
                let errorPopUpText = "Generic Error";
                if (data.error == "Gmail already exists") {
                    errorPopUpText = "Invalid Email Address";
                }
                if (data.error == "Username already exists") {
                    errorPopUpText = "Invalid Username";
                }
                error_pop_up.style.display = "flex";
                error_pop_up_text.textContent = errorPopUpText;

                document.getElementById("save-but").disabled = false;
                

            
            }
        } catch (error) { // if there is an unidentified erorr...

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

document.getElementById("error-but").addEventListener("click", function () {
    error_pop_up.style.display = "none";
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

    // Trigger the form submit event
    const form = document.querySelector("#registerForm");  // Replace with the actual form ID
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    
    // Close the confirmation popup
    edit_form_pop.style.display = "none";
    

    
}
)

// success modal

document.getElementById("success-but").addEventListener('click', function(){
    document.getElementById("success-form-pop").style.display = "none";
    window.location.href = "../login";
});