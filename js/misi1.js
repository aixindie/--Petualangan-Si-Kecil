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
        const choiceLabel = choice.getAttribute("aria-label");

        levelDialogArt.src = choice.dataset.popup;
        levelDialogArt.alt = `Pratinjau ${choiceLabel}`;
        levelDialogTitle.textContent = `Pratinjau level ${level}`;
        levelStart.setAttribute("aria-label", `Mulai level ${level}`);
        levelDialog.dataset.destination = choice.dataset.destination;

        levelDialog.showModal();
        levelStart.focus();
    });
});

levelStart.addEventListener("click", () => {
    const destination = levelDialog.dataset.destination;
    if (destination) window.location.href = destination;
});

levelDialogClose.addEventListener("click", () => levelDialog.close());

levelDialog.addEventListener("click", (event) => {
    if (event.target === levelDialog) levelDialog.close();
});

levelDialog.addEventListener("close", () => {
    lastLevelChoice?.focus();
});
