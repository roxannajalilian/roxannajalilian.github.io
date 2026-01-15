requireAdult("plan.html");

const loadingBox = document.getElementById("loadingBox");
const planContent = document.getElementById("planContent");

const planBar = document.getElementById("planBar");
const planPercent = document.getElementById("planPercent");
const planMeta = document.getElementById("planMeta");

const nextSteps = document.getElementById("nextSteps");
const rule = document.getElementById("rule");
const reality = document.getElementById("reality");

function buildPlan(percent){
  if (percent >= 80) {
    return {
      next: "Stop texting for 24 hours. Do NOT chase. If they want you, you’ll see effort.",
      rule: "1 text = 1 wait. No double-texting. Your dignity stays.",
      reality: "Your brain is filling silence with stories. Look at patterns: effort, consistency, respect."
    };
  }
  if (percent >= 60) {
    return {
      next: "Ask a clear question once, then step back. Don’t argue with confusion.",
      rule: "No paragraphs. Keep it simple. Let them reveal themselves.",
      reality: "Mixed signals are a signal. If it’s not clear, it’s not secure."
    };
  }
  if (percent >= 40) {
    return {
      next: "Take a breath before replying. Assume neutral, not negative.",
      rule: "If you feel anxious, wait 10 minutes before sending anything.",
      reality: "One message doesn’t define their feelings. Consistency does."
    };
  }
  if (percent >= 20) {
    return {
      next: "You’re mostly okay—just don’t spiral when timing is off.",
      rule: "Don’t check for ‘clues’ (views/likes). Ask directly if needed.",
      reality: "Respect > attention. If it drains you, it’s not for you."
    };
  }
  return {
    next: "You’re grounded. Keep standards and don’t tolerate disrespect.",
    rule: "No over-explaining. Matching effort is the best move.",
    reality: "You’re reading reality well—stay calm and consistent."
  };
}

(function run(){
  const data = getAppData();
  const lastQuiz = data.lastQuiz;

  // fake “real app” loading
  setTimeout(() => {
    loadingBox.style.display = "none";
    planContent.style.display = "block";

    if (!lastQuiz || typeof lastQuiz.percent !== "number") {
      planMeta.textContent = "No saved quiz result found. Take the quiz first.";
      planBar.style.width = "0%";
      planPercent.textContent = "0%";
      nextSteps.textContent = "Go take the quiz so I can generate your plan.";
      rule.textContent = "Complete the quiz first.";
      reality.textContent = "Plan needs a saved score.";
      return;
    }

    const percent = lastQuiz.percent;
    const p = buildPlan(percent);

    planMeta.textContent = "Based on your last quiz score:";
    planBar.style.width = `${percent}%`;
    planPercent.textContent = `${percent}% delulu risk`;

    nextSteps.textContent = p.next;
    rule.textContent = p.rule;
    reality.textContent = p.reality;
  }, 900);
})();
