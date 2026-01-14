requireAdult("scan.html");

const textBox = document.getElementById("textBox");
const photoInput = document.getElementById("photoInput");
const preview = document.getElementById("preview");
const previewImg = document.getElementById("previewImg");
const photoNote = document.getElementById("photoNote");

const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");

const resultBox = document.getElementById("resultBox");
const scanBar = document.getElementById("scanBar");
const scanPercent = document.getElementById("scanPercent");
const scanSummary = document.getElementById("scanSummary");
const signalsEl = document.getElementById("signals");

let hasPhoto = false;

photoInput.addEventListener("change", () => {
  const file = photoInput.files && photoInput.files[0];
  if (!file) {
    hasPhoto = false;
    preview.style.display = "none";
    photoNote.textContent = "";
    return;
  }

  if (!file.type.startsWith("image/")) {
    hasPhoto = false;
    preview.style.display = "none";
    photoNote.textContent = "That file is not an image.";
    return;
  }

  hasPhoto = true;
  const url = URL.createObjectURL(file);
  previewImg.src = url;
  preview.style.display = "block";
  photoNote.textContent = "Photo attached ✅ (preview shown)";
});

function addSignal(list, text){
  const li = document.createElement("li");
  li.textContent = text;
  list.appendChild(li);
}

function analyzeText(raw){
  const t = (raw || "").toLowerCase();

  let score = 0;
  const signals = [];

  const checks = [
    { re: /\bseen\b|\bread\b|\bon delivered\b/, pts: 10, msg: "Mentions of ‘seen/read/delivered’ = tracking replies." },
    { re: /\bok\b|\bk\b|\bkk\b|\blol\b|\b?\?\?+\b/, pts: 10, msg: "Dry replies / ‘k/ok/??’ patterns." },
    { re: /\.{3,}|…/, pts: 10, msg: "Ellipsis ‘…’ / dot dot dot = ambiguity trigger." },
    { re: /\bwhy (did|do) (you|u)\b|\banswer\b|\breply\b/, pts: 10, msg: "Chasing clarity / asking why they didn’t reply." },
    { re: /\bsorry\b|\bmy fault\b|\bi shouldn’t\b/, pts: 8, msg: "Apology language (even when you didn’t do anything)." },
    { re: /\bi miss you\b|\bdo you even\b|\byou don’t care\b/, pts: 12, msg: "Emotional pressure phrases." },
    { re: /\bblocking\b|\bunfollow\b|\bremove\b/, pts: 10, msg: "Threat-style actions (block/unfollow/remove)." }
  ];

  checks.forEach(c => {
    if (c.re.test(t)) {
      score += c.pts;
      signals.push(c.msg);
    }
  });

  if (t.length > 350) {
    score += 6;
    signals.push("Long convo pasted — more room for overthinking.");
  }

  if (hasPhoto) {
    score += 8;
    signals.push("Screenshot added — usually means you’re collecting evidence.");
  }

  score = Math.min(100, score);

  let summary =
    score >= 75 ? "High overthink signals. Pause + don’t chase. Watch actions." :
    score >= 45 ? "Medium signals. Get clarity once, then step back." :
                  "Low signals. You’re mostly reading it normally.";

  if (signals.length === 0) signals.push("No obvious red-flag patterns detected from the text you pasted.");

  return { score, summary, signals };
}

analyzeBtn.addEventListener("click", () => {
  const raw = textBox.value.trim();
  const res = analyzeText(raw);

  resultBox.style.display = "block";
  scanBar.style.width = `${res.score}%`;
  scanPercent.textContent = `${res.score}%`;
  scanSummary.textContent = res.summary;

  signalsEl.innerHTML = "";
  res.signals.forEach(s => addSignal(signalsEl, s));
});

clearBtn.addEventListener("click", () => {
  textBox.value = "";
  photoInput.value = "";
  hasPhoto = false;
  preview.style.display = "none";
  photoNote.textContent = "";
  resultBox.style.display = "none";
});
