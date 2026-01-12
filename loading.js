const steps = [
  "Checking patterns…",
  "Measuring overthinking level…",
  "Generating advice…",
  "Almost done…"
];

const el = document.getElementById("loadingText");
let i = 0;

const tick = setInterval(() => {
  i++;
  if (i < steps.length) el.textContent = steps[i];
}, 520);

// After ~2.2 seconds, go to results page
setTimeout(() => {
  clearInterval(tick);
  location.href = "result.html";
}, 2200);
