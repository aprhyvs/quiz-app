
var selected_student = null;

async function displayListOfStudents(){ 
    const students = await getDataFromUrl('/api/admin/students');
    if (students){
        const lis_of_user_tag = document.querySelector(".list-of-users");
        for (const studentID in students) {
            if (students.hasOwnProperty(studentID)) {
                const student = students[studentID];
                lis_of_user_tag.insertAdjacentHTML("afterbegin",
                    `
                        <div class="user-card" id="${studentID}-card">
                            ${
                                student.profile_pic	 
                               ? `<img class="student-avatar" src="${student.profile_pic}" alt="Student Avatar">`
                               : `
                                <svg  viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M26 0C11.648 0 0 11.648 0 26C0 40.352 11.648 52 26 52C40.352 52 52 40.352 52 26C52 11.648 40.352 0 26 0ZM26 7.8C30.316 7.8 33.8 11.284 33.8 15.6C33.8 19.916 30.316 23.4 26 23.4C21.684 23.4 18.2 19.916 18.2 15.6C18.2 11.284 21.684 7.8 26 7.8ZM26 44.72C19.5 44.72 13.754 41.392 10.4 36.348C10.478 31.174 20.8 28.34 26 28.34C31.174 28.34 41.522 31.174 41.6 36.348C38.246 41.392 32.5 44.72 26 44.72Z" fill="currentColor"/>
                                </svg>
                               `
                            }
                            
                            <h3 class="roboto-bold">${student?.username}</h3>
                            <h6 class="roboto-light">${student?.fname} ${student?.mname} ${student?.lname}</h6>
                            <h6 class="roboto-light">${student?.created_at}</h6>
                            <div class="buttons-container">
                                <button class="roboto-bold" id="visit-button-${studentID}">VISIT</button> 
                                <button class="roboto-bold" id="edit-button-${studentID}">EDIT</button>
                                <button class="roboto-bold" id="delete-button-${studentID}">DELETE</button>
                            </div>
                        </div>
                    `
                );
                document.getElementById(`visit-button-${studentID}`).addEventListener('click', () => {
                    sessionStorage.setItem('studentID', studentID); //  # DIDI KA MA BASE SAN DATA SA VISIT
                    window.location.href = `/student_analytics`;
                });
                document.getElementById(`edit-button-${studentID}`).addEventListener('click', () => {
                    sessionStorage.setItem('studentID', studentID);
                    window.location.href = `/admin_editor`;
                });
                document.getElementById(`delete-button-${studentID}`).addEventListener('click', () => {
                    selected_student = student;
                    document.getElementById("delete-text").textContent = "Are you sure you want to delete " + student.username + "?";
                    document.getElementById("delete-form-pop").style.display = "flex";
                });
            }
        }


    }
}



