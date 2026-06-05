const OT_KEY = "otRecords";

function getOTRecords() {

    return JSON.parse(
        localStorage.getItem(OT_KEY)
    ) || [];
}

function saveOTRecords(records) {

    localStorage.setItem(
        OT_KEY,
        JSON.stringify(records)
    );
}

const otForm =
    document.getElementById("otForm");

const otTableBody =
    document.getElementById("otTableBody");

let editIndex = -1;

function renderOTTable() {

    const records =
        getOTRecords();

    otTableBody.innerHTML = "";

    records.forEach((record, index) => {

        otTableBody.innerHTML += `
            <tr>

                <td>${record.empId}</td>

                <td>${record.date}</td>

                <td>${record.hours}</td>

                <td>${record.mode}</td>

                <td class="action-buttons">

                    <button
                        class="edit-btn"
                        onclick="editOT(${index})">

                        Edit

                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteOT(${index})">

                        Delete

                    </button>

                </td>

            </tr>
        `;
    });
}

window.editOT = function(index) {

    const records =
        getOTRecords();

    const record =
        records[index];

    document.getElementById(
        "otEmpId"
    ).value =
        record.empId;

    document.getElementById(
        "otDate"
    ).value =
        record.date;

    document.getElementById(
        "otHours"
    ).value =
        record.hours;

    document.getElementById(
        "otMode"
    ).value =
        record.mode;

    editIndex = index;

    document.querySelector(
        ".primary-btn"
    ).textContent =
        "Update OT Record";
};

window.deleteOT = function(index) {

    const confirmDelete =
        confirm(
            "Delete this OT Record?"
        );

    if (!confirmDelete) return;

    const records =
        getOTRecords();

    records.splice(index, 1);

    saveOTRecords(records);

    renderOTTable();
};

otForm.addEventListener(
    "submit",
    function(e) {

        e.preventDefault();

        const records =
            getOTRecords();

        const record = {

            empId:
                document.getElementById(
                    "otEmpId"
                ).value,

            date:
                document.getElementById(
                    "otDate"
                ).value,

            hours:
                document.getElementById(
                    "otHours"
                ).value,

            mode:
                document.getElementById(
                    "otMode"
                ).value
        };

        if (editIndex === -1) {

            records.push(record);

        } else {

            records[editIndex] =
                record;

            editIndex = -1;

            document.querySelector(
                ".primary-btn"
            ).textContent =
                "Save OT Record";
        }

        saveOTRecords(records);

        otForm.reset();

        renderOTTable();
    }
);

renderOTTable();