import { $, clamp, copyToClipboard } from "./utils.js";
import { appState, resetState } from "./state.js";
import { getQuestions, SCALE } from "./questions.js";
import { analyzeMessages } from "./analyzer.js";
import { createSpeechController } from "./speech.js";
import { initTabs } from "./tabs.js";
import { loadHistory, saveHistoryItem, clearHistory } from "./storage.js";
import { buildActionPlan } from "./coach.js";
import { drawInsightsChart } from "./chart.js";
import { downloadReport } from "./export.js";

/* ---------------------------
   DOM
---------------------------- */
const ageGate = $("ageGate");
const locked = $("locked");
const app = $("app");

const ageInput = $("ageInput");
const startBtn = $("startBtn");
const acceptPolicyChk = $("acceptPolicyChk");
const ageMsg = $("ageMsg");

const themeBtn = $("themeBtn");

const modePill = $("modePill");
const situationInput = $("situationInput");
const messagesInput = $("messagesInput");

const micBtn = $("micBtn");
const analyzeBtn = $("analyzeBtn");
const clearTextBtn = $("clearTextBtn");
const demoBtn = $("demoBtn");
const resetBtn = $("resetBtn");
const speechNotice = $("speechNotice");

const analysisBox = $("analysisBox");
const analysisSummary = $("analysisSummary");
const signalChips = $("signalChips");
const highlightedText = $("highlightedText");
const copyAnalysisBtn = $("copyAnalysisBtn");

const questionWrap = $("questionWrap");
const progressBar = $("progressBar");
const prevBtn = $("prevBtn");
const nextBtn = $("nextBtn");
const submitBtn = $("submitBtn");

const questionWrap2 = $("questionWrap2");
const progressBar2 = $("progressBar2");
const prevBtn2 = $("prevBtn2");
const nextBtn2 = $("nextBtn2");
const submitBtn2 = $("submitBtn2");

const resultBox = $("resultBox");
const scoreNum = $("scoreNum");
const tierPill = $("tierPill");
const adviceText = $("adviceText");

const saveBtn = $("saveBtn");
const exportBtn = $("exportBtn");
const newRunBtn = $("newRunBtn");

const historyList = $("historyList");
const refreshHistoryBtn = $("refreshHistoryBtn");
const clearHistoryBtn = $("clearHistoryBtn");

const planPill = $("planPill");
const planBox = $("planBox");
const regenPlanBtn = $("regenPlanBtn");
const copyPlanBtn = $("copyPlanBtn");

const insightsPill = $("insightsPill");
const insightsChart = $("insightsChart");
const shareCardBtn = $("shareCardBtn");
const refreshInsightsBtn = $("refreshInsightsBtn");

/* ---------------------------
   Tabs
---------------------------- */
const tabs = initTabs();

/* ---------------------------
   Theme
---------------------------- */
function applyThemeFromStorage() {
  const t = localStorage.getItem("dd_theme") || "dark";
  document.body.classList.toggle("light", t === "light");
  themeBtn.textContent = t === "light" ? "☀️" : "🌙";
}
applyThemeFromStorage();

themeBtn.addEventListener("click", () => {
  const isLight = document.body.classList.toggle("light");
  localStorage.setItem("dd_theme", isLight ? "light" : "dark");
  themeBtn.textContent = isLight ? "☀️" : "🌙";
});

/* ---------------------------
   Speech Controller
---------------------------- */
const speech = createSpeechController({
  onText: (t) => {
    situationInput.value = t;
    appState.situation = t;
  },
  onStatus: (msg) => showSpeech(msg)
});

function showSpeech(msg) {
  speechNotice.classList.remove("hidden");
  speechNotice.textContent = msg;
  setTimeout(() => speechNotice.classList.add("hidden"), 2500);
}

/* ---------------------------
   Age Gate
---------------------------- */
startBtn.addEventListener("click", () => {
  const age = Number(ageInput.value);
  const accepted = !!acceptPolicyChk.checked;

  ageMsg.classList.add("hidden");
  if (!accepted) {
    ageMsg.textContent = "Please accept Terms & Privacy to continue.";
    ageMsg.classList.remove("hidden");
    return;
  }
  if (!age || age < 1 || age > 120) {
    ageMsg.textContent = "Enter a valid age.";
    ageMsg.classList.remove("hidden");
    return;
  }

  appState.age = age;
  appState.acceptedPolicy = true;

  if (age < 13) {
    ageGate.classList.add("hidden");
    locked.classList.remove("hidden");
    app.classList.add("hidden");
    return;
  }

  appState.mode = age >= 18 ? "adult" : "teen";
  appState.qSet = appState.mode;

  ageGate.classList.add("hidden");
  locked.classList.add("hidden");
  app.classList.remove("hidden");

  modePill.textContent = `Mode: ${appState.mode.toUpperCase()}`;
  renderQuestionView();
  renderHistory();
  refreshInsights();
});

