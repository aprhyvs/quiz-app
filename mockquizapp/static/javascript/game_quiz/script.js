const modal = document.getElementById("modal");
const levelInfo = document.querySelector(".level-info");

if (modal && levelInfo) {
    // Show modal when clicking level-info
    levelInfo.addEventListener("click", function () {
        modal.style.display = "block";
    });

    // Close modal when clicking outside modal-content
    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
}

//modal content
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
