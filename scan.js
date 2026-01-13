const KEY = "delulu_data_v1";

// ---------- helpers ----------
function getData() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch (e) { return {}; }
}
function setData(d) {
  localStorage.setItem(KEY, JSON.stringify(d));
}
function countMatches(regex, text) {
  const m = text.match(regex);
  return m ? m.length : 0;
}

// ---------- DOM ----------
const tabText = document.getElementById("tabText");
const tabPhoto = document.getElementById("tabPhoto");
const panelText = document.getElementById("panelText");
const panelPhoto = document.getElementById("panelPhoto");

const textInput = document.getElementById("textInput");
const photoInput = document.getElementById("photoInput");
const photoWrap = document.getElementById("photoWrap");
const photoPreview = document.getElementById("photoPreview");
const removePhotoBtn = document.getElementById("removePhotoBtn");
const photoNotes = document.getElementById("photoNotes");

const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const out = document.getElementById("out");

// Voice-to-text
const startVoiceBtn = document.getElementById("startVoiceBtn");
const stopVoiceBtn = document.getElementById("stopVoiceBtn");
const voiceStatus = document.getElementById("voiceStatus");
let recognition = null;

// ---------- tabs ----------
function setTab(which) {
  if (which === "text") {
    panelText.style.display = "block";
    panelPhoto.style.display = "none";
    tabText.classList.add("primary");
    tabPhoto.classList.remove("primary");
  } else {
    panelText.style.display = "none";
    panelPhoto.style.display = "block";
    tabPhoto.classList.add("primary");
    tabText.classList.remove("primary");
  }
}
if (tabText && tabPhoto) {
  tabText.onclick = () => setTab("text");
  tabPhoto.onclick = () => setTab("photo");
}

// ---------- photo preview ----------
if (photoInput) {
  photoInput.addEventListener("change", () => {
    const file = photoInput.files && photoInput.files[0];
    if (!file) {
      if (photoWrap) photoWrap.style.display = "none";
      return;
    }
    const url = URL.createObjectURL(file);
    if (photoPreview) photoPreview.src = url;
    if (photoWrap) photoWrap.style.display = "block";
  });
}
if (removePhotoBtn) {
  removePhotoBtn.addEventListener("click", () => {
    if (photoInput) photoInput.value = "";
    if (photoPreview) photoPreview.src = "";
    if (photoWrap) photoWrap.style.display = "none";
  });
}

// ---------- clear ----------
if (clearBtn) {
  clearBtn.onclick = () => {
    if (textInput) textInput.value = "";
    if (photoInput) photoInput.value = "";
    if (photoPreview) photoPreview.src = "";
    if (photoWrap) photoWrap.style.display = "none";
    if (photoNotes) photoNotes.value = "";
    if (out) out.style.display = "none";
    stopVoice();
  };
}

// ---------- voice-to-text (Web Speech API) ----------
function canSpeech() {
  return ("webkitSpeechRecognition" in window) || ("SpeechRecognition" in window);
}
function startVoice() {
  if (!canSpeech()) {
    if (voiceStatus) voiceStatus.textContent = "Voice-to-text not supported in this browser.";
    return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = "en-CA";
  recognition.interimResults = true;
  recognition.continuous = true;

  if (startVoiceBtn) startVoiceBtn.disabled = true;
  if (stopVoiceBtn) stopVoiceBtn.disabled = false;
  if (voiceStatus) voiceStatus.textContent = "Listening…";

  let finalText = "";

  recognition.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const txt = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalText += txt + " ";
      else interim += txt;
    }
    if (textInput) textInput.value = (finalText + interim).trim();
  };

  recognition.onerror = () => {
    if (voiceStatus) voiceStatus.textContent = "Voice error. Try again.";
    stopVoice();
  };

  recognition.onend = () => {
    if (startVoiceBtn) startVoiceBtn.disabled = false;
    if (stopVoiceBtn) stopVoiceBtn.disabled = true;
    if (voiceStatus) voiceStatus.textContent = "";
  };

  recognition.start();
}
function stopVoice() {
  if (recognition) {
    try { recognition.stop(); } catch (e) {}
    recognition = null;
  }
  if (startVoiceBtn) startVoiceBtn.disabled = false;
  if (stopVoiceBtn) stopVoiceBtn.disabled = true;
  if (voiceStatus) voiceStatus.textContent = "";
}
if (startVoiceBtn) startVoiceBtn.onclick = startVoice;
if (stopVoiceBtn) stopVoiceBtn.onclick = stopVoice;

