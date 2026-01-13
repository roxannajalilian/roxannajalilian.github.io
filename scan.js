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

// NEW controls
const formatMode = document.getElementById("formatMode");
const whoMode = document.getElementById("whoMode");
const myNameInput = document.getElementById("myName");

function warn(msg){
  scanWarn.textContent = msg;
  scanWarn.style.display = msg ? "block" : "none";
}

function addSignal(signals, condition, message, weight = 1){
  if (condition) signals.push({ message, weight });
}

// -------- Parsing helpers --------

// Detects lines like:
// "Roxanna: hi"
// "+1 (647)...: ok"
// "Name - message"
// "Name — message"
function parseChatLines(raw) {
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const items = [];
  for (const line of lines) {
    // Match "Speaker: message"
    let m = line.match(/^(.{1,40}?)(?:\s*[:\-—]\s*)(.+)$/);
    if (m) {
      const speaker = m[1].trim();
      const msg = m[2].trim();
      items.push({ speaker, msg, raw: line });
    } else {
      // No speaker label -> treat as unknown speaker message
      items.push({ speaker: "unknown", msg: line, raw: line });
    }
  }
  return items;
}

// One-sided texts: treat all lines as "me"
function parseTexts(raw) {
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return lines.map(l => ({ speaker: "me", msg: l, raw: l }));
}

// Guess "me" vs "them" using "my name" (optional) + frequency
function assignSides(items, myName) {
  const name = (myName || "").trim().toLowerCase();
  if (!name) return items; // leave speakers as-is; we'll infer later

  return items.map(it => {
    const sp = (it.speaker || "").toLowerCase();
    if (sp.includes(name)) return { ...it, side: "me" };
    return { ...it, side: "them" };
  });
}

// If no myName, attempt auto: pick the most repeated non-unknown speaker as "them"
// and treat other known speaker as "me" IF there are two major speakers.
// If messy, it falls back to "both".
function autoSideGuess(items) {
  const counts = {};
  for (const it of items) {
    const s = (it.speaker || "unknown").toLowerCase();
    if (s !== "unknown") counts[s] = (counts[s] || 0) + 1;
  }
  const speakers = Object.entries(counts).sort((a,b) => b[1]-a[1]).map(x => x[0]);
  if (speakers.length < 2) return items; // can’t reliably split

  const a = speakers[0];
  const b = speakers[1];

  // Arbitrary but consistent: the first speaker label becomes "them", second becomes "me"
  return items.map(it => {
    const s = (it.speaker || "").toLowerCase();
    if (s === a) return { ...it, side: "them" };
    if (s === b) return { ...it, side: "me" };
    return { ...it, side: "unknown" };
  });
}

// Build the text to scan depending on whoMode
function buildScanText(items, who) {
  if (who === "both") return items.map(i => i.msg).join("\n");

  // Only me/them: require side labels
  const filtered = items.filter(i => i.side === who);
  return filtered.map(i => i.msg).join("\n");
}

