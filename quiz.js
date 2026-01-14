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

let i = 0;
let score = 0;
const answers = [];

const qCount = document.getElementById("qCount");
const questionText = document.getElementById("questionText");
const questionHint = document.getElementById("questionHint");
const resultArea = document.getElementById("resultArea");
const bar = document.getElementById("bar");
const percentText = document.getElementById("percentText");
const adviceText = document.getElementById("adviceText");
const restartQuiz = document.getElementById("restartQuiz");

// OPTIONAL (but recommended): add these IDs in quiz.html if you want nicer output
// <p class="muted" id="rangeLabel"></p>
// <div class="item" id="examplesBox"></div>
const rangeLabelEl = document.getElementById("rangeLabel");
const examplesBoxEl = document.getElementById("examplesBox");

function render(){
  qCount.textContent = `Question ${i+1}/${questions.length}`;
  questionText.textContent = questions[i].q;
  questionHint.textContent = questions[i].h;
}

function getRangeInfo(percent){
  // More “percentage examples” / what it looks like
  if (percent <= 20){
    return {
      label: "0–20% • Super grounded ✅",
      examples: [
        "You don’t assume tone from one word.",
        "You don’t chase for replies.",
        "You keep your mood steady even if they’re slow."
      ],
      advice: "Keep doing what you’re doing. If something feels off, ask once and watch actions."
    };
  }
  if (percent <= 40){
    return {
      label: "21–40% • Slight overthink",
      examples: [
        "You think about texts a bit too much sometimes.",
        "You might analyze ‘lol’ or ‘k’ sometimes.",
        "You want clarity but you don’t fully spiral."
      ],
      advice: "You’re fine—just don’t read into small stuff. Focus on consistency over single messages."
    };
  }
  if (percent <= 60){
    return {
      label: "41–60% • Half-delulu 😭",
      examples: [
        "You re-check chats for hidden meaning.",
        "You feel tempted to double-text.",
        "Silence makes you overthink."
      ],
      advice: "Get clarity ONCE. Don’t chase. Match energy and stop filling the silence with paragraphs."
    };
  }
  if (percent <= 80){
    return {
      label: "61–80% • High delulu (spiral risk)",
      examples: [
        "Your mood changes based on their reply.",
        "You ignore red flags because you want it to work.",
        "You overthink punctuation or response time hard."
      ],
      advice: "Pause before replying. Don’t send essays. If it’s inconsistent, detach and protect your dignity."
    };
  }
  return {
    label: "81–100% • MAX delulu 🚨",
    examples: [
      "You’re in detective mode 24/7.",
      "You chase clarity from someone who won’t give it.",
      "You keep forgiving disrespect / dry energy."
    ],
    advice: "Stop chasing. One message max. If they don’t show effort, step back and focus on yourself."
  };
}

function finish(){
  const max = 3 * questions.length;
  const percent = Math.round((score / max) * 100);

  const info = getRangeInfo(percent);

  // Save for Plan page (same format)
  const data = getAppData();
  data.lastQuiz = { percent, answers, savedAt: Date.now(), rangeLabel: info.label };
  setAppData(data);

  // Show UI
  resultArea.style.display = "block";
  qCount.textContent = "Done ✅";
  questionText.textContent = "Your result is ready";
  questionHint.textContent = "Saved for your Plan.";

  bar.style.width = `${percent}%`;
  percentText.textContent = `${percent}% • ${info.label}`;
  adviceText.textContent = info.advice;

  // Extra examples (only if the elements exist in quiz.html)
  if (rangeLabelEl) rangeLabelEl.textContent = info.label;

  if (examplesBoxEl){
    examplesBoxEl.innerHTML = `
      <h3 style="margin:0 0 8px;">What this score looks like</h3>
      <ul style="margin:0; padding-left:18px;">
        ${info.examples.map(e => `<li>${e}</li>`).join("")}
      </ul>
    `;
  }

  // Disable answer buttons
  document.querySelectorAll("button[data-val]").forEach(b => b.disabled = true);
}

document.querySelectorAll("button[data-val]").forEach(btn => {
  btn.addEventListener("click", () => {
    const val = Number(btn.dataset.val);
    score += val;
    answers.push(val);

    i++;
    if(i >= questions.length) finish();
    else render();
  });
});

restartQuiz.addEventListener("click", () => {
  i = 0;
  score = 0;
  answers.length = 0;
  resultArea.style.display = "none";
  document.querySelectorAll("button[data-val]").forEach(b => b.disabled = false);

  // Clear optional extra UI
  if (rangeLabelEl) rangeLabelEl.textContent = "";
  if (examplesBoxEl) examplesBoxEl.innerHTML = "";

  render();
});

render();
