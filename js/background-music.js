(() => {
    const enabledKey = "petualangan-bgm-enabled";
    const positionKey = "petualangan-bgm-position";
    const appleMasterKey = "petualangan-apple-audio-enabled";
    const isAppleTouch = /iPhone|iPad|iPod/i.test(navigator.userAgent)
        || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isEnabled = () => isAppleTouch
        ? sessionStorage.getItem(appleMasterKey) === "on"
        : sessionStorage.getItem(enabledKey) !== "off";

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
        const active = isAppleTouch ? isEnabled() : playing;
        const onLabel = isAppleTouch ? "Matikan musik dan suara Dudu" : "Matikan musik latar";
        const offLabel = isAppleTouch ? "Nyalakan musik dan suara Dudu" : "Nyalakan musik latar";
        icon.src = active ? "asset/icon/music.png" : "asset/icon/nomusic.png";
        toggle.setAttribute("aria-label", active ? onLabel : offLabel);
        toggle.setAttribute("aria-pressed", String(active));
        toggle.title = active ? onLabel : offLabel;
    }

    function setAppleMaster(enabled) {
        sessionStorage.setItem(appleMasterKey, enabled ? "on" : "off");
        sessionStorage.setItem("petualangan-level-sound-enabled", enabled ? "on" : "off");
        document.dispatchEvent(new CustomEvent("petualangan-audio-master-change", { detail: { enabled } }));
    }

    async function playMusic() {
        try {
            await music.play();
        } catch {
            // Browser dapat menolak autoplay. Tombol tetap bisa menyalakan musik
            // melalui interaksi pengguna.
            if (isAppleTouch) setAppleMaster(false);
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

    document.addEventListener("petualangan-audio-master-change", (event) => {
        if (!isAppleTouch || event.detail?.enabled) return;
        sessionStorage.removeItem(positionKey);
        music.pause();
        if (music.readyState > 0) music.currentTime = 0;
        updateToggle();
    });

    toggle.addEventListener("click", () => {
        const shouldEnable = isAppleTouch ? !isEnabled() : music.paused || music.ended;
        if (!shouldEnable) {
            if (isAppleTouch) setAppleMaster(false);
            sessionStorage.setItem(enabledKey, "off");
            sessionStorage.removeItem(positionKey);
            music.pause();
            music.currentTime = 0;
            updateToggle();
            return;
        }

        if (isAppleTouch) setAppleMaster(true);
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
