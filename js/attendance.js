(function () {
    const EMPLOYEE_KEY = "employees";
    const ATTENDANCE_KEY = "attendanceRecords";

    const FULL_DAY_MINUTES = 525; // 8h 45m
    const HALF_DAY_MINUTES = 240; // 4h

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

    function calculateAutoStatus(login, logout) {
        const workingMinutes = getWorkingMinutes(login, logout);

        if (workingMinutes >= FULL_DAY_MINUTES) {
            return "Present";
        }

        if (workingMinutes >= HALF_DAY_MINUTES) {
            return "Half Day";
        }

        return "";
    }

    function renderAttendance(date) {
        const table = document.getElementById("attendanceEmployeeTable");
        if (!table) return;

        const employees = getEmployees();
        const attendanceRecords = getAttendanceRecords();
        const savedAttendance = attendanceRecords[date] || [];

        table.innerHTML = "";

        employees.forEach(emp => {
            const saved = savedAttendance.find(a => a.empId === emp.empId);

            table.innerHTML += `
                <tr>
                    <td>${emp.empId}</td>
                    <td>${emp.name}</td>
                    <td>${emp.role}</td>
                    <td>${emp.department}</td>

                    <td>
                        <input type="time"
                               class="loginTime"
                               data-id="${emp.empId}"
                               value="${saved?.loginTime || ""}">
                    </td>

                    <td>
                        <input type="time"
                               class="logoutTime"
                               data-id="${emp.empId}"
                               value="${saved?.logoutTime || ""}">
                    </td>

                    <td class="workingHours" data-id="${emp.empId}">
                        ${saved?.workingHours || "-"}
                    </td>

                    <td>
                        <select class="attendanceStatus" data-id="${emp.empId}">
                            <option value="">Auto</option>
                            <option value="Leave" ${saved?.status === "Leave" ? "selected" : ""}>Leave</option>
                            <option value="Week Off" ${saved?.status === "Week Off" ? "selected" : ""}>Week Off</option>
                        </select>
                    </td>

                    <td>${emp.credits}</td>
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

                const loginInput = document.querySelector(`.loginTime[data-id="${empId}"]`);
                const logoutInput = document.querySelector(`.logoutTime[data-id="${empId}"]`);
                const workingCell = document.querySelector(`.workingHours[data-id="${empId}"]`);

                const minutes = getWorkingMinutes(
                    loginInput.value,
                    logoutInput.value
                );

                workingCell.textContent = formatWorkingHours(minutes);
            });
        });
    }

    function saveAttendance() {
        const date = document.getElementById("attendanceDate").value;
        if (!date) {
            alert("Select a date");
            return;
        }

        const employees = getEmployees();
        const attendanceRecords = getAttendanceRecords();

        const attendanceData = employees.map(emp => {
            const loginInput = document.querySelector(`.loginTime[data-id="${emp.empId}"]`);
            const logoutInput = document.querySelector(`.logoutTime[data-id="${emp.empId}"]`);
            const statusInput = document.querySelector(`.attendanceStatus[data-id="${emp.empId}"]`);

            const loginTime = loginInput.value;
            const logoutTime = logoutInput.value;

            const workingMinutes = getWorkingMinutes(loginTime, logoutTime);
            const workingHours = formatWorkingHours(workingMinutes);

            let status = statusInput.value;

            // Manual override
            if (status !== "Leave" && status !== "Week Off") {
                status = calculateAutoStatus(loginTime, logoutTime);
            }

            // If nothing qualifies
            if (!status) {
                status = "Absent";
            }

            return {
                empId: emp.empId,
                name: emp.name,
                role: emp.role,
                department: emp.department,
                loginTime,
                logoutTime,
                workingHours,
                status,
                credits: emp.credits
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

        if (!dateInput || !saveBtn) return;

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