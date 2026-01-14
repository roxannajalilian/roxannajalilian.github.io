// quiz.js
import { requireAdultOrRedirect, getData, setData } from "./gate.js";

requireAdultOrRedirect();

const QUESTIONS = [
  "I reread texts to find hidden meaning.",
  "If someone replies late, I assume it means something.",
  "I notice every small change in tone (periods, emojis, caps).",
  "I keep checking if they viewed my story / were online.",
  "I imagine conversations that haven’t happened yet.",
  "I overthink short replies like “ok” or “k”.",
  "I build a whole storyline from one message.",
  "I screenshot and zoom in like I’m in the FBI.",
  "I feel calmer only after I get reassurance.",
  "I assume silence means they’re upset with me.",
  "I interpret “seen” as personal sometimes.",
  "I compare how they text me vs other people.",
  "I rewrite my text a million times before sending.",
  "I panic-delete texts and regret it after.",
  "I look for “signs” (numbers, timing, weird coincidences).",
  "I assume mixed signals are secretly deep feelings.",
  "I get stuck in “what if” loops.",
  "I ask friends to analyze the convo with me.",
  "I feel embarrassed after overthinking but still do it.",
  "I know I’m doing too much… but I can’t stop sometimes."
];

// Difficulty: changes how harsh the scoring is + feedback tone
const MODES = {
  noob:   { label: "Noob mode",   weight: 0.9, soften: true  },
  medium: { label: "Medium mode", weight: 1.0, soften: false },
  hard:   { label: "Hard mode",   weight: 1.15, soften: false }
};

let data = getData();
let mode = data?.mode || "medium";
if (!MODES[mode]) mode = "medium";

let current = 0;
let answers = Array(QUESTIONS.length).fill(null);

const qCount = document.getElementById("qCount");
const bar = document.getElementById("bar");
const questionText = document.getElementById("questionText");
const nextBtn = document.getElementById("nextBtn");
const returnBtn = document.getElementById("returnBtn");
const saveStatus = document.getElementById("saveStatus");

const resultCard = document.getElementById("resultCard");
const resultTitle = document.getElementById("resultTitle");
const resultSubtitle = document.getElementById("resultSubtitle");
const resultPara = document.getElementById("resultPara");
const resultPct = document.getElementById("resultPct");
const modeTag = document.getElementById("modeTag");
const restartBtn = document.getElementById("restartBtn");

function updateUI() {
  qCount.textContent = `Question ${current + 1} of ${QUESTIONS.length}`;
  questionText.textContent = QUESTIONS[current];

  const progress = (current / QUESTIONS.length) * 100;
  bar.style.width = `${Math.max(6, progress)}%`;

  // Return button should actually work + be disabled on first question
  returnBtn.disabled = current === 0;
  returnBtn.classList.toggle("disabled", current === 0);

  // highlight selected
  document.querySelectorAll(".choice").forEach(btn => {
    const v = Number(btn.dataset.val);
    btn.classList.toggle("selected", answers[current] === v);
  });

  saveStatus.textContent = "Not saved yet";
}

function saveProgress() {
  data = getData();
  data.quiz = { answers, current, mode };
  setData(data);
  saveStatus.textContent = "Saved";
}

function calcScore() {
  // base score 0..100
  const totalMax = QUESTIONS.length * 3;
  const sum = answers.reduce((a, v) => a + (v ?? 0), 0);

  // mode weight makes hard mode slightly higher
  const weighted = Math.round((sum / totalMax) * 100 * MODES[mode].weight);
  return Math.max(0, Math.min(100, weighted));
}

