const APP_KEY = "dd_app_v1";
function getAppData(){ try { return JSON.parse(localStorage.getItem(APP_KEY) || "{}"); } catch { return {}; } }

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
  const label = last.rangeLabel || "";

  // Stronger plans by ranges
  let headline, vibe, steps, doNot;

  if (p <= 20){
    headline = "Stay-grounded plan ✅";
    vibe = "You’re already calm and stable. This plan keeps you consistent so you don’t get pulled into drama.";
    steps = [
      "Ask for clarity once if something feels off.",
      "Watch patterns, not one-time messages.",
      "Keep your routine: sleep, friends, school, hobbies.",
      "If they’re inconsistent: don’t invest more than they do."
    ];
    doNot = [
      "Don’t start analyzing punctuation or timings.",
      "Don’t chase a reply that hasn’t earned your energy."
    ];
  } else if (p <= 40){
    headline = "Slight-overthink plan";
    vibe = "You’re mostly okay, but you can slip into reading too deep sometimes. This plan keeps you clear and confident.";
    steps = [
      "When you feel anxious, wait 10 minutes before replying.",
      "Don’t interpret short texts as hate — look at consistency.",
      "Use 1 direct question instead of guessing."
    ];
    doNot = [
      "Don’t send long paragraphs to fix silence.",
      "Don’t stalk activity for clues."
    ];
  } else if (p <= 60){
    headline = "Half-delulu plan 😭";
    vibe = "You’re in the danger zone. This plan stops the spiral and keeps your dignity.";
    steps = [
      "No double-texting. If you sent it once, stop.",
      "Ask one clear question and wait for the answer.",
      "Match energy: dry replies get short replies.",
      "Put your phone down for 30 minutes after texting."
    ];
    doNot = [
      "Don’t chase closure from someone inconsistent.",
      "Don’t excuse disrespect."
    ];
  } else if (p <= 80){
    headline = "High-delulu plan (spiral risk)";
    vibe = "Your mood is getting controlled by their replies. This plan is for self-control + boundaries.";
    steps = [
      "Wait 30–60 minutes before replying when emotional.",
      "One message max for clarity. No essays.",
      "If they keep disappearing: step back fully.",
      "Focus on real life: friends, gym, hobbies, school.",
      "If needed: mute them for a few hours to reset your brain."
    ];
    doNot = [
      "Don’t beg or spam messages.",
      "Don’t ignore repeated red flags."
    ];
  } else {
    headline = "MAX delulu plan 🚨";
    vibe = "You’re deep in detective mode. This plan is damage-control and protects your mental peace.";
    steps = [
      "Stop chasing. Give space and observe actions.",
      "If they’re not consistent, detach fully.",
      "Write what you want to say in Notes — don’t send it.",
      "Do something physical (walk, shower, clean) to reset.",
      "Choose self-respect over curiosity."
    ];
    doNot = [
      "Don’t tolerate disrespect.",
      "Don’t keep explaining yourself to someone who won’t meet you halfway."
    ];
  }

  box.innerHTML = `
    <div class="row" style="justify-content:space-between; margin-bottom:10px;">
      <h2>${headline}</h2>
      <div class="badge">${p}%</div>
    </div>

    ${label ? `<p class="muted">${label}</p>` : ""}

    <p>${vibe}</p>

    <div class="section">
      <h3>Do this</h3>
      <ul>${steps.map(li).join("")}</ul>
    </div>

    <div class="section">
      <h3>Don’t do this</h3>
      <ul>${doNot.map(li).join("")}</ul>
    </div>

    <div class="section">
      <h3>Quick scripts</h3>
      <div class="item">
        <p><b>Clarity:</b> “Hey, I’m a bit confused — are we good?”</p>
        <p><b>Boundary:</b> “I like consistency. If you’re not feeling it, just be honest.”</p>
        <p><b>Detach:</b> “No worries, take care.”</p>
      </div>
    </div>
  `;
}
