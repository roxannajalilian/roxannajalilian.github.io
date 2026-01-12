import { clamp } from "./utils.js";

function pick(list, seedIndex = 0) {
  return list[seedIndex % list.length];
}

export function buildActionPlan({ mode, score, situation, analysisSignals, metrics }) {
  const s = (situation || "").trim();
  const hot = analysisSignals?.[0]?.name || null;

  // Tone for teen mode: safer, calmer
  const teen = mode === "teen";

  const waitMins = teen
    ? clamp(Math.round(20 + score * 0.8), 20, 90)
    : clamp(Math.round(10 + score * 0.6), 10, 60);

  const boundaryLines = teen
    ? [
        "I’m not mad, I just like clear communication. Are we on the same page?",
        "I’m gonna step back if things stay confusing. I like clarity.",
        "If you’re busy, that’s fine—just be straight with me."
      ]
    : [
        "I prefer consistency. If you’re not in, no worries—just be honest.",
        "I’m not looking for mixed signals. Let me know what you want.",
        "I’ll match effort. If it’s low effort, I’ll step back."
      ];

  const replySoft = teen
    ? [
        "Hey, quick question—are we good? I’m not trying to overthink, just want clarity.",
        "No pressure, but what do you mean by that? I don’t wanna guess."
      ]
    : [
        "Just checking—what are you looking for here? I prefer clarity.",
        "Your messages feel a bit mixed. Are you interested or not really?"
      ];

  const replyConfident = teen
    ? [
        "All good—if you’re busy, just say that. I don’t like guessing.",
        "If this is casual for you, tell me so I can move accordingly."
      ]
    : [
        "I like you, but I’m not chasing. If you want this, show it.",
        "If it’s inconsistent, I’m stepping back. Respectfully."
      ];

  const “dontList” = teen
    ? [
        "Don’t spam texts for reassurance.",
        "Don’t stalk socials for ‘proof’.",
        "Don’t send long paragraphs while emotional.",
        "Don’t interpret one emoji as a full answer."
      ]
    : [
        "Don’t negotiate for effort.",
        "Don’t argue your worth over text.",
        "Don’t over-invest in potential.",
        "Don’t accept hot/cold as normal."
      ];

  // Quick “reality check” bullets based on metrics
  const reality = [];
  if (metrics.mind >= 65) reality.push("Your overthinking meter is high—treat thoughts as guesses, not facts.");
  if (metrics.signals >= 60) reality.push("Mixed signals detected—judge patterns over words.");
  if (metrics.evidence <= 45) reality.push("Low evidence—get clarity with one calm question, then observe actions.");
  if (metrics.self <= 45) reality.push("Self-confidence dipped—do one grounding activity before responding.");
  if (metrics.boundaries <= 45) reality.push("Boundary score low—choose dignity over chasing.");

  const plan = {
    title: score >= 70 ? "Calm Reset Plan" : score >= 40 ? "Reality Check Plan" : "Green Flag Plan",
    wait: `Wait ${waitMins} minutes before sending anything. Use that time to breathe + do something distracting.`,
    reality: reality.length ? reality : ["You’re mostly grounded. Keep it simple and calm."],
    nextMove: hot
      ? `Main trigger: ${hot}. Don’t react fast—respond with clarity.`
      : "No major trigger found in texts. Focus on your standards + clarity.",
    replies: {
      gentle: pick(replySoft, Math.floor(score / 10)),
      confident: pick(replyConfident, Math.floor(score / 12)),
      boundary: pick(boundaryLines, Math.floor(score / 8)),
    },
    dont: “dontList”
  };

  // Teen-safe wording: avoid “dating pressure” vibes
  if (teen && s.length === 0) {
    plan.nextMove += " Also, add a 1–2 sentence summary so the plan fits your situation better.";
  }

  return plan;
}
