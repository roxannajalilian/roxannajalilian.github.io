const KEY = "delulu_data_v1";

function getData() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch (e) { return {}; }
}

function saveHistory(entry){
  const d = getData();
  d.quizHistory = Array.isArray(d.quizHistory) ? d.quizHistory : [];
  d.quizHistory.unshift(entry);
  d.quizHistory = d.quizHistory.slice(0, 20);
  localStorage.setItem(KEY, JSON.stringify(d));
}

function $(id){ return document.getElementById(id); }

const scoreEl = $("scoreNumber");
const tierEl = $("tierText");
const personaEl = $("personaText");
const whyEl = $("whyText");
const adviceEl = $("adviceText");
const ringEl = $("ring");          // optional
const barEl  = $("barFill");       // optional
const saveBtn = $("saveBtn");

const data = getData();
const r = data.quizResult;

// If nothing saved, show a friendly message + send to quiz
if (!r || typeof r.percentage !== "number") {
  if (scoreEl) scoreEl.textContent = "--%";
  if (tierEl) tierEl.textContent = "No quiz result found.";
  if (personaEl) personaEl.textContent = "Take the quiz first, then come back here.";
  if (whyEl) whyEl.textContent = "";
  if (adviceEl) adviceEl.textContent = "";
  return;
}

// Show score
const pct = r.percentage;
if (scoreEl) scoreEl.textContent = `${pct}%`;
if (tierEl) tierEl.textContent = r.tier || "";

// Persona paragraph
const personaName = r.personaName || r.funType || "Your vibe";
const personaParagraph = r.personaParagraph || r.funBlurb || "";
if (personaEl) personaEl.textContent = `${personaName} — ${personaParagraph}`.trim();

// Why + advice (if you stored them)
if (whyEl) {
  // If you didn’t store why/advice, create basic ones
  const why = r.why || [
    "Your answers show how often uncertainty affects your mood.",
    "The more you pick “Yes/All the time”, the higher the score."
  ];
  whyEl.textContent = Array.isArray(why) ? ("• " + why.join("\n• ")) : String(why);
}

if (adviceEl) {
  const advice = r.advice || [
    "Pause before reacting. Calm first, interpret second.",
    "Look at actions over texting style."
  ];
  adviceEl.textContent = Array.isArray(advice) ? ("• " + advice.join("\n• ")) : String(advice);
}

// Animate ring/progress if those elements exist
if (ringEl) ringEl.style.setProperty("--p", pct);
if (barEl) barEl.style.width = pct + "%";

// Save button → saves to quizHistory
if (saveBtn) {
  saveBtn.onclick = () => {
    saveHistory({
      percentage: pct,
      tier: r.tier || "",
      personaName,
      savedAt: new Date().toISOString()
    });
    alert("Saved ✅");
  };
}
