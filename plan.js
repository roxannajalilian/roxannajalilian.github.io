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

function fmtTime(ms){
  try {
    const d = new Date(ms);
    return d.toLocaleString();
  } catch { return ""; }
}

function showActions(actions){
  actionsGrid.innerHTML = "";
  actions.forEach(a => {
    const div = document.createElement("div");
    div.className = "quote";
    div.textContent = a;
    actionsGrid.appendChild(div);
  });
}

setTimeout(() => {
  const data = getAppData();
  const last = data.lastQuiz;

  loadingBox.style.display = "none";

  if (!last || typeof last.percent !== "number") {
    emptyBox.style.display = "block";
    return;
  }

  planBox.style.display = "block";

  planBar.style.width = `${last.percent}%`;
  planPercent.textContent = `${last.percent}%`;
  planLabel.textContent = last.label || "Your vibe";
  planWhy.textContent = last.why || "Based on your answers.";
  savedAtText.textContent = last.savedAt ? `Saved: ${fmtTime(last.savedAt)}` : "";

  const actions = Array.isArray(last.actions) && last.actions.length
    ? last.actions
    : ["Ask once, then step back.", "Watch actions, not words.", "Stop checking activity."];

  showActions(actions);
}, 700);
