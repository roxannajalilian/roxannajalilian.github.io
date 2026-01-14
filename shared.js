const APP_KEY = "dd_app_v1";

function getAppData() {
  try {
    return JSON.parse(localStorage.getItem(APP_KEY) || "{}");
  } catch {
    return {};
  }
}

function setAppData(data) {
  localStorage.setItem(APP_KEY, JSON.stringify(data));
}

/**
 * Get ?next=page.html safely. Only allow your own pages.
 * If missing or invalid, returns "menu.html".
 */
function safeNextFromURL() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");

  const allow = new Set([
    "menu.html",
    "quiz.html",
    "plan.html",
    "scan.html",
    "game.html",
    "privacy.html",
    "start.html"
  ]);

  if (!next) return "menu.html";

  // remove any path tricks (only filename)
  const clean = next.split("/").pop();

  return allow.has(clean) ? clean : "menu.html";
}

/**
 * Call this at the TOP of protected pages (menu/quiz/plan/scan/game).
 * If not verified 18+, bounce to start.html?next=<this page>.
 */
function requireAdult(pageName = "menu.html") {
  const data = getAppData();
  const age = Number(data?.age);

  if (!age || age < 18) {
    window.location.replace(`start.html?next=${encodeURIComponent(pageName)}`);
  }
}