// -------- Analysis --------
function analyzeText(scanText) {
  const t = scanText.trim();
  const lower = t.toLowerCase();
  const signals = [];

  // “real convo signal” style (with weights)
  addSignal(signals, /seen|left on read|read at|delivered/.test(lower),
    "Read receipts / ‘seen’ is triggering you.", 2);

  addSignal(signals, /\bok\b|\bk\b|\bsure\b|\bfine\b/.test(lower),
    "Short replies (‘ok’, ‘k’, ‘sure’) can feel cold even if not intended.", 2);

  addSignal(signals, /\.\.\.|…/.test(t),
    "Ellipses (‘…’) can feel like attitude / suspense.", 1);

  addSignal(signals, /\?{2,}/.test(t),
    "Multiple question marks = anxious urgency.", 1);

  addSignal(signals, /\bsorry\b/.test(lower),
    "You’re apologizing a lot (often a stress sign).", 1);

  addSignal(signals, /\bnvm\b|\bnevermind\b|\bwhatever\b|\bi guess\b|\balright bro\b/.test(lower),
    "Shutdown words can spike anxiety.", 2);

  addSignal(signals, /\bon ur life\b|\bi'?m gonna be alone\b|\byou hate me\b|\byou don'?t care\b/.test(lower),
    "Catastrophizing language (fear of abandonment).", 2);

  addSignal(signals, /\bwhy r u mad\b|\bwhy are you mad\b|\bare you mad\b/.test(lower),
    "Repeated checking for mood/anger (reassurance seeking).", 2);

  addSignal(signals, /\bexplain\b|\bi didn[’']t mean\b|\blet me explain\b/.test(lower),
    "Over-explaining after tension (panic-fixing).", 1);

  // Extra “aggression / red-flag vibe” detection
  addSignal(signals, /\bshut up\b|\bstfu\b|\bfuck\b|\bbitch\b|\bidiot\b/.test(lower),
    "Harsh language / insults = conflict escalation (red flag).", 3);

  addSignal(signals, /\byou always\b|\byou never\b/.test(lower),
    "‘You always/never’ = blaming language that escalates fights.", 2);

  // Weighted score
  const weightSum = signals.reduce((a, s) => a + (s.weight || 1), 0);
  const scoreGuess = Math.min(100, 18 + weightSum * 10);

  let label, explanation, advice;
  if (scoreGuess <= 30) {
    label = "Low delulu risk";
    explanation = "Nothing here screams spiral. This looks pretty normal overall.";
    advice = "Stay calm and ask ONE clear question if you’re unsure. Don’t create stories from silence.";
  } else if (scoreGuess <= 60) {
    label = "Medium delulu risk";
    explanation = "Some patterns could trigger overthinking (short replies, uncertainty, tone-checking).";
    advice = "Don’t send paragraphs. One calm message is stronger than ten stressed ones.";
  } else if (scoreGuess <= 85) {
    label = "High delulu risk";
    explanation = "Multiple stress signals here usually lead to mind-reading or spiraling.";
    advice = "Step away 10–20 minutes before responding. Ask for clarity, not reassurance.";
  } else {
    label = "Very high delulu risk";
    explanation = "This looks like full spiral territory (urgency + fear language + cold replies).";
    advice = "Put the phone down. Calm your body first. Then send ONE clear message or wait until you’re grounded.";
  }

  return { scoreGuess, label, explanation, advice, signals };
}

// -------- Main click --------
analyzeBtn.addEventListener("click", () => {
  warn("");

  const raw = (textInput.value || "").trim();
  if (!raw) return warn("Paste some text first.");

  const fmt = formatMode.value;     // auto/texts/chat
  const who = whoMode.value;        // both/me/them
  const myName = (myNameInput.value || "").trim();

  let items = [];

  // choose parsing mode
  if (fmt === "texts") {
    items = parseTexts(raw);
    items = items.map(i => ({ ...i, side: "me" }));
  } else if (fmt === "chat") {
    items = parseChatLines(raw);
    items = assignSides(items, myName);
    // if still no side labels, try auto guess
    if (!items.some(i => i.side === "me" || i.side === "them")) {
      items = autoSideGuess(items);
    }
  } else {
    // auto-detect: if many lines have "Name: msg" pattern -> chat; else texts
    const looksLikeChat = raw.split(/\r?\n/).filter(Boolean).slice(0, 6)
      .some(l => /^(.{1,40}?)(?:\s*[:\-—]\s*)(.+)$/.test(l.trim()));

    if (looksLikeChat) {
      items = parseChatLines(raw);
      items = assignSides(items, myName);
      if (!items.some(i => i.side === "me" || i.side === "them")) {
        items = autoSideGuess(items);
      }
    } else {
      items = parseTexts(raw);
      items = items.map(i => ({ ...i, side: "me" }));
    }
  }

  // if user picked me/them but we couldn't split, fallback to both with warning
  let scanText = buildScanText(items, who);
  if ((who === "me" || who === "them") && !scanText.trim()) {
    warn("I couldn’t reliably tell who is who. Add your name (optional) or switch ‘Scan whose messages?’ to Both.");
    scanText = buildScanText(items, "both");
  }

  const result = analyzeText(scanText);

  // UI update
  scanPct.textContent = result.scoreGuess + "%";
  scanLabel.textContent = result.label;

  const sigList = result.signals.map(s => s.message);
  signalsBox.innerHTML = sigList.length
    ? `<p><b>Signals detected:</b></p><ul>${sigList.map(s => `<li>${s}</li>`).join("")}</ul>`
    : `<p><b>Signals detected:</b> none major.</p>`;

  // show what was scanned
  const whoLabel =
    who === "both" ? "both sides" : (who === "me" ? "only your messages" : "only their messages");

  scanAdvice.innerHTML = `
    <p class="muted small"><b>Scanned:</b> ${whoLabel} • <b>Mode:</b> ${formatMode.value}</p>
    <p><b>What it might mean:</b> ${result.explanation}</p>
    <p><b>Best-friend advice:</b> ${result.advice}</p>
    <p class="muted small">Note: fun pattern detector only (not a real diagnosis).</p>
  `;

  // Save last scan
  const data = getData();
  data.lastScan = {
    scoreGuess: result.scoreGuess,
    label: result.label,
    signals: sigList,
    scanned: who,
    mode: fmt,
    at: new Date().toISOString()
  };
  setData(data);

  // Image is optional (no OCR)
  if (imgInput.files && imgInput.files[0]) {
    // optional: later you can show a preview
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
