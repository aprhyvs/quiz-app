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
        if (!quizData) {
            console.error("Invalid data structure:", quizData);
            return;
        }
        displayMostRecentQuiz(quizData.quizzes[0]);
        showAnswersGraph(quizData.quizzes);
        showQuizzesTakenGraph(quizData.quizzes);
    })
    .catch(error => console.error("Error fetching student data:", error));

    




    // Display Student Data in Dashboard
    function displayStudentData(studentData) {
        const studentNameDiv = document.querySelector(".student-name");
        studentNameDiv.innerHTML = `<h3 class="raleway-bold">Welcome, ${studentData.username}!</h3>`;
    }
    
    function displayStudentStats(studentStats) {
        const quizzesTakenDiv = document.querySelector(".total-quizzes-taken-number");
        quizzesTakenDiv.innerText = `${studentStats.total_quizzes}`;
        
        const correctAnswersDiv = document.querySelector(".total-correct-answers-number");
        correctAnswersDiv.innerText = `${studentStats.total_correct_answers}`;
        
        const wrongAnswersDiv = document.querySelector(".total-wrong-answers-number");
        wrongAnswersDiv.innerText = `${studentStats.total_wrong_answers}`;
        
        
    }

    function displayMostRecentQuiz(mostRecentQuiz) {
        // Display the quiz title
        document.querySelector(".quiz-title").innerText = mostRecentQuiz.quiz_title;
    
        // Display number of correct answers
        const totalScore = mostRecentQuiz.number_of_correct + mostRecentQuiz.number_of_wrong;
        document.querySelector(".score-set").innerText = `${mostRecentQuiz.number_of_correct} / ${totalScore}`;
    
        // Determine if the student passed (assuming 75% passing rate)
        
        const passingScore = Math.ceil(totalScore * 0.75);
        const statusText = mostRecentQuiz.number_of_correct >= passingScore ? "PASSED" : "FAILED";

        const statusElement = document.getElementById("quiz-status");
        statusElement.innerText = statusText;
        statusElement.style.color = statusText === "PASSED" ? "#43ACAC" : "red";


        //  Update "View" button with a link to view more quiz info
        const viewButton = document.getElementById("view-quiz-button");
        viewButton.onclick = function () {
            alert("Kople mo pre! Mabagsak ka nanaman.");
        };
    }


    function showAnswersGraph(graphData) {
        const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Initialize arrays to store correct and wrong answers per month
        const correctAnswers = new Array(12).fill(0);
        const wrongAnswers = new Array(12).fill(0);

        // Process quiz data and organize it by month
        graphData.forEach(quiz => {
        const quizMonth = new Date(quiz.created_at).getMonth(); // Get the month (0 = Jan, 11 = Dec)
        correctAnswers[quizMonth] += quiz.number_of_correct;
        wrongAnswers[quizMonth] += quiz.number_of_wrong;
    });

        const data = {
            labels: labels,
            datasets: [
                {
                    label: 'Correct Answers',
                    data: correctAnswers,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                },
                {
                    label: 'Wrong Answers',
                    data: wrongAnswers,
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
    }

    function showQuizzesTakenGraph(graphData){
        const ctx = document.getElementById("quizzesChart").getContext("2d");

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const quizzesTaken = new Array(12).fill(0);


    graphData.forEach(quiz => {
        const quizMonth = new Date(quiz.created_at).getMonth(); // Get the month (0 = Jan, 11 = Dec)
        quizzesTaken[quizMonth]++; // Increment the count for that month
    });


    const data = {
        labels: labels,
        datasets: [{
            label: 'Quizzes Taken',
            data: quizzesTaken,
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
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    };

    new Chart(ctx, config);
    }
});

// graph below
// monthly correct and wrong answers


// total quizzes taken per month

