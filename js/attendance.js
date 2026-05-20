let employeeKey = "employees";

/* Storage */
function getEmployees() {
    return JSON.parse(localStorage.getItem(employeeKey)) || [];
}

/* Status Badge */
function getStatusBadge(status) {
    const badges = {
        "Present": "present",
        "Half Day": "halfday",
        "Leave": "leave",
        "Week Off": "weekoff"
    };

    return `
        <span class="status ${badges[status] || 'absent'}">
            ${status}
        </span>
    `;
}

/* Render Attendance */
function renderAttendance() {
    const attendanceTable = document.getElementById("attendanceEmployeeTable");
    if (!attendanceTable) return;

    const employees = getEmployees();

    attendanceTable.innerHTML = "";

    if (employees.length === 0) {
        attendanceTable.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center;">
                    No employee attendance records found
                </td>
            </tr>
        `;
        return;
    }

    employees.forEach(emp => {
        attendanceTable.innerHTML += `
            <tr>
                <td>${emp.empId}</td>
                <td>${emp.name}</td>
                <td>${emp.role}</td>
                <td>${emp.department}</td>
                <td>${emp.loginTime}</td>
                <td>${emp.logoutTime}</td>
                <td>${emp.workingHours}</td>
                <td>${getStatusBadge(emp.status)}</td>
                <td>${emp.credits}</td>
            </tr>
        `;
    });
}

/* Init */
renderAttendance();