const fruitChoices = [...document.querySelectorAll(".fruit-option")];
const dudu = document.getElementById("dudu");
const duduText = document.getElementById("duduText");
const duduBubble = document.getElementById("duduBubble");
const feedback = document.getElementById("feedback");
const starEffect = document.getElementById("starEffect");
const feedbackDialog = document.getElementById("feedbackDialog");
const dialogArt = document.getElementById("dialogArt");
const dialogAction = document.getElementById("dialogAction");
const dialogDismiss = document.getElementById("dialogDismiss");
const homeButton = document.getElementById("homeButton");

let dialogMode = "";
let retryTimer;
let bubbleTimer;
let currentUtterance = null;

const welcomeMessage = "Halo, teman-teman! Yuk, bantu Dudu menemukan buah yang berwarna merah!";
const hintMessage = "Belum tepat, teman-teman! Coba cari buah yang merah dan bentuknya seperti segitiga.";

// Pakai suara Bahasa Indonesia yang tersedia di perangkat. Balon tampil saat
// narasi berlangsung dan ditutup ketika ucapan selesai.
window.addEventListener("load", () => speakAsDudu(welcomeMessage, 10000), { once: true });

homeButton.addEventListener("click", () => {
    window.location.href = "misi1.html";
});

fruitChoices.forEach((choice) => {
    choice.addEventListener("click", () => {
        if (choice.disabled) return;

        if (choice.dataset.answer === "semangka") {
            handleCorrectAnswer(choice);
        } else {
            handleWrongAnswer(choice);
        }
    });
});

function handleWrongAnswer(choice) {
    choice.classList.remove("is-wrong");
    void choice.offsetWidth;
    choice.classList.add("is-wrong");
    speakAsDudu(hintMessage, 8000);
    feedback.textContent = "Tidak apa-apa, coba lagi ya!";
    feedback.classList.add("show");

    showArtwork("asset/icon/coba-lagi.png", "Coba lagi!", "retry");
    dialogAction.hidden = true;
    dialogDismiss.hidden = true;

    window.clearTimeout(retryTimer);
    retryTimer = window.setTimeout(() => {
        if (dialogMode === "retry" && feedbackDialog.open) feedbackDialog.close();
    }, 850);
}

function handleCorrectAnswer(choice) {
    choice.classList.add("is-correct");
    fruitChoices.forEach((option) => { option.disabled = true; });
    stopDuduSpeech();
    hideDuduBubble();
    feedback.textContent = "Hebat! Kamu menemukan semangka!";
    feedback.classList.add("show");

    dudu.classList.remove("is-celebrating");
    starEffect.classList.remove("show");
    void dudu.offsetWidth;
    dudu.classList.add("is-celebrating");
    starEffect.classList.add("show");

    showArtwork("asset/icon/lanjut-lv1.png", "Keren! Tekan Lanjut untuk membuka level berikutnya.", "reward");
    dialogAction.hidden = false;
    dialogDismiss.hidden = true;
    dialogAction.setAttribute("aria-label", "Lanjut ke pratinjau level 2");
    dialogAction.focus();
}

function showArtwork(source, description, mode) {
    window.clearTimeout(retryTimer);
    dialogMode = mode;
    window.setDialogArtwork(dialogArt, source, description);
    if (!feedbackDialog.open) feedbackDialog.showModal();
}

function speakAsDudu(message, fallbackMs) {
    stopDuduSpeech();
    document.body.classList.remove("dudu-bubble-hidden");
    duduText.textContent = message;
    duduBubble.classList.add("is-visible");
    duduBubble.setAttribute("aria-hidden", "false");

    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
        bubbleTimer = window.setTimeout(hideDuduBubble, fallbackMs);
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
        window.clearTimeout(bubbleTimer);
        hideDuduBubble();
    };

    utterance.onend = finishSpeaking;
    utterance.onerror = finishSpeaking;
    window.speechSynthesis.speak(utterance);
    bubbleTimer = window.setTimeout(finishSpeaking, fallbackMs);
}

function stopDuduSpeech() {
    window.clearTimeout(bubbleTimer);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    currentUtterance = null;
}

function hideDuduBubble() {
    duduBubble.classList.remove("is-visible");
    duduBubble.setAttribute("aria-hidden", "true");
    document.body.classList.add("dudu-bubble-hidden");
}

dialogAction.addEventListener("click", () => {
    if (dialogMode === "reward") {
        dialogMode = "next-preview";
        window.setDialogArtwork(dialogArt, "asset/misi1/lv2-m1.png", "Pratinjau level 2: Aku Mencoba");
        dialogAction.setAttribute("aria-label", "Mulai level 2");
        dialogAction.focus();
        return;
    }

    if (dialogMode === "next-preview") {
        window.location.href = "m1-lv2.html";
    }
});

feedbackDialog.addEventListener("cancel", (event) => {
    if (dialogMode !== "retry") event.preventDefault();
});

feedbackDialog.addEventListener("close", () => {
    if (dialogMode === "retry") {
        feedback.classList.remove("show");
        fruitChoices.forEach((choice) => choice.classList.remove("is-wrong"));
    }
    dialogMode = "";
});
