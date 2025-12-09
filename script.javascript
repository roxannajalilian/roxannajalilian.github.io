// PAGE SWITCHING
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// AGE VERIFICATION & LOCKOUT
let contradictionCount = 0;
let isPermanentlyLocked = false;
let lockTimer;

function verifyAge() {
    const age = parseInt(document.getElementById('ageInput').value);
    const lockMessage = document.getElementById('lockMessage');

    if (isPermanentlyLocked) {
        lockMessage.textContent = "Multiple inconsistencies detected. Contact support to appeal.";
        lockMessage.classList.remove("hidden");
        return;
    }

    // Fake lie detection: if age < 14 or empty, counts as contradiction
    if (!age || age < 14) contradictionCount++;

    if (contradictionCount === 1) {
        lockMessage.textContent = "We noticed inconsistent answers. Locked for 30 minutes.";
        lockMessage.classList.remove("hidden");
        lockTimer = setTimeout(() => {
            lockMessage.classList.add("hidden");
        }, 1800000); // 30 min
        return;
    } else if (contradictionCount >= 2) {
        isPermanentlyLocked = true;
        lockMessage.textContent = "Multiple inconsistencies detected. Contact support to appeal.";
        lockMessage.classList.remove("hidden");
        return;
    }

    // Direct user to correct mode
    if (age < 18) {
        showPage('minor-quiz-page');
    } else {
        showPage('adult-page');
    }
}

// MINOR QUIZ SETUP
const minorQuestions = [
    {q: "Did they text you back quickly?", options: ["Yes", "No", "Sometimes"]},
    {q: "Are they ghosting you?", options: ["Yes", "No", "Sometimes"]},
    {q: "Do you feel anxious about their messages?", options: ["Yes", "No", "Sometimes"]},
    {q: "Do you re-read their messages often?", options: ["Yes", "No", "Sometimes"]},
    {q: "Do you assume the worst?", options: ["Yes", "No", "Sometimes"]},
    {q: "Do you read too much into emojis?", options: ["Yes", "No", "Sometimes"]},
    {q: "Do you text back immediately?", options: ["Yes", "No", "Sometimes"]},
    {q: "Do you check their social media constantly?", options: ["Yes", "No", "Sometimes"]},
    {q: "Do you get jealous easily?", options: ["Yes", "No", "Sometimes"]},
    {q: "Do you overthink small details?", options: ["Yes", "No", "Sometimes"]}
];

function loadMinorQuiz() {
    const container = document.getElementById("minor-quiz-container");
    container.innerHTML = "";
    minorQuestions.forEach((item, index) => {
        const div = document.createElement("div");
        div.classList.add("quiz-question");
        div.innerHTML = `<p>${index+1}. ${item.q}</p>`;
        item.options.forEach(opt => {
            const radio = `<label class="quiz-option">
                <input type="radio" name="q${index}" value="${opt}"> ${opt}
            </label>`;
            div.innerHTML += radio;
        });
        container.appendChild(div);
    });
}

// CALCULATE QUIZ RESULT
function submitMinorQuiz() {
    let score = 0;
    minorQuestions.forEach((item, index) => {
        const selected = document.querySelector(`input[name="q${index}"]:checked`);
        if (!selected) return;
        if (selected.value === "Yes") score += 10;
        if (selected.value === "Sometimes") score += 5;
        if (selected.value === "No") score += 0;
    });

    let resultText = "";
    if (score <= 30) resultText = "Low delulu risk 😊";
    else if (score <= 70) resultText = "Moderate delulu risk 🤔";
    else resultText = "High delulu risk 😬";

    document.getElementById("minor-quiz-result").textContent = `Score: ${score} - ${resultText}`;
}

// INITIALIZE
window.onload = () => {
    loadMinorQuiz();
};
