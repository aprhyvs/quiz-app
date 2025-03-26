document.addEventListener("DOMContentLoaded", function () {
    console.log("Student Dasboard Navbar Loaded");

    getDataFromUrl("/api/student/data")
    .then(data => {
        console.log(data);

        if (!data || !data.studentData) {
            console.error("Invalid data structure:", data);
            return;
        }

        const studentData = data;
        displayStudentData(studentData);
    })
    .catch(error => console.error("Error fetching student data:", error));

    // Display Student Data in Dashboard
    function displayStudentData(studentData) {
        const studentNameDiv = document.querySelector(".student-name");
        studentNameDiv.innerHTML = `<h3>Welcome, ${studentData.username}!</h3>`;
    }
});