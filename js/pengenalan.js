const openingVideo = document.getElementById("openingVideo");
const soundButton = document.getElementById("soundButton");
const soundHint = document.getElementById("soundHint");
const startAdventure = document.getElementById("startAdventure");

function updateSoundControl() {
    const muted = openingVideo.muted || openingVideo.volume === 0;
    soundButton.querySelector("span").textContent = muted ? "🔇" : "🔊";
    soundButton.setAttribute(
        "aria-label",
        muted ? "Aktifkan suara video" : "Matikan suara video"
    );
    soundButton.title = muted ? "Aktifkan suara video" : "Matikan suara video";
}

function showSoundHint(message) {
    soundHint.textContent = message;
    soundHint.classList.add("is-visible");
    window.setTimeout(() => soundHint.classList.remove("is-visible"), 4500);
}

async function startVideo() {
    openingVideo.volume = 1;
    openingVideo.muted = false;

    try {
        await openingVideo.play();
        updateSoundControl();
    } catch {
        // Browser biasanya mengizinkan autoplay tanpa suara, tetapi mensyaratkan
        // sentuhan pengguna sebelum memutar audio.
        openingVideo.muted = true;
        updateSoundControl();
        try {
            await openingVideo.play();
            showSoundHint("Ketuk ikon suara jika ingin mendengarkan audio.");
        } catch {
            showSoundHint("Ketuk layar untuk mulai memutar video.");
        }
    }
}

soundButton.addEventListener("click", async () => {
    openingVideo.muted = !openingVideo.muted;
    if (!openingVideo.muted) openingVideo.volume = 1;

    try {
        await openingVideo.play();
        updateSoundControl();
        showSoundHint(openingVideo.muted ? "Suara dimatikan." : "Suara dinyalakan.");
    } catch {
        openingVideo.muted = true;
        updateSoundControl();
        showSoundHint("Video belum bisa diputar. Coba ketuk ikon suara lagi.");
    }
});

startAdventure.addEventListener("click", () => {
    window.location.href = "menu.html";
});

updateSoundControl();
startVideo();
