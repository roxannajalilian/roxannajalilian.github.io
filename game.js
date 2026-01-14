import { requireAdultOrRedirect, getData, setData } from "./gate.js";
requireAdultOrRedirect();

/* -----------------------------
   GAME SETTINGS (MODES)
------------------------------ */
const MODES = {
  noob:   { label: "Noob",   baseTime: 5200, lives: 4, speedUp: 0.92 },
  medium: { label: "Medium", baseTime: 4200, lives: 3, speedUp: 0.90 },
  hard:   { label: "Hard",   baseTime: 3200, lives: 2, speedUp: 0.88 }
};

const TIPS = [
  "If you’re confused, ask one clear question (not 10).",
  "Don’t react while anxious. Pause first.",
  "Consistency > mixed signals.",
  "One message isn’t a whole story.",
  "Healthy is calm + clear, not guessing games."
];

/* -----------------------------
   SCENARIOS
   Each scenario has 4 choices.
   correctIndex = healthiest choice.
------------------------------ */
const SCENARIOS = [
  {
    prompt: "They reply: “k.”",
    context: "You sent something kinda heartfelt.",
    choices: [
      "Text 7 messages asking if they’re mad.",
      "Reply: “wow okay…” to guilt them.",
      "Reply normally + if it keeps happening, ask directly later.",
      "Block them instantly and spiral."
    ],
    correctIndex: 2,
    reason: "Short replies are easy to overread. Calm + direct > mind-reading."
  },
  {
    prompt: "They left you on seen for 6 hours.",
    context: "You notice they were online.",
    choices: [
      "Send “???” and then delete it.",
      "Assume they hate you and vent on your story.",
      "Wait, do your own thing, then ask later if needed.",
      "Make a fake test text to see if they care."
    ],
    correctIndex: 2,
    reason: "Protect your peace. Waiting + clarity later beats spiraling."
  },
  {
    prompt: "They’re flirting then disappear for days.",
    context: "Mixed signals are confusing.",
    choices: [
      "Keep chasing—maybe they’re shy.",
      "Ask clearly what they want + match their effort.",
      "Pretend you don’t care and post for attention.",
      "Start a whole imaginary relationship in your head."
    ],
    correctIndex: 1,
    reason: "Clarity + matching effort is the healthiest move."
  },
  {
    prompt: "They cancel plans last minute… again.",
    context: "No real explanation.",
    choices: [
      "Beg them to reschedule immediately.",
      "Say “it’s fine” but be passive aggressive.",
      "Say okay, but set a boundary: you need consistency.",
      "Plan revenge / make them jealous."
    ],
    correctIndex: 2,
    reason: "Boundaries aren’t rude— they protect you."
  },
  {
    prompt: "They said: “I’m busy.”",
    context: "But they’re posting a lot.",
    choices: [
      "Call them out aggressively.",
      "Assume they’re lying and spam them.",
      "Take it as info: don’t chase; see if they show up later.",
      "Write a long paragraph proving your worth."
    ],
    correctIndex: 2,
    reason: "Busy or not, you match effort and watch behavior."
  },
  {
    prompt: "You want to double text.",
    context: "They haven’t replied yet.",
    choices: [
      "Double text 5 times with different tones.",
      "Send one calm follow-up then stop.",
      "Send a sarcastic message to get attention.",
      "Delete your last message and panic."
    ],
    correctIndex: 1,
    reason: "One follow-up is fine. Spamming creates anxiety."
  }
];

/* -----------------------------
   DOM
------------------------------ */
const startCard = document.getElementById("startCard");
const gameCard  = document.getElementById("gameCard");
const endCard   = document.getElementById("endCard");

const savedMode = document.getElementById("savedMode");
const mNoob = document.getElementById("mNoob");
const mMed  = document.getElementById("mMed");
const mHard = document.getElementById("mHard");
const playBtn = document.getElementById("playBtn");

const hudLeft = document.getElementById("hudLeft");
const hudRight = document.getElementById("hudRight");
const timeBar = document.getElementById("timeBar");

const promptEl = document.getElementById("prompt");
const contextEl = document.getElementById("context");
const feedbackEl = document.getElementById("feedback");
const tipEl = document.getElementById("tip");

const btns = [
  document.getElementById("a0"),
  document.getElementById("a1"),
  document.getElementById("a2"),
  document.getElementById("a3"),
];

