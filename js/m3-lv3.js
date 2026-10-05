(() => {
  const svg = document.getElementById("trace-svg");
  const guide = document.getElementById("trace-guide");
  const progressPath = document.getElementById("trace-progress");
  const fill = document.getElementById("trace-progress-fill");
  const progressLabel = document.getElementById("trace-progress-label");
  const bubble = document.getElementById("trace-bubble");
  const message = document.getElementById("trace-message");
  const mascot = document.getElementById("trace-mascot");
  const dialog = document.getElementById("trace-dialog");
  const dialogAction = document.getElementById("trace-dialog-action");

  const totalLength = guide.getTotalLength();
  const startTolerance = 54;
  const traceTolerance = 38;
  let currentLength = 0;
  let tracingPointer = null;
  let previousPoint = null;
  let complete = false;
  let speechTimer;
  let activeUtterance;

  progressPath.style.strokeDasharray = `${totalLength} ${totalLength}`;
  progressPath.style.strokeDashoffset = totalLength;

  function svgPoint(event) {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  }

  function pointAt(length) {
    return guide.getPointAtLength(Math.max(0, Math.min(totalLength, length)));
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function nearestForwardPoint(point, movement) {
    const minLength = Math.max(0, currentLength - 12);
    const maxLength = Math.min(totalLength, currentLength + Math.max(22, movement * 1.8 + 8));
    let nearest = null;
    for (let length = minLength; length <= maxLength; length += 3) {
      const candidate = pointAt(length);
      const gap = distance(point, candidate);
      if (!nearest || gap < nearest.gap) nearest = { length, gap };
    }
    const endPoint = pointAt(maxLength);
    const endGap = distance(point, endPoint);
    if (!nearest || endGap < nearest.gap) nearest = { length: maxLength, gap: endGap };
    return nearest;
  }

  function updateProgress() {
    const ratio = Math.max(0, Math.min(1, currentLength / totalLength));
    fill.style.width = `${ratio * 100}%`;
    progressPath.style.strokeDashoffset = `${totalLength * (1 - ratio)}`;
    progressLabel.textContent = ratio === 0 ? "Mulai dari Dudu" : `${Math.round(ratio * 100)}% · Teruskan sampai rak!`;
  }

  function stopSpeech() {
    window.levelAudio?.stop();
    window.clearTimeout(speechTimer);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    activeUtterance = null;
  }

  function speakAsDudu(text, fallback = 6000) {
    message.textContent = text;
    bubble.classList.add("is-visible");
    bubble.setAttribute("aria-hidden", "false");
    if (window.levelAudio) return window.levelAudio.speak(text, fallback, null, hideBubble);
    stopSpeech();
    message.textContent = text;
    bubble.classList.add("is-visible");
    bubble.setAttribute("aria-hidden", "false");
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      speechTimer = window.setTimeout(hideBubble, fallback);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = .92;
    utterance.pitch = 1.05;
    activeUtterance = utterance;
    const finish = () => {
      if (activeUtterance !== utterance) return;
      activeUtterance = null;
      window.clearTimeout(speechTimer);
      hideBubble();
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.speak(utterance);
    speechTimer = window.setTimeout(finish, fallback);
  }

  function hideBubble() {
    bubble.classList.remove("is-visible");
    bubble.setAttribute("aria-hidden", "true");
  }

  function finishTrace() {
    if (complete) return;
    complete = true;
    tracingPointer = null;
    currentLength = totalLength;
    updateProgress();
    progressLabel.textContent = "Hebat! Jalannya selesai!";
    mascot.classList.add("is-celebrating");
    speakAsDudu("Yeay! Kamu berhasil menebalkan seluruh jalannya sampai ke rak. Keren sekali!", 5000);
    window.setTimeout(() => {
      window.levelAudio?.playEffect("success");
      dialog.showModal();
      dialogAction.focus();
    }, 650);
  }

  svg.addEventListener("pointerdown", (event) => {
    if (complete || (event.pointerType === "mouse" && event.button !== 0)) return;
    const point = svgPoint(event);
    const resumePoint = pointAt(currentLength);
    if (distance(point, resumePoint) > startTolerance) {
      progressLabel.textContent = currentLength === 0 ? "Sentuh titik awal di dekat Dudu" : "Lanjutkan dari ujung garis kuning";
      return;
    }
    event.preventDefault();
    tracingPointer = event.pointerId;
    previousPoint = point;
    svg.setPointerCapture(event.pointerId);
    svg.classList.add("is-tracing");
  });

  svg.addEventListener("pointermove", (event) => {
    if (tracingPointer !== event.pointerId || complete) return;
    event.preventDefault();
    const nextPoint = svgPoint(event);
    const moveLength = distance(previousPoint, nextPoint);
    const steps = Math.max(1, Math.ceil(moveLength / 9));
    for (let step = 1; step <= steps; step += 1) {
      const fraction = step / steps;
      const sample = {
        x: previousPoint.x + (nextPoint.x - previousPoint.x) * fraction,
        y: previousPoint.y + (nextPoint.y - previousPoint.y) * fraction
      };
      const nearest = nearestForwardPoint(sample, moveLength / steps);
      if (nearest.gap <= traceTolerance) currentLength = Math.max(currentLength, nearest.length);
    }
    previousPoint = nextPoint;
    updateProgress();
    if (currentLength >= totalLength - 7) finishTrace();
  });

  function stopTracing(event) {
    if (tracingPointer !== event.pointerId) return;
    tracingPointer = null;
    previousPoint = null;
    svg.classList.remove("is-tracing");
    if (!complete && currentLength > 0) {
      progressLabel.textContent = `${Math.round(currentLength / totalLength * 100)}% · Lanjutkan dari ujung garis kuning`;
    }
  }

  svg.addEventListener("pointerup", stopTracing);
  svg.addEventListener("pointercancel", stopTracing);

  dialogAction.addEventListener("click", () => {
    window.location.href = "menu.html";
  });

  dialog.addEventListener("cancel", (event) => event.preventDefault());
  window.addEventListener("pagehide", stopSpeech, { once: true });
  speakAsDudu("Yuk, tebalkan garis putus-putus dari Dudu sampai rak. Ikuti jalurnya pelan-pelan!", 7000);
})();