// ---------- analyzer logic ----------
function computeSignals(text) {
  const t = (text || "");
  const lower = t.toLowerCase();

  const signals = [];
  const metrics = {
    shortReplies: 0,
    reassurance: 0,
    doom: 0,
    shutdown: 0,
    aggression: 0,
    readReceipt: 0,
    ellipses: 0,
    multiQ: 0,
    sorry: 0,
    oneSided: 0
  };

  // Seen/read receipts
  if (/seen|left on read|read at|delivered/.test(lower)) {
    signals.push("Read receipts / ‘seen’ is triggering you.");
    metrics.readReceipt++;
  }

  // Dry replies
  const shortReplyCount =
    countMatches(/\b(k|kk|k\.|ok|okay|sure|fine|alright)\b/g, lower);

  if (shortReplyCount >= 2) {
    signals.push(`Dry replies detected (${shortReplyCount}x like “k/ok”). This can feel dismissive and spike anxiety.`);
    metrics.shortReplies += shortReplyCount;
  } else if (shortReplyCount === 1) {
    signals.push("A short reply (“k/ok/sure”) appears — could be neutral or dry depending on the pattern.");
    metrics.shortReplies += 1;
  }

  // One-sided vibe (simple heuristic)
  if (t.length > 350 && shortReplyCount >= 2) {
    signals.push("One-sided energy: you’re sending more detail while they respond very short.");
    metrics.oneSided++;
  }

  // Ellipses
  if (/\.\.\.|…/.test(t)) {
    signals.push("Ellipses (‘…’) can feel like attitude or hesitation.");
    metrics.ellipses++;
  }

  // Multiple question marks
  if (/\?{2,}/.test(t)) {
    signals.push("Multiple question marks = urgency/anxiety in the message.");
    metrics.multiQ++;
  }

  // Sorry
  const sorryCount = countMatches(/\bsorry\b/g, lower);
  if (sorryCount >= 2) {
    signals.push(`You’re apologizing a lot (${sorryCount}x). That can mean over-responsibility or trying to prevent conflict.`);
    metrics.sorry += sorryCount;
  } else if (sorryCount === 1) {
    signals.push("A ‘sorry’ appears — not bad, but note if you over-apologize often.");
    metrics.sorry += 1;
  }

  // Reassurance-checking
  const reassuranceCount = countMatches(/\b(are you mad|why r u mad|why are you mad|did i do something|do you hate me|are we good|are you okay)\b/g, lower);
  if (reassuranceCount >= 1) {
    signals.push("Reassurance-checking language (“are you mad/are we good”) suggests anxiety + uncertainty.");
    metrics.reassurance += reassuranceCount;
  }

  // Doom statements / catastrophizing
  const doomCount = countMatches(/\b(i'?m gonna be alone|i will be alone|no one wants me|everyone leaves|i can't do this|i hate myself)\b/g, lower);
  if (doomCount >= 1) {
    signals.push("Catastrophizing/doom statements detected. That usually means you’re spiraling emotionally in the moment.");
    metrics.doom += doomCount;
  }

  // Shutdown / dismissive
  const shutdownCount = countMatches(/\b(nvm|nevermind|whatever|i guess|alright bro|idc|fine then)\b/g, lower);
  if (shutdownCount >= 1) {
    signals.push("Shutdown/dismissive phrases detected (nvm/whatever/alright bro). This can escalate tension fast.");
    metrics.shutdown += shutdownCount;
  }

  // Aggression / pressure / blame
  const aggressionCount = countMatches(/\b(what the fuck|stfu|shut up|you never|you always|on your life|swear|prove it)\b/g, lower);
  if (aggressionCount >= 1) {
    signals.push("Pressure/aggressive wording detected (swear/prove it/you always). That’s more conflict red-flag than ‘delulu’.");
    metrics.aggression += aggressionCount;
  }

  return { signals, metrics };
}

