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
let safeLevels = [];
let playerTotalWorth = 0;
let timer = null;
let timeStop = false;
var initialQuizData = {};
var isUsingVoice = false;
let voiceCooldownTimer = 5;
var cannotAnswer = false;
var currentAudio = null;
let timerDelay;
let previousQuiz;
let mainMenuActive = false;
let currentMusic;
let gameSettings = {};
let longSound;
function setGameSettings(gameSettingsInput){
    gameSettings = gameSettingsInput;
    //console.log("Saving Game Settings")
    localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
    if (gameSettings.voice == false){
        if (currentAudio){
            currentAudio.pause();
        }
    }
    if (gameSettings.sound == false){
        if (longSound){
            stopAudio(longSound); // Stop the long sound (Timer in this case)
        }
    }else{
        if (longSound){
            playAudio(longSound); // Play the long sound (Timer in this case)
        }
    }
    if (gameSettings.music == false){
        toggleMusic(false);
    }else{
        toggleMusic(true);
    }
}

function toggleMusic(state){
    if (state == true){
        if (currentMusic){
            currentMusic.play();
        }
    }else{
        if (currentMusic){
            currentMusic.pause();
        }
    }
}

function startBGM(music){
    if (gameSettings.music == true){
        currentMusic = music;
        currentMusic.play();
    }
}

function getSessionGameSettings(){
    //console.log("Getting Game Settings")
    gameSettings = JSON.parse(localStorage.getItem('gameSettings'));
    return gameSettings;
}

function getCurrentGameGameSettings(){
    const gameSettings = {
        music: document.querySelector('input[name="music"]').checked,
        sound: document.querySelector('input[name="sound"]').checked,
        voice: document.querySelector('input[name="voice"]').checked
      };
      return gameSettings;
}

function displayGameSettingOptions(){
    document.querySelector('input[name="music"]').checked = gameSettings.music;
    document.querySelector('input[name="sound"]').checked = gameSettings.sound;
    document.querySelector('input[name="voice"]').checked = gameSettings.voice;
}

function displayIngameSettings(state){
    if (state == true){
        document.getElementById("ingame-settings").style.display = "flex"; 
    }else{
        document.getElementById("ingame-settings").style.display = "none"; 
    }
    
}

function checkAndAnimateText() {
    // Select multiple elements by their IDs
    const elements = ['choice-A', 'choice-B', 'choice-C', 'choice-D']; // Add your IDs here
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const parentElement = element.closest('.answer');
            const wordCount = element.innerText.split(' ').length;

            // Apply the class based on word count
            if (wordCount >= 8) {
                parentElement.classList.add('scroll-text'); // Add scroll-text class if word count >= 8
            } else {
                parentElement.classList.remove('scroll-text'); // Remove scroll-text class if word count < 8
            }
        }
    });
}

// Call the function on window load and whenever the text changes
window.onload = checkAndAnimateText;

// Create the MutationObserver for each element
const elementsToObserve = ['choice-A', 'choice-B', 'choice-C', 'choice-D'];
elementsToObserve.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
        const observer = new MutationObserver(checkAndAnimateText);
        observer.observe(element, { childList: true, subtree: true });
    }
});

//Sound Related
function playTimerSound(){
    const timerSound = new Audio("/static/sounds/SFX/clock-ticking.mp3");
    longSound = timerSound;
    playAudio(timerSound);
}

function getAbsoluteMediaURL(relativePath) {
    return new URL(relativePath, window.location.origin).href;
}



//Timer
function resetTimer(){
    timer = initialQuizData.timer_countdown;
    sessionStorage.setItem("timer", timer);
}

function displayTimer(state){
    if (state == true){
        document.querySelector(".timer").style.display = "flex";
    }else{
        document.querySelector(".timer").style.display = "none";
    }
}

function stopTimer(state){
    if (state == true) {
        timeStop = true;
    }else{
        timeStop = false;
    }
}

function saveTimerToSession(){
    sessionStorage.setItem("timer", timer);
}

function tickDownTimer(){
    timer--;
    saveTimerToSession(timer);
    timerElement = document.getElementById('timer-text');
    timerElement.textContent = timer;
}

