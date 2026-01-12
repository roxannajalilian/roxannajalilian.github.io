import { downloadTextFile, stableHash } from "./utils.js";

export function buildReport({ state, scoreObj }) {
  const lines = [];
  lines.push("Delulu Detector Report");
  lines.push("----------------------");
  lines.push(`Date: ${new Date().toLocaleString()}`);
  lines.push(`Mode: ${state.mode}`);
  lines.push("");

  if (state.situation) {
    lines.push("Situation:");
    lines.push(state.situation.trim());
    lines.push("");
  }

  lines.push(`Final Score: ${scoreObj.score}/100`);
  lines.push(`Tier: ${scoreObj.tier}`);
  lines.push("");

  lines.push("Metrics (0-100):");
  for (const [k,v] of Object.entries(scoreObj.metrics)) {
    lines.push(`- ${k}: ${Math.round(v)}`);
  }
  lines.push("");

  lines.push("Advice:");
  lines.push(scoreObj.advice);
  lines.push("");

  if (state.lastAnalysis?.signals?.length) {
    lines.push("Message Signals:");
    state.lastAnalysis.signals.forEach(s => {
      lines.push(`- ${s.name} (${s.points} pts, ${s.count} match) — ${s.hints}`);
    });
    lines.push("");
  }

  lines.push("Privacy:");
  lines.push("This report was generated locally in your browser. No server was used.");
  lines.push("");

  return lines.join("\n");
}

export function downloadReport(state, scoreObj) {
  const id = stableHash((state.situation || "") + JSON.stringify(scoreObj));
  const text = buildReport({ state, scoreObj });
  downloadTextFile(`delulu-report-${id}.txt`, text);
}