/* ---------------------------
   Inputs binding
---------------------------- */
situationInput.addEventListener("input", () => appState.situation = situationInput.value);
messagesInput.addEventListener("input", () => appState.messages = messagesInput.value);

/* ---------------------------
   Buttons: Scan area
---------------------------- */
micBtn.addEventListener("click", () => {
  if (!speech.supported) {
    showSpeech("Voice input not supported in this browser.");
    return;
  }
  speech.toggle();
  micBtn.textContent = speech.isRunning() ? "🛑 Stop voice" : "🎤 Voice to text";
});

clearTextBtn.addEventListener("click", () => {
  messagesInput.value = "";
  situationInput.value = "";
  appState.messages = "";
  appState.situation = "";
  analysisBox.classList.add("hidden");
});

demoBtn.addEventListener("click", () => {
  const demo = `You: hey what are you doing later?
Them: idk
You: wanna hang?
Them: maybe
You: ok what time
Them: busy lol
You: are you even into me?
Them: chill`;
  messagesInput.value = demo;
  appState.messages = demo;

  const sum = "They keep replying vague and short. I don’t know if they like me or not.";
  situationInput.value = sum;
  appState.situation = sum;

  runAnalysis();
});

resetBtn.addEventListener("click", () => {
  // Full reset
  resetState();
  location.reload();
});

analyzeBtn.addEventListener("click", runAnalysis);

copyAnalysisBtn.addEventListener("click", async () => {
  if (!appState.lastAnalysis) return;
  const lines = [];
  lines.push("Message analysis:");
  lines.push(appState.lastAnalysis.summary);
  if (appState.lastAnalysis.signals?.length) {
    lines.push("");
    lines.push("Signals:");
    appState.lastAnalysis.signals.forEach(s => lines.push(`- ${s.name} (${s.points}) — ${s.hints}`));
  }
  await copyToClipboard(lines.join("\n"));
  showSpeech("Copied analysis.");
});

/* ---------------------------
   Questionnaire Rendering (shared)
---------------------------- */
function renderQuestionView() {
  const questions = getQuestions(appState.qSet);

  // ensure index in range
  appState.qIndex = clamp(appState.qIndex, 0, questions.length - 1);

  // render both wraps to keep in sync
  renderOne(questionWrap, progressBar, prevBtn, nextBtn, submitBtn);
  renderOne(questionWrap2, progressBar2, prevBtn2, nextBtn2, submitBtn2);

  function renderOne(wrapEl, barEl, prevEl, nextEl, submitEl) {
    wrapEl.innerHTML = "";

    const q = questions[appState.qIndex];
    const chosen = appState.answers[q.id];

    const card = document.createElement("div");
    card.className = "qcard";

    const title = document.createElement("div");
    title.className = "qtitle";
    title.textContent = `Q${appState.qIndex + 1} — ${q.text}`;
    card.appendChild(title);

    const choices = document.createElement("div");
    choices.className = "choiceRow";

    SCALE.forEach(opt => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "choice" + (chosen === opt.value ? " active" : "");
      b.textContent = opt.label;
      b.addEventListener("click", () => {
        appState.answers[q.id] = opt.value;
        renderQuestionView(); // re-render both views
      });
      choices.appendChild(b);
    });

    card.appendChild(choices);

    const help = document.createElement("div");
    help.className = "qhelp";
    help.textContent = q.help || "";
    card.appendChild(help);

    wrapEl.appendChild(card);

    // progress
    const pct = Math.round(((appState.qIndex) / (questions.length - 1)) * 100);
    barEl.style.width = `${clamp(pct, 0, 100)}%`;

    // buttons state
    prevEl.disabled = appState.qIndex === 0;
    nextEl.classList.toggle("hidden", appState.qIndex >= questions.length - 1);
    submitEl.classList.toggle("hidden", appState.qIndex < questions.length - 1);

    prevEl.onclick = () => { appState.qIndex--; renderQuestionView(); };
    nextEl.onclick = () => { appState.qIndex++; renderQuestionView(); };
    submitEl.onclick = () => runScore();
  }
}

