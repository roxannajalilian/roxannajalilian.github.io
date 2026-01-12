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
  if(/\.\.\.|…/.test(t)) signals.push("Ellipses (‘…’) can feel like attitude.");
  if(/\?{2,}/.test(t)) signals.push("Multiple question marks = anxious urgency.");
  if(/sorry\b/.test(lower)) signals.push("You’re apologizing a lot.");
  if(/nvm|nevermind|whatever|i guess/.test(lower)) signals.push("Shutdown words can spike anxiety.");
  const scoreGuess = Math.min(100, 20 + signals.length * 12);

  out.style.display="block";
  out.innerHTML = `
    <b>Vibe check:</b> ~<b>${scoreGuess}%</b> overthinking-trigger potential.<br><br>
    <b>Triggers found:</b><br>• ${signals.length ? signals.join("<br>• ") : "No obvious red flags — uncertainty might be the trigger."}
    <br><br>
    <b>Bestie advice:</b><br>
    • Look at patterns, not one message.<br>
    • Ask one calm clarity question if needed.<br>
    • Don’t reread 20 times — anxiety edits meaning.
  `;

  let d={}; try{ d=JSON.parse(localStorage.getItem(KEY)||"{}"); }catch(e){ d={}; }
  d.lastScan = { scoreGuess, signals, savedAt:new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(d));
};
