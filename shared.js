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

function isVerified() {
  const d = getAppData();
  return Number(d.age) >= 18 && d.termsAccepted === true;
}

// Backwards-compatible: allow requireAdult("somepage.html") too
function requireAdult(_optionalPageName) {
  if (!isVerified()) {
  
    const next = encodeURIComponent(window.location.pathname.split("/").pop() || "menu.html");
    window.location.replace(`privacy.html?next=${next}`);
  }
}

// safe next page from URL like privacy.html?next=quiz.html
function safeNextFromURL(defaultPage = "menu.html") {
  const sp = new URLSearchParams(window.location.search);
  const next = (sp.get("next") || defaultPage).trim();

  // prevent weird redirects
  const allowed = new Set([
    "menu.html", "quiz.html", "plan.html", "scan.html", "game.html"
  ]);

  return allowed.has(next) ? next : defaultPage;
}

function resetApp() {
  localStorage.removeItem(APP_KEY);
}
