requireAdult("scan.html");

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

let hasImage = false;

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

function analyzeText(t){
  const text = (t || "").toLowerCase();

  let score = 0;
  const found = [];

  const rules = [
    { name: "Dry replies / shutdown", re: /\b(k|ok|kk|sure|fine|idk|whatever)\b/g, pts: 10 },
    { name: "Seen / left on read vibes", re: /\b(seen|read|delivered|opened)\b/g, pts: 8 },
    { name: "Mixed signals", re: /\b(i miss you|i like you|but|however|not ready)\b/g, pts: 12 },
    { name: "Ghosting / disappearing", re: /\b(ghost|disappear|ignored|no reply|didn't reply)\b/g, pts: 12 },
    { name: "Chasing / double-texting", re: /\b(again\?|hello\?|answer|why aren't you)\b/g, pts: 10 },
    { name: "Drama punctuation", re: /(\.\.\.|??+|!!+)/g, pts: 6 }
  ];

  rules.forEach(r => {
    const m = text.match(r.re);
    if (m && m.length) {
      score += r.pts + Math.min(10, m.length); // a little scaling
      found.push(`${r.name} (${m.length}x)`);
    }
  });

  // cap 0..100
  score = Math.max(0, Math.min(100, score));

  return { score, found };
}

analyzeBtn.addEventListener("click", () => {
  const t = scanText.value.trim();
  signalsList.innerHTML = "";

  if (!t) {
    scanSummary.textContent = "Paste some messages first.";
    scanMeta.textContent = "No scan";
    scanBar.style.width = "0%";
    scanPercent.textContent = "--%";
    return;
  }

  const { score, found } = analyzeText(t);

  scanMeta.textContent = hasImage ? "Text + screenshot added" : "Text only";
  scanBar.style.width = `${score}%`;
  scanPercent.textContent = `${score}%`;

  if (score >= 75) scanSummary.textContent = "Major mixed signals / chasing risk. Slow down and protect your peace.";
  else if (score >= 50) scanSummary.textContent = "Some red flags. Look at patterns, not one moment.";
  else if (score >= 25) scanSummary.textContent = "Light signals. Don’t spiral—stay direct.";
  else scanSummary.textContent = "Low signals. Stay calm and keep standards.";

  if (!found.length) {
    addSignal("No strong patterns detected from the text you pasted.");
  } else {
    found.forEach(addSignal);
  }

  if (hasImage) {
    addSignal("Screenshot added (preview only). This version doesn’t read text from images yet.");
  }
});

clearBtn.addEventListener("click", () => {
  scanText.value = "";
  scanFile.value = "";
  fileInfo.textContent = "";
  preview.style.display = "none";
  preview.src = "";
  hasImage = false;

  signalsList.innerHTML = "";
  scanMeta.textContent = "No scan yet";
  scanBar.style.width = "0%";
  scanPercent.textContent = "--%";
  scanSummary.textContent = "Paste text and press Analyze.";
});