async function displayRankings(rankingsData) {


    function displayWeeklyRankings(weeklyRankings){
        if (!weeklyRankings || weeklyRankings.length === 0) {
            console.error("No weekly rankings available!");
            return;
        }
        // Select the ranking elements from the HTML
        const firstRank = document.querySelector(".rank-weekly-first-name");
        const secondRank = document.querySelector(".rank-weekly-second-name");
        const thirdRank = document.querySelector(".rank-weekly-third-name");
        const fourthRank = document.querySelector(".rank-weekly-fourth-name");
        const fifthRank = document.querySelector(".rank-weekly-fifth-name");
    
        // Ensure elements exist before modifying them
        if (firstRank) {
            firstRank.textContent = weeklyRankings[0]?.student_name || "Vacant";
            if (weeklyRankings[0]?.profile_pic) {
                const oldSvg = firstRank.querySelector('svg');
                if (oldSvg) {
                    // Replace the SVG with an img element
                    const newImg = document.createElement('img');
                    newImg.setAttribute('src', weeklyRankings[0]?.profile_pic); // Set the source of the new image
                    newImg.setAttribute('alt', 'New Image'); // Add an alt description for accessibility

                    // Replace the SVG with the new img
                    firstRank.replaceChild(newImg, oldSvg);
                }
            }
        }
        if (secondRank) {
            secondRank.textContent = weeklyRankings[1]?.student_name || "Vacant";
            if (weeklyRankings[1]?.profile_pic) {
                const oldSvg = secondRank.querySelector('svg');
                if (oldSvg) {
                    // Replace the SVG with an img element
                    const newImg = document.createElement('img');
                    newImg.setAttribute('src', weeklyRankings[1]?.profile_pic); // Set the source of the new image
                    newImg.setAttribute('alt', 'New Image'); // Add an alt description for accessibility

                    // Replace the SVG with the new img
                    secondRank.replaceChild(newImg, oldSvg);
                }
            }
        }
        if (thirdRank) {
            thirdRank.textContent = weeklyRankings[2]?.student_name || "Vacant";
            if (weeklyRankings[2]?.profile_pic) {
                const oldSvg = thirdRank.querySelector('svg');
                if (oldSvg) {
                    // Replace the SVG with an img element
                    const newImg = document.createElement('img');
                    newImg.setAttribute('src', weeklyRankings[2]?.profile_pic); // Set the source of the new image
                    newImg.setAttribute('alt', 'New Image'); // Add an alt description for accessibility
                    // Replace the SVG with the new img
                    thirdRank.replaceChild(newImg, oldSvg);
                }
            }
        }
        if (fourthRank) {
            fourthRank.textContent = weeklyRankings[3]?.student_name || "Vacant";
            if (weeklyRankings[3]?.profile_pic) {
                const oldSvg = fourthRank.querySelector('svg');
                if (oldSvg) {
                    // Replace the SVG with an img element
                    const newImg = document.createElement('img');
                    newImg.setAttribute('src', weeklyRankings[3]?.profile_pic); // Set the source of the new image
                    newImg.setAttribute('alt', 'New Image'); // Add an alt description for accessibility
                    // Replace the SVG with the new img
                    fourthRank.replaceChild(newImg, oldSvg);
                }
            }
        }
        if (fifthRank) {
            fifthRank.textContent = weeklyRankings[4]?.student_name || "Vacant";
            if (weeklyRankings[4]?.profile_pic) {
                const oldSvg = fifthRank.querySelector('svg');
                if (oldSvg) {
                    // Replace the SVG with an img element
                    const newImg = document.createElement('img');
                    newImg.setAttribute('src', weeklyRankings[4]?.profile_pic); // Set the source of the new image
                    newImg.setAttribute('alt', 'New Image'); // Add an alt description for accessibility
                    // Replace the SVG with the new img
                    fifthRank.replaceChild(newImg, oldSvg);
                }
            }
        }
    }
    
    function displayMonthlyRankings(monthlyRankings){
        if (!monthlyRankings || monthlyRankings.length === 0) {
            console.error("No monthly rankings available!");
            return;
        }
        // Select the ranking elements from the HTML
        const firstRank = document.querySelector(".rank-monthly-first-name");
        const secondRank = document.querySelector(".rank-monthly-second-name");
        const thirdRank = document.querySelector(".rank-monthly-third-name");
        const fourthRank = document.querySelector(".rank-monthly-fourth-name");
        const fifthRank = document.querySelector(".rank-monthly-fifth-name");
    
        // Ensure elements exist before modifying them
        if (firstRank) {
            firstRank.textContent = monthlyRankings[0]?.student_name || "Vacant";
            if (monthlyRankings[0]?.profile_pic) {
                const oldSvg = firstRank.querySelector('svg');
                if (oldSvg) {
                    // Replace the SVG with an img element
                    const newImg = document.createElement('img');
                    newImg.setAttribute('src', monthlyRankings[0]?.profile_pic); // Set the source of the new image
                    newImg.setAttribute('alt', 'New Image'); // Add an alt description for accessibility
                    // Replace the SVG with the new img
                    firstRank.replaceChild(newImg, oldSvg);
                }
            }
        }
        if (secondRank) {
            secondRank.textContent = monthlyRankings[1]?.student_name || "Vacant";
            if (monthlyRankings[1]?.profile_pic) {
                const oldSvg = secondRank.querySelector('svg');
                if (oldSvg) {
                    // Replace the SVG with an img element
                    const newImg = document.createElement('img');
                    newImg.setAttribute('src', monthlyRankings[1]?.profile_pic); // Set the source of the new image
                    newImg.setAttribute('alt', 'New Image'); // Add an alt description for accessibility
                    // Replace the SVG with the new img
                    secondRank.replaceChild(newImg, oldSvg);
                }
            }
        }
        if (thirdRank) {
            thirdRank.textContent = monthlyRankings[2]?.student_name || "Vacant";
            if (monthlyRankings[2]?.profile_pic) {
                const oldSvg = thirdRank.querySelector('svg');
                if (oldSvg) {
                    // Replace the SVG with an img element
                    const newImg = document.createElement('img');
                    newImg.setAttribute('src', monthlyRankings[2]?.profile_pic); // Set the source of the new image
                    newImg.setAttribute('alt', 'New Image'); // Add an alt description for accessibility
                    // Replace the SVG with the new img
                    thirdRank.replaceChild(newImg, oldSvg);
                }
            }
        }
        if (fourthRank) {
            fourthRank.textContent = monthlyRankings[3]?.student_name || "Vacant";
            if (monthlyRankings[3]?.profile_pic) {
                const oldSvg = fourthRank.querySelector('svg');
                if (oldSvg) {
                    // Replace the SVG with an img element
                    const newImg = document.createElement('img');
                    newImg.setAttribute('src', monthlyRankings[3]?.profile_pic); // Set the source of the new image
                    newImg.setAttribute('alt', 'New Image'); // Add an alt description for accessibility
                    // Replace the SVG with the new img
                    fourthRank.replaceChild(newImg, oldSvg);
                }
            }
        }
        if (fifthRank) {
            fifthRank.textContent = monthlyRankings[4]?.student_name || "Vacant";
            if (monthlyRankings[4]?.profile_pic) {
                const oldSvg = fifthRank.querySelector('svg');
                if (oldSvg) {
                    // Replace the SVG with an img element
                    const newImg = document.createElement('img');
                    newImg.setAttribute('src', monthlyRankings[4]?.profile_pic); // Set the source of the new image
                    newImg.setAttribute('alt', 'New Image'); // Add an alt description for accessibility
                    // Replace the SVG with the new img
                    fifthRank.replaceChild(newImg, oldSvg);
                }
            }
        }
    }

    
    displayWeeklyRankings(rankingsData.rankings.weekly)
    displayMonthlyRankings(rankingsData.rankings.monthly)
}


