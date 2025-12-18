function analyzeText() {
  const text = document.getElementById("textInput").value.toLowerCase();
  if (text.length < 10) {
    alert("Please enter more text for analysis.");
    return;
  }

  let score = 10;

  const deluluPatterns = [
    "he definitely loves me",
    "i know they are thinking about me",
    "it has to mean something",
    "the universe is telling me",
    "we are meant to be",
    "there's no other explanation",
    "they want me but can't say it",
    "everything is a sign"
  ];

  const exaggerationWords = [
    "always", "never", "definitely", "literally",
    "obsessed", "destined", "meant to", "guaranteed"
  ];

  deluluPatterns.forEach(pattern => {
    if (text.includes(pattern)) score += 15;
  });

  exaggerationWords.forEach(word => {
    if (text.includes(word)) score += 5;
  });

  if (text.length > 300) score += 10;
  if (text.includes("???") || text.includes("!!!")) score += 5;

  if (score > 100) score = 100;

  let verdict = "";
  if (score <= 30) verdict = "🟢 Grounded — pretty realistic thinking.";
  else if (score <= 70) verdict = "🟡 Interesting — emotional or assumption-heavy.";
  else verdict = "🔴 Fully Delulu — fantasy-driven interpretation detected.";

  document.getElementById("result").classList.remove("hidden");
  document.getElementById("score").innerText = score;
  document.getElementById("verdict").innerText = verdict;
}
