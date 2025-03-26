document.addEventListener("DOMContentLoaded", function () {
    console.log("Student Dashboard Loaded");

    getDataFromUrl("/api/student/alldata")
    .then(data => {
        console.log(data);

        if (!data || !data.studentData) {
            console.error("Invalid data structure:", data);
            return;
        }

        const studentDatas = data.studentData;
        const studentData = studentDatas.studentData;
        const studentStats = studentDatas.stats;

        displayStudentData(studentData);
        displayStudentStats(studentStats);
    })
    .catch(error => console.error("Error fetching student data:", error));

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
});