const modal = document.getElementById("modal");
const levelInfo = document.querySelector(".level-info");
var global_current_question = null;
var userAnswer = [];
let temporary_answer = null;
var game_settings = [];
//TODO 4 5 2025 - Make the choice flash yellow in the confirmation screen, make the choices flash red or green after selecting an answer and confirming, 
//TODO          - Make the questions progress upon answering, Implement powerups.


levelInfo.addEventListener("click", function () {
        modal.style.display = "flex"; 

});

//level-points-pop content
const listContainer = document.getElementById("list");

const points = [
    "₱1,000,000", "₱900,000", "₱750,000", "₱500,000", "₱250,000",
    "₱100,000", "₱50,000", "₱25,000", "₱12,000", "₱6,000",
    "₱3,000", "₱1,500", "₱800", "₱400", "₱200",
    "₱100", "₱50", "₱30", "₱20", "₱10"
];

// list out level and its respective points
for (let i = 0; i < points.length; i++) {
    const level = i + 1;
    const reversedIndex = points.length - 1 - i;
    
    listContainer.insertAdjacentHTML("afterbegin", 
        `
        <div class="level-point-${level}">
        <p class="level-${level} roboto-bold">${level}</p>
        <p class="points roboto-light">${points[reversedIndex]}</p>
        </div>
        `);
}

function playAudio(audio){
    const audioElement = document.createElement('audio');
    audioElement.src = audio;
    audioElement.play();
}

async function endGame() {
    const quiz_status = await getQuizStatus(sessionStorage.getItem('quiz_id'));
    if (quiz_status) {
        console.log("Finished Game, proceeding to quiz complete");
        console.log(quiz_status);
        await new Promise(resolve => setTimeout(resolve, 2000));
        window.location.href = `/quiz_complete`;
    }

}

async function getAnsweredQuestions(quiz_id){
    if (!quiz_id) {
        return null;
    }
    res = await getDataFromUrlWithParams(`/api/game/get/quiz`,{
        'quiz_id': quiz_id
    });
    if (res) {
         return res;
    }
}

async function getQuizStatus(quiz_id){
    if (!quiz_id) {
        return null;
    }
    res = await getDataFromUrlWithParams(`/api/game/finish`,{
        'quiz_id': quiz_id
    });
    if (res) {
         return res;
    }
}

async function checkQuizNumber(current_question){ // Check if the number of correct answers and wrong answers total to 20, if it is, return true and go to end screen.
    console.log("Checking last question... ", current_question);
    if (parseInt(current_question) > 19){
        const current_answered_questions = await getAnsweredQuestions(sessionStorage.getItem('quiz_id'));
        console.log("More than 19 questions have been answered!");
        if (current_answered_questions) {
            console.log(current_answered_questions);
            const quizData = current_answered_questions.data;
            if (quizData.currently_answered_question == 20) {
                return true;
            }else{
                return false;
            }
        }
    }
    else {
        return false;
    }
}



async function processChoice(choiceString){
    async function evaluateChoice(choice) {
        const current_question = global_current_question;
        const quiz_id = sessionStorage.getItem('quiz_id');
        if (quiz_id) {
            res = await getDataFromUrlWithParams(`/api/game/answer`,{
                'quiz_id': quiz_id,
                'question' : current_question,
                'user_answer' : choice
            });
                if (res) {
                    return res;
                }
            }
        }

    const result = await evaluateChoice(choiceString);
    if (result){
        const current_question = global_current_question;
        showAnswerEffects(choiceString, current_question);
    }

      // Optionally reset the flash-yellow class manually
      resetFlashYellowClass();
}

async function showWrongAndCorrectAnswer(choice, current_question){
    const quiz_id = sessionStorage.getItem('quiz_id');
    res = await getDataFromUrlWithParams(`/api/game/get/answer`,{
        'quiz_id': quiz_id,
        'question': current_question
    });
    if (res) {
        console.log(res);
        const question = res.question;
        const isCorrect = question.is_correct;
        console.log('Player is ' +isCorrect);
        if (isCorrect == true){
            const choiceElement = document.querySelector(`.svg-choice-${choice}`);
            resetFlashYellowClass();
            flashGreen(choiceElement);
        }else{
            const choiceElement = document.querySelector(`.svg-choice-${choice}`);
            resetFlashYellowClass();
            flashRed(choiceElement);
            const answer = res.question.answer;
            const correct_answer = res.question.correct_answer;
            console.log(`The correct answer is: ${correct_answer}`);
            const correctAnswerElement = document.querySelector(`.svg-choice-${correct_answer}`)
            flashGreen(correctAnswerElement);
        }

    }
}


