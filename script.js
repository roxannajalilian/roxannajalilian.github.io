let failedAttempts = 0;

function goTo(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function checkAge() {
  const age = Number(document.getElementById("ageInput").value);

  if (!age) {
    alert("Please enter your age.");
    return;
  }

  if (age >= 18) {
    goTo("scanner");
  } else {
    goTo("quiz");
  }
}

function analyzeText() {
  const text = document.getElementById("textInput").value.toLowerCase();
  if (text.length < 10) {
    alert("Enter more text.");
    return;
  }

  let score = 10;
  const triggers = [
    "meant to be",
    "definitely loves me",
    "everything is a sign",
    "the universe",
    "no other explanation"
  ];

  triggers.forEach(t => {
    if (text.includes(t)) score += 15;
  });

  if (text.includes("!!!") || text.includes("???")) score += 5;
  if (text.length > 300) score += 10;
  if (score > 100) score = 100;

  showResults(score);
}

function calculateQuiz() {
  const score =
    Number(q1.value) +
    Number(q2.value) +
    Number(q3.value) +
    10;

  showResults(score);
}

function showResults(score) {
  let verdict = "";

  if (score <= 30) verdict = "🟢 Grounded";
  else if (score <= 70) verdict = "🟡 A little delulu";
  else verdict = "🔴 Fully delulu";

  document.getElementById("score").innerText = score;
  document.getElementById("verdict").innerText = verdict;
  goTo("results");
}
