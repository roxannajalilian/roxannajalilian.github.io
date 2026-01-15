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

// lock protected pages
function requireAdult() {
  const data = getAppData();
  if (!data.age || Number(data.age) < 18) {
    window.location.replace("index.html");
  }
}
