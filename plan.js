// plan.js (FULL FILE) — loader + real plan from saved quiz result

(() => {
  const APP_KEY = "dd_app_v1";
  function getAppData() {
    try { return JSON.parse(localStorage.getItem(APP_KEY) || "{}"); }
    catch { return {}; }
  }

  // Age gate
  const data = getAppData();
  if (!data.age || Number(data.age) < 18) {
    window.location.replace("start.html");
    return;
  }

  const loadingWrap = document.getElementById("loadingWrap");
  const emptyWrap = document.getElementById("emptyWrap");
  const resultWrap = document.getElementById("resultWrap");

  const scoreBadge = document.getElementById("scoreBadge");
  const planBar = document.getElementById("planBar");
  const savedAtText = document.getElementById("savedAtText");

  const meaningText = document.getElementById("meaningText");
  const ruleText = document.getElementById("ruleText");
  const todayList = document.getElementById("todayList");
  const boundariesList = document.getElementById("boundariesList");
  const linesBox = document.getElementById("linesBox");

  const lastQuiz = data.lastQuiz;

  function fmtTime(ts) {
    try {
      const d = new Date(ts);
      return d.toLocaleString();
    } catch {
      return "";
    }
  }

  function setList(ul, items) {
    ul.innerHTML = items.map(x => `<li>${x}</li>`).join("");
  }

  function quoteCards(lines) {
    return lines.map(l => `<div class="quote">${l}</div>`).join("");
  }

  function planFor(percent) {
    if (percent >= 80) {
      return {
        meaning: "You’re in full spiral mode. Your brain is writing stories from tiny signals.",
        rule: "One message max. If they’re inconsistent, detach — do not chase.",
        today: [
          "Mute notifications for 2 hours and do something physical (walk / shower / clean).",
          "Write the facts only (what they DID, not what you THINK it means).",
          "If you need clarity: ask ONE clear question, then stop."
        ],
        boundaries: [
          "No double texting for at least 6 hours.",
          "No checking views / activity like a detective.",
          "If they’re rude/dry twice: match energy or step back."
        ],
        lines: [
          "“Hey, are we good? Just want clarity.”",
          "“No worries — I’ll give you space.”",
          "“I’m not into mixed signals. If you’re down, be consistent.”"
        ]
      };
    }
    if (percent >= 60) {
      return {
        meaning: "High delulu. You get triggered by silence/tone and start overfilling gaps.",
        rule: "Ask once. Then wait. Your peace > their reply.",
        today: [
          "Before replying: wait 5 minutes and reread with neutral tone.",
          "Do one distraction task (music, notes, shower) before texting back.",
          "Only respond when you’re calm — not when you’re annoyed/anxious."
        ],
        boundaries: [
          "No paragraphs when they send one word.",
          "If they disappear: don’t reward it with extra attention.",
          "Consistency matters more than cute words."
        ],
        lines: [
          "“I’m not sure what you meant — can you be direct?”",
          "“Okay, I’ll let you get back to me when you’re free.”",
          "“I like consistent communication. If that’s not your thing, it’s okay.”"
        ]
      };
    }
    if (percent >= 40) {
      return {
        meaning: "Half-delulu. You’re mostly okay, but certain triggers make you spiral.",
        rule: "Patterns > moments. Don’t treat one text like a prophecy.",
        today: [
          "Stop rereading the same chat. Read once, then close it.",
          "If you want clarity: ask a simple question, don’t hint.",
          "Do something that makes you feel in control (tidy, plan, gym)."
        ],
        boundaries: [
          "No texting when you’re emotionally heated.",
          "If they’re dry: mirror the energy, don’t chase it.",
          "Your time is valuable — don’t beg for replies."
        ],
        lines: [
          "“All good — just checking what the plan is.”",
          "“If you’re busy, we can talk later.”",
          "“I’m not guessing. Just tell me straight.”"
        ]
      };
    }
    if (percent >= 20) {
      return {
        meaning: "Slight overthink. You notice signals, but you don’t fully lose control.",
        rule: "Stay chill and let people show you who they are.",
        today: [
          "Reply normally — no over-explaining.",
          "Give them time to respond without checking constantly.",
          "Do something fun and don’t stare at your phone."
        ],
        boundaries: [
          "Don’t assume tone from punctuation.",
          "Don’t change your mood based on one reply.",
          "If it bothers you, ask politely instead of guessing."
        ],
        lines: [
          "“No worries, talk later.”",
          "“What did you mean by that?”",
          "“Cool — let me know.”"
        ]
      };
    }
    return {
      meaning: "Super grounded. You’re not spiraling — you watch reality, not fantasy.",
      rule: "Keep your standards. Don’t entertain inconsistency.",
      today: [
        "Stay consistent with how you normally act.",
        "Keep your life busy and your energy protected.",
        "Choose people who match effort."
      ],
      boundaries: [
        "Don’t over-invest early.",
        "Watch actions, not promises.",
        "If it feels off, step back sooner."
      ],
      lines: [
        "“I like clear communication.”",
        "“Let me know when you’re free.”",
        "“I’m not into guessing games.”"
      ]
    };
  }

  // Show loader for a “real app” feel, then render
  setTimeout(() => {
    if (!lastQuiz || typeof lastQuiz.percent !== "number") {
      loadingWrap.style.display = "none";
      emptyWrap.style.display = "block";
      return;
    }

    const percent = lastQuiz.percent;
    const plan = planFor(percent);

    loadingWrap.style.display = "none";
    resultWrap.style.display = "block";

    scoreBadge.textContent = `${percent}%`;
    planBar.style.width = `${percent}%`;
    savedAtText.textContent = lastQuiz.savedAt ? `Saved: ${fmtTime(lastQuiz.savedAt)}` : "";

    meaningText.textContent = plan.meaning;
    ruleText.textContent = plan.rule;

    setList(todayList, plan.today);
    setList(boundariesList, plan.boundaries);
    linesBox.innerHTML = quoteCards(plan.lines);
  }, 850);
})();
