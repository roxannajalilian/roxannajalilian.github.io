// scan.js
requireAdultOrRedirect();

const textInput = document.getElementById("textInput");
const imgInput = document.getElementById("imgInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");

const scanWarn = document.getElementById("scanWarn");
const scanPct = document.getElementById("scanPct");
const scanLabel = document.getElementById("scanLabel");
const signalsBox = document.getElementById("signalsBox");
const scanAdvice = document.getElementById("scanAdvice");

function warn(msg){
  scanWarn.textContent = msg;
  scanWarn.style.display = msg ? "block" : "none";
}

function addSignal(signals, condition, message){
  if (condition) signals.push(message);
}

analyzeBtn.addEventListener("click", () => {
  warn("");
  const t = (textInput.value || "").trim();
  if (!t) {
    warn("Paste some text first.");
    return;
  }

  const lower = t.toLowerCase();
  const signals = [];

  // Your requested “real convo signal” style
  addSignal(signals, /seen|left on read|read at|delivered/.test(lower), "Read receipts / ‘seen’ is triggering you.");
  addSignal(signals, /\bok\b|\bk\b|\bsure\b|\bfine\b/.test(lower), "Short replies (‘ok’, ‘k’, ‘sure’) can feel cold even if not intended.");
  addSignal(signals, /\.\.\.|…/.test(t), "Ellipses (‘…’) can feel like attitude / suspense.");
  addSignal(signals, /\?{2,}/.test(t), "Multiple question marks = anxious urgency.");
  addSignal(signals, /\bsorry\b/.test(lower), "You’re apologizing a lot (often a stress sign).");
  addSignal(signals, /\bnvm\b|\bnevermind\b|\bwhatever\b|\bi guess\b|\balright bro\b/.test(lower), "Shutdown words can spike anxiety.");
  addSignal(signals, /\bon ur life\b|\bi'm gonna be alone\b|\byou hate me\b|\byou don't care\b/.test(lower), "Catastrophizing language (fear of abandonment).");
  addSignal(signals, /\bwhy r u mad\b|\bwhy are you mad\b|\bare you mad\b/.test(lower), "Repeated checking for mood/anger (reassurance seeking).");
  addSignal(signals, /\bexplain\b|\bi didn’t mean\b|\blet me explain\b/.test(lower), "Over-explaining after tension (panic-fixing).");

  // Score guess (simple but consistent)
  const scoreGuess = Math.min(100, 18 + signals.length * 12);
  scanPct.textContent = scoreGuess + "%";

  let label, explanation, advice;
  if (scoreGuess <= 30) {
    label = "Low delulu risk";
    explanation = "Nothing here screams “spiral.” The convo reads pretty normal overall.";
    advice = "Stay calm and ask 1 clear question if you’re unsure — don’t create stories from silence.";
  } else if (scoreGuess <= 60) {
    label = "Medium delulu risk";
    explanation = "Some patterns could trigger overthinking (short replies / uncertainty / checking tone).";
    advice = "Try not to send paragraphs. One calm message is stronger than ten stressed ones.";
  } else if (scoreGuess <= 85) {
    label = "High delulu risk";
    explanation = "There are multiple stress signals that usually lead to spiraling or mind-reading.";
    advice = "Step away 10–20 minutes before texting back. Ask for clarity, not reassurance.";
  } else {
    label = "Very high delulu risk";
    explanation = "This looks like a full spiral zone (short replies + fear language + urgency).";
    advice = "Put the phone down. Calm your body first. Then send ONE clear message or wait until you’re grounded.";
  }

  scanLabel.textContent = label;

  signalsBox.innerHTML = signals.length
    ? `<p><b>Signals detected:</b></p><ul>${signals.map(s => `<li>${s}</li>`).join("")}</ul>`
    : `<p><b>Signals detected:</b> none major.</p>`;

  scanAdvice.innerHTML = `
    <p><b>What it might mean:</b> ${explanation}</p>
    <p><b>Best-friend advice:</b> ${advice}</p>
    <p class="muted small">Note: This is a fun pattern detector, not a real mental health diagnosis.</p>
  `;

  // Save last scan (optional)
  const data = getData();
  data.lastScan = { scoreGuess, label, signals, at: new Date().toISOString() };
  setData(data);

  // Image upload is optional; we just acknowledge it (no OCR)
  if (imgInput.files && imgInput.files[0]) {
    // You can extend later to show preview if you want
  }
});

clearBtn.addEventListener("click", () => {
  textInput.value = "";
  if (imgInput) imgInput.value = "";
  warn("");
  scanPct.textContent = "--%";
  scanLabel.textContent = "No scan yet";
  signalsBox.innerHTML = "";
  scanAdvice.innerHTML = "";
});
