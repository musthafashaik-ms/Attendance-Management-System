const employeeKey = "employees";
const otKey = "otRecords";

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

function formatDate(date) {
    return new Date(date).toISOString().split("T")[0];
}

function calculateWorkingHours(login, logout) {
    if (!login || !logout) return "-";

    const [lh, lm] = login.split(":").map(Number);
    const [oh, om] = logout.split(":").map(Number);

    const loginMinutes = lh * 60 + lm;
    const logoutMinutes = oh * 60 + om;
    const diff = logoutMinutes - loginMinutes;

    if (diff <= 0) return "-";

    const hours = Math.floor(diff / 60);
    const mins = diff % 60;

    return `${hours}h ${mins}m`;
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

/* Main Dashboard Render */
function renderDashboard() {
    const employees = getStorageData(employeeKey);
    const otRecords = getStorageData(otKey);

    const selectedDate = dateFilter.value || formatDate(new Date());

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

    employees.forEach(emp => {
        const empDate = emp.date || formatDate(new Date());

        if (empDate !== selectedDate) return;

        const status = emp.status || "Absent";
        const loginTime = emp.loginTime || "-";
        const logoutTime = emp.logoutTime || "-";
        const workingHours =
            emp.workingHours ||
            calculateWorkingHours(loginTime, logoutTime);

        if (status === "Present") presentCount++;
        else if (status === "Half Day") halfDayCount++;
        else if (status === "Leave") leaveCount++;
        else if (status === "Week Off") weekOffCount++;

        const credits = Number(emp.credits || 0);

        totalCredits += credits;

        if (credits > 0) positiveCredits++;
        else if (credits === 0) zeroCredits++;
        else negativeCredits++;

        attendanceTable.innerHTML += `
            <tr>
                <td>${emp.empId}</td>
                <td>${emp.name}</td>
                <td>${emp.role || "-"}</td>
                <td>${emp.department || "-"}</td>
                <td>${loginTime}</td>
                <td>${logoutTime}</td>
                <td>${workingHours}</td>
                <td>${getStatusBadge(status)}</td>
                <td>${credits}</td>
            </tr>
        `;
    });

    /* Negative Credits Table */
    employees
        .filter(emp => Number(emp.credits || 0) < 0)
        .forEach(emp => {
            negativeCreditTable.innerHTML += `
                <tr>
                    <td>${emp.empId}</td>
                    <td>${emp.name}</td>
                    <td>${emp.credits}</td>
                </tr>
            `;
        });

    /* OT Records */
    otRecords.forEach(record => {
        otTable.innerHTML += `
            <tr>
                <td>${record.empId}</td>
                <td>${record.date}</td>
                <td>${record.hours}</td>
                <td>${record.mode}</td>
                <td><i class="fa-solid fa-circle-info"></i></td>
            </tr>
        `;
    });

    /* Summary Cards */
    totalEmployeesEl.textContent = employees.length;
    presentCountEl.textContent = presentCount;
    halfDayCountEl.textContent = halfDayCount;
    leaveCountEl.textContent = leaveCount;
    weekOffCountEl.textContent = weekOffCount;

    totalCreditsEl.textContent = totalCredits;
    positiveCreditsEl.textContent = positiveCredits;
    zeroCreditsEl.textContent = zeroCredits;
    negativeCreditsEl.textContent = negativeCredits;

    /* Negative Alert */
    if (negativeCredits > 0) {
        negativeAlertEl.style.display = "flex";
        negativeAlertEl.querySelector("span").textContent =
            `${negativeCredits} Employee${negativeCredits > 1 ? "s" : ""} have Negative Credits`;
    } else {
        negativeAlertEl.style.display = "none";
    }

    updateSystemTime();
}

/* Init */
dateFilter.value = formatDate(new Date());
systemUpdateEl.textContent = "System is up to date. Last updated: --";

dateFilter.addEventListener("change", renderDashboard);
window.addEventListener("storage", renderDashboard);

renderDashboard();
setInterval(updateSystemTime, 1000);