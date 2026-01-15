function buildAdvice(percent, answers){
  // answers values:
  // 3 = Yes a lot, 2 = Sometimes, 1 = Rarely, 0 = No

  // Group questions into “patterns”
  const groups = [
    { key:"Mind-reading", idxs:[0,1,2], label:"Mind-reading & decoding" },
    { key:"Checking", idxs:[3,6], label:"Checking / replaying loops" },
    { key:"Chasing", idxs:[4,5,8], label:"Chasing + mood dependence" },
    { key:"IgnoringSigns", idxs:[7,9], label:"Ignoring red flags / excusing" }
  ];

  function avgFor(idxs){
    const vals = idxs.map(i => answers[i] ?? 0);
    return vals.reduce((a,b)=>a+b,0) / idxs.length; // 0..3
  }

  // Pick the strongest pattern(s)
  const scored = groups
    .map(g => ({ ...g, avg: avgFor(g.idxs) }))
    .sort((a,b) => b.avg - a.avg);

  const top1 = scored[0];
  const top2 = scored[1];

  function patternLine(g){
    if (g.avg >= 2.4) return `${g.label} is a BIG driver for you right now.`;
    if (g.avg >= 1.7) return `${g.label} shows up often for you.`;
    if (g.avg >= 1.1) return `${g.label} shows up sometimes.`;
    return `${g.label} is not a major issue for you.`;
  }

  // Stronger, more “real” explanation
  const why = [
    `Your score is based on how often you fall into overthinking patterns (re-reading, guessing tone, checking activity, replaying conversations) and how much you chase clarity through texting.`,
    patternLine(top1),
    (top2.avg >= 1.7 ? `Also: ${patternLine(top2)}` : ""),
    `Main takeaway: your brain is treating texting like evidence, so you end up filling silence with stories instead of waiting for consistent actions.`
  ].filter(Boolean).join(" ");

  // Actions depend on the score, but also mention the top pattern
  const topLabel = top1.label;

  if (percent >= 85) {
    return {
      label: "MAX Delulu 🚨",
      why,
      actions: [
        `STOP decoding texts (${topLabel}). Watch actions only.`,
        "No double-texting. Ask once, then wait.",
        "Mute activity checking for 24 hours (views/snaps/last seen).",
        "If they’re inconsistent: match energy or leave. No crumbs."
      ]
    };
  }

  if (percent >= 65) {
    return {
      label: "High Delulu",
      why,
      actions: [
        `Your biggest trap is ${topLabel}. Catch it early.`,
        "Wait 10 minutes before replying when you feel anxious.",
        "Ask a direct question once, not 5 messages in a row.",
        "Don’t explain disrespect. Respect is the bare minimum."
      ]
    };
  }

  if (percent >= 45) {
    return {
      label: "Half-Delulu 😭",
      why,
      actions: [
        `You’re half calm, half ${topLabel}.`,
        "Focus on patterns over days/weeks, not one message.",
        "If you feel yourself spiraling: put your phone down for 20 minutes.",
        "Get clarity once. If it stays confusing, step back."
      ]
    };
  }

  if (percent >= 25) {
    return {
      label: "Slight Overthink",
      why,
      actions: [
        `Small amount of ${topLabel}, but you can control it.`,
        "Don’t treat punctuation like proof.",
        "Decide your standards (effort + respect + consistency).",
        "If it’s confusing, that’s still a signal."
      ]
    };
  }

  return {
    label: "Grounded ✅",
    why,
    actions: [
      "You don’t spiral too easily — keep that.",
      "Communicate directly instead of guessing.",
      "If they go dry or disrespectful, you don’t beg.",
      "Stay consistent and protect your peace."
    ]
  };
}