async function showAnswerEffects(choice, current_question) {
    //TODO: Show the visual effects and play audio here.
    //TODO: Mon patukdo man pano i change an kulay kay ipa green or red depending kun nano an tama na answer.
    showWrongAndCorrectAnswer(choice, current_question);


    


    // proceed to the next question
    const isLastQuestion = await checkQuizNumber(current_question);
    if (isLastQuestion == true) {
        console.log("Is it the final question?")
        endGame();
    }else{
        
        nextQuestion(current_question);
    }
}

async function nextQuestion(current_question){
    global_current_question = current_question + 1;
    const questionData = await questionFetch(global_current_question);
    await new Promise(resolve => setTimeout(resolve, 3000));
    resetFlashes();
    displayQuestion(questionData);
}

function flashRed(choiceElement){
    if (choiceElement) {
        choiceElement.classList.add('flash-red');
        choiceElement.classList.remove('svg:hover');
    }
}

function flashGreen(choiceElement){
    if (choiceElement) {
        choiceElement.classList.add('flash-green');
        choiceElement.classList.remove('svg:hover');
    }
}


function flashYellow(choiceElement){
    if (choiceElement) {
        choiceElement.classList.add('flash-yellow');
        choiceElement.classList.remove('svg:hover');
    }
}

function showConfirmationPrompt(choice) {
    const confirmationPromptElement = document.getElementById('confirmation-form-pop');
    
    // Remove the flash-yellow class from any previously selected SVGs
    const previouslySelectedElement = document.querySelector('.flash-yellow');
    if (previouslySelectedElement) {
        previouslySelectedElement.classList.remove('flash-yellow');
    }

    // Now add the flash-yellow class to the newly selected SVG element
    const choiceElement = document.querySelector(`.svg-choice-${choice}`);
    flashYellow(choiceElement);

    // Show the confirmation prompt
    confirmationPromptElement.style.display = "flex";

    // Store the temporary answer (if needed)
    temporary_answer = choice;
}

// Reset function to ensure the class is cleared after each question.
function resetFlashYellowClass() {
    // Remove flash-yellow from all SVGs when a new question appears
    const allChoiceElements = document.querySelectorAll('.svg-choice-A, .svg-choice-B, .svg-choice-C, .svg-choice-D');
    allChoiceElements.forEach(element => {
        element.classList.add('svg:hover');
        element.classList.remove('flash-yellow');
    });
}

function resetFlashes() {
    // Remove flash-yellow from all SVGs when a new question appears
    const allChoiceElements = document.querySelectorAll('.svg-choice-A, .svg-choice-B, .svg-choice-C, .svg-choice-D');
    allChoiceElements.forEach(element => {
        element.classList.add('svg:hover');
        element.classList.remove('flash-yellow');
        element.classList.remove('flash-red');
        element.classList.remove('flash-green');
    });
}

function displayQuestion(questionData){
    const questionElement = document.querySelector(".question-text");
    const options = questionData.options.map(opt =>
        opt.replace(/^[A-D][\.\:\-\s]*\s*/, "")
      );
    questionElement.innerText = questionData.question;
    displayChoices(options);
}

function displayChoices(options){
    const choiceAElement = document.getElementById("choice-A");
    const choiceBElement = document.getElementById("choice-B");
    const choiceCElement = document.getElementById("choice-C");
    const choiceDElement = document.getElementById("choice-D");

    choiceAElement.innerText = options[0];
    choiceBElement.innerText = options[1];
    choiceCElement.innerText = options[2];
    choiceDElement.innerText = options[3];


}

async function questionFetch(current_question){
    const quiz_id = sessionStorage.getItem('quiz_id');
    if (quiz_id) {
        res = await getDataFromUrlWithParams(`/api/game/generate/questions`,{
            'quiz_id' : quiz_id,
            'question': current_question,
        });
        if (res) {
            return res.question;
        }
    }
    return null;
}
// ---------------- For highlighting worth --------------------------------
async function getCorrectStatus(question_number){
    const quiz_id = sessionStorage.getItem('quiz_id');
    res = await getDataFromUrlWithParams(`/api/game/get/answer`,{
        'quiz_id': quiz_id,
        'question': question_number,
    });
    if (res) {
        return res.question.is_correct;
    }
}

async function highlightQuestionWorth(worthElement, question_number){ //TODO: Make the worths flash using these. It needs to be done by Mon first.
    const isCorrect = await getCorrectStatus(question_number);
    if (isCorrect == true){
        console.log("Correct ");
        console.log(worthElement);
        flashGreen(worthElement);
    }else{
        console.log("Wrong ");
        flashRed(worthElement);
    }
}