/* ---------------------------
   Scoring (questionnaire + text analysis)
---------------------------- */
function computeScore() {
  const questions = getQuestions(appState.qSet);
  const ans = appState.answers;

  // default unanswered = 2 (Sometimes) so user can still score
  let sumOverthink = 0;
  let sumEvidence = 0;
  let sumSignals = 0;
  let sumBoundaries = 0;
  let sumSelf = 0;

  let countMind = 0, countEvidence = 0, countSignals = 0, countBound = 0, countSelf = 0;

  for (const q of questions) {
    const v = (ans[q.id] ?? 2);
    // Map tags to metrics
    if (q.tag === "mind") { sumOverthink += v; countMind++; }
    if (q.tag === "evidence") { sumEvidence += v; countEvidence++; }
    if (q.tag === "signals") { sumSignals += v; countSignals++; }
    if (q.tag === "boundaries") { sumBoundaries += v; countBound++; }
    if (q.tag === "self") { sumSelf += v; countSelf++; }
  }

  const to100 = (sum, count) => count ? (sum / (count * 4)) * 100 : 50;

  // Higher mind = higher delulu
  const mind = to100(sumOverthink, countMind);

  // Higher evidence/boundaries/self reduce delulu, so invert contribution later
  const evidence = to100(sumEvidence, countEvidence);
  const signals = to100(sumSignals, countSignals);
  const boundaries = to100(sumBoundaries, countBound);
  const self = to100(sumSelf, countSelf);

  // message score
  const msgScore = appState.lastAnalysis?.score ?? 0;

  // Combine: mind + signals + msgScore increase; evidence/boundaries/self decrease
  const raw =
    (mind * 0.32) +
    (signals * 0.18) +
    (msgScore * 0.20) +
    ((100 - evidence) * 0.12) +
    ((100 - boundaries) * 0.10) +
    ((100 - self) * 0.08);

  const score = clamp(Math.round(raw), 0, 100);

  let tier = "Green Flag";
  if (score >= 70) tier = "High Delulu Risk";
  else if (score >= 40) tier = "Medium Delulu Risk";

  const advice = buildAdvice({ score, tier, mode: appState.mode });

  return {
    score,
    tier,
    metrics: {
      mind: Math.round(mind),
      signals: Math.round(signals),
      evidence: Math.round(evidence),
      boundaries: Math.round(boundaries),
      self: Math.round(self),
      msgScore: Math.round(msgScore)
    },
    advice
  };
}

function buildAdvice({ score, tier, mode }) {
  const teen = mode === "teen";

  if (tier === "Green Flag") {
    return teen
      ? "You seem mostly grounded. Keep it calm: ask one clear question, then watch actions. Don’t spiral over one reply."
      : "You’re pretty grounded. Keep it simple: clarity + consistency. Don’t over-read one message—look at patterns.";
  }

  if (tier === "Medium Delulu Risk") {
    return teen
      ? "Some overthinking is happening. Pause before texting, avoid stalking, and ask for clarity once—then step back and observe."
      : "You’re sliding into assumptions. Slow down, don’t chase reassurance, and ask for clarity once. Match effort; don’t over-invest.";
  }

  return teen
    ? "High spiral risk. Don’t send emotional paragraphs. Take a break, do something grounding, then choose a short clarity message + protect your dignity."
    : "High delulu risk. Stop chasing. Your next move should be calm clarity, then boundaries. If it stays inconsistent, step back.";
}

function runScore() {
  const scoreObj = computeScore();
  appState.lastScore = scoreObj;

  // render result
  resultBox.classList.remove("hidden");
  scoreNum.textContent = String(scoreObj.score);
  tierPill.textContent = scoreObj.tier;

  // tier colors via inline style
  tierPill.style.borderColor =
    scoreObj.tier === "Green Flag" ? "rgba(92,255,179,.55)" :
    scoreObj.tier === "Medium Delulu Risk" ? "rgba(255,211,106,.55)" :
    "rgba(255,107,107,.55)";

  adviceText.textContent = scoreObj.advice;

  // Build plan
  const plan = buildActionPlan({
    mode: appState.mode,
    score: scoreObj.score,
    situation: appState.situation,
    analysisSignals: appState.lastAnalysis?.signals || [],
    metrics: scoreObj.metrics
  });
  appState.lastPlan = plan;
  renderPlan();

  // Insights
  refreshInsights();

  // Jump to plan tab for “wow effect”
  tabs.setTab("plan");
}

newRunBtn.addEventListener("click", () => {
  // keep age/mode, clear run data
  appState.situation = "";
  appState.messages = "";
  appState.answers = {};
  appState.qIndex = 0;
  appState.lastAnalysis = null;
  appState.lastScore = null;
  appState.lastPlan = null;

  situationInput.value = "";
  messagesInput.value = "";
  analysisBox.classList.add("hidden");
  resultBox.classList.add("hidden");
  planBox.innerHTML = `<p class="muted">Get a score first, then come back here.</p>`;
  planPill.textContent = "Plan: —";

  renderQuestionView();
  refreshInsights();
  tabs.setTab("scan");
});

