const pageContent = document.getElementById("pageContent");
const menuItems = document.querySelectorAll(".menu-item");

/* Load CSS */
function loadPageCSS(pageName) {
    const oldCSS = document.getElementById("dynamic-page-css");
    if (oldCSS) oldCSS.remove();

    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = `css/${pageName}.css?v=${Date.now()}`;
    css.id = "dynamic-page-css";

    document.head.appendChild(css);
}

/* Load JS safely */
function loadPageScript(pageName) {
    const oldScript = document.getElementById("dynamic-page-script");

    if (oldScript) {
        oldScript.remove();
    }

    const script = document.createElement("script");
    script.src = `js/${pageName}.js?v=${Date.now()}`;
    script.id = "dynamic-page-script";

    document.body.appendChild(script);
}

/* Load HTML */
async function loadPage(pageName) {
    try {
        const response = await fetch(`pages/${pageName}.html?v=${Date.now()}`);

        if (!response.ok) {
            pageContent.innerHTML = `
                <div class="top-header">
                    <h1>Page Not Found</h1>
                </div>
            `;
            return;
        }

        const html = await response.text();

        /* clear old content */
        pageContent.innerHTML = "";

        /* inject new content */
        pageContent.innerHTML = html;

        loadPageCSS(pageName);

        setTimeout(() => {
            loadPageScript(pageName);
        }, 50);

    } catch (error) {
        pageContent.innerHTML = `
            <div class="top-header">
                <h1>Error</h1>
                <p>${error.message}</p>
            </div>
        `;
    }
}

/* Navigation */
menuItems.forEach(item => {
    item.addEventListener("click", function (e) {
        e.preventDefault();

        const page = this.dataset.page;

        menuItems.forEach(menu =>
            menu.classList.remove("active")
        );

        this.classList.add("active");

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
                    <p>Coming soon...</p>
                </div>
            `;
            return;
        }

        loadPage(page);
    });
});

/* Initial */
loadPage("dashboard");