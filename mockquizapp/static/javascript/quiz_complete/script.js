

document.addEventListener("DOMContentLoaded", async function () {

    const quiz_id = sessionStorage.getItem('quiz_id');
    if (quiz_id) {
        res = await getDataFromUrlWithParams(`/api/game/get/quiz`,{
            'quiz_id': quiz_id
        });
        if (res) {
            console.log(res);
            document.getElementById('quiz_title').innerText = res.data.quiz_title;
            document.getElementById("score").innerText = `${res.data.number_of_correct} / 20` ;
            if (res.data.number_of_correct >= 15) {
                document.getElementById("status").innerText = "PASSED";
                document.getElementById("status").style.color = "#43ACAC";
            } else {
                document.getElementById("status").innerText = "FAILED";
                document.getElementById("status").style.color = "red";
            }

            const worthFormatted = res.data.total_worth.toLocaleString();


            document.getElementById("total_points").innerText = `TOTAL POINTS : ₱${worthFormatted}`;
            
        }
    } else {
        window.location.href = '/admin_home';
    }




})