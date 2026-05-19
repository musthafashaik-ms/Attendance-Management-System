const employeeForm = document.getElementById("employeeForm");
const employeeTableBody = document.getElementById("employeeTableBody");

let employees = JSON.parse(localStorage.getItem("employees")) || [];

/* Add Employee */

employeeForm.addEventListener("submit", function(e) {

    e.preventDefault();

    const empId = document.getElementById("empId").value;
    const empName = document.getElementById("empName").value;
    const empRole = document.getElementById("empRole").value;
    const empDept = document.getElementById("empDept").value;

    const employee = {
        id: empId,
        name: empName,
        role: empRole,
        department: empDept
    };

    employees.push(employee);

    localStorage.setItem("employees", JSON.stringify(employees));

    displayEmployees();

    employeeForm.reset();
});

/* Display Employees */

function displayEmployees() {

    employeeTableBody.innerHTML = "";

    employees.forEach((employee, index) => {

        const row = `
            <tr>
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.role}</td>
                <td>${employee.department}</td>
                <td>
                    <button onclick="deleteEmployee(${index})">
                        Delete
                    </button>
                </td>
            </tr>
        `;

        employeeTableBody.innerHTML += row;
    });

    updateDashboard();
}

/* Delete Employee */

function deleteEmployee(index) {

    employees.splice(index, 1);

    localStorage.setItem("employees", JSON.stringify(employees));

    displayEmployees();
}

/* Dashboard Counts */


function updateDashboard() {

    document.getElementById("totalEmployees").innerText = employees.length;

    document.getElementById("presentCount").innerText = employees.length;

    document.getElementById("absentCount").innerText = 0;

    document.getElementById("halfdayCount").innerText = 0;
}

/* Initial Load */

displayEmployees();