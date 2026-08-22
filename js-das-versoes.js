
// ////////////////////////////////////////
//
// -016Mv : RENDERIZAÇÃO DAS ATUALIZAÇÕES
//
// ////////////////////////////////////////

function renderSystemUpdates() {
    const updatesList = document.getElementById("updates-list");

    if (!updatesList) return;

    updatesList.innerHTML = "";

    systemUpdates.forEach((update) => {
        const updateItem = document.createElement("div");
        updateItem.className = "update-item";

        const updateVersion = document.createElement("div");
        updateVersion.className = "update-version";

        const version = document.createElement("span");
        version.textContent = `Versão ${update.version} (${update.status})`;

        const date = document.createElement("span");
        date.className = "update-date";
        date.textContent = update.date;

        updateVersion.appendChild(version);
        updateVersion.appendChild(date);

        const description = document.createElement("p");
        description.className = "update-desc";

        update.description.forEach((text, index) => {
            const item = document.createElement("span");
            item.textContent = `• ${text}`;

            description.appendChild(item);

            if (index < update.description.length - 1) {
                description.appendChild(document.createElement("br"));
            }
        });

        updateItem.appendChild(updateVersion);
        updateItem.appendChild(description);

        updatesList.appendChild(updateItem);
    });
}


// ////////////////////////////////////////
//
// -017Mw : CONTROLE DO MODAL
//
// ////////////////////////////////////////

const modalUpdates = document.getElementById("modal-updates");
const btnCloseModalUpdates = document.getElementById(
    "btn-close-modal-updates"
);

function openUpdatesModal() {
    if (!modalUpdates) return;

    renderSystemUpdates();
    modalUpdates.classList.add("active");
}

function closeUpdatesModal() {
    if (!modalUpdates) return;

    modalUpdates.classList.remove("active");
}

if (btnCloseModalUpdates) {
    btnCloseModalUpdates.addEventListener(
        "click",
        closeUpdatesModal
    );
}

if (modalUpdates) {
    modalUpdates.addEventListener("click", (event) => {
        if (event.target === modalUpdates) {
            closeUpdatesModal();
        }
    });
}

renderSystemUpdates();