const quitBtn = document.getElementById("quitBtn");
const pauseBtn = document.getElementById("pauseBtn");

const endTitle = document.getElementById("endTitle");
const endSub = document.getElementById("endSub");
const endPara = document.getElementById("endPara");
const endScore = document.getElementById("endScore");
const endMode = document.getElementById("endMode");
const endStats = document.getElementById("endStats");
const againBtn = document.getElementById("againBtn");

/* -----------------------------
   STATE
------------------------------ */
let data = getData();
let mode = data?.gameMode || data?.mode || "medium";
if (!MODES[mode]) mode = "medium";

let level = 1;
let score = 0;
let streak = 0;
let lives = MODES[mode].lives;

let roundTime = MODES[mode].baseTime;
let timer = null;
let tick = null;
let paused = false;

let currentScenario = null;
let used = new Set();

/* -----------------------------
   MODE UI
------------------------------ */
function paintMode() {
  [mNoob, mMed, mHard].forEach(b => b.classList.remove("selected"));
  if (mode === "noob") mNoob.classList.add("selected");
  if (mode === "medium") mMed.classList.add("selected");
  if (mode === "hard") mHard.classList.add("selected");
  savedMode.textContent = `Saved: ${MODES[mode].label}`;
}

function setMode(newMode) {
  mode = newMode;
  if (!MODES[mode]) mode = "medium";
  const d = getData();
  d.gameMode = mode;
  d.mode = mode; // keep consistent with quiz too
  setData(d);
  paintMode();
}

/* -----------------------------
   GAME FLOW
------------------------------ */
function startGame() {
  startCard.classList.add("hidden");
  endCard.classList.add("hidden");
  gameCard.classList.remove("hidden");

  level = 1;
  score = 0;
  streak = 0;
  lives = MODES[mode].lives;
  roundTime = MODES[mode].baseTime;
  used = new Set();
  paused = false;
  pauseBtn.textContent = "Pause";

  nextRound();
}

function nextRound() {
  if (lives <= 0) return gameOver();

  // level up every 4 correct streak OR every 6 rounds by score-ish
  // simple: if score hits thresholds, level rises
  level = 1 + Math.floor(score / 6);

  // pick a scenario not used (cycle when all used)
  if (used.size >= SCENARIOS.length) used.clear();

  let idx;
  do { idx = Math.floor(Math.random() * SCENARIOS.length); }
  while (used.has(idx));

  used.add(idx);
  currentScenario = { ...SCENARIOS[idx] };

  // In hard mode, shuffle choices so it's not pattern-recognizable
  if (mode !== "noob") shuffleScenario(currentScenario);

  renderScenario(currentScenario);
  startTimer();
}

function renderScenario(s) {
  hudLeft.textContent = `Level ${level} • Mode: ${MODES[mode].label}`;
  hudRight.textContent = `Score ${score} • ❤️ ${lives} • Streak ${streak}`;

  promptEl.textContent = s.prompt;
  contextEl.textContent = s.context;

  btns.forEach((b, i) => {
    b.disabled = false;
    b.classList.remove("selected");
    b.textContent = s.choices[i];
  });

  feedbackEl.textContent = "Pick fast…";
  tipEl.textContent = `Tip: ${TIPS[Math.floor(Math.random() * TIPS.length)]}`;

  // reset bar
  timeBar.style.width = "100%";
}

function startTimer() {
  stopTimer();

  let msLeft = roundTimeForLevel();
  const total = msLeft;

  // smooth bar
  tick = setInterval(() => {
    if (paused) return;
    msLeft -= 50;
    const pct = Math.max(0, (msLeft / total) * 100);
    timeBar.style.width = `${pct}%`;
    if (msLeft <= 0) {
      stopTimer();
      handleTimeout();
    }
  }, 50);

  // safety timeout
  timer = setTimeout(() => {
    if (paused) return;
    stopTimer();
    handleTimeout();
  }, msLeft);
}

function stopTimer() {
  if (timer) clearTimeout(timer);
  if (tick) clearInterval(tick);
  timer = null;
  tick = null;
}

function roundTimeForLevel() {
  // faster as level rises
  const base = MODES[mode].baseTime;
  const speed = Math.pow(MODES[mode].speedUp, Math.min(20, level - 1));
  const t = Math.round(base * speed);

  // Clamp so it's not impossible
  return Math.max(1400, t);
}

