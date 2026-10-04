(() => {
  const bubble = document.getElementById("dudu-bubble");
  const duduText = document.getElementById("dudu-text");
  const instruction = document.getElementById("wash-instruction");
  const feedback = document.getElementById("answer-feedback");
  const dialog = document.getElementById("result-dialog");
  const dialogArt = document.getElementById("dialog-art");
  const dialogAction = document.getElementById("dialog-action");
  const sparkleLayer = document.getElementById("answer-sparkles");
  const ghost = document.getElementById("drag-ghost");
  const cards = [...document.querySelectorAll(".step-card")];
  const slots = [...document.querySelectorAll(".sequence-slot")];
  const state = { placed: new Map(), selected: null, completed: false, dialogStep: 0, activePointer: null, suppressClick: false };
  let speechTimer;
  let currentUtterance;

  const stepInfo = {
    soap: { src: "asset/misi3/sabun.png", label: "Pakai sabun" },
    rinse: { src: "asset/misi3/bilas.png", label: "Bilas tangan" }
  };

  function hideBubble() {
    bubble.classList.remove("is-visible");
    bubble.setAttribute("aria-hidden", "true");
  }

  function stopSpeech() {
    window.clearTimeout(speechTimer);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    currentUtterance = null;
  }

  function speakAsDudu(message, timeout = 6000) {
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

  function setSelected(step) {
    state.selected = state.selected === step ? null : step;
    cards.forEach((card) => card.classList.toggle("is-selected", card.dataset.step === state.selected));
    instruction.textContent = state.selected
      ? `Pilih kotak untuk “${stepInfo[state.selected].label}”. Urutkan sabun dahulu, lalu bilas.`
      : "Tarik gambar ke kotak bernomor sesuai urutan mencuci tangan.";
  }

  function renderSlots() {
    slots.forEach((slot) => {
      const step = state.placed.get(slot.dataset.slot);
      const image = slot.querySelector(".slot-image");
      const caption = slot.querySelector(".slot-caption");
      const placeholder = slot.querySelector(".slot-placeholder");
      const card = cards.find((item) => item.dataset.step === step);
      slot.classList.toggle("is-filled", Boolean(step));
      placeholder.hidden = Boolean(step);
      image.hidden = !step;
      caption.hidden = !step;
      if (step) {
        image.src = stepInfo[step].src;
        image.alt = stepInfo[step].label;
        caption.textContent = stepInfo[step].label;
      }
      if (card) card.classList.toggle("is-used", [...state.placed.values()].includes(card.dataset.step));
    });
    cards.forEach((card) => card.classList.toggle("is-used", [...state.placed.values()].includes(card.dataset.step)));
  }

  function showSparkles() {
    sparkleLayer.replaceChildren();
    ["17%", "33%", "50%", "67%", "83%"].forEach((left, index) => {
      const star = document.createElement("span");
      star.className = "answer-sparkle";
      star.textContent = index % 2 ? "✦" : "★";
      star.style.left = left;
      star.style.top = `${26 + (index % 3) * 17}%`;
      star.style.animationDelay = `${index * 65}ms`;
      sparkleLayer.append(star);
    });
    window.setTimeout(() => sparkleLayer.replaceChildren(), 1100);
  }

  function showDialog(imagePath, alt, step) {
    state.dialogStep = step;
    window.setDialogArtwork(dialogArt, imagePath, alt);
    dialogAction.setAttribute("aria-label", step === 0 ? "Tutup pesan coba lagi" : step === 1 ? "Lanjut ke level 2" : "Mulai level 2");
    if (!dialog.open) dialog.showModal();
  }

  function resetSequence() {
    state.placed.clear();
    state.selected = null;
    cards.forEach((card) => card.classList.remove("is-selected", "is-used"));
    renderSlots();
    instruction.textContent = "Coba lagi, ya! Tarik gambar ke kotak bernomor.";
  }

  function completeSequence() {
    state.completed = true;
    cards.forEach((card) => { card.disabled = true; card.classList.add("is-complete"); });
    slots.forEach((slot) => { slot.disabled = true; slot.classList.add("is-filled"); });
    feedback.className = "answer-feedback wash-feedback is-correct";
    feedback.textContent = "Hebat! Sabun dahulu, lalu bilas tangan! ✨";
    instruction.textContent = "Urutannya sudah benar! Kamu hebat!";
    showSparkles();
    speakAsDudu("Hebat! Kita pakai sabun dahulu, lalu membilas tangan sampai bersih!", 5000);
    window.setTimeout(() => showDialog("asset/icon/lanjut-lv1.png", "Keren! Urutanmu benar. Tekan lanjut.", 1), 700);
  }

  function checkSequence() {
    if (state.placed.size !== 2) return;
    const correct = state.placed.get("1") === "soap" && state.placed.get("2") === "rinse";
    if (correct) {
      completeSequence();
      return;
    }
    feedback.className = "answer-feedback wash-feedback is-wrong";
    feedback.textContent = "Belum tepat. Pakai sabun dulu, setelah itu bilas.";
    speakAsDudu("Belum tepat. Kita memakai sabun dahulu, baru membilas tangan.", 4200);
    showDialog("asset/icon/coba-lagi.png", "Coba lagi!", 0);
    window.setTimeout(() => {
      if (dialog.open && state.dialogStep === 0) dialog.close();
      if (!state.completed) {
        state.placed.clear();
        renderSlots();
        feedback.textContent = "";
        instruction.textContent = "Coba lagi, ya! Tarik gambar ke kotak bernomor.";
      }
    }, 1050);
  }

  function placeStep(step, slot) {
    if (!step || !slot || state.completed) return;
    const slotNumber = slot.dataset.slot;
    for (const [number, placedStep] of state.placed.entries()) {
      if (placedStep === step && number !== slotNumber) state.placed.delete(number);
    }
    state.placed.set(slotNumber, step);
    slots.forEach((target) => target.classList.remove("is-active", "is-over"));
    state.selected = null;
    cards.forEach((card) => card.classList.remove("is-selected"));
    renderSlots();
    feedback.textContent = "";
    instruction.textContent = "Bagus! Susun gambar yang satunya juga.";
    checkSequence();
  }

  function showGhost(card, x, y) {
    if (!ghost.firstElementChild) ghost.append(card.cloneNode(true));
    ghost.firstElementChild.classList.remove("is-selected", "is-used");
    ghost.firstElementChild.querySelector(".drag-cue").textContent = "Lepaskan di kotak";
    ghost.classList.add("is-visible");
    ghost.style.left = `${x}px`;
    ghost.style.top = `${y}px`;
  }

  function hideGhost() {
    ghost.classList.remove("is-visible");
    ghost.replaceChildren();
  }

  cards.forEach((card) => {
    card.addEventListener("click", (event) => {
      if (state.suppressClick) { event.preventDefault(); return; }
      if (!state.completed) setSelected(card.dataset.step);
    });
    card.addEventListener("pointerdown", (event) => {
      if (state.completed || event.button !== 0) return;
      state.activePointer = { card, id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false };
      card.setPointerCapture(event.pointerId);
    });
    card.addEventListener("pointermove", (event) => {
      const pointer = state.activePointer;
      if (!pointer || pointer.id !== event.pointerId) return;
      const distance = Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y);
      if (!pointer.dragging && distance > 7) {
        pointer.dragging = true;
        state.suppressClick = true;
        card.classList.add("is-dragging");
        setSelected(card.dataset.step);
      }
      if (pointer.dragging) {
        event.preventDefault();
        showGhost(card, event.clientX, event.clientY);
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".sequence-slot");
        slots.forEach((slot) => slot.classList.toggle("is-over", slot === target));
      }
    });
    card.addEventListener("pointerup", (event) => {
      const pointer = state.activePointer;
      if (!pointer || pointer.id !== event.pointerId) return;
      if (pointer.dragging) {
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".sequence-slot");
        if (target) placeStep(card.dataset.step, target);
        else { state.selected = null; cards.forEach((item) => item.classList.remove("is-selected")); }
        hideGhost();
        slots.forEach((slot) => slot.classList.remove("is-over"));
        card.classList.remove("is-dragging");
        window.setTimeout(() => { state.suppressClick = false; }, 0);
      }
      state.activePointer = null;
    });
    card.addEventListener("pointercancel", () => {
      state.activePointer = null;
      hideGhost();
      slots.forEach((slot) => slot.classList.remove("is-over"));
    });
  });

  slots.forEach((slot) => {
    slot.addEventListener("click", () => {
      if (state.selected) placeStep(state.selected, slot);
      else {
        slots.forEach((item) => item.classList.toggle("is-active", item === slot));
        instruction.textContent = "Pilih gambar langkah, lalu ketuk kotak bernomor.";
      }
    });
  });

  dialogAction.addEventListener("click", () => {
    if (state.dialogStep === 0) { dialog.close(); return; }
    if (state.dialogStep === 1) {
      showDialog("asset/misi3/lv2-m3.png", "Level 2 — siap belajar langkah berikutnya. Tekan mulai.", 2);
      return;
    }
    window.location.href = "m3-lv2.html";
  });

  window.addEventListener("pagehide", stopSpeech, { once: true });
  speakAsDudu("Sebelum makan, kita harus cuci tangan. Yuk, bantu Dudu mengurutkan langkahnya!", 5500);
})();
