requireAdult("quiz.html");

const questions = [
  { q: "Do you reread texts to find hidden meaning?", h: "Searching for clues in one word." },
  { q: "Do you assume silence means they’re mad?", h: "No reply = panic." },
  { q: "Do you overthink punctuation (… / lol / k)?", h: "Dot dot dot trauma." },
  { q: "Do you check activity for hints?", h: "Detective mode." },
  { q: "Do you type/delete/retype a reply a lot?", h: "Pressure to be perfect." },
  { q: "Do you double-text because you feel ignored?", h: "Chase mode." },
  { q: "Do you replay the convo in your head for hours?", h: "Looping thoughts." },
  { q: "Do you ignore signs because you want it to work?", h: "Hope goggles." },
  { q: "Does your mood depend on their reply?", h: "High/low based on texts." },
  { q: "Do you excuse disrespect (dry/rude/disappearing)?", h: "Bare minimum defense." }
];

let idx = 0;
const answers = new Array(questions.length).fill(null);

const qCount = document.getElementById("qCount");
const progressBadge = document.getElementById("progressBadge");
const questionText = document.getElementById("questionText");
const questionHint = document.getElementById("questionHint");
const prevBtn = document.getElementById("prevBtn");
const restartBtn = document.getElementById("restartBtn");

const resultArea = document.getElementById("resultArea");
const bar = document.getElementById("bar");
const percentText = document.getElementById("percentText");
const adviceText = document.getElementById("adviceText");
const debug = document.getElementById("debug");

const choiceButtons = Array.from(document.querySelectorAll("button[data-val]"));

function answeredCount(){ return answers.filter(v => v !== null).length; }
function scoreNow(){ return answers.reduce((s,v) => s + (v ?? 0), 0); }

function highlightSelected() {
  choiceButtons.forEach(btn => {
    btn.classList.remove("selected","sel-0","sel-1","sel-2","sel-3","tap");
  });

  const val = answers[idx];
  if (val === null) return;

  const match = choiceButtons.find(b => Number(b.dataset.val) === val);
  if (!match) return;

  match.classList.add("selected", `sel-${val}`);
}

function render(){
  qCount.textContent = `Question ${idx + 1}/${questions.length}`;
  progressBadge.textContent = `${Math.round((answeredCount() / questions.length) * 100)}% done`;

  questionText.textContent = questions[idx].q;
  questionHint.textContent = questions[idx].h;

  prevBtn.disabled = idx === 0;
  resultArea.style.display = "none";
  debug.style.display = "none";

  highlightSelected();
}

function buildAdvice(percent){
  if (percent >= 85) {
    return {
      label: "MAX Delulu 🚨",
      why: "You’re reading into EVERYTHING and chasing clarity through texts.",
      do: [
        "Stop double-texting. Ask once, then wait.",
        "Mute/limit checking activity (views/snaps/followers) for 24 hours.",
        "If they’re inconsistent: match energy or walk."
      ]
    };
  }
  if (percent >= 65) {
    return {
      label: "High Delulu",
      why: "You spiral fast when there’s silence and try to “fix” it by replying more.",
      do: [
        "Write the message, WAIT 10 minutes, then decide.",
        "Only respond to clear effort, not crumbs.",
        "Get one direct answer instead of decoding tone."
      ]
    };
  }
  if (percent >= 45) {
    return {
      label: "Half-Delulu 😭",
      why: "You’re sometimes calm, sometimes detective-mode.",
      do: [
        "Focus on patterns (days/weeks), not one reply.",
        "If you feel anxious: do NOT text — do something else for 20 minutes.",
        "Ask a simple clarity question, then step back."
      ]
    };
  }
  if (percent >= 25) {
    return {
      label: "Slight Overthink",
      why: "You overanalyze sometimes, but you can still stay grounded.",
      do: [
        "Don’t treat punctuation like evidence.",
        "Decide your standard: effort + respect + consistency.",
        "If it’s confusing, it’s a signal."
      ]
    };
  }
  return {
    label: "Grounded ✅",
    why: "You’re not letting texts control your mood too much.",
    do: [
      "Keep your standards.",
      "If they go dry/disrespectful: you don’t beg.",
      "Communicate directly, not through guessing games."
    ]
  };
}

function finish(){
  const max = 3 * questions.length;
  const percent = Math.round((scoreNow() / max) * 100);

  const pack = buildAdvice(percent);

  const data = getAppData();
  data.lastQuiz = {
    percent,
    answers,
    savedAt: Date.now(),
    label: pack.label,
    why: pack.why,
    actions: pack.do
  };
  setAppData(data);

  resultArea.style.display = "block";
  bar.style.width = `${percent}%`;
  percentText.textContent = `${percent}% — ${pack.label}`;
  adviceText.textContent = pack.why;
}

function next(){
  if (idx >= questions.length - 1) {
    const firstUnanswered = answers.findIndex(v => v === null);
    if (firstUnanswered !== -1) {
      idx = firstUnanswered;
      render();
      debug.textContent = "Answer the skipped question before finishing.";
      debug.style.display = "block";
      return;
    }
    finish();
    return;
  }
  idx++;
  render();
}

choiceButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const val = Number(btn.dataset.val);
    answers[idx] = val;

    btn.classList.add("tap");
    highlightSelected();

    setTimeout(() => next(), 180);
  });
});

prevBtn.addEventListener("click", () => {
  if (idx > 0) { idx--; render(); }
});

restartBtn.addEventListener("click", () => {
  for (let i = 0; i < answers.length; i++) answers[i] = null;
  idx = 0;
  render();
});

render();
