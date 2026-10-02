const homeButton = document.getElementById("homeButton");
const levelChoices = document.querySelectorAll(".level-choice");
const levelDialog = document.getElementById("levelDialog");
const levelDialogArt = document.getElementById("levelDialogArt");
const levelDialogTitle = document.getElementById("levelDialogTitle");
const levelStart = document.getElementById("levelStart");
const levelDialogClose = document.getElementById("levelDialogClose");

let lastLevelChoice = null;

homeButton.addEventListener("click", () => {
    window.location.href = "menu.html";
});

levelChoices.forEach((choice) => {
    choice.addEventListener("click", () => {
        lastLevelChoice = choice;
        const level = choice.dataset.level;

        levelDialogArt.src = choice.dataset.popup;
        levelDialogArt.alt = `Pratinjau ${choice.getAttribute("aria-label")}`;
        levelDialogTitle.textContent = `Pratinjau level ${level}`;
        levelStart.setAttribute("aria-label", `Mulai level ${level}`);
        levelDialog.dataset.destination = choice.dataset.destination;

        levelDialog.showModal();
        levelStart.focus();
    });
});

levelStart.addEventListener("click", () => {
    if (levelDialog.dataset.destination) window.location.href = levelDialog.dataset.destination;
});

levelDialogClose.addEventListener("click", () => levelDialog.close());
levelDialog.addEventListener("click", (event) => {
    if (event.target === levelDialog) levelDialog.close();
});
levelDialog.addEventListener("close", () => lastLevelChoice?.focus());
