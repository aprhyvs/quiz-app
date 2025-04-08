const modal = document.getElementById("modal");
const levelInfo = document.querySelector(".level-info");
var global_current_question = null;
var userAnswer = [];
let temporary_answer = null;
let temporary_answers = [];
var game_settings = [];
var globalPowerUps = {};
var availableChoices = ["A","B","C","D"];
var doubleDipIsActive = false;
var disabledPowerUps = [];
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
        <div class="level-point-${level} level-point">
        <p class="level-${level} level roboto-bold">${level}</p>
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

function resizeTextOnOverflowAndWords(element, options = {}) {
    const p = element.querySelector('p');
    if (!p) return;
  
    const minFontSize = options.min || 32;  // Minimum font size in px
    const maxFontSize = options.max || 40;  // Maximum font size in px
    const step = options.step || 1;         // Font size step for resizing
    const wordThreshold = options.wordThreshold || 5;  // Word count threshold
  
    // Function to check if text overflows the container
    function isOverflowing() {
      return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
    }
  
    // Function to count words
    function getWordCount() {
      const text = p.textContent || "";
      return text.trim().split(/\s+/).length;
    }
  
    // Function to resize font size based on overflow and word count
    function adjustFontSize() {
      let fontSize = parseInt(window.getComputedStyle(element).fontSize);
      const wordCount = getWordCount();
  
      // If there are fewer words than the threshold (wordCount < wordThreshold), increase the font size
      if (wordCount <= wordThreshold && fontSize < maxFontSize) {
        fontSize = Math.min(maxFontSize, fontSize + step);  // Increase font size but don't exceed max
        p.style.fontSize = `${fontSize}px`;
      }
  
      // If the text overflows, shrink the font size
      while (isOverflowing() && fontSize > minFontSize) {
        fontSize -= step;  // Reduce the font size in steps
        p.style.fontSize = `${fontSize}px`;
      }
  
      // If the text is not overflowing and word count is greater than the threshold, increase font size in small steps
      while (!isOverflowing() && fontSize < maxFontSize && wordCount < wordThreshold) {
        fontSize += step;  // Increase the font size incrementally
        p.style.fontSize = `${fontSize}px`;
      }
  
      // If word count is more than the threshold, adjust font size to maintain readability
      if (wordCount >= wordThreshold && fontSize > minFontSize) {
        fontSize -= step;  // Gradually reduce the font size
        p.style.fontSize = `${fontSize}px`;
      }
    }
  
    // Initial adjustment when the script runs
    adjustFontSize();
  
    // Optionally, listen for window resizing to adjust dynamically:
    window.addEventListener('resize', adjustFontSize);
  
    // Observe changes to the child text node to handle dynamic changes to the content
    const observer = new MutationObserver(() => {
      adjustFontSize();
    });
    observer.observe(element, { childList: true, subtree: true });
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
        const question = res.question;
        const isCorrect = question.is_correct;
        
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
            const correctAnswerElement = document.querySelector(`.svg-choice-${correct_answer}`)
            flashGreen(correctAnswerElement);
        }
        highlightQuestionWorthRealtime(document.querySelector(`.level-point-${global_current_question - 1}`), isCorrect);

    }
}