/* ---------------------------
   Analysis
---------------------------- */
function runAnalysis() {
  const res = analyzeMessages(messagesInput.value);
  appState.lastAnalysis = res;

  analysisBox.classList.remove("hidden");
  analysisSummary.textContent = `${res.summary} (Message score: ${res.score}/100)`;

  signalChips.innerHTML = "";
  res.signals.forEach(s => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = `${s.name} • +${s.points}`;
    chip.title = s.hints;
    signalChips.appendChild(chip);
  });

  highlightedText.innerHTML = res.highlightsHTML || "";

  // helpful: if user already has questionnaire done, refresh advice metrics
  if (appState.lastScore) {
    const updated = computeScore();
    appState.lastScore = updated;
    scoreNum.textContent = String(updated.score);
    tierPill.textContent = updated.tier;
    adviceText.textContent = updated.advice;
    refreshInsights();
    renderPlan();
  }
}

/* ---------------------------
   History
---------------------------- */
saveBtn.addEventListener("click", () => {
  if (!appState.lastScore) return;

  const item = {
    mode: appState.mode,
    score: appState.lastScore.score,
    tier: appState.lastScore.tier,
    situation: (appState.situation || "").slice(0, 180),
    metrics: appState.lastScore.metrics,
  };
  saveHistoryItem(item);
  renderHistory();
  showSpeech("Saved.");
});

exportBtn.addEventListener("click", () => {
  if (!appState.lastScore) return;
  downloadReport(appState, appState.lastScore);
});

refreshHistoryBtn.addEventListener("click", renderHistory);

clearHistoryBtn.addEventListener("click", () => {
  clearHistory();
  renderHistory();
  showSpeech("History cleared.");
});

function renderHistory() {
  const history = loadHistory();
  historyList.innerHTML = "";

  if (!history.length) {
    historyList.innerHTML = `<div class="muted small">No saved results yet.</div>`;
    return;
  }

  history.forEach((h) => {
    const div = document.createElement("div");
    div.className = "hitem";

    const meta = document.createElement("div");
    meta.className = "hmeta";
    meta.textContent = `${new Date(h.savedAt).toLocaleString()} • ${h.mode.toUpperCase()}`;
    div.appendChild(meta);

    const row = document.createElement("div");
    row.className = "hrow";
    row.innerHTML = `
      <div><b>${h.score}/100</b> — <span class="muted">${h.tier}</span></div>
      <button class="btn ghost" type="button">Load</button>
    `;
    const loadBtn = row.querySelector("button");
    loadBtn.addEventListener("click", () => {
      // load into current display (not restoring answers; just showing previous result)
      appState.lastScore = {
        score: h.score,
        tier: h.tier,
        metrics: h.metrics,
        advice: buildAdvice({ score: h.score, tier: h.tier, mode: appState.mode })
      };
      scoreNum.textContent = String(h.score);
      tierPill.textContent = h.tier;
      adviceText.textContent = appState.lastScore.advice;
      resultBox.classList.remove("hidden");
      refreshInsights();
      tabs.setTab("insights");
    });

    div.appendChild(row);

    if (h.situation) {
      const s = document.createElement("div");
      s.className = "muted small";
      s.textContent = h.situation;
      div.appendChild(s);
    }

    historyList.appendChild(div);
  });
}

/* ---------------------------
   Action Plan
---------------------------- */
regenPlanBtn.addEventListener("click", () => {
  if (!appState.lastScore) {
    showSpeech("Get a score first.");
    return;
  }
  appState.lastPlan = buildActionPlan({
    mode: appState.mode,
    score: appState.lastScore.score,
    situation: appState.situation,
    analysisSignals: appState.lastAnalysis?.signals || [],
    metrics: appState.lastScore.metrics
  });
  renderPlan();
});

copyPlanBtn.addEventListener("click", async () => {
  if (!appState.lastPlan) return;
  const p = appState.lastPlan;
  const text = [
    `Action Plan: ${p.title}`,
    p.wait,
    "",
    "Reality checks:",
    ...p.reality.map(x => `- ${x}`),
    "",
    `Next move: ${p.nextMove}`,
    "",
    "Reply options:",
    `Gentle: ${p.replies.gentle}`,
    `Confident: ${p.replies.confident}`,
    `Boundary: ${p.replies.boundary}`,
    "",
    "Don’t do:",
    ...p.dont.map(x => `- ${x}`)
  ].join("\n");
  await copyToClipboard(text);
  showSpeech("Copied plan.");
});

