


var res;

function checkFileType(file){
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    //console.log(fileExtension, allowedExtensions)
    if (!allowedExtensions.includes(fileExtension)) {
        console.error("Invalid file type. Only JPG, JPEG, PNG, WEBP, GIF files are allowed.");
        return false;
    }
    //console.log(fileExtension + ' is allowed')
    return true;
}

function updateImageIcon(image){
    let fileInput
    if (image) {
        fileInput = image
    } else {
        //console.log("No file dragged, using the traditional upload")
        fileInput = document.getElementById('file-input').files[0];
    }

    if (checkFileType(fileInput) == false) {
        console.error('Invalid file type: ' + fileInput.name);
        return;
    }
    const addImageDiv = document.querySelector(".add-image");
    const imageURL = URL.createObjectURL(fileInput);
    
    addImageDiv.style.backgroundImage = `url(${imageURL})`;
    document.getElementById("upload-image-button").style.display = "flex";

     // hide plus
     const plusText = document.querySelector(".plus");
     if (plusText) {
         plusText.style.display = "none"; 
     }

}

function getAbsoluteMediaURL(relativePath) {
    return new URL(relativePath, window.location.origin).href;
}

document.addEventListener("DOMContentLoaded", async function () {

    const fname = document.getElementById("fname");
    const mname = document.getElementById("mname");
    const lname = document.getElementById("lname");
    const gmail = document.getElementById("gmail");
    const school = document.getElementById("school");
    const address = document.getElementById("address");
    const phone = document.getElementById("phone");
    const username = document.getElementById("username");
    const password = document.getElementById("password"); 
    const profile_pic = document.getElementById('upload-image-button')
    const edit_form_pop = document.getElementById("edit-form-pop");

    // hide plus
    const plusText = document.querySelector(".plus");
    if (plusText) {
        plusText.style.display = "none"; 
    }
    
    const studentID = sessionStorage.getItem('studentID');
    
    if (studentID) {
        res = await getDataFromUrlWithParams(`/api/admin/get/studentdata`,{
            'student_id': studentID
        });
        if (res) {
            //console.log(res);  
            fname.value = res.fname;
            mname.value = res.mname;
            lname.value = res.lname;
            gmail.value = res.gmail;
            school.value = res.school;
            address.value = res.address;
            phone.value = res.phone;
            username.value = res.username;
            password.value = "";
            const fullURL = getAbsoluteMediaURL(res.profile_pic);
            //console.log(fullURL);
            profile_pic.style.backgroundImage = `url("${fullURL}")`;
        }
    }

    setInterval(() =>
    {
        if (!fname.value ||!mname.value ||!lname.value ||!gmail.value ||!school.value ||!address.value ||!phone.value ||!username.value ) {
            document.getElementById("register").disabled = true;
            document.getElementById("register").style.opacity = 0.5;
        } else {
            document.getElementById("register").disabled = false;
            document.getElementById("register").style.opacity = 1;
        }
    }, 100);

    

    document.getElementById("register").addEventListener("click", async function (event){ 
        event.preventDefault();
        // Check if the input is valid
        if (!fname.value ||!mname.value ||!lname.value ||!gmail.value ||!school.value ||!address.value ||!phone.value ||!username.value ) {
            alert("Please fill in all the required fields"); 
            return;
        }
        document.getElementById("edit-text").textContent = `Are you sure you want to apply changes to ${res.username}?`;
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
        const profile_picture = document.getElementById('file-input').files[0]
        const res2 = await getDataFromUrlWithParams(`/api/admin/update/student`,{
            'student_id': studentID,
            'fname': fname.value,
            'mname': mname.value,
            'lname': lname.value,
            'gmail': gmail.value,
            'school': school.value,
            'address': address.value,
            'phone': phone.value,
            'username': username.value,
            'password': password.value,
            'profile_pic': profile_picture
        })

        if (res2){
            //console.log(document.getElementById('file-input').files[0])
            document.getElementById("edit-form-pop").style.display = "none";
            document.getElementById("success-text").textContent = "Changes applied successfully";
            document.getElementById("success-form-pop").style.display = "flex";
        }


        
        document.getElementById("save-but").disabled = false;
    } );

    document.getElementById("success-but").addEventListener('click', function(){
        document.getElementById("success-form-pop").style.display = "none";
        window.location.href = "../admin_dashboard";
    });

    document.getElementById("open-logout-form").addEventListener("click", async function (event) { 
        event.preventDefault(); 
        document.getElementById("logout-form-pop").style.display = "flex"; 
    });
    document.getElementById("logout-but").addEventListener("click", async function (event) { 
        event.preventDefault(); 
        document.getElementById("logout-form-pop").style.display = "none"; 
        const res = await getDataFromUrl("/api/logout");
        if (res){   
            window.location.href = "../";
        }
    });
    document.getElementById("cancel-logout-but").addEventListener("click", async function (event) { 
        event.preventDefault();
        document.getElementById("logout-form-pop").style.display = "none"; 
    });

    document.getElementById("upload-image-button").addEventListener('click', function(){
        //console.log("Upload Image Clicked.")
        document.getElementById("file-input").click();
    });

    

});