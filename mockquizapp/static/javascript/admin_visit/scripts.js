

document.addEventListener('DOMContentLoaded', async function () {

    const studentID = sessionStorage.getItem('studentID');
    if (studentID) {
        res = await getDataFromUrlWithParams(`/api/admin/get/studentgetalldata`,{
            'student_id': studentID
        });
        const studentDatas = res;
        if (studentDatas) {
            initiateStudentDatas(studentDatas);
        }

        res2 = await getDataFromUrlWithParams(`/api/admin/get/studentgetallquizzes`,{
            'student_id': studentID
        });
        const studentQuizzes = res2;
        if (studentDatas) {
            console.log(studentDatas);
            initiateStudentQuizzes(studentQuizzes);
        }
    }
    function initiateStudentDatas(studentDatas){
        
        const studentData = studentDatas.studentData;
        const studentStats = studentDatas.stats;
        console.log(studentDatas)
        displayStudentData(studentData);
        displayStudentStats(studentStats);
    }

    function initiateStudentQuizzes(studentQuizzes){
        const quizData = studentQuizzes;
        console.log(quizData)
        displayMostRecentQuiz(quizData.quizzes[0]);
        displayPassedAndFailedQuizzes(quizData.quizzes);
        showAnswersGraph(quizData.quizzes);
        showQuizzesTakenGraph(quizData.quizzes); 
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


    function displayStudentData(studentData) {
        document.getElementById("title-nav").textContent = `Student Analytics: ${studentData?.username ?? "N/A"}`; // Set the text on the navbar
    }
    
    function displayStudentStats(studentStats) {
        function getPercentage(score, totalItems){
            if (!score) return 0;
            return Math.round((score / totalItems) * 100);
        }

        const quizzesTakenDiv = document.querySelector(".total-quizzes-taken-number");
        quizzesTakenDiv.innerText = `${studentStats.total_quizzes}`;
        

        const totalItems = studentStats.total_correct_answers + studentStats.total_wrong_answers;

        const correctAnswersPercentage = document.querySelector(".total-correct-answers-percentage");
        const correctAnswersNumber = document.querySelector(".total-correct-answers-number");
        const correctAnswerPercentage = getPercentage(studentStats.total_correct_answers, totalItems);
        correctAnswersPercentage.innerText = `${correctAnswerPercentage}%`;
        correctAnswersNumber.innerText = `${studentStats.total_correct_answers}`;


        const wrongAnswersPercentage = document.querySelector(".total-wrong-answers-percentage");
        const wrongAnswersNumber = document.querySelector(".total-wrong-answers-number");
        const wrongAnswerPercentage = getPercentage(studentStats.total_wrong_answers, totalItems);
        wrongAnswersPercentage.innerText = `${wrongAnswerPercentage}%`;
        wrongAnswersNumber.innerText = `${studentStats.total_wrong_answers}`;
        
        
    }

    function displayMostRecentQuiz(mostRecentQuiz) {
        if (!mostRecentQuiz) {
            console.log("No more quiz yet");
            let statusText = "NONE";
            const statusElement = document.getElementById("quiz-status");
            const statusParent = document.querySelector(".quiz-status-parent")
            const testOptionsButton = document.getElementById("view-quiz-button");

            statusParent.innerHTML = `<p class="raleway-bold id="quiz-status" style="color: var(--text);">${statusText}</p>`;
            statusElement.innerText = statusText;
            statusParent.style.color = "var(--text)";
            testOptionsButton.style.display = "none";
            testOptionsButton.addEventListener("click", function (event) {
                
            });
            return;
        }

        // Display the quiz title
        document.querySelector(".quiz-title").innerText = mostRecentQuiz.quiz_title;

        isAnswered = mostRecentQuiz.is_answered;

        // Display number of correct answers
        const totalItems = mostRecentQuiz.number_of_correct + mostRecentQuiz.number_of_wrong;
        document.querySelector(".score-set").innerText = `${mostRecentQuiz.number_of_correct} / ${20}`;
    
        
        
        
        const passingScore = Math.ceil(totalItems* 0.75);
        const statusElement = document.getElementById("quiz-status");
        let statusText = "UNKNOWN";

        const testOptionsButton = document.getElementById("view-quiz-button");

        if (isAnswered == false){ // Determine if the student has not finished the quiz.
            statusText = "INCOMPLETE"
            statusElement.innerText = statusText;
            statusElement.style.color === "var(--text)";
            // testOptionsButton.innerText = "Resume";
            
        } else { // Determine if the student passed (assuming 75% passing rate)
            statusText = mostRecentQuiz.number_of_correct >= passingScore ? "PASSED" : "FAILED";
            statusElement.innerText = statusText;
            statusElement.style.color = statusText === "PASSED" ? "var(--green)" : "var(--red)";
            // testOptionsButton.innerText = "View";
        }


        //  Update "View" button with a link to view more quiz info
        
        testOptionsButton.addEventListener("click", function (event) {
                
        });
    }

    function displayPassedAndFailedQuizzes(quizzes) {

        function getPassedStatus(quiz){
            if (quiz.is_answered == false) return null;

            const totalItems = quiz.number_of_correct + quiz.number_of_wrong;
            const passingScore = Math.ceil(totalItems * 0.75);
            if (quiz.number_of_correct > passingScore) {
                passedQuizzes++;
            } else {
                failedQuizzes++;
            }
        }

        // Display passed and failed quizzes in the dashboard
        const passedQuizzesDiv = document.querySelector(".passed-quizzes-number");
        const failedQuizzesDiv = document.querySelector(".failed-quizzes-number");
        let failedQuizzes = 0;
        let passedQuizzes = 0;

        for (let i = 0; i < quizzes.length; i++) {
            const quiz = quizzes[i];
            getPassedStatus(quiz)
        }

        passedQuizzesDiv.innerText = passedQuizzes;
        failedQuizzesDiv.innerText = failedQuizzes;

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