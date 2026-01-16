// shared.js
const APP_KEY = "dd_app_v1";

function getAppData() {
  try { return JSON.parse(localStorage.getItem(APP_KEY) || "{}"); }
  catch { return {}; }
}
function setAppData(d) {
  localStorage.setItem(APP_KEY, JSON.stringify(d));
}

// Redirect to privacy.html (your first page) if not verified
function requireAdult(currentPage = "") {
  const data = getAppData();
  const age = Number(data.age || 0);

  // not verified or under 18 -> locked page
  if (!age || age < 18) {
    // send them to locked.html (you said name it locked)
    window.location.replace("locked.html");
    return;
  }

  // also optional: store last page visited
  if (currentPage) {
    data.lastPage = currentPage;
    setAppData(data);
  }
}
