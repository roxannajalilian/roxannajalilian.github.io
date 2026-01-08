let questions = [
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
  "Do you feel relief when someone finally replies?",
  "Do you overanalyze previous conversations days later?",
  "Do you often predict someone’s reaction to your texts?",
  "Do you feel anxious if you don’t get a reply in time?",
  "Do you check your phone multiple times in a short period?",
  "Do you interpret emojis differently than intended?",
  "Do you imagine arguments or misunderstandings from texts?",
  "Do you remember tiny details from past conversations?",
  "Do you feel insecure about how your messages are received?",
  "Do you frequently reread your own messages before sending?",
  "Do you assume the other person is upset based on tone?"
];

let current = 0;
let score = 0;

window.onload = function() {
  loadQuestion();
}

function loadQuestion() {
  document.getElementById("question").innerText = questions[current];
  document.getElementById("progress").innerText =
    "Question " + (current + 1) + " of " + questions.length;
  document.getElementById("bar").style.width = (current / questions.length) * 100 + "%";
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

// Voice recognition
function voiceAnswer() {
  let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = function(event) {
    let text = event.results[0][0].transcript.toLowerCase();
    if (text.includes("yes")) answer(2);
    else if (text.includes("usually") || text.includes("sometimes")) answer(1);
    else answer(0);
  }

  recognition.onerror = function() {
    alert("Voice recognition failed. Please try again.");
  }
}
