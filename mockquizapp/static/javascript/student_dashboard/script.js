document.addEventListener("DOMContentLoaded", function () {
    console.log("Student Dashboard Loaded");

    getDataFromUrl("/api/student/alldata") //Gets all Student's data and stats
    .then(data => {
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

    getDataFromUrl("/api/student/quizzes") // Gets all quizzes
    .then(quizData => {
        console.log(quizData);
        if (!quizData) {
            console.error("Invalid data structure:", quizData);
            return;
        }
        displayMostRecentQuiz(quizData);
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

    function displayMostRecentQuiz(){


    }
});

// graph below
// monthly correct and wrong answers
document.addEventListener("DOMContentLoaded", function () {
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Correct Answers',
                data: [65, 59, 80, 81, 56, 55, 48, 81, 56, 55, 44, 50],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
            {
                label: 'Wrong Answers',
                data: [45, 72, 60, 90, 66, 40, 70, 95, 50, 60, 38, 55],
                fill: false,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }
        ]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    const ctx = document.getElementById('monthlyChart').getContext('2d');
    new Chart(ctx, config);
});

// total quizzes taken per month

document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById("quizzesChart").getContext("2d");

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = {
        labels: labels,
        datasets: [{
            label: 'Quizzes Taken',
            data: [65, 59, 80, 81, 56, 55, 40, 81, 56, 55, 40, 65],
            backgroundColor: 'rgba(54, 162, 235, 0.5)', // Blue bars
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1
        }]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false, // Prevent unwanted stretching
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    new Chart(ctx, config);
});
