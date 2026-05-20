const pageContent = document.getElementById("pageContent");
const menuItems = document.querySelectorAll(".menu-item");

/* Remove old CSS */
function removeDynamicCSS() {
    document.querySelectorAll(".dynamic-css").forEach(css => css.remove());
}

/* Remove old JS */
function removeDynamicJS() {
    document.querySelectorAll(".dynamic-script").forEach(script => script.remove());
}

/* Load CSS */
function loadPageCSS(pageName) {
    removeDynamicCSS();

    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = `css/${pageName}.css?v=${Date.now()}`;
    css.classList.add("dynamic-css");

    document.head.appendChild(css);
}

/* Load JS */
function loadPageScript(pageName) {
    removeDynamicJS();

    const script = document.createElement("script");
    script.src = `js/${pageName}.js?v=${Date.now()}`;
    script.classList.add("dynamic-script");

    document.body.appendChild(script);
}

/* Set active menu */
function setActiveMenu(pageName) {
    menuItems.forEach(item => {
        item.classList.remove("active");

        if (item.dataset.page === pageName) {
            item.classList.add("active");
        }
    });
}

/* Load page */
async function loadPage(pageName, updateURL = true) {
    try {
        const response = await fetch(`pages/${pageName}.html?v=${Date.now()}`);

        if (!response.ok) {
            pageContent.innerHTML = `
                <div class="top-header">
                    <h1>Page Not Found</h1>
                    <p>${pageName}.html not found</p>
                </div>
            `;
            return;
        }

        const html = await response.text();

        pageContent.innerHTML = html;

        loadPageCSS(pageName);

        setTimeout(() => {
            loadPageScript(pageName);
        }, 100);

        setActiveMenu(pageName);

        /* Update URL */
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

/* Sidebar click */
menuItems.forEach(item => {
    item.addEventListener("click", function (e) {
        e.preventDefault();

        const page = this.dataset.page;

        if (page === "logout") {
            localStorage.clear();
            location.reload();
            return;
        }

        if (
            page === "leave" ||
            page === "ot" ||
            page === "reports" ||
            page === "settings"
        ) {
            pageContent.innerHTML = `
                <div class="top-header">
                    <h1>${this.querySelector("span").textContent}</h1>
                    <p>Module coming soon...</p>
                </div>
            `;

            history.pushState(
                { page },
                "",
                `index.html?page=${page}`
            );

            setActiveMenu(page);

            return;
        }

        loadPage(page);
    });
});

/* Browser back/forward */
window.addEventListener("popstate", function (event) {
    const page = event.state?.page || "dashboard";
    loadPage(page, false);
});

/* Initial load from URL */
const params = new URLSearchParams(window.location.search);
const currentPage = params.get("page") || "dashboard";

loadPage(currentPage, false);