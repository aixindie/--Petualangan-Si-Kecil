(() => {
  const enabledKey = "petualangan-level-sound-enabled";
  const levelMatch = window.location.pathname.match(/(m[1-3]-lv[1-3])\.html$/i);
  const level = levelMatch?.[1].toLowerCase() || "";
  let enabled = sessionStorage.getItem(enabledKey) !== "off";
  let hasStartedGuide = false;
  let guideNeedsRetry = false;
  let activeAudio = null;
  let activeUtterance = null;
  let finishTimer = 0;
  let finishCallback = null;
  let hideBubble = null;

  const soundButton = document.createElement("button");
  soundButton.type = "button";
  soundButton.className = "level-sound-toggle";
  soundButton.setAttribute("aria-pressed", String(enabled));
  soundButton.title = enabled ? "Matikan efek suara" : "Nyalakan efek suara";
  soundButton.setAttribute("aria-label", soundButton.title);
  const soundIcon = document.createElement("img");
  soundIcon.alt = "";
  soundIcon.setAttribute("aria-hidden", "true");
  soundButton.append(soundIcon);
  document.body.append(soundButton);

  function updateButton() {
    soundIcon.src = enabled ? "asset/icon/sound.png" : "asset/icon/nosound.png";
    soundButton.title = enabled ? (level ? "Matikan suara Dudu dan efek" : "Matikan efek suara")
      : (level ? "Nyalakan suara Dudu dan efek" : "Nyalakan efek suara");
    soundButton.setAttribute("aria-label", soundButton.title);
    soundButton.setAttribute("aria-pressed", String(enabled));
  }

  function stop() {
    window.clearTimeout(finishTimer);
    if (activeUtterance && "speechSynthesis" in window) window.speechSynthesis.cancel();
    activeUtterance = null;
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio = null;
    }
    finishCallback = null;
  }

  function playFile(path, onEnded, fallbackMs = 1200) {
    if (!enabled) {
      if (onEnded) finishTimer = window.setTimeout(onEnded, fallbackMs);
      return null;
    }
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio = null;
    }
    const audio = new Audio(path);
    activeAudio = audio;
    audio.preload = "auto";
    audio.addEventListener("ended", () => {
      if (activeAudio !== audio) return;
      activeAudio = null;
      onEnded?.();
    }, { once: true });
    audio.addEventListener("error", () => {
      if (activeAudio !== audio) return;
      activeAudio = null;
      if (level && path.endsWith(`${level}.m4a`)) guideNeedsRetry = true;
      if (onEnded) finishTimer = window.setTimeout(onEnded, fallbackMs);
    }, { once: true });
    const result = audio.play();
    if (result && typeof result.catch === "function") {
      result.catch(() => {
        if (activeAudio !== audio) return;
        activeAudio = null;
        if (level && path.endsWith(`${level}.m4a`)) {
          guideNeedsRetry = true;
        }
        if (onEnded) finishTimer = window.setTimeout(onEnded, fallbackMs);
      });
    }
    return audio;
  }

  function playEffect(type) {
    if (!enabled) return;
    if (activeUtterance && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      activeUtterance = null;
    }
    window.clearTimeout(finishTimer);
    const file = type === "retry" ? "coba%20lagi.m4a"
      : type === "success" ? (level === "m1-lv3" ? "feedback%20sukses-m1-lv3.m4a" : "keren.m4a")
        : "klik.m4a";
    playFile(`asset/audio/${file}`);
  }

  function speak(message, fallbackMs = 6000, onFinished, hide) {
    stop();
    hideBubble = hide;
    finishCallback = onFinished;
    const firstCall = !hasStartedGuide;
    hasStartedGuide = true;
    const complete = () => {
      if (hideBubble) hideBubble();
      const callback = finishCallback;
      finishCallback = null;
      callback?.();
    };

    if (level && firstCall) {
      guideNeedsRetry = false;
      playFile(`asset/audio/${level}.m4a`, complete, fallbackMs);
      return;
    }

    const lower = message.toLowerCase();
    if (/coba lagi|belum tepat|belum cocok|belum pas|hmm, coba/i.test(lower)) playEffect("retry");
    if (onFinished) {
      complete();
      return;
    }
    finishTimer = window.setTimeout(complete, fallbackMs);
  }

  function speakText(message, fallbackMs = 6000, onFinished) {
    stop();
    const complete = () => {
      if (activeUtterance !== utterance) return;
      activeUtterance = null;
      window.clearTimeout(finishTimer);
      onFinished?.();
    };
    if (!enabled || !("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      finishTimer = window.setTimeout(() => onFinished?.(), fallbackMs);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "id-ID";
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    activeUtterance = utterance;
    utterance.onend = complete;
    utterance.onerror = complete;
    window.speechSynthesis.speak(utterance);
    finishTimer = window.setTimeout(complete, fallbackMs);
  }

  soundButton.addEventListener("click", () => {
    enabled = !enabled;
    sessionStorage.setItem(enabledKey, enabled ? "on" : "off");
    if (!enabled) stop();
    else if (level && guideNeedsRetry) {
      guideNeedsRetry = false;
      playFile(`asset/audio/${level}.m4a`);
    }
    updateButton();
  });

  document.addEventListener("click", (event) => {
    const control = event.target.closest("button, a, [role='button'], .fruit-option, .table-hotspot, .tree-apple, .answer-card, .wash-card");
    if (!control || control === soundButton || control.classList.contains("music-toggle")) return;
    playEffect("click");
  }, true);

  window.addEventListener("pagehide", stop, { once: true });
  updateButton();
  window.levelAudio = { speak, speakText, stop, playEffect };
})();
