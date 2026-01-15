// plan.js
requireAdult("plan.html");

const loadingBox = document.getElementById("loadingBox");
const emptyBox = document.getElementById("emptyBox");
const planBox = document.getElementById("planBox");

const savedAtText = document.getElementById("savedAtText");
const planBar = document.getElementById("planBar");
const planPercent = document.getElementById("planPercent");
const planLabel = document.getElementById("planLabel");
const planWhy = document.getElementById("planWhy");
const actionsGrid = document.getElementById("actionsGrid");

function fmtTime(ts){
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
}

function tier(percent){
  if (percent >= 80) return "max";
  if (percent >= 60) return "high";
  if (percent >= 40) return "mid";
  if (percent >= 20) return "low";
  return "grounded";
}

function whyParagraph(percent){
  if (percent >= 80) {
    return "Okay bestie… you’re in FULL detective mode rn 😭. When something feels even a little off, your brain starts building a whole movie from tiny details (punctuation, timing, dryness). It’s not because you’re dumb — it’s because you want clarity so bad that uncertainty feels personal. The gag is: the more you chase the meaning, the more drained you get. We’re switching you from “prove it” energy to “watch the pattern” energy.";
  }
  if (percent >= 60) {
    return "Bestie you’re not always delulu, but mixed signals have you acting like Sherlock 😭. When replies feel weird or inconsistent, you start connecting dots that aren’t fully confirmed yet. You’re basically trying to protect your feelings by figuring it out fast, but it accidentally makes you spiral more. You do way better when you step back, breathe, and watch what they consistently do — not one random text.";
  }
  if (percent >= 40) {
    return "You’re sometimes calm, sometimes detective mode. Most of the time you’re chill, but when communication gets unclear or replies feel off, your brain starts connecting dots that aren’t fully there. You end up filling in gaps instead of waiting to see the full pattern. It’s not constant spiraling — it’s triggered by uncertainty. Once you take a step back, you usually realize you were overthinking more than the situation needed.";
  }
  if (percent >= 20) {
    return "You’re mostly grounded, but you get little spikes of overthinking when something feels confusing. It’s like you’re fine until a dry reply or weird pause happens, then your brain tries to “solve” it. The fix isn’t to care less — it’s to stop treating one moment like the whole story.";
  }
  return "You’re actually pretty grounded. You don’t instantly panic over every text, and you’re better at reading the *overall vibe* instead of one message. Just keep your standards and don’t let inconsistency pull you into over-explaining or chasing.";
}

function actionsFor(percent){
  const t = tier(percent);

  const common = [
    "Wait for a pattern (3+ moments), not 1 weird reply.",
    "Ask once, clearly. If they dodge it, that’s the answer.",
    "If you feel anxious, don’t text — drink water + do something else for 15 mins first."
  ];

  if (t === "max") return [
    "No double texting. One message max. Then stop.",
    "Mute their notifications for a day (so you’re not jump-scared).",
    "If it’s confusing, call it what it is: inconsistency.",
    ...common,
    "If they like you, you won’t be guessing this much."
  ];

  if (t === "high") return [
    "Before you reply, reread your message: is it confident or chasing?",
    "Don’t explain yourself 5 times. Say it once.",
    "Match energy. Don’t overgive to under-effort.",
    ...common
  ];

  if (t === "mid") return [
    "When you feel triggered: don’t react in the same minute.",
    "If they’re unclear, don’t fill the silence — let them show you.",
    ...common,
    "If you wouldn’t advise your best friend to chase, don’t do it."
  ];

  if (t === "low") return [
    "Treat one dry text as “maybe they’re busy”, not “they hate me”.",
    "Check reality: what have they done consistently?",
    ...common,
    "Keep it cute. Don’t overthink punctuation 😭"
  ];

  return [
    "Keep doing what you’re doing — you read patterns well.",
    "Stay consistent and don’t lower your standards.",
    ...common
  ];
}

function makeQuote(text){
  const d = document.createElement("div");
  d.className = "quote";
  d.textContent = text;
  return d;
}

function showPlan(lastQuiz){
  const percent = Number(lastQuiz.percent ?? 0);
  const label = lastQuiz.label || "—";

  savedAtText.textContent = `Saved: ${fmtTime(lastQuiz.savedAt || Date.now())}`;
  planPercent.textContent = `${percent}%`;
  planLabel.textContent = label;
  planBar.style.width = `${percent}%`;
  planWhy.textContent = whyParagraph(percent);

  actionsGrid.innerHTML = "";
  actionsFor(percent).slice(0, 6).forEach(a => actionsGrid.appendChild(makeQuote(a)));
}

(function init(){
  // spinner feel
  loadingBox.style.display = "flex";
  emptyBox.style.display = "none";
  planBox.style.display = "none";

  const data = getAppData();
  const lastQuiz = data.lastQuiz;

  setTimeout(() => {
    loadingBox.style.display = "none";

    if (!lastQuiz || typeof lastQuiz.percent !== "number") {
      emptyBox.style.display = "block";
      planBox.style.display = "none";
      return;
    }

    planBox.style.display = "block";
    emptyBox.style.display = "none";
    showPlan(lastQuiz);
  }, 700);
})();
