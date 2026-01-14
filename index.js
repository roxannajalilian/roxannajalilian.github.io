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

// 🚫 IMPORTANT: NO AUTO-REDIRECT ON PAGE LOAD
// index.html stays the main page

continueBtn.addEventListener("click", () => {
  const age = Number(ageEl.value);

  if (!agreeEl.checked) {
    show("Please agree to the Terms & Privacy.");
    return;
  }

  if (!Number.isFinite(age) || age < 1 || age > 120) {
    show("Enter a valid age.");
    return;
  }

  if (age < 18) {
    // FULL lockout for under 18
    lockOut("Sorry — you must be 18 or older to use this app.");
    return;
  }

  // Save valid age
  const data = getData();
  data.age = age;
  data.lockedOut = false;
  data.lockReason = "";
  setData(data);

  // ONLY NOW go to menu
  window.location.replace("menu.html");
});

resetBtn.addEventListener("click", () => {
  setData({});
  ageEl.value = "";
  agreeEl.checked = false;
  show("Reset.");
});
