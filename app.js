// ===============================
// Delulu Detector - app.js
// One file handles: age gate, menu badge, quiz, results, plan page
// ===============================

const STORAGE_KEY = "dd_latest_result_v1";

// ---------- Shared helpers ----------
function $(sel){ return document.querySelector(sel); }
function setMsg(id, text=""){ const el = $(id); if(el) el.textContent = text; }

function saveLatestResult(result){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
}
function loadLatestResult(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(e){
    return null;
  }
}
function clearLatestResult(){
  localStorage.removeItem(STORAGE_KEY);
}

function updatePlanBadge(){
  const badge = $("#planBadge");
  if(!badge) return;

  const res = loadLatestResult();
  if(!res || typeof res.percent !== "number"){
    badge.textContent = "–";
    return;
  }
  badge.textContent = `${res.percent}%`;
}

// ---------- Scoring text ----------
function getLabelAndAdvice(percent){
  // You can tweak these ranges to match your teacher rubric
  if(percent <= 25){
    return {
      label: "Low overthinking (pretty grounded)",
      advice:
        "You usually read situations realistically. Keep doing quick reality-checks: ask yourself what facts you actually have vs what you’re assuming."
    };
  }
  if(percent <= 50){
    return {
      label: "Mild overthinking (sometimes spirals)",
      advice:
        "You can get pulled into ‘what if’ thoughts. Try a 2-minute rule: write one fact, one assumption, and one action you can do right now."
    };
  }
  if(percent <= 75){
    return {
      label: "High overthinking (strong pattern)",
      advice:
        "Your brain fills gaps fast. Before reacting, pause + label the story you’re telling yourself, then look for 2 alternative explanations that are also possible."
    };
  }
  return {
    label: "Extreme overthinking (spiral mode)",
    advice:
      "You’re likely stuck in anxious interpretation. Do a reset: slow breathing for 60 seconds, then message/act only after you’ve written what you KNOW vs what you FEEL."
  };
}

// ---------- Page detection ----------
document.addEventListener("DOMContentLoaded", () => {
  updatePlanBadge();

  // AGE GATE
  const ageBtn = $("#ageBtn");
  if(ageBtn){
    ageBtn.addEventListener("click", () => {
      const age = Number($("#ageInput")?.value || 0);
      const msg = $("#ageMsg");
      if(!age || age < 1){
        msg.textContent = "Enter a real age.";
        msg.style.color = "#ff5b6a";
        return;
      }
      if(age < 18){
        msg.textContent = "Sorry — this app is 18+. You can’t continue.";
        msg.style.color = "#ff5b6a";
        // Optional lockout:
        // window.location.href = "index.html";
        return;
      }
      msg.textContent = "Approved. Redirecting…";
      msg.style.color = "#4fe3d1";
      window.location.href = "menu.html";
    });
  }

  // QUIZ
  if($("#quizCard")){
    initQuiz();
  }

  // PLAN
  if($("#planScore")){
    initPlan();
  }
});

