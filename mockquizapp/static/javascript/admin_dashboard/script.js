
async function setupAdminChartBar(monthlyChart){

    let values = [12, 19, 3, 5, 2, 3, 20, 12, 19, 3, 5, 2]
    
    const res = await getDataFromUrlWithParams('/api/admin/get/stats', {
        'statRequest' : '4'
    })

    if (res?.monthly_quizes_taken?.length > 0){ 
        // values = res.monthly_quizes_taken 
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
                    beginAtZero: true
                }
            }
        }
    });
    
}

document.addEventListener("DOMContentLoaded", function () {


    const monthlyChart = document.getElementById("monthly-chart");
    setupAdminChartBar(monthlyChart);


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








});