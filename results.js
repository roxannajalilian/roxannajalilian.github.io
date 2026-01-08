// GET SCORE
let score = parseInt(localStorage.getItem("score"));
let totalScore = parseInt(localStorage.getItem("totalScore"));
let percentage = Math.round((score/totalScore)*100);

const percentageEl = document.getElementById("percentage");
const adviceEl = document.getElementById("advice");
const moodFillEl = document.getElementById("mood-fill");
const achievementEl = document.getElementById("achievement");

// SHOW PERCENTAGE
percentageEl.textContent = `Delulu Level: ${percentage}%`;

// ADVICE BASED ON SCORE
let adviceText = "";
let achievement = "";

if(percentage < 30){
  adviceText = "You're generally calm and realistic in interpreting messages. Keep trusting yourself!";
  achievement = "Calm 😎";
  moodFillEl.style.background = "#00ff99"; // green
} else if(percentage < 60){
  adviceText = "You sometimes overthink texts. Remember to check facts before worrying.";
  achievement = "Careful Thinker 🧐";
  moodFillEl.style.background = "#ffff00"; // yellow
} else if(percentage < 80){
  adviceText = "You often overanalyze messages. Try to take breaks and don't assume negative meanings.";
  achievement = "Overthinker 😬";
  moodFillEl.style.background = "#ff9900"; // orange
} else {
  adviceText = "You heavily overthink texts. Consider talking to someone you trust about your anxiety.";
  achievement = "Delulu Mode 😰";
  moodFillEl.style.background = "#ff5555"; // red
}

adviceEl.textContent = adviceText;
achievementEl.textContent = achievement;

// MOOD METER ANIMATION
moodFillEl.style.width = `${percentage}%`;
