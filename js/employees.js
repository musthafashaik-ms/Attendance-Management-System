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

let employeeKey = "employees";
let editIndex = null;

/* Helpers */
function getStorageData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function saveStorageData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/* Working Hours */
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

/* Status Badge */
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
            return `<span class="status absent">Absent</span>`;
    }
}

/* Render Employee Table */
function renderEmployees() {
    const employees = getStorageData(employeeKey);

    employeeTable.innerHTML = "";

    if (employees.length === 0) {
        employeeTable.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center;">
                    No employees found
                </td>
            </tr>
        `;
        return;
    }

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

/* Save Employee */
employeeForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const employees = getStorageData(employeeKey);

    const employeeData = {
        empId: empIdInput.value.trim(),
        name: empNameInput.value.trim(),
        role: empRoleInput.value.trim(),
        department: empDepartmentInput.value.trim(),
        loginTime: loginTimeInput.value,
        logoutTime: logoutTimeInput.value,
        workingHours: calculateWorkingHours(
            loginTimeInput.value,
            logoutTimeInput.value
        ),
        status: statusInput.value,
        credits: Number(leaveCreditsInput.value)
    };

    if (editIndex !== null) {
        employees[editIndex] = employeeData;
        editIndex = null;
    } else {
        const exists = employees.find(
            emp => emp.empId === employeeData.empId
        );

        if (exists) {
            alert("Employee ID already exists");
            return;
        }

        employees.push(employeeData);
    }

    saveStorageData(employeeKey, employees);

    employeeForm.reset();

    renderEmployees();

    alert("Employee saved successfully!");
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
    if (!confirm("Delete employee?")) return;

    const employees = getStorageData(employeeKey);

    employees.splice(index, 1);

    saveStorageData(employeeKey, employees);

    renderEmployees();
}

/* Global */
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;

/* Init */
renderEmployees();