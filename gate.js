const KEY = "delulu_data_v1";

export function getData() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
}
export function setData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function lockOut(reason = "Sorry — you must be 18 or older to use this app.") {
  const data = getData();
  data.lockedOut = true;
  data.lockReason = reason;
  setData(data);
  window.location.replace("locked.html");
}

export function requireAdultOrRedirect() {
  const data = getData();
  if (data?.lockedOut) return window.location.replace("locked.html");
  if (!data?.age) return window.location.replace("index.html");
  if (Number(data.age) < 18) return lockOut("Sorry — you must be 18 or older to use this app.");
}
