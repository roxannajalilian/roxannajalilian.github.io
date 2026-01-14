const APP_KEY = "dd_app_v1";

function getAppData(){
  try { return JSON.parse(localStorage.getItem(APP_KEY) || "{}"); }
  catch { return {}; }
}

const box = document.getElementById("planOut");
const data = getAppData();
const last = data.lastQuiz;

function li(text){ return `<li>${text}</li>`; }

if(!last){
  box.innerHTML = `
    <h2>No saved quiz result yet</h2>
    <p class="muted">Take the quiz first so I can build your plan.</p>
    <div class="row" style="margin-top:12px;">
      <a class="btn primary" href="quiz.html">Take Quiz</a>
      <a class="btn" href="menu.html">Menu</a>
    </div>
  `;
} else {
  const p = last.percent;

  let headline =
    p >= 75 ? "Damage-control plan" :
    p >= 45 ? "Clarity + boundaries plan" :
              "Stay-grounded plan";

  let vibe =
    p >= 75 ? "You’re in overthink mode. We’re stopping the spiral and protecting your dignity." :
    p >= 45 ? "You’re not fully delulu, but you’re doing too much. This plan makes you calm + clear." :
              "You’re mostly fine. This plan keeps you consistent and unbothered.";

  const steps = (
    p >= 75 ? [
      "No replying when emotional. Wait 30–60 minutes minimum.",
      "Send ONE clear message. No essays, no spam.",
      "If they’re dry: stop explaining. Match energy.",
      "If they disappear: don’t chase. Let them come to you.",
      "If you need clarity: ask directly once, then watch actions."
    ] :
    p >= 45 ? [
      "Before you text: ask “what do I want?” (clarity or comfort?)",
      "Don’t double-text. If you already sent it, stop.",
      "Keep replies short + confident.",
      "If they’re inconsistent: detach a bit. Don’t reward it.",
      "Pick a boundary: “I like consistent communication.”"
    ] : [
      "Don’t assume tone from one word.",
      "If something feels off: ask calmly once.",
      "Keep your routine — don’t revolve around replies.",
      "Watch patterns, not promises.",
      "Stay respectful, but don’t accept disrespect."
    ]
  );

  box.innerHTML = `
    <div class="row" style="justify-content:space-between; margin-bottom:10px;">
      <h2>${headline}</h2>
      <div class="badge">Saved score: ${p}%</div>
    </div>
