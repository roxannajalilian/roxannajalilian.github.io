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

  // Profiles (same tone, more custom, less AI)
  const profiles = [
    {
      max: 25,
      tier: "Low overthinking",
      vibe: "🧊 Ice Queen (Calm Brain)",
      explain1: "You’re honestly pretty grounded. Even if something feels off, you don’t let one text control your whole mood. You’re good at not jumping to conclusions and you don’t need constant reassurance to feel okay.",
      explain2: "You notice things, but you don’t spiral. You’re more like “I’ll see what happens” instead of stressing yourself out. That’s a flex tbh.",
      advice: "Keep trusting patterns, not one message. If you’re confused, ask once and keep it moving.",
      why: "You’ve probably learned that overthinking doesn’t actually fix anything, so you don’t waste energy on it."
    },
    {
      max: 50,
      tier: "Mild overthinking",
      vibe: "🌙 Soft Thinker",
      explain1: "You’re actually pretty emotionally aware. When things aren’t clear, you just feel it more. If the vibe changes or replies get slower, your brain automatically starts connecting dots.",
      explain2: "You don’t jump straight to worst-case scenarios, but you do replay things and reread messages, wondering if you messed something up. It’s not drama — you just want clarity so you can relax again. This really just means you care and you’re sensitive to changes. You’re not delulu. You just need clear communication to feel settled.",
      advice: "When you feel yourself starting to think too much, pause and ask: “Do I have proof or just vibes?” Then send ONE calm message if you need to.",
      why: "You’re the type who reads the room fast, so when the room is confusing, your brain tries to fill in the missing parts."
    },
    {
      max: 75,
      tier: "High overthinking",
      vibe: "🦋 Butterfly (Sensitive + Deep)",
      explain1: "Okay butterfly… you feel everything. If someone replies dry, takes longer than usual, or the vibe changes even a little, you notice it right away. Your brain doesn’t do “wait and see” — it does “wait and panic” 😭",
      explain2: "You care a lot, so you start trying to figure out what they meant, what you did, and what’s gonna happen next. It’s not because you’re crazy — it’s because you don’t like feeling unsure and you want things to be okay.",
      advice: "Do not react in the moment. Put your phone down for 10–20 minutes, then come back. If you still feel weird, ask something simple like “Are we good?” and stop there.",
      why: "You’re probably really loyal once you care, so your brain treats uncertainty like a threat."
    },
    {
      max: 100,
      tier: "Very high overthinking",
      vibe: "🔥 Delulu Detective (Spiral Mode)",
      explain1: "Not gonna lie… your brain turns into a whole detective sometimes. One “ok” can feel like a breakup. If someone’s energy changes, you start replaying everything, checking timing, and trying to figure out the “real meaning.”",
      explain2: "When you don’t get clarity fast, your thoughts get loud. You might over-explain, double text, or keep checking if they’re mad — not because you’re weak, but because you’re anxious and you want the tension to go away.",
      advice: "Emergency rule: don’t text when you’re panicking. Calm down first (water, breathe, walk, anything). Then send ONE clear message like “Are we good?” and leave it.",
      why: "You probably hate not knowing where you stand, so your brain tries to solve it instantly… even when it can’t."
    }
  ];

  const p = profiles.find(x => percentage <= x.max) || profiles[profiles.length - 1];

  // Save result (keep old fields too so your other pages won't break)
  const data = getData();
  data.quizResult = {
    percentage,
    tier: p.tier,
    vibe: p.vibe,

    // NEW: richer, less-AI copy
    explain1: p.explain1,
    explain2: p.explain2,
    advice: p.advice,
    why: p.why,

    // Backwards compat (some pages might read "explanation")
    explanation: p.explain1,

    at: new Date().toISOString()
  };
  setData(data);

  pillSave.textContent = "Saved ✓";
  pillSave.style.borderColor = "rgba(83,255,214,.55)";

  window.location.href = "loading.html";
}

renderQuestion();
