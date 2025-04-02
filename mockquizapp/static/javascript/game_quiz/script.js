const modal = document.getElementById("modal");
const levelInfo = document.querySelector(".level-info");

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


