const KEY="delulu_data_v1";

function getData(){
  try{ return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch(e){ return {}; }
}
function setData(d){
  localStorage.setItem(KEY, JSON.stringify(d));
}

const pctEl = document.getElementById("pct");
const tierEl = document.getElementById("tier");
const box = document.getElementById("explainBox");
const stamp = document.getElementById("stamp");
const saveBtn = document.getElementById("saveBtn");

const d = getData();
const r = d.quizResult;

function buildText(percentage){
  let tier, paragraph, why, advice;

  if(percentage <= 25){
    tier="Low overthinking";
    paragraph="You’re pretty grounded. You usually don’t jump to conclusions from one message, and you’re better at reading the bigger pattern.";
    why=[
      "You don’t rely on texting tone as ‘proof.’",
      "You can sit with uncertainty better than most."
    ];
    advice=[
      "Keep trusting patterns over single texts.",
      "If you feel doubt: ask one calm question, then stop."
    ];
  } else if(percentage <= 50){
    tier="Mild overthinking";
    paragraph="You sometimes spiral, usually when things feel unclear or the vibe shifts. It’s not extreme — it’s your brain trying to get certainty.";
    why=[
      "Short replies can feel personal even when they aren’t.",
      "Waiting for replies gives your brain time to imagine worst-case stories."
    ];
    advice=[
      "Before reacting, ask: ‘evidence or assumption?’",
      "Focus on actions + consistency, not texting style."
    ];
  } else if(percentage <= 75){
    tier="High overthinking";
    paragraph="You often read into messages, tone, or timing. When you’re anxious, your brain treats guesses like facts, which makes the spiral worse.";
    why=[
      "Your mind fills gaps with negative meanings.",
      "Reassurance-seeking temporarily helps but fuels anxiety long-term."
    ];
    advice=[
      "Don’t double-text while emotional — wait 20–30 mins.",
      "Ask ONE direct clarity question instead of rereading."
    ];
  } else {
    tier="Very high overthinking";
    paragraph="This is giving ‘anxiety is driving.’ You’re reacting to uncertainty like it’s danger. You’re not crazy — you just need calm first, then clarity.";
    why=[
      "Uncertainty feels unbearable, so your mind makes up stories.",
      "Rereading + checking your phone keeps your nervous system activated."
    ];
    advice=[
      "Mute notifications for 30 minutes and ground yourself.",
      "If it matters: ask for clarity once, then protect your peace."
    ];
  }

  return {tier, paragraph, why, advice};
}

if(!r || typeof r.percentage !== "number"){
  pctEl.textContent="--%";
  tierEl.textContent="No result yet";
  stamp.textContent="Take the quiz first.";
  box.innerHTML = "Go to <b>Quiz</b>, finish it, then you’ll see your results here.";
  saveBtn.disabled = true;
} else {
  const percentage = r.percentage;
  const t = buildText(percentage);

  pctEl.textContent = `${percentage}%`;
  tierEl.textContent = t.tier;
  stamp.textContent = `Calculated: ${new Date().toLocaleString()}`;

  box.innerHTML = `
    <b>Explanation:</b><br>${t.paragraph}<br><br>
    <b>Why it rated you this way:</b><br>
    • ${t.why.join("<br>• ")}<br><br>
    <b>Bestie advice:</b><br>
    • ${t.advice.join("<br>• ")}
  `;

  saveBtn.onclick = () => {
    const dd = getData();
    dd.saved = Array.isArray(dd.saved) ? dd.saved : [];
    dd.saved.unshift({
      score: percentage,
      tier: t.tier,
      savedAt: new Date().toISOString()
    });
    dd.saved = dd.saved.slice(0, 30);
    setData(dd);
    alert("Saved ✅");
    location.href = "loading.html";
  };
}
