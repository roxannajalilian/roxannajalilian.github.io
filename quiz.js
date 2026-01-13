const KEY = "delulu_data_v1";

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
  "I overthink even when nothing is clearly wrong."
];

let current = 0;
let answers = new Array(questions.length).fill(null);

const qText = document.getElementById("questionText");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const answerButtons = document.querySelectorAll(".answer");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");

// ---- storage helpers (only save final result, NOT answers) ----
function getData(){
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch(e){ return {}; }
}
function setData(d){
  localStorage.setItem(KEY, JSON.stringify(d));
}

// ---- quiz UI ----
function renderQuestion() {
  qText.textContent = questions[current];
  progressText.textContent = `Question ${current + 1} of ${questions.length}`;
  progressFill.style.width = `${((current + 1) / questions.length) * 100}%`;

  // highlight selected
  answerButtons.forEach(btn => {
    btn.classList.remove("selected");
    if (Number(btn.dataset.value) === answers[current]) {
      btn.classList.add("selected");
    }
  });

  backBtn.disabled = current === 0;
  nextBtn.textContent = current === questions.length - 1 ? "Finish" : "Next";
}

answerButtons.forEach(btn => {
  btn.onclick = () => {
    answers[current] = Number(btn.dataset.value);
    answerButtons.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
  };
});

backBtn.onclick = () => {
  if (current > 0) {
    current--;
    renderQuestion();
  }
};

nextBtn.onclick = () => {
  if (answers[current] === null) {
    alert("Please select an answer before continuing.");
    return;
  }

  if (current < questions.length - 1) {
    current++;
    renderQuestion();
  } else {
    finishQuiz();
  }
};

// ---- fun personality type ----
function funTypeFromPercent(p){
  if (p <= 25) return { name:"Butterfly Brain 🦋", blurb:"You’re chill and grounded — you notice details, but you don’t spiral hard." };
  if (p <= 50) return { name:"Glow-Worm Thinker ✨", blurb:"You overthink sometimes, usually when things feel uncertain. You’re sensitive, not dramatic." };
  if (p <= 75) return { name:"Detective Mode 🔎", blurb:"You read between the lines a LOT. Your brain wants answers immediately." };
  return { name:"Storm Cloud Spiral ⛈️", blurb:"When you’re anxious, your mind fills in the blanks with worst-case stories. You need calm first." };
}

// ---- final scoring + save ONLY summary ----
function finishQuiz() {
  const totalScore = answers.reduce((a, b) => a + b, 0);
  const maxScore = questions.length * 3;
  const percentage = Math.round((totalScore / maxScore) * 100);

  let tier;
  if (percentage <= 25) tier = "Low overthinking";
  else if (percentage <= 50) tier = "Mild overthinking";
  else if (percentage <= 75) tier = "High overthinking";
  else tier = "Very high overthinking";

  const fun = funTypeFromPercent(percentage);

  const data = getData();
  data.quizResult = {
    percentage,
    tier,
    funType: fun.name,
    funBlurb: fun.blurb,
    savedAt: new Date().toISOString()
  };
  setData(data);

  // IMPORTANT: clear in-memory answers so if they come back it's fresh
  current = 0;
  answers = new Array(questions.length).fill(null);

  // go to loading -> results
  location.href = "loading.html";
}

// ---- ALWAYS reset when opening quiz page ----
function resetQuizFresh(){
  current = 0;
  answers = new Array(questions.length).fill(null);
}
resetQuizFresh();
renderQuestion();
