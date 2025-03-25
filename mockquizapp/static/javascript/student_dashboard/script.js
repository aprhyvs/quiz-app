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

            displayStudentData(studentData)
            displayStudentStats(studentStats);

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    // Display Student Data in Dashboard
    function displayStudentData(studentData) {
        const studentNameDiv = document.querySelector(".total-quizzes-taken");
        studentNameDiv.innerHTML = `<h3>Welcome, ${studentData.username}!</h3>`;


     
    }
    
    function displayStudentStats(studentStats) {
        const quizzesTakenDiv = document.querySelector(".total-quizzes-taken");
        quizzesTakenDiv.innerHTML = `<h3>Total Quizzes Taken</h3>
                    <p class="total-quizzes-taken-number">${studentStats.total_quizzes}</p>`;

    }

    // Load Student Data
    fetchAllStudentData();
});