async function setupAdminChartBar(monthlyChart){

    let values = [12, 19, 3, 5, 2, 3, 20, 12, 19, 3, 5, 2]
    
    const res = await getDataFromUrlWithParams('/api/admin/get/stats', {
        'statRequest' : '4'
    })

    if (res?.monthly_quizes_taken?.length > 0){ 
        values = res.monthly_quizes_taken 
    }

    new Chart(monthlyChart, {
        type: 'bar',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            datasets: [{
                label: '# of Quizes Taken',
                data: values,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1 // This ensures the step is always 1
                    }
                }
            }
        }
    });
    
}
 

async function getStudentsNumber(){
    const res = await getDataFromUrlWithParams('/api/admin/get/stats', {
       'statRequest' : '1'
    })
    document.getElementById("number-of-students").textContent = res?.total_students ?? 0 ;
}


function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

async function getGameSettings(){
    const gameSettings = await getDataFromUrl('/api/admin/get/gamesettings');
        
        if (!gameSettings) {
            console.error("Game Settings not loaded")
            return;
        }
    return gameSettings
}

function refreshGameSettingsForm(settings) {

    document.querySelectorAll('input[name="timer"]').forEach(input => {
        if (input.nextElementSibling.textContent.trim() === `${settings.timer_countdown}s`) {
            input.checked = true;
        }
    });

    document.querySelectorAll('input[name="leaderboard"]').forEach(input => {
        if (input.nextElementSibling.textContent.trim().toLowerCase() === settings.leaderboards_reset.toLowerCase()) {
            input.checked = true;
        }
    });

    document.querySelectorAll('input[name="safe-level"]').forEach(input => {
        if (input.nextElementSibling.textContent.trim() === settings.safe_level) {
            input.checked = true;
        }
    });
}

