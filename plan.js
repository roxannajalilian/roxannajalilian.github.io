// plan.js
requireAdultOrRedirect();

const data = getData();
const r = data.quizResult;

const planTitle = document.getElementById("planTitle");
const planPct = document.getElementById("planPct");
const planBody = document.getElementById("planBody");

if (!r) {
  planTitle.textContent = "No plan yet";
  planPct.textContent = "Take quiz";
  planBody.innerHTML = `
    <p>You haven’t taken the quiz yet, so I can’t personalize your plan.</p>
    <p><b>Do this:</b> go back to Menu → start the quiz → then come back here.</p>
  `;
} else {
  planTitle.textContent = "Your anti-spiral plan";
  planPct.textContent = r.percentage + "%";

  const p = r.percentage;

  let steps = [];
  if (p <= 25) {
    steps = [
      "Keep your balance: don’t over-check the chat.",
      "If something feels off, ask once calmly — then move on.",
      "Protect your peace: don’t create stories from one message."
    ];
  } else if (p <= 50) {
    steps = [
      "Use the 3-question reset: (1) what’s the proof? (2) what’s the story? (3) what’s the simplest explanation?",
      "Wait 10 minutes before sending a stressed message.",
      "Replace double-texting with one clear question."
    ];
  } else if (p <= 75) {
    steps = [
      "No reacting in the moment: put phone down for 15 minutes.",
      "Switch from mind-reading to clarity: one direct question, not paragraphs.",
      "Track patterns: actions > texting tone."
    ];
  } else {
    steps = [
      "Emergency rule: if you feel panic, do NOT text for 20 minutes.",
      "Do a reality check: ask a trusted friend what they think the message means.",
      "Use clarity scripts: “Hey are we good? I’m reading into it.”",
      "If it’s constant anxiety, take a break from the convo and ground yourself."
    ];
  }

  planBody.innerHTML = `
    <p><b>Your vibe:</b> ${r.vibe || ""}</p>
    <p>${r.explanation}</p>
    <hr/>
    <p><b>Plan steps (do these in order):</b></p>
    <ol>
      ${steps.map(s => `<li>${s}</li>`).join("")}
    </ol>
    <hr/>
    <p><b>Quick script you can use:</b></p>
    <p style="margin:0;">
      “Hey, I might be overthinking. Just checking — are we good?”
    </p>
  `;
}
