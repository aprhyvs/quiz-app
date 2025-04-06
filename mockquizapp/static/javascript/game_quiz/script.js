const modal = document.getElementById("modal");
const levelInfo = document.querySelector(".level-info");
var global_current_question = null;
var userAnswer = [];
let temporary_answer = null;


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
    const levelPointDiv = document.createElement("div");
    levelPointDiv.classList.add("level-point");
    
    //level
    const levelP = document.createElement("p");
    levelP.textContent = 20 - i;
    levelP.classList.add("level", "roboto-bold");
    
    //points
    const pointP = document.createElement("p");
    pointP.textContent = points[i]; 
    pointP.classList.add("points", "roboto-light");

    levelPointDiv.appendChild(levelP);
    levelPointDiv.appendChild(pointP);
    listContainer.appendChild(levelPointDiv);
}

function playAudio(audio){
    const audioElement = document.createElement('audio');
    audioElement.src = audio;
    audioElement.play();
}


async function processChoice(choiceString){
    console.log(choiceString);

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
                    console.log(res);
                    return res;
                }
            }
        }

    const result = await evaluateChoice(choiceString);
    if (result){
        showAnswerEffects(result);
    }
}

function showAnswerEffects(result){
        //TODO: Show the visual effects and play audio here.


}

function showConfirmationPrompt(choice) {
    const confirmationPromptElement = document.getElementById('confirmation-form-pop');
    const choiceElement = document.querySelector(`.svg-choice-${choice}`);
    if (choiceElement) {
        //TODO: Make the choice flash yellow during confirmation screen.
        choiceElement.style.fill = "var(--gold)";
    }
    confirmationPromptElement.style.display = "flex";
    temporary_answer = choice;
}

function displayQuestion(questionData){
    const questionElement = document.querySelector(".question-text");
    const options = questionData.options.map(opt => opt.replace(/^[A-D]\.\s*/, ""));
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
            console.log(res);
            return res.question;
        }
    }
    return null;
}


document.addEventListener("DOMContentLoaded", async function () {
    const quiz_id = sessionStorage.getItem('quiz_id');
    if (quiz_id) {
        res = await getDataFromUrlWithParams(`/api/game/get/quiz`,{
            'quiz_id': quiz_id
        });
        if (res) {
            const current_question = res.data.currently_answered_question + 1; // adds 1 upon entering to get the actual question instead of 0
            const question = await questionFetch(current_question);
            if (question) {
                displayQuestion(question);
                global_current_question = current_question;
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
}

document.getElementById("confirm-confirmation-but").addEventListener('click', function() {
    processChoice(temporary_answer);
    closeConfirmationPrompt();
});
document.getElementById("cancel-confirmation-but").addEventListener('click', function() {
    closeConfirmationPrompt();
});
