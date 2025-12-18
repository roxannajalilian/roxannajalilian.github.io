/* =====================
   AGE VERIFICATION
===================== */
function checkAge() {
  const ageInput = document.getElementById("age");
  if (!ageInput) return; // Skip if element doesn't exist on this page
  const age = Number(ageInput.value);

  if (!age) {
    alert("Please enter your age.");
    return;
  }

  if (age < 18) {
    window.location.href = "under18.html";
  } else {
    window.location.href = "privacy.html";
  }
}

/* =====================
   QUIZ CALCULATION
===================== */
function calculateQuiz() {
  const q1 = document.getElementById("q1") ? Number(document.getElementById("q1").value) : 0;
  const q2 = document.getElementById("q2") ? Number(document.getElementById("q2").value) : 0;
  const q3 = document.getElementById("q3") ? Number(document.getElementById("q3").value) : 0;

  const score = q1 + q2 + q3 + 10; // simple scoring

  let verdict = "";
  if(score <= 30) verdict = "🟢 Grounded thinking";
  else if(score <= 70) verdict = "🟡 A little delulu";
  else verdict = "🔴 Very delulu vibes";

  // Store in localStorage to show on results page
  localStorage.setItem("score", score);
  localStorage.setItem("verdict", verdict);

  // Redirect to results page
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
    scoreElem.textContent =
