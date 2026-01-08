// QUESTIONS ARRAY (25+ realistic questions)
let questions = [
  "Do you reread messages more than once?",
  "Do you overthink short replies?",
  "Do you assume tone from texts?",
  "Do you imagine future conversations?",
  "Do you check your phone often waiting for a reply?",
  "Do emojis affect how you feel about a message?",
  "Do you feel anxious when someone doesn’t reply?",
  "Do you replay conversations in your head?",
  "Do you assume silence means something bad?",
  "Do small actions feel very meaningful to you?",
  "Do you worry about messages you sent days ago?",
  "Do you feel nervous sending texts to someone important?",
  "Do you analyze every word of a text?",
  "Do you feel insecure about not getting a reply fast?",
  "Do you imagine someone is upset without evidence?",
  "Do you reread conversations repeatedly?",
  "Do you interpret emojis in a negative way?",
  "Do you avoid texting first because of fear?",
  "Do you predict negative outcomes of conversations?",
  "Do you obsess over deleted messages?",
  "Do you feel judged by text tone?",
  "Do you feel anxious when ignored in group chats?",
  "Do you often overthink your replies?",
  "Do you assume meanings that may not exist?",
  "Do small miscommunications stress you out?"
];

let current = 0;
let userAnswers = [];
const totalScore = questions.length * 3; // max per question = 3

// ELEMENTS
const questionEl = document.getElementById("question");
const barEl = document.getElementById("bar");
const emojiEl = document.getElementById("emoji-feedback");

// LOAD QUESTION
function loadQuestion(){
  if(current < 0) current = 0;
  if(current >= questions.length) current = questions.length-1;
  questionEl.textContent = questions[current];
  updateProgress();
  updateEmoji();
}

// RECORD ANSWER
function answer(value){
  userAnswers[current] = value;
  current++;
  if(current >= questions.length){
    // calculate final score and save
    let score = userAnswers.reduce((a,b)=>a+(b||0),0);
    localStorage.setItem("score", score);
    localStorage.setItem("totalScore", totalScore);
    window.location.href = "results.html";
  } else {
    loadQuestion();
  }
}

// GO BACK BUTTON
function goBack(){
  if(current>0){
    current--;
    loadQuestion();
  }
}

// UPDATE PROGRESS BAR
function updateProgress(){
  let score = userAnswers.reduce((a,b)=>a+(b||0),0);
  let progress = ((current)/questions.length)*100;
  barEl.style.width = progress + "%";
  let percent = Math.round((score/totalScore)*100);
  if(percent < 30) barEl.style.background = "#00ff99"; // green
  else if(percent < 60) barEl.style.background = "#ffff00"; // yellow
  else if(percent < 80) barEl.style.background = "#ff9900"; // orange
  else barEl.style.background = "#ff5555"; // red
}

// UPDATE EMOJI FEEDBACK
function updateEmoji(){
  if(userAnswers[current]===undefined){ emojiEl.textContent=""; return; }
  let val = userAnswers[current];
  if(val===3) emojiEl.textContent="😎";
  else if(val===2) emojiEl.textContent="😬";
  else if(val===1) emojiEl.textContent="😟";
  else emojiEl.textContent="😰";
}

// VOICE INPUT
function voiceAnswer(){
  if(!('webkitSpeechRecognition' in window)){
    alert("Your browser does not support voice input!");
    return;
  }
  let recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = function(event){
    let text = event.results[0][0].transcript.toLowerCase();
    if(text.includes("yes")) answer(3);
    else if(text.includes("usually")) answer(2);
    else if(text.includes("sometimes")) answer(1);
    else answer(0);
  };

  recognition.onerror = function(){
    alert("Voice recognition failed, try again.");
  };
}

window.onload = loadQuestion;
