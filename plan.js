requireAdult("plan.html");

const loadingBox = document.getElementById("loadingBox");
const emptyBox = document.getElementById("emptyBox");
const planBox = document.getElementById("planBox");

const planBar = document.getElementById("planBar");
const planPercent = document.getElementById("planPercent");
const planLabel = document.getElementById("planLabel");
const planWhy = document.getElementById("planWhy");
const savedAtText = document.getElementById("savedAtText");
const actionsGrid = document.getElementById("actionsGrid");

function formatTime(ms){
  const d = new Date(ms);
  return d.toLocaleString();
}

function makeWhy(percent){
  if (percent >= 80) {
    return "You overanalyze heavily when things feel unclear. You tend to chase clarity through texts, reread messages, and react emotionally to silence or mixed signals.";
  }
  if (percent >= 60) {
    return "You overthink fairly often, especially when replies feel off or delayed. Uncertainty makes you start decoding tone and meaning instead of waiting for actions.";
  }
  if (percent >= 40) {
    return "You’re sometimes calm, sometimes detective-mode. When communication isn’t clear, you start filling in gaps instead of trusting patterns.";
  }
  if (percent >= 20) {
    return "You generally stay grounded, but certain situations can trigger overthinking. This usually happens when you don’t get direct reassurance.";
  }
  return "You stay pretty grounded overall and don’t let texts control your emotions too much.";
}

function renderActions(list){
  actionsGrid.innerHTML = "";
  list.forEach(text => {
    const div = document.createElement("div");
    div.className = "quote";
    div.textContent = text;
    actionsGrid.appendChild(div);
  });
}

// Simulate loading so it feels real
setTimeout(() => {
  loadingBox.style.display = "none";

  const data = getAppData();
  const quiz = data.lastQuiz;

  if (!quiz || typeof quiz.percent !== "number") {
    emptyBox.style.display = "block";
    return;
  }

  planBox.style.display = "block";

  // Score
  planBar.style.width = `${quiz.percent}%`;
  planPercent.textContent = `${quiz.percent}%`;
  planLabel.textContent = quiz.label || "Your result";

  // WHY YOU GOT THIS (THIS IS WHAT YOU WANTED)
  planWhy.textContent = makeWhy(quiz.percent);

  // Meta
  savedAtText.textContent = quiz.savedAt
    ? `Based on your last quiz (${formatTime(quiz.savedAt)})`
    : "";

  // Actions
  if (Array.isArray(quiz.actions) && quiz.actions.length) {
    renderActions(quiz.actions);
  } else {
    renderActions([
      "Ask once, then step back.",
      "Watch actions, not words.",
      "Stop checking for hidden meaning."
    ]);
  }
}, 700);
