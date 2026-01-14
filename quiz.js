// quiz.js (FULL FILE)
// Adds: selected color when you click an answer + stays selected when going Previous

(() => {
  const APP_KEY = "dd_app_v1";

  function getAppData() {
    try { return JSON.parse(localStorage.getItem(APP_KEY) || "{}"); }
    catch { return {}; }
  }
  function setAppData(d) {
    localStorage.setItem(APP_KEY, JSON.stringify(d));
  }

  const $ = (id) => document.getElementById(id);

  // Status + debug
  const jsStatus = $("jsStatus");
  const debugMsg = $("debugMsg");
  function debug(text) {
    if (!debugMsg) return;
    debugMsg.style.display = "block";
    debugMsg.textContent = text;
  }

  // show script loaded
  if (jsStatus) jsStatus.textContent = "JS: LOADED ✅";

  // Age gate
  const user = getAppData();
  if (!user.age || Number(user.age) < 18) {
    window.location.replace("start.html");
    return;
  }

  // Required DOM
  const qCount = $("qCount");
  const progressBadge = $("progressBadge");
  const questionText = $("questionText");
  const questionHint = $("questionHint");
  const prevBtn = $("prevBtn");
  const restartBtnTop = $("restartBtnTop");
  const restartQuiz = $("restartQuiz");

  const resultArea = $("resultArea");
  const bar = $("bar");
  const percentText = $("percentText");
  const adviceText = $("adviceText");

  const choiceButtons = Array.from(document.querySelectorAll("button[data-val]"));

  if (
    !qCount || !progressBadge || !questionText || !questionHint ||
    !prevBtn || !restartBtnTop || !resultArea || !bar ||
    !percentText || !adviceText || choiceButtons.length === 0
  ) {
    debug("Quiz page HTML is missing required elements. Make sure you pasted quiz.html exactly.");
    if (jsStatus) jsStatus.textContent = "JS: ERROR ❌";
    return;
  }

  // Questions
  const questions = [
    { q: "Do you reread texts to find hidden meaning?", h: "Searching for clues in one word." },
    { q: "Do you assume silence means they’re mad or losing interest?", h: "No reply = panic." },
    { q: "Do you overthink punctuation (… / lol / k)?", h: "Dot dot dot trauma." },
    { q: "Do you check activity for hints?", h: "Detective mode." },
    { q: "Do you type/delete/retype a reply a lot?", h: "Pressure to be perfect." },
    { q: "Do you double-text because you feel ignored?", h: "Chase mode." },
    { q: "Do you replay the convo in your head for hours?", h: "Looping thoughts." },
    { q: "Do you ignore signs because you want it to work?", h: "Hope goggles." },
    { q: "Does your mood depend on their reply?", h: "High/low based on texts." },
    { q: "Do you excuse disrespect (dry/rude/disappearing)?", h: "Bare minimum defense." }
  ];

  // State
  let idx = 0;
  const answers = new Array(questions.length).fill(null);

  function answeredCount() {
    return answers.filter(v => v !== null).length;
  }

  function scoreNow() {
    return answers.reduce((s, v) => s + (v ?? 0), 0);
  }

  // ✅ NEW: highlight chosen answer
  function highlightSelected() {
    choiceButtons.forEach(btn => btn.classList.remove("selected"));
    if (answers[idx] !== null) {
      const match = choiceButtons.find(b => Number(b.dataset.val) === answers[idx]);
      if (match) match.classList.add("selected");
    }
  }

  function render() {
    const done = answeredCount();

    qCount.textContent = `Question ${idx + 1}/${questions.length}`;
    progressBadge.textContent = `${Math.round((done / questions.length) * 100)}% done`;

    questionText.textContent = questions[idx].q;
    questionHint.textContent = questions[idx].h;

    prevBtn.disabled = (idx === 0);
    resultArea.style.display = "none";

    highlightSelected(); // ✅ keeps selected color when you go back

    if (jsStatus) jsStatus.textContent = "JS: RUNNING ✅";
    if (debugMsg) debugMsg.style.display = "none";
  }

  function finish() {
    const max = 3 * questions.length;
    const percent = Math.round((scoreNow() / max) * 100);

    const advice =
      percent >= 80 ? "MAX delulu 🚨 — stop chasing, watch actions." :
      percent >= 60 ? "High delulu — pause before replying, don’t double-text." :
      percent >= 40 ? "Half-delulu 😭 — ask once then step back." :
      percent >= 20 ? "Slight overthink — focus on patterns." :
                      "Super grounded ✅ — keep standards.";

    const data = getAppData();
    data.lastQuiz = { percent, answers, savedAt: Date.now() };
    setAppData(data);

    resultArea.style.display = "block";
    bar.style.width = `${percent}%`;
    percentText.textContent = `${percent}%`;
    adviceText.textContent = advice;

    if (jsStatus) jsStatus.textContent = "JS: DONE ✅";
  }

  function next() {
    if (idx >= questions.length - 1) {
      const firstUnanswered = answers.findIndex(v => v === null);
      if (firstUnanswered !== -1) {
        idx = firstUnanswered;
        render();
        debug("Answer the skipped question before finishing.");
        return;
      }
      finish();
      return;
    }
    idx++;
    render();
  }

  // ✅ NEW: click handler highlights then moves next after a tiny delay
  choiceButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const val = Number(btn.dataset.val);
      answers[idx] = val;

      highlightSelected(); // show selected state

      // delay so you SEE the color before switching questions
      setTimeout(() => {
        next();
      }, 180);
    });
  });

  prevBtn.addEventListener("click", () => {
    if (idx > 0) idx--;
    render();
  });

  function restartAll() {
    for (let k = 0; k < answers.length; k++) answers[k] = null;
    idx = 0;
    render();
  }

  restartBtnTop.addEventListener("click", restartAll);
  if (restartQuiz) restartQuiz.addEventListener("click", restartAll);

  // Start
  render();
})();
