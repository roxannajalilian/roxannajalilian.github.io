const KEY = "dd_game_v1";

function loadGameData() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
}
function saveGameData(d) {
  localStorage.setItem(KEY, JSON.stringify(d));
}

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highEl = document.getElementById("highscore");
const overlay = document.getElementById("overlay");
const endText = document.getElementById("endText");
const startBtn = document.getElementById("startBtn");
const replayBtn = document.getElementById("replayBtn");
const resetHSBtn = document.getElementById("resetHSBtn");

let W = 900, H = 400;
function resize() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * devicePixelRatio);
  canvas.height = Math.floor(rect.height * devicePixelRatio);
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

  W = rect.width;
  H = rect.height;
}
window.addEventListener("resize", resize);
resize();

let running = false;
let score = 0;

const data = loadGameData();
let high = Number(data.high || 0);
highEl.textContent = String(high);

const player = { x: 70, y: 0, r: 18, vy: 0 };
const ground = () => H - 48;

let obstacles = [];
let t = 0;

function resetGame() {
  score = 0;
  t = 0;
  obstacles = [];
  player.y = ground() - player.r;
  player.vy = 0;

  scoreEl.textContent = "0";
  overlay.style.opacity = "0";
  overlay.style.pointerEvents = "none";
}

function spawn() {
  // red flag block
  const w = 40 + Math.random() * 30;
  const h = 50 + Math.random() * 90;
  obstacles.push({
    x: W + 30,
    y: ground() - h,
    w,
    h,
    speed: 4.2 + Math.min(3, score / 25)
  });
}

function die() {
  running = false;

  // highscore save
  if (score > high) {
    high = score;
    highEl.textContent = String(high);
    saveGameData({ high });
  }

  endText.textContent = `Score: ${score} • Highscore: ${high}`;
  overlay.style.opacity = "1";
  overlay.style.pointerEvents = "auto";
}

function jump() {
  if (!running) return;
  // if on ground
  if (player.y >= ground() - player.r - 0.5) {
    player.vy = -11.5;
  }
}

function collide(a, b) {
  return (
    a.x + a.r > b.x &&
    a.x - a.r < b.x + b.w &&
    a.y + a.r > b.y &&
    a.y - a.r < b.y + b.h
  );
}

function draw() {
  // background
  ctx.clearRect(0, 0, W, H);

  // ground line
  ctx.globalAlpha = 0.9;
  ctx.fillRect(0, ground(), W, 2);

  // player
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fill();

  // obstacles
  for (const o of obstacles) {
    ctx.fillRect(o.x, o.y, o.w, o.h);
  }

  // hints text
  ctx.globalAlpha = 0.7;
  ctx.fillText("click/tap to jump", 16, 26);
  ctx.globalAlpha = 1;
}

function step() {
  if (!running) {
    draw();
    return;
  }

  t++;

  // gravity
  player.vy += 0.55;
  player.y += player.vy;

  // clamp to ground
  const gy = ground() - player.r;
  if (player.y > gy) {
    player.y = gy;
    player.vy = 0;
  }

  // spawn timing
  if (t % 65 === 0) spawn();

  // move obstacles
  for (const o of obstacles) {
    o.x -= o.speed;
  }
  // remove offscreen + increase score
  const before = obstacles.length;
  obstacles = obstacles.filter(o => o.x + o.w > -30);
  const removed = before - obstacles.length;
  if (removed > 0) {
    score += removed * 5;
    scoreEl.textContent = String(score);
  }

  // collision
  for (const o of obstacles) {
    if (collide(player, o)) {
      die();
      break;
    }
  }

  // slow score gain
  if (t % 20 === 0) {
    score += 1;
    scoreEl.textContent = String(score);
  }

  draw();
  requestAnimationFrame(step);
}

// controls
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") jump();
});

document.getElementById("gameWrap").addEventListener("pointerdown", () => {
  // if game not started, start it
  if (!running) {
    running = true;
    resetGame();
    requestAnimationFrame(step);
    return;
  }
  jump();
});

startBtn.addEventListener("click", () => {
  running = true;
  resetGame();
  requestAnimationFrame(step);
});

replayBtn.addEventListener("click", () => {
  running = true;
  resetGame();
  requestAnimationFrame(step);
});

resetHSBtn.addEventListener("click", () => {
  high = 0;
  saveGameData({ high: 0 });
  highEl.textContent = "0";
});

// initial screen
resetGame();
draw();
