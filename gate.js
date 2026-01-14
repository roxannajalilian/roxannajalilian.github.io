// gate.js
const KEY = "delulu_data_v1";

export function getData() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function setData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function lockOut(reason = "Sorry — you must be 18 or older to use this app.") {
  const data = getData();
  data.lockedOut = true;
  data.lockReason = reason;
  setData(data);

  // Replace current history entry so back button won't return to protected pages
  window.location.replace("locked.html");
}

export function requireAdultOrRedirect() {
  const data = getData();

  // If previously locked out, always send them away
  if (data?.lockedOut) {
    window.location.replace("locked.html");
    return;
  }

  // If no age saved yet, send to index
  if (!data?.age) {
    window.location.replace("index.html");
    return;
  }

  if (Number(data.age) < 18) {
    lockOut("Sorry — you must be 18 or older to use this app.");
  }
}
