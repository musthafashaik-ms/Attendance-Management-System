(function () {

    const EMPLOYEE_KEY = "employees";
    const ATTENDANCE_KEY = "attendanceRecords";

    const PRESENT_MINUTES = 495; // 8h 15m
    const HALF_DAY_MINUTES = 247; // 4h 07m

    function getEmployees() {
        return JSON.parse(
            localStorage.getItem(EMPLOYEE_KEY)
        ) || [];
    }

    function getAttendanceRecords() {
        return JSON.parse(
            localStorage.getItem(ATTENDANCE_KEY)
        ) || {};
    }

    function saveAttendanceRecords(data) {
        localStorage.setItem(
            ATTENDANCE_KEY,
            JSON.stringify(data)
        );
    }

    function getWorkingMinutes(login, logout) {

        if (!login || !logout) return 0;

        const [lh, lm] =
            login.split(":").map(Number);

        const [oh, om] =
            logout.split(":").map(Number);

        const loginMinutes =
            lh * 60 + lm;

        const logoutMinutes =
            oh * 60 + om;

        const diff =
            logoutMinutes - loginMinutes;

        return diff > 0 ? diff : 0;
    }

    function formatWorkingHours(minutes) {

        if (!minutes) return "-";

        const hrs =
            Math.floor(minutes / 60);

        const mins =
            minutes % 60;

        return `${hrs}h ${mins}m`;
    }

    function calculateAutoStatus(
        minutes,
        login,
        logout
    ) {

        if (!login || !logout) {
            return "Leave";
        }

        if (minutes >= PRESENT_MINUTES) {
            return "Present";
        }

        if (minutes >= HALF_DAY_MINUTES) {
            return "Half Day";
        }

        return "Leave";
    }

    function renderAttendance(date) {

        const table =
            document.getElementById(
                "attendanceEmployeeTable"
            );

        if (!table) return;

        const employees =
            getEmployees();

        const attendanceRecords =
            getAttendanceRecords();

        const dayRecords =
            attendanceRecords[date] || [];

        table.innerHTML = "";

        employees.forEach(emp => {

            const record =
                dayRecords.find(
                    r => r.empId === emp.empId
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
                            value="${record?.loginTime || ""}"
                        >
                    </td>

                    <td>
                        <input
                            type="time"
                            class="logoutTime"
                            data-id="${emp.empId}"
                            value="${record?.logoutTime || ""}"
                        >
                    </td>

                    <td
                        class="workingHours"
                        data-id="${emp.empId}"
                    >
                        ${record?.workingHours || "-"}
                    </td>

                    <td>
                        <select
                            class="statusSelect"
                            data-id="${emp.empId}"
                        >
                            <option value="Auto">
                                Auto
                            </option>

                            <option value="Leave"
                                ${record?.status === "Leave"
                                    ? "selected"
                                    : ""}
                            >
                                Leave
                            </option>

                            <option value="Week Off"
                                ${record?.status === "Week Off"
                                    ? "selected"
                                    : ""}
                            >
                                Week Off
                            </option>
                        </select>
                    </td>

                    <td>
                        ${Number(
                            emp.credits || 0
                        ).toFixed(1)}
                    </td>

                </tr>
            `;
        });

        attachAutoCalculation();
    }

    function attachAutoCalculation() {

        const loginInputs =
            document.querySelectorAll(
                ".loginTime"
            );

        const logoutInputs =
            document.querySelectorAll(
                ".logoutTime"
            );

        [...loginInputs, ...logoutInputs]
            .forEach(input => {

                input.addEventListener(
                    "change",
                    function () {

                        const empId =
                            this.dataset.id;

                        const login =
                            document.querySelector(
                                `.loginTime[data-id="${empId}"]`
                            );

                        const logout =
                            document.querySelector(
                                `.logoutTime[data-id="${empId}"]`
                            );

                        const workingCell =
                            document.querySelector(
                                `.workingHours[data-id="${empId}"]`
                            );

                        const minutes =
                            getWorkingMinutes(
                                login.value,
                                logout.value
                            );

                        workingCell.textContent =
                            formatWorkingHours(
                                minutes
                            );
                    }
                );
            });
    }

    function saveAttendance() {

        const date =
            document.getElementById(
                "attendanceDate"
            ).value;

        const employees =
            getEmployees();

        const attendanceRecords =
            getAttendanceRecords();

        const records =
            employees.map(emp => {

                const login =
                    document.querySelector(
                        `.loginTime[data-id="${emp.empId}"]`
                    );

                const logout =
                    document.querySelector(
                        `.logoutTime[data-id="${emp.empId}"]`
                    );

                const statusSelect =
                    document.querySelector(
                        `.statusSelect[data-id="${emp.empId}"]`
                    );

                const minutes =
                    getWorkingMinutes(
                        login.value,
                        logout.value
                    );

                const status =
                    statusSelect.value === "Auto"
                        ? calculateAutoStatus(
                              minutes,
                              login.value,
                              logout.value
                          )
                        : statusSelect.value;

                return {

                    empId:
                        emp.empId,

                    name:
                        emp.name,

                    role:
                        emp.role,

                    department:
                        emp.department,

                    loginTime:
                        login.value,

                    logoutTime:
                        logout.value,

                    workingHours:
                        formatWorkingHours(
                            minutes
                        ),

                    status,

                    credits:
                        Number(
                            emp.credits || 0
                        ).toFixed(1)
                };
            });

        attendanceRecords[date] =
            records;

        saveAttendanceRecords(
            attendanceRecords
        );

        alert(
            "Attendance saved successfully"
        );
    }

    function downloadAttendancePDF() {

        const date =
            document.getElementById(
                "attendanceDate"
            ).value;

        const attendanceRecords =
            getAttendanceRecords();

        const records =
            attendanceRecords[date] || [];

        if (!records.length) {

            alert(
                "No attendance found for selected date."
            );

            return;
        }

        const { jsPDF } =
            window.jspdf;

        const doc =
            new jsPDF(
                "landscape"
            );

        doc.setFontSize(18);

        doc.text(
            "Attendance Report",
            14,
            18
        );

        doc.setFontSize(11);

        doc.text(
            `Date : ${date}`,
            14,
            26
        );

        const rows =
            records.map(emp => [

                emp.empId,
                emp.name,
                emp.role,
                emp.department,
                emp.loginTime,
                emp.logoutTime,
                emp.workingHours,
                emp.status,
                emp.credits

            ]);

        doc.autoTable({

            startY: 35,

            head: [[

                "Emp ID",
                "Name",
                "Role",
                "Department",
                "Login",
                "Logout",
                "Working Hours",
                "Status",
                "Credits"

            ]],

            body: rows,

            theme: "grid",

            styles: {
                fontSize: 8
            },

            headStyles: {
                fillColor: [37, 99, 235]
            }
        });

        doc.save(
            `Attendance_${date}.pdf`
        );
    }

    function init() {

        const dateInput =
            document.getElementById(
                "attendanceDate"
            );

        const saveBtn =
            document.getElementById(
                "saveAttendanceBtn"
            );

        const pdfBtn =
            document.getElementById(
                "downloadPdfBtn"
            );

        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        dateInput.value =
            today;

        renderAttendance(today);

        dateInput.addEventListener(
            "change",
            function () {

                renderAttendance(
                    this.value
                );
            }
        );

        saveBtn.addEventListener(
            "click",
            saveAttendance
        );

        pdfBtn.addEventListener(
            "click",
            downloadAttendancePDF
        );
    }

    init();

})();