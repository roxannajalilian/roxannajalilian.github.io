// game.js
requireAdultOrRedirect();

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const scorePill = document.getElementById("scorePill");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const gameMsg = document.getElementById("gameMsg");

let running = false;
let score = 0;

const player = { x: canvas.width/2, y: canvas.height-40, w: 60, h: 18, vx: 0 };
let drops = [];
let lastSpawn = 0;

function msg(t){
  gameMsg.textContent = t;
  gameMsg.style.display = t ? "block" : "none";
}

function reset(){
  running = false;
  score = 0;
  drops = [];
  player.x = canvas.width/2;
  player.vx = 0;
  scorePill.textContent = "Score: 0";
  msg("");
  draw();
}

function spawn(){
  const words = ["k", "ok", "seen", "…", "??", "fine", "whatever"];
  drops.push({
    x: Math.random()*(canvas.width-40)+20,
    y: -20,
    r: 16 + Math.random()*10,
    vy: 2.2 + Math.random()*2.4,
    t: words[Math.floor(Math.random()*words.length)]
  });
}

function hit(a,b){
  return a.x < b.x + b.r &&
         a.x + a.w > b.x - b.r &&
         a.y < b.y + b.r &&
         a.y + a.h > b.y - b.r;
}

function update(ts){
  if (!running) return;

  // movement
  player.x += player.vx;
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

  // spawn
  if (!lastSpawn || ts - lastSpawn > 520) {
    spawn();
    lastSpawn = ts;
  }

  // drops
  drops.forEach(d => d.y += d.vy);

  // collisions
  for (const d of drops) {
    if (hit(player, d)) {
      running = false;
      msg("You got hit by a red flag 😭  Press Start to try again.");
      return draw();
    }
  }

  // remove passed
  drops = drops.filter(d => d.y < canvas.height + 30);

  score++;
  scorePill.textContent = "Score: " + score;

  draw();
  requestAnimationFrame(update);
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // background glow lines
  ctx.globalAlpha = 0.15;
  for (let i=0;i<8;i++){
    ctx.beginPath();
    ctx.moveTo(0, i*60);
    ctx.lineTo(canvas.width, i*60 + 30);
    ctx.strokeStyle = "white";
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // player
  ctx.fillStyle = "rgba(83,255,214,.9)";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // drops
  drops.forEach(d => {
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
    ctx.fillStyle = "rgba(255,77,109,.85)";
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "bold 14px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(d.t, d.x, d.y);
  });

  if (!running) {
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.font = "bold 16px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Avoid the red flags falling from the sky", canvas.width/2, 26);
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") player.vx = -7;
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") player.vx = 7;
});
document.addEventListener("keyup", (e) => {
  if (["ArrowLeft","ArrowRight","a","d","A","D"].includes(e.key)) player.vx = 0;
});

// mobile drag
let dragging = false;
canvas.addEventListener("pointerdown", () => dragging = true);
canvas.addEventListener("pointerup", () => dragging = false);
canvas.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  player.x = x - player.w/2;
});

startBtn.addEventListener("click", () => {
  reset();
  running = true;
  msg("");
  requestAnimationFrame(update);
});
resetBtn.addEventListener("click", reset);

reset();
