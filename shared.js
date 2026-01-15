const APP_KEY = "dd_app_v1";

function getAppData(){
  try { return JSON.parse(localStorage.getItem(APP_KEY) || "{}"); }
  catch { return {}; }
}

function setAppData(data){
  localStorage.setItem(APP_KEY, JSON.stringify(data));
}

function requireAdult(){
  const d = getAppData();
  if (!d || Number(d.age) < 18 || d.termsAccepted !== true) {
    window.location.replace("privacy.html");
  }
}
