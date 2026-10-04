const tableButtons = [...document.querySelectorAll(".table-hotspot")];
const foundStars = [...document.querySelectorAll(".table-found-star")];
const dudu = document.getElementById("dudu");
const duduBubble = document.getElementById("duduBubble");
const duduText = document.getElementById("duduText");
const tableCount = document.getElementById("tableCount");
const counterProgress = document.getElementById("counterProgress");
const feedback = document.getElementById("feedback");
const starEffect = document.getElementById("starEffect");
const finishDialog = document.getElementById("finishDialog");
const finishArt = document.getElementById("finishArt");
const finishAction = document.getElementById("finishAction");

let foundCount = 0;
let feedbackTimer;
let speechTimer;
let currentUtterance = null;
let finished = false;

const welcomeMessage = "Hore! Kita sudah sampai di kelas. Bantu Dudu menemukan tiga meja bundar!";

window.addEventListener("load", () => speakAsDudu(welcomeMessage, 10000), { once: true });
document.getElementById("homeButton").addEventListener("click", () => {
    window.location.href = "misi1.html";
});

tableButtons.forEach((button, index) => {
    button.addEventListener("click", () => discoverTable(button, index));
});

function discoverTable(button, index) {
    if (button.disabled || finished) return;

    button.disabled = true;
    button.classList.add("is-found");
    foundStars[index].classList.add("is-visible");
    foundCount += 1;
    tableCount.textContent = String(foundCount);
    counterProgress.style.width = `${(foundCount / tableButtons.length) * 100}%`;

    const messages = [
        "Yeay! Kamu menemukan satu meja bundar! Cari dua meja lagi, ya!",
        "Hebat! Tinggal satu meja bundar lagi. Ayo cari!",
        "Luar biasa! Kamu berhasil menemukan semua meja bundar di kelas!"
    ];

    feedback.textContent = foundCount === tableButtons.length
        ? "Hore! Semua meja berhasil ditemukan!"
        : `Bagus! ${foundCount} dari 3 meja ditemukan.`;
    feedback.classList.add("show");
    window.clearTimeout(feedbackTimer);

    if (foundCount === tableButtons.length) {
        finished = true;
        dudu.classList.remove("is-celebrating");
        starEffect.classList.remove("show");
        void dudu.offsetWidth;
        dudu.classList.add("is-celebrating");
        starEffect.classList.add("show");
        speakAsDudu(messages[2], 9000, showFinishPopup);
    } else {
        speakAsDudu(messages[foundCount - 1], 8000);
        feedbackTimer = window.setTimeout(() => feedback.classList.remove("show"), 1800);
    }
}

function showFinishPopup() {
    finishArt.src = "asset/icon/lanjut-lv3.png";
    finishArt.alt = "Keren! Kamu menyelesaikan level 3.";
    finishDialog.showModal();
    finishAction.focus();
}

finishAction.addEventListener("click", () => {
    window.location.href = "menu.html";
});

finishDialog.addEventListener("cancel", (event) => event.preventDefault());

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
