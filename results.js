// results.js (used by loading.html)
requireAdultOrRedirect();

const data = getData();
if (!data.quizResult) {
  // If someone hits loading directly, send to quiz.
  window.location.href = "quiz.html";
}

const num = document.getElementById("num");
let shown = 0;
const target = data.quizResult ? data.quizResult.percentage : 0;

const timer = setInterval(() => {
  shown += Math.max(1, Math.round((target - shown) * 0.18));
  if (shown >= target) {
    shown = target;
    clearInterval(timer);
    setTimeout(() => {
      window.location.href = "results.html";
    }, 600);
  }
  if (num) num.textContent = shown + "%";
}, 80);
