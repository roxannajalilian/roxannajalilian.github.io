const APP_KEY = "dd_app_v1";
function getAppData(){ try { return JSON.parse(localStorage.getItem(APP_KEY) || "{}"); } catch { return {}; } }

const box = document.getElementById("planOut");
const data = getAppData();
const last = data.lastQuiz;

function li(x){ return `<li>${x}</li>`; }

function buildPlan(p){
  if (p <= 20) {
    return {
      title: "Stay-grounded plan ✅",
      vibe: "You’re already calm. This plan keeps you steady and prevents random spirals.",
      doThis: [
        "Ask once if something feels off — no guessing games.",
        "Watch patterns over time (effort, consistency).",
        "Keep your routine strong (sleep, friends, goals).",
        "If they go cold, don’t chase — let actions speak."
      ],
      dont: [
        "Don’t analyze punctuation or “seen” like it’s a crime scene.",
        "Don’t lower your standards for attention."
      ],
      script: [
        "“Hey, are we good? Just checking.”",
        "“I like consistency. If you’re not feeling it, just be honest.”"
      ]
    };
  }
  if (p <= 40) {
    return {
      title: "Slight-overthink plan",
      vibe: "You’re mostly fine, you just overthink sometimes. This keeps you confident.",
      doThis: [
        "Wait 10 minutes before replying if you feel anxious.",
        "If you’re confused: ask ONE clear question.",
        "Match energy: don’t give paragraphs to dry replies.",
        "Focus on what they do, not what you hope they mean."
      ],
      dont: [
        "Don’t stalk activity for clues.",
        "Don’t fill silence with extra messages."
      ],
      script: [
        "“I’m a little confused — what are you thinking?”",
        "“All good, just wanted clarity.”"
      ]
    };
  }
  if (p <= 60) {
    return {
      title: "Half-delulu plan 😭",
      vibe: "You’re in the zone where people start chasing. We’re stopping that.",
      doThis: [
        "No double-texting. If you already said it, stop.",
        "If they’re inconsistent: step back and watch.",
        "Put your phone down after texting (30 minutes).",
        "Protect your dignity: calm messages only."
      ],
      dont: [
        "Don’t apologize for asking basic respect.",
        "Don’t ignore red flags because you want it to work."
      ],
      script: [
        "“Are you interested or not? I’d rather you be straight.”",
        "“I like consistent communication — if that’s not you, it’s okay.”"
      ]
    };
  }
  if (p <= 80) {
    return {
      title: "High-delulu plan (spiral risk)",
      vibe: "Your mood is getting controlled by their replies. This plan puts you back in control.",
      doThis: [
        "Pause before replying (30–60 mins if emotional).",
        "Send one message max, then wait.",
        "Mute notifications for a bit to reset your brain.",
        "If they disappear repeatedly: detach fully."
      ],
      dont: [
        "Don’t beg, spam, or explain yourself 10 times.",
        "Don’t accept disrespect because you’re attached."
      ],
      script: [
        "“I’m not doing mixed signals. If you want this, be consistent.”",
        "“No worries. Take care.”"
      ]
    };
  }
  return {
    title: "MAX delulu plan 🚨",
    vibe: "You’re deep in detective mode. This is damage control + self-respect.",
    doThis: [
      "Stop chasing. Observe actions only.",
      "Write your feelings in Notes — do NOT send.",
      "Do something physical to reset (walk/shower/clean).",
      "Choose self-respect over curiosity."
    ],
    dont: [
      "Don’t tolerate bare minimum.",
      "Don’t keep forgiving disrespect."
    ],
    script: [
      "“I’m stepping back. If you want to talk, be clear.”",
      "“I’m good. Take care.”"
    ]
  };
}

if(!last){
  box.innerHTML = `
    <h2>No saved quiz result yet</h2>
    <p class="muted">Take the quiz first so your plan can be generated.</p>
    <div class="row" style="margin-top:12px;">
      <a class="btn primary" href="quiz.html">Take Quiz</a>
      <a class="btn" href="menu.html">Menu</a>
    </div>
  `;
} else {
  const p = last.percent;
  const label = last.rangeLabel || "";
  const plan = buildPlan(p);

  box.innerHTML = `
    <div class="row" style="justify-content:space-between; margin-bottom:8px;">
      <h2 style="margin:0;">${plan.title}</h2>
      <div class="badge">${p}%</div>
    </div>
    ${label ? `<p class="muted" style="margin-top:0;">${label}</p>` : ""}
    <p>${plan.vibe}</p>

    <div class="section">
      <h3>Do this</h3>
      <ul>${plan.doThis.map(li).join("")}</ul>
    </div>

    <div class="section">
      <h3>Don’t do this</h3>
      <ul>${plan.dont.map(li).join("")}</ul>
    </div>

    <div class="section">
      <h3>Quick scripts</h3>
      <div class="item">
        ${plan.script.map(s => `<p style="margin:0 0 8px;"><b>${s}</b></p>`).join("")}
      </div>
    </div>
  `;
}
