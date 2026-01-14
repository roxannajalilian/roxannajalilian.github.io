(() => {
  const APP_KEY = "dd_app_v1";
  function getAppData() {
    try { return JSON.parse(localStorage.getItem(APP_KEY) || "{}"); }
    catch { return {}; }
  }
  function setAppData(data) {
    localStorage.setItem(APP_KEY, JSON.stringify(data));
  }

  // 18+ gate
  const gate = getAppData();
  if (!gate.age || Number(gate.age) < 18) {
    window.location.replace("start.html");
    return;
  }

  const questions = [
    { q: "Do you reread texts to find hidden meaning?", h: "Like searching for clues in one word." },
    { q: "Do you assume silence means they’re mad or losing interest?", h: "No reply = panic." },
    { q: "Do you overthink punctuation (… / lol / k)?", h: "Dot dot dot trauma." },
    { q: "Do you check activity (views, snaps, followers) for hints?", h: "Detective mode." },
    { q: "Do you type a reply, delete it, retype it 10 times?", h: "Pressure to be perfect." },
    { q: "Do you double-text because you feel ignored?", h: "Chase mode." },
    { q: "Do you replay the convo in your head for hours?", h: "Looping thoughts." },
    { q: "Do you ignore obvious signs because you want it to work?", h: "Hope goggles." },
    { q: "Does your mood depend on their reply?", h: "High/low based on texts." },
    { q: "Do you excuse disrespect (dry/rude/disappearing)?", h: "Bare minimum defense." }
  ];

  // ===== DOM =====
  const qCount = document.getElementById("qCount");
  const progressBadge = document.getElementById("progressBadge");
  const questionText = document.getElementById("questionText");
  const questionHint = document.getElementById("questionHint");

  const prevBtn = document.getElementById("prevBtn");
  const restartBtn = document.getElementById("restartBtn");

  const resultArea = document.getElementById("resultArea");
  const bar = document.getElementById("bar");
  const percentText = document.getElementById("percentText");
  const adviceText = document.getElementById("adviceText");
  const goPlanBtn = document.getElementById("goPlanBtn");
  const backMenuBtn = document.getElementById("backMenuBtn");

  // IMPORTANT: these buttons MUST exist in quiz.html and must have data-val + class "choice"
  const choiceButtons = Array.from(document.querySelectorAll("button[data-val]"));

  // ===== STATE =====
  let idx = 0;
  const answers = new Array(questions.length).fill(null); // values 0..3

  function answeredCount() {
    return answers.filter(v => v !== null).length;
  }

  function clearChoiceClasses(btn) {
    btn.classList.remove("selected", "sel-0", "sel-1", "sel-2", "sel-3", "tap");
  }

  function highlightSelected() {
    // remove highlight everywhere first
    choiceButtons.forEach(clearChoiceClasses);

    // if we have an answer for this idx, highlight the matching button
    const v = answers[idx];
    if (v === null) return;

    const match = choiceButtons.find(b => Number(b.dataset.val) === v);
    if (!match) return;

    match.classList.add("selected", `sel-${v}`);
  }

  function render() {
    qCount.textContent = `Question ${idx + 1}/${questions.length}`;
    progressBadge.textContent = `${Math.round((answeredCount() / questions.length) * 100)}% done`;

    questionText.textContent = questions[idx].q;
    questionHint.textContent = questions[idx].h;

    prevBtn.disabled = idx === 0;
    resultArea.style.display = "none";

    highlightSelected(); // keeps color when going back
  }

  function finish() {
    const total = answers.reduce((s, v) => s + (v ?? 0), 0);
    const max = 3 * questions.length;
    const percent = Math.round((total / max) * 100);

    let advice =
      percent >= 85 ? "Ultra delulu 😭 — pause, don’t chase, ask once, then step back hard." :
      percent >= 70 ? "High delulu — get clarity, stop filling silence, watch actions not words." :
      percent >= 50 ? "Half-delulu — you’re spiraling a bit. Ground yourself & set boundaries." :
      percent >= 30 ? "Mild overthink — focus on patterns, not one message." :
                      "Pretty grounded — stay calm and direct.";

    // Save to Plan
    const data = getAppData();
    data.lastQuiz = { percent, answers: [...answers], savedAt: Date.now() };
    setAppData(data);

    bar.style.width = `${percent}%`;
    percentText.textContent = `${percent}%`;
    adviceText.textContent = advice;

    resultArea.style.display = "block";
    highlightSelected();
  }

  function next() {
    // if last question, finish
    if (idx >= questions.length - 1) {
      finish();
      return;
    }
    idx++;
    render();
  }

  // ===== EVENTS =====
  choiceButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const val = Number(btn.dataset.val);

      // save answer
      answers[idx] = val;

      // visual tap + highlight
      choiceButtons.forEach(clearChoiceClasses);
      btn.classList.add("tap");

      // add selected + color class
      setTimeout(() => {
        btn.classList.remove("tap");
        btn.classList.add("selected", `sel-${val}`);

        // small delay so you SEE the color
        setTimeout(() => next(), 180);
      }, 40);
    });
  });

  prevBtn.addEventListener("click", () => {
    if (idx > 0) idx--;
    render();
  });

  restartBtn.addEventListener("click", () => {
    idx = 0;
    for (let i = 0; i < answers.length; i++) answers[i] = null;
    resultArea.style.display = "none";
    bar.style.width = "0%";
    percentText.textContent = "—%";
    adviceText.textContent = "";
    render();
  });

  goPlanBtn?.addEventListener("click", () => {
    window.location.href = "plan.html";
  });

  backMenuBtn?.addEventListener("click", () => {
    window.location.href = "menu.html";
  });

  // boot
  render();
})();