function handleTimeout() {
  lives -= 1;
  streak = 0;
  feedbackEl.textContent = "Too slow 😭 You lost a life.";
  hudRight.textContent = `Score ${score} • ❤️ ${lives} • Streak ${streak}`;

  disableAnswers();
  setTimeout(nextRound, 800);
}

function disableAnswers() {
  btns.forEach(b => (b.disabled = true));
}

function handleAnswer(choiceIndex) {
  stopTimer();

  const correct = (choiceIndex === currentScenario.correctIndex);

  if (correct) {
    score += 2;
    streak += 1;
    feedbackEl.textContent = `✅ Good. ${currentScenario.reason}`;
  } else {
    lives -= 1;
    streak = 0;
    score = Math.max(0, score - 1);
    feedbackEl.textContent = `❌ Nah. Healthiest was different. ${currentScenario.reason}`;
  }

  hudRight.textContent = `Score ${score} • ❤️ ${lives} • Streak ${streak}`;
  disableAnswers();
  setTimeout(nextRound, 900);
}

function gameOver() {
  stopTimer();
  gameCard.classList.add("hidden");
  endCard.classList.remove("hidden");

  // small “type” system based on score + streak
  const type = getType(score);

  endTitle.textContent = `${type.emoji} ${type.name}`;
  endSub.textContent = `You finished with Score ${score} on ${MODES[mode].label}.`;
  endPara.textContent = type.para;
  endScore.textContent = String(score);
  endMode.textContent = `Mode: ${MODES[mode].label}`;
  endStats.textContent = `Final: Level ${level} • Best streak: (tracked in your head 😭) • Lives: 0`;

  // Save
  const d = getData();
  d.lastGame = { score, mode, when: Date.now() };
  setData(d);

  // ring fill
  const ringPct = Math.max(0, Math.min(100, Math.round((score / 30) * 100)));
  const circle = document.getElementById("endCircle");
  circle.style.background = `conic-gradient(rgba(120,220,255,.95) ${ringPct}%, rgba(255,255,255,.08) 0)`;
}

function getType(s) {
  if (s <= 6) return {
    name: "Calm Learner",
    emoji: "🧘",
    para: "You’re still warming up. That’s fine. The goal isn’t perfection — it’s not spiraling over one message. Next time: slow down and pick the response that protects your peace."
  };
  if (s <= 14) return {
    name: "Soft Butterfly",
    emoji: "🦋",
    para: "You care a lot and you feel vibes deeply. That’s not a weakness. Just remember: anxiety can lie. Calm + clear beats guessing games every time."
  };
  if (s <= 22) return {
    name: "Balanced Baddie",
    emoji: "💅",
    para: "You’re pretty solid. You don’t chase too hard and you don’t blow up instantly. Keep choosing clarity and matching effort — it saves you from unnecessary stress."
  };
  return {
    name: "Clarity Boss",
    emoji: "👑",
    para: "You’re actually so good at choosing healthy responses under pressure. You don’t need to decode people — you need consistency and respect. Keep that standard."
  };
}

/* -----------------------------
   HARD MODE SHUFFLE
------------------------------ */
function shuffleScenario(s) {
  const arr = s.choices.map((text, idx) => ({ text, idx }));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  s.choices = arr.map(x => x.text);
  s.correctIndex = arr.findIndex(x => x.idx === s.correctIndex);
}

/* -----------------------------
   EVENTS
------------------------------ */
mNoob.addEventListener("click", () => setMode("noob"));
mMed.addEventListener("click", () => setMode("medium"));
mHard.addEventListener("click", () => setMode("hard"));
playBtn.addEventListener("click", startGame);

btns.forEach((b, i) => b.addEventListener("click", () => handleAnswer(i)));

quitBtn.addEventListener("click", () => {
  stopTimer();
  window.location.href = "menu.html";
});

pauseBtn.addEventListener("click", () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
  feedbackEl.textContent = paused ? "Paused." : "Pick fast…";
});

againBtn.addEventListener("click", () => {
  endCard.classList.add("hidden");
  startCard.classList.remove("hidden");
});

/* -----------------------------
   INIT
------------------------------ */
paintMode();