function resetGameSettingsForm(){
    document.querySelectorAll('input[name="timer"]').forEach(input => {
        if (input.nextElementSibling.textContent.trim() === `25s`) {
            input.checked = true;
        }
    });

    document.querySelectorAll('input[name="leaderboard"]').forEach(input => {
        if (input.nextElementSibling.textContent.trim().toLowerCase() === "weekly") {
            input.checked = true;
        }
    });

    document.querySelectorAll('input[name="safe-level"]').forEach(input => {
        if (input.nextElementSibling.textContent.trim() === "3, 6, 9, 12, 15") {
            input.checked = true;
        }
    });
}


function collectFormData() {
    const formData = {};

    // Get selected Timer Countdown
    const timerSelected = document.querySelector('input[name="timer"]:checked');
    if (timerSelected) {
        formData.timer_countdown = parseInt(timerSelected.nextElementSibling.textContent.trim());
    }

    // Get selected Leaderboards Reset
    const leaderboardSelected = document.querySelector('input[name="leaderboard"]:checked');
    if (leaderboardSelected) {
        formData.leaderboard_reset = leaderboardSelected.nextElementSibling.textContent.trim().toLowerCase();
    }

    // Get selected Safe Level
    const safeLevelSelected = document.querySelector('input[name="safe-level"]:checked');
    if (safeLevelSelected) {
        formData.safe_level = safeLevelSelected.nextElementSibling.textContent.trim();
    }

    return formData;
}


async function setGameSettings(){
    formData = collectFormData();
    const res = await getDataFromUrlWithParams('/api/admin/update/gamesettings', formData);
    if (res){   
        console.log("Game settings updated successfully");
    }
}


function displayConfirmSettings(){
    const confirmSettingsGUI = document.getElementById("game-sets-confirmations")
    confirmSettingsGUI.style.display = "flex";
    const formData = collectFormData();
    const timerCountDown = document.getElementById("timer-countdown-number");
    const leaderboardsType = document.getElementById("leaderboards-type");
    const safeLevels = document.getElementById("safe-levels");
    if (formData.leaderboard_reset == "weekly") {
        leaderboardsType.innerText = "Weekly";
    } else {
        leaderboardsType.innerText = "Monthly";
    }
    timerCountDown.innerText = formData.timer_countdown;
    safeLevels.innerText = formData.safe_level;

}

async function displaySettings(){
    const settingsGUI = document.getElementById("game-settings-form")
    settingsGUI.style.display = "flex";
    const gameSettings = await getGameSettings();
    refreshGameSettingsForm(gameSettings);
}

