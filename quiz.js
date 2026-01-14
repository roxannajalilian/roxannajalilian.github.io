import { requireAdultOrRedirect, getData, setData } from "./gate.js";
requireAdultOrRedirect();

/* -----------------------------
   MODES = GAME LEVELS
------------------------------ */
const MODES = {
  noob: {
    label: "Noob",
    weight: 0.85, // score is slightly lower overall
    vibe: "chill",
    verdictShift: -6, // makes results feel a bit more forgiving
  },
  medium: {
    label: "Medium",
    weight: 1.0,
    vibe: "balanced",
    verdictShift: 0,
  },
  hard: {
    label: "Hard",
    weight: 1.25, // score goes higher easier (feels more intense)
    vibe: "callout",
    verdictShift: +6, // makes it easier to land in higher “delulu” tiers
  }
};

/* -----------------------------
   QUESTION POOLS (DIFFERENT PER MODE)
------------------------------ */
const QUESTIONS_NOOB = [
  "I reread texts to find hidden meaning.",
  "I overthink short replies like “ok” or “k”.",
  "I imagine conversations that haven’t happened yet.",
  "I notice tiny tone changes (emoji, caps, punctuation).",
  "I check if they’re online or active.",
  "I feel anxious if they reply late.",
  "I think about “what if” scenarios.",
  "I ask friends to analyze the convo with me.",
  "I rewrite my text a lot before sending.",
  "I feel calmer after reassurance."
];

const QUESTIONS_MEDIUM = [
  ...QUESTIONS_NOOB,
  "I assume silence means they’re upset with me.",
  "I interpret “seen” as personal sometimes.",
  "I compare how they text me vs others.",
  "I build a whole storyline from one message.",
  "I keep checking for “signs” in timing/behavior."
];

const QUESTIONS_HARD = [
  ...QUESTIONS_MEDIUM,
  "I ignore obvious signs and make my own story anyway.",
  "I stay attached even when I feel confused or stressed.",
  "I know I’m spiraling but I keep rereading.",
  "I feel embarrassed after overthinking but still do it.",
  "Sometimes I treat mixed signals like they mean something deep."
];

/* -----------------------------
   STATE
------------------------------ */
let data = getData();
let mode = data?.mode || "medium";
if (!MODES[mode]) mode = "medium";

let QUESTIONS = pickQuestions(mode);
let current = 0;
let answers = Array(QUESTIONS.length).fill(null);

/* -----------------------------
   DOM
------------------------------ */
const modeCard = document.getElementById("modeCard");
const quizCard = document.getElementById("quizCard");
const resultCard = document.getElementById("resultCard");

const savedModeTag = document.getElementById("savedModeTag");
const pickNoob = document.getElementById("pickNoob");
const pickMed = document.getElementById("pickMed");
const pickHard = document.getElementById("pickHard");
const startBtn = document.getElementById("startBtn");

const qCount = document.getElementById("qCount");
const modePill = document.getElementById("modePill");
const bar = document.getElementById("bar");
const questionText = document.getElementById("questionText");
const nextBtn = document.getElementById("nextBtn");
const returnBtn = document.getElementById("returnBtn");

const resultTitle = document.getElementById("resultTitle");
const resultSubtitle = document.getElementById("resultSubtitle");
const resultPara = document.getElementById("resultPara");
const resultPct = document.getElementById("resultPct");
const modeTag = document.getElementById("modeTag");
const modeNote = document.getElementById("modeNote");
const playAgainBtn = document.getElementById("playAgainBtn");

/* -----------------------------
   HELPERS
------------------------------ */
function pickQuestions(m) {
  if (m === "noob") return QUESTIONS_NOOB;
  if (m === "hard") return QUESTIONS_HARD;
  return QUESTIONS_MEDIUM;
}

function saveAll() {
  const d = getData();
  d.mode = mode;
  d.quiz = { mode, current, answers, total: QUESTIONS.length };
  setData(d);
}

function setMode(newMode) {
  mode = newMode;
  QUESTIONS = pickQuestions(mode);
  current = 0;
  answers = Array(QUESTIONS.length).fill(null);

  // store
  const d = getData();
  d.mode = mode;
  d.quiz = null;
  setData(d);

  paintModeButtons();
  savedModeTag.textContent = `Saved: ${MODES[mode].label}`;
}

function paintModeButtons() {
  [pickNoob, pickMed, pickHard].forEach(b => b.classList.remove("selected"));
  if (mode === "noob") pickNoob.classList.add("selected");
  if (mode === "medium") pickMed.classList.add("selected");
  if (mode === "hard") pickHard.classList.add("selected");
}

function startGame() {
  modeCard.classList.add("hidden");
  resultCard.classList.add("hidden");
  quizCard.classList.remove("hidden");

  modePill.textContent = `Mode: ${MODES[mode].label}`;
  updateUI();
  saveAll();
}

function updateUI() {
  qCount.textContent = `Question ${current + 1} of ${QUESTIONS.length}`;
  questionText.textContent = QUESTIONS[current];

  const progress = (current / QUESTIONS.length) * 100;
  bar.style.width = `${Math.max(6, progress)}%`;

  returnBtn.disabled = current === 0;
  returnBtn.classList.toggle("disabled", current === 0);

  document.querySelectorAll(".choice[data-val]").forEach(btn => {
    const v = Number(btn.dataset.val);
    btn.classList.toggle("selected", answers[current] === v);
  });

  nextBtn.textContent = (current === QUESTIONS.length - 1) ? "Finish" : "Next";
}

