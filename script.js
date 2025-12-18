
function checkAge() {
  const ageInput = document.getElementById("age");
  if (!ageInput) return; 
  const age = Number(ageInput.value);

  if (!age) {
    alert("Please enter your age.");
    return;
  }

  if (age < 18) {
    window.location.href = "under18.html";
  } else {
    window.location.href = "choose.html";
  }
}

/* =====================
   QUIZ CALCULATION
===================== */
function calculateQuiz() {
  const q1 = document.getElementById("q1") ? Number(document.getElementById("q1").value) : 0;
  const q2 = document.getElementById("q2") ? Number(document.getElementById("q2").value) : 0;
  const q3 = document.getElementById("q3") ? Number(document.getElementById("q3").value) : 0;
  const q4 = document.getElementById("q4") ? Number(document.getElementById("q4").value) : 0;
  const q5 = document.getElementById("q5") ? Number(document.getElementById("q5").value) : 0;
  const q6 = document.getElementById("q6") ? Number(document.getElementById("q6").value) : 0;

  const score = q1 + q2 + q3 + q4 + q5 + q6 + 10;

  let verdict = "";
  if(score <= 30) verdict = "🟢 Grounded thinking";
  else if(score <= 70) verdict = "🟡 A little delulu";
  else verdict = "🔴 Very delulu vibes";

  localStorage.setItem("score", score);
  localStorage.setItem("verdict", verdict);

  window.location.href = "results.html";
}

/* =====================
   IMAGE SCAN
===================== */
function scanImage() {
  const input = document.getElementById("imageUpload");
  if (!input.files || input.files.length === 0) {
    alert("Please upload an image first!");
    return;
  }

  const score = Math.floor(Math.random() * 101);
  let verdict = "";

  if(score <= 30) verdict = "🟢 Grounded thinking";
  else if(score <= 70) verdict = "🟡 A little delulu";
  else verdict = "🔴 Very delulu vibes";

  localStorage.setItem("score", score);
  localStorage.setItem("verdict", verdict);

  window.location.href = "results.html";
}

/* =====================
   DISPLAY RESULTS
===================== */
window.onload = function() {
  const scoreElem = document.getElementById("score");
  const verdictElem = document.getElementById("verdict");

  if(scoreElem && verdictElem) {
    const score = localStorage.getItem("score") || "??";
    const verdict = localStorage.getItem("verdict") || "Demo result for fun!";
    scoreElem.textContent = score;
    verdictElem.textContent = verdict;
  }
};