function operateTimer(){
    const timerCounter = setInterval(() => {
        if (timeStop == false){
            tickDownTimer();
            if (timer == 10) {
                if (longSound){
                    stopAudio(longSound); // Stop the long sound (Timer in this case)
                    longSound = null;// Reset the longsound variable
                    playTimerSound();
                }else{
                    playTimerSound(); // Play the timer sound
                }
            }
            displayTimer(true);
            if (timer < 0) {
                if (longSound){
                    stopAudio(longSound); // Stop the long sound (Timer in this case)
                    longSound = null;// Reset the longsound variable
                }

                clearInterval(timerCounter);
                // Fail
                timeOutMistake();
                timerElement = document.getElementById('timer-text');
                timerElement.textContent = 0;
                timer = 0;
            }

        }else{
            clearInterval(timerCounter);
        }
      }, 1000); // 1000ms = 1 second
}

function startTimer(){
    clearTimeout(timerDelay);
    const timerSession = sessionStorage.getItem("timer");
    previousQuiz = sessionStorage.getItem("previous_quiz_id");
    if (previousQuiz == sessionStorage.getItem("quiz_id")){
        //console.log("Continuing Quiz.")
        if (timerSession){
            timer = timerSession;
            timerElement = document.getElementById('timer-text');
            timerElement.textContent = timer;
        }else{
            //console.log("Timer not found, restarting timer.")
            timer = initialQuizData.timer_countdown;
        }
    }else{
        previousQuiz = sessionStorage.setItem("previous_quiz_id", sessionStorage.getItem("quiz_id"));
        //console.log("New Quiz...")
        //console.log("Timer not found, restarting timer.")
        timer = initialQuizData.timer_countdown;
    }
    
    if (timer < 0) {
        timerElement = document.getElementById('timer-text');
        timerElement.textContent = 0;
        timer = 0;
        //Fail
        timeOutMistake();
    }else{
        isUsingVoice = false;
        
        timerDelay = setTimeout(operateTimer, 10000);
    }
}

async function timeOutMistake(){
    const current_question = global_current_question;
    const quiz_id = sessionStorage.getItem('quiz_id');
    if (!quiz_id) {
        return null;
    }
    res = await getDataFromUrlWithParams(`/api/game/timeout`,{
        'quiz_id': quiz_id,
        'question': current_question
    });
    if (res) {
        resetDoubleDip();
        closeConfirmationPrompts();
        showAnswerEffects(null, current_question);
        return res;
    }
}


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
const reversedPoints = [...points].reverse();

// list out level and its respective points
for (let i = 0; i < points.length; i++) {
    const level = i + 1;
    const reversedIndex = points.length - 1 - i;
    
    listContainer.insertAdjacentHTML("afterbegin", 
        `
        <div class="level-point-${level} level-point">
        <p class="level-${level} level roboto-bold">${level}</p>
        <p class="points points-${level} roboto-light">${points[reversedIndex]}</p>
        </div>
        `);
}

function playAudio(audio){
    if (gameSettings.sound == false){ return; }
    if (audio){
        audio.play();
    }
}

function stopAudio(audio){
    if (audio){
        audio.pause();
    }
}

