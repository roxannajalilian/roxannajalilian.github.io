// shared.js
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

function clearAppData() {
  localStorage.removeItem(APP_KEY);
}

// Redirect to start with a return destination
function requireAdult(nextPage) {
  const data = getAppData();
  if (!data.age || Number(data.age) < 18) {
    const next = encodeURIComponent(nextPage || "menu.html");
    window.location.replace(`start.html?next=${next}`);
  }
}

// Only allow returning to known pages
function safeNextFromURL() {
  const allowed = new Set([
    "menu.html",
    "quiz.html",
    "plan.html",
    "scan.html",
    "game.html",
    "privacy.html",
  ]);
  const p = new URLSearchParams(location.search);
  const n = p.get("next") || "menu.html";
  return allowed.has(n) ? n : "menu.html";
}
