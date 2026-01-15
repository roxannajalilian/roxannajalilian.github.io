/* shared.js */
const APP_KEY = "dd_app_v1";

/* ---------- Storage helpers ---------- */
function getAppData() {
  try { return JSON.parse(localStorage.getItem(APP_KEY) || "{}"); }
  catch { return {}; }
}
function setAppData(data) {
  localStorage.setItem(APP_KEY, JSON.stringify(data));
}

/* ---------- Gate state ---------- */
function hasAcceptedTerms() {
  const d = getAppData();
  return d.termsAccepted === true;
}

function isAdultVerified() {
  const d = getAppData();
  return d.ageVerified === true && Number(d.age) >= 18;
}

function isLocked() {
  const d = getAppData();
  return d.locked === true;
}

/* ---------- Safe "next" handling ---------- */
function safeNextFromURL(defaultNext = "index.html") {
  const params = new URLSearchParams(location.search);
  const next = params.get("next") || defaultNext;

  // allow ONLY these pages (add more if you have them)
  const allowed = new Set([
    "index.html",
    "menu.html",
    "quiz.html",
    "plan.html",
    "scan.html",
    "game.html",
    "privacy.html",
    "age.html",
    "locked.html"
  ]);

  const file = next.split("/").pop().split("?")[0].split("#")[0];
  return allowed.has(file) ? file : defaultNext;
}


function requireGate(currentPage = "index.html") {
  const d = getAppData();

  if (d.locked === true) {
    location.replace("locked.html");
    return;
  }

  if (d.termsAccepted !== true) {
    location.replace(`privacy.html?next=${encodeURIComponent(currentPage)}`);
    return;
  }

  if (d.ageVerified !== true || Number(d.age) < 18) {
    location.replace(`age.html?next=${encodeURIComponent(currentPage)}`);
    return;
  }
}

/* ---------- Actions used by pages ---------- */
function acceptTerms() {
  const d = getAppData();
  d.termsAccepted = true;
  setAppData(d);
}

function verifyAge(ageNumber) {
  const age = Number(ageNumber);
  const d = getAppData();

  if (!age || age <= 0) return { ok: false, reason: "invalid" };

  d.age = age;

  if (age < 18) {
    d.locked = true;
    d.ageVerified = false;
    setAppData(d);
    return { ok: false, reason: "under18" };
  }

  d.ageVerified = true;
  d.locked = false;
  setAppData(d);
  return { ok: true };
}

/* ---------- Reset helpers ---------- */
function resetApp(hard = false) {
  localStorage.removeItem(APP_KEY);
  if (hard) location.replace("privacy.html");
}

function wireResetButtons() {
  document.querySelectorAll("[data-reset-app]").forEach(btn => {
    btn.addEventListener("click", () => resetApp(true));
  });
}
document.addEventListener("DOMContentLoaded", wireResetButtons);
