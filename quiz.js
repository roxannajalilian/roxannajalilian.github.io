const KEY="delulu_data_v1";

const questions = [
  "I reread texts to find hidden meaning.",
  "If someone replies late, I assume something is wrong.",
  "I overthink emojis, punctuation, or short replies.",
  "I imagine worst-case scenarios before having proof.",
  "My mood depends on how fast someone texts back.",
  "I check my phone repeatedly waiting for a reply.",
  "I overanalyze one message instead of the whole conversation.",
  "I assume tone or intention without asking.",
  "I feel anxious if I don’t get reassurance.",
  "I replay conversations in my head.",
  "I read into what someone didn’t say.",
  "I assume silence means something negative.",
  "I want to double-text when anxious.",
  "I focus more on texts than real-life actions.",
  "I struggle to sit with uncertainty.",
  "I overthink even when nothing is clearly wrong."
];

let d={};
try{ d=JSON.parse(localStorage.getItem(KEY)||"{}"); }catch(e){ d={}; }

let current = 0;
let answers = Array.isArray(d.answers) && d.answers.length === questions.length
  ? d.answers.slice()
  : new Array(questions.length).fill(null);

const qText = document.getElementById("questionText");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const answerButtons = document.querySelectorAll(".answer");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");

function paintSelected(){
  answerButtons.forEach(btn => {
    btn.classList.remove("selected");
    if (Number(btn.dataset.value) === answers[current]) {
      btn.classList.add("selected");
    }
  });
}

function render(){
  qText.textContent = questions[current];
  progressText.textContent = `Question ${current+1} of ${questions.length}`;
  progressFill.style.width = `${((current+1)/questions.length)*100}%`;

  backBtn.disabled = current === 0;
  nextBtn.textContent = current === questions.length - 1 ? "Finish" : "Next";

  paintSelected();
}

answerButtons.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    answers[current] = Number(btn.dataset.value);

    // save + update selected style
    let dd={};
    try{ dd=JSON.parse(localStorage.getItem(KEY)||"{}"); }catch(e){ dd={}; }
    dd.answers = answers;
    localStorage.setItem(KEY, JSON.stringify(dd));

    paintSelected();
  });
});

backBtn.addEventListener("click", ()=>{
  if(current>0){ current--; render(); }
  else location.href="menu.html"; // optional: if on Q1 and hit Return
});

nextBtn.addEventListener("click", ()=>{
  if(answers[current]===null){
    alert("Pick an answer before continuing.");
    return;
  }
  if(current<questions.length-1){
    current++; render();
  }else{
    finishQuiz();
  }
});

function finishQuiz(){
  const total = answers.reduce((a,b)=>a+(b??0),0);
  const max = questions.length*3;
  const percentage = Math.round((total/max)*100);

  let tier;
  if(percentage<=25) tier="Low overthinking";
  else if(percentage<=50) tier="Mild overthinking";
  else if(percentage<=75) tier="High overthinking";
  else tier="Very high overthinking";

  let dd={};
  try{ dd=JSON.parse(localStorage.getItem(KEY)||"{}"); }catch(e){ dd={}; }
  dd.answers = answers;
  dd.quizResult = { percentage, tier };
  localStorage.setItem(KEY, JSON.stringify(dd));

  location.href = "loading.html";
}

render();
