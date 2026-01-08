function analyzeText() {
  let text = document.getElementById("textInput").value.toLowerCase();
  let score = 0;

  const keywords = ["why", "maybe", "think", "sure", "hope", "again", "do you", "sorry"];
  
  keywords.forEach(word => {
    if (text.includes(word)) score++;
  });

  let percent = Math.min(Math.round((score / keywords.length) * 100), 100);
  let result = "";

  if (percent < 35) result = "You are not overthinking much.";
  else if (percent < 70) result = "You might be overthinking some parts.";
  else result = "You are likely overthinking this conversation!";

  document.getElementById("scanResult").innerText = percent + "% – " + result;
}
