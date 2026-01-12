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

function renderQuestion() {
  qText.textContent = questions[current];
  progressText.textContent = `Question ${current + 1} of ${questions.length}`;
  progressFill.style.width = `${((current + 1) / questions.length) * 100}%`;

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

function finishQuiz() {
  const totalScore = answers.reduce((a, b) => a + b, 0);
  const maxScore = questions.length * 3;
  const percentage = Math.round((totalScore / maxScore) * 100);

  let tier, explanation, advice;

  if (percentage <= 25) {
    tier = "Low overthinking";
    explanation = "You generally interpret situations realistically and don’t jump to conclusions.";
    advice = "Keep trusting patterns over single messages. You’re doing well staying grounded.";
  } else if (percentage <= 50) {
    tier = "Mild overthinking";
    explanation = "You sometimes overthink, especially in uncertain situations.";
    advice = "When you feel anxious, pause and ask yourself whether you have real evidence.";
  } else if (percentage <= 75) {
    tier = "High overthinking";
    explanation = "You often read into messages and assume meanings that may not be there.";
    advice = "Try delaying responses and focus more on actions than words.";
  } else {
    tier = "Very high overthinking";
    explanation = "Your thoughts are frequently driven by anxiety rather than facts.";
    advice = "Create space before reacting and seek clarity instead of reassurance.";
  }

  const data = getData();
  data.quizResult = {
    percentage,
    tier,
    explanation,
    advice
  };
  setData(data);

  window.location.href = "result.html";
}

renderQuestion();
