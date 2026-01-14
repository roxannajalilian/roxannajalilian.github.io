(() => {
  const APP_KEY = "dd_app_v1";
  const ageInput = document.getElementById("ageInput");
  const agreeChk = document.getElementById("agreeChk");
  const continueBtn = document.getElementById("continueBtn");
  const resetBtn = document.getElementById("resetBtn");
  const resetAppBtn = document.getElementById("resetAppBtn");
  const err = document.getElementById("err");

  function getAppData(){
    try { return JSON.parse(localStorage.getItem(APP_KEY) || "{}"); }
    catch { return {}; }
  }
  function setAppData(d){
    localStorage.setItem(APP_KEY, JSON.stringify(d));
  }

  function showErr(msg){
    err.style.display = "block";
    err.textContent = msg;
  }
  function clearErr(){
    err.style.display = "none";
    err.textContent = "";
  }

  // preload saved age
  const data = getAppData();
  if (data.age) ageInput.value = data.age;
  if (data.agreed) agreeChk.checked = true;

  function validate(){
    clearErr();
    const age = Number(ageInput.value);
    const ok = Number.isFinite(age) && age >= 18 && agreeChk.checked;
    continueBtn.disabled = !ok;
  }

  ageInput.addEventListener("input", validate);
  agreeChk.addEventListener("change", validate);

  continueBtn.addEventListener("click", () => {
    const age = Number(ageInput.value);
    if (!Number.isFinite(age) || age < 18) return showErr("You must be 18+ to use this app.");
    if (!agreeChk.checked) return showErr("Please agree to Privacy & Concerns to continue.");

    const d = getAppData();
    d.age = age;
    d.agreed = true;
    d.savedAt = Date.now();
    setAppData(d);

    window.location.href = "menu.html";
  });

  resetBtn.addEventListener("click", () => {
    ageInput.value = "";
    agreeChk.checked = false;
    validate();
  });

  function hardReset(){
    localStorage.removeItem(APP_KEY);
    window.location.href = "start.html";
  }
  resetAppBtn.addEventListener("click", hardReset);

  validate();
})();
