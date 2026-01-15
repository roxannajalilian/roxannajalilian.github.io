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
    return "Okay this is like MAX delulu 😭 — you overanalyze hard when things feel unclear. You’re probably rereading messages, reacting to silence, and trying to get clarity through texts instead of just watching actions.";
  }

  if (percent >= 60) {
    return "You overthink pretty often, especially when replies feel off or delayed. When you don’t get clear signals, you start decoding tone/meaning instead of waiting to see if their actions stay consistent.";
  }

  // ✅ YOUR BESTFRIEND 1 PARAGRAPH VERSION (40–59%)
  if (percent >= 40) {
    return "You’re sometimes calm, sometimes detective-mode. Most of the time you’re chill, but when communication gets unclear or replies feel off, your brain starts connecting dots that aren’t fully there. It’s not constant spiraling — it’s more triggered by uncertainty, and once you step back, you usually realize you were overthinking more than the situation actually needed.";
  }

  if (percent >= 20) {
    return "You’re generally grounded, but certain situations can still trigger overthinking, especially when you don’t get clear reassurance. It’s not bad — you just need a pause before reacting.";
  }

  return "You’re honestly pretty grounded overall and you don’t let texts control your mood too much. Keep that energy.";
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

// little loading delay so it feels real
setTimeout(() => {
  loadingBox.style.display = "none";

  const data = getAppData();
  const quiz = data.lastQuiz;

  if (!quiz || typeof quiz.percent !== "number") {
    emptyBox.style.display = "block";
    return;
  }

  planBox.style.display = "block";

  planBar.style.width = `${quiz.percent}%`;
  planPercent.textContent = `${quiz.percent}%`;
  planLabel.textContent = quiz.label || "Your result";

  // ✅ set your detailed “Why you got this”
  planWhy.textContent = makeWhy(quiz.percent);

  savedAtText.textContent = quiz.savedAt
    ? `Based on your last quiz • ${formatTime(quiz.savedAt)}`
    : "";

  if (Array.isArray(quiz.actions) && quiz.actions.length) {
    renderActions(quiz.actions);
  } else {
    renderActions([
      "Ask once, then step back.",
      "Watch actions, not words.",
      "Don’t chase for clarity through texts."
    ]);
  }
}, 700);
