document
    .getElementById("loginBtn")
    .addEventListener(
        "click",
        loginUser
    );

function loginUser() {

    const username =
        document
            .getElementById(
                "username"
            )
            .value.trim();

    const password =
        document
            .getElementById(
                "password"
            )
            .value.trim();

    const settings =
        JSON.parse(
            localStorage.getItem(
                "systemSettings"
            )
        ) || {};

    const adminUser =
        settings.adminUser ||
        "admin";

    const adminPassword =
        settings.adminPassword ||
        "admin123";

    const errorBox =
        document.getElementById(
            "loginError"
        );

    if (
        username === adminUser &&
        password === adminPassword
    ) {

        sessionStorage.setItem(
            "loggedIn",
            "true"
        );

        window.location.href =
            "index.html?page=dashboard";

        return;
    }

    errorBox.textContent =
        "Invalid username or password";
}

/* Enter Key Support */
document.addEventListener(
    "keydown",
    function (e) {

        if (e.key === "Enter") {
            loginUser();
        }
    }
);