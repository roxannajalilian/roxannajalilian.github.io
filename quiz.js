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

function getData(){
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch(e){ return {}; }
}
function setData(d){
  localStorage.setItem(KEY, JSON.stringify(d));
}

// fun type paragraph (your butterfly thing)
function getPersona(percent){
  if (percent <= 25) {
    return {
      name: "Butterfly 🦋",
      paragraph: "You’re a Butterfly because you’re naturally light-minded and grounded — you notice little details, but you don’t let one message control your whole mood. You can handle uncertainty better than most people."
    };
  }
  if (percent <= 50) {
    return {
      name: "Glow-Worm ✨",
      paragraph: "You’re a Glow-Worm because you overthink sometimes, especially when the vibe feels unclear. You’re sensitive and observant — not dramatic — your brain just wants certainty and reassurance."
    };
  }
  if (percent <= 75) {
    return {
      name: "Detective 🔎",
      paragraph: "You’re a Detective because you read between the lines a LOT. You notice timing, tone, and tiny changes, and your mind tries to solve the situation fast — even before you have proof."
    };
  }
  return {
    name: "Storm Cloud ⛈️",
    paragraph: "You’re a Storm Cloud because when you’re anxious, your brain fills in the blanks with worst-case stories. It doesn’t mean you’re crazy — it means your nervous system needs calm before you interpret the situation."
  };
}

function renderQuestion() {
  if (!qText || !progressText || !progressFill || !backBtn || !nextBtn) {
    alert("Quiz HTML IDs don't match quiz.js. Make sure questionText/progressText/progressFill/backBtn/nextBtn exist.");
    return;
  }

  qText.textContent = questions[current];
  progressText.textContent = `Question ${current + 1} of ${questions.length}`;
  progressFill.style.width = `${((current + 1) / questions.length) * 100}%`;

  answerButtons.forEach(btn => {
    btn.classList.remove("selected");
    if (Number(btn.dataset.value) === answers[current]) btn.classList.add("selected");
  });

  backBtn.disabled = current === 0;
  nextBtn.textContent = current === questions.length - 1 ? "Finish" : "Next";
}

answerButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    answers[current] = Number(btn.dataset.value);
    answerButtons.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
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
    alert("Pick an answer before continuing.");
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

  let tier;
  if (percentage <= 25) tier = "Low overthinking";
  else if (percentage <= 50) tier = "Mild overthinking";
  else if (percentage <= 75) tier = "High overthinking";
  else tier = "Very high overthinking";

  const persona = getPersona(percentage);

  // SAVE ONLY FINAL RESULT (NOT answers)
  const data = getData();
  data.quizResult = {
    percentage,
    tier,
    personaName: persona.name,
    personaParagraph: persona.paragraph,
    savedAt: new Date().toISOString()
  };
  setData(data);

  // reset in-memory so when they come back it's fresh
  current = 0;
  answers = new Array(questions.length).fill(null);

  location.href = "loading.html";
}

// ALWAYS start fresh when opening quiz
current = 0;
answers = new Array(questions.length).fill(null);
renderQuestion();
