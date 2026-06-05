const pageContent = document.getElementById("pageContent");
const menuItems = document.querySelectorAll(".menu-item");

const EMPLOYEE_KEY = "employees";

/* Initialize Storage */
function initializeStorage() {

    if (!localStorage.getItem(EMPLOYEE_KEY)) {
        localStorage.setItem(
            EMPLOYEE_KEY,
            JSON.stringify([])
        );
    }

    if (!localStorage.getItem("attendanceRecords")) {
        localStorage.setItem(
            "attendanceRecords",
            JSON.stringify({})
        );
    }

    if (!localStorage.getItem("leaveRecords")) {
        localStorage.setItem(
            "leaveRecords",
            JSON.stringify([])
        );
    }

    if (!localStorage.getItem("otRecords")) {
        localStorage.setItem(
            "otRecords",
            JSON.stringify([])
        );
    }
}

/* Sidebar Show / Hide */
function toggleSidebar(pageName) {

    const sidebar =
        document.querySelector(".sidebar");

    if (!sidebar) return;

    if (pageName === "login") {

        sidebar.style.display = "none";

    } else {

        sidebar.style.display = "flex";
    }
}

/* Remove CSS */
function removeDynamicCSS() {

    document
        .querySelectorAll(".dynamic-css")
        .forEach(css => css.remove());
}

/* Remove JS */
function removeDynamicJS() {

    document
        .querySelectorAll(".dynamic-script")
        .forEach(script => script.remove());
}

/* Load CSS */
function loadPageCSS(pageName) {

    removeDynamicCSS();

    const css =
        document.createElement("link");

    css.rel = "stylesheet";
    css.href =
        `css/${pageName}.css?v=${Date.now()}`;

    css.classList.add("dynamic-css");

    document.head.appendChild(css);
}

/* Load JS */
function loadPageScript(pageName) {

    removeDynamicJS();

    const script =
        document.createElement("script");

    script.src =
        `js/${pageName}.js?v=${Date.now()}`;

    script.classList.add("dynamic-script");

    document.body.appendChild(script);
}

/* Active Menu */
function setActiveMenu(pageName) {

    menuItems.forEach(item => {

        item.classList.remove("active");

        if (
            item.dataset.page === pageName
        ) {
            item.classList.add("active");
        }
    });
}

/* Load Page */
async function loadPage(
    pageName,
    updateURL = true
) {

    const isLoggedIn =
        sessionStorage.getItem("loggedIn");

    /* Protect Pages */
    if (
        !isLoggedIn &&
        pageName !== "login"
    ) {
        pageName = "login";
    }

    try {

        const response =
            await fetch(
                `pages/${pageName}.html?v=${Date.now()}`
            );

        if (!response.ok) {

            pageContent.innerHTML = `
                <div class="top-header">
                    <h1>Page Not Found</h1>
                    <p>${pageName}.html not found</p>
                </div>
            `;

            return;
        }

        const html =
            await response.text();

        pageContent.innerHTML = html;

        toggleSidebar(pageName);

        loadPageCSS(pageName);

        setTimeout(() => {
            loadPageScript(pageName);
        }, 100);

        setActiveMenu(pageName);

        if (updateURL) {

            history.pushState(
                { page: pageName },
                "",
                `index.html?page=${pageName}`
            );
        }

    } catch (error) {

        console.error(error);

        pageContent.innerHTML = `
            <div class="top-header">
                <h1>Error Loading Page</h1>
                <p>${error.message}</p>
            </div>
        `;
    }
}

/* Sidebar Click */
menuItems.forEach(item => {

    item.addEventListener(
        "click",
        function (e) {

            e.preventDefault();

            const page =
                this.dataset.page;

            /* Logout */
            if (page === "logout") {

                const confirmLogout =
                    confirm(
                        "Are you sure you want to logout?"
                    );

                if (!confirmLogout)
                    return;

                sessionStorage.removeItem(
                    "loggedIn"
                );

                loadPage("login");

                return;
            }

            loadPage(page);
        }
    );
});

/* Browser Back */
window.addEventListener(
    "popstate",
    function (event) {

        const page =
            event.state?.page ||
            "login";

        loadPage(page, false);
    }
);

/* Initialize */
initializeStorage();

/* First Load */
const params =
    new URLSearchParams(
        window.location.search
    );

const currentPage =
    params.get("page") ||
    "login";

const isLoggedIn =
    sessionStorage.getItem(
        "loggedIn"
    );

if (!isLoggedIn) {

    loadPage(
        "login",
        false
    );

} else {

    loadPage(
        currentPage === "login"
            ? "dashboard"
            : currentPage,
        false
    );
}