(function () {
    const EMPLOYEE_KEY = "employees";
    const ATTENDANCE_KEY = "attendanceRecords";
    const OT_KEY = "otRecords";

    let creditsChart = null;

    function getEmployees() {
        return JSON.parse(localStorage.getItem(EMPLOYEE_KEY)) || [];
    }

    function getAttendanceRecords() {
        return JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || {};
    }

    function getOTRecords() {
        return JSON.parse(localStorage.getItem(OT_KEY)) || [];
    }

    function getStatusBadge(status) {
        const badges = {
            "Present": "present",
            "Half Day": "halfday",
            "Leave": "leave",
            "Week Off": "weekoff"
        };

        return `
            <span class="status ${badges[status] || "leave"}">
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

    function renderCreditsChart(positive, zero, negative, totalCredits) {

        const canvas = document.getElementById("creditsChart");

        if (!canvas || typeof Chart === "undefined") return;

        if (creditsChart) {
            creditsChart.destroy();
        }

        creditsChart = new Chart(canvas, {
            type: "doughnut",
            data: {
                datasets: [{
                    data: [positive, zero, negative],
                    backgroundColor: [
                        "#16a34a",
                        "#d1d5db",
                        "#ef4444"
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "72%",
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        const totalEmployees =
            positive + zero + negative || 1;

        document.getElementById("positivePercent").textContent =
            Math.round((positive / totalEmployees) * 100);

        document.getElementById("zeroPercent").textContent =
            Math.round((zero / totalEmployees) * 100);

        document.getElementById("negativePercent").textContent =
            Math.round((negative / totalEmployees) * 100);

        document.getElementById("totalCredits").textContent =
            totalCredits.toFixed(1);
    }

    function renderOTRecords() {

    const otTable =
        document.getElementById("otPayTable");

    if (!otTable) return;

    const records = getOTRecords();
    const employees = getEmployees();
    const attendanceRecords =
        getAttendanceRecords();

    otTable.innerHTML = "";

    if(records.length === 0){

        otTable.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    No OT Records
                </td>
            </tr>
        `;
        return;
    }

    records
        .slice()
        .reverse()
        .slice(0,5)
        .forEach(record => {

            otTable.innerHTML += `
                <tr>

                    <td>${record.empId}</td>
                    <td>${record.date}</td>
                    <td>${record.hours}</td>
                    <td>${record.mode}</td>

                    <td style="text-align:center;">

                        <button
                            class="details-btn"
                            onclick="showOTDetails(
                                '${record.empId}',
                                '${record.date}'
                            )"
                        >
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>

                    </td>

                </tr>
            `;
        });

    window.showOTDetails =
        function(empId,date){

            const employee =
                employees.find(
                    emp => emp.empId === empId
                );

            const dayRecords =
                attendanceRecords[date] || [];

            const attendance =
                dayRecords.find(
                    emp => emp.empId === empId
                );

            document.getElementById(
                "otDetailsBody"
            ).innerHTML = `

                <table class="ot-detail-table">

                    <tr>
                        <th>Employee Name</th>
                        <td>${employee?.name || "-"}</td>
                    </tr>

                    <tr>
                        <th>Date</th>
                        <td>${date}</td>
                    </tr>

                    <tr>
                        <th>Login Time</th>
                        <td>${attendance?.loginTime || "-"}</td>
                    </tr>

                    <tr>
                        <th>Logout Time</th>
                        <td>${attendance?.logoutTime || "-"}</td>
                    </tr>

                    <tr>
                        <th>Work Hours</th>
                        <td>${attendance?.workingHours || "-"}</td>
                    </tr>

                </table>
            `;

            document.getElementById(
                "otDetailsModal"
            ).style.display = "flex";
        };
}

    function renderDashboard() {

        const attendanceTable =
            document.getElementById("attendanceTable");

        const negativeCreditTable =
            document.getElementById("negativeCreditTable");

        const dateFilter =
            document.getElementById("dateFilter");

        if (
            !attendanceTable ||
            !negativeCreditTable ||
            !dateFilter
        ) return;

        const employees =
            getEmployees();

        const attendanceRecords =
            getAttendanceRecords();

        const selectedDate =
            dateFilter.value;

        const dayAttendance =
            attendanceRecords[selectedDate] || [];

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

        if (dayAttendance.length === 0) {

            attendanceTable.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align:center;">
                        No attendance records found
                    </td>
                </tr>
            `;
        }

        dayAttendance.forEach(emp => {

            const credits =
                Number(emp.credits || 0);

            switch (emp.status) {

                case "Present":
                    presentCount++;
                    break;

                case "Half Day":
                    halfDayCount++;
                    break;

                case "Leave":
                    leaveCount++;
                    break;

                case "Week Off":
                    weekOffCount++;
                    break;
            }

            totalCredits += credits;

            if (credits > 0) {
                positiveCredits++;
            }
            else if (credits === 0) {
                zeroCredits++;
            }
            else {
                negativeCredits++;
            }

            attendanceTable.innerHTML += `
                <tr>
                    <td>${emp.empId}</td>
                    <td>${emp.name}</td>
                    <td>${emp.role}</td>
                    <td>${emp.department}</td>
                    <td>${emp.loginTime || "-"}</td>
                    <td>${emp.logoutTime || "-"}</td>
                    <td>${emp.workingHours || "-"}</td>
                    <td>${getStatusBadge(emp.status)}</td>
                   <td class="${
    credits < 0
        ? 'negative-credit'
        : credits === 0
        ? 'zero-credit'
        : 'positive-credit'
}">
    ${credits.toFixed(1)}
</td>
                </tr>
            `;
        });

        const negativeEmployees =
            employees.filter(
                emp => Number(emp.credits) < 0
            );

        if (negativeEmployees.length === 0) {

            negativeCreditTable.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align:center;">
                        No negative credits
                    </td>
                </tr>
            `;
        }
        else {

         negativeEmployees.forEach(emp => {

    const credits =
        Number(emp.credits || 0);

    negativeCreditTable.innerHTML += `
        <tr>

            <td>${emp.empId}</td>

            <td>${emp.name}</td>

            <td class="negative-credit">
                ${credits.toFixed(1)}
            </td>

        </tr>
    `;
});
        }

        document.getElementById("totalEmployees").textContent =
            employees.length;

        document.getElementById("presentCount").textContent =
            presentCount;

        document.getElementById("halfDayCount").textContent =
            halfDayCount;

        document.getElementById("leaveCount").textContent =
            leaveCount;

        document.getElementById("weekOffCount").textContent =
            weekOffCount;

        document.getElementById("positiveCredits").textContent =
            positiveCredits;

        document.getElementById("zeroCredits").textContent =
            zeroCredits;

        document.getElementById("negativeCredits").textContent =
            negativeCredits;

        renderCreditsChart(
            positiveCredits,
            zeroCredits,
            negativeCredits,
            totalCredits
        );

        const negativeAlert =
            document.getElementById("negativeAlert");

        if (negativeCredits > 0) {

            negativeAlert.style.display = "flex";

            negativeAlert.querySelector("span").textContent =
                `${negativeCredits} Employees have Negative Credits`;
        }
        else {

            negativeAlert.style.display = "none";
        }

        renderOTRecords();

        updateSystemTime();
    }

    function initDashboard() {

        const dateFilter =
            document.getElementById("dateFilter");

        if (!dateFilter) return;

        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        dateFilter.value = today;

        renderDashboard();

        dateFilter.addEventListener(
            "change",
            renderDashboard
        );
    }

    initDashboard();

    setInterval(updateSystemTime, 1000);

})();
const closeModal =
    document.getElementById(
        "closeOtModal"
    );

if(closeModal){

    closeModal.addEventListener(
        "click",
        () => {

            document.getElementById(
                "otDetailsModal"
            ).style.display = "none";
        }
    );
}