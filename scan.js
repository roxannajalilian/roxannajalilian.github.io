const convo = document.getElementById("convo");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");

const scanBar = document.getElementById("scanBar");
const scanPercent = document.getElementById("scanPercent");
const notes = document.getElementById("notes");

function addNote(text){
  const li = document.createElement("li");
  li.textContent = text;
  notes.appendChild(li);
}

function analyzeText(text){
  const t = text.toLowerCase();

  const signals = [
    { name: "Very short replies", re: /\b(ok|k|sure|fine|nm|idk|lol)\b/g, weight: 10 },
    { name: "Shutdown words", re: /\b(stop|leave me|dont talk|whatever|bye)\b/g, weight: 16 },
    { name: "Pressure / spam", re: /\?\?+|\bwhy\b|\banswer\b|\bwhat are we\b/g, weight: 10 },
    { name: "Mixed signals", re: /\b(i miss you|i love you|i hate you|i'm done)\b/g, weight: 8 },
    { name: "Apology loop", re: /\b(sorry|my fault|please)\b/g, weight: 6 }
  ];

  let score = 0;
  const found = [];

  for(const s of signals){
    const matches = t.match(s.re);
    if(matches && matches.length){
      score += s.weight * Math.min(matches.length, 3);
      found.push({ label: s.name, count: matches.length });
    }
  }

  score = Math.min(100, Math.round(score));
  return { score, found };
}

analyzeBtn.addEventListener("click", () => {
  const text = (convo.value || "").trim();
  notes.innerHTML = "";

  if(!text){
    addNote("Paste something first.");
    scanBar.style.width = "0%";
    scanPercent.textContent = "--% • No scan yet";
    return;
  }

  const { score, found } = analyzeText(text);

  scanBar.style.width = `${score}%`;
  scanPercent.textContent = `${score}% • signals detected`;

  if(found.length === 0){
    addNote("Not many obvious red flags in the text itself.");
    addNote("Look for patterns over time (consistency).");
  } else {
    addNote("Top signals I detected:");
    for(const f of found){
      addNote(`${f.label} (x${f.count})`);
    }
    addNote("Best move: send 1 clear message, then stop chasing.");
  }
});

clearBtn.addEventListener("click", () => {
  convo.value = "";
  scanBar.style.width = "0%";
  scanPercent.textContent = "--% • No scan yet";
  notes.innerHTML = `<li class="muted">Run a scan to see notes here.</li>`;
});
