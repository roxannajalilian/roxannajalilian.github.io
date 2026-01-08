// SIMULATED TRIGGER WORDS
const triggerWords = [
  "why", "ignore", "rude", "ok", "whatever", "fine", "sure", "later", "wait", "what", "now"
];

function scanImage() {
  const input = document.getElementById("imageInput");
  if(!input.files[0]){
    alert("Please upload an image to scan!");
    return;
  }

  // Simulate scanning process
  document.getElementById("scan-percentage").textContent = "Analyzing...";
  document.getElementById("scan-advice").textContent = "";
  document.getElementById("scan-fill").style.width = "0%";

  setTimeout(()=>{
    // Randomly simulate percentage based on "trigger words"
    let percentage = Math.floor(Math.random() * 80) + 10; // 10-90%
    let advice = "";

    if(percentage < 30){
      advice = "Your conversation seems calm. You are unlikely to overthink this chat.";
      document.getElementById("scan-fill").style.background = "#00ff99";
    } else if(percentage < 60){
      advice = "You might overthink some parts. Take a deep breath before worrying.";
      document.getElementById("scan-fill").style.background = "#ffff00";
    } else if(percentage < 80){
      advice = "This conversation may trigger overthinking. Try to stay objective.";
      document.getElementById("scan-fill").style.background = "#ff9900";
    } else {
      advice = "This chat is high-risk for overthinking! Pause before reading too much into it.";
      document.getElementById("scan-fill").style.background = "#ff5555";
    }

    // Show result
    document.getElementById("scan-percentage").textContent = `Delulu Score: ${percentage}%`;
    document.getElementById("scan-advice").textContent = advice;
    document.getElementById("scan-fill").style.width = percentage + "%";

  }, 1200); // simulate analysis delay
}
