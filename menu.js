import { requireAdultOrRedirect, getData, setData } from "./gate.js";

requireAdultOrRedirect();

const welcomeTag = document.getElementById("welcomeTag");
const lastQuiz = document.getElementById("lastQuiz");
const lastQuizSub = document.getElementById("lastQuizSub");
const lastScan = document.getElementById("lastScan");
const lastScanSub = document.getElementById("lastScanSub");
const lastGame = document.getElementById("lastGame");
const lastGameSub = document.getElementById("lastGameSub");
const msg = document.getElementById("msg");

const resetBtn = document.getElementById("resetBtn");
const readBtn = document.getElementById("readBtn");
const readBtn2 = document.getElementById("readBtn2");

function setText(el, text){ if (el) el.textContent = text; }

readBtn?.addEventListener("click", () => {
  if (msg) msg.textContent = "Read aloud coming soon.";
});

readBtn2?.addEventListener("click", () => {
  if (msg) msg.textContent = "Read aloud coming soon.";
});

function loadStats(){
  const data = getData();

  // Header tag
  const age = data?.age ? `${data.age}+` : "—";
  setText(welcomeTag, `Age: ${age} • Saved`);

  // Quiz
  if (typeof data?.lastQuizScore === "number") {
    setText(lastQuiz, `${data.lastQuizScore}%`);
    setText(lastQuizSub, `Saved result`);
  } else {
    setText(lastQuiz, "—");
    setText(lastQuizSub, "No quiz yet");
  }

  // Scan
  if (typeof data?.lastScanScore === "number") {
    setText(lastScan, `${data.lastScanScore}%`);
    setText(lastScanSub, `Saved result`);
  } else {
    setText(lastScan, "—");
    setText(lastScanSub, "No scan yet");
  }

  // Game
  if (typeof data?.lastGameScore === "number") {
    setText(lastGame, `${data.lastGameScore}`);
    setText(lastGameSub, `Saved score`);
  } else {
    setText(lastGame, "—");
    setText(lastGameSub, "No game yet");
  }
}

resetBtn?.addEventListener("click", () => {
  setData({});
  loadStats();
  if (msg) msg.textContent = "Reset done.";
});

loadStats();
