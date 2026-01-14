const APP_KEY = "dd_app_v1";

function getAppData(){
  try { return JSON.parse(localStorage.getItem(APP_KEY) || "{}"); }
  catch { return {}; }
}

function requireVerifiedOrGoStart(){
  const d = getAppData();
  if (!d.age || Number(d.age) < 18) {
    window.location.replace("index.html?stay=1");
  }
}

function wireReset(){
  const btn = document.getElementById("resetAll");
  if (!btn) return;

  btn.addEventListener("click", () => {
    localStorage.removeItem(APP_KEY);
    window.location.replace("index.html?stay=1");
  });
}

function showLastScore(){
  const el = document.getElementById("lastScore");
  if (!el) return;

  const d = getAppData();
  const last = d.lastQuiz;

  if (!last) {
    el.textContent = "No quiz score yet — take the quiz to generate a plan.";
    return;
  }

  const when = new Date(last.savedAt || Date.now());
  const dateText = isNaN(when.getTime()) ? "" : ` • saved ${when.toLocaleString()}`;

  el.textContent = `Last quiz: ${last.percent}%${dateText}`;
}

requireVerifiedOrGoStart();
wireReset();
showLastScore();