function scoreFromMetrics(metrics, totalLen) {
  let score = 15;

  score += metrics.readReceipt * 10;
  score += metrics.reassurance * 12;
  score += metrics.multiQ * 6;
  score += Math.min(18, metrics.sorry * 6);
  score += metrics.ellipses * 6;

  score += Math.min(20, metrics.shortReplies * 5);
  score += metrics.oneSided * 10;

  score += metrics.doom * 14;

  score += Math.min(18, metrics.shutdown * 9);
  score += Math.min(18, metrics.aggression * 9);

  if (totalLen > 600) score += 8;
  if (totalLen > 1200) score += 8;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function classify(score, metrics) {
  const redFlag = (metrics.aggression + metrics.shutdown) >= 2;

  let tier, paragraph, why, advice;

  if (score <= 25) {
    tier = "Low delulu / mostly grounded";
    paragraph = "This looks pretty grounded. There aren’t many strong spiral triggers. If you feel stressed, it might be uncertainty more than the actual convo.";
    why = [
      "Not many anxiety-trigger patterns showed up.",
      "The vibe is more neutral than your brain might be telling you."
    ];
    advice = [
      "Trust patterns, not one text.",
      "Ask one calm clarity question if needed — then stop."
    ];
  } else if (score <= 50) {
    tier = "Mild overthinking";
    paragraph = "Some triggers are here (short replies, unclear tone, reassurance-checking). That can make you read into things because your brain wants certainty.";
    why = [
      "Short replies can feel cold even when they’re not meant that way.",
      "Waiting + uncertainty gives your mind room to make stories."
    ];
    advice = [
      "Before reacting: evidence or assumption?",
      "Look at actions + consistency, not texting style."
    ];
  } else if (score <= 75) {
    tier = "High overthinking";
    paragraph = "There are multiple spiral triggers here. This is the zone where rereading + checking your phone makes the meaning feel worse every time.";
    why = [
      "Your brain fills tone gaps with negative meaning.",
      "Reassurance-seeking helps short-term but fuels anxiety long-term."
    ];
    advice = [
      "Don’t respond while emotional — wait 20–30 minutes.",
      "Ask ONE direct clarity question instead of rereading."
    ];
  } else {
    tier = "Very high spiral risk";
    paragraph = "This is giving anxiety-in-the-driver-seat. Your messages show urgency + uncertainty patterns that usually push you into worst-case thinking.";
    why = [
      "Uncertainty feels like danger, so your brain tries to solve it fast.",
      "Catastrophizing language spikes your nervous system."
    ];
    advice = [
      "Mute notifications for 30 minutes and calm your body first.",
      "If it matters: ask for clarity once, then protect your peace."
    ];
  }

  return { tier, paragraph, why, advice, redFlag };
}

// ---------- analyze handler ----------
if (analyzeBtn) {
  analyzeBtn.onclick = () => {
    const t1 = (textInput ? textInput.value : "").trim();
    const t2 = (photoNotes ? photoNotes.value : "").trim();
    const combined = (t1 + "\n" + t2).trim();

    if (!combined) {
      out.style.display = "block";
      out.innerHTML = "Type/paste text (or add notes for the photo) before analyzing.";
      return;
    }

    const { signals, metrics } = computeSignals(combined);
    const score = scoreFromMetrics(metrics, combined.length);
    const details = classify(score, metrics);

    const signalsHtml = signals.length
      ? signals.map(s => `• ${s}`).join("<br>")
      : "• No obvious trigger phrases detected.";

    out.style.display = "block";
    out.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;flex-wrap:wrap;">
        <div>
          <b>Analyzer score:</b> <span style="font-size:1.2rem;"><b>${score}%</b></span><br>
          <span class="muted">${details.tier}${details.redFlag ? " • ⚠️ conflict red-flags detected" : ""}</span>
        </div>
        <button class="secondary" type="button" id="saveScanBtn">Save</button>
      </div>
      <hr style="border:none;border-top:1px solid rgba(255,255,255,.12);margin:.8rem 0;">
      <b>What this means:</b><br>${details.paragraph}
      <br><br>
      <b>What triggered the score:</b><br>${signalsHtml}
      <br><br>
      <b>Why you might feel this way:</b><br>• ${details.why.join("<br>• ")}
      <br><br>
      <b>Bestie advice:</b><br>• ${details.advice.join("<br>• ")}
    `;

    // Save to localStorage
    const d = getData();
    d.lastScanResult = {
      score,
      tier: details.tier,
      paragraph: details.paragraph,
      signals,
      redFlag: details.redFlag,
      savedAt: new Date().toISOString()
    };
    d.scanHistory = Array.isArray(d.scanHistory) ? d.scanHistory : [];
    d.scanHistory.unshift(d.lastScanResult);
    d.scanHistory = d.scanHistory.slice(0, 20);
    setData(d);

    // Save button
    setTimeout(() => {
      const btn = document.getElementById("saveScanBtn");
      if (btn) {
        btn.onclick = () => {
          alert("Saved ✅");
          location.href = "menu.html";
        };
      }
    }, 0);
  };
}

// Default tab
setTab("text");
