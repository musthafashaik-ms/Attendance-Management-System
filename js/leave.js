(function () {
    const EMPLOYEE_KEY = "employees";
    const LEAVE_KEY = "leaveRecords";
    const MONTHLY_CREDIT_KEY = "monthlyLeaveCredits";

    const MONTHLY_CREDIT = 1.5;

    function getEmployees() {
        return JSON.parse(localStorage.getItem(EMPLOYEE_KEY)) || [];
    }

    function saveEmployees(data) {
        localStorage.setItem(EMPLOYEE_KEY, JSON.stringify(data));
    }

    function getLeaveRecords() {
        return JSON.parse(localStorage.getItem(LEAVE_KEY)) || [];
    }

    function saveLeaveRecords(data) {
        localStorage.setItem(LEAVE_KEY, JSON.stringify(data));
    }

    function getMonthlyCreditTracker() {
        return JSON.parse(localStorage.getItem(MONTHLY_CREDIT_KEY)) || {};
    }

    function saveMonthlyCreditTracker(data) {
        localStorage.setItem(MONTHLY_CREDIT_KEY, JSON.stringify(data));
    }

    function getCurrentMonthKey() {
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth() + 1}`;
    }

    function applyMonthlyCredits() {
        const employees = getEmployees();
        const tracker = getMonthlyCreditTracker();
        const monthKey = getCurrentMonthKey();

        if (tracker[monthKey]) return;

        employees.forEach(emp => {
            emp.credits = Number(emp.credits || 0) + MONTHLY_CREDIT;
        });

        tracker[monthKey] = true;

        saveEmployees(employees);
        saveMonthlyCreditTracker(tracker);
    }

    function populateEmployeeDropdown() {
        const select = document.getElementById("employeeSelect");
        if (!select) return;

        const employees = getEmployees();

        select.innerHTML = `
            <option value="">Select Employee</option>
        `;

        employees.forEach(emp => {
            select.innerHTML += `
                <option value="${emp.empId}">
                    ${emp.empId} - ${emp.name}
                </option>
            `;
        });
    }

    function renderLeaveTable() {
        const tbody = document.getElementById("leaveTableBody");
        if (!tbody) return;

        const leaveRecords = getLeaveRecords();

        tbody.innerHTML = "";

        if (leaveRecords.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;">
                        No leave records found
                    </td>
                </tr>
            `;
            return;
        }

        leaveRecords.forEach(record => {
            tbody.innerHTML += `
                <tr>
                    <td>${record.empId}</td>
                    <td>${record.name}</td>
                    <td>${record.role}</td>
                    <td>${record.department}</td>
                    <td>${record.leaveDate}</td>
                    <td>${record.leaveDays}</td>
                    <td>${record.reason}</td>
                    <td>${record.balance.toFixed(1)}</td>
                </tr>
            `;
        });
    }

    function renderSummaryCards() {
        const employees = getEmployees();

        let totalCredits = 0;
        let positiveCount = 0;
        let negativeCount = 0;

        employees.forEach(emp => {
            const credits = Number(emp.credits || 0);

            totalCredits += credits;

            if (credits >= 0) {
                positiveCount++;
            } else {
                negativeCount++;
            }
        });

        document.getElementById("totalLeaveCredits").textContent =
            totalCredits.toFixed(1);

        document.getElementById("positiveBalanceCount").textContent =
            positiveCount;

        document.getElementById("negativeBalanceCount").textContent =
            negativeCount;
    }

    function handleLeaveSubmit() {
        const form = document.getElementById("leaveForm");

        if (!form) return;

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const empId = document.getElementById("employeeSelect").value;
            const leaveDate = document.getElementById("leaveDate").value;
            const leaveDays = Number(document.getElementById("leaveDays").value);
            const reason = document.getElementById("leaveReason").value.trim();

            let employees = getEmployees();
            let leaveRecords = getLeaveRecords();

            const employee = employees.find(emp => emp.empId === empId);

            if (!employee) {
                alert("Employee not found");
                return;
            }

            const deduction = leaveDays === 1 ? 1.0 : 0.5;

            employee.credits =
                Number(employee.credits || 0) - deduction;

            leaveRecords.push({
                empId: employee.empId,
                name: employee.name,
                role: employee.role,
                department: employee.department,
                leaveDate,
                leaveDays: leaveDays === 1 ? "Full Day" : "Half Day",
                reason,
                balance: Number(employee.credits)
            });

            saveEmployees(employees);
            saveLeaveRecords(leaveRecords);

            form.reset();

            renderLeaveTable();
            renderSummaryCards();

            alert("Leave applied successfully");
        });
    }

    function initializeEmployeeCredits() {
        const employees = getEmployees();

        let updated = false;

        employees.forEach(emp => {
            if (emp.credits === undefined || emp.credits === null) {
                emp.credits = 1.5;
                updated = true;
            }
        });

        if (updated) {
            saveEmployees(employees);
        }
    }

    function init() {
        initializeEmployeeCredits();
        applyMonthlyCredits();
        populateEmployeeDropdown();
        renderLeaveTable();
        renderSummaryCards();
        handleLeaveSubmit();
    }

    init();
})();