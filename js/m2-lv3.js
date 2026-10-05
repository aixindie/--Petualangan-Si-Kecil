(() => {
  const bubble = document.getElementById("dudu-bubble");
  const duduText = document.getElementById("dudu-text");
  const feedback = document.getElementById("answer-feedback");
  const dialog = document.getElementById("result-dialog");
  const dialogArt = document.getElementById("dialog-art");
  const dialogAction = document.getElementById("dialog-action");
  const sparkleLayer = document.getElementById("answer-sparkles");
  const choices = [...document.querySelectorAll(".number-choice")];
  let speechTimer;
  let currentUtterance;
  let answeredCorrectly = false;
  let dialogIsRetry = false;

  function hideBubble() {
    bubble.classList.remove("is-visible");
    bubble.setAttribute("aria-hidden", "true");
  }

  function stopSpeech() {
    window.levelAudio?.stop();
    window.clearTimeout(speechTimer);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    currentUtterance = null;
  }

  function speakAsDudu(message, timeout = 6000) {
    duduText.textContent = message;
    bubble.classList.add("is-visible");
    bubble.setAttribute("aria-hidden", "false");
    if (window.levelAudio) return window.levelAudio.speak(message, timeout, null, hideBubble);
    stopSpeech();
    duduText.textContent = message;
    bubble.classList.add("is-visible");
    bubble.setAttribute("aria-hidden", "false");
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      speechTimer = window.setTimeout(hideBubble, timeout);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "id-ID";
    utterance.rate = .92;
    utterance.pitch = 1.05;
    currentUtterance = utterance;
    const finish = () => {
      if (currentUtterance !== utterance) return;
      currentUtterance = null;
      window.clearTimeout(speechTimer);
      hideBubble();
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.speak(utterance);
    speechTimer = window.setTimeout(finish, timeout);
  }

  function showSparkles() {
    sparkleLayer.replaceChildren();
    ["18%", "34%", "50%", "66%", "82%"].forEach((left, index) => {
      const star = document.createElement("span");
      star.className = "answer-sparkle";
      star.textContent = index % 2 ? "✦" : "★";
      star.style.left = left;
      star.style.top = `${27 + (index % 3) * 16}%`;
      star.style.animationDelay = `${index * 65}ms`;
      sparkleLayer.append(star);
    });
    window.setTimeout(() => sparkleLayer.replaceChildren(), 1100);
  }

  function showDialog(isRetry) {
    dialogIsRetry = isRetry;
    if (!isRetry) window.levelAudio?.playEffect("success");
    window.setDialogArtwork(
      dialogArt,
      isRetry ? "asset/icon/coba-lagi.png" : "asset/icon/lanjut-lv3.png",
      isRetry ? "Coba lagi!" : "Keren! Tiga bintang. Tekan lanjut."
    );
    dialogAction.setAttribute("aria-label", isRetry ? "Tutup pesan coba lagi" : "Kembali ke menu utama");
    if (!dialog.open) dialog.showModal();
  }

  function chooseAnswer(answer, button) {
    if (answeredCorrectly) return;
    stopSpeech();
    hideBubble();
    if (answer === 10) {
      answeredCorrectly = true;
      choices.forEach((choice) => {
        choice.disabled = true;
        if (choice !== button) choice.classList.add("is-locked");
      });
      button.classList.add("is-correct");
      feedback.className = "answer-feedback attendance-feedback is-correct";
      feedback.textContent = "Hebat! Ada 10 teman yang sudah hadir! ✨";
      showSparkles();
      speakAsDudu("Hebat! Ada 10 teman yang sudah hadir di sekolah hari ini!", 5000);
      window.setTimeout(() => showDialog(false), 650);
      return;
    }
    button.classList.add("is-wrong");
    feedback.className = "answer-feedback attendance-feedback is-wrong";
    feedback.textContent = "Belum tepat. Yuk, hitung semua wajahnya lagi!";
    speakAsDudu("Hmm, coba hitung lagi wajah teman-teman di papan, ya!", 4200);
    showDialog(true);
    window.setTimeout(() => {
      if (dialog.open && dialogIsRetry) dialog.close();
    }, 1000);
    window.setTimeout(() => button.classList.remove("is-wrong"), 950);
  }

  choices.forEach((button) => button.addEventListener("click", () => chooseAnswer(Number(button.dataset.answer), button)));
  dialogAction.addEventListener("click", () => {
    if (dialogIsRetry) {
      dialog.close();
      return;
    }
    window.location.href = "menu.html";
  });
  window.addEventListener("pagehide", stopSpeech, { once: true });
  speakAsDudu("Lihat! Ini papan kehadiran teman-teman KB Al Kautsar. Coba hitung, ada berapa wajah temanmu yang sudah hadir hari ini?", 7000);
})();