function highlightCurrentQuestionWorth(worthElement){ //TODO: Make the worths flash using these. It needs to be done by Mon first.
    worthElement.classList.add('flash-yellow');

}

async function highlightAnsweredQuestionsWorth(questions){ //TODO: Make the worths flash using these. It needs to be done by Mon first.
    current_question = global_current_question;
    questions.forEach(question => {
        const worthElement = document.querySelector(`.level-point-${question.number}`); //TODO Make this flash green or red.
        if (parseInt(question.number) < current_question){
            console.log(question);
            highlightQuestionWorth(worthElement, question.number);
        }else{
            return;
        }   
    });
}




document.addEventListener("DOMContentLoaded", async function () {
    const quiz_id = sessionStorage.getItem('quiz_id');
    if (quiz_id) {
        res = await getDataFromUrlWithParams(`/api/game/get/quiz`,{
            'quiz_id': quiz_id
        });
        if (res) {
            const questions = res.data.questions;
            const current_question = res.data.currently_answered_question + 1; // adds 1 upon entering to get the actual question instead of 0
            const question = await questionFetch(current_question);
            if (question) {
                displayQuestion(question);
                global_current_question = current_question;
                highlightAnsweredQuestionsWorth(questions);
            }
        }
    }
});


//50-50
document.getElementById("ingame-settings-button").addEventListener("click", async function (event) { 
    event.preventDefault(); 
    document.getElementById("ingame-settings").style.display = "flex"; 
});

document.getElementById("cancel-ingame-but").addEventListener('click', function() {
    document.getElementById("ingame-settings").style.display = "none";
});

document.getElementById("confirm-ingame-but").addEventListener('click', function() {
    document.getElementById("ingame-settings").style.display = "none";
});

//50-50
document.getElementById("50-50").addEventListener("click", async function (event) { 
    event.preventDefault(); 
    document.getElementById("50-form-pop").style.display = "flex"; 
});

document.getElementById("cancel-50-but").addEventListener('click', function() {
    document.getElementById("50-form-pop").style.display = "none";
});

document.getElementById("confirm-50-but").addEventListener('click', function() {
    document.getElementById("50-form-pop").style.display = "none";
});

//AI
document.getElementById("ask-ai").addEventListener("click", async function (event) { 
    event.preventDefault(); 
    document.getElementById("ai-form-pop").style.display = "flex"; 
});

document.getElementById("cancel-ai-but").addEventListener('click', function() {
    document.getElementById("ai-form-pop").style.display = "none";
});

document.getElementById("confirm-ai-but").addEventListener('click', function() {
    document.getElementById("ai-form-pop").style.display = "none";
});


//x2
document.getElementById("x2").addEventListener("click", async function (event) { 
    event.preventDefault(); 
    document.getElementById("x2-form-pop").style.display = "flex"; 
});

document.getElementById("cancel-x2-but").addEventListener('click', function() {
    document.getElementById("x2-form-pop").style.display = "none";
});

document.getElementById("confirm-x2-but").addEventListener('click', function() {
    document.getElementById("x2-form-pop").style.display = "none";
});

//pass
document.getElementById("pass").addEventListener("click", async function (event) { 
    event.preventDefault(); 
    document.getElementById("pass-form-pop").style.display = "flex"; 
});

document.getElementById("cancel-pass-but").addEventListener('click', function() {
    document.getElementById("pass-form-pop").style.display = "none";
});

document.getElementById("confirm-pass-but").addEventListener('click', function() {
    document.getElementById("pass-form-pop").style.display = "none";
});

//Choice Buttons ---------------------------------------------------

document.querySelector(".choice-A").addEventListener('click', function() {
    const choice = "A";
    showConfirmationPrompt(choice);
});

document.querySelector(".choice-B").addEventListener('click', function() {
    const choice = "B";
    showConfirmationPrompt(choice);
});

document.querySelector(".choice-C").addEventListener('click', function() {
    const choice = "C";
    showConfirmationPrompt(choice);
});

document.querySelector(".choice-D").addEventListener('click', function() {
    const choice = "D";
    showConfirmationPrompt(choice);
});


//Confirmation Prompt Buttons ---------------------------------------------------

function closeConfirmationPrompt() {
    document.getElementById("confirmation-form-pop").style.display = "none";
    resetFlashYellowClass(); 
}

document.getElementById("confirm-confirmation-but").addEventListener('click', function() {
    processChoice(temporary_answer);
    closeConfirmationPrompt();
});
document.getElementById("cancel-confirmation-but").addEventListener('click', function() {
    closeConfirmationPrompt();
});

// Background Wrapper

function closeWorthSidenav(){
    modal.style.display = "none";
    
}

document.querySelector(".modal").addEventListener('click', function() {
    closeWorthSidenav()
});