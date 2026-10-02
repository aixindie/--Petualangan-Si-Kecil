(() => {
  const bubble = document.getElementById("dudu-bubble");
  const duduText = document.getElementById("dudu-text");
  const feedback = document.getElementById("answer-feedback");
  const dialog = document.getElementById("result-dialog");
  const dialogArt = document.getElementById("dialog-art");
  const dialogAction = document.getElementById("dialog-action");
  const sparkleLayer = document.getElementById("answer-sparkles");
  const choices = [...document.querySelectorAll(".basket-choice")];
  let speechTimer;
  let currentUtterance;
  let completed = false;
  let dialogStep = 0;

  function hideBubble() {
    bubble.classList.remove("is-visible");
    bubble.setAttribute("aria-hidden", "true");
  }

  function stopSpeech() {
    window.clearTimeout(speechTimer);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    currentUtterance = null;
  }

  function speakAsDudu(message, fallbackMs = 6200) {
    stopSpeech();
    duduText.textContent = message;
    bubble.classList.add("is-visible");
    bubble.setAttribute("aria-hidden", "false");
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      speechTimer = window.setTimeout(hideBubble, fallbackMs);
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
    speechTimer = window.setTimeout(finish, fallbackMs);
  }

  function showSparkles() {
    sparkleLayer.replaceChildren();
    ["16%", "31%", "52%", "72%", "87%"].forEach((left, index) => {
      const star = document.createElement("span");
      star.className = "answer-sparkle";
      star.textContent = index % 2 ? "✦" : "★";
      star.style.left = left;
      star.style.top = `${30 + (index % 3) * 15}%`;
      star.style.animationDelay = `${index * 65}ms`;
      sparkleLayer.append(star);
    });
    window.setTimeout(() => sparkleLayer.replaceChildren(), 1100);
  }

  function showDialog(imagePath, alt, step) {
    dialogStep = step;
    dialogArt.src = imagePath;
    dialogArt.alt = alt;
    dialogAction.setAttribute("aria-label", step === 1 ? "Lanjut ke pratinjau level 3" : "Mulai level 3");
    if (!dialog.open) dialog.showModal();
  }

  function choose(count, button) {
    if (completed) return;
    stopSpeech();
    hideBubble();
    if (count === 5) {
      completed = true;
      choices.forEach((choice) => {
        choice.classList.add("is-locked");
        choice.disabled = true;
      });
      button.classList.add("is-correct");
      feedback.className = "answer-feedback is-correct";
      feedback.textContent = "Hebat! 5 batu lebih banyak daripada 3 batu! ✨";
      showSparkles();
      window.setTimeout(() => showDialog("asset/icon/lanjut-lv2.png", "Kamu berhasil! Tekan lanjut.", 1), 750);
      return;
    }
    button.classList.add("is-wrong");
    feedback.className = "answer-feedback is-wrong";
    feedback.textContent = "Belum tepat. Coba hitung batunya lagi!";
    speakAsDudu("Hmm, coba lihat lagi. Mana yang batunya lebih banyak?", 4200);
    showDialog("asset/icon/coba-lagi.png", "Coba lagi!", 0);
    window.setTimeout(() => {
      if (dialog.open && dialogStep === 0) dialog.close();
    }, 1000);
    window.setTimeout(() => button.classList.remove("is-wrong"), 950);
  }

  choices.forEach((button) => button.addEventListener("click", () => choose(Number(button.dataset.count), button)));
  dialogAction.addEventListener("click", () => {
    if (dialogStep === 1) {
      showDialog("asset/misi2/lv3-m2.png", "Level 3, siap menjelajah! Tekan mulai.", 2);
      return;
    }
    window.location.href = "m2-lv3.html";
  });
  window.addEventListener("pagehide", stopSpeech, { once: true });
  speakAsDudu("Dudu punya dua keranjang batu. Coba pilih, keranjang mana yang batunya lebih banyak?", 6500);
})();
