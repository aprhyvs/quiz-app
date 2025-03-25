document.addEventListener("DOMContentLoaded", function () {
    console.log("Student Dashboard Loaded");

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
                method: "POST",
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
        const studentNameDiv = document.querySelector(".student-name");
        studentNameDiv.innerHTML = `<h3>Welcome, ${studentData.username}!</h3>`;


     
    }
    
    function displayStudentStats(studentStats) {
        const quizzesTakenDiv = document.querySelector(".total-quizzes-taken");
        quizzesTakenDiv.innerHTML = `<h3>Total Quizzes Taken</h3>
                    <p class="total-quizzes-taken-number">${studentStats.total_quizzes}</p>`;
        
        const correctAnswersDiv = document.querySelector(".total-correct-answers");
        correctAnswersDiv.innerHTML = `<h3>Total Correct Answers</h3>
                    <p class="total-correct-answers-number">${studentStats.total_correct_answers}</p>`;
        
        const wrongAnswersDiv = document.querySelector(".total-wrong-answers");
        wrongAnswersDiv.innerHTML = `<h3>Total Wrong Answers</h3>
                    <p class="total-wrong-answers-number">${studentStats.total_wrong_answers}</p>`;
        
        
    }

    // Load Student Data
    fetchAllStudentData();
});