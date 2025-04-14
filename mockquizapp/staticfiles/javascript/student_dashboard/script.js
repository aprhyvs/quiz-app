
function getAbsoluteMediaURL(relativePath) {
    return new URL(relativePath, window.location.origin).href;
}
function updateImageIcon(image){
    const profilePicDiv = document.querySelector(".profile-pic");
    const imageURL = getAbsoluteMediaURL(image);
    profilePicDiv.style.backgroundImage = `url(${imageURL})`;
}

function displayRank(stats){ //Backend already takes care of rank type (weekly/monthly). Don't worry about this.
    rankText = document.querySelector(".rank-text");
    if (stats.rank){
        rankText.innerText = `Rank ${stats.rank}`;
    }else{
        rankText.innerText = `Rank Not Available`;
     }
    
     
}



document.addEventListener("DOMContentLoaded", function () {
    //console.log("Student Dashboard Loaded");

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





    getDataFromUrl("/api/student/alldata") //Gets all Student's data and stats
    .then(data => {
        if (!data || !data.studentData) {
            console.error("Invalid data structure:", data);
            return;
        }
        const studentDatas = data.studentData;
        const studentData = studentDatas.studentData;
        const studentStats = studentDatas.stats;
        const profile_pic = getAbsoluteMediaURL(studentData.profile_pic);
        displayStudentProfileData(studentData, studentStats);
        displayStudentData(studentData);
        displayStudentStats(studentStats);
        updateImageIcon(profile_pic);
    })

    getDataFromUrl("/api/student/quizzes") // Gets all quizzes
    .then(quizData => {
        if (!quizData) {
            console.error("Invalid data structure:", quizData);
            return;
        }
        const recentQuizData = quizData?.quizzes.length > 0 ? quizData?.quizzes[0] : null;
        displayMostRecentQuiz(recentQuizData);
        displayPassedAndFailedQuizzes(quizData.quizzes);
        showAnswersGraph(quizData.quizzes);
        showQuizzesTakenGraph(quizData.quizzes);
    })
    .catch(error => console.error("Error fetching student data:", error));

    async function displayStudentProfileData(studentData, studentStats) {
        const fullName = `${studentData.fname} ${studentData.mname} ${studentData.lname}`;
        document.getElementById('profile-name').textContent = fullName; 
        document.getElementById('profile-department').textContent = studentData.school;
        document.getElementById('profile-address').textContent = studentData.address;
    
        // Calculate percentages
        function getPercentage(score, totalItems) {
            return totalItems > 0 ? Math.round((score / totalItems) * 100) : 0;
        }
    
        const totalItems = studentStats.total_correct_answers + studentStats.total_wrong_answers;
        const correctBar = document.querySelector(".correct-bar");
        const wrongBar = document.querySelector(".wrong-bar");

        if (totalItems > 0) {
            const correctAnswerPercentage = getPercentage(studentStats.total_correct_answers, totalItems);
            const wrongAnswerPercentage = getPercentage(studentStats.total_wrong_answers, totalItems);
        
            if (correctAnswerPercentage === 100) {
                // correct 100%
                correctBar.style.width = '100%';
                correctBar.textContent = '100%';
                correctBar.style.display = 'block';
        
                wrongBar.style.display = 'none';
            } else if (wrongAnswerPercentage === 100) {
                // wrong 100%
                wrongBar.style.width = '100%';
                wrongBar.textContent = '100%';
                wrongBar.style.display = 'block';
        
                correctBar.style.display = 'none';
            } else {
                // Show both bars with their respective percentages
                correctBar.style.display = 'block';
                wrongBar.style.display = 'block';
        
                correctBar.style.width = `${correctAnswerPercentage}%`;
                correctBar.textContent = `${correctAnswerPercentage}%`;
        
                wrongBar.style.width = `${wrongAnswerPercentage}%`;
                wrongBar.textContent = `${wrongAnswerPercentage}%`;
            }
        }else{
            // Hide the bar pag walang quiz stats.    
            correctBar.style.display = "none";
            wrongBar.style.display = "none";
        }
    }
    
    // Display Student Data in Dashboard
    function displayStudentData(studentData) {
        const studentNameDiv = document.querySelector(".student-name");
        studentNameDiv.innerHTML = `<h3 class="raleway-bold">Welcome, ${studentData.username}!</h3>`;
    }
    
    function displayStudentStats(studentStats) {
        function getPercentage(score, totalItems){
            if (!score) return 0;
            return Math.round((score / totalItems) * 100);
        }
        displayRank(studentStats)
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
            let statusText = "NONE";
            const statusElement = document.getElementById("recent-quiz-status");
            const statusParent = document.querySelector(".quiz-status-parent")
            const testOptionsButton = document.getElementById("view-recent-quiz-button");
            statusParent.innerHTML = `<p class="raleway-bold id="recent-quiz-status" style="color: var(--text);">${statusText}</p>`;
            statusElement.innerText = statusText;
            statusParent.style.color = "var(--text)";
            testOptionsButton.style.display = "none"; 
            return;
        }
        document.querySelector(".quiz-title").innerText = mostRecentQuiz.quiz_title;
        isAnswered = mostRecentQuiz.is_answered;
        // Display number of correct answers
        const totalItems = mostRecentQuiz.number_of_correct + mostRecentQuiz.number_of_wrong;
        document.querySelector(".score-set").innerText = `${mostRecentQuiz.number_of_correct} / 20`;
        const passingScore = Math.ceil(totalItems* 0.75);
        const statusElement = document.getElementById("recent-quiz-status");
        let statusText = "UNKNOWN";
        const testOptionsButton = document.getElementById("view-recent-quiz-button");
        if (isAnswered == false){ // Determine if the student has not finished the quiz.
            statusText = "INCOMPLETE"
            statusElement.innerText = statusText;
            statusElement.style.color === "var(--text)";
            testOptionsButton.innerText = "Resume";
        } else { // Determine if the student passed (assuming 75% passing rate)
            statusText = mostRecentQuiz.number_of_correct >= passingScore ? "PASSED" : "FAILED";
            statusElement.innerText = statusText;
            statusElement.style.color = statusText === "PASSED" ? "var(--green)" : "var(--red)";
            testOptionsButton.innerText = "View";
        }
        //  Update "View" button with a link to view more quiz info
        testOptionsButton.addEventListener("click", function (event) {

            if (isAnswered == false) {
                sessionStorage.setItem('quiz_id', mostRecentQuiz.id);
                window.location.href = `/game_quiz/`
            } else{
                sessionStorage.setItem('quiz_id', mostRecentQuiz.id);
                window.location.href = `/quiz_complete/`
            }
            
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
        // Initialize arrays to store correct and wrong answers per month
        const correctAnswers = new Array(12).fill(0);
        const wrongAnswers = new Array(12).fill(0);
        const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


        if (graphData || graphData.length > 0) { 
            // Process quiz data and organize it by month
            graphData.forEach(quiz => {
                const quizMonth = new Date(quiz.created_at).getMonth(); // Get the month (0 = Jan, 11 = Dec)
                correctAnswers[quizMonth] += quiz.number_of_correct;
                wrongAnswers[quizMonth] += quiz.number_of_wrong;
            }); 
        }



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

    if (graphData || graphData.length > 0) { 
        // Process quiz data and organize it by month
        graphData.forEach(quiz => {
            const quizMonth = new Date(quiz.created_at).getMonth(); // Get the month (0 = Jan, 11 = Dec)
            quizzesTaken[quizMonth]++; // Increment the count for that month
        });
    }


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

// upload quiz modal
