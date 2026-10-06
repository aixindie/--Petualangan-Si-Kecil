(() => {
    const enabledKey = "petualangan-bgm-enabled";
    const positionKey = "petualangan-bgm-position";
    const isEnabled = () => sessionStorage.getItem(enabledKey) !== "off";

    const music = new Audio("asset/audio/BGM-petualangan-si-kecil.m4a");
    music.loop = true;
    music.preload = "auto";
    music.volume = 0.38;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "music-toggle";
    toggle.setAttribute("aria-label", "Musik latar mati");
    toggle.setAttribute("aria-pressed", "false");
    toggle.title = "Nyalakan musik latar";

    const icon = document.createElement("img");
    icon.alt = "";
    icon.setAttribute("aria-hidden", "true");
    toggle.append(icon);
    document.body.append(toggle);

    function updateToggle() {
        const playing = !music.paused && !music.ended;
        icon.src = playing ? "asset/icon/music.png" : "asset/icon/nomusic.png";
        toggle.setAttribute("aria-label", playing ? "Matikan musik latar" : "Nyalakan musik latar");
        toggle.setAttribute("aria-pressed", String(playing));
        toggle.title = playing ? "Matikan musik latar" : "Nyalakan musik latar";
    }

    async function playMusic() {
        try {
            await music.play();
        } catch {
            // Browser dapat menolak autoplay. Tombol tetap bisa menyalakan musik
            // melalui interaksi pengguna.
        }
        updateToggle();
    }

    music.addEventListener("loadedmetadata", () => {
        const savedPosition = Number(sessionStorage.getItem(positionKey) || 0);
        if (Number.isFinite(savedPosition) && savedPosition > 0 && Number.isFinite(music.duration)) {
            music.currentTime = savedPosition % music.duration;
        }

        if (isEnabled()) playMusic();
        else updateToggle();
    }, { once: true });

    music.addEventListener("play", updateToggle);
    music.addEventListener("pause", updateToggle);
    music.addEventListener("ended", updateToggle);
    music.addEventListener("error", updateToggle);

    toggle.addEventListener("click", () => {
        if (!music.paused && !music.ended) {
            sessionStorage.setItem(enabledKey, "off");
            sessionStorage.removeItem(positionKey);
            music.pause();
            music.currentTime = 0;
            updateToggle();
            return;
        }

        sessionStorage.setItem(enabledKey, "on");
        sessionStorage.removeItem(positionKey);
        if (music.readyState > 0) music.currentTime = 0;
        playMusic();
    });

    function savePosition() {
        if (isEnabled() && !music.paused && Number.isFinite(music.currentTime)) {
            sessionStorage.setItem(positionKey, String(music.currentTime));
        }
    }

    window.addEventListener("pagehide", savePosition);
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") savePosition();
    });

    updateToggle();
})();
