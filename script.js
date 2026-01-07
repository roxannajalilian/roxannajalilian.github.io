function checkAge() {
  const ageInput = document.getElementById("age");
  const age = Number(ageInput.value);

  if (!age) return alert("Please enter your age.");

  if (age < 18) {
    window.location.href = "under18.html";
  } else {
    window.location.href = "choose.html";
  }
}


const quizQuestions = [
  "Do you reread messages multiple times?",
  "Do you analyze emojis or punctuation?",
  "Do you assume silence means something bad?",
  "Do you imagine future scenarios with someone?",
  "Do you stalk profiles for clues?",
  "Do you overthink response times?",
  "Do you replay conversations in your head?",
  "Do you create narratives in your head?",
  "Do you romanticize small gestures?",
  "Do you feel anxious waiting for replies?",
  "Do you reread old conversations?",
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

let quizAnswers = [];
let currentQuestion = 0;

function loadQuestion() {
  if (!document.getElementById("question-text")) return;
  if (currentQuestion >= quizQuestions.length) return finishQuiz();

  document.getElementById("question-title").textContent = `Question ${currentQuestion + 1} of ${quizQuestions.length}`;
  document.getElementById("question-text").textContent = quizQuestions[currentQuestion];

  const percent = Math.round((currentQuestion / quizQuestions.length) * 100);
  document.getElementById("progress-bar").style.width = percent + "%";
}

function answer(value) {
  quizAnswers.push(value);
  currentQuestion++;
  loadQuestion();
}

function finishQuiz() {
  let score = quizAnswers.reduce((a,b)=>a+b,0);
  let max = quizQuestions.length*2;
  let percent = Math.round((score/max)*100);
  let verdict = percent <= 30 ? "🟢 Grounded Thinking" :
                percent <= 60 ? "🟡 Some Delulu Tendencies" :
                percent <= 85 ? "🟠 Highly Delulu" :
                "🔴 Extremely Delulu";

  localStorage.setItem("score", percent);
  localStorage.setItem("verdict", verdict);
  window.location.href = "results.html";
}


function scanImage() {
  const input = document.getElementById("imageUpload");
  const analyzing = document.getElementById("analyzing");
  if (!input.files || input.files.length === 0) return alert("Please upload an image first!");

  analyzing.style.display = "block";
  setTimeout(()=>{
    const score = Math.floor(Math.random()*101);
    const verdict = score<=30?"🟢 Grounded":score<=70?"🟡 Some Delulu":"🔴 Highly Delulu";
    localStorage.setItem("score", score);
    localStorage.setItem("verdict", verdict);
    localStorage.setItem("voiceText","Analyzed image text");
    window.location.href = "results.html";
  },2000);
}


const startBtn = document.getElementById("startRecording");
if(startBtn){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang='en-US';
  recognition.interimResults=false;

  startBtn.addEventListener('click',()=>recognition.start());

  recognition.onstart = ()=>{
    document.getElementById("analyzing").style.display="block";
    document.getElementById("voiceOutput").textContent="Listening...";
  }

  recognition.onresult = (event)=>{
    const transcript = event.results[0][0].transcript;
    document.getElementById("voiceOutput").textContent="Detected Text: "+transcript;
    const score=Math.floor(Math.random()*101);
    const verdict = score<=30?"🟢 Grounded":score<=70?"🟡 Some Delulu":"🔴 Highly Delulu";
    localStorage.setItem("score",score);
    localStorage.setItem("verdict",verdict);
    localStorage.setItem("voiceText",transcript);
    window.location.href="results.html";
  }

  recognition.onerror=(e)=>alert("Voice recognition error: "+e.error);
}


window.onload=function(){
  const scoreElem=document.getElementById("score");
  const verdictElem=document.getElementById("verdict");
  const voiceElem=document.getElementById("voiceText");

  if(scoreElem && verdictElem){
    const score=localStorage.getItem("score")||"??";
    const verdict=localStorage.getItem("verdict")||"Demo result for fun!";
    const voiceText=localStorage.getItem("voiceText")||"";
    scoreElem.textContent=score;
    verdictElem.textContent=verdict;
    if(voiceText) voiceElem.textContent="Analysis: "+voiceText;

    const utter=new SpeechSynthesisUtterance(verdict);
    utter.volume=1;
    window.speechSynthesis.speak(utter);
  }

 
  loadQuestion();
}
