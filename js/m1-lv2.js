const shapeChoices = [...document.querySelectorAll(".fruit-option")];
const dudu = document.getElementById("dudu");
const duduBubble = document.getElementById("duduBubble");
const duduText = document.getElementById("duduText");
const feedback = document.getElementById("feedback");
const starEffect = document.getElementById("starEffect");
const feedbackDialog = document.getElementById("feedbackDialog");
const dialogArt = document.getElementById("dialogArt");
const dialogAction = document.getElementById("dialogAction");
const homeButton = document.getElementById("homeButton");

const welcomeMessage = "Wah, Dudu menemukan jam dinding! Bentuk jam ini apa, ya? Yuk pilih bentuk yang sama!";
const hintMessage = "Belum cocok, teman-teman. Coba lihat bentuk jamnya: bulat seperti lingkaran!";
let dialogMode = "";
let retryTimer;
let speechTimer;
let currentUtterance = null;

window.addEventListener("load", () => speakAsDudu(welcomeMessage, 10000), { once: true });
homeButton.addEventListener("click", () => { window.location.href = "misi1.html"; });

shapeChoices.forEach((choice) => {
    choice.addEventListener("click", () => {
        if (choice.disabled) return;
        if (choice.dataset.answer === "lingkaran") handleCorrectAnswer(choice);
        else handleWrongAnswer(choice);
    });
});

function handleWrongAnswer(choice) {
    choice.classList.remove("is-wrong");
    void choice.offsetWidth;
    choice.classList.add("is-wrong");
    speakAsDudu(hintMessage, 8000);
    feedback.textContent = "Belum cocok, coba lagi!";
    feedback.classList.add("show");
    showArtwork("asset/icon/coba-lagi.png", "Coba lagi!", "retry");
    window.clearTimeout(retryTimer);
    retryTimer = window.setTimeout(() => {
        if (dialogMode === "retry" && feedbackDialog.open) feedbackDialog.close();
    }, 850);
}

function handleCorrectAnswer(choice) {
    choice.classList.add("is-correct");
    shapeChoices.forEach((option) => { option.disabled = true; });
    stopDuduSpeech();
    hideDuduBubble();
    feedback.textContent = "Hebat! Jam dinding berbentuk lingkaran!";
    feedback.classList.add("show");
    dudu.classList.remove("is-celebrating");
    starEffect.classList.remove("show");
    void dudu.offsetWidth;
    dudu.classList.add("is-celebrating");
    starEffect.classList.add("show");
    showArtwork("asset/icon/lanjut-lv2.png", "Keren! Tekan Lanjut untuk membuka level berikutnya.", "reward");
    dialogAction.setAttribute("aria-label", "Lanjut ke pratinjau level 3");
    dialogAction.focus();
}

function showArtwork(source, description, mode) {
    window.clearTimeout(retryTimer);
    dialogMode = mode;
    window.setDialogArtwork(dialogArt, source, description);
    if (mode === "reward") window.levelAudio?.playEffect("success");
    if (!feedbackDialog.open) feedbackDialog.showModal();
}

dialogAction.addEventListener("click", () => {
    if (dialogMode === "reward") {
        dialogMode = "next-preview";
        window.setDialogArtwork(dialogArt, "asset/misi1/lv3-m1.png", "Pratinjau level 3: Aku Menjelajah");
        dialogAction.setAttribute("aria-label", "Mulai level 3");
        dialogAction.focus();
    } else if (dialogMode === "next-preview") {
        window.location.href = "m1-lv3.html";
    }
});

feedbackDialog.addEventListener("cancel", (event) => {
    if (dialogMode !== "retry") event.preventDefault();
});

feedbackDialog.addEventListener("close", () => {
    if (dialogMode === "retry") {
        feedback.classList.remove("show");
        shapeChoices.forEach((choice) => choice.classList.remove("is-wrong"));
    }
    dialogMode = "";
});

function speakAsDudu(message, fallbackMs) {
    duduText.textContent = message;
    duduBubble.classList.add("is-visible");
    duduBubble.setAttribute("aria-hidden", "false");
    if (window.levelAudio) return window.levelAudio.speak(message, fallbackMs, null, hideDuduBubble);
    stopDuduSpeech();
    duduText.textContent = message;
    duduBubble.classList.add("is-visible");
    duduBubble.setAttribute("aria-hidden", "false");

    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
        speechTimer = window.setTimeout(hideDuduBubble, fallbackMs);
        return;
    }

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "id-ID";
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    currentUtterance = utterance;

    const finishSpeaking = () => {
        if (currentUtterance !== utterance) return;
        currentUtterance = null;
        window.clearTimeout(speechTimer);
        hideDuduBubble();
    };

    utterance.onend = finishSpeaking;
    utterance.onerror = finishSpeaking;
    window.speechSynthesis.speak(utterance);
    speechTimer = window.setTimeout(finishSpeaking, fallbackMs);
}

function stopDuduSpeech() {
    window.levelAudio?.stop();
    window.clearTimeout(speechTimer);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    currentUtterance = null;
}

function hideDuduBubble() {
    duduBubble.classList.remove("is-visible");
    duduBubble.setAttribute("aria-hidden", "true");
}