function calcScore() {
  // base 0..100
  const totalMax = QUESTIONS.length * 3;
  const sum = answers.reduce((a, v) => a + (v ?? 0), 0);

  let score = Math.round((sum / totalMax) * 100 * MODES[mode].weight);

  // clamp
  score = Math.max(0, Math.min(100, score));
  return score;
}

function archetypeFor(score) {
  // Shift tiers slightly based on mode
  const shift = MODES[mode].verdictShift;
  const s = Math.max(0, Math.min(100, score + shift));

  if (s <= 24) return { name: "Chill Cat", range: "0–24", emoji: "😼", tier: "low" };
  if (s <= 49) return { name: "Curious Bunny", range: "25–49", emoji: "🐰", tier: "midlow" };
  if (s <= 64) return { name: "Butterfly", range: "50–64", emoji: "🦋", tier: "mid" };
  if (s <= 84) return { name: "Detective", range: "65–84", emoji: "🕵️", tier: "high" };
  return { name: "Astronaut (Gone-Gone)", range: "85–100", emoji: "🧑‍🚀", tier: "veryhigh" };
}

function feedback(score) {
  const a = archetypeFor(score);

  const subtitle = `${a.emoji} ${a.name} • Tier ${a.range} • Mode: ${MODES[mode].label}`;

  let para = "";
  if (a.tier === "low") {
    para =
      "You’re pretty grounded. You notice details, but you don’t let one message control your whole mood. Keep that energy — it’s literally peace.";
  } else if (a.tier === "midlow") {
    para =
      "You overthink sometimes, but you can still pull yourself back. Your cheat code: pause, breathe, and ask “what’s the simplest explanation?” before you spiral.";
  } else if (a.tier === "mid") {
    para =
      "Butterfly 🦋 — you’re sensitive to vibes and details. That can be a strength, but anxiety can pretend it’s “intuition.” One text isn’t the whole story. You deserve clarity, not confusion.";
  } else if (a.tier === "high") {
    para =
      "Detective 🕵️ — you read between the lines like it’s a full-time job. Sometimes that protects you, but sometimes it makes you suffer over nothing. Try this: ask one clear question instead of building theories.";
  } else {
    para =
      "Astronaut 🧑‍🚀 — your brain is doing parkour 😭. It doesn’t mean you’re crazy; it usually means you care + you’re anxious. The move is slowing down: don’t reread, don’t assume, get real clarity when you’re calm.";
  }

  // Small mode flavor (so it feels “game-like”)
  const modeFlavor =
    mode === "noob"
      ? "Noob mode note: your score is more forgiving — this is just a vibe check."
      : mode === "hard"
      ? "Hard mode note: this mode is strict — don’t take it personally, it’s meant to call out patterns."
      : "Medium mode note: balanced scoring — pretty accurate overall.";

  return { title: `${a.name} (${score}%)`, subtitle, para, modeFlavor };
}

function showResults() {
  const score = calcScore();
  const f = feedback(score);

  quizCard.classList.add("hidden");
  resultCard.classList.remove("hidden");

  resultTitle.textContent = f.title;
  resultSubtitle.textContent = f.subtitle;
  resultPara.textContent = f.para;
  resultPct.textContent = `${score}%`;
  modeTag.textContent = `Difficulty: ${MODES[mode].label}`;
  modeNote.textContent = f.modeFlavor;

  // Save last result
  const d = getData();
  d.lastQuizScore = score;
  d.lastQuizMode = mode;
  setData(d);
}

/* -----------------------------
   EVENTS
------------------------------ */
// Mode picker buttons
pickNoob.addEventListener("click", () => setMode("noob"));
pickMed.addEventListener("click", () => setMode("medium"));
pickHard.addEventListener("click", () => setMode("hard"));

startBtn.addEventListener("click", () => {
  // must have questions ready
  QUESTIONS = pickQuestions(mode);
  answers = Array(QUESTIONS.length).fill(null);
  current = 0;
  startGame();
});

// Answer buttons (only those with data-val)
document.querySelectorAll(".choice[data-val]").forEach(btn => {
  btn.addEventListener("click", () => {
    answers[current] = Number(btn.dataset.val);
    updateUI();
    saveAll();
  });
});

nextBtn.addEventListener("click", () => {
  if (answers[current] === null) return; // no skipping

  if (current < QUESTIONS.length - 1) {
    current++;
    updateUI();
    saveAll();
  } else {
    showResults();
  }
});

returnBtn.addEventListener("click", () => {
  if (current > 0) {
    current--;
    updateUI();
    saveAll();
  }
});

playAgainBtn.addEventListener("click", () => {
  // back to mode select
  resultCard.classList.add("hidden");
  quizCard.classList.add("hidden");
  modeCard.classList.remove("hidden");

  // reset only progress, keep mode
  QUESTIONS = pickQuestions(mode);
  answers = Array(QUESTIONS.length).fill(null);
  current = 0;

  saveAll();
});

/* -----------------------------
   INIT
------------------------------ */
(function init() {
  // show saved mode tag
  savedModeTag.textContent = `Saved: ${MODES[mode].label}`;
  paintModeButtons();

  
  const d = getData();
  if (d?.lockedOut) return; // gate handles redirect anyway

  // keep on mode select screen
})();
