// quiz.js — stable + GitHub Pages safe

const STORAGE_KEY = "delulu_data_v1";

// Fallback storage helpers (so Finish still works even if core.js breaks)
function safeGetData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}
function safeSetData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

// If core.js exists, use it. Otherwise use fallback.
const getDataFn = (typeof getData === "function") ? getData : safeGetData;
const setDataFn = (typeof setData === "function") ? setData : safeSetData;

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
  "I overthink even when nothing is clearly wrong."
];

let current = 0;

// Try to load saved answers (prevents losing work on refresh)
const initialData = getDataFn();
let answers = Array.isArray(initialData.answers) && initialData.answers.length === questions.length
  ? initialData.answers.slice()
  : new Array(questions.length).fill(null);

// DOM
const qText = document.getElementById("questionText");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const answerButtons = document.querySelectorAll(".answer");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");

// Basic guard if quiz.html is missing ids
if (!qText || !progressText || !progressFill || !backBtn || !nextBtn || !answerButtons.length) {
  alert("Quiz page is missing required elements (IDs/classes). Check quiz.html.");
}

function renderQuestion() {
  qText.textContent = questions[current];
  progressText.textContent = `Question ${current + 1} of ${questions.length}`;
  progressFill.style.width = `${((current + 1) / questions.length) * 100}%`;

  // highlight selected
  answerButtons.forEach(btn => {
    btn.classList.remove("selected");
    if (Number(btn.dataset.value) === answers[current]) btn.classList.add("selected");
  });

  backBtn.disabled = current === 0;
  nextBtn.textContent = current === questions.length - 1 ? "Finish" : "Next";
}

answerButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    answers[current] = Number(btn.dataset.value);

    answerButtons.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    // autosave answers
    const data = getDataFn();
    data.answers = answers;
    setDataFn(data);
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
    alert("Please select an answer before continuing.");
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
  const totalScore = answers.reduce((a, b) => a + (b ?? 0), 0);
  const maxScore = questions.length * 3;
  const percentage = Math.round((totalScore / maxScore) * 100);

  // friend-style result text (still short + clear)
  let tier, explanation, advice;

  if (percentage <= 25) {
    tier = "Low overthinking";
    explanation = "You’re pretty grounded — you don’t usually spiral off one text.";
    advice = "Trust patterns over one message. If you need clarity, ask once calmly.";
  } else if (percentage <= 50) {
    tier = "Mild overthinking";
    explanation = "You overthink sometimes, mainly when things feel unclear or inconsistent.";
    advice = "When you start guessing, ask: ‘Do I have proof… or am I filling gaps?’";
  } else if (percentage <= 75) {
    tier = "High overthinking";
    explanation = "Your brain tends to turn small texts into a whole story (it happens).";
    advice = "Delay reacting. Look at consistency and actions, not one reply or emoji.";
  } else {
    tier = "Very high overthinking";
    explanation = "Anxiety is probably driving the interpretation more than facts right now.";
    advice = "Step back first, calm down, then choose one clarity text—or take space.";
  }

  const data = getDataFn();
  data.answers = answers;
  data.quizResult = { percentage, tier, explanation, advice };
  setDataFn(data);

  // IMPORTANT: make sure this file exists EXACTLY: loading.html
  window.location.href = "loading.html";
}

renderQuestion();
