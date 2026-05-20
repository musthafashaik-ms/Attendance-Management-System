(function () {
    const EMPLOYEE_KEY = "employees";
    const ATTENDANCE_KEY = "attendanceRecords";

    function getEmployees() {
        return JSON.parse(localStorage.getItem(EMPLOYEE_KEY)) || [];
    }

    function getAttendanceRecords() {
        return JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || {};
    }

    function getStatusBadge(status) {
        const badges = {
            "Present": "present",
            "Half Day": "halfday",
            "Leave": "leave",
            "Week Off": "weekoff",
            "Absent": "leave"
        };

        return `
            <span class="status ${badges[status]}">
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
        const dateFilter = document.getElementById("dateFilter");

        if (!attendanceTable || !negativeCreditTable || !dateFilter) return;

        const employees = getEmployees();
        const attendanceRecords = getAttendanceRecords();
        const selectedDate = dateFilter.value;

        const dayAttendance = attendanceRecords[selectedDate] || [];

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

        employees.forEach(emp => {
            const record = dayAttendance.find(r => r.empId === emp.empId);

            const status = record?.status || "Absent";
            const loginTime = record?.loginTime || "-";
            const logoutTime = record?.logoutTime || "-";
            const workingHours = record?.workingHours || "-";
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
                    <td>${loginTime}</td>
                    <td>${logoutTime}</td>
                    <td>${workingHours}</td>
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

        document.getElementById("totalEmployees").textContent = employees.length;
        document.getElementById("presentCount").textContent = presentCount;
        document.getElementById("halfDayCount").textContent = halfDayCount;
        document.getElementById("leaveCount").textContent = leaveCount;
        document.getElementById("weekOffCount").textContent = weekOffCount;

        document.getElementById("totalCredits").textContent = totalCredits;
        document.getElementById("positiveCredits").textContent = positiveCredits;
        document.getElementById("zeroCredits").textContent = zeroCredits;
        document.getElementById("negativeCredits").textContent = negativeCredits;

        const negativeAlert = document.getElementById("negativeAlert");

        if (negativeCredits > 0) {
            negativeAlert.style.display = "flex";
            negativeAlert.querySelector("span").textContent =
                `${negativeCredits} Employees have Negative Credits`;
        } else {
            negativeAlert.style.display = "none";
        }

        updateSystemTime();
    }

    function initDashboard() {
        const dateFilter = document.getElementById("dateFilter");
        if (!dateFilter) return;

        const today = new Date().toISOString().split("T")[0];
        dateFilter.value = today;

        renderDashboard();

        dateFilter.addEventListener("change", renderDashboard);
    }

    initDashboard();
    setInterval(updateSystemTime, 1000);
})();