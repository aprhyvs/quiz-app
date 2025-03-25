document.addEventListener("DOMContentLoaded", function () {
    console.log("Admin Dashboard Loaded");

    // CSRF Token Retrieval
    function getCSRFToken() {
        const cookieValue = document.cookie
            .split("; ")
            .find((row) => row.startsWith("csrftoken="))
            ?.split("=")[1];
        return cookieValue || "";
    }

    // Fetch Student List (Example)
    async function fetchStudents() {
        try {
            const response = await fetch("/api/admin/students", {
                method: "GET",
                headers: {
                    "X-CSRFToken": getCSRFToken(),
                    
                },
            });

            

            if (!response.ok) 
                throw new Error("Failed to load students");
            
            const data = await response.json();
            const students = data;

            console.log(students)
            displayStudents(students);

        } catch (error) {
            console.error("Error fetching students:", error);
        }
    }

    // Display Students in Dashboard
    function displayStudents(students) {
        const contentDiv = document.querySelector(".content");
        contentDiv.innerHTML = `<h2>Student List</h2>`;
    
        for (const studentID in students) {
            if (students.hasOwnProperty(studentID)) {
                const student = students[studentID];
    
                // Create Bootstrap card
                const studentCard = document.createElement("div");
                studentCard.classList.add("card", "mb-3"); // Adds margin-bottom for spacing
                studentCard.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">${student.fname} ${student.lname}</h5>
                        <p class="card-text">School: ${student.school}</p>
                        <p class="card-text">Email: ${student.gmail}</p>
                        <p class="card-text">Phone: ${student.phone}</p>
                        <a href="#" class="btn btn-primary">Configure Student Data</a>
                    </div>
                `;
    
                contentDiv.appendChild(studentCard);
            }
        }
    }
    

    // Logout Function
    document.querySelector(".sidebar a[href='/logout']").addEventListener("click", async function (event) {
        event.preventDefault();

        if (!confirm("Are you sure you want to logout?")) return;

        try {
            const response = await fetch("/api/logout", {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFToken(),

                },
            });

            if (response.ok) {
                window.location.href = "/";
            } else {
                console.error("Logout failed");
            }
        } catch (error) {
            console.error("Logout error:", error);
        }
    });

    // Load Student Data
    fetchStudents();
});