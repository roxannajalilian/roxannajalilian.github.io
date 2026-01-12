import { clamp } from "./utils.js";

const RULES = [
  {
    key: "Mixed signals",
    weight: 14,
    patterns: [
      /\bmiss you\b/i, /\bcome over\b/i, /\bwyd\b/i,
      /\bbut\b.*\bnot\b/i,
      /\bmaybe\b/i, /\bsometimes\b/i
    ],
    hints: "They sound interested sometimes, then inconsistent."
  },
  {
    key: "Breadcrumbing / low effort",
    weight: 14,
    patterns: [
      /\blol\b/i, /\bkk\b/i, /\bk\b/i, /\baha\b/i, /\byup\b/i,
      /\bbet\b/i, /\bok\b/i
    ],
    hints: "A lot of minimal replies can mean low investment."
  },
  {
    key: "Avoidance",
    weight: 14,
    patterns: [
      /\bbusy\b/i, /\blater\b/i, /\bcan'?t\b/i, /\bnot now\b/i,
      /\bwe'?ll see\b/i, /\bmaybe another time\b/i
    ],
    hints: "Delays + dodging plans can be avoidance."
  },
  {
    key: "Jealousy testing / mind games",
    weight: 12,
    patterns: [
      /\bmake you jealous\b/i, /\bwho'?s that\b/i, /\bother guys\b/i,
      /\bprove\b/i, /\btest\b/i
    ],
    hints: "Mind games create spirals and confusion."
  },
  {
    key: "Unclear intentions",
    weight: 12,
    patterns: [
      /\bnot looking for\b/i, /\bno labels\b/i, /\bjust friends\b/i,
      /\bsee where it goes\b/i
    ],
    hints: "If intentions are vague, you fill gaps with imagination."
  },
  {
    key: "Intensity / love-bomb vibes",
    weight: 12,
    patterns: [
      /\balways\b/i, /\bforever\b/i, /\bmy wife\b/i, /\bmy husband\b/i,
      /\bobsessed\b/i, /\bneed you\b/i, /\bcan'?t live\b/i
    ],
    hints: "Very intense fast talk can feel exciting but unstable."
  },
  {
    key: "Conflict escalation",
    weight: 10,
    patterns: [
      /\byou never\b/i, /\byou always\b/i, /\bi'm done\b/i,
      /\block you\b/i, /\bbye\b/i
    ],
    hints: "Escalation language makes overthinking worse."
  },
];

function findMatches(text, pattern) {
  const matches = [];
  const re = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
  let m;
  while ((m = re.exec(text)) !== null) {
    matches.push({ start: m.index, end: m.index + m[0].length, value: m[0] });
    if (m.index === re.lastIndex) re.lastIndex++;
  }
  return matches;
}

export function analyzeMessages(rawText) {
  const text = (rawText || "").trim();
  if (!text) {
    return {
      score: 0,
      signals: [],
      summary: "No messages pasted. You can still use the questionnaire score.",
      highlightsHTML: "",
    };
  }

  const signals = [];
  let total = 0;
  let allMatches = [];

  for (const rule of RULES) {
    let ruleMatches = [];
    for (const p of rule.patterns) {
      ruleMatches = ruleMatches.concat(findMatches(text, p));
    }
    if (ruleMatches.length > 0) {
      const strength = clamp(ruleMatches.length, 1, 5);
      const points = clamp(rule.weight * (strength / 3), 4, rule.weight);
      total += points;

      signals.push({
        name: rule.key,
        points: Math.round(points),
        count: ruleMatches.length,
        hints: rule.hints
      });

      allMatches = allMatches.concat(ruleMatches.map(m => ({...m, label: rule.key})));
    }
  }

  // Normalize score out of 100 (message-only score)
  const score = clamp(Math.round((total / 70) * 100), 0, 100);

  // Highlight matched words/phrases (basic)
  allMatches.sort((a,b) => a.start - b.start);
  const merged = [];
  for (const m of allMatches) {
    const last = merged[merged.length - 1];
    if (last && m.start <= last.end) {
      last.end = Math.max(last.end, m.end);
      last.label = last.label || m.label;
    } else {
      merged.push({...m});
    }
  }

  let html = "";
  let cursor = 0;
  for (const m of merged) {
    html += escapeHTML(text.slice(cursor, m.start));
    const chunk = text.slice(m.start, m.end);
    html += `<mark title="${escapeHTML(m.label)}">${escapeHTML(chunk)}</mark>`;
    cursor = m.end;
  }
  html += escapeHTML(text.slice(cursor));

  const summary =
    signals.length === 0
      ? "No obvious ‘delulu signals’ detected in the text. Your score will rely more on the questionnaire."
      : `Detected ${signals.length} pattern(s). Highlighted phrases may be fueling overthinking.`;

  return {
    score,
    signals: signals.sort((a,b) => b.points - a.points),
    summary,
    highlightsHTML: html
  };
}

function escapeHTML(s) {
  return (s || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
