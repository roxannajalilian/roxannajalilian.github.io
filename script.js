const questions = [
  ["Do you reread messages repeatedly?", "Rechecking often signals uncertainty."],
  ["Do you analyze emojis or punctuation?", "Small details feel meaningful."],
  ["Do you assume silence means something bad?", "Your brain fills gaps quickly."],
  ["Do you imagine future scenarios?", "Projection into the future is common."],
  ["Do you stalk profiles for clues?", "You seek reassurance externally."],
  ["Do you overthink response times?", "Timing becomes emotionally charged."],
  ["Do you replay conversations?", "Rumination strengthens emotion."],
  ["Do you create narratives in your head?", "Stories replace facts."],
  ["Do you romanticize small gestures?", "Meaning outweighs evidence."],
  ["Do you feel anxious waiting for replies?", "Uncertainty triggers stress."],
  ["Do you reread old messages?", "Past moments feel unfinished."],
  ["Do you assume indirect posts are about you?", "Personalization bias present."],
  ["Do you overthink body language?", "Non-verbal cues feel loud."],
  ["Do you imagine conversations that never happened?", "Mental rehearsal increases attachment."],
  ["Do you assume mixed signals mean interest?", "Hope overrides ambiguity."],
  ["Do you struggle to stay present?", "Mind drifts to hypotheticals."],
  ["Do you assume coincidence isn’t coincidence?", "Pattern-seeking behavior."],
  ["Do you feel disappointed without proof?", "Expectations precede facts."],
  ["Do you seek reassurance often?", "External validation needed."],
  ["Do you overthink before sleeping?", "Thoughts amplify at rest."]
];

let scanCount = Number(localStorage.getItem("scans") || 0);

function startApp(){
  document.getElementById("onboard").classList.add("hidden");
  document.getElementById("quiz").classList.remove("hidden");

  const form = document.getElementById("quizForm");
  questions.forEach((q,i)=>{
    form.innerHTML += `
      <div class="question">
        <p>${i+1}. ${q[0]}</p>
        <select>
          <option value="0">No</option>
          <option value="1">Sometimes</option>
          <option value="2">Yes</option>
        </select>
      </div>`;
  });
}

function beginAnalysis(){
  document.body.innerHTML = `
    <div class="app">
      <h2>Analyzing Cognitive Patterns…</h2>
      <p class="sub">Looking for trends, not answers</p>
      <div class="progress"><span id="bar"></span></div>
    </div>`;
  setTimeout(calculate, 1800);
}

function calculate(){
  const selects = document.querySelectorAll("select");
  let score = 0;
  selects.forEach(s => score += Number(s.value));
  const percent = Math.round((score / (selects.length*2)) * 100);

  scanCount++;
  localStorage.setItem("scans", scanCount);

  showResults(percent, selects);
}

function showResults(p, selects){
  let type =
    p<30 ? "Grounded Thinker" :
    p<60 ? "Emotion-Driven Thinker" :
    p<80 ? "Interpretive Thinker" :
    "Highly Narrative Thinker";

  let explanation =
    p<30 ? "You usually rely on facts over assumptions." :
    p<60 ? "Emotions sometimes guide your interpretations." :
    p<80 ? "Your mind actively fills in missing information." :
    "Your thoughts often overpower observable reality.";

  document.body.innerHTML = `
    <div class="app">
      <h1>${type}</h1>
      <h2>${p}% Delulu Intensity</h2>

      <div class="progress"><span id="bar"></span></div>

      <div class="box">${explanation}</div>

      <div class="box">
        <strong>Pattern Insight:</strong><br>
        ${buildInsights(selects)}
      </div>

      <div class="box">
        <strong>Personality Mapping:</strong><br>
        You tend toward <em>${personalityMap(p)}</em> thinking patterns.
      </div>

      <div class="box ${scanCount<5?'locked':''}">
        <strong>Premium AI Breakdown 🔒</strong><br>
        ${scanCount<5
          ?`Complete ${5-scanCount} more scans to unlock deep cognitive analysis.`
          :"Unlocked: Advanced explanation available."}
      </div>

      <h3>History</h3>
      <div id="graph"></div>

      <button onclick="location.reload()">Scan Again</button>
    </div>`;

  setTimeout(()=>document.getElementById("bar").style.width=p+"%",100);
  speak(`${type}. Your delulu level is ${p} percent.`);
  drawHistory(p);
}

function buildInsights(selects){
  let text = "";
  selects.forEach((s,i)=>{
    if(Number(s.value)>0){
      text += `• ${questions[i][1]}<br>`;
    }
  });
  return text || "No strong overthinking indicators detected.";
}

function personalityMap(p){
  if(p<30) return "Logical-grounded";
  if(p<60) return "Emotionally intuitive";
  if(p<80) return "Imaginative-interpretive";
  return "Narrative-dominant";
}

function drawHistory(p){
  const h = JSON.parse(localStorage.getItem("history")||"[]");
  h.push(p);
  localStorage.setItem("history",JSON.stringify(h));
  const g=document.getElementById("graph");
  h.slice(-6).forEach(v=>{
    const b=document.createElement("div");
    b.className="graph-bar";
    b.style.width=v+"%";
    g.appendChild(b);
  });
}

function speak(text){
  const u=new SpeechSynthesisUtterance(text);
  u.rate=0.95;
  window.speechSynthesis.speak(u);
}

function startVoice(){
  if(!('webkitSpeechRecognition'in window))return alert("Voice not supported");
  const r=new webkitSpeechRecognition();
  r.start();
}
