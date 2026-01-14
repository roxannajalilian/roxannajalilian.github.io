// quiz.js — FULL working file (fixes stuck "Loading...")

/** Storage keys */
const KEY = "delulu_data_v1";          // your main app storage
const QUIZ_KEY = "delulu_quiz_v1";     // quiz state storage

/** Pages (change these if your filenames are different) */
const PAGES = {
  menu: "menu.html",
  index: "index.html",
  plan: "plan.html",
  analysis: "analysis.html",
  game: "game.html",
  results: "results.html" // optional (we also show result inline if you don't have it)
};

function safeParse(json, fallback) {
  try { return JSON.parse(json); } catch { return fallback; }
}
function getData() {
  return safeParse(localStorage.getItem(KEY) || "{}", {});
}
function setData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function requireAdultOrRedirect() {
  const data = getData();
  // If you want NO age gate, delete this whole function call below
  if (!data || !Number.isFinite(Number(data.age)) || Number(data.age) < 18) {
    // Kick them out
    window.location.href = PAGES.index;
    return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  // Gate (optional)
  if (!requireAdultOrRedirect()) return;

  // Grab UI
  const qText = document.getElementById("qText");
  const qCounter = document.getElementById("qCounter");
  const qHint = document.getElementById("qHint");
  const answersWrap = document.getElementById("answers");
  const progressText = document.getElementById("progressText");
  const btnRestart = document.getElementById("btnRestart");

  const btnBack = document.getElementById("btnBack");
  const btnMenu = document.getElementById("btnMenu");
  const btnPlan = document.getElementById("btnPlan");
  const btnAnalysis = document.getElementById("btnAnalysis");
  const btnGame = document.getElementById("btnGame");

  // Safety check (prevents silent fail → stuck on Loading)
  if (!qText || !qCounter || !answersWrap) {
    console.error("Missing quiz HTML elements. Check IDs: qText, qCounter, answers");
    return;
  }

  // NAV buttons
  btnBack?.addEventListener("click", () => history.back());
  btnMenu?.addEventListener("click", () => (window.location.href = PAGES.menu));
  btnPlan?.addEventListener("click", () => (window.location.href = PAGES.plan));
  btnAnalysis?.addEventListener("click", () => (window.location.href = PAGES.analysis));
  btnGame?.addEventListener("click", () => (window.location.href = PAGES.game));

  // Questions (edit these anytime)
  const questions = [
    "I reread texts to find hidden meaning.",
    "I assume silence means something bad.",
    "I overthink message timing (minutes, hours, seen, online).",
    "I feel anxious if they don’t reply fast.",
    "I make scenarios in my head based on tiny clues.",
    "I check their socials for “signs” (likes, views, follows).",
    "I take short replies personally.",
    "I need reassurance often to feel okay.",
    "I can’t focus while waiting for a reply.",
    "I convince myself they’re losing interest with no proof."
  ];

  // State
  let current = 0;
  let score = 0;

  // Load saved quiz state (optional)
  const saved = safeParse(localStorage.getItem(QUIZ_KEY) || "{}", {});
  if (Number.isInteger(saved.current) && Number.isFinite(saved.score)) {
    current = Math.min(Math.max(saved.current, 0), questions.length - 1);
    score = Math.max(saved.score, 0);
  }

  function saveState() {
    localStorage.setItem(QUIZ_KEY, JSON.stringify({ current, score }));
  }

  function percentDone() {
    if (questions.length === 0) return 0;
    return Math.round((current / questions.length) * 100);
  }

  function render() {
    // Fix the "Loading..." issue: ALWAYS replace it with real question text
    qText.textContent = questions[current] || "Question missing (check your questions list).";
    qCounter.textContent = `Question ${current + 1}/${questions.length}`;
    if (progressText) progressText.textContent = `Progress: ${percentDone()}%`;
    if (qHint) qHint.textContent = "Tap a choice.";
    saveState();
  }

  function finish() {
    // compute %
    const max = questions.length * 3;
    const pct = Math.round((score / max) * 100);

    // store to main app data
    const data = getData();
    data.lastQuiz = {
      score,
      max,
      pct,
      finishedAt: new Date().toISOString()
    };
    setData(data);

    // clear quiz state
    localStorage.removeItem(QUIZ_KEY);

    // If you have results.html, go there; otherwise show inline
    // (leave this as is — it will still work even if results.html doesn't exist)
    try {
      window.location.href = PAGES.results;
    } catch {
      // fallback
      showInlineResult(pct);
    }
  }

  function showInlineResult(pct) {
    qCounter.textContent = "Finished";
    qText.textContent = `Your result: ${pct}%`;

    let msg = "";
    if (pct <= 25) msg = "Low delulu — you’re pretty grounded.";
    else if (pct <= 50) msg = "Some delulu — you overthink sometimes.";
    else if (pct <= 75) msg = "High delulu — you spiral easily, breathe + slow down.";
    else msg = "MAX delulu — you’re in your head heavy. Stop reading into everything.";

    if (qHint) qHint.textContent = msg;
    answersWrap.style.display = "none";
    if (progressText) progressText.textContent = "Progress: 100%";
  }

  function next() {
    current++;
    if (current >= questions.length) {
      finish();
      return;
    }
    render();
  }

  // Choice click handling
  answersWrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".choice");
    if (!btn) return;

    const val = Number(btn.dataset.value);
    if (!Number.isFinite(val)) return;

    score += val;
    next();
  });

  // Restart
  btnRestart?.addEventListener("click", () => {
    current = 0;
    score = 0;
    localStorage.removeItem(QUIZ_KEY);
    answersWrap.style.display = "";
    render();
  });

  // Initial render (THIS is what fixes the stuck loading)
  render();
});
