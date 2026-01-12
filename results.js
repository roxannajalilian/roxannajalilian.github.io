const KEY="delulu_data_v1";
let d={};
try{ d=JSON.parse(localStorage.getItem(KEY)||"{}"); }catch(e){ d={}; }

if(!d.quizResult){ location.href="quiz.html"; }

const r=d.quizResult;

const percentEl=document.getElementById("percent");
const tierEl=document.getElementById("tier");
const bestieEl=document.getElementById("bestieText");
const chipsEl=document.getElementById("whyChips");

percentEl.textContent = `${r.percentage}%`;
tierEl.textContent = r.tier;

function bestieCopy(p){
  if(p<=25){
    return `Okay honestly? <b>you’re pretty grounded.</b> You’re not the type to freak out over one text.<br><br>
    <b>What it might mean:</b> you trust patterns and reality alottt more than assumptions.<br>
    <b>Advice:</b> keep doing that but if you need clarity, ask once calmly.`;
  }
  if(p<=50){
    return `You’re in the <b>mild overthinking</b> zone. Like you’re fine most of the time, but uncertainty triggers you.<br><br>
    <b>What it might mean:</b> you care and you want reassurance when things feel unclear.<br>
    <b>Advice:</b> when you start guessing, pause and ask: “Do I have proof… or am I filling gaps?”`;
  }
  if(p<=75){
    return `Okay bestie… this is giving <b>high overthinking dude</b>. Your brain turns one small text into a whole movie 😭<br><br>
    <b>What it might mean:</b> mixed signals or inconsistency hits your anxiety button and puts you into overdrive.<br>
    <b>Advice:</b> delay reacting, look at actions + consistency, not one reply or emoji.`;
  }
  return `Not gonna lie… you’re in <b>very high overthinking</b> territory. That doesn’t mean you’re crazy.. it justs means anxiety is running the story right now.<br><br>
  <b>What it might mean:</b> uncertainty feels unsafe so your brain tries to solve it by analyzing everything.<br>
  <b>Advice:</b> calm down for a second first, then send one clarity message or just step back all together. Don’t chase reassurance in relationships wether its platonic or not.`;
}

bestieEl.innerHTML = bestieCopy(r.percentage);

// “Why you feel this way” chips
const WHY = [
  { id:"mixed", label:"Mixed signals" },
  { id:"reply", label:"Late replies" },
  { id:"self", label:"Low self-confidence" },
  { id:"past", label:"Past experiences" },
  { id:"control", label:"Need certainty" },
  { id:"attachment", label:"Attachment anxiety" }
];

let selected = new Set();

function applyWhy(){
  const p = r.percentage;
  let extra = "";

  if(selected.has("mixed")) extra += "If they’re inconsistent, it makes sense you’re spiraling — consistency matters.\n";
  if(selected.has("reply")) extra += "Late replies don’t automatically mean anything, but it triggers your brain.\n";
  if(selected.has("self")) extra += "When confidence is low, your brain searches for “proof” you’re not enough.\n";
  if(selected.has("past")) extra += "Past situations can train you to expect the worst — you’re protecting yourself.\n";
  if(selected.has("control")) extra += "Your brain wants certainty fast, so it overthinks to feel in control.\n";
  if(selected.has("attachment")) extra += "You might attach fast and then feel anxious when you can’t read the vibe.\n";

  if(extra.trim()){
    bestieEl.innerHTML = bestieCopy(p) + `<hr><b>Because you picked:</b><br><span class="muted">${extra.trim().replaceAll("\n","<br>")}</span>`;
  }else{
    bestieEl.innerHTML = bestieCopy(p);
  }

  // save selection
  d.why = Array.from(selected);
  localStorage.setItem(KEY, JSON.stringify(d));
}

chipsEl.innerHTML = "";
WHY.forEach(w=>{
  const b=document.createElement("button");
  b.type="button";
  b.className="chip";
  b.textContent=w.label;
  b.onclick=()=>{
    if(selected.has(w.id)) selected.delete(w.id);
    else{
      if(selected.size>=2){ alert("Pick max 2."); return; }
      selected.add(w.id);
    }
    // visual
    b.style.borderColor = selected.has(w.id) ? "rgba(143,140,255,.55)" : "rgba(255,255,255,.12)";
    b.style.background = selected.has(w.id) ? "rgba(143,140,255,.12)" : "rgba(255,255,255,.04)";
    applyWhy();
  };
  chipsEl.appendChild(b);
});

if(Array.isArray(d.why)){
  d.why.forEach(x=> selected.add(x));
  // re-apply visuals
  Array.from(chipsEl.children).forEach((btn, idx)=>{
    const id = WHY[idx].id;
    if(selected.has(id)){
      btn.style.borderColor="rgba(143,140,255,.55)";
      btn.style.background="rgba(143,140,255,.12)";
    }
  });
  applyWhy();
}

// Buttons
document.getElementById("toPlan").onclick=()=> location.href="plan.html";
document.getElementById("redo").onclick=()=> location.href="quiz.html";
document.getElementById("toMenu").onclick=()=> location.href="menu.html";

document.getElementById("save").onclick=()=>{
  d.saved = Array.isArray(d.saved) ? d.saved : [];
  d.saved.unshift({
    savedAt: new Date().toISOString(),
    score: r.percentage,
    tier: r.tier,
    summary: (d.summary || "").slice(0,180)
  });
  d.saved = d.saved.slice(0,25);
  localStorage.setItem(KEY, JSON.stringify(d));
  alert("Saved.");
};
