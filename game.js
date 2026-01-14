const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const scoreBadge = document.getElementById("scoreBadge");
const overlay = document.getElementById("loseOverlay");
const restartBtn = document.getElementById("restartBtn");
const restartInline = document.getElementById("restartInline");

let running = true;

const player = { x: canvas.width/2, y: canvas.height-40, w: 46, h: 14, speed: 10 };
let score = 0;
let ticks = 0;
let hazards = [];

function rectHit(a,b){
  return (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y);
}

function spawnHazard(){
  const s = 18 + Math.random()*18;
  hazards.push({
    x: Math.random()*(canvas.width - s),
    y: -s,
    s,
    v: 3 + Math.random()*3
  });
}

const keys = { left:false, right:false };
addEventListener("keydown", e => { if(e.key==="ArrowLeft") keys.left=true; if(e.key==="ArrowRight") keys.right=true; });
addEventListener("keyup", e => { if(e.key==="ArrowLeft") keys.left=false; if(e.key==="ArrowRight") keys.right=false; });

function showLose(){
  running = false;
  overlay.classList.remove("hidden");
}

function hideLose(){
  overlay.classList.add("hidden");
}

function resetGame(){
  running = true;
  score = 0;
  ticks = 0;
  hazards = [];
  player.x = canvas.width/2;
  scoreBadge.textContent = `Score: ${score}`;
  hideLose();
}

restartBtn.addEventListener("click", resetGame);
restartInline.addEventListener("click", resetGame);

function update(){
  if(!running) return;
  ticks++;

  if(keys.left) player.x -= player.speed;
  if(keys.right) player.x += player.speed;
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

  if(ticks % 18 === 0) spawnHazard();

  for(const h of hazards) h.y += h.v;

  hazards = hazards.filter(h => {
    if(h.y > canvas.height + h.s){
      score++;
      scoreBadge.textContent = `Score: ${score}`;
      return false;
    }
    return true;
  });

  const pRect = { x: player.x, y: player.y, w: player.w, h: player.h };
  for(const h of hazards){
    const hRect = { x: h.x, y: h.y, w: h.s, h: h.s };
    if(rectHit(pRect, hRect)){ showLose(); break; }
  }
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = "rgba(255,255,255,.9)";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  ctx.fillStyle = "rgba(255,80,110,.85)";
  for(const h of hazards){
    ctx.beginPath();
    ctx.rect(h.x, h.y, h.s, h.s);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(255,255,255,.65)";
  ctx.font = "14px system-ui";
  ctx.fillText("Avoid the red flags", 16, 24);
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

resetGame();
loop();