function archetypeFor(score) {
  // You asked for “50-64 = butterfly” style mapping + reassuring paragraph
  if (score <= 24) return { name: "Chill Cat", range: "0–24", vibe: "low", emoji: "😼" };
  if (score <= 49) return { name: "Curious Bunny", range: "25–49", vibe: "midlow", emoji: "🐰" };
  if (score <= 64) return { name: "Butterfly", range: "50–64", vibe: "mid", emoji: "🦋" };
  if (score <= 84) return { name: "Detective", range: "65–84", vibe: "high", emoji: "🕵️" };
  return { name: "Astronaut (Gone-Gone)", range: "85–100", vibe: "veryhigh", emoji: "🧑‍🚀" };
}

function feedback(score) {
  const a = archetypeFor(score);
  const soften = MODES[mode].soften;

  const subtitle = `${a.emoji} ${a.name} • ${a.range} • Mode: ${MODES[mode].label}`;

  let para = "";
  if (a.vibe === "low") {
    para = "You’re pretty grounded. You might still notice details, but you don’t let them run your whole brain. Keep that energy — it’s literally a flex.";
  } else if (a.vibe === "midlow") {
    para = "You overthink sometimes, but you can still pull yourself back. A good move for you is: if you feel yourself spiraling, pause and ask “what’s the simplest explanation?”";
  } else if (a.vibe === "mid") {
    para = "You’re a Butterfly — sensitive to vibes and details, but not fully lost in them. You care a lot, which is sweet. Just remember: one message isn’t the whole story, and you deserve consistency, not confusion.";
  } else if (a.vibe === "high") {
    para = "You’re in Detective mode — you can read between the lines like it’s your job. Sometimes that protects you, but sometimes it makes you suffer for no reason. If you’re unsure, the healthiest cheat code is asking directly instead of building theories.";
  } else {
    para = soften
      ? "Okayyy astronaut 😭 your brain is doing parkour. It doesn’t mean you’re “crazy” — it usually means you care and you’re anxious. Try grounding yourself: drink water, breathe, and don’t make big decisions while you’re spiraling."
      : "Astronaut level means your brain is doing the MOST. It’s not a personality flaw — it’s usually anxiety + caring a lot. The fix is slowing the spiral: don’t reread, don’t assume, and get real clarity instead of guessing.";
  }

  return { title: `${a.name} (${score}%)`, subtitle, para };
}

function showResults() {
  const score = calcScore();
  const f = feedback(score);

  document.querySelector(".card").classList.add("hidden");
  resultCard.classList.remove("hidden");

  resultTitle.textContent = f.title;
  resultSubtitle.textContent = f.subtitle;
  resultPara.textContent = f.para;
  resultPct.textContent = `${score}%`;
  modeTag.textContent = `Difficulty: ${MODES[mode].label}`;

  // Save last result
  data = getData();
  data.lastQuizScore = score;
  setData(data);
}

function needAnswer() {
  return answers[current] === null;
}

document.querySelectorAll(".choice").forEach(btn => {
  btn.addEventListener("click", () => {
    answers[current] = Number(btn.dataset.val);
    updateUI();
    saveProgress();
  });
});

nextBtn.addEventListener("click", () => {
  if (needAnswer()) {
    saveStatus.textContent = "Pick an option first";
    return;
  }
  if (current < QUESTIONS.length - 1) {
    current++;
    updateUI();
    saveProgress();
  } else {
    showResults();
  }
});

returnBtn.addEventListener("click", () => {
  if (current > 0) {
    current--;
    updateUI();
    saveProgress();
  }
});

restartBtn.addEventListener("click", () => {
  current = 0;
  answers = Array(QUESTIONS.length).fill(null);
  document.querySelector(".card").classList.remove("hidden");
  resultCard.classList.add("hidden");
  updateUI();
  saveProgress();
});

// OPTIONAL: allow user to set mode somewhere else in your app
// If you already have a difficulty selector, just set data.mode and reload quiz.

(function loadSaved() {
  const saved = data?.quiz;
  if (saved?.answers?.length === QUESTIONS.length) {
    answers = saved.answers;
    current = Math.min(saved.current ?? 0, QUESTIONS.length - 1);
    mode = saved.mode || mode;
  }
  updateUI();
})();
