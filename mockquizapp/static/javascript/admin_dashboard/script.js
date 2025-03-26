
var selected_student = null;

async function displayListOfStudents(){
    const students = await getDataFromUrl('/api/admin/students');
    if (students){
        const lis_of_user_tag = document.querySelector(".list-of-users");
        for (const studentID in students) {
            if (students.hasOwnProperty(studentID)) {
                const student = students[studentID];
                lis_of_user_tag.insertAdjacentHTML("afterbegin",
                    `
                        <div class="user-card" id="${studentID}-card">
                            <svg  viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M26 0C11.648 0 0 11.648 0 26C0 40.352 11.648 52 26 52C40.352 52 52 40.352 52 26C52 11.648 40.352 0 26 0ZM26 7.8C30.316 7.8 33.8 11.284 33.8 15.6C33.8 19.916 30.316 23.4 26 23.4C21.684 23.4 18.2 19.916 18.2 15.6C18.2 11.284 21.684 7.8 26 7.8ZM26 44.72C19.5 44.72 13.754 41.392 10.4 36.348C10.478 31.174 20.8 28.34 26 28.34C31.174 28.34 41.522 31.174 41.6 36.348C38.246 41.392 32.5 44.72 26 44.72Z" fill="#0F0A0A"/>
                            </svg>
                            <h3 class="roboto-bold">${student?.username}</h3>
                            <h6 class="roboto-light">${student?.fname} ${student?.mname} ${student?.lname}</h6>
                            <h6 class="roboto-light">${student?.created_at}</h6>
                            <div class="buttons-container">
                                <button class="roboto-bold" id="visit-button-${studentID}">VISIT</button> 
                                <button class="roboto-bold" id="edit-button-${studentID}">EDIT</button>
                                <button class="roboto-bold" id="delete-button-${studentID}">DELETE</button>
                            </div>
                        </div>
                    `
                );
                document.getElementById(`visit-button-${studentID}`).addEventListener('click', () => {
                    sessionStorage.setItem('studentID', studentID);
                    window.location.href = `/student_analytics`;
                });
                document.getElementById(`edit-button-${studentID}`).addEventListener('click', () => {
                    sessionStorage.setItem('studentID', studentID);
                    window.location.href = `/edit_student`;
                });
                document.getElementById(`delete-button-${studentID}`).addEventListener('click', () => {
                    selected_student = student;
                    document.getElementById("delete-form-pop").style.display = "flex";
                });
            }
        }


    }
}


async function setupAdminChartBar(monthlyChart){

    let values = [12, 19, 3, 5, 2, 3, 20, 12, 19, 3, 5, 2]
    
    const res = await getDataFromUrlWithParams('/api/admin/get/stats', {
        'statRequest' : '4'
    })

    if (res?.monthly_quizes_taken?.length > 0){ 
        // values = res.monthly_quizes_taken 
    }

    new Chart(monthlyChart, {
        type: 'bar',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            datasets: [{
                label: '# of Quizes Taken',
                data: values,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
}

async function displayStudentList(studentList) {
    
}

document.addEventListener("DOMContentLoaded", function () {
    const monthlyChart = document.getElementById("monthly-chart");
    setupAdminChartBar(monthlyChart);
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

    getDataFromUrl("/api/admin/students") //Gets all Students
    .then(studentList => {
        if (!studentList) {
            console.error("Waran Sulod!!!", data);
            return;
        }
        displayStudentList(studentList);
    })




    document.getElementById("cancel-delete-but").addEventListener('click', function(){
        document.getElementById("delete-form-pop").style.display = "none";
    })

    document.getElementById("delete-but").addEventListener('click', async function(){
        if (!selected_student){
            return;
        }
        document.getElementById("delete-but").disabled = true;
        const res = await getDataFromUrlWithParams('/api/admin/delete/student' , {
            'student_id' : selected_student.id
        });
        if (res){
            document.getElementById("success-text").textContent =  `You have successfully deleted ${selected_student?.username}`;
            document.getElementById("success-form-pop").style.display = "flex";
            document.getElementById(`${selected_student.id}-card`).remove();
            selected_student = null;
        }
        document.getElementById("delete-but").disabled = false;
    })


});