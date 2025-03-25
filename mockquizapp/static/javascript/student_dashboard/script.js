document.addEventListener("DOMContentLoaded", function () {
    console.log("Admin Dashboard Loaded");

    // CSRF Token Retrieval
    function getCSRFToken() {
        const cookieValue = document.cookie
            .split("; ")
            .find((row) => row.startsWith("csrftoken="))
            ?.split("=")[1];
        return cookieValue || "";
    }

    // Fetch Student List (Example)
    async function fetchAllStudentData() {
        try {
            const response = await fetch("/api/student/alldata", {
                method: "GET",
                headers: {
                    "X-CSRFToken": getCSRFToken(),
                    
                },
            });

            

            if (!response.ok) 
                throw new Error("Failed to load data");
            
            const data = await response.json();
            const studentDatas = data.studentData;
            const studentData = studentDatas.studentData;
            const studentStats = studentDatas.stats;

            console.log(data);

            //displayStudentData(studentData)
            displayStudentStats(studentStats);

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    // Display Student Data in Dashboard
    function displayStudentData(studentData) {
        const contentDiv = document.querySelector(".content");
        contentDiv.innerHTML = `<h2>Student List</h2>`;
    

        





        for (const studentID in students) {
            if (students.hasOwnProperty(studentID)) {
                const student = students[studentID];
    
                // Create Bootstrap card
                const studentCard = document.createElement("div");
                studentCard.classList.add("card", "mb-3"); // Adds margin-bottom for spacing
                studentCard.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">${student.fname} ${student.lname}</h5>
                        <p class="card-text">School: ${student.school}</p>
                        <p class="card-text">Email: ${student.gmail}</p>
                        <p class="card-text">Phone: ${student.phone}</p>
                        <a href="#" class="btn btn-primary">Configure Student Data</a>
                    </div>
                `;
    
                contentDiv.appendChild(studentCard);
            }
        }
    }
    
    function displayStudentStats(studentStats) {
        const quizzesTakenDiv = document.querySelector(".total-quizzes-taken");
        quizzesTakenDiv.innerHTML = `<h3>Total Quizzes Taken</h3>
                    <p class="total-quizzes-taken-number">${studentStats.total_quizzes}</p>`;

    }

    // Load Student Data
    fetchAllStudentData();
});