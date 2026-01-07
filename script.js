const questions = [
  "Do you reread messages repeatedly?",
  "Do you assume silence means something?",
  "Do you imagine future scenarios?",
  "Do you analyze tone or punctuation?",
  "Do you stalk profiles for meaning?",
  "Do you overthink response times?",
  "Do you replay conversations?",
  "Do you create narratives in your head?",
  "Do you romanticize small gestures?",
  "Do you feel anxious waiting for replies?",
  "Do you reread old messages?",
  "Do you assume indirect posts are about you?",
  "Do you overthink body language?",
  "Do you imagine conversations that never happened?",
  "Do you assume mixed signals mean interest?",
  "Do you struggle to stay present?",
  "Do you assume coincidence isn’t coincidence?",
  "Do you feel disappointed without proof?",
  "Do you seek reassurance often?",
  "Do you overthink before sleeping?"
];

let scanCount = Number(localStorage.getItem("scans") || 0);

function startApp() {
  document.getElementById("onboard").classList.add("hidden");
  document.getElementById("quiz").classList.remove("hidden");

  const form = document.getElementById("quizForm");
  questions.forEach((q,i)=>{
    form.innerHTML += `
      <div class="question">
        <p>${i+1}. ${q}</p>
        <select>
          <option value="0">No</option>
          <option value="1">Sometimes</option>
          <option value="2">Yes</option>
        </select>
      </div>`;
  });
}

function beginAnalysis() {
  document.body.innerHTML = `
    <div class="app">
      <h2>Analyzing Patterns…</h2>
      <p>This may take a moment.</p>
      <div class="progress"><span id="bar"></span></div>
    </div>
  `;

  setTimeout(()=>calculate(),1800);
}

function calculate() {
  const selects = document.querySelectorAll("select");
  let total = 0;
  selects.forEach(s=>total+=Number(s.value));
  const percent = Math.round((total/(selects.length*2))*100);

  scanCount++;
  localStorage.setItem("scans",scanCount);

  showResults(percent);
}

function showResults(p) {
  let label =
    p<30?"Grounded Thinking":
    p<60?"Emotionally Reactive":
    p<80?"Over-Interpretive":
    "Highly Delusional Patterns";

  let explanation =
    p<30?"You generally interpret situations realistically.":
    p<60?"You sometimes let emotion guide interpretation.":
    p<80?"Your mind fills in gaps without evidence.":
    "Your thoughts frequently override observable facts.";

  document.body.innerHTML = `
    <div class="app">
      <h1>${label}</h1>
      <h2>${p}% Pattern Intensity</h2>

      <div class="progress"><span id="bar"></span></div>

      <div class="analysis-box">
        ${explanation}
      </div>

      <div class="analysis-box">
        This score reflects *how often your brain searches for meaning*, not reality.
      </div>

      <div class="locked ${scanCount<5?'locked':''}">
        <h3>Premium Cognitive Breakdown 🔒</h3>
        <p>${scanCount<5
          ?`Complete ${5-scanCount} more scans to unlock`
          :"Unlocked: Deep pattern explanation available."}
        </p>
      </div>

      <button onclick="location.reload()">Scan Again</button>
    </div>
  `;

  setTimeout(()=>document.getElementById("bar").style.width=p+"%",100);
}

/* VOICE */
function startVoice(){
  if(!('webkitSpeechRecognition'in window))return alert("Voice not supported");
  const r=new webkitSpeechRecognition();
  r.start();
}
