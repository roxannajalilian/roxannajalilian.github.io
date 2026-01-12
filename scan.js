const KEY="delulu_data_v1";

const input = document.getElementById("textInput");
const out = document.getElementById("out");

document.getElementById("clearBtn").onclick = () => {
  input.value = "";
  out.style.display = "none";
};

document.getElementById("analyzeBtn").onclick = () => {
  const t = (input.value || "").trim();
  if(!t){
    out.style.display="block";
    out.innerHTML = "Paste something first bestie 😭";
    return;
  }

  const lower = t.toLowerCase();

  const signals = [];
  if(/seen|left on read|read at|delivered/.test(lower)) signals.push("Read receipts / ‘seen’ is triggering you.");
  if(/ok\b|k\b|sure\b|fine\b/.test(lower)) signals.push("Short replies can feel cold even if they’re not.");
  if(/\.\.\.|…/.test(t)) signals.push("Ellipses (‘…’) often make people assume attitude.");
  if(/lol\b|lmao\b/.test(lower)) signals.push("‘lol’ can be playful OR avoidant depending on context.");
  if(/why|what do you mean|are you mad|did i do something/.test(lower)) signals.push("A lot of reassurance-checking language is happening.");
  if(/\?{2,}/.test(t)) signals.push("Multiple question marks = anxiety / urgency energy.");
  if(/sorry\b/.test(lower)) signals.push("You’re apologizing a lot — maybe over-responsibility.");
  if(/i guess|whatever|nvm|nevermind/.test(lower)) signals.push("‘nvm/whatever’ is a shutdown pattern.");

  const scoreGuess = Math.min(100, 20 + signals.length * 12);

  const why = [
    "Unclear tone (text removes body language)",
    "Waiting for replies makes your brain fill gaps",
    "Past experiences make you expect worst case",
    "You care more than they’re showing right now"
  ];

  const advice = [
    "Look at actions + consistency, not one message.",
    "If you need clarity, send ONE calm question, not 10.",
    "Stop rereading. If you reread, your anxiety writes the story.",
    "Mute the chat for 20 minutes and do something else."
  ];

  out.style.display="block";
  out.innerHTML = `
    <b>Vibe check:</b> This looks like <b>${scoreGuess}%</b> overthinking-trigger potential.<br><br>
    <b>What’s setting it off:</b><br>• ${signals.length ? signals.join("<br>• ") : "No obvious red flags — you might be spiraling from uncertainty."}
    <br><br>
    <b>Why you might feel like this:</b><br>• ${why.join("<br>• ")}
    <br><br>
    <b>Bestie advice:</b><br>• ${advice.join("<br>• ")}
  `;

  // save last analysis
  let d={}; try{ d=JSON.parse(localStorage.getItem(KEY)||"{}"); }catch(e){ d={}; }
  d.lastScan = { text: t.slice(0,1200), scoreGuess, signals };
  localStorage.setItem(KEY, JSON.stringify(d));
};
