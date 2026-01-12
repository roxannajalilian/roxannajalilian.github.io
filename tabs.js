export function initTabs() {
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const panels = {
    scan: document.getElementById("tab-scan"),
    questions: document.getElementById("tab-questions"),
    plan: document.getElementById("tab-plan"),
    insights: document.getElementById("tab-insights"),
  };

  function setTab(key) {
    tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === key));
    Object.entries(panels).forEach(([k, el]) => el.classList.toggle("active", k === key));
  }

  tabs.forEach(t => t.addEventListener("click", () => setTab(t.dataset.tab)));

  return { setTab };
}
