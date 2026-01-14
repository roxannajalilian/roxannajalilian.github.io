const APP_KEY = "dd_app_v1";
function getAppData(){ try { return JSON.parse(localStorage.getItem(APP_KEY) || "{}"); } catch { return {}; } }
function setAppData(data){ localStorage.setItem(APP_KEY, JSON.stringify(data)); }

const questions = [
  { q: "Do you reread texts to find hidden meaning?", h: "Like searching for clues in one word." },
  { q: "Do you assume silence means they’re mad or losing interest?", h: "No reply = panic." },
  { q: "Do you overthink punctuation (… / lol / k)?", h: "Dot dot dot trauma." },
  { q: "Do you check activity (views, snaps, followers) for hints?", h: "Detective mode." },
  { q: "Do you type a reply, delete it, retype it 10 times?", h: "Pressure to be perfect." },
  { q: "Do you double-text because you feel ignored?", h: "Chase mode." },
  { q: "Do you replay the convo in your head for hours?", h: "Looping thoughts." },
  { q: "Do you ignore obvious signs because you want it to work?", h: "Hope goggles." },
  { q: "Does your mood depend on their reply?", h: "High/low based on texts." },
  { q: "Do you excuse disrespect (dry, rude, disappearing)?", h: "Bare minimum defense." }
];

// state
let i = 0;
const answers = new Array(questions.length).fill(null); // store vals per question

// DOM
const qCount = document.getElementById("qCount");
const progressBadge = document.getElementById("progressBadge");
const questionText = document.getElementById("questionText");
const questionHint = document.getElementById("questionHint");

const resultArea = document.getElementById("resultArea");
const bar = document.getElementById("bar");
const percentText = document.getElementById("percentText");
const adviceText = document.getElementById("adviceText");
const rangeLabelEl = document.getElementById("rangeLabel");
const examplesBoxEl = document.getElementById("examplesBox");

const prevBtn = document.getElementById("prevBtn");
const restartQuiz = document.getElementById("restartQuiz");
const restartBtnTop = document.getElementById("restartBtnTop");

function countAnswered(){
  return answers.filter(v => v !== null).length;
}

function currentScore(){
  // recompute from answers so "Previous" works correctly
  return answers.reduce((sum, v) => sum + (v ?? 0), 0);
}

function getRangeInfo(percent){
  if (percent <= 20){
    return {
      label: "0–20% • Super grounded ✅",
      examples: [
        "You don’t assume tone from one word.",
        "You don’t chase for replies.",
        "You keep your mood steady even if they’re slow."
      ],
      advice: "Keep doing you. If something feels off, ask once and watch actions."
    };
  }
  if (percent <= 40){
    return {
      label: "21–40% • Slight overthink",
      examples: [
        "You analyze a bit sometimes (timing, tone).",
        "You still keep control most of the time.",
        "You want clarity but don’t fully spiral."
      ],
      advice: "Don’t read into small stuff. Look at patterns over time."
    };
  }
  if (percent <= 60){
    return {
      label: "41–60% • Half-delulu 😭",
      examples: [
        "You reread texts and overthink silence.",
        "You feel tempted to double-text.",
        "You start guessing instead of asking."
      ],
      advice: "Ask one clear question then stop. No chasing. Match energy."
    };
  }
  if (percent <= 80){
    return {
      label: "61–80% • High delulu (spiral risk)",
      examples: [
        "Your mood depends on their replies.",
        "You ignore red flags because you want it to work.",
        "You overthink punctuation/response time hard."
      ],
      advice: "Pause before replying. One message max. If it’s inconsistent, detach."
    };
  }
  return {
    label: "81–100% • MAX delulu 🚨",
    examples: [
      "Detective mode 24/7.",
      "Chasing clarity from someone inconsistent.",
      "Forgiving disrespect / bare minimum."
    ],
    advice: "Stop chasing. Protect your dignity. Watch actions, not words."
  };
}

function render(){
  const done = countAnswered();
  qCount.textContent = `Question ${i+1}/${questions.length}`;
  progressBadge.textContent = `${Math.round((done/questions.length)*100)}% done`;

  questionText.textContent = questions[i].q;
  questionHint.textContent = questions[i].h;

  prevBtn.disabled = (i === 0);

  // hide results while taking quiz
  resultArea.style.display = "none";
}

function finish(){
  const max = 3 * questions.length;
  const score = currentScore();
  const percent = Math.round((score / max) * 100);
  const info = getRangeInfo(percent);

  // Save for Plan
  const data = getAppData();
  data.lastQuiz = { percent, answers, savedAt: Date.now(), rangeLabel: info.label };
  setAppData(data);

  // show
  resultArea.style.display = "block";
  bar.style.width = `${percent}%`;
  percentText.textContent = `${percent}% • ${info.label}`;
  adviceText.textContent = info.advice;

  if (rangeLabelEl) rangeLabelEl.textContent = info.label;
  if (examplesBoxEl){
    examplesBoxEl.innerHTML = `
      <h3 style="margin:0 0 8px;">What this score looks like</h3>
      <ul style="margin:0; padding-left:18px;">
        ${info.examples.map(e => `<li>${e}</li>`).join("")}
      </ul>
    `;
  }
}

function goNext(){
  // if reached end and all answered, finish
  if (i >= questions.length - 1){
    // If user skipped somehow, force to last unanswered
    const firstUnanswered = answers.findIndex(v => v === null);
    if (firstUnanswered !== -1){
      i = firstUnanswered;
      render();
      return;
    }
    finish();
    return;
  }
  i++;
  render();
}

document.querySelectorAll("button[data-val]").forEach(btn => {
  btn.addEventListener("click", () => {
    const val = Number(btn.dataset.val);
    answers[i] = val;
    goNext();
  });
});

prevBtn.addEventListener("click", () => {
  if (i > 0) i--;
  render();
});

function restartAll(){
  for (let k=0;k<answers.length;k++) answers[k] = null;
  i = 0;
  if (examplesBoxEl) examplesBoxEl.innerHTML = "";
  if (rangeLabelEl) rangeLabelEl.textContent = "";
  render();
}

restartQuiz.addEventListener("click", restartAll);
restartBtnTop.addEventListener("click", restartAll);

render();
