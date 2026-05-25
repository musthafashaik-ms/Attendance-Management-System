(function () {
    const STORAGE_KEY = "employees";
    let editIndex = null;

    function getEmployees() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    }

    function saveEmployees(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function formatCredits(credits) {
        return Number(credits || 0).toFixed(1);
    }

    function calculateExperience(joiningDate) {
        if (!joiningDate) return "";

        const joinDate = new Date(joiningDate);
        const today = new Date();

        let years = today.getFullYear() - joinDate.getFullYear();
        let months = today.getMonth() - joinDate.getMonth();

        if (today.getDate() < joinDate.getDate()) {
            months--;
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        if (years > 0 && months > 0) {
            return `${years} Years ${months} Months`;
        }

        if (years > 0) {
            return `${years} Years`;
        }

        if (months > 0) {
            return `${months} Months`;
        }

        return "0 Months";
    }

    function getTodayDate() {
        return new Date().toISOString().split("T")[0];
    }

    function renderEmployees() {
        const employeeTable = document.getElementById("employeeTable");
        if (!employeeTable) return;

        let employees = getEmployees();

        employees = employees.map(emp => ({
            ...emp,
            presentDate: getTodayDate(),
            experience: calculateExperience(emp.joiningDate)
        }));

        saveEmployees(employees);

        employeeTable.innerHTML = "";

        if (employees.length === 0) {
            employeeTable.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align:center;">
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
                    <td>${formatCredits(emp.credits)}</td>
                    <td>${emp.joiningDate}</td>
                    <td>${emp.presentDate}</td>
                    <td>${emp.experience}</td>
                    <td>
                        <div class="action-buttons">
                            <button
                                class="action-btn edit-btn"
                                onclick="editEmployee(${index})"
                            >
                                Edit
                            </button>

                            <button
                                class="action-btn delete-btn"
                                onclick="deleteEmployee(${index})"
                            >
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    function autoFillEmployeeDetails() {
        const joiningDateInput = document.getElementById("joiningDate");
        const presentDateInput = document.getElementById("presentDate");
        const experienceInput = document.getElementById("experience");

        if (!joiningDateInput) return;

        joiningDateInput.addEventListener("change", function () {
            presentDateInput.value = getTodayDate();
            experienceInput.value = calculateExperience(this.value);
        });
    }

    function initEmployeeForm() {
        const form = document.getElementById("employeeForm");
        if (!form) return;

        autoFillEmployeeDetails();

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const empId = document.getElementById("empId").value.trim();
            const empName = document.getElementById("empName").value.trim();
            const empRole = document.getElementById("empRole").value.trim();
            const empDepartment = document.getElementById("empDepartment").value.trim();
            const leaveCredits = Number(
                document.getElementById("leaveCredits").value
            );

            const joiningDate =
                document.getElementById("joiningDate").value;

            const employees = getEmployees();

            const employeeData = {
                empId,
                name: empName,
                role: empRole,
                department: empDepartment,
                credits: leaveCredits,
                joiningDate,
                presentDate: getTodayDate(),
                experience: calculateExperience(joiningDate)
            };

            if (editIndex !== null) {
                employees[editIndex] = employeeData;
                editIndex = null;
            } else {
                const exists = employees.find(
                    emp => emp.empId === empId
                );

                if (exists) {
                    alert("Employee ID already exists");
                    return;
                }

                employees.push(employeeData);
            }

            saveEmployees(employees);

            form.reset();

            if (document.getElementById("presentDate")) {
                document.getElementById("presentDate").value = "";
            }

            if (document.getElementById("experience")) {
                document.getElementById("experience").value = "";
            }

            renderEmployees();

            alert("Employee saved successfully");
        });
    }

    window.editEmployee = function (index) {
        const employees = getEmployees();
        const emp = employees[index];

        document.getElementById("empId").value = emp.empId;
        document.getElementById("empName").value = emp.name;
        document.getElementById("empRole").value = emp.role;
        document.getElementById("empDepartment").value = emp.department;
        document.getElementById("leaveCredits").value = emp.credits;
        document.getElementById("joiningDate").value = emp.joiningDate;

        if (document.getElementById("presentDate")) {
            document.getElementById("presentDate").value = emp.presentDate;
        }

        if (document.getElementById("experience")) {
            document.getElementById("experience").value = emp.experience;
        }

        editIndex = index;
    };

    window.deleteEmployee = function (index) {
        if (!confirm("Delete employee?")) return;

        const employees = getEmployees();

        employees.splice(index, 1);

        saveEmployees(employees);

        renderEmployees();
    };

    renderEmployees();
    initEmployeeForm();
})();