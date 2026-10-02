const appleButtons = [...document.querySelectorAll(".tree-apple")];
const basketApples = document.getElementById("basketApples");
const appleCount = document.getElementById("appleCount");
const appleProgress = document.getElementById("appleProgress");
const dudu = document.getElementById("dudu");
const duduBubble = document.getElementById("duduBubble");
const duduText = document.getElementById("duduText");
const feedback = document.getElementById("m2Feedback");
const starEffect = document.getElementById("m2Stars");
const levelDialog = document.getElementById("levelDialog");
const dialogArt = document.getElementById("dialogArt");
const dialogAction = document.getElementById("dialogAction");

const welcomeMessage = "Halo, teman-teman! Yuk, bantu Dudu memetik apel. Ayo hitung dari satu sampai tujuh!";
const numberWords = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh"];
let pickedCount = 0;
let dialogMode = "";
let speechTimer;
let currentUtterance = null;
let finished = false;

window.addEventListener("load", () => speakAsDudu(welcomeMessage, 10000), { once: true });
document.getElementById("homeButton").addEventListener("click", () => { window.location.href = "misi2.html"; });

appleButtons.forEach((apple) => {
    apple.addEventListener("click", () => pickApple(apple));
});

function pickApple(apple) {
    if (apple.disabled || finished) return;

    apple.disabled = true;
    apple.classList.add("is-picked");
    pickedCount += 1;

    const basketApple = document.createElement("span");
    basketApple.className = "basket-apple";
    basketApple.textContent = "🍎";
    basketApple.setAttribute("role", "img");
    basketApple.setAttribute("aria-label", `Apel ${pickedCount} di keranjang`);
    basketApples.appendChild(basketApple);

    appleCount.textContent = String(pickedCount);
    appleProgress.style.width = `${(pickedCount / appleButtons.length) * 100}%`;

    if (pickedCount < 7) {
        const msg = `${capitalize(numberWords[pickedCount])}! Sekarang ada ${numberWords[pickedCount]} apel di keranjang. Petik satu lagi!`;
        feedback.textContent = `🍎 ${pickedCount} dari 7 apel!`;
        feedback.classList.add("show");
        speakAsDudu(msg, 7000);
        return;
    }

    finished = true;
    const completeMessage = "Hore! Ada tujuh apel di dalam keranjang. Kamu hebat menghitung!";
    feedback.textContent = "Hore! Semua tujuh apel berhasil dipetik!";
    feedback.classList.add("show");
    dudu.classList.remove("is-celebrating");
    starEffect.classList.remove("show");
    void dudu.offsetWidth;
    dudu.classList.add("is-celebrating");
    starEffect.classList.add("show");
    speakAsDudu(completeMessage, 9000, showSuccessPopup);
}

function showSuccessPopup() {
    dialogMode = "reward";
    dialogArt.src = "asset/icon/lanjut-lv1.png";
    dialogArt.alt = "Keren! Semua tujuh apel berhasil dipetik.";
    dialogAction.setAttribute("aria-label", "Lanjut ke pratinjau level 2");
    levelDialog.showModal();
    dialogAction.focus();
}

dialogAction.addEventListener("click", () => {
    if (dialogMode === "reward") {
        dialogMode = "next-preview";
        dialogArt.src = "asset/misi2/lv2-m2.png";
        dialogArt.alt = "Pratinjau level 2 misi menghitung";
        dialogAction.setAttribute("aria-label", "Mulai level 2");
        dialogAction.focus();
    } else if (dialogMode === "next-preview") {
        window.location.href = "m2-lv2.html";
    }
});

levelDialog.addEventListener("cancel", (event) => event.preventDefault());

function speakAsDudu(message, fallbackMs, onFinished) {
    stopDuduSpeech();
    duduText.textContent = message;
    duduBubble.classList.add("is-visible");
    duduBubble.setAttribute("aria-hidden", "false");

    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
        speechTimer = window.setTimeout(() => {
            hideDuduBubble();
            onFinished?.();
        }, fallbackMs);
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
        onFinished?.();
    };

    utterance.onend = finishSpeaking;
    utterance.onerror = finishSpeaking;
    window.speechSynthesis.speak(utterance);
    speechTimer = window.setTimeout(finishSpeaking, fallbackMs);
}

function stopDuduSpeech() {
    window.clearTimeout(speechTimer);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    currentUtterance = null;
}

function hideDuduBubble() {
    duduBubble.classList.remove("is-visible");
    duduBubble.setAttribute("aria-hidden", "true");
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
