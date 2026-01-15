/* shared.js */
const APP_KEY = "dd_app_v1";

/* storage */
function getAppData() {
  try { return JSON.parse(localStorage.getItem(APP_KEY) || "{}"); }
  catch { return {}; }
}
function setAppData(d) {
  localStorage.setItem(APP_KEY, JSON.stringify(d));
}

/* state */
function hasAcceptedTerms() {
  return getAppData().termsAccepted === true;
}
function isAdultVerified() {
  const d = getAppData();
  return d.ageVerified === true && Number(d.age) >= 18;
}
function isLocked() {
  return getAppData().locked === true;
}

/* safe next */
function safeNextFromURL(defaultNext = "menu.html") {
  const params = new URLSearchParams(location.search);
  const next = params.get("next") || defaultNext;

  const allowed = new Set([
    "menu.html","quiz.html","plan.html","scan.html","game.html","index.html"
  ]);

  const file = next.split("/").pop().split("?")[0].split("#")[0];
  return allowed.has(file) ? file : defaultNext;
}

/* gate for protected pages */
function requireGate(currentPage = "menu.html") {
  if (isLocked()) return location.replace("locked.html");
  if (!hasAcceptedTerms() || !isAdultVerified()) {
    return location.replace(`privacy.html?next=${encodeURIComponent(currentPage)}`);
  }
}

/* actions */
function acceptTerms() {
  const d = getAppData();
  d.termsAccepted = true;
  setAppData(d);
}

function verifyAge(ageInput) {
  const age = Number(ageInput);
  const d = getAppData();

  if (!age || age <= 0) return { ok:false, reason:"invalid" };

  d.age = age;

  if (age < 18) {
    d.locked = true;
    d.ageVerified = false;
    setAppData(d);
    return { ok:false, reason:"under18" };
  }

  d.ageVerified = true;
  d.locked = false;
  setAppData(d);
  return { ok:true };
}

function resetApp(hard=false){
  localStorage.removeItem(APP_KEY);
  if (hard) location.replace("privacy.html");
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-reset-app]").forEach(btn => {
    btn.addEventListener("click", () => resetApp(true));
  });
});
