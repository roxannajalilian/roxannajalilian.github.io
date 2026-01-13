const KEY = "delulu_data_v1";

function getData(){
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch(e){ return {}; }
}
function setData(d){ localStorage.setItem(KEY, JSON.stringify(d)); }

function $(id){ return document.getElementById(id); }

const scoreEl = $("scoreNumber");
const tierEl = $("tierText");
const personaEl = $("personaText");
const whyEl = $("whyText");
const adviceEl = $("adviceText");
const barEl = $("barFill");
const ringEl = $("ring");
const saveBtn = $("saveBtn");

const d = getData();
const r = d.quizResult;

if (!r || typeof r.percentage !== "number") {
  if (scoreEl) scoreEl.textContent = "--%";
  if (tierEl) tierEl.textContent = "No result found. Take the quiz first.";
  if (personaEl) personaEl.textContent = "";
  if (whyEl) whyEl.textContent = "";
  if (adviceEl) adviceEl.textContent = "";
} else {
  const pct = r.percentage;

  if (scoreEl) scoreEl.textContent = pct + "%";
  if (tierEl) tierEl.textContent = r.tier || "";
  if (personaEl) personaEl.textContent = `${r.personaName || ""} ${r.personaParagraph || ""}`.trim();

  // “Why it rated you this way”
  if (whyEl) whyEl.textContent = r.explanation || "";

  // Bestie advice
  if (adviceEl) adviceEl.textContent = r.advice || "";

  if (barEl) barEl.style.width = pct + "%";
  if (ringEl) ringEl.style.setProperty("--p", pct);

  if (saveBtn) {
    saveBtn.onclick = () => {
      d.quizHistory = Array.isArray(d.quizHistory) ? d.quizHistory : [];
      d.quizHistory.unshift({
        percentage: pct,
        tier: r.tier || "",
        persona: r.personaName || "",
        savedAt: new Date().toISOString()
      });
      d.quizHistory = d.quizHistory.slice(0, 20);
      setData(d);
      alert("Saved ✅");
    };
  }
}