// ===============================
// QUIZ LOGIC
// ===============================
function initQuiz(){
  const questions = [
    "I overthink even when nothing is clearly wrong.",
    "I reread texts to figure out hidden meaning.",
    "I assume silence means something bad.",
    "I imagine worst-case outcomes quickly.",
    "I need reassurance to feel calm.",
    "I replay conversations in my head afterwards.",
    "I overanalyze tone, punctuation, or emojis.",
    "I struggle to focus because of 'what if' thoughts.",
    "I take things personally even without proof.",
    "I find it hard to stop thinking once I start."
  ];

  // scale: 1-5
  const choices = [
    { label:"Strongly Disagree", value:1 },
    { label:"Disagree", value:2 },
    { label:"Neutral", value:3 },
    { label:"Agree", value:4 },
    { label:"Strongly Agree", value:5 }
  ];

  let index = 0;
  let answers = new Array(questions.length).fill(null);

  const progressText = $("#progressText");
  const questionText  = $("#questionText");
  const optionsWrap   = $("#options");
  const msgEl         = $("#quizMsg");

  const backBtn = $("#backBtn");
  const nextBtn = $("#nextBtn");
  const returnBtnTop = $("#returnBtnTop");

  const quizCard = $("#quizCard");
  const resultsCard = $("#resultsCard");

  const restartBtn = $("#restartBtn");

  function render(){
    // safety
    if(index < 0) index = 0;
    if(index > questions.length) index = questions.length;

    // Update UI
    progressText.textContent = `Question ${index + 1} of ${questions.length}`;
    questionText.textContent = questions[index];

    optionsWrap.innerHTML = "";
    msgEl.textContent = "";

    choices.forEach((c) => {
      const btn = document.createElement("div");
      btn.className = "opt";
      btn.setAttribute("role", "button");
      btn.setAttribute("tabindex", "0");
      btn.innerHTML = `<span>${c.label}</span><strong>${c.value}</strong>`;

      if(answers[index] === c.value) btn.classList.add("selected");

      btn.addEventListener("click", () => {
        answers[index] = c.value;
        [...optionsWrap.children].forEach(x => x.classList.remove("selected"));
        btn.classList.add("selected");
        msgEl.textContent = "";
      });

      btn.addEventListener("keydown", (e) => {
        if(e.key === "Enter" || e.key === " "){
          e.preventDefault();
          btn.click();
        }
      });

      optionsWrap.appendChild(btn);
    });

    backBtn.disabled = index === 0;
    backBtn.style.opacity = backBtn.disabled ? "0.6" : "1";
  }

  function computeResult(){
    // If any unanswered remain, block
    if(answers.some(a => a === null)) return null;

    const total = answers.reduce((sum, v) => sum + v, 0);
    const max = questions.length * 5;
    const percent = Math.round((total / max) * 100);

    const { label, advice } = getLabelAndAdvice(percent);

    return {
      percent,
      label,
      advice,
      total,
      max,
      answers,
      timestamp: Date.now()
    };
  }

  function showResults(result){
    // Save
    saveLatestResult(result);
    updatePlanBadge();

    // Swap screens
    quizCard.style.display = "none";
    resultsCard.style.display = "block";

    // Inject
    $("#scorePercent").textContent = `${result.percent}%`;
    $("#scoreLabel").textContent = result.label;
    $("#scoreAdvice").textContent = result.advice;
  }

  backBtn.addEventListener("click", () => {
    msgEl.textContent = "";
    index--;
    render();
  });

  nextBtn.addEventListener("click", () => {
    if(answers[index] === null){
      msgEl.textContent = "Pick an answer before continuing.";
      return;
    }

    // if last question -> results
    if(index === questions.length - 1){
      const result = computeResult();
      if(!result){
        msgEl.textContent = "Answer every question first.";
        return;
      }
      showResults(result);
      return;
    }

    index++;
    render();
  });

  // Return button (TOP) - FIXED + consistent
  returnBtnTop.addEventListener("click", () => {
    window.location.href = "menu.html";
  });

  restartBtn?.addEventListener("click", () => {
    index = 0;
    answers = new Array(questions.length).fill(null);
    resultsCard.style.display = "none";
    quizCard.style.display = "block";
    render();
  });

  // Start
  render();
}

// ===============================
// PLAN PAGE LOGIC
// ===============================
function initPlan(){
  const scoreEl = $("#planScore");
  const labelEl = $("#planLabel");
  const stepsEl = $("#planSteps");
  const clearBtn = $("#clearBtn");

  function renderPlan(){
    const res = loadLatestResult();
    updatePlanBadge();

    if(!res){
      scoreEl.textContent = "–%";
      labelEl.textContent = "Take the quiz to generate a plan.";
      stepsEl.innerHTML = `
        <li>Take the quiz and answer honestly.</li>
        <li>Your plan will show here based on your result.</li>
        <li>The Plan badge in the menu will display your latest score.</li>
      `;
      return;
    }

    scoreEl.textContent = `${res.percent}%`;
    labelEl.textContent = res.label;

    // Step plan based on range
    let steps = [];
    if(res.percent <= 25){
      steps = [
        "Keep using facts-first thinking (what you KNOW vs what you assume).",
        "If you feel doubt, wait 10 minutes before reacting.",
        "Keep your communication direct: ask, don’t guess."
      ];
    } else if(res.percent <= 50){
      steps = [
        "Do a quick reality-check: 1 fact, 1 assumption, 1 next action.",
        "Limit rereading messages: read once, respond once.",
        "Use a distraction reset: water + short walk + come back."
      ];
    } else if(res.percent <= 75){
      steps = [
        "Write the story your brain is making, then list 2 other possible stories.",
        "Set a timer: you get 5 minutes to think, then you must do one action.",
        "Ask a clarifying question instead of mind-reading."
      ];
    } else {
      steps = [
        "Do a 60-second calm reset (slow breathing) before any reply.",
        "Stop doom-scrolling texts: put the phone down for 15 minutes.",
        "Talk to someone you trust or use a support resource if anxiety feels intense."
      ];
    }

    stepsEl.innerHTML = steps.map(s => `<li>${s}</li>`).join("");
  }

  clearBtn.addEventListener("click", () => {
    clearLatestResult();
    renderPlan();
  });

  renderPlan();
}


document.addEventListener("DOMContentLoaded", () => {
  const isPlanPage = location.pathname.toLowerCase().includes("plan");
  const planLink =
    document.querySelector('nav a[href*="plan"]') ||
    document.querySelector('.nav a[href*="plan"]') ||
    document.querySelector('.topnav a[href*="plan"]') ||
    document.querySelector('.menu a[href*="plan"]');

  if (isPlanPage && planLink) {
    planLink.classList.add("is-active-plan");
  }
});
