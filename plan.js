const KEY="delulu_data_v1";

function getData(){
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch(e){ return {}; }
}

const meta = document.getElementById("meta");
const content = document.getElementById("content");
const goQuizBtn = document.getElementById("goQuizBtn");

const d = getData();
const r = d.quizResult;

function planFor(p){
  if(p <= 25){
    return `
      <b>Grounded Plan (Low overthinking)</b><br><br>
      • Keep doing what you’re doing: trust patterns, not one text.<br>
      • If you feel doubt: write 1 sentence “What facts do I have?” then stop.<br>
      • Don’t reread — skim once, then move on.<br><br>
      <b>Mini goal:</b> Wait 10 minutes before replying when you feel anxious.
    `;
  }
  if(p <= 50){
    return `
      <b>Balance Plan (Mild overthinking)</b><br><br>
      • Use the “Evidence vs Assumption” rule: if it’s not proof, treat it as a guess.<br>
      • Set a timer: no checking your phone for 15 minutes after you send a message.<br>
      • Ask 1 calm clarity question instead of rereading 20 times.<br><br>
      <b>Mini goal:</b> One deep breath + one sentence: “I’m okay even if I don’t know yet.”
    `;
  }
  if(p <= 75){
    return `
      <b>Calm-First Plan (High overthinking)</b><br><br>
      • Don’t double text when emotional. Wait 20–30 minutes.<br>
      • Move your body: quick walk / water / stretch — your nervous system needs it.<br>
      • Replace mind-reading with 1 direct question: “Hey, are we good?” then stop.<br><br>
      <b>Mini goal:</b> Mute notifications for 30 minutes after a trigger.
    `;
  }
  return `
    <b>Reset Plan (Very high overthinking)</b><br><br>
    • Your brain is treating uncertainty like danger. Calm first, then interpret.<br>
    • Do a 60-second reset: breathe in 4, hold 4, out 6 (x5).<br>
    • Stop rereading. One read only. Then do something physical (water, walk, shower).<br>
    • If it’s serious: ask for clarity once. If they avoid it, protect your peace.<br><br>
    <b>Mini goal:</b> No checking texts for 45 minutes after you feel triggered.
  `;
}

if(!r || typeof r.percentage !== "number"){
  meta.textContent = "No quiz result found yet.";
  content.innerHTML = "Take the quiz first, then this page will generate your plan automatically.";
  goQuizBtn.style.display = "inline-block";
  goQuizBtn.onclick = () => location.href = "quiz.html";
} else {
  meta.textContent = `Based on your quiz score: ${r.percentage}% (${r.tier || ""})`;
  content.innerHTML = `
    <b>Your type:</b> ${r.personaName || ""}<br>
    <span class="muted">${r.personaParagraph || ""}</span>
    <hr style="border:none;border-top:1px solid rgba(255,255,255,.12);margin:.9rem 0;">
    ${planFor(r.percentage)}
  `;
}
