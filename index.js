import { getData, setData, lockOut } from "./gate.js";

const ageEl = document.getElementById("age");
const agreeEl = document.getElementById("agree");
const msg = document.getElementById("msg");
const continueBtn = document.getElementById("continueBtn");
const resetBtn = document.getElementById("resetBtn");
const readBtn = document.getElementById("readBtn");

readBtn?.addEventListener("click", () => {
  msg.textContent = "Read aloud coming soon.";
});

function show(m) {
  msg.textContent = m;
}

// index.html is main page: do NOT auto-redirect on load

continueBtn.addEventListener("click", () => {
  const age = Number(ageEl.value);

  if (!agreeEl.checked) return show("Please agree to the Terms & Privacy.");
  if (!Number.isFinite(age) || age < 1 || age > 120) return show("Enter a valid age.");

  if (age < 18) {
    lockOut("Sorry — you must be 18 or older to use this app.");
    return;
  }

  const data = getData();
  data.age = age;
  data.lockedOut = false;
  data.lockReason = "";
  setData(data);

  window.location.replace("menu.html");
});

resetBtn.addEventListener("click", () => {
  setData({});
  ageEl.value = "";
  agreeEl.checked = false;
  show("Reset.");
});
