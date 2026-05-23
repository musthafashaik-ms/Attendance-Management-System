(function () {
    const EMPLOYEE_KEY = "employees";
    const ATTENDANCE_KEY = "attendanceRecords";

    const PRESENT_MINUTES = 495; // 8h 15m
    const HALF_DAY_MINUTES = 247; // 4h 07m

    function getEmployees() {
        return JSON.parse(localStorage.getItem(EMPLOYEE_KEY)) || [];
    }

    function getAttendanceRecords() {
        return JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || {};
    }

    function saveAttendanceRecords(data) {
        localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(data));
    }

    function getWorkingMinutes(login, logout) {
        if (!login || !logout) return 0;

        const [lh, lm] = login.split(":").map(Number);
        const [oh, om] = logout.split(":").map(Number);

        const loginMinutes = lh * 60 + lm;
        const logoutMinutes = oh * 60 + om;

        const diff = logoutMinutes - loginMinutes;
        return diff > 0 ? diff : 0;
    }

    function formatWorkingHours(minutes) {
        if (!minutes) return "-";

        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;

        return `${hrs}h ${mins}m`;
    }

    function calculateAutoStatus(minutes) {
        if (minutes >= PRESENT_MINUTES) {
            return "Present";
        }

        if (minutes >= HALF_DAY_MINUTES) {
            return "Half Day";
        }

        return "Absent";
    }

    function getStatusBadge(status) {
        const classes = {
            Present: "present",
            "Half Day": "halfday",
            Leave: "leave",
            "Week Off": "weekoff",
            Absent: "absent"
        };

        return `
            <span class="status ${classes[status] || "absent"}">
                ${status}
            </span>
        `;
    }

    function renderAttendance(date) {
        const table = document.getElementById("attendanceEmployeeTable");
        if (!table) return;

        const employees = getEmployees();
        const attendanceRecords = getAttendanceRecords();
        const todayAttendance = attendanceRecords[date] || [];

        table.innerHTML = "";

        employees.forEach(emp => {
            const savedRecord = todayAttendance.find(
                record => record.empId === emp.empId
            );

            table.innerHTML += `
                <tr>
                    <td>
                        <input type="checkbox">
                    </td>

                    <td>${emp.empId}</td>
                    <td>${emp.name}</td>
                    <td>${emp.role}</td>
                    <td>${emp.department}</td>

                    <td>
                        <input
                            type="time"
                            class="loginTime"
                            data-id="${emp.empId}"
                            value="${savedRecord?.loginTime || ""}"
                        >
                    </td>

                    <td>
                        <input
                            type="time"
                            class="logoutTime"
                            data-id="${emp.empId}"
                            value="${savedRecord?.logoutTime || ""}"
                        >
                    </td>

                    <td class="workingHours" data-id="${emp.empId}">
                        ${savedRecord?.workingHours || "-"}
                    </td>

                    <td>
                        <select class="statusSelect" data-id="${emp.empId}">
                            <option value="Auto">Auto</option>
                            <option value="Leave" ${
                                savedRecord?.status === "Leave" ? "selected" : ""
                            }>Leave</option>
                            <option value="Week Off" ${
                                savedRecord?.status === "Week Off" ? "selected" : ""
                            }>Week Off</option>
                        </select>

                        <div class="statusCell" data-id="${emp.empId}">
                            ${
                                savedRecord
                                    ? getStatusBadge(savedRecord.status)
                                    : getStatusBadge("Absent")
                            }
                        </div>
                    </td>

                    <td>${Number(emp.credits).toFixed(1)}</td>
                </tr>
            `;
        });

        attachAutoCalculation();
    }

    function attachAutoCalculation() {
        const loginInputs = document.querySelectorAll(".loginTime");
        const logoutInputs = document.querySelectorAll(".logoutTime");

        [...loginInputs, ...logoutInputs].forEach(input => {
            input.addEventListener("change", function () {
                const empId = this.dataset.id;

                const loginInput = document.querySelector(
                    `.loginTime[data-id="${empId}"]`
                );

                const logoutInput = document.querySelector(
                    `.logoutTime[data-id="${empId}"]`
                );

                const statusSelect = document.querySelector(
                    `.statusSelect[data-id="${empId}"]`
                );

                const workingCell = document.querySelector(
                    `.workingHours[data-id="${empId}"]`
                );

                const statusCell = document.querySelector(
                    `.statusCell[data-id="${empId}"]`
                );

                const minutes = getWorkingMinutes(
                    loginInput.value,
                    logoutInput.value
                );

                workingCell.textContent = formatWorkingHours(minutes);

                if (statusSelect.value === "Auto") {
                    statusCell.innerHTML = getStatusBadge(
                        calculateAutoStatus(minutes)
                    );
                }
            });
        });

        document.querySelectorAll(".statusSelect").forEach(select => {
            select.addEventListener("change", function () {
                const empId = this.dataset.id;

                const loginInput = document.querySelector(
                    `.loginTime[data-id="${empId}"]`
                );

                const logoutInput = document.querySelector(
                    `.logoutTime[data-id="${empId}"]`
                );

                const statusCell = document.querySelector(
                    `.statusCell[data-id="${empId}"]`
                );

                const minutes = getWorkingMinutes(
                    loginInput.value,
                    logoutInput.value
                );

                const status =
                    this.value === "Auto"
                        ? calculateAutoStatus(minutes)
                        : this.value;

                statusCell.innerHTML = getStatusBadge(status);
            });
        });
    }

    function saveAttendance() {
        const date = document.getElementById("attendanceDate").value;
        const employees = getEmployees();
        const attendanceRecords = getAttendanceRecords();

        const attendanceData = employees.map(emp => {
            const loginInput = document.querySelector(
                `.loginTime[data-id="${emp.empId}"]`
            );

            const logoutInput = document.querySelector(
                `.logoutTime[data-id="${emp.empId}"]`
            );

            const statusSelect = document.querySelector(
                `.statusSelect[data-id="${emp.empId}"]`
            );

            const minutes = getWorkingMinutes(
                loginInput.value,
                logoutInput.value
            );

            const status =
                statusSelect.value === "Auto"
                    ? calculateAutoStatus(minutes)
                    : statusSelect.value;

            return {
                empId: emp.empId,
                name: emp.name,
                role: emp.role,
                department: emp.department,
                loginTime: loginInput.value,
                logoutTime: logoutInput.value,
                workingHours: formatWorkingHours(minutes),
                status,
                credits: Number(emp.credits).toFixed(1)
            };
        });

        attendanceRecords[date] = attendanceData;
        saveAttendanceRecords(attendanceRecords);

        alert("Attendance saved successfully");
        renderAttendance(date);
    }

    function init() {
        const dateInput = document.getElementById("attendanceDate");
        const saveBtn = document.getElementById("saveAttendanceBtn");

        const today = new Date().toISOString().split("T")[0];
        dateInput.value = today;

        renderAttendance(today);

        dateInput.addEventListener("change", function () {
            renderAttendance(this.value);
        });

        saveBtn.addEventListener("click", saveAttendance);
    }

    init();
})();