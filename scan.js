/* scan.js — Delulu Text Analyzer (client-side) */

requireAdult("scan.html");

const textEl = document.getElementById("scanText");
const fileEl = document.getElementById("scanFile");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");

const errEl = document.getElementById("scanError");
const statusEl = document.getElementById("scanStatus");
const barEl = document.getElementById("scanBar");
const percentEl = document.getElementById("scanPercent");
const oneLinerEl = document.getElementById("scanOneLiner");
const explainEl = document.getElementById("scanExplain");
const signalsGrid = document.getElementById("signalsGrid");

function showError(msg) {
  errEl.textContent = msg;
  errEl.style.display = "block";
}
function clearError() {
  errEl.style.display = "none";
  errEl.textContent = "";
}

function setUI(percent, status, oneLiner) {
  statusEl.textContent = status;
  percentEl.textContent = `${percent}%`;
  barEl.style.width = `${percent}%`;
  oneLinerEl.textContent = oneLiner;
}

function addSignal(text) {
  const div = document.createElement("div");
  div.className = "quote";
  div.textContent = text;
  signalsGrid.appendChild(div);
}

function analyzeText(raw) {
  const t = raw.trim();
  const lower = t.toLowerCase();

  // signals + scoring
  let score = 0;
  const found = [];

  const add = (pts, label) => {
    score += pts;
    found.push(label);
  };

  // quick “patterns”
  const qMarks = (t.match(/\?/g) || []).length;
  if (qMarks >= 3) add(10, `Lots of “?” (${qMarks})`);

  const ellipses = (t.match(/\.{3,}|…/g) || []).length;
  if (ellipses >= 1) add(8, `Ellipses / “…” vibes (${ellipses})`);

  const seen = /seen|delivered|read at|opened/i.test(t);
  if (seen) add(10, `“Seen/Delivered/Read” mentioned`);

  const shortReplies = lower.match(/\b(k|kk|ok|okay|fine|sure|ya|yup|nm|idk|lmao)\b/g) || [];
  if (shortReplies.length >= 3) add(14, `Short replies pattern (${shortReplies.length})`);

  const dry = /\b(k\.)|\bok\.\b|\bfine\.\b/i.test(t);
  if (dry) add(8, `Dry punctuation (“k.” / “ok.” / “fine.”)`);

  const leftOnRead = /left on read|no reply|ignored|didn't reply/i.test(lower);
  if (leftOnRead) add(12, `“Ignored / no reply” mentioned`);

  const doubleText = /double text|texted again|again\?\?|hello\??\s*$/im.test(t);
  if (doubleText) add(10, `Double-text / follow-up energy`);

  const apologyLoop = lower.match(/\bsorry\b/g) || [];
  if (apologyLoop.length >= 2) add(8, `Too many “sorry” (${apologyLoop.length})`);

  const begging = /please|pls|answer me|talk to me/i.test(lower);
  if (begging) add(10, `Chasing / begging language`);

  const loveBomb = /i miss you|i love you|baby|my love|wallah/i.test(lower);
  if (loveBomb) add(6, `High-emotion wording (baby/love/miss you)`);

  const caps = t.match(/[A-Z]{4,}/g) || [];
  if (caps.length >= 1) add(6, `Caps intensity (${caps.length})`);

  // Normalize to percent (0–100)
  const percent = Math.max(0, Math.min(100, Math.round(score)));

  // Build bestie explanation
  let oneLiner = "Low delulu — calm vibes.";
  let explain = "You’re reading what’s actually there, not creating stories in the silence.";
  if (percent >= 80) {
    oneLiner = "MAX delulu 🚨 — spiral risk.";
    explain =
      "Okay bestie… your brain is doing detective-mode HARD. The text has mixed signals + dry replies vibes, and you’re filling the silence with meanings that aren’t confirmed. Right now, you need actions > words, and you need to stop chasing for clarity that they aren’t giving.";
  } else if (percent >= 60) {
    oneLiner = "High delulu — triggered by uncertainty.";
    explain =
      "You’re mostly fine until the replies feel off — then your brain starts connecting dots. The convo shows patterns that usually trigger overthinking (dry/short replies, uncertainty, follow-up energy). Step back and watch what repeats, not what you *hope* they meant.";
  } else if (percent >= 40) {
    oneLiner = "Medium delulu — sometimes detective-mode.";
    explain =
      "You’re sometimes calm, sometimes detective-mode. Most of the time you’re chill, but when communication gets unclear or replies feel off, your brain starts connecting dots that aren’t fully there. You end up filling in gaps instead of waiting to see the full pattern. It’s not constant spiraling — it’s mostly triggered by uncertainty, and once you step back, you usually realize it wasn’t that deep.";
  } else if (percent >= 20) {
    oneLiner = "Slight overthink — manageable.";
    explain =
      "You’re not fully spiraling, but you do get pulled in by certain words/pauses. Keep it simple: ask once, then watch consistency.";
  }

  return { percent, oneLiner, explain, found };
}

function saveScanResult(result) {
  const data = getAppData();
  data.lastScan = {
    percent: result.percent,
    oneLiner: result.oneLiner,
    explain: result.explain,
    found: result.found,
    savedAt: Date.now()
  };
  setAppData(data);
}

function renderSignals(list) {
  signalsGrid.innerHTML = "";
  if (!list || list.length === 0) {
    addSignal("No obvious signals — it’s mostly neutral.");
    return;
  }
  // cap at 6 so it stays clean
  list.slice(0, 6).forEach(addSignal);
}

analyzeBtn.addEventListener("click", () => {
  clearError();

  const raw = textEl.value.trim();
  if (!raw) {
    showError("Paste some messages first.");
    return;
  }

  // fake “analyzing…” moment so it feels real
  setUI(0, "Analyzing…", "Scanning patterns…");
  explainEl.textContent = "…";
  signalsGrid.innerHTML = "";

  setTimeout(() => {
    const result = analyzeText(raw);

    setUI(result.percent, "Scan complete", result.oneLiner);
    explainEl.textContent = result.explain;
    renderSignals(result.found);

    saveScanResult(result);
  }, 650);
});

clearBtn.addEventListener("click", () => {
  clearError();
  textEl.value = "";
  fileEl.value = "";
  setUI(0, "No scan yet", "Paste text and press Analyze.");
  explainEl.textContent = "—";
  signalsGrid.innerHTML = "";
});

// initial UI
setUI(0, "No scan yet", "Paste text and press Analyze.");
explainEl.textContent = "—";
signalsGrid.innerHTML = "";
