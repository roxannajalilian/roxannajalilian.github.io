const KEY="delulu_data_v1";
let d={}; try{ d=JSON.parse(localStorage.getItem(KEY)||"{}"); }catch(e){ d={}; }
const out=document.getElementById("planOut");

const pct = d.quizResult ? Number(d.quizResult.percentage) : null;

function planFor(p){
  if(p===null || Number.isNaN(p)){
    return `No score yet. Take the quiz first so I can tailor this.`;
  }
  if(p<=25){
    return `
      <b>Low overthinking plan (grounded)</b><br><br>
      • Keep doing what you do: look at patterns, not one text.<br>
      • If you feel doubt: ask 1 calm clarity question, then stop.<br>
      • Don’t refresh messages repeatedly — it creates anxiety for no reason.<br><br>
      <b>Mini challenge:</b> Wait 15 minutes before replying when you feel rushed.
    `;
  }
  if(p<=50){
    return `
      <b>Mild overthinking plan</b><br><br>
      • When you spiral: write down 2 facts, 1 guess, 1 question.<br>
      • Replace “what if they hate me” with “what evidence do I have?”<br>
      • Focus on actions: do they show up consistently?<br><br>
      <b>Mini challenge:</b> Mute the chat for 20 minutes after you send a message.
    `;
  }
  if(p<=75){
    return `
      <b>High overthinking plan</b><br><br>
      • Stop rereading. Once is enough. Anxiety edits the meaning.<br>
      • Don’t double-text while emotional. Wait 30 minutes.<br>
      • If you need clarity: send one direct question.<br><br>
      <b>Mini challenge:</b> Do a “reality check”: list 3 possible reasons besides the worst-case.
    `;
  }
  return `
    <b>Very high overthinking plan</b><br><br>
    • Your nervous system is driving this. Calm first, then decide.<br>
    • If you’re checking the phone constantly: set a timer (30–60 mins).<br>
    • Ask for clarity once. If you keep needing reassurance, step back.<br><br>
    <b>Mini challenge:</b> Do 5 minutes breathing + 10 minutes distraction before you reply.
  `;
}

out.innerHTML = planFor(pct);
