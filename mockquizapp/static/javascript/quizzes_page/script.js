


document.addEventListener("DOMContentLoaded", function () {
    console.log("Student Quizzes Page Loaded    ");

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
    })

    getDataFromUrl("/api/student/quizzes") // Gets all quizzes
    .then(quizzes => {
        if (!quizzes) {
            console.error("Invalid data structure:", quizData);
            return;
        }
        displayListOfQuizzes(quizzes.quizzes);
    })
    .catch(error => console.error("Error fetching quizzes", error));


    // Display Student Data in Dashboard
    /*
    function displayStudentData(studentData) {
        const studentNameDiv = document.querySelector(".student-name");
        studentNameDiv.innerHTML = `<h3 class="raleway-bold">Welcome, ${studentData.username}!</h3>`;
    }*/
    
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

    

    function displayPassedAndFailedQuizzes(quizzes) {

        function getPassedStatus(quiz){
            if (quiz.is_answered == false) return None

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


function displayListOfQuizzes(quizzes) {
    function displayMostRecentQuiz(mostRecentQuiz) {
        document.querySelector(".quiz-title").innerText = mostRecentQuiz.quiz_title;
        isAnswered = mostRecentQuiz.is_answered;
        
        // Display number of correct answers
        const totalItems = mostRecentQuiz.number_of_correct + mostRecentQuiz.number_of_wrong;
        document.querySelector(".score-set").innerText = `${mostRecentQuiz.number_of_correct} / 20`;
        
        const passingScore = Math.ceil(totalItems * 0.75);
        const statusElement = document.getElementById("recent-quiz-status");
        let statusText = "UNKNOWN";
        const testOptionsButton = document.getElementById("view-recent-quiz-button");

        if (isAnswered == false) { // Determine if the student has not finished the quiz.
            statusText = "INCOMPLETE";
            statusElement.innerText = statusText;
            statusElement.style.color = "black"; // Fixed this
            testOptionsButton.innerText = "Resume";
        } else { // Determine if the student passed (assuming 75% passing rate)
            statusText = mostRecentQuiz.number_of_correct >= passingScore ? "PASSED" : "FAILED";
            statusElement.innerText = statusText;
            statusElement.style.color = statusText === "PASSED" ? "#43ACAC" : "red";
            testOptionsButton.innerText = "View";
        }

        // Update "View" button with a link to view more quiz info
        testOptionsButton.addEventListener("click", function (event) {
            if (isAnswered == false) {
                sessionStorage.setItem('quiz_id', mostRecentQuiz.id);
                window.location.href = `/game_quiz/`
            }
        });
    }

    function displayOtherQuizzes(quizzes) {
        const quizContainer = document.querySelector('.wrapper'); // Assuming this is where you want to append quizzes
        
        // Loop through quizzes starting from the second quiz
        for (let index in quizzes) { // Using 'for...in' to loop through the array (index)
            if (index === "0") continue; // Skip the most recent quiz, already displayed
            
            const quiz = quizzes[index];
            const singit = document.querySelector('.wrapper');
            // Create a new div for each quiz
            singit.insertAdjacentHTML("beforeend", 
                `
                <div class="card-small other-quiz">
                <h3 class="raleway-bold"></h3>
                <p class="raleway-bold quiz-title">${quiz.quiz_title}</p>
                <p class="roboto-bold score-set">${quiz.number_of_correct} / 20</p><br>
                <p class="roboto-light">Status: <span class="quiz-status roboto-bold" id="quiz-status-${quiz.id}">${quiz.is_answered ? 'COMPLETE' : 'INCOMPLETE'}</span></p>
                <button class="roboto-bold view-quiz-button" id="view-quiz-${quiz.id}">View</button>
                </div>
                `);
            const statusElement = document.getElementById(`quiz-status-${quiz.id}`);
            const testOptionsButton = document.getElementById(`view-quiz-${quiz.id}`);

            //check if quiz is completed or not
            const isAnswered = quiz.is_answered;
            if (isAnswered == false) { // Determine if the student has not finished the quiz.
                statusText = "INCOMPLETE";
                statusElement.innerText = statusText;
                statusElement.style.color = "black"; // Fixed this
                testOptionsButton.innerText = "Resume";
            } else { // Determine if the student passed (assuming 75% passing rate)
                statusText = mostRecentQuiz.number_of_correct >= passingScore ? "PASSED" : "FAILED";
                statusElement.innerText = statusText;
                statusElement.style.color = statusText === "PASSED" ? "#43ACAC" : "red";
                testOptionsButton.innerText = "View";
            }

            

            // Add event listener to view button
            testOptionsButton.addEventListener("click", function () {
                sessionStorage.setItem('quiz_id', quiz.id);
                window.location.href = `/game_quiz`;
            });
        }
    }
    

    
    if (quizzes) {
        console.log(quizzes);
        
        if (!quizzes[0]) {
            console.log("No more quiz yet");
            let statusText = "NONE";
            const statusElement = document.getElementById("recent-quiz-status");
            const statusParent = document.querySelector("#recent-quiz-status-parent");
            const testOptionsButton = document.getElementById("view-recent-quiz-button");

            statusElement.style.color = "var(--text)";
            statusElement.innerText = statusText;
            statusParent.innerHTML = `<p class="raleway-bold" id="quiz-status" style="color: var(--text);">${statusText}</p><p>Do a quiz?</p>`;
            statusParent.style.color = "var(--text)";
            testOptionsButton.innerText = "Play";

            testOptionsButton.addEventListener("click", function (event) {
                // Action on clicking Play
            });

            return;
        }

        displayMostRecentQuiz(quizzes[0]);
        displayOtherQuizzes(quizzes);
    }
}



// graph below
// monthly correct and wrong answers


// total quizzes taken per month

// upload quiz modal

function handleDraggedFile(file) {
    uploadFile(file);
}


async function uploadFile(file) {
    let fileInput
    // Insert a file uploading screen
    
    //console.log("File uploaded"); return;  // Remove this line when everything about the upload is done.
    if (file) {
        fileInput = file;
    }else{
        fileInput = document.getElementById('file-input').files[0];
    }

    console.log("Uploading file...")
    if (!fileInput) {
        console.error("No file specified!");
        return;
    }
    if (fileInput.length === 0) {
      alert('Please select a file first!');
      return;
    }
    console.log("Legit uploading the file to stage 1")
    const stage1Data = await getDataFromUrlWithParams('/api/student/upload/stage1', {
        'file': fileInput
    });
        console.log(stage1Data);
        if (!stage1Data) {
            console.error("Stage 1 failed")
            return;
        }
        processFileStage2(stage1Data);
    
    

    // try {
    //   const response = await fetch("/api/student/upload/stage1", {
    //     method: "POST",
    //     headers: {
    //         "X-CSRFToken": csrf_token, // CSRF token for Django
    //     },
    //     body: formData,
    //   });

    //   const result = await response.json();
    //   console.log("Upload success:", result);
    //   processFileStage2(result); // Proceed to Stage 2
    // } catch (error) {
    //   console.error("Upload error:", error);
    // }
  }

async function processFileStage2(data) {
    if (!data) {
        console.error("No quiz data")
        return;
    }
    const quiz_id = data.quiz_id;
    const upload_stage = data.upload_stage;
    let stage2Data;
    stage2Data = await getDataFromUrlWithParams('/api/student/upload/stage2', {
        'quiz_id': quiz_id,
        'stage': upload_stage
    });
    console.log(stage2Data);
    if (!stage2Data) {
        console.error("Stage 2 failed")
        return;
    }
    document.getElementById("uploadQuizModalLoading").style.display = "flex"; 
    processFileStage3(stage2Data);
}

async function processFileStage3(data) {
    if (!data) {
        console.error("No quiz data")
        return;
    }
    const quiz_id = data.quiz_id;
    const upload_stage = data.upload_stage;
    const stage3Data = await getDataFromUrlWithParams('/api/student/upload/stage3', {
        'quiz_id': quiz_id,
        'stage': upload_stage
    });
        console.log(stage3Data);
        if (!stage3Data) {
            console.error("Stage 3 failed")
            return;
        }
    sessionStorage.setItem('quiz_id', quiz_id);
    document.getElementById("uploadQuizModalComplete").style.display = "flex"; 
}

//sunod function sa button pag change
const generateQuiz = document.getElementById("generate-quiz-button")

generateQuiz.addEventListener("click", function() {
    window.location.href = "/game_quiz";
});

document.addEventListener("DOMContentLoaded", async function () {

    const modal = document.getElementById("uploadQuizModal");
    const uploadBox = document.getElementById("upload-box");
    const openModalBtn = document.getElementById("uploadQuizButton");
    const closeModalBtns = document.querySelectorAll(".close");
    const uploadFileButton = document.getElementById("upload-file-button");
    const dropZone = document.getElementById('upload-content');


    // Prevent default behavior for the entire document
    document.addEventListener("dragover", (event) => event.preventDefault());
    document.addEventListener("drop", (event) => event.preventDefault());
    

    // Drag-over effect
    dropZone.addEventListener('dragover', (event) => {
        event.preventDefault(); // Prevent browser from opening file
        event.stopPropagation();
        uploadBox.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        uploadBox.classList.remove('dragover');
    });


    
    dropZone.addEventListener('drop', (event) => {
        event.preventDefault(); // Stop the file from opening
        event.stopPropagation();
        uploadBox.classList.remove('dragover');
        if (event.dataTransfer.files.length > 0) {
            handleDraggedFile(event.dataTransfer.files[0]);
            modal.style.display = "none";
        }
    });


    openModalBtn.addEventListener("click", function () {
        modal.style.display = "block";
    });

    closeModalBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            modal.style.display = "none";
        });
    });

    uploadFileButton.addEventListener("click", function(){
        console.log("Lesgoo!")
        document.getElementById('file-input').click();
        
    });

    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    
    });



});

