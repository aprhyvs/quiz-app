

document.addEventListener('DOMContentLoaded', async function () {

    const studentID = sessionStorage.getItem('studentID');
    
    if (studentID) {
        res = await getDataFromUrlWithParams(`/api/admin/get/studentdata`,{
            'student_id': studentID
        });

        document.getElementById("title-nav").textContent = `Student Analytics: ${res?.username ?? "N/A"}`;
    }


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

});