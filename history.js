const KEY="delulu_data_v1";
let d={}; try{ d=JSON.parse(localStorage.getItem(KEY)||"{}"); }catch(e){ d={}; }
d.saved = Array.isArray(d.saved) ? d.saved : [];

const list=document.getElementById("list");

function render(){
  if(d.saved.length===0){
    list.innerHTML = "No saved results yet. Go to Results and press <b>Save</b>.";
    return;
  }
  list.innerHTML = d.saved.map(item=>{
    const date = new Date(item.savedAt);
    const when = isNaN(date.getTime()) ? item.savedAt : date.toLocaleString();
    return `
      <div style="padding:.7rem;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(255,255,255,.03);margin:.6rem 0;">
        <b>${item.score}%</b> — ${item.tier}<br>
        <span class="muted small">${when}</span>
      </div>
    `;
  }).join("");
}

document.getElementById("clearHistory").onclick=()=>{
  if(!confirm("Clear saved history?")) return;
  d.saved=[];
  localStorage.setItem(KEY, JSON.stringify(d));
  render();
};

render();
