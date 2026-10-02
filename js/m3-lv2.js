(() => {
  const bubble = document.getElementById("dudu-bubble");
  const duduText = document.getElementById("dudu-text");
  const instruction = document.getElementById("path-instruction");
  const slots = [...document.querySelectorAll(".route-piece-slot")];
  const feedback = document.getElementById("answer-feedback");
  const dialog = document.getElementById("result-dialog");
  const dialogArt = document.getElementById("dialog-art");
  const dialogAction = document.getElementById("dialog-action");
  const sparkleLayer = document.getElementById("answer-sparkles");
  const ghost = document.getElementById("drag-ghost");
  const choices = [...document.querySelectorAll(".road-choice")];
  const route = new Map();
  const answer = ["horizontal", "horizontal", "horizontal"];
  let selected = null;
  let completed = false;
  let dialogStep = 0;
  let activePointer = null;
  let suppressClick = false;
  let speechTimer;
  let currentUtterance;

  const roads = {
    horizontal: { src: "asset/misi3/jalan-h.png", label: "Mendatar" },
    vertical: { src: "asset/misi3/jalan-v.png", label: "Tegak" }
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

  function selectRoad(road) {
    if (completed) return;
    selected = selected === road ? null : road;
    choices.forEach((choice) => choice.classList.toggle("is-selected", choice.dataset.road === selected));
    slots.forEach((slot) => slot.classList.toggle("is-active", Boolean(selected)));
    instruction.textContent = selected
      ? `Potongan ${roads[selected].label.toLowerCase()} dipilih. Pilih kotak nomor 1, 2, atau 3.`
      : "Isi ketiga kotak dengan jalan mendatar.";
  }

  function showSparkles() {
    sparkleLayer.replaceChildren();
    ["18%", "34%", "50%", "66%", "82%"].forEach((left, index) => {
      const star = document.createElement("span");
      star.className = "answer-sparkle";
      star.textContent = index % 2 ? "✦" : "★";
      star.style.left = left;
      star.style.top = `${26 + (index % 3) * 16}%`;
      star.style.animationDelay = `${index * 65}ms`;
      sparkleLayer.append(star);
    });
    window.setTimeout(() => sparkleLayer.replaceChildren(), 1100);
  }

  function showDialog(imagePath, alt, step) {
    dialogStep = step;
    dialogArt.src = imagePath;
    dialogArt.alt = alt;
    dialogAction.setAttribute("aria-label", step === 0 ? "Tutup pesan coba lagi" : step === 1 ? "Lanjut ke pratinjau level 3" : "Mulai level 3");
    if (!dialog.open) dialog.showModal();
  }

  function renderSlots() {
    slots.forEach((slot, index) => {
      const road = route.get(index + 1);
      const image = slot.querySelector(".placed-road");
      const label = slot.querySelector(".placed-label");
      const hint = slot.querySelector(".slot-hint");
      if (!road) {
        image.removeAttribute("src");
        image.alt = "";
        image.hidden = true;
        label.textContent = "";
        label.hidden = true;
        hint.hidden = false;
        slot.classList.remove("path-slot-filled");
        return;
      }
      image.src = roads[road].src;
      image.alt = `Jalan ${roads[road].label.toLowerCase()}`;
      image.hidden = false;
      label.textContent = roads[road].label;
      label.hidden = false;
      hint.hidden = true;
      slot.classList.add("path-slot-filled");
    });
  }

  function resetRoute() {
    route.clear();
    selected = null;
    choices.forEach((choice) => choice.classList.remove("is-selected", "is-used"));
    slots.forEach((slot) => {
      slot.disabled = false;
      slot.classList.remove("is-active", "is-over");
    });
    renderSlots();
  }

  function placeRoad(road, slot) {
    if (!road || !slot || completed) return;
    const number = Number(slot.dataset.slot);
    route.set(number, road);
    selected = null;
    choices.forEach((choice) => choice.classList.remove("is-selected", "is-used"));
    slots.forEach((item) => item.classList.remove("is-active", "is-over"));
    instruction.textContent = "Isi ketiga kotak dengan jalan mendatar.";
    feedback.textContent = "";
    renderSlots();

    if (route.size < slots.length) return;
    const isCorrect = answer.every((expected, index) => route.get(index + 1) === expected);
    if (isCorrect) {
      completed = true;
      choices.forEach((choice) => { choice.disabled = true; choice.classList.add("is-used"); });
      slots.forEach((item) => { item.disabled = true; });
      feedback.className = "answer-feedback path-feedback is-correct";
      feedback.textContent = "Benar! Ketiga jalannya mendatar. Dudu berhasil sampai! ✨";
      instruction.textContent = "Dudu berhasil menemukan kucingnya!";
      showSparkles();
      speakAsDudu("Yeay! Dudu berhasil menemukan kucingnya. Pintar sekali!", 4500);
      window.setTimeout(() => showDialog("asset/icon/lanjut-lv2.png", "Keren! Dudu menemukan kucingnya. Tekan lanjut.", 1), 650);
      return;
    }

    feedback.className = "answer-feedback path-feedback is-wrong";
    feedback.textContent = "Belum cocok. Coba perhatikan urutan ketiga jalannya, ya.";
    speakAsDudu("Hmm, coba lagi, ya. Ketiga potongan jalannya harus mendatar.", 4200);
    showDialog("asset/icon/coba-lagi.png", "Coba lagi!", 0);
    window.setTimeout(() => {
      if (dialog.open && dialogStep === 0) dialog.close();
      if (!completed) {
        resetRoute();
        feedback.textContent = "";
        instruction.textContent = "Isi ketiga kotak dengan jalan mendatar.";
      }
    }, 1050);
  }

  function showGhost(choice, x, y) {
    if (!ghost.firstElementChild) ghost.append(choice.cloneNode(true));
    ghost.firstElementChild.classList.remove("is-selected", "is-used");
    ghost.classList.add("is-visible");
    ghost.style.left = `${x}px`;
    ghost.style.top = `${y}px`;
  }

  function hideGhost() {
    ghost.classList.remove("is-visible");
    ghost.replaceChildren();
  }

  choices.forEach((choice) => {
    choice.addEventListener("click", (event) => {
      if (suppressClick) { event.preventDefault(); return; }
      selectRoad(choice.dataset.road);
    });
    choice.addEventListener("pointerdown", (event) => {
      if (completed || event.button !== 0) return;
      activePointer = { choice, id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false };
      choice.setPointerCapture(event.pointerId);
    });
    choice.addEventListener("pointermove", (event) => {
      if (!activePointer || activePointer.id !== event.pointerId) return;
      const distance = Math.hypot(event.clientX - activePointer.x, event.clientY - activePointer.y);
      if (!activePointer.dragging && distance > 7) {
        activePointer.dragging = true;
        suppressClick = true;
        selected = choice.dataset.road;
        choices.forEach((item) => item.classList.toggle("is-selected", item === choice));
      }
      if (!activePointer.dragging) return;
      event.preventDefault();
      showGhost(choice, event.clientX, event.clientY);
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".route-piece-slot");
      slots.forEach((slot) => slot.classList.toggle("is-over", slot === target));
    });
    choice.addEventListener("pointerup", (event) => {
      if (!activePointer || activePointer.id !== event.pointerId) return;
      if (activePointer.dragging) {
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".route-piece-slot");
        if (target) placeRoad(choice.dataset.road, target);
        else { selected = null; choices.forEach((item) => item.classList.remove("is-selected")); }
        hideGhost();
        slots.forEach((slot) => slot.classList.remove("is-over"));
        window.setTimeout(() => { suppressClick = false; }, 0);
      }
      activePointer = null;
    });
    choice.addEventListener("pointercancel", () => {
      activePointer = null;
      hideGhost();
      slots.forEach((slot) => slot.classList.remove("is-over"));
    });
  });

  slots.forEach((slot) => {
    slot.addEventListener("click", () => {
      if (selected) placeRoad(selected, slot);
      else instruction.textContent = `Pilih potongan jalan, lalu taruh di kotak nomor ${slot.dataset.slot}.`;
    });
  });

  dialogAction.addEventListener("click", () => {
    if (dialogStep === 0) { dialog.close(); return; }
    if (dialogStep === 1) {
      showDialog("asset/misi3/lv3-m3.png", "Level 3 — siap menjelajah! Tekan mulai.", 2);
      return;
    }
    window.location.href = "m3-lv3.html";
  });

  window.addEventListener("pagehide", stopSpeech, { once: true });
  speakAsDudu("Bantu Dudu berjalan mencari kucingnya sampai ketemu! Susun tiga potongan jalan sesuai urutannya, ya!", 5800);
})();
