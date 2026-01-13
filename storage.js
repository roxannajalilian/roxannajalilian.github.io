
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

function requireAdultOrRedirect() {
  const data = getData();
  if (!data || !data.age || data.age < 18) {
    window.location.href = "index.html";
  }
}
