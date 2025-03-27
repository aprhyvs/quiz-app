




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



    const studentID = sessionStorage.getItem('studentID');
    if (studentID) {
        const res = await getDataFromUrlWithParams(`/api/admin/get/studentdata`,{
            'student_id': studentID
        });
        if (res) {
            fname.value = res.fname;
            mname.value = res.mname;
            lname.value = res.lname;
            gmail.value = res.gmail;
            school.value = res.school;
            address.value = res.address;
            phone.value = res.phone;
            username.value = res.username;
            password.value = "";
        }
    }


    document.getElementById("register").addEventListener("click", async function (){
        if (document.getElementById("register").disabled) return;
        document.getElementById("register").disabled = true;
        
        // Check if the input is valid
        if (!fname.value ||!mname.value ||!lname.value ||!gmail.value ||!school.value ||!address.value ||!phone.value ||!username.value ||!password.value) {
            alert("Please fill in all the required fields");
            document.getElementById("register").disabled = false;
            return;
        }

        const res = await getDataFromUrlWithParams(`/api/admin/edit/studentdata`,{
            'student_id': studentID,
            'fname': fname.value,
            'mname': mname.value,
            'lname': lname.value,
            'gmail': gmail.value,
            'school': school.value,
            'address': address.value,
            'phone': phone.value,
            'username': username.value,
            'password': password.value
        })


        
        document.getElementById("register").disabled = false;
    } );


});