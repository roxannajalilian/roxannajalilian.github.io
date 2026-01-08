\let questions = [
  "Do you reread messages multiple times?",
  "Do you overthink short replies?",
  "Do you assume tone from texts?",
  "Do you imagine future conversations with this person?",
  "Do you check messages often waiting for a reply?",
  "Do emojis affect how you feel about a message?",
  "Do you feel anxious when someone doesn’t reply immediately?",
  "Do you replay conversations in your head?",
  "Do you assume silence means something bad?",
  "Do small actions feel very meaningful to you?",
  "Do you worry about saying the wrong thing in texts?",
  "Do you read too much into 'seen' or 'read' notifications?",
  "Do you frequently edit your messages before sending?",
  "Do you imagine the other person’s feelings about your messages?",
  "Do you feel relief when someone finally replies?"
];

let current = 0;
let score = 0;

function loadQuestion() {
  document.getElementById("question").textContent = questions[current];
  document.getElementById("progress").textContent =
    "Question " + (current + 1) + " of " + questions.length;
  document.getElementById("bar").style.width =
    (current / questions.length) * 100 + "%";
}

function answer(value) {
  score += value;
  current++;
  if (current < questions.length) {
    loadQuestion();
  } else {
    localStorage.setItem("score", score);
    window.location.href = "results-ai.html";
  }
}

function voiceAnswer() {
  let recognition = new webkitSpeechRecognition();
  recognition.start();

  recognition.onresult = function(event) {
    let text = event.results[0][0].transcript.toLowerCase();
    if (text.includes("yes")) answer(2);
    else if (text.includes("usually")) answer(1);
    else answer(0);
  };
}

loadQuestion();

