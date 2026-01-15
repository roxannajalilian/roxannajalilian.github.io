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
function safeNextFromURL() {
  const params = new URLSearchParams(location.search);
  const next = params.get("next") || "menu.html";

  // allow ONLY these pages
  const allowed = new Set([
    "menu.html",
    "quiz.html",
    "plan.html",
    "scan.html",
    "game.html",
    "privacy.html",
    "age.html",
    "locked.html",
    "start.html",
    "index.html"
  ]);

  // normalize to filename only
  const file = next.split("/").pop().split("?")[0].split("#")[0];
  return allowed.has(file) ? file : "menu.html";
}

/* ---------- Main guard (use on protected pages) ---------- */
/**
 * Use on ALL protected pages (menu/quiz/plan/scan/game/etc):
 * <script src="shared.js"></script>
 * <script>requireGate("menu.html");</script>
 *
 * Do NOT use on: privacy.html, age.html, locked.html, start.html
 */
function requireGate(currentPage = "menu.html") {
  const d = getAppData();

  // If locked, always redirect to locked page
  if (d.locked === true) {
    location.replace("locked.html");
    return;
  }

  // Must accept terms first
  if (d.termsAccepted !== true) {
    location.replace(`privacy.html?next=${encodeURIComponent(currentPage)}`);
    return;
  }

  // Then must verify age
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