function renderPlan() {
  if (!appState.lastPlan || !appState.lastScore) {
    planBox.innerHTML = `<p class="muted">Get a score first, then come back here.</p>`;
    planPill.textContent = "Plan: —";
    return;
  }

  const p = appState.lastPlan;
  planPill.textContent = `Plan: ${p.title}`;

  planBox.innerHTML = `
    <div class="box">
      <h3>Step 1 — Pause</h3>
      <div class="muted">${p.wait}</div>
    </div>

    <div class="box">
      <h3>Step 2 — Reality check</h3>
      <ul class="bullets">${p.reality.map(x => `<li>${x}</li>`).join("")}</ul>
    </div>

    <div class="box">
      <h3>Step 3 — Next move</h3>
      <div class="muted">${p.nextMove}</div>
    </div>

    <div class="box">
      <h3>Reply options</h3>
      <div><b>Gentle:</b> ${escapeHTML(p.replies.gentle)}</div>
      <div><b>Confident:</b> ${escapeHTML(p.replies.confident)}</div>
      <div><b>Boundary:</b> ${escapeHTML(p.replies.boundary)}</div>
    </div>

    <div class="box">
      <h3>Don’t do these</h3>
      <ul class="bullets">${p.dont.map(x => `<li>${escapeHTML(x)}</li>`).join("")}</ul>
    </div>
  `;
}

/* ---------------------------
   Insights + Share Card
---------------------------- */
refreshInsightsBtn.addEventListener("click", refreshInsights);

shareCardBtn.addEventListener("click", () => {
  if (!appState.lastScore) {
    showSpeech("Get a score first.");
    return;
  }
  const dataURL = makeShareCard(appState);
  const a = document.createElement("a");
  a.href = dataURL;
  a.download = "delulu-share-card.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
});

function refreshInsights() {
  const scoreObj = appState.lastScore;
  if (!scoreObj) {
    insightsPill.textContent = "Insights: —";
    drawInsightsChart(insightsChart, { mind: 0, signals: 0, evidence: 0, boundaries: 0, self: 0 });
    return;
  }
  insightsPill.textContent = `Insights: ${scoreObj.tier}`;
  drawInsightsChart(insightsChart, {
    mind: scoreObj.metrics.mind,
    signals: scoreObj.metrics.signals,
    evidence: scoreObj.metrics.evidence,
    boundaries: scoreObj.metrics.boundaries,
    self: scoreObj.metrics.self
  });
}

/* Share card generator (canvas) */
function makeShareCard(state) {
  const c = document.createElement("canvas");
  c.width = 1200;
  c.height = 630;
  const ctx = c.getContext("2d");

  // background
  ctx.fillStyle = "#0f1020";
  ctx.fillRect(0,0,c.width,c.height);

  // accent blob
  ctx.fillStyle = "rgba(143,140,255,0.25)";
  ctx.beginPath();
  ctx.arc(980, 160, 220, 0, Math.PI*2);
  ctx.fill();

  // card
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  roundRect(ctx, 60, 60, 1080, 510, 36);
  ctx.fill();

  // title
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "800 52px system-ui";
  ctx.fillText("Delulu Detector", 110, 150);

  const score = state.lastScore?.score ?? 0;
  const tier = state.lastScore?.tier ?? "—";

  // score big
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.font = "1000 120px system-ui";
  ctx.fillText(String(score), 110, 290);

  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = "700 34px system-ui";
  ctx.fillText("/ 100", 290, 290);

  // tier
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.font = "800 44px system-ui";
  ctx.fillText(tier, 110, 360);

  // metrics
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.font = "600 28px system-ui";
  const m = state.lastScore?.metrics || {};
  const lines = [
    `Mind: ${m.mind ?? 0}`,
    `Signals: ${m.signals ?? 0}`,
    `Evidence: ${m.evidence ?? 0}`,
    `Boundaries: ${m.boundaries ?? 0}`,
    `Self: ${m.self ?? 0}`,
  ];
  lines.forEach((t, i) => ctx.fillText(t, 110, 420 + i*38));

  // footer
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "600 22px system-ui";
  ctx.fillText("Local-only • No server • Built with HTML/CSS/JS", 110, 560);

  return c.toDataURL("image/png");
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr, y);
  ctx.arcTo(x+w, y, x+w, y+h, rr);
  ctx.arcTo(x+w, y+h, x, y+h, rr);
  ctx.arcTo(x, y+h, x, y, rr);
  ctx.arcTo(x, y, x+w, y, rr);
  ctx.closePath();
}

function escapeHTML(s) {
  return (s || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
renderQuestionView();
