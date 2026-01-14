const APP_KEY = "dd_app_v1";

function getAppData(){
  try { return JSON.parse(localStorage.getItem(APP_KEY) || "{}"); }
  catch { return {}; }
}
function setAppData(data){
  localStorage.setItem(APP_KEY, JSON.stringify(data));
}

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

function render(){
  qCount.textContent = `Question ${i+1}/${questions.length}`;
  questionText.textContent = questions[i].q;
  questionHint.textContent = questions[i].h;
}

function finish(){
  const max = 3 * questions.length;
  const percent = Math.round((score / max) * 100);

  let advice =
    percent >= 75
      ? "You’re spiraling hard 😭. Pause, don’t chase, ask once, then step back."
      : percent >= 45
      ? "You’re half-delulu. Get clarity and stop filling the silence."
      : "You’re pretty grounded. Keep it calm and watch patterns.";

  const data = getAppData();
  data.lastQuiz = { percent, answers, savedAt: Date.now() };
  setAppData(data);

  resultArea.style.display = "block";
  qCount.textContent = "Done ✅";
  questionText.textContent = "Your result is ready";
  questionHint.textContent = "Saved for your Plan.";

  bar.style.width = `${percent}%`;
  percentText.textContent = `${percent}%`;
  adviceText.textContent = advice;

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
  render();
});

render();
