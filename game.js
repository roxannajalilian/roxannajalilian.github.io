requireAdult("game.html");

const HIGH_KEY = "dd_game_highscore_v1";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("scoreText");
const highText = document.getElementById("highText");

const btnRestart = document.getElementById("btnRestart");

const loseModal = document.getElementById("loseModal");
const finalScore = document.getElementById("finalScore");
const finalHigh = document.getElementById("finalHigh");
const btnReplay = document.getElementById("btnReplay");

function getHigh() {
  return Number(localStorage.getItem(HIGH_KEY) || "0");
}
function setHigh(v) {
  localStorage.setItem(HIGH_KEY, String(v));
}

let high = getHigh();
highText.textContent = high;

let running = true;
let score = 0;
let t0 = performance.now();

const player = {
  x: canvas.width * 0.5,
  y: canvas.height - 70,
  w: 54,
  h: 54,
  vx: 0
};

const flags = [];
let spawnTimer = 0;

const keys = new Set();
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (["arrowleft","arrowright","a","d"].includes(k)) e.preventDefault();
  keys.add(k);
});
window.addEventListener("keyup", (e) => {
  keys.delete(e.key.toLowerCase());
});

function reset() {
  running = true;
  loseModal.style.display = "none";
  score = 0;
  t0 = performance.now();
  player.x = canvas.width * 0.5;
  player.vx = 0;
  flags.length = 0;
  spawnTimer = 0;
  scoreText.textContent = "0";
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnFlag() {
  const size = rand(34, 56);
  flags.push({
    x: rand(20, canvas.width - 20 - size),
    y: -size - 10,
    w: size,
    h: size,
    vy: rand(170, 260),
    rot: rand(0, Math.PI * 2),
    vr: rand(-2.4, 2.4)
  });
}

function rectHit(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function lose() {
  running = false;

  const newHigh = Math.max(high, score);
  if (newHigh !== high) {
    high = newHigh;
    setHigh(high);
  }

  highText.textContent = high;
  finalScore.textContent = String(score);
  finalHigh.textContent = String(high);
  loseModal.style.display = "flex";
}

function step(dt) {
  // controls
  const left = keys.has("arrowleft") || keys.has("a");
  const right = keys.has("arrowright") || keys.has("d");

  const target = (right ? 1 : 0) - (left ? 1 : 0);
  player.vx = target * 420;

  player.x += player.vx * dt;
  player.x = Math.max(10, Math.min(canvas.width - player.w - 10, player.x));

  // spawn rate increases slowly
  spawnTimer -= dt;
  const difficulty = Math.min(1.35, 0.65 + score / 250);
  if (spawnTimer <= 0) {
    spawnFlag();
    spawnTimer = rand(0.32, 0.62) / difficulty;
  }

  // move flags
  for (const f of flags) {
    f.y += f.vy * dt * difficulty;
    f.rot += f.vr * dt;
  }

  // cleanup
  while (flags.length && flags[0].y > canvas.height + 120) flags.shift();

  // collision
  for (const f of flags) {
    if (rectHit(player, f)) {
      lose();
      return;
    }
  }

  // score
  score += Math.floor(dt * 100);
  scoreText.textContent = String(score);
}

function drawRoundedRect(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // background sheen
  const g = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  g.addColorStop(0, "rgba(124,77,255,0.18)");
  g.addColorStop(0.55, "rgba(0,0,0,0.0)");
  g.addColorStop(1, "rgba(60,200,255,0.14)");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // player
  ctx.save();
  ctx.shadowColor = "rgba(124,77,255,0.45)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.strokeStyle = "rgba(255,255,255,0.20)";
  ctx.lineWidth = 2;
  drawRoundedRect(player.x, player.y, player.w, player.h, 14);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(255,255,255,0.90)";
  ctx.font = "700 18px ui-sans-serif,system-ui";
  ctx.fillText("YOU", player.x + 12, player.y + 32);
  ctx.restore();

  // flags (red flags)
  for (const f of flags) {
    ctx.save();
    ctx.translate(f.x + f.w/2, f.y + f.h/2);
    ctx.rotate(f.rot);
    ctx.shadowColor = "rgba(255,60,120,0.35)";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "rgba(255,60,120,0.45)";
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    drawRoundedRect(-f.w/2, -f.h/2, f.w, f.h, 12);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "900 16px ui-sans-serif,system-ui";
    ctx.fillText("🚩", -8, 6);
    ctx.restore();
  }
}

let last = performance.now();
function loop(now){
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  if (running) step(dt);
  draw();

  requestAnimationFrame(loop);
}

btnRestart.addEventListener("click", reset);
btnReplay.addEventListener("click", reset);

reset();
requestAnimationFrame(loop);
