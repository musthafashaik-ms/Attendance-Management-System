let employeeKey = "employees";

/* Elements */
const attendanceTable = document.getElementById("attendanceTable");
const negativeCreditTable = document.getElementById("negativeCreditTable");
const otTable = document.getElementById("otTable");
const dateFilter = document.getElementById("dateFilter");

const totalEmployeesEl = document.getElementById("totalEmployees");
const presentCountEl = document.getElementById("presentCount");
const halfDayCountEl = document.getElementById("halfDayCount");
const leaveCountEl = document.getElementById("leaveCount");
const weekOffCountEl = document.getElementById("weekOffCount");

const totalCreditsEl = document.getElementById("totalCredits");
const positiveCreditsEl = document.getElementById("positiveCredits");
const zeroCreditsEl = document.getElementById("zeroCredits");
const negativeCreditsEl = document.getElementById("negativeCredits");

const negativeAlertEl = document.getElementById("negativeAlert");
const systemUpdateEl = document.getElementById("systemUpdate");

/* Helpers */
function getStorageData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function getStatusBadge(status) {
    switch (status) {
        case "Present":
            return `<span class="status present">Present</span>`;
        case "Half Day":
            return `<span class="status halfday">Half Day</span>`;
        case "Leave":
            return `<span class="status leave">Leave</span>`;
        case "Week Off":
            return `<span class="status weekoff">Week Off</span>`;
        default:
            return `<span class="status absent">Absent</span>`;
    }
}

function updateSystemTime() {
    systemUpdateEl.textContent =
        `System is up to date. Last updated: ${new Date().toLocaleString()}`;
}

/* Render Dashboard */
function renderDashboard() {
    const employees = getStorageData(employeeKey);

    attendanceTable.innerHTML = "";
    negativeCreditTable.innerHTML = "";
    otTable.innerHTML = "";

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

    totalEmployeesEl.textContent = employees.length;
    presentCountEl.textContent = presentCount;
    halfDayCountEl.textContent = halfDayCount;
    leaveCountEl.textContent = leaveCount;
    weekOffCountEl.textContent = weekOffCount;

    totalCreditsEl.textContent = totalCredits;
    positiveCreditsEl.textContent = positiveCredits;
    zeroCreditsEl.textContent = zeroCredits;
    negativeCreditsEl.textContent = negativeCredits;

    if (negativeCredits > 0) {
        negativeAlertEl.style.display = "flex";
        negativeAlertEl.querySelector("span").textContent =
            `${negativeCredits} Employees have Negative Credits`;
    } else {
        negativeAlertEl.style.display = "none";
    }

    updateSystemTime();
}

/* Init */
renderDashboard();
setInterval(updateSystemTime, 1000);