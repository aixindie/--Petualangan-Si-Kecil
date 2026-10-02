const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const progressTrack = document.getElementById("progressTrack");
const loadingLabel = document.getElementById("indexLabel");
const loadingContent = document.querySelector(".index-content");

// Progress visual untuk prototipe. Nanti bisa dihubungkan ke proses muat aset asli.
const totalDuration = 4200;
const startedAt = performance.now();
let shownProgress = -1;

function updateProgress(now) {
    const elapsed = now - startedAt;
    const fraction = Math.min(elapsed / totalDuration, 1);
    // Memperlambat sedikit bagian akhir agar terasa seperti loading game.
    const easedFraction = 1 - Math.pow(1 - fraction, 1.35);
    const progress = Math.round(easedFraction * 100);

    if (progress !== shownProgress) {
        shownProgress = progress;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
        progressTrack.setAttribute("aria-valuenow", String(progress));
    }

    if (fraction < 1) {
        requestAnimationFrame(updateProgress);
        return;
    }

    loadingContent.classList.add("is-complete");
    loadingLabel.textContent = "Siap berpetualang!";

    window.setTimeout(() => {
        window.location.href = "pengenalan.html";
    }, 850);
}

requestAnimationFrame(updateProgress);
