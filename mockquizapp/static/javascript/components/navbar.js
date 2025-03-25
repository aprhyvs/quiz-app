document.addEventListener("DOMContentLoaded", function () {
    console.log("Student Dasboard Navbar Loaded");

    // CSRF Token Retrieval
    function getCSRFToken() {
        const cookieValue = document.cookie
            .split("; ")
            .find((row) => row.startsWith("csrftoken="))
            ?.split("=")[1];
        return cookieValue || "";
    }


    async function fetchStudentData() {
        try {
            const response = await fetch("/api/student/data", {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFToken(),
                    
                },
            });

            

            if (!response.ok) 
                throw new Error("Failed to load data");
            
            const data = await response.json();
            const studentData = data


            console.log(data);

            displayStudentData(studentData)

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    // Display Student Data in Dashboard
    function displayStudentData(studentData) {
        const studentNameDiv = document.querySelector(".student-name");
        studentNameDiv.innerHTML = `<h3>Welcome, ${studentData.username}!</h3>`;
    }
    

    // Load Student Data
    fetchStudentData();
});