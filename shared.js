/* shared.js */
const APP_KEY = "dd_app_v1";

function getAppData() {
  try { return JSON.parse(localStorage.getItem(APP_KEY) || "{}"); }
  catch { return {}; }
}
function setAppData(data) {
  localStorage.setItem(APP_KEY, JSON.stringify(data));
}

function isAdultVerified() {
  const d = getAppData();
  return Number(d.age) >= 18;
}

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
    "privacy.html"
  ]);

  // normalize to filename only
  const file = next.split("/").pop().split("?")[0].split("#")[0];
  return allowed.has(file) ? file : "menu.html";
}

/**
 * Call in protected pages:
 * <script src="shared.js"></script>
 * <script>requireAdult("menu.html");</script>
 */
function requireAdult(currentPage = "menu.html") {
  if (!isAdultVerified()) {
    location.replace(`start.html?next=${encodeURIComponent(currentPage)}`);
  }
}

function resetApp(hard = false) {
  localStorage.removeItem(APP_KEY);
  if (hard) location.replace("start.html");
}

function wireResetButtons() {
  document.querySelectorAll("[data-reset-app]").forEach(btn => {
    btn.addEventListener("click", () => resetApp(true));
  });
}

document.addEventListener("DOMContentLoaded", wireResetButtons);
