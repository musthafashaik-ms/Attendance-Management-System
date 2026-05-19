const attendanceTableBody =
    document.getElementById("attendanceTableBody");

const alertBox =
    document.getElementById("alertBox");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

// GET EMPLOYEES
let employees =
    JSON.parse(localStorage.getItem("employees")) || [];

// GET ATTENDANCE
let attendance =
    JSON.parse(localStorage.getItem("attendance")) || [];

// CURRENT DATE
const today =
    new Date().toLocaleDateString();

// DISPLAY TABLE
function displayAttendance(){

    attendanceTableBody.innerHTML = "";

    const searchValue =
        searchInput.value.toLowerCase();

    const filterValue =
        statusFilter.value;

    employees.forEach((employee) => {

        // FIND ATTENDANCE
        const attendanceRecord = attendance.find(item =>
            item.id === employee.id &&
            item.date === today
        );

        // STATUS
        let status =
            attendanceRecord ? "Present" : "Absent";

        // SEARCH FILTER
        const matchesSearch =
            employee.name.toLowerCase().includes(searchValue) ||
            employee.id.toLowerCase().includes(searchValue);

        // STATUS FILTER
        const matchesFilter =
            filterValue === "all" ||
            filterValue === status.toLowerCase();

        if(matchesSearch && matchesFilter){

            attendanceTableBody.innerHTML += `

                <tr>

                    <td>${employee.name}</td>

                    <td>${employee.id}</td>

                    <td>${employee.department}</td>

                    <td>${today}</td>

                    <td>
                        ${attendanceRecord ?
                            attendanceRecord.loginTime :
                            "--"}
                    </td>

                    <td>

                        <span class="status
                            ${status === "Present"
                                ? "present"
                                : "absent"}">

                            ${status}

                        </span>

                    </td>

                    <td>

                        ${
                            attendanceRecord ?

                            `<button class="mark-btn marked-btn">
                                Marked
                            </button>`

                            :

                            `<button class="mark-btn"
                                onclick="markAttendance('${employee.id}')">

                                Mark Present

                            </button>`
                        }

                    </td>

                </tr>

            `;
        }

    });

}

// MARK ATTENDANCE
function markAttendance(employeeId){

    // CHECK DUPLICATE
    const alreadyMarked = attendance.find(item =>
        item.id === employeeId &&
        item.date === today
    );

    if(alreadyMarked){
        showAlert("Attendance already marked");
        return;
    }

    // FIND EMPLOYEE
    const employee =
        employees.find(emp => emp.id === employeeId);

    // CURRENT TIME
    const loginTime =
        new Date().toLocaleTimeString([], {
            hour:'2-digit',
            minute:'2-digit'
        });

    // CREATE RECORD
    const attendanceRecord = {

        id: employee.id,
        name: employee.name,
        department: employee.department,
        date: today,
        loginTime: loginTime,
        status: "Present"
    };

    // SAVE
    attendance.push(attendanceRecord);

    localStorage.setItem(
        "attendance",
        JSON.stringify(attendance)
    );

    // ALERT
    showAlert("Attendance Marked Successfully");

    // REFRESH
    displayAttendance();
}

// ALERT
function showAlert(message){

    alertBox.innerText = message;

    alertBox.style.display = "block";

    setTimeout(() => {

        alertBox.style.display = "none";

    }, 2000);
}

// SEARCH
searchInput.addEventListener(
    "keyup",
    displayAttendance
);

// FILTER
statusFilter.addEventListener(
    "change",
    displayAttendance
);

// INITIAL LOAD
displayAttendance();