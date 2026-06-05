const REPORT_EMPLOYEE_KEY = "employees";
const REPORT_ATTENDANCE_KEY = "attendanceRecords";
const REPORT_LEAVE_KEY = "leaveRecords";
const REPORT_OT_KEY = "otRecords";

/* ---------------- DATA ---------------- */

function getEmployees() {
    return JSON.parse(
        localStorage.getItem(REPORT_EMPLOYEE_KEY)
    ) || [];
}

function getAttendance() {
    return JSON.parse(
        localStorage.getItem(REPORT_ATTENDANCE_KEY)
    ) || {};
}

function getLeaves() {
    return JSON.parse(
        localStorage.getItem(REPORT_LEAVE_KEY)
    ) || [];
}

function getOTRecords() {
    return JSON.parse(
        localStorage.getItem(REPORT_OT_KEY)
    ) || [];
}

/* ---------------- FILTERS ---------------- */

function loadFilters() {

    const employees = getEmployees();

    const employeeFilter =
        document.getElementById(
            "employeeFilter"
        );

    const departmentFilter =
        document.getElementById(
            "departmentFilter"
        );

    if (!employeeFilter || !departmentFilter)
        return;

    employeeFilter.innerHTML =
        `<option value="">All Employees</option>`;

    departmentFilter.innerHTML =
        `<option value="">All Departments</option>`;

    const departments = [];

    employees.forEach(emp => {

        employeeFilter.innerHTML += `
            <option value="${emp.empId}">
                ${emp.name}
            </option>
        `;

        if (
            emp.department &&
            !departments.includes(
                emp.department
            )
        ) {
            departments.push(
                emp.department
            );
        }
    });

    departments.forEach(dept => {

        departmentFilter.innerHTML += `
            <option value="${dept}">
                ${dept}
            </option>
        `;
    });
}

/* ---------------- REPORT TABLE ---------------- */

function renderReportsTable() {

    const employees =
        getEmployees();

    const attendance =
        getAttendance();

    const leaves =
        getLeaves();

    const otRecords =
        getOTRecords();

    const employeeFilter =
        document.getElementById(
            "employeeFilter"
        )?.value || "";

    const departmentFilter =
        document.getElementById(
            "departmentFilter"
        )?.value || "";

    const fromDate =
        document.getElementById(
            "fromDate"
        )?.value || "";

    const toDate =
        document.getElementById(
            "toDate"
        )?.value || "";

    const tbody =
        document.getElementById(
            "reportTableBody"
        );

    if (!tbody) return;

    tbody.innerHTML = "";

    let totalEmployees = 0;
    let totalPresent = 0;
    let totalLeave = 0;
    let totalOTHours = 0;
    let totalCredits = 0;

    const filteredEmployees =
        employees.filter(emp => {

            const empMatch =
                !employeeFilter ||
                emp.empId === employeeFilter;

            const deptMatch =
                !departmentFilter ||
                emp.department === departmentFilter;

            return empMatch && deptMatch;
        });

    filteredEmployees.forEach(emp => {

        let presentDays = 0;
        let leaveDays = 0;
        let halfDays = 0;
        let otHours = 0;

        Object.keys(attendance)
            .forEach(date => {

                if (
                    fromDate &&
                    date < fromDate
                ) return;

                if (
                    toDate &&
                    date > toDate
                ) return;

                const records =
                    attendance[date] || [];

                const record =
                    records.find(
                        r =>
                        r.empId ===
                        emp.empId
                    );

                if (!record) return;

                if (
                    record.status ===
                    "Present"
                ) {
                    presentDays++;
                }

                if (
                    record.status ===
                        "Half Day" ||
                    record.status ===
                        "HalfDay"
                ) {
                    halfDays++;
                }
            });

        leaves.forEach(leave => {

            const leaveDate =
                leave.leaveDate ||
                leave.date;

            if (
                leave.empId === emp.empId ||
                leave.employeeId === emp.empId
            ) {

                if (
                    (!fromDate ||
                        leaveDate >=
                            fromDate) &&
                    (!toDate ||
                        leaveDate <=
                            toDate)
                ) {
                    leaveDays++;
                }
            }
        });

        otRecords.forEach(ot => {

            const otDate =
                ot.date || "";

            if (
                ot.empId === emp.empId
            ) {

                if (
                    (!fromDate ||
                        otDate >=
                            fromDate) &&
                    (!toDate ||
                        otDate <=
                            toDate)
                ) {

                    otHours += Number(
                        ot.otHours ||
                        ot.hours ||
                        0
                    );
                }
            }
        });

        const credits =
            Number(
                emp.leaveCredits ??
                emp.credits ??
                0
            );

        totalEmployees++;
        totalPresent += presentDays;
        totalLeave += leaveDays;
        totalOTHours += otHours;
        totalCredits += credits;

        tbody.innerHTML += `
            <tr>
                <td>${emp.empId}</td>
                <td>${emp.name}</td>
                <td>${emp.department}</td>
                <td>${presentDays}</td>
                <td>${leaveDays}</td>
                <td>${halfDays}</td>
                <td>${otHours.toFixed(2)}</td>
                <td>${credits.toFixed(1)}</td>
            </tr>
        `;
    });

    document.getElementById(
        "totalEmployees"
    ).textContent =
        totalEmployees;

    document.getElementById(
        "presentDays"
    ).textContent =
        totalPresent;

    document.getElementById(
        "leaveDays"
    ).textContent =
        totalLeave;

    document.getElementById(
        "totalOTHours"
    ).textContent =
        totalOTHours.toFixed(2);

    document.getElementById(
        "totalCredits"
    ).textContent =
        totalCredits.toFixed(1);
}

/* ---------------- PDF DOWNLOAD ---------------- */

function downloadPDF() {

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
        15
    );

    const rows = [];

    document
        .querySelectorAll(
            "#reportTableBody tr"
        )
        .forEach(row => {

            const cols = [];

            row.querySelectorAll("td")
                .forEach(td => {
                    cols.push(
                        td.innerText
                    );
                });

            if (cols.length) {
                rows.push(cols);
            }
        });

    doc.autoTable({

        startY: 25,

        head: [[
            "Emp ID",
            "Name",
            "Department",
            "Present Days",
            "Leave Days",
            "Half Days",
            "OT Hours",
            "Leave Credits"
        ]],

        body: rows,

        theme: "grid",

        headStyles: {
            fillColor: [37, 99, 235]
        },

        styles: {
            fontSize: 9
        }
    });

    doc.save(
        "Attendance_Report.pdf"
    );
}

/* ---------------- GENERATE ---------------- */

function generateReport() {

    renderReportsTable();
}

/* ---------------- INIT ---------------- */

function initReports() {

    loadFilters();

    renderReportsTable();

    document
        .getElementById(
            "generateReportBtn"
        )
        ?.addEventListener(
            "click",
            generateReport
        );

    document
        .getElementById(
            "downloadPdfBtn"
        )
        ?.addEventListener(
            "click",
            downloadPDF
        );

    document
        .getElementById(
            "employeeFilter"
        )
        ?.addEventListener(
            "change",
            renderReportsTable
        );

    document
        .getElementById(
            "departmentFilter"
        )
        ?.addEventListener(
            "change",
            renderReportsTable
        );

    document
        .getElementById(
            "fromDate"
        )
        ?.addEventListener(
            "change",
            renderReportsTable
        );

    document
        .getElementById(
            "toDate"
        )
        ?.addEventListener(
            "change",
            renderReportsTable
        );
}

initReports();