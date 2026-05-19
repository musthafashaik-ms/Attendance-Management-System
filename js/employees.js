const employeeForm = document.getElementById("employeeForm");
const employeeTable = document.getElementById("employeeTable");

const empIdInput = document.getElementById("empId");
const empNameInput = document.getElementById("empName");
const empRoleInput = document.getElementById("empRole");
const empDepartmentInput = document.getElementById("empDepartment");
const loginTimeInput = document.getElementById("loginTime");
const logoutTimeInput = document.getElementById("logoutTime");
const statusInput = document.getElementById("status");
const leaveCreditsInput = document.getElementById("leaveCredits");

const employeeKey = "employees";
const attendanceKey = "attendanceRecords";

let editIndex = null;

/* Load data */
function getStorageData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function saveStorageData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/* Calculate working hours */
function calculateWorkingHours(login, logout) {
    if (!login || !logout) return "-";

    const [lh, lm] = login.split(":").map(Number);
    const [oh, om] = logout.split(":").map(Number);

    const loginMinutes = lh * 60 + lm;
    const logoutMinutes = oh * 60 + om;

    const diff = logoutMinutes - loginMinutes;

    if (diff <= 0) return "-";

    const hours = Math.floor(diff / 60);
    const mins = diff % 60;

    return `${hours}h ${mins}m`;
}

/* Status badge */
function getStatusBadge(status) {
    switch (status) {
        case "Present":
            return `<span class="status present">Present</span>`;
        case "Half Day":
            return `<span class="status halfday">Half Day</span>`;
        case "Leave":
            return `<span class="status leave">Leave</span>`;
        case "Week Off":
            return `<span class="status weekoff">Week Off</span>`;
        default:
            return status;
    }
}

/* Render table */
function renderEmployees() {
    const employees = getStorageData(employeeKey);
    employeeTable.innerHTML = "";

    employees.forEach((emp, index) => {
        employeeTable.innerHTML += `
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
                <td>
                    <button class="action-btn edit-btn"
                        onclick="editEmployee(${index})">
                        Edit
                    </button>

                    <button class="action-btn delete-btn"
                        onclick="deleteEmployee(${index})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
}

/* Add / Update employee */
employeeForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const employees = getStorageData(employeeKey);
    const attendance = getStorageData(attendanceKey);

    const workingHours = calculateWorkingHours(
        loginTimeInput.value,
        logoutTimeInput.value
    );

    const employeeData = {
        empId: empIdInput.value.trim(),
        name: empNameInput.value.trim(),
        role: empRoleInput.value.trim(),
        department: empDepartmentInput.value.trim(),
        loginTime: loginTimeInput.value,
        logoutTime: logoutTimeInput.value,
        workingHours,
        status: statusInput.value,
        credits: Number(leaveCreditsInput.value)
    };

    const attendanceData = {
        empId: empIdInput.value.trim(),
        date: new Date().toISOString().split("T")[0],
        loginTime: loginTimeInput.value,
        logoutTime: logoutTimeInput.value,
        status: statusInput.value
    };

    if (editIndex !== null) {
        employees[editIndex] = employeeData;

        const attendanceIndex = attendance.findIndex(
            a => a.empId === employeeData.empId
        );

        if (attendanceIndex !== -1) {
            attendance[attendanceIndex] = attendanceData;
        }

        editIndex = null;
    } else {
        employees.push(employeeData);
        attendance.push(attendanceData);
    }

    saveStorageData(employeeKey, employees);
    saveStorageData(attendanceKey, attendance);

    employeeForm.reset();
    renderEmployees();
});

/* Edit */
function editEmployee(index) {
    const employees = getStorageData(employeeKey);
    const emp = employees[index];

    empIdInput.value = emp.empId;
    empNameInput.value = emp.name;
    empRoleInput.value = emp.role;
    empDepartmentInput.value = emp.department;
    loginTimeInput.value = emp.loginTime;
    logoutTimeInput.value = emp.logoutTime;
    statusInput.value = emp.status;
    leaveCreditsInput.value = emp.credits;

    editIndex = index;
}

/* Delete */
function deleteEmployee(index) {
    if (!confirm("Delete this employee?")) return;

    const employees = getStorageData(employeeKey);
    const attendance = getStorageData(attendanceKey);

    const empId = employees[index].empId;

    employees.splice(index, 1);

    const updatedAttendance = attendance.filter(
        a => a.empId !== empId
    );

    saveStorageData(employeeKey, employees);
    saveStorageData(attendanceKey, updatedAttendance);

    renderEmployees();
}

/* Load */
renderEmployees();