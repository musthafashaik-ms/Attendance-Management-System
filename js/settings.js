const SETTINGS_KEY = "systemSettings";

function loadSettings() {

    const settings =
        JSON.parse(
            localStorage.getItem(SETTINGS_KEY)
        ) || {};

    document.getElementById("companyName").value =
        settings.companyName || "";

    document.getElementById("companyEmail").value =
        settings.companyEmail || "";

    document.getElementById("companyPhone").value =
        settings.companyPhone || "";

    document.getElementById("fullDayHours").value =
        settings.fullDayHours || 8.75;

    document.getElementById("halfDayHours").value =
        settings.halfDayHours || 4.5;

    document.getElementById("weekOffDay").value =
        settings.weekOffDay || "Sunday";

    document.getElementById("monthlyCredit").value =
        settings.monthlyCredit || 1.5;

    document.getElementById("allowNegative").value =
        settings.allowNegative ?? true;

    document.getElementById("adminUser").value =
        settings.adminUser || "admin";

    document.getElementById("adminPassword").value =
        settings.adminPassword || "";
}

function saveSettings() {

    const settings = {

        companyName:
            document.getElementById("companyName").value,

        companyEmail:
            document.getElementById("companyEmail").value,

        companyPhone:
            document.getElementById("companyPhone").value,

        fullDayHours:
            Number(
                document.getElementById("fullDayHours").value
            ),

        halfDayHours:
            Number(
                document.getElementById("halfDayHours").value
            ),

        weekOffDay:
            document.getElementById("weekOffDay").value,

        monthlyCredit:
            Number(
                document.getElementById("monthlyCredit").value
            ),

        allowNegative:
            document.getElementById("allowNegative").value,

        adminUser:
            document.getElementById("adminUser").value,

        adminPassword:
            document.getElementById("adminPassword").value
    };

    localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
    );

    alert("Settings Saved Successfully");
}

document
    .getElementById("saveSettingsBtn")
    ?.addEventListener(
        "click",
        saveSettings
    );

loadSettings();