async function endGame() {
    sessionStorage.removeItem('timer');
    const quiz_status = await getQuizStatus(sessionStorage.getItem('quiz_id'));
    if (quiz_status) {
        //console.log("Finished Game, proceeding to quiz complete");
        //console.log(quiz_status);
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
    if (parseInt(current_question) > 19){
        const current_answered_questions = await getAnsweredQuestions(sessionStorage.getItem('quiz_id'));
        //console.log("More than 19 questions have been answered!");
        if (current_answered_questions) {
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
    cannotAnswer = true;
    const quiz_id = sessionStorage.getItem('quiz_id');
    res = await getDataFromUrlWithParams(`/api/game/get/answer`,{
        'quiz_id': quiz_id,
        'question': current_question
    });
    if (res) {
        const question = res.question;
        const isCorrect = question.is_correct;
        
        const correctSound = new Audio("/static/sounds/SFX/correct-sfx.mp3");
        const wrongSound = new Audio("/static/sounds/SFX/wrong-sfx.mp3");
        

        if (isCorrect == true){
            const choiceElement = document.querySelector(`.svg-choice-${choice}`);

            resetFlashYellowClass();
            flashGreen(choiceElement);
            playAudio(correctSound);
        }else{
            let choiceElement
            if (choice){ // If the choice is wrong, flash the choice red.
                
                choiceElement = document.querySelector(`.svg-choice-${choice}`);
                flashRed(choiceElement);
                resetFlashYellowClass();
                const correct_answer = res.question.correct_answer;
                const correctAnswerElement = document.querySelector(`.svg-choice-${correct_answer}`)
                flashGreen(correctAnswerElement); // Flash the correct answer
            }else{
                resetFlashYellowClass();
                const correct_answer = res.question.correct_answer;
                const correctAnswerElement = document.querySelector(`.svg-choice-${correct_answer}`)
                flashRed(correctAnswerElement); // Flash the correct answer
            }
            playAudio(wrongSound);
        }
        highlightQuestionWorthRealtime(document.querySelector(`.level-point-${global_current_question - 1}`), isCorrect);


        const quiz_id = sessionStorage.getItem('quiz_id');
    if (quiz_id) {
        res2 = await getDataFromUrlWithParams(`/api/game/get/quiz`,{
            'quiz_id': quiz_id
        });
        if (res2){
            const points = res2.data.total_worth
            showTotalWorth(points);
        }
    }
    }
}


async function showAnswerEffects(choice, current_question) {
    if (doubleDipIsActive == true){
        showDoubleDipWrongAndCorrectAnswer(choice, current_question);
    }else{
        showWrongAndCorrectAnswer(choice, current_question);
    }
    
    // proceed to the next question
    const isLastQuestion = await checkQuizNumber(current_question);
    if (isLastQuestion == true) {
        endGame();
    }else{
        displayTimer(false);
        resetTimer();
        nextQuestion(current_question);

        
    }
}

async function nextQuestion(current_question){
    global_current_question = current_question + 1;
    resetDoubleDip();
    const questionData = await questionFetch(global_current_question);
    await new Promise(resolve => setTimeout(resolve, 3000));
    resetFlashes();
    resetTimer();
    choicesOpacityReset(current_question);
    if (questionData){
        displayQuestion(questionData);
        showQuestionNumber(global_current_question);
        const questionWorth = reversedPoints[current_question];
        showQuestionWorth(questionWorth);
    }
    highlightCurrentQuestionWorth(document.querySelector(`.level-point-${global_current_question}`));
    displaySafeLevels();
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

function notUsingVoice(){
    if (isUsingVoice == false){
        return;
    }
    const voiceCooldownInterval = setInterval(() => {
        if (voiceCooldownTimer > 0) {
            voiceCooldownTimer--;
        } else {
            clearInterval(voiceCooldownInterval);
            isUsingVoice = false;
            voiceCooldownTimer = 5;
        }
    }, 1000);
}

async function generateVoiceMessageGame(textMessage){
    const formData = new FormData();
    formData.append('text', textMessage);
    fetch('/api/generate/voice',
    {
        method: 'POST',
        headers: { 
            "X-CSRFToken": csrf_token,
        },
        body: formData,
    }
    )
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        return response.blob(); // Get the file as a Blob
    })
    .then(blob => {
        // Create a URL for the Blob and play the audio
        if (currentAudio){
            currentAudio.pause();
        }
        const audioURL = URL.createObjectURL(blob);
        currentAudio = new Audio(audioURL);
        if (gameSettings.voice == true){
            currentAudio.play(); // Play the audio
        }
    })
    .catch(error => {
        console.error('Error fetching the audio file:', error);
    });
}


async function voiceOutMessage(message) {
    //console.log(isUsingVoice);
    if (isUsingVoice == true) {
        return;
    }else{
        generateVoiceMessageGame(message);
    }
}

function showConfirmationPrompt(choice) {
    if (cannotAnswer == true){
        //console.log("This shouldn't happen!");
        return;
    }
    const confirmationPromptElement = document.getElementById('confirmation-form-pop');
    if (doubleDipIsActive == true){
        // double dip functionality here.
        confirmationPromptElement.style.display = "flex";
        voiceOutMessage("Is that your final answer?");
        isUsingVoice = true;
        return;
    }


    if (!availableChoices.includes(choice)) {
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
    
    voiceOutMessage("Is that your final answer?");
    isUsingVoice = true;
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
    questionElement.innerHTML = `
                                    <p>
                                    ${questionData.question}
                                    </p>
                                `
    displayChoices(options);
    textifiedQuestionAndChoices = textifyQuestionPlusChoices(questionData.question, options);
    isUsingVoice = false;
    voiceOutQuestion(textifiedQuestionAndChoices);
    resizeTextOnOverflowAndWords(questionElement, { min: 32, max: 40, step: 8, wordThreshold: 30 });
    displayAvailablePowerUps();
    disabledPowerUps = [];
    stopTimer(false);
    startTimer();
    cannotAnswer = false;
}

function textifyQuestionPlusChoices(question, choices){
    const textifiedChoices = "A, " + choices[0] + ". B, " + choices[1] + ".C, " + choices[2] + ". or D, " + choices[3] + ".";
    const textifiedQuestionAndChoices = question + " " + textifiedChoices;
    return textifiedQuestionAndChoices;
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

function voiceOutQuestion(textifiedQuestionAndChoices){
    voiceOutMessage(textifiedQuestionAndChoices);
    isUsingVoice = true;
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


function displaySafeLevelText(safeLevelElement, safeLevelPointsElement){
    safeLevelElement.classList.add("safe-level-text-indicator")
    safeLevelPointsElement.classList.add("safe-level-text-indicator")
}

function removeSafeLevelText(safeLevelElement, safeLevelPointsElement){
    safeLevelElement.classList.remove("safe-level-text-indicator")
    safeLevelPointsElement.classList.remove("safe-level-text-indicator")
}

function displaySafeLevels(){
    const current_question = global_current_question;
    for (let i = 0; i < safeLevels.length; i++) {
        safeLevelInteger = parseInt(safeLevels[i]);
        if ( safeLevelInteger != current_question){
            const safeLevelElement = document.querySelector(`.level-${safeLevelInteger}`);
            const safeLevelPointsElement = document.querySelector(`.points-${safeLevelInteger}`);
            displaySafeLevelText(safeLevelElement, safeLevelPointsElement);
        }else{
            const safeLevelElement = document.querySelector(`.level-${safeLevelInteger}`);
            const safeLevelPointsElement = document.querySelector(`.points-${safeLevelInteger}`);
            removeSafeLevelText(safeLevelElement, safeLevelPointsElement);
        }
}

}

async function highlightQuestionWorth(worthElement, question_number){ 
    const isCorrect = await getCorrectStatus(question_number);
    if (isCorrect == true){
        modalFlash(worthElement, "green");
    }else{
        modalFlash(worthElement, "red");
    }
}

function highlightQuestionWorthRealtime(worthElement, isCorrect){ 
    if (isCorrect == true){
        modalFlash(worthElement, "green");
    }else{
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

function showTotalWorth(worth){
    const pointsElement = document.querySelector(`.total-points`)
    const worthFormatted = worth.toLocaleString();
    pointsElement.innerText = "TOTAL: ₱" + worthFormatted;
}

function showQuestionNumber(number){
    const questionInfoElement = document.querySelector(`.q-level`);
    questionInfoElement.innerText = "Q" + number;
}

function showQuestionWorth(worth){
    const questionWorthElement = document.querySelector(`.q-worth`);
    //const worthFormatted = worth.toLocaleString();
    //console.log("showing worth... " + worth);
    questionWorthElement.innerText = worth;//formatted;
}


async function startGame(quizData){
    const questions = quizData.questions;
    const current_question = quizData.currently_answered_question + 1; // adds 1 upon entering to get the actual question instead of 0
    const question = await questionFetch(current_question);
    playerTotalWorth = quizData.total_worth;
    const safeLevelsStr = quizData.safe_level
    const has5050 = quizData.game_has_5050;
    safeLevels = safeLevelsStr.split(",");
    const BGM = new Audio("/static/sounds/BGM/bgm.mp3");
    BGM.volume = 0.12;
    startBGM(BGM);
    mainMenuActive = false;
        if (question) {
            global_current_question = current_question;
            timer = quizData.timer;

            displayQuestion(question);
            displayChoicesButtons();
            showPowerUpButtons();

            if (has5050 == true) {
                //console.log("Has 5050")
                activate5050();
            }
            highlightAnsweredQuestionsWorth(questions);
            highlightCurrentQuestionWorth(document.querySelector(`.level-point-${current_question}`));
            showQuestionNumber(current_question);
            const questionWorth = reversedPoints[current_question - 1];
            showQuestionWorth(questionWorth);
            showTotalWorth(playerTotalWorth);
            displaySafeLevels();
                
        }
    
}

function displayMainMenu(quizData){
    mainMenuActive = true;
    const mainMenuElement = document.querySelector(".question-text");
    const mainMenuText = quizData.quiz_title;
    mainMenuElement.innerText = mainMenuText;
    displayTimer(false);
    hideChoices();
    displayMenuButtons();
    hidePowerUpButtons();
}

function hidePowerUpButtons(){
document.getElementById("50-50").style.display = "none";
document.getElementById("x2").style.display = "none";
document.getElementById("ask-ai").style.display = "none";
document.getElementById("pass").style.display = "none";
}

function showPowerUpButtons(){
    document.getElementById("50-50").style.display = "flex";
    document.getElementById("x2").style.display = "flex";
    document.getElementById("ask-ai").style.display = "flex";
    document.getElementById("pass").style.display = "flex";
}

function displayMenuButtons(){
    const menuButtonStart = document.querySelector(".svg-choice-A");
    const menuButtonQuit = document.querySelector(".svg-choice-B");
    menuButtonStart.style.display = "flex";
    menuButtonQuit.style.display = "flex";

    const menuButtonStartText = document.getElementById("choice-A");
    const menuButtonQuitText = document.getElementById("choice-B");
    menuButtonStartText.textContent = "Start Quiz";
    menuButtonQuitText.textContent = "Quit Game";
    
}

function displayChoicesButtons(){
    const choiceA = document.querySelector(".svg-choice-A");
    const choiceB = document.querySelector(".svg-choice-B");
    const choiceC = document.querySelector(".svg-choice-C");
    const choiceD = document.querySelector(".svg-choice-D");
    choiceA.style.display = "flex";
    choiceB.style.display = "flex";
    choiceC.style.display = "flex";
    choiceD.style.display = "flex";
}

function hideChoices(){
    const choiceA = document.querySelector(".svg-choice-A");
    const choiceB = document.querySelector(".svg-choice-B");
    const choiceC = document.querySelector(".svg-choice-C");
    const choiceD = document.querySelector(".svg-choice-D");
    choiceA.style.display = "none";
    choiceB.style.display = "none";
    choiceC.style.display = "none";
    choiceD.style.display = "none";
}


document.addEventListener("DOMContentLoaded", async function () {
    const quiz_id = sessionStorage.getItem('quiz_id');
    if (quiz_id) {
        res = await getDataFromUrlWithParams(`/api/game/get/quiz`,{
            'quiz_id': quiz_id
        });
        if (res) {
            const quiz = res.data;
            //console.log(quiz);
            if (quiz.is_answered == true) { // Check if the quiz is already done
                //console.log("This quiz has been answered. Going to end game...");
                endGame();
                return;
            }
            const sessionGameSettings = getSessionGameSettings();
            if (sessionGameSettings){
                setGameSettings(sessionGameSettings);
            }else{
                gameSettings = {
                    music: true,
                    sound: true,
                    voice: true,
                }
                setGameSettings(gameSettings);
            }
            //console.log(sessionGameSettings);
            initialQuizData = quiz; // Ayusa nala ini pag may main menu na didi isingit.
            displayMainMenu(quiz);
        }
    }
});



//Choice Buttons ---------------------------------------------------

document.querySelector(".choice-A").addEventListener('click', function() {
    if (mainMenuActive == true) {
        startGame(initialQuizData);
        return;
    }
    if (cannotAnswer == true ){ return; }
    if (doubleDipIsActive == true) {
        if (temporary_answers.includes("A")){
            //console.log("You already chose this...");
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
    if (mainMenuActive == true) {
        window.location.href = `/student_quizzespage`;
        return;
    }
    if (cannotAnswer == true ){ return; }
    if (doubleDipIsActive == true) {
        if (temporary_answers.includes("B")){
            //console.log("You already chose this...");
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
    if (cannotAnswer == true ){ return; }
    if (doubleDipIsActive == true) {
        if (temporary_answers.includes("C")){
            //console.log("You already chose this...");
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
    if (cannotAnswer == true ){ return; }
    if (doubleDipIsActive == true) {
        if (temporary_answers.includes("D")){
            //console.log("You already chose this...");
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

function closeConfirmationPrompts(){
    closeConfirmationPrompt(); // Close main confirmation prompt
    document.getElementById("50-form-pop").style.display = "none"; //close 50-50 powerup prompt
    document.getElementById("x2-form-pop").style.display = "none"; //Close double dip prompt
    document.getElementById("ai-form-pop").style.display = "none"; //close ai prompt
    document.getElementById("pass-form-pop").style.display = "none"; //close pass prompt
}

function closeConfirmationPrompt() {
    temporary_answers = [];
    document.getElementById("confirmation-form-pop").style.display = "none";
    resetFlashYellowClass(); 
}

document.getElementById("confirm-confirmation-but").addEventListener('click', function() {
    if (doubleDipIsActive == true) {
        if (cannotAnswer == false){
            processDoubleChoice(temporary_answers);
            //console.log("sent " + temporary_answers);
            processChoice(temporary_answer);
            resetTimer();
            stopTimer(true);
            
        }
        closeConfirmationPrompt();
        return;
    }
    if (cannotAnswer == false){
        processChoice(temporary_answer);
        resetTimer();
        stopTimer(true);
    }
    closeConfirmationPrompt();
});
document.getElementById("cancel-confirmation-but").addEventListener('click', function() {
    closeConfirmationPrompt();
    notUsingVoice();
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
    //console.log(state);
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
                //console.log(disabledPowerUps);
            }
        }else{
            updatePowerUpElement(buttonAskAi, powerUps.has_hint);
        }
    }
}


//Settings
document.getElementById("ingame-settings-button").addEventListener("click", async function (event) { 
    event.preventDefault(); 
    displayIngameSettings(true);
    displayGameSettingOptions();
});

document.getElementById("cancel-ingame-but").addEventListener('click', function() {
    displayIngameSettings(false);
});

document.getElementById("confirm-ingame-but").addEventListener('click', function() {
    document.getElementById("ingame-settings").style.display = "none";
    const playerGameSettings = getCurrentGameGameSettings();
    setGameSettings(playerGameSettings);
});

//50-50


document.getElementById("50-50").addEventListener("click", async function (event) { 
    event.preventDefault(); 
    if (globalPowerUps.has_5050 == true || disabledPowerUps.includes("50_50")){
        //console.log("50-50 Power Up not available.");
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
    if (cannotAnswer == false){
        activate5050();
    }
});

async function activate5050(){
    const quiz_id = sessionStorage.getItem('quiz_id');
    if (globalPowerUps.has_5050 == true){
        //console.log("50-50 Power Up not available.");
        return false;
    }
    const res = await getDataFromUrlWithParams(`/api/game/5050`,{
        'quiz_id': quiz_id,
        'question': global_current_question
    });
    if (res) {
        //console.log(res);
        data5050 = res["5050"];
        globalPowerUps.has_5050 = true;
        const questions5050 = Object.keys(data5050);
        const question5050 = questions5050[0];
        const current_question = global_current_question;
        if (current_question == question5050) { //If the current question is the 50-50 question...
            displayPossibleAnswers(data5050);
            //console.log("50-50 Power Up activated.");
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
        //console.log(question5050);
        //console.log(powerUps);
    }
    

}

//AI
document.getElementById("ask-ai").addEventListener("click", async function (event) { 
    event.preventDefault(); 
    if (disabledPowerUps.includes("ask_ai") ){
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
    if (globalPowerUps.has_hint == false && cannotAnswer == false){ // If hint has been used...
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
        //console.log("Current question is the hint question. " + current_question);
        return true;
    }else{
        //console.log("Not the hint question. " + questionHint + " != " + current_question);
        return false;
    }
}

async function activateAiHint(){
    const quiz_id = sessionStorage.getItem('quiz_id');
    if (globalPowerUps.has_hint == true){ // If hint has been used...
        //console.log("Hint already used.");
        return; // stop function
    }
    const res = await getDataFromUrlWithParams(`/api/game/generate/hints`,{
        'quiz_id': quiz_id,
        'question': global_current_question
    });
    if (res){
        //console.log(res);
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
        return;
    }
    event.preventDefault(); 
    document.getElementById("x2-form-pop").style.display = "flex"; 
});

document.getElementById("cancel-x2-but").addEventListener('click', function() {
    document.getElementById("x2-form-pop").style.display = "none";
});

document.getElementById("confirm-x2-but").addEventListener('click', function() {
    if (cannotAnswer == false){
        const buttonDoubleDip = document.getElementById('x2');
        updatePowerUpElement(buttonDoubleDip, true);
        disableOtherPowerUps("x2");
        doubleDipIsActive = true;
    }
    document.getElementById("x2-form-pop").style.display = "none";
});

function resetDoubleDip(){
    doubleDipIsActive = false;
    temporary_answers = [];
    temporary_answer = [];
}
function glowChoice(choice) {
    // Now add the flash-yellow class to the newly selected SVG element
    const choiceElement = document.querySelector(`.svg-choice-${choice}`);
    flashYellow(choiceElement);
}

function checkTemporaryAnswers(){
    //console.log(temporary_answers)
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
        resetDoubleDip();

    const result = await evaluateChoice(final_choices);
    if (result){
        //console.log(current_question);
        showAnswerEffects(final_choices, current_question);
    }

      // Optionally reset the flash-yellow class manually
      resetFlashYellowClass();
}

async function showDoubleDipWrongAndCorrectAnswer(choices, current_question){
    const quiz_id = sessionStorage.getItem('quiz_id');
    //console.log(current_question)
    res = await getDataFromUrlWithParams(`/api/game/get/answer`,{
        'quiz_id': quiz_id,
        'question': current_question
    });
    if (res) {
        doubleDipIsActive = false;
        const question = res.question;
        const isCorrect = question.is_correct;
        const correct_answer = res.question.correct_answer;

        const correctSound = new Audio("/static/sounds/SFX/correct-sfx.mp3");
        const wrongSound = new Audio("/static/sounds/SFX/wrong-sfx.mp3");

        if (isCorrect == true){
            
            const choiceElement = document.querySelector(`.svg-choice-${correct_answer}`);
            resetFlashYellowClass();
            flashGreen(choiceElement);
            playAudio(correctSound);
        }else{
            resetFlashYellowClass();
            let choiceElement1
            let choiceElement2
            
            if (!choices){ 
                //console.log("Did not make a choice... Timeouted??")
                const correct_answer = res.question.correct_answer;
                const correctAnswerElement = document.querySelector(`.svg-choice-${correct_answer}`)
                flashRed(correctAnswerElement); // Flash the correct answer
            }else{ // If player made a choice..
                if (choices[0]){ // If the player made a choice but is wrong, flash the choice red.
                    choiceElement1 = document.querySelector(`.svg-choice-${choices[0]}`);
                    flashRed(choiceElement1);
                }
                if (choices[1]){
                    choiceElement2 = document.querySelector(`.svg-choice-${choices[1]}`);
                    flashRed(choiceElement2);
                }
                const correct_answer = res.question.correct_answer;
                const correctAnswerElement = document.querySelector(`.svg-choice-${correct_answer}`)
                flashGreen(correctAnswerElement); // Flash the correct answer
            }
            playAudio(wrongSound);
            
        }
        temporary_answers = [];
        highlightQuestionWorthRealtime(document.querySelector(`.level-point-${global_current_question - 1}`), isCorrect);
    }
}

//pass

document.getElementById("pass").addEventListener("click", async function (event) { 
    if (disabledPowerUps.includes("pass") ){
        //console.log(disabledPowerUps);
        return;
    }

    if (globalPowerUps.has_pass == true){ // If pass has been used...
        //console.log("Pass already used.");
        return; // stop function
    }

    event.preventDefault(); 
    document.getElementById("pass-form-pop").style.display = "flex"; 
});

document.getElementById("cancel-pass-but").addEventListener('click', function() {
    document.getElementById("pass-form-pop").style.display = "none";
});

document.getElementById("confirm-pass-but").addEventListener('click', function() {
    document.getElementById("pass-form-pop").style.display = "none";
    if (cannotAnswer == false){
        processPass();
    }
});

async function processPass(){
    //console.log("Pass fired.")
    stopTimer(true);
    const current_question = global_current_question;
    const quiz_id = sessionStorage.getItem('quiz_id');
    res = await getDataFromUrlWithParams(`/api/game/pass`,{
        'quiz_id': quiz_id,
        'question': current_question
    });
    if (res){
        //console.log(res);
        const questionData = res.question;
        displayQuestion(questionData);
        const buttonPass = document.getElementById('pass');
        updatePowerUpElement(buttonPass, true);
        globalPowerUps.has_pass = true;
    }
}