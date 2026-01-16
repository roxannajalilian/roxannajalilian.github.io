requireAdult("game.html");

const HIGH_KEY = "dd_game_highscore_v2";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("scoreText");
const highText = document.getElementById("highText");
const livesText = document.getElementById("livesText");
const streakText = document.getElementById("streakText");

const btnRestart = document.getElementById("btnRestart");
const btnReplay = document.getElementById("btnReplay");
const loseModal = document.getElementById("loseModal");
const finalScore = document.getElementById("finalScore");
const finalHigh = document.getElementById("finalHigh");

const btnHow = document.getElementById("btnHow");
const howModal = document.getElementById("howModal");
const btnCloseHow = document.getElementById("btnCloseHow");

function getHigh() { return Number(localStorage.getItem(HIGH_KEY) || "0"); }
function setHigh(v) { localStorage.setItem(HIGH_KEY, String(v)); }

let high = getHigh();
highText.textContent = String(high);

// --- Game state ---
let running = true;
let score = 0;
let lives = 3;
let streak = 0;

const keys = new Set();

window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (["arrowleft","arrowright","a","d"].includes(k)) e.preventDefault();
  keys.add(k);
});
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

// Touch / drag support
let pointerX = null;
canvas.addEventListener("pointerdown", (e) => { pointerX = e.clientX; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener("pointermove", (e) => { if (pointerX !== null) pointerX = e.clientX; });
canvas.addEventListener("pointerup", () => { pointerX = null; });
canvas.addEventListener("pointercancel", () => { pointerX = null; });

const player = {
  x: canvas.width * 0.5,
  y: canvas.height - 76,
  w: 62,
  h: 62,
  vx: 0
};

// falling items
// type: "red" or "green"
const items = [];

// particles for fun
const pops = []; // {x,y,txt,life}
function pop(x, y, txt){
  pops.push({ x, y, txt, life: 0.85 });
}

let spawnTimer = 0;

function rand(min, max){ return Math.random() * (max - min) + min; }

function reset(){
  running = true;
  loseModal.style.display = "none";

  score = 0;
  lives = 3;
  streak = 0;

  player.x = canvas.width * 0.5;
  player.vx = 0;

  items.length = 0;
  pops.length = 0;
  spawnTimer = 0;

  scoreText.textContent = "0";
  livesText.textContent = "3";
  streakText.textContent = "0";
}

function rectHit(a, b){
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function spawnItem(){
  // more reds over time but always some greens
  const difficulty = Math.min(2.2, 0.9 + score / 900);
  const redChance = Math.min(0.72, 0.46 + score / 2200);

  const type = (Math.random() < redChance) ? "red" : "green";
  const size = rand(34, 58);
  items.push({
    type,
    x: rand(18, canvas.width - 18 - size),
    y: -size - 12,
    w: size,
    h: size,
    vy: rand(160, 260) * difficulty,
    rot: rand(0, Math.PI*2),
    vr: rand(-2.8, 2.8)
  });
}

function loseLife(){
  lives--;
  livesText.textContent = String(lives);
  streak = 0;
  streakText.textContent = "0";
  pop(player.x + player.w/2, player.y, "💔");

  if (lives <= 0) endGame();
}

function gainPoints(base){
  // streak bonus: every 5 streak adds extra
  streak++;
  streakText.textContent = String(streak);

  const bonus = Math.floor(streak / 5) * 2;
  score += base + bonus;
  scoreText.textContent = String(score);

  pop(player.x + player.w/2, player.y - 10, `+${base + bonus}`);
}

function endGame(){
  running = false;

  if (score > high){
    high = score;
    setHigh(high);
    highText.textContent = String(high);
  }

  finalScore.textContent = String(score);
  finalHigh.textContent = String(high);
  loseModal.style.display = "flex";
}

function update(dt){
  // keyboard move
  const left = keys.has("arrowleft") || keys.has("a");
  const right = keys.has("arrowright") || keys.has("d");
  const target = (right ? 1 : 0) - (left ? 1 : 0);

  // touch drag overrides keyboard when active
  if (pointerX !== null){
    // map pointerX to canvas coords
    const rect = canvas.getBoundingClientRect();
    const px = ((pointerX - rect.left) / rect.width) * canvas.width;
    player.x += (px - (player.x + player.w/2)) * 0.18;
  } else {
    player.vx = target * 520;
    player.x += player.vx * dt;
  }

  player.x = Math.max(10, Math.min(canvas.width - player.w - 10, player.x));

  // spawn gets faster with score
  spawnTimer -= dt;
  const spawnRate = Math.max(0.22, 0.62 - score / 4000); // lower = more frequent
  if (spawnTimer <= 0){
    spawnItem();
    spawnTimer = rand(spawnRate * 0.75, spawnRate * 1.15);
  }

  // move items
  for (const it of items){
    it.y += it.vy * dt;
    it.rot += it.vr * dt;
  }

  // collisions + cleanup
  for (let k = items.length - 1; k >= 0; k--){
    const it = items[k];

    if (rectHit(player, it)){
      if (it.type === "red"){
        pop(it.x + it.w/2, it.y + it.h/2, "🚩");
        items.splice(k, 1);
        loseLife();
        continue;
      } else {
        pop(it.x + it.w/2, it.y + it.h/2, "✅");
        items.splice(k, 1);
        gainPoints(6);
        continue;
      }
    }

    // missed green breaks streak a bit
    if (it.y > canvas.height + 90){
      if (it.type === "green" && streak > 0){
        streak = Math.max(0, streak - 2);
        streakText.textContent = String(streak);
      }
      items.splice(k, 1);
    }
  }

  // particles
  for (let p = pops.length - 1; p >= 0; p--){
    pops[p].life -= dt;
    pops[p].y -= 40 * dt;
    if (pops[p].life <= 0) pops.splice(p, 1);
  }

  // passive score while alive
  score += Math.floor(dt * 4);
  scoreText.textContent = String(score);
}

function roundedRect(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // glow background
  const g = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  g.addColorStop(0, "rgba(124,77,255,0.18)");
  g.addColorStop(0.55, "rgba(0,0,0,0.0)");
  g.addColorStop(1, "rgba(60,200,255,0.14)");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // player
  ctx.save();
  ctx.shadowColor = "rgba(124,77,255,0.35)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "rgba(255,255,255,0.11)";
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 2;
  roundedRect(player.x, player.y, player.w, player.h, 16);
  ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "900 18px ui-sans-serif,system-ui";
  ctx.fillText("YOU", player.x + 16, player.y + 38);
  ctx.restore();

  // items
  for (const it of items){
    ctx.save();
    ctx.translate(it.x + it.w/2, it.y + it.h/2);
    ctx.rotate(it.rot);

    if (it.type === "red"){
      ctx.shadowColor = "rgba(255,60,120,0.35)";
      ctx.fillStyle = "rgba(255,60,120,0.44)";
    } else {
      ctx.shadowColor = "rgba(90,230,160,0.28)";
      ctx.fillStyle = "rgba(90,230,160,0.30)";
    }
    ctx.shadowBlur = 14;

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    roundedRect(-it.w/2, -it.h/2, it.w, it.h, 14);
    ctx.fill(); ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "900 18px ui-sans-serif,system-ui";
    ctx.fillText(it.type === "red" ? "🚩" : "✅", -10, 7);

    ctx.restore();
  }

  // pops
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "900 16px ui-sans-serif,system-ui";
  for (const p of pops){
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillText(p.txt, p.x, p.y);
  }
  ctx.restore();
}

let last = performance.now();
function loop(now){
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  if (running) update(dt);
  draw();

  requestAnimationFrame(loop);
}

// UI controls
btnRestart.addEventListener("click", reset);
btnReplay.addEventListener("click", () => { reset(); });

btnHow.addEventListener("click", () => { howModal.style.display = "flex"; });
btnCloseHow.addEventListener("click", () => { howModal.style.display = "none"; });
howModal.addEventListener("click", (e) => { if (e.target === howModal) howModal.style.display = "none"; });
loseModal.addEventListener("click", (e) => { if (e.target === loseModal) loseModal.style.display = "none"; });

// start
reset();
requestAnimationFrame(loop);
