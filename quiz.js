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
  // remove previous visuals
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

function finish(){
  const max = 3 * questions.length;
  const percent = Math.round((scoreNow() / max) * 100);

  const advice =
    percent >= 80 ? "MAX delulu 🚨 — stop chasing, watch actions, keep your standards." :
    percent >= 60 ? "High delulu — pause before replying, don’t double-text, ask once." :
    percent >= 40 ? "Half-delulu 😭 — don’t fill silence with stories, get clarity." :
    percent >= 20 ? "Slight overthink — focus on patterns, not one message." :
                    "Super grounded ✅ — stay calm and consistent.";

  const data = getAppData();
  data.lastQuiz = { percent, answers, savedAt: Date.now() };
  setAppData(data);

  resultArea.style.display = "block";
  bar.style.width = `${percent}%`;
  percentText.textContent = `${percent}%`;
  adviceText.textContent = advice;
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

    // ✅ show the color instantly
    btn.classList.add("tap");
    highlightSelected();

    // move forward after tiny delay so user sees it
    setTimeout(() => next(), 160);
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
