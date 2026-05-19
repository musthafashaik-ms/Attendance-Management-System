const attendanceForm = document.getElementById("attendanceForm");
const attendanceTable = document.getElementById("attendanceTable");
const exportBtn = document.getElementById("exportBtn");

const totalCount = document.getElementById("totalCount");
const presentCount = document.getElementById("presentCount");
const hoursCount = document.getElementById("hoursCount");

let employeeData = JSON.parse(localStorage.getItem("employeeAttendance")) || [];

function calculateWorkingHours(loginTime, logoutTime) {
    const [loginHour, loginMinute] = loginTime.split(":").map(Number);
    const [logoutHour, logoutMinute] = logoutTime.split(":").map(Number);

    const login = new Date();
    login.setHours(loginHour, loginMinute, 0);

    const logout = new Date();
    logout.setHours(logoutHour, logoutMinute, 0);

    let diff = (logout - login) / (1000 * 60 * 60);

    if (diff < 0) {
        diff += 24;
    }

    return diff.toFixed(2);
}

function saveToLocalStorage() {
    localStorage.setItem("employeeAttendance", JSON.stringify(employeeData));
}

function updateStats() {
    totalCount.textContent = employeeData.length;
    presentCount.textContent = employeeData.length;

    const totalHours = employeeData.reduce((sum, emp) => {
        return sum + parseFloat(emp.workingHours);
    }, 0);

    hoursCount.textContent = totalHours.toFixed(2);
}

function renderTable() {
    attendanceTable.innerHTML = "";

    if (employeeData.length === 0) {
        attendanceTable.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">
                    No employee records found
                </td>
            </tr>
        `;
        updateStats();
        return;
    }

    employeeData.forEach((employee, index) => {
        attendanceTable.innerHTML += `
            <tr>
                <td>${employee.empId}</td>
                <td>${employee.name}</td>
                <td>${employee.role}</td>
                <td>${employee.department}</td>
                <td>${employee.loginTime}</td>
                <td>${employee.logoutTime}</td>
                <td>${employee.workingHours} hrs</td>
                <td>
                    <button onclick="deleteEmployee(${index})"
                            style="
                                background:#e74c3c;
                                color:white;
                                border:none;
                                padding:8px 12px;
                                border-radius:8px;
                                cursor:pointer;
                            ">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });

    updateStats();
    saveToLocalStorage();
}

attendanceForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const empId = document.getElementById("empId").value.trim();
    const empName = document.getElementById("empName").value.trim();
    const empRole = document.getElementById("empRole").value.trim();
    const empDept = document.getElementById("empDept").value.trim();
    const loginTime = document.getElementById("loginTime").value;
    const logoutTime = document.getElementById("logoutTime").value;

    if (!empId || !empName || !empRole || !empDept || !loginTime || !logoutTime) {
        alert("Please fill all fields");
        return;
    }

    const exists = employeeData.some(emp => emp.empId === empId);

    if (exists) {
        alert("Employee ID already exists");
        return;
    }

    const workingHours = calculateWorkingHours(loginTime, logoutTime);

    const employee = {
        empId,
        name: empName,
        role: empRole,
        department: empDept,
        loginTime,
        logoutTime,
        workingHours
    };

    employeeData.unshift(employee);

    attendanceForm.reset();

    renderTable();
});

function deleteEmployee(index) {
    if (confirm("Delete this employee record?")) {
        employeeData.splice(index, 1);
        renderTable();
    }
}

exportBtn.addEventListener("click", function () {
    exportCSV();
});

function exportCSV() {
    if (employeeData.length === 0) {
        alert("No data to export");
        return;
    }

    let csv =
        "Employee ID,Name,Role,Department,Login Time,Logout Time,Working Hours\n";

    employeeData.forEach((employee) => {
        csv += `${employee.empId},${employee.name},${employee.role},${employee.department},${employee.loginTime},${employee.logoutTime},${employee.workingHours}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "employee-attendance.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

renderTable();