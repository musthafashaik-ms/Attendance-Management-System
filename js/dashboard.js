(function () {
    const STORAGE_KEY = "employees";

    function getEmployees() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
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

    function updateSystemTime() {
        const systemUpdate = document.getElementById("systemUpdate");

        if (!systemUpdate) return;

        systemUpdate.textContent =
            `System is up to date. Last updated: ${new Date().toLocaleString()}`;
    }

    function renderDashboard() {
        const attendanceTable = document.getElementById("attendanceTable");
        const negativeCreditTable = document.getElementById("negativeCreditTable");

        if (!attendanceTable || !negativeCreditTable) return;

        const employees = getEmployees();

        attendanceTable.innerHTML = "";
        negativeCreditTable.innerHTML = "";

        let presentCount = 0;
        let halfDayCount = 0;
        let leaveCount = 0;
        let weekOffCount = 0;

        let totalCredits = 0;
        let positiveCredits = 0;
        let zeroCredits = 0;
        let negativeCredits = 0;

        if (employees.length === 0) {
            attendanceTable.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align:center;">
                        No employee records found
                    </td>
                </tr>
            `;
        }

        employees.forEach(emp => {
            const status = emp.status || "Absent";
            const credits = Number(emp.credits || 0);

            if (status === "Present") presentCount++;
            else if (status === "Half Day") halfDayCount++;
            else if (status === "Leave") leaveCount++;
            else if (status === "Week Off") weekOffCount++;

            totalCredits += credits;

            if (credits > 0) positiveCredits++;
            else if (credits === 0) zeroCredits++;
            else negativeCredits++;

            attendanceTable.innerHTML += `
                <tr>
                    <td>${emp.empId}</td>
                    <td>${emp.name}</td>
                    <td>${emp.role}</td>
                    <td>${emp.department}</td>
                    <td>${emp.loginTime}</td>
                    <td>${emp.logoutTime}</td>
                    <td>${emp.workingHours}</td>
                    <td>${getStatusBadge(status)}</td>
                    <td>${credits}</td>
                </tr>
            `;
        });

        employees
            .filter(emp => Number(emp.credits) < 0)
            .forEach(emp => {
                negativeCreditTable.innerHTML += `
                    <tr>
                        <td>${emp.empId}</td>
                        <td>${emp.name}</td>
                        <td>${emp.credits}</td>
                    </tr>
                `;
            });

        const totalEmployees = document.getElementById("totalEmployees");
        const presentCountEl = document.getElementById("presentCount");
        const halfDayCountEl = document.getElementById("halfDayCount");
        const leaveCountEl = document.getElementById("leaveCount");
        const weekOffCountEl = document.getElementById("weekOffCount");

        const totalCreditsEl = document.getElementById("totalCredits");
        const positiveCreditsEl = document.getElementById("positiveCredits");
        const zeroCreditsEl = document.getElementById("zeroCredits");
        const negativeCreditsEl = document.getElementById("negativeCredits");

        if (totalEmployees) totalEmployees.textContent = employees.length;
        if (presentCountEl) presentCountEl.textContent = presentCount;
        if (halfDayCountEl) halfDayCountEl.textContent = halfDayCount;
        if (leaveCountEl) leaveCountEl.textContent = leaveCount;
        if (weekOffCountEl) weekOffCountEl.textContent = weekOffCount;

        if (totalCreditsEl) totalCreditsEl.textContent = totalCredits;
        if (positiveCreditsEl) positiveCreditsEl.textContent = positiveCredits;
        if (zeroCreditsEl) zeroCreditsEl.textContent = zeroCredits;
        if (negativeCreditsEl) negativeCreditsEl.textContent = negativeCredits;

        const negativeAlert = document.getElementById("negativeAlert");

        if (negativeAlert) {
            if (negativeCredits > 0) {
                negativeAlert.style.display = "flex";
                negativeAlert.querySelector("span").textContent =
                    `${negativeCredits} Employees have Negative Credits`;
            } else {
                negativeAlert.style.display = "none";
            }
        }

        updateSystemTime();
    }

    renderDashboard();
    setInterval(updateSystemTime, 1000);
})();