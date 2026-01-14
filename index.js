import { getData, setData, lockOut } from "./gate.js";

const ageEl = document.getElementById("age");
const agreeEl = document.getElementById("agree");
const msg = document.getElementById("msg");
const continueBtn = document.getElementById("continueBtn");
const resetBtn = document.getElementById("resetBtn");

function show(m) {
  msg.textContent = m;
}

function resetAll() {
  setData({});
  ageEl.value = "";
  agreeEl.checked = false;
  show("Reset.");
}

(function init() {
  const data = getData();

  // If already verified adult, go straight to menu
  if (data?.age && Number(data.age) >= 18 && !data.lockedOut) {
    window.location.replace("menu.html");
    return;
  }

  // If locked out already, send to locked page
  if (data?.lockedOut) {
    window.location.replace("locked.html");
    return;
  }
})();

continueBtn.addEventListener("click", () => {
  const age = Number(ageEl.value);

  if (!agreeEl.checked) {
    show("Please agree to the Terms & Privacy.");
    return;
  }

  if (!age || age < 1 || age > 120) {
    show("Enter a valid age.");
    return;
  }

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

resetBtn.addEventListener("click", resetAll);
