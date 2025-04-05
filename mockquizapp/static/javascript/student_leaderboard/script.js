async function initiateRankings(leaderboard){
    const leaderboardTypeElement = document.getElementById('leaderboards-type');
    if (leaderboard.type === 'weekly'){
        leaderboardTypeElement.innerText = "Leaderboards (Weekly)";
        displayRankings(leaderboard.rankings);
    } else {
        leaderboardTypeElement.innerText = "Leaderboards (Monthly)";
        displayRankings(leaderboard.rankings);
    }
}

function get_percentage(score, totalItems){
    if (!score) return 0;
    return Math.round((score / totalItems) * 100);
}


function getAbsoluteMediaURL(relativePath) {
    return new URL(relativePath, window.location.origin).href;
}

function displayRankings(weeklyRankings){
    console.log(weeklyRankings);
    
    if (weeklyRankings){
        const lis_of_user_tag = document.getElementById("leaderboard-table");
        for (const rank in weeklyRankings) {
            const student = weeklyRankings[rank];
            console.log(student.student_pic);
            const totalItems = student.total_wrong_answers + student.total_correct_answers
            const rankNumber = (Number(rank) + 1).toString();   
            console.log(student);
                lis_of_user_tag.insertAdjacentHTML("beforeend",
                    `
                    <div class="leaderboard-table-card">
                        <div>
                            <p class="rank">${rankNumber + "."}</p>
                            ${
                                student.student_pic ? `<img src='${getAbsoluteMediaURL(student.student_pic)}' alt="" }/>` : `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M26 0C11.648 0 0 11.648 0 26C0 40.352 11.648 52 26 52C40.352 52 52 40.352 52 26C52 11.648 40.352 0 26 0ZM26 7.8C30.316 7.8 33.8 11.284 33.8 15.6C33.8 19.916 30.316 23.4 26 23.4C21.684 23.4 18.2 19.916 18.2 15.6C18.2 11.284 21.684 7.8 26 7.8ZM26 44.72C19.5 44.72 13.754 41.392 10.4 36.348C10.478 31.174 20.8 28.34 26 28.34C31.174 28.34 41.522 31.174 41.6 36.348C38.246 41.392 32.5 44.72 26 44.72Z" fill="currentColor"/>
                                </svg>` 
                            }
                            <p>${student.student_name}</p>
                        </div>
                        <div>
                            <p>${student.total_score}</p>
                        </div>
                        <div>
                            <p>${student.total_quizzes}</p>
                        </div>
                        <div>
                            <p>${get_percentage(student.total_correct_answers, totalItems) + `%`}</p>
                        </div>
                        <div>
                            <p>${get_percentage(student.total_wrong_answers, totalItems) + `%`}</p>
                        </div>
                    </div>
                    `
                );
        }


    }
    console.log("No Rankings found.")
}





document.addEventListener("DOMContentLoaded", function () {
    console.log("Student Leaderboard Script Loaded")

    getDataFromUrl("/api/student/leaderboards") //Gets student leaderboards.
    .then(leaderboard => {
        if (!leaderboard) {
            console.error("Waran Sulod!!!", data);
            return;
        }
        console.log(leaderboard.leaderboard);
        initiateRankings(leaderboard.leaderboard);
    })

});