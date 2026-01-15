requireAdult("scan.html");

// Elements (IDs MUST match scan.html)
const scanText = document.getElementById("scanText");
const scanFile = document.getElementById("scanFile");
const fileInfo = document.getElementById("fileInfo");
const preview = document.getElementById("preview");

const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");

const scanBar = document.getElementById("scanBar");
const scanPercent = document.getElementById("scanPercent");
const scanSummary = document.getElementById("scanSummary");
const scanMeta = document.getElementById("scanMeta");
const signalsList = document.getElementById("signalsList");

const debugLine = document.getElementById("debugLine");

function dbg(msg){ if (debugLine) debugLine.textContent = msg; }

let hasImage = false;

// Photo preview (does NOT read text from images — just preview)
scanFile.addEventListener("change", () => {
  const f = scanFile.files && scanFile.files[0];
  hasImage = !!f;

  if (!f) {
    fileInfo.textContent = "";
    preview.style.display = "none";
    preview.src = "";
    return;
  }

  fileInfo.textContent = `Selected: ${f.name}`;
  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(f);
});

function addSignal(text){
  const div = document.createElement("div");
  div.className = "quote";
  div.textContent = text;
  signalsList.appendChild(div);
}

function analyzeText(raw){
  const text = (raw || "").toLowerCase();
  let score = 0;
  const found = [];

  // simple keyword/pattern scoring
  const rules = [
    { name: "Dry replies / shutdown words", re: /\b(k|ok|kk|sure|fine|idk|whatever)\b/g, pts: 12 },
    { name: "Mixed signals phrases", re: /\b(i miss you|i like you|but|however|not ready)\b/g, pts: 14 },
    { name: "Ghosting / ignored vibes", re: /\b(ghost|ignored|no reply|didn't reply|left me)\b/g, pts: 14 },
    { name: "Chasing language", re: /\b(answer|why aren't you|hello\?|are you ignoring)\b/g, pts: 12 },
    { name: "Overthinking punctuation", re: /(\.\.\.|??+|!!+)/g, pts: 8 },
    { name: "Apology / guilt loop", re: /\b(sorry|my fault|i shouldn't|please)\b/g, pts: 8 }
  ];

  rules.forEach(r => {
    const m = text.match(r.re);
    if (m && m.length) {
      score += r.pts + Math.min(12, m.length);
      found.push(`${r.name} (${m.length}x)`);
    }
  });

  // cap 0..100
  score = Math.max(0, Math.min(100, score));

  return { score, found };
}

function setResult(score, found){
  scanMeta.textContent = hasImage ? "Text + screenshot added" : "Text only";
  scanBar.style.width = `${score}%`;
  scanPercent.textContent = `${score}%`;

  if (score >= 75) scanSummary.textContent = "High signals. Slow down — don’t chase. Watch actions + consistency.";
  else if (score >= 50) scanSummary.textContent = "Medium signals. Some red flags — focus on patterns, not one message.";
  else if (score >= 25) scanSummary.textContent = "Low-medium signals. Don’t spiral — keep it direct.";
  else scanSummary.textContent = "Low signals. Stay calm and keep your standards.";

  signalsList.innerHTML = "";
  if (!found.length) addSignal("No strong patterns detected from your text.");
  else found.forEach(addSignal);

  if (hasImage) addSignal("Screenshot preview added (this version doesn’t read text from images yet).");
}

analyzeBtn.addEventListener("click", () => {
  dbg("Analyze clicked ✅");

  const t = scanText.value.trim();
  if (!t) {
    scanMeta.textContent = "No scan";
    scanBar.style.width = "0%";
    scanPercent.textContent = "--%";
    scanSummary.textContent = "Paste some messages first.";
    signalsList.innerHTML = "";
    return;
  }

  const { score, found } = analyzeText(t);
  setResult(score, found);
});

clearBtn.addEventListener("click", () => {
  scanText.value = "";
  scanFile.value = "";
  fileInfo.textContent = "";
  preview.style.display = "none";
  preview.src = "";
  hasImage = false;

  scanMeta.textContent = "No scan yet";
  scanBar.style.width = "0%";
  scanPercent.textContent = "--%";
  scanSummary.textContent = "Paste text and press Analyze.";
  signalsList.innerHTML = "";

  dbg("Cleared ✅");
});

dbg("scan.js loaded ✅");
