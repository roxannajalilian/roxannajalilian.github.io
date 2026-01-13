// quiz.js
requireAdultOrRedirect();

// Start fresh each time you enter quiz (so it doesn't "trap" you)
let current = 0;

const questions = [
  "I reread texts to find hidden meaning.",
  "If someone replies late, I assume something is wrong.",
  "I overthink emojis, punctuation, or short replies.",
  "I imagine worst-case scenarios before having proof.",
  "My mood depends on how fast someone texts back.",
  "I check my phone repeatedly waiting for a reply.",
  "I overanalyze one message instead of the whole conversation.",
  "I assume tone or intention without asking.",
  "I feel anxious if I don’t get reassurance.",
  "I replay conversations in my head.",
  "I read into what someone didn’t say.",
  "I assume silence means something negative.",
  "I want to double-text when anxious.",
  "I focus more on texts than real-life actions.",
  "I struggle to sit with uncertainty.",
  "I overthink even when nothing is clearly wrong.",
  "I get triggered by short answers like “ok” or “k”.",
  "I assume “seen” means they’re ignoring me.",
  "I feel like I need to explain myself a lot after a tense reply.",
  "I try to mind-read what they meant instead of asking directly."
];

let answers = new Array(questions.length).fill(null);

const qText = document.getElementById("questionText");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const answerButtons = Array.from(document.querySelectorAll(".answer"));
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const warn = document.getElementById("warn");
const pillSave = document.getElementById("pillSave");

function setWarn(text){
  warn.textContent = text;
  warn.style.display = text ? "block" : "none";
}

function renderQuestion() {
  qText.textContent = questions[current];
  progressText.textContent = `Question ${current + 1} of ${questions.length}`;
  progressFill.style.width = `${((current + 1) / questions.length) * 100}%`;

  answerButtons.forEach(btn => {
    btn.classList.remove("selected");
    const v = Number(btn.dataset.value);
    if (answers[current] === v) btn.classList.add("selected");
  });

  backBtn.disabled = current === 0;
  nextBtn.textContent = current === questions.length - 1 ? "Finish" : "Next";
  setWarn("");
}

answerButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    answers[current] = Number(btn.dataset.value);
    answerButtons.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    setWarn("");
  });
});

backBtn.addEventListener("click", () => {
  if (current > 0) {
    current--;
    renderQuestion();
  }
});

nextBtn.addEventListener("click", () => {
  if (answers[current] === null) {
    setWarn("Pick an answer before continuing.");
    return;
  }

  if (current < questions.length - 1) {
    current++;
    renderQuestion();
  } else {
    finishQuiz();
  }
});

function finishQuiz() {
  const totalScore = answers.reduce((a, b) => a + b, 0);
  const maxScore = questions.length * 3;
  const percentage = Math.round((totalScore / maxScore) * 100);

  let tier, explanation, advice, vibe;

  if (percentage <= 25) {
    tier = "Low overthinking";
    explanation = "You usually read things pretty realistically. You don’t spiral off one message.";
    advice = "Keep trusting patterns over one text. If something feels off, ask once and move on.";
    vibe = "🧊 Calm Queen/King energy";
  } else if (percentage <= 50) {
    tier = "Mild overthinking";
    explanation = "You’re mostly fine, but uncertainty can make you over-analyze little details.";
    advice = "When you feel triggered, pause. Ask: “Do I have proof or just vibes?” Then act on proof.";
    vibe = "🌙 Soft thinker energy";
  } else if (percentage <= 75) {
    tier = "High overthinking";
    explanation = "You often mind-read and assume meanings that might not be there (especially in texts).";
    advice = "Try a 10-minute delay before reacting. Focus more on actions than the exact wording.";
    vibe = "🦋 Butterfly brain (sensitive + deep)";
  } else {
    tier = "Very high overthinking";
    explanation = "Your brain is basically doing detective work 24/7. A text can flip your mood fast.";
    advice = "If you’re spiraling, step away from the chat, breathe, and ask for clarity (not reassurance).";
    vibe = "🔥 Delulu Detective (intense edition)";
  }

  const data = getData();
  data.quizResult = {
    percentage, tier, explanation, advice, vibe,
    at: new Date().toISOString()
  };
  setData(data);

  pillSave.textContent = "Saved ✓";
  pillSave.style.borderColor = "rgba(83,255,214,.55)";

  window.location.href = "loading.html";
}

renderQuestion();
