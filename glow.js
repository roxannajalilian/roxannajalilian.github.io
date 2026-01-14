const root = document.documentElement;

window.addEventListener("mousemove", (e) => {
  root.style.setProperty("--mx", e.clientX + "px");
  root.style.setProperty("--my", e.clientY + "px");
});