async function showAnswerEffects(choice, current_question) {
    if (doubleDipIsActive == true){
        showDoubleDipWrongAndCorrectAnswer(choice, current_question);
        console.log("Sent to double dip wrong and correct answer function...")
    }else{
        showWrongAndCorrectAnswer(choice, current_question);
    }
    
    // proceed to the next question
    const isLastQuestion = await checkQuizNumber(current_question);
    if (isLastQuestion == true) {
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
    choicesOpacityReset(current_question);
    displayQuestion(questionData);
    showQuestionWorth(global_current_question, questionData.worth);
    highlightCurrentQuestionWorth(document.querySelector(`.level-point-${global_current_question}`));
    
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
    if (doubleDipIsActive == true){
        // double dip functionality here.
        confirmationPromptElement.style.display = "flex";
        return;
    }


    if (!availableChoices.includes(choice)) {
        console.log(choice);
        console.log("Dili pwede.");
        return false;
    }
    
    
    
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
    resizeTextOnOverflowAndWords(questionElement, { min: 32, max: 40, step: 8, wordThreshold: 30 });
    displayAvailablePowerUps();
    disabledPowerUps = [];
    
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

function modalFlash(choiceElement, color){
    if (choiceElement) {
        if (color == "green"){
            choiceElement.classList.add('modal-flash-green');
        }
        if (color == "red"){
            choiceElement.classList.add('modal-flash-red');
        }
        if (color == "yellow"){
            choiceElement.classList.add('modal-flash-yellow');
        }
    }
}

async function highlightQuestionWorth(worthElement, question_number){ 
    const isCorrect = await getCorrectStatus(question_number);
    if (isCorrect == true){
        console.log("Correct ");
        console.log(worthElement);
        modalFlash(worthElement, "green");
    }else{
        console.log("Wrong ");
        modalFlash(worthElement, "red");
    }
}

function highlightQuestionWorthRealtime(worthElement, isCorrect){ 
    if (isCorrect == true){
        console.log("Correct ");
        console.log(worthElement);
        modalFlash(worthElement, "green");
    }else{
        console.log("Wrong ");
        modalFlash(worthElement, "red");
    }
}

function removeModalFlash(choiceElement, color){
    if (choiceElement) {
        if (color == "yellow"){
            choiceElement.classList.remove('modal-flash-yellow');
        }
        if (color == "red"){
            choiceElement.classList.remove('modal-flash-red');
        }
        if (color == "green"){
            choiceElement.classList.remove('modal-flash-green');
        }
    }
}

function highlightCurrentQuestionWorth(worthElement){ 
    const previousWorthElement = document.querySelector(`.level-point-${global_current_question - 1}`);
    removeModalFlash(previousWorthElement, "yellow");
    modalFlash(worthElement, "yellow");
}

async function highlightAnsweredQuestionsWorth(questions){ 
    current_question = global_current_question;
    questions.forEach(question => {
        const worthElement = document.querySelector(`.level-point-${question.number}`); //TODO Make this flash green or red.
        if (parseInt(question.number) < current_question){
            highlightQuestionWorth(worthElement, question.number);
        }else{
            return;
        }   
    });
}

function showQuestionWorth(number, worth){
    const questionInfoElement = document.querySelector(`.q-level`);
    const pointsElement = document.querySelector(`.points`)

    questionInfoElement.innerText = "Q" + number;
    pointsElement.innerText = "₱" + worth;
}


document.addEventListener("DOMContentLoaded", async function () {
    const quiz_id = sessionStorage.getItem('quiz_id');
    if (quiz_id) {
        res = await getDataFromUrlWithParams(`/api/game/get/quiz`,{
            'quiz_id': quiz_id
        });
        if (res) {
            const quiz = res.data;
            const has5050 = quiz.game_has_5050;
            console.log(quiz);
            const questions = res.data.questions;
            const current_question = res.data.currently_answered_question + 1; // adds 1 upon entering to get the actual question instead of 0
            const question = await questionFetch(current_question);
            if (question) {
                displayQuestion(question);
                global_current_question = current_question;
                if (has5050 == true) {
                    console.log("Has 5050")
                    activate5050();
                }
                highlightAnsweredQuestionsWorth(questions);
                highlightCurrentQuestionWorth(document.querySelector(`.level-point-${current_question}`));
                showQuestionWorth(current_question, question.worth);
                
            }
        }
    }
});



//Choice Buttons ---------------------------------------------------

document.querySelector(".choice-A").addEventListener('click', function() {
    if (doubleDipIsActive == true) {
        if (temporary_answers.includes("A")){
            console.log("You already chose this...");
            return; 
        }
        temporary_answers.push("A");
        checkTemporaryAnswers();
        flashYellow(document.querySelector(`.svg-choice-A`));
        return;
    }
    const choice = "A";
    showConfirmationPrompt(choice);
});

document.querySelector(".choice-B").addEventListener('click', function() {
    if (doubleDipIsActive == true) {
        if (temporary_answers.includes("B")){
            console.log("You already chose this...");
            return; 
        }
        temporary_answers.push("B");
        checkTemporaryAnswers();
        flashYellow(document.querySelector(`.svg-choice-B`));
        return;
    }

    const choice = "B";
    showConfirmationPrompt(choice);
});

document.querySelector(".choice-C").addEventListener('click', function() {
    if (doubleDipIsActive == true) {
        if (temporary_answers.includes("C")){
            console.log("You already chose this...");
            return; 
        }
        temporary_answers.push("C");
        checkTemporaryAnswers();
        flashYellow(document.querySelector(`.svg-choice-C`));
        return;
    }
    const choice = "C";
    showConfirmationPrompt(choice);
});

document.querySelector(".choice-D").addEventListener('click', function() {
    if (doubleDipIsActive == true) {
        if (temporary_answers.includes("D")){
            console.log("You already chose this...");
            return; 
        }
        temporary_answers.push("D");
        checkTemporaryAnswers();
        flashYellow(document.querySelector(`.svg-choice-D`));
        return;
    }
    const choice = "D";
    showConfirmationPrompt(choice);
});


//Confirmation Prompt Buttons ---------------------------------------------------

function closeConfirmationPrompt() {
    temporary_answers = [];
    document.getElementById("confirmation-form-pop").style.display = "none";
    resetFlashYellowClass(); 
}

document.getElementById("confirm-confirmation-but").addEventListener('click', function() {
    if (doubleDipIsActive == true) {
        processDoubleChoice(temporary_answers);
        console.log("sent " + temporary_answers);
        closeConfirmationPrompt();
        return;
    }
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






// Power Ups

function disableOtherPowerUps(usedPowerUp){
    displayDisabledPowerUps(usedPowerUp);

    if (usedPowerUp == "50_50"){
        disabledPowerUps.push("ask_ai");
        disabledPowerUps.push("double_dip");
        disabledPowerUps.push("pass");
        return;
    }
    if (usedPowerUp == "ask_ai"){
        disabledPowerUps.push("50_50");
        disabledPowerUps.push("double_dip");
        disabledPowerUps.push("pass");
        return;
    }
    if (usedPowerUp == "x2"){
        disabledPowerUps.push("50_50");
        disabledPowerUps.push("ask_ai");
        disabledPowerUps.push("pass");
        return;
    }
    if (usedPowerUp == "pass"){
        disabledPowerUps.push("50_50");
        disabledPowerUps.push("ask_ai");
        disabledPowerUps.push("double_dip");
        return;
    }
}



function updatePowerUpElement(element, state){
    console.log(state);
    if (state == true){
        element.style.opacity = .50;
    }else{
        element.style.opacity = 1;
    }
}

function displayDisabledPowerUps(usedPowerUp){
    const button5050 = document.getElementById('50-50');
    const buttonAskAi = document.getElementById('ask-ai');
    const buttonDoubleDip = document.getElementById('x2');
    const buttonPass = document.getElementById('pass');
    if (usedPowerUp == "50_50"){
        updatePowerUpElement(buttonAskAi, true);
        updatePowerUpElement(buttonDoubleDip, true);
        updatePowerUpElement(buttonPass, true);
    }
    if (usedPowerUp == "ask_ai"){
        updatePowerUpElement(button5050, true);
        updatePowerUpElement(buttonDoubleDip, true);
        updatePowerUpElement(buttonPass, true);
    }
    if (usedPowerUp == "x2"){
        updatePowerUpElement(button5050, true);
        updatePowerUpElement(buttonAskAi, true);
        updatePowerUpElement(buttonPass, true);
    }
    if (usedPowerUp == "pass"){
        updatePowerUpElement(button5050, true);
        updatePowerUpElement(buttonAskAi, true);
        updatePowerUpElement(buttonDoubleDip, true);
    }
}

async function getAvailablePowerUps(quiz_id){
    res = await getDataFromUrlWithParams(`/api/game/get/powerup`,{
        'quiz_id': quiz_id
    });
    if (res) {
         return res;
    }
}

async function displayAvailablePowerUps(){
    const quiz_id = sessionStorage.getItem('quiz_id');
    const powerUps = await getAvailablePowerUps(quiz_id);
    globalPowerUps = powerUps;
    if (powerUps) {
        const button5050 = document.getElementById('50-50');
        const buttonAskAi = document.getElementById('ask-ai');
        const buttonDoubleDip = document.getElementById('x2');
        const buttonPass = document.getElementById('pass');

        updatePowerUpElement(button5050, powerUps.has_5050);
        updatePowerUpElement(buttonDoubleDip, powerUps.has_2x);
        updatePowerUpElement(buttonPass, powerUps.has_pass);
        
        if (globalPowerUps.has_hint == true){ // If hint has been used...
            if ( checkHintNumber(globalPowerUps.hint_data) == false ){ // If the hint question is not the current question...
                updatePowerUpElement(buttonAskAi, powerUps.has_hint);
            }else{
                disableOtherPowerUps("ask_ai");
                console.log(disabledPowerUps);
            }
        }else{
            updatePowerUpElement(buttonAskAi, powerUps.has_hint);
        }
    }
}


//Settings
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
    if (globalPowerUps.has_5050 == true || disabledPowerUps.includes("50_50")){
        console.log("50-50 Power Up not available.");
        return false;
    }else {
        document.getElementById("50-form-pop").style.display = "flex"; 
    }
});

document.getElementById("cancel-50-but").addEventListener('click', function() {
    document.getElementById("50-form-pop").style.display = "none";
});

document.getElementById("confirm-50-but").addEventListener('click', function() {
    document.getElementById("50-form-pop").style.display = "none";
    activate5050();
});

async function activate5050(){
    const quiz_id = sessionStorage.getItem('quiz_id');
    if (globalPowerUps.has_5050 == true){
        console.log("50-50 Power Up not available.");
        return false;
    }
    const res = await getDataFromUrlWithParams(`/api/game/5050`,{
        'quiz_id': quiz_id,
        'question': global_current_question
    });
    if (res) {
        console.log(res);
        data5050 = res["5050"];
        globalPowerUps.has_5050 = true;
        const questions5050 = Object.keys(data5050);
        const question5050 = questions5050[0];
        const current_question = global_current_question;
        if (current_question == question5050) { //If the current question is the 50-50 question...
            displayPossibleAnswers(data5050);
            console.log("50-50 Power Up activated.");
            disableOtherPowerUps("50_50"); 
        }
        updatePowerUpElement(document.getElementById('50-50'), true);
    }
}

function displayPossibleAnswers(data5050){
    if (!data5050[global_current_question]){
        return;
    }
    const possibleAnswers = data5050[global_current_question];
        const letters = ["A","B","C","D"];
        availableChoices = possibleAnswers;
        for (let i = 0; i < letters.length; i++) {
            if (!possibleAnswers.includes(letters[i])){
                document.querySelector(`.svg-choice-${letters[i]}`).style.opacity = .10;
                document.querySelector(`.svg-choice-${letters[i]}`).classList.remove('svg:hover');
        }
    }
}

async function choicesOpacityReset(current_question){
    quiz_id = sessionStorage.getItem('quiz_id');
    const letters = ["A","B","C","D"];
    for (let i = 0; i < letters.length; i++) {
        document.querySelector(`.svg-choice-${letters[i]}`).style.opacity = 1;
        document.querySelector(`.svg-choice-${letters[i]}`).classList.add('svg:hover');
    }
    const powerUps = await getAvailablePowerUps(quiz_id);
    if (powerUps){
        const data5050 = powerUps["5050_data"]
        const questions5050 = Object.keys(data5050);
        const question5050 = questions5050[0];
        if (current_question == question5050) { //If the current question is the 50-50 question...
            availableChoices = letters; // Just reset the available choices to default. Used letters variable for convenience
        }
        console.log(question5050);
        console.log(powerUps);
    }
    

}

//AI
document.getElementById("ask-ai").addEventListener("click", async function (event) { 
    event.preventDefault(); 
    if (disabledPowerUps.includes("ask_ai") ){
        console.log("INC! DILI PWIDI!!")
        return;
    }
    if (globalPowerUps.has_hint == true){ // If hint has been used...
        if ( checkHintNumber(globalPowerUps.hint_data) == true){ // If the hint question is the current question...
            displayAiHint(globalPowerUps.hint_data[global_current_question]);
            event.preventDefault(); 
        }
    }else{ // Hint has not been used before...
        event.preventDefault(); 
        document.getElementById("ai-form-pop").style.display = "flex"; 
    }
});

document.getElementById("cancel-ai-but").addEventListener('click', function() {
    document.getElementById("ai-form-pop").style.display = "none";
});

document.getElementById("confirm-ai-but").addEventListener('click', function() {
    if (globalPowerUps.has_hint == false){ // If hint has been used...
        event.preventDefault(); 
        activateAiHint();
    }
    document.getElementById("ai-form-pop").style.display = "none";
});

function checkHintNumber(hint_data){
    const current_question = global_current_question;
    const questionsHint = Object.keys(hint_data);
    const questionHint = questionsHint[0]
    if (current_question == questionHint) { //If the current question is the hint question...
        console.log("Current question is the hint question. " + current_question);
        return true;
    }else{
        console.log("Not the hint question. " + questionHint + " != " + current_question);
        return false;
    }
}

async function activateAiHint(){
    const quiz_id = sessionStorage.getItem('quiz_id');
    if (globalPowerUps.has_hint == true){ // If hint has been used...
        console.log("Hint already used.");
        return; // stop function
    }
    const res = await getDataFromUrlWithParams(`/api/game/generate/hints`,{
        'quiz_id': quiz_id,
        'question': global_current_question
    });
    if (res){
        console.log(res);
        globalPowerUps.hint_data = res;
        displayAiHint(res[global_current_question]);
        disableOtherPowerUps("ask_ai");
    }
}

function displayAiHint(hintContent){
    globalPowerUps.has_hint = true;
    AiHintTextElement = document.querySelector('.ai-form-text');
    AiHintTitleElement = document.querySelector('.ai-form-title');
    AiHintTextElement.innerText = hintContent;
    AiHintTitleElement.innerText = "AI Hint";

    
    document.getElementById("ai-form-pop").style.display = "flex"; 
}

//x2
document.getElementById("x2").addEventListener("click", async function (event) { 
    if (disabledPowerUps.includes("double_dip") ){
        console.log("INC! DILI PWIDI!!")
        return;
    }
    event.preventDefault(); 
    document.getElementById("x2-form-pop").style.display = "flex"; 
});

document.getElementById("cancel-x2-but").addEventListener('click', function() {
    document.getElementById("x2-form-pop").style.display = "none";
});

document.getElementById("confirm-x2-but").addEventListener('click', function() {
    const buttonDoubleDip = document.getElementById('x2');
    updatePowerUpElement(buttonDoubleDip, true);
    disableOtherPowerUps("x2");
    doubleDipIsActive = true;
    document.getElementById("x2-form-pop").style.display = "none";
});


function glowChoice(choice) {
    // Now add the flash-yellow class to the newly selected SVG element
    const choiceElement = document.querySelector(`.svg-choice-${choice}`);
    flashYellow(choiceElement);
}

function checkTemporaryAnswers(){
    console.log(temporary_answers)
    if (temporary_answers.length == 2){
        showConfirmationPrompt(temporary_answers);
    }
}

async function processDoubleChoice(final_choices){
    const current_question = global_current_question;
    async function evaluateChoice(choices) {
        const quiz_id = sessionStorage.getItem('quiz_id');
        if (quiz_id) {
            res = await getDataFromUrlWithParams(`/api/game/x2`,{
                'quiz_id': quiz_id,
                'question' : current_question,
                'answer_1' : choices[0],
                'answer_2' : choices[1]
            });
                if (res) {
                    return res;
                }
            }
        }

    const result = await evaluateChoice(final_choices);
    if (result){
        console.log(current_question);
        showAnswerEffects(final_choices, current_question);
    }

      // Optionally reset the flash-yellow class manually
      resetFlashYellowClass();
}

async function showDoubleDipWrongAndCorrectAnswer(choices, current_question){
    const quiz_id = sessionStorage.getItem('quiz_id');
    console.log(current_question)
    res = await getDataFromUrlWithParams(`/api/game/get/answer`,{
        'quiz_id': quiz_id,
        'question': current_question
    });
    if (res) {
        doubleDipIsActive = false;
        const question = res.question;
        const isCorrect = question.is_correct;
        const correct_answer = res.question.correct_answer;
        if (isCorrect == true){
            const choiceElement = document.querySelector(`.svg-choice-${correct_answer}`);
            resetFlashYellowClass();
            flashGreen(choiceElement);
        }else{
            const choiceElement1 = document.querySelector(`.svg-choice-${choices[0]}`);
            const choiceElement2 = document.querySelector(`.svg-choice-${choices[1]}`);
            resetFlashYellowClass();
            flashRed(choiceElement1);
            flashRed(choiceElement2);
            const answerElement = document.querySelector(`.svg-choice-${correct_answer}`);
            flashGreen(answerElement);
        }
    }
}

//pass
document.getElementById("pass").addEventListener("click", async function (event) { 
    if (disabledPowerUps.includes("pass") ){
        console.log("INC! DILI PWIDI!!")
        console.log(disabledPowerUps);
        return;
    }
    event.preventDefault(); 
    document.getElementById("pass-form-pop").style.display = "flex"; 
});

document.getElementById("cancel-pass-but").addEventListener('click', function() {
    document.getElementById("pass-form-pop").style.display = "none";
});

document.getElementById("confirm-pass-but").addEventListener('click', function() {
    document.getElementById("pass-form-pop").style.display = "none";
    processPass();
});

async function processPass(){
    const current_question = global_current_question;
    const quiz_id = sessionStorage.getItem('quiz_id');
    res = await getDataFromUrlWithParams(`/api/game/pass`,{
        'quiz_id': quiz_id,
        'question': current_question
    });
    if (res){
        console.log(res);
        const questionData = res.question;
        displayQuestion(questionData);
        updatePowerUpElement(buttonPass, true);
    }
}