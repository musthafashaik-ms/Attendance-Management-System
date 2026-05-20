(function () {
    const STORAGE_KEY = "employees";
    let editIndex = null;

    function getEmployees() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    }

    function saveEmployees(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function calculateWorkingHours(login, logout) {
        if (!login || !logout) return "-";

        const [lh, lm] = login.split(":").map(Number);
        const [oh, om] = logout.split(":").map(Number);

        const diff = (oh * 60 + om) - (lh * 60 + lm);

        if (diff <= 0) return "-";

        const hrs = Math.floor(diff / 60);
        const mins = diff % 60;

        return `${hrs}h ${mins}m`;
    }

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

    function renderEmployees() {
        const employeeTable = document.getElementById("employeeTable");
        if (!employeeTable) return;

        const employees = getEmployees();

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

    function initEmployeeForm() {
        const form = document.getElementById("employeeForm");
        if (!form) return;

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const empId = document.getElementById("empId").value.trim();
            const empName = document.getElementById("empName").value.trim();
            const empRole = document.getElementById("empRole").value.trim();
            const empDepartment = document.getElementById("empDepartment").value.trim();
            const loginTime = document.getElementById("loginTime").value;
            const logoutTime = document.getElementById("logoutTime").value;
            const status = document.getElementById("status").value;
            const credits = Number(document.getElementById("leaveCredits").value);

            const employees = getEmployees();

            const employeeData = {
                empId,
                name: empName,
                role: empRole,
                department: empDepartment,
                loginTime,
                logoutTime,
                workingHours: calculateWorkingHours(loginTime, logoutTime),
                status,
                credits
            };

            if (editIndex !== null) {
                employees[editIndex] = employeeData;
                editIndex = null;
            } else {
                const exists = employees.find(emp => emp.empId === empId);

                if (exists) {
                    alert("Employee ID already exists");
                    return;
                }

                employees.push(employeeData);
            }

            saveEmployees(employees);

            form.reset();

            renderEmployees();

            alert("Employee saved successfully");
        });
    }

    window.editEmployee = function(index) {
        const employees = getEmployees();
        const emp = employees[index];

        document.getElementById("empId").value = emp.empId;
        document.getElementById("empName").value = emp.name;
        document.getElementById("empRole").value = emp.role;
        document.getElementById("empDepartment").value = emp.department;
        document.getElementById("loginTime").value = emp.loginTime;
        document.getElementById("logoutTime").value = emp.logoutTime;
        document.getElementById("status").value = emp.status;
        document.getElementById("leaveCredits").value = emp.credits;

        editIndex = index;
    };

    window.deleteEmployee = function(index) {
        if (!confirm("Delete employee?")) return;

        const employees = getEmployees();

        employees.splice(index, 1);

        saveEmployees(employees);

        renderEmployees();
    };

    renderEmployees();
    initEmployeeForm();
})();