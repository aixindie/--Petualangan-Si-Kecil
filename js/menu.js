const backButton = document.getElementById("backButton");
const missionChoices = document.querySelectorAll(".mission-choice");
const missionDialog = document.getElementById("missionDialog");
const missionDialogArt = document.getElementById("missionDialogArt");
const missionPopupTitle = document.getElementById("missionPopupTitle");
const missionStart = document.getElementById("missionStart");
const missionDialogClose = document.getElementById("missionDialogClose");
const exitDialog = document.getElementById("exitDialog");
const stayButton = document.getElementById("stayButton");
const confirmExit = document.getElementById("confirmExit");
const exitNote = document.getElementById("exitNote");

let lastMissionChoice = null;

missionChoices.forEach((choice) => {
    choice.addEventListener("click", (event) => {
        event.preventDefault();

        const destination = choice.getAttribute("href");
        if (["misi1.html", "misi2.html", "misi3.html"].includes(destination)) {
            window.location.href = destination;
            return;
        }

        lastMissionChoice = choice;
        missionDialogArt.src = choice.dataset.levelArt;
        missionDialogArt.alt = `Pratinjau ${choice.getAttribute("aria-label")}`;
        missionPopupTitle.textContent = `Pratinjau ${choice.getAttribute("aria-label")}`;
        missionDialog.dataset.destination = destination;
        missionDialog.showModal();
        missionStart.focus();
    });
});

missionStart.addEventListener("click", () => {
    const destination = missionDialog.dataset.destination;
    if (destination) window.location.href = destination;
});

missionDialogClose.addEventListener("click", () => missionDialog.close());

missionDialog.addEventListener("click", (event) => {
    if (event.target === missionDialog) missionDialog.close();
});

missionDialog.addEventListener("close", () => {
    lastMissionChoice?.focus();
});

backButton.addEventListener("click", () => {
    window.location.href = "pengenalan.html";
});

stayButton.addEventListener("click", () => {
    exitDialog.close();
    backButton.focus();
});

exitDialog.addEventListener("click", (event) => {
    if (event.target === exitDialog) {
        exitDialog.close();
        backButton.focus();
    }
});

confirmExit.addEventListener("click", async () => {
    const androidExit = window.Android?.exitApp ?? window.Android?.closeApp;
    const cordovaExit = window.navigator.app?.exitApp;
    const capacitorExit = window.Capacitor?.Plugins?.App?.exitApp;
    const exitApp = androidExit ?? cordovaExit ?? capacitorExit;

    if (exitApp) {
        try {
            await exitApp.call(window.Android ?? window.navigator.app ?? window.Capacitor.Plugins.App);
            return;
        } catch {
            // Tampilkan petunjuk jika bridge native belum tersambung dengan benar.
        }
    }

    // Browser biasa melarang halaman menutup tab yang dibuka pengguna.
    window.close();
    window.setTimeout(() => {
        exitNote.textContent = "Tampilan pratinjau browser tidak dapat menutup aplikasi. Saat dibuat menjadi APK, tombol ini perlu dihubungkan ke fungsi keluar Android.";
        exitNote.hidden = false;
    }, 150);
});
