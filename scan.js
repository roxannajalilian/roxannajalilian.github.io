// scan.js
import { requireAdultOrRedirect, getData, setData } from "./gate.js";

requireAdultOrRedirect();

const textEl = document.getElementById("text");
const fileEl = document.getElementById("file");
const fileName = document.getElementById("fileName");
const previewWrap = document.getElementById("previewWrap");
const preview = document.getElementById("preview");

const analyzeBtn = document.getElementById("analyze");
const clearBtn = document.getElementById("clear");
const backBtn = document.getElementById("back");
const msg = document.getElementById("msg");

const pct = document.getElementById("pct");
const label = document.getElementById("label");
const bullets = document.getElementById("bullets");

function setCircle(percent) {
  // Visual ring using conic-gradient
  const circle = document.getElementById("circle");
  circle.style.background = `conic-gradient(rgba(120,220,255,.95) ${percent}%, rgba(255,255,255,.08) 0)`;
}

function addBullet(t) {
  const li = document.createElement("li");
  li.textContent = t;
  bullets.appendChild(li);
}

function analyzeText(raw) {
  const t = (raw || "").trim();
  const lower = t.toLowerCase();

  // Signals (simple but effective)
  const signals = [];

  const qMarks = (t.match(/\?/g) || []).length;
  const exMarks = (t.match(/!/g) || []).length;
  const dots = (t.match(/\.{3,}/g) || []).length;

  const seen = /\bseen\b/.test(lower);
  const ok = /\bok\b|\bk\b|\bokay\b/.test(lower);
  const shortReplies = lower.split(/\n+/).filter(line => line.trim().length > 0 && line.trim().length <= 3).length;

  const shutdown = /\b(idk|fine|whatever|nvm|leave me alone|stop|bye)\b/.test(lower);
  const reassuranceSeek = /\b(do you|are you|did i|why did|am i|did you)\b/.test(lower);
  const doubleText = /\n\s*\n/.test(t); // multiple message blocks

  let score = 0;

  if (qMarks >= 3) { score += 18; signals.push("Lots of question marks → anxious checking / seeking clarity."); }
  if (exMarks >= 3) { score += 8; signals.push("A lot of intensity (!!!) can mean emotional urgency."); }
  if (dots >= 1) { score += 8; signals.push("“...” shows uncertainty / reading between the lines."); }
  if (seen) { score += 12; signals.push("Mentions of “seen” → focus on read receipts."); }
  if (ok) { score += 10; signals.push("Short replies (“ok/k”) are easy to over-interpret."); }
  if (shortReplies >= 3) { score += 10; signals.push("Many super short messages → low info, high misread risk."); }
  if (shutdown) { score += 12; signals.push("Shutdown words (fine/whatever/bye) → conflict vibes or emotional cut-off."); }
  if (reassuranceSeek) { score += 12; signals.push("A lot of reassurance questions → overthinking loop risk."); }
  if (doubleText) { score += 10; signals.push("Multiple message blocks → might be double-texting or spiraling."); }

  // clamp 0..100
  score = Math.max(0, Math.min(100, score));

  let verdict = "No scan yet";
  if (score <= 24) verdict = "Pretty calm — low delulu risk.";
  else if (score <= 49) verdict = "A little overthinking — manageable.";
  else if (score <= 74) verdict = "Medium delulu — you might be spiraling.";
  else verdict = "High delulu — pause before you react.";

  return { score, verdict, signals };
}

function render(result) {
  pct.textContent = `${result.score}%`;
  label.textContent = result.verdict;
  setCircle(result.score);

  bullets.innerHTML = "";
  if (!result.signals.length) {
    addBullet("Not many “overthink” signals detected from this text.");
    addBullet("If you still feel anxious, ask one clear question instead of guessing.");
    return;
  }
  result.signals.slice(0, 6).forEach(addBullet);
  addBullet("Mini tip: if you’re unsure, ask directly (one sentence) instead of rereading for hidden meaning.");
}

fileEl.addEventListener("change", async () => {
  const f = fileEl.files?.[0];
  if (!f) return;

  fileName.textContent = f.name;

  // If it's an image: show preview (we won’t OCR; just preview)
  if (f.type.startsWith("image/")) {
    const url = URL.createObjectURL(f);
    preview.src = url;
    previewWrap.classList.remove("hidden");
    msg.textContent = "Screenshot loaded (preview only). Paste text for the actual analysis.";
    return;
  }

  // If it's text file: load into textarea
  if (f.name.toLowerCase().endsWith(".txt") || f.type.includes("text")) {
    const txt = await f.text();
    textEl.value = txt;
    previewWrap.classList.add("hidden");
    msg.textContent = "Loaded .txt into the box. Now click Analyze.";
  }
});

analyzeBtn.addEventListener("click", () => {
  const raw = textEl.value;
  if (!raw.trim()) {
    msg.textContent = "Paste some messages first (or upload a .txt).";
    return;
  }

  const result = analyzeText(raw);
  render(result);

  // Save last scan
  const data = getData();
  data.lastScan = { score: result.score, at: Date.now() };
  setData(data);

  msg.textContent = "Scan complete.";
});

clearBtn.addEventListener("click", () => {
  textEl.value = "";
  fileEl.value = "";
  fileName.textContent = "No file chosen";
  previewWrap.classList.add("hidden");
  pct.textContent = "--%";
  label.textContent = "No scan yet";
  bullets.innerHTML = `<li class="muted">Run a scan to see notes here.</li>`;
  setCircle(0);
  msg.textContent = "";
});

backBtn.addEventListener("click", () => {
  window.location.href = "menu.html"; // change if your menu page is different
});

// init circle background
setCircle(0);
