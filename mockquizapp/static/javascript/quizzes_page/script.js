


document.addEventListener("DOMContentLoaded", function () { 

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




 
    getDataFromUrl("/api/student/quizzes") // Gets all quizzes
    .then(quizzes => {
        if (!quizzes) {
            console.error("Invalid data structure:", quizData);
            return;
        }
        displayListOfQuizzes(quizzes.quizzes);
    })
    .catch(error => console.error("Error fetching quizzes", error));





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
            statusElement.style.color = "var(--text)" // Fixed this
            testOptionsButton.innerText = "Resume";

            testOptionsButton.addEventListener("click", function () {
                sessionStorage.setItem('quiz_id', mostRecentQuiz.id);
                window.location.href = `/game_quiz`;
            });
            
        } else { // Determine if the student passed (assuming 75% passing rate)
            statusText = mostRecentQuiz.number_of_correct >= passingScore ? "PASSED" : "FAILED";
            statusElement.innerText = statusText;
            statusElement.style.color = statusText === "PASSED" ? "var(--green)" : "var(--red)";
            testOptionsButton.innerText = "View";

            testOptionsButton.addEventListener("click", function () {
                sessionStorage.setItem('quiz_id', mostRecentQuiz.id);
                window.location.href = `/quiz_complete/`;
            });

        }
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
            const totalItems = quiz.number_of_correct + quiz.number_of_wrong;
            const passingScore = Math.ceil(totalItems * 0.75);
            //check if quiz is completed or not
            const isAnswered = quiz.is_answered;
            if (isAnswered == false) { // Determine if the student has not finished the quiz.
                statusText = "INCOMPLETE";
                statusElement.innerText = statusText;
                statusElement.style.color = "var(--text)"; 
                testOptionsButton.innerText = "Resume";

                // Add event listener to Resume button
            testOptionsButton.addEventListener("click", function () {
                sessionStorage.setItem('quiz_id', quiz.id);
                window.location.href = `/game_quiz`;
            });


            } else { // Determine if the student passed (assuming 75% passing rate)
                statusText = quiz.number_of_correct >= passingScore ? "PASSED" : "FAILED";
                statusElement.innerText = statusText;
                statusElement.style.color = statusText === "PASSED" ? "#43ACAC" : "red";
                testOptionsButton.innerText = "View";

                testOptionsButton.addEventListener("click", function () {
                    sessionStorage.setItem('quiz_id', quiz.id);
                    window.location.href = `/quiz_complete/`;
                });

            }

            

            
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
                document.getElementById("uploadQuizButton").click();
            });

            return;
        }

        displayMostRecentQuiz(quizzes[0]);
        displayOtherQuizzes(quizzes);
    }
}
 

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
        document.getElementById('uploaded-quiz-file-name').innerText = fileInput.name
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
    document.getElementById("uploadQuizModalLoading").style.display = "flex";

    setTimeout(() => {
        
        document.getElementById("loading-bar").innerHTML = "35%"; 
        document.getElementById("loading-bar").style.width = "35%"; 
    }, 1000); // Delay of 1 second
    const stage1Data = await getDataFromUrlWithParams('/api/student/upload/stage1', {
        'file': fileInput
    });
    console.log(stage1Data);
    if (!stage1Data) { 
        document.getElementById("uploaded-quiz-error").innerHTML = "File upload failed";
        document.getElementById("uploadQuizModalError").style.display = "flex";
        return;
    }
    processFileStage2(stage1Data);
    
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
        document.getElementById("uploaded-quiz-error").innerHTML = "File upload failed";
        document.getElementById("uploadQuizModalError").style.display = "flex";
        return;
    }
    
    setTimeout(() => { 
        document.getElementById("loading-bar").innerHTML = "85%"; 
        document.getElementById("loading-bar").style.width = "85%"; 
    }, 1000); // Delay of 1 second
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
            document.getElementById("uploaded-quiz-error").innerHTML = "File upload failed";
            document.getElementById("uploadQuizModalError").style.display = "flex";
            return;
        }
    sessionStorage.setItem('quiz_id', quiz_id);
    setTimeout(() => {
        document.getElementById("loading-bar").innerHTML = "100%"; 
        document.getElementById("loading-bar").width = "100%";
    }, 1000); // Delay of 1 second
    setTimeout(() => {
        document.getElementById("uploadQuizModalLoading").style.display = "none";
        document.getElementById("uploadQuizModalComplete").style.display = "flex"; 
    }, 2000);
}

//sunod function sa button pag change
const generateQuiz = document.getElementById("generate-quiz-button")

generateQuiz.addEventListener("click", function() {
    window.location.href = "/game_quiz";
});

document.addEventListener("DOMContentLoaded", async function () {

    document.getElementById("open-logout-form").addEventListener("click", async function (event) { 
        event.preventDefault(); 
        document.getElementById("logout-form-pop").style.display = "flex"; 
        console.log(document.getElementById("logout-form-pop"));
        console.log("Logout Button Clicked")
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

    document.getElementById("cancel-quiz-button").addEventListener("click", async function (event) {
        event.preventDefault();
        document.getElementById("uploadQuizModal").style.display = "none";
        document.getElementById("uploadQuizModalLoading").style.display = "none";
        document.getElementById("uploadQuizModalComplete").style.display = "none"; 
        document.getElementById("uploadQuizModalError").style.display = "none"; 
    })



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