document.addEventListener("DOMContentLoaded", async function () {
    const monthlyChart = document.getElementById("monthly-chart");
    const settingsGUI = document.getElementById("game-settings-form")
    const confirmSettingsGUI = document.getElementById("game-sets-confirmations")

    setupAdminChartBar(monthlyChart);
    
    document.getElementById("settings-button").addEventListener("click", function (event) { 
        displaySettings();
    });

    window.addEventListener("click", function (event) {
        if (event.target === settingsGUI) {
            settingsGUI.style.display = "none";
        }
        if (event.target === confirmSettingsGUI) {
            confirmSettingsGUI.style.display = "none";
        }
    });

    document.getElementById("settings-save-button").addEventListener("click", function (event) { 
        settingsGUI.style.display = "none";
        displayConfirmSettings();
    });

    document.getElementById("confirm-save-button").addEventListener("click", function (event) { 
        confirmSettingsGUI.style.display = "none";
        setGameSettings();
    });

    document.getElementById("settings-cancel-button").addEventListener("click", function (event) {
        settingsGUI.style.display = "none";
    });
    
    document.getElementById("settings-reset-button").addEventListener("click", function (event) {
        resetGameSettingsForm();
    });

    document.getElementById("confirm-cancel-button").addEventListener("click", function (event) { 
        confirmSettingsGUI.style.display = "none";
    });

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

    getDataFromUrl("/api/admin/get/rankings") //Gets all Students
    .then(rankings => {
        if (!rankings) {
            console.error("Waran Sulod!!!", data);
            return;
        }
        displayRankings(rankings);
    })

    document.getElementById("cancel-delete-but").addEventListener('click', function(){
        document.getElementById("delete-form-pop").style.display = "none";
    })


    document.getElementById("delete-but").addEventListener('click', async function(){
        if (!selected_student){
            return;
        }
        document.getElementById("delete-but").disabled = true;
        const res = await getDataFromUrlWithParams('/api/admin/delete/student' , {
            'student_id' : selected_student.id
        });
        if (res){
            const numstudents = document.getElementById('number-of-students').textContent;
            document.getElementById("delete-form-pop").style.display = "none";
            document.getElementById("success-text").textContent =  `You have successfully deleted ${selected_student?.username}`;
            document.getElementById("success-form-pop").style.display = "flex";
            document.getElementById(`${selected_student.id}-card`).remove();
            document.getElementById('number-of-students').textContent = parseInt(numstudents) - 1;
            selected_student = null;
        }
        document.getElementById("delete-but").disabled = false;
    })

    document.getElementById("success-but").addEventListener('click', function(){
        document.getElementById("success-form-pop").style.display = "none";
    })
 
    displayListOfStudents(); 


    const searchBox = document.getElementById('search-box'); 
    const handleInput = async (event) => {
        console.log(`Searching for: ${event.target.value}`);
        // Add your logic for handling the input here, like sending a search request.
        const students = await getDataFromUrlWithParams('/api/admin/search/students' , {
            'search_term' : event.target.value
        });
        if (students){
            const lis_of_user_tag = document.querySelector(".list-of-users");
            lis_of_user_tag.innerHTML = "";
            for (const studentID in students) {
                if (students.hasOwnProperty(studentID)) {
                    const student = students[studentID];
                    lis_of_user_tag.insertAdjacentHTML("afterbegin",
                        `
                            <div class="user-card" id="${studentID}-card">
                                ${
                                    student.profile_pic	 
                                ? `<img class="student-avatar" src="${student.profile_pic}" alt="Student Avatar">`
                                : `
                                    <svg  viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M26 0C11.648 0 0 11.648 0 26C0 40.352 11.648 52 26 52C40.352 52 52 40.352 52 26C52 11.648 40.352 0 26 0ZM26 7.8C30.316 7.8 33.8 11.284 33.8 15.6C33.8 19.916 30.316 23.4 26 23.4C21.684 23.4 18.2 19.916 18.2 15.6C18.2 11.284 21.684 7.8 26 7.8ZM26 44.72C19.5 44.72 13.754 41.392 10.4 36.348C10.478 31.174 20.8 28.34 26 28.34C31.174 28.34 41.522 31.174 41.6 36.348C38.246 41.392 32.5 44.72 26 44.72Z" fill="currentColor"/>
                                    </svg>
                                `
                                }
                                <h3 class="roboto-bold">${student?.username}</h3>
                                <h6 class="roboto-light">${student?.fname} ${student?.mname} ${student?.lname}</h6>
                                <h6 class="roboto-light">${student?.created_at}</h6>
                                <div class="buttons-container">
                                    <button class="roboto-bold" id="visit-button-${studentID}">VISIT</button> 
                                    <button class="roboto-bold" id="edit-button-${studentID}">EDIT</button>
                                    <button class="roboto-bold" id="delete-button-${studentID}">DELETE</button>
                                </div>
                            </div>
                        `
                    );
                    document.getElementById(`visit-button-${studentID}`).addEventListener('click', () => {
                        sessionStorage.setItem('studentID', studentID);
                        window.location.href = `/student_analytics`;
                    });
                    document.getElementById(`edit-button-${studentID}`).addEventListener('click', () => {
                        sessionStorage.setItem('studentID', studentID);
                        window.location.href = `/edit_student`;
                    });
                    document.getElementById(`delete-button-${studentID}`).addEventListener('click', () => {
                        selected_student = student;
                        document.getElementById("delete-text").textContent = "Are you sure you want to delete " + student.username + "?";
                        document.getElementById("delete-form-pop").style.display = "flex";
                    });

                    

                }
            }


        }

    };

    const debouncedInput = debounce(handleInput, 300); // 300ms delay

    searchBox.addEventListener('input', debouncedInput);


    getStudentsNumber();


});