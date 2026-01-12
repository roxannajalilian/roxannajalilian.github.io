const c = document.getElementById("c");
const ctx = c.getContext("2d");

let running=false;
let score=0;

const player = { x: 120, y: 260, vy: 0, r: 18, grounded:true };
let clouds=[];
let checks=[];
let t=0;

function rand(min,max){ return Math.random()*(max-min)+min; }

function reset(){
  running=false; score=0; t=0;
  player.y=260; player.vy=0; player.grounded=true;
  clouds=[]; checks=[];
  updateScore();
  draw();
}

function updateScore(){
  document.getElementById("score").textContent = `Score: ${score}`;
}

function spawn(){
  // cloud obstacle
  if(Math.random()<0.035){
    clouds.push({ x: c.width+30, y: rand(170, 290), w: rand(34,60), h: rand(26,44), vx: rand(3.6,5.2) });
  }
  // reality check collectible
  if(Math.random()<0.022){
    checks.push({ x: c.width+30, y: rand(120, 250), r: 12, vx: rand(3.3,4.7) });
  }
}

function hitCircleRect(cx,cy,cr, rx,ry,rw,rh){
  const px = Math.max(rx, Math.min(cx, rx+rw));
  const py = Math.max(ry, Math.min(cy, ry+rh));
  const dx = cx-px, dy=cy-py;
  return (dx*dx+dy*dy) <= cr*cr;
}

function hitCircleCircle(a,b){
  const dx=a.x-b.x, dy=a.y-b.y;
  const rr=a.r+b.r;
  return dx*dx+dy*dy <= rr*rr;
}

function jump(){
  if(!running) return;
  if(player.grounded){
    player.vy = -10.5;
    player.grounded=false;
  }
}

function step(){
  if(!running) return;

  t++;
  spawn();

  // physics
  player.vy += 0.55;
  player.y += player.vy;
  if(player.y >= 260){
    player.y = 260;
    player.vy = 0;
    player.grounded = true;
  }

  // move obstacles
  clouds.forEach(o=> o.x -= o.vx);
  checks.forEach(o=> o.x -= o.vx);

  // collisions
  for(const o of clouds){
    if(hitCircleRect(player.x, player.y, player.r, o.x, o.y, o.w, o.h)){
      running=false;
      draw(true);
      return;
    }
  }
  for(let i=checks.length-1;i>=0;i--){
    const p = {x:player.x, y:player.y, r:player.r};
    const q = checks[i];
    if(hitCircleCircle(p, {x:q.x, y:q.y, r:q.r})){
      checks.splice(i,1);
      score += 5;
      updateScore();
    }
  }

  // cleanup + score tick
  clouds = clouds.filter(o=> o.x > -80);
  checks = checks.filter(o=> o.x > -40);

  if(t % 20 === 0){
    score += 1;
    updateScore();
  }

  draw();
  requestAnimationFrame(step);
}

function draw(gameOver=false){
  ctx.clearRect(0,0,c.width,c.height);

  // ground line
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.lineTo(c.width, 300);
  ctx.stroke();

  // player (delulu orb)
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI*2);
  ctx.fill();
  ctx.stroke();

  // label
  ctx.font = "14px system-ui";
  ctx.fillText("YOU", player.x-14, player.y-28);

  // clouds (delusion)
  ctx.font = "18px system-ui";
  clouds.forEach(o=>{
    ctx.fillText("☁️", o.x, o.y+18);
  });

  // checks (reality)
  checks.forEach(o=>{
    ctx.fillText("✅", o.x-8, o.y+8);
  });

  if(!running && score===0){
    ctx.font = "18px system-ui";
    ctx.fillText("Press Start. Tap/click to jump.", 280, 70);
  }

  if(gameOver){
    ctx.font = "26px system-ui";
    ctx.fillText("Game Over 😭", 360, 120);
    ctx.font = "16px system-ui";
    ctx.fillText("Press Start to try again.", 350, 150);
  }
}

document.getElementById("start").onclick=()=>{
  reset();
  running=true;
  requestAnimationFrame(step);
};
document.getElementById("reset").onclick=reset;

c.addEventListener("mousedown", jump);
c.addEventListener("touchstart", (e)=>{ e.preventDefault(); jump(); }, {passive:false});
document.addEventListener("keydown", (e)=>{ if(e.code==="Space") jump(); });

reset();
