
const KEY = "delulu_data_v1";

function getData() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function setData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

// HARD BLOCK under 18
function requireAdultOrRedirect() {
  const data = getData();

  // No age entered yet → go to age gate
  if (!data || !data.age) {
    window.location.href = "index.html";
    return;
  }

  // Under 18 → kick them out
  if (Number(data.age) < 18) {
    // clear data so they can’t bypass
    localStorage.removeItem(KEY);
    window.location.href = "under18.html";
    return;
  }
}
