// game.js — Delulu Dodge (Red flags vs Green flags)
// Requires: shared.js + requireAdult("game.html") in game.html
// HTML needs: <canvas id="game"> and #score #high #lives and #restart

requireAdult("game.html");

const APP_KEY = "dd_app_v1"; // same as your app
function getAppData() {
  try { return JSON.parse(localStorage.getItem(APP_KEY) || "{}"); }
  catch { return {}; }
}
function setAppData(d) {
  localStorage.setItem(APP_KEY, JSON.stringify(d));
}

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highEl  = document.getElementById("high");
const livesEl = document.getElementById("lives");
const restartBtn = document.getElementById("restart");

if (!canvas || !ctx) {
  alert("Canvas not found. Make sure game.html has <canvas id='game'>");
}

// ===== Settings =====
const W = canvas.width;
const H = canvas.height;

// Player
const player = {
  w: 84,
  h: 20,
  x: W / 2,
  y: H - 46,
  speed: 560, // px/sec
};

// Falling items
const items = [];
let spawnTimer = 0;

let running = true;
let paused = false;

let score = 0;
let lives = 3;

let combo = 0;        // bonus for green streaks
let comboTimer = 0;   // streak timer
let difficulty = 1;   // increases over time
let timeAlive = 0;

// High score
const data = getAppData();
let highScore = Number(data.highScore || 0);
highEl.textContent = highScore;

// Input
let leftDown = false;
let rightDown = false;
let dragActive = false;
let dragOffsetX = 0;

// UI overlay buttons
let overlay = {
  show: false,
  title: "Game Over",
  subtitle: "",
  buttons: []
};

// ===== Helpers =====
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function rand(min, max) { return Math.random() * (max - min) + min; }
function chance(p) { return Math.random() < p; }

function setHUD() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  highEl.textContent = highScore;
}

// Create item
function spawnItem() {
  // more reds than greens, but greens are valuable
  const isGreen = chance(0.33); // 33% green
  const size = isGreen ? rand(26, 36) : rand(26, 40);

  const speed = rand(120, 220) * (1 + difficulty * 0.22);

  items.push({
    type: isGreen ? "green" : "red",
    x: rand(30, W - 30),
    y: -40,
    r: size / 2,
    vy: speed,
    wobble: rand(0.5, 1.6),
    phase: rand(0, Math.PI * 2),
    label: isGreen ? "✅" : "🚩"
  });
}

// Circle-rect collision
function hitCircleRect(cx, cy, r, rx, ry, rw, rh) {
  const closestX = clamp(cx, rx, rx + rw);
  const closestY = clamp(cy, ry, ry + rh);
  const dx = cx - closestX;
  const dy = cy - closestY;
  return (dx * dx + dy * dy) <= r * r;
}

// Game over
function gameOver(reasonText = "") {
  running = false;
  overlay.show = true;
  overlay.title = "You lost 😭";
  overlay.subtitle = reasonText || `Score: ${score} — High: ${highScore}`;

  overlay.buttons = [
    { text: "Replay", action: () => resetGame(true) },
    { text: "Menu", action: () => window.location.href = "menu.html" }
  ];

  // save highs
  if (score > highScore) {
    highScore = score;
    const d = getAppData();
    d.highScore = highScore;
    setAppData(d);
  }
  setHUD();
}

function resetGame(keepHigh = true) {
  items.length = 0;
  spawnTimer = 0;
  running = true;
  paused = false;
  overlay.show = false;

  score = 0;
  lives = 3;
  combo = 0;
  comboTimer = 0;
  difficulty = 1;
  timeAlive = 0;

  player.x = W / 2;

  // keep existing high score
  if (!keepHigh) {
    highScore = 0;
    const d = getAppData();
    d.highScore = 0;
    setAppData(d);
  }

  setHUD();
}

// ===== Drawing =====
function drawBackground() {
  // soft gradient
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "rgba(124,77,255,0.20)");
  g.addColorStop(1, "rgba(60,200,255,0.12)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // subtle grid
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

function drawPlayer() {
  // player "heart"
  const x = player.x - player.w / 2;
  const y = player.y;

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;

  roundRect(ctx, x, y, player.w, player.h, 10);
  ctx.fill();
  ctx.stroke();

  // glow bar
  const g = ctx.createLinearGradient(x, y, x + player.w, y);
  g.addColorStop(0, "rgba(124,77,255,0.55)");
  g.addColorStop(1, "rgba(90,230,160,0.40)");
  ctx.fillStyle = g;
  roundRect(ctx, x + 6, y + 5, player.w - 12, player.h - 10, 8);
  ctx.fill();

  ctx.restore();
}

function drawItem(it) {
  ctx.save();

  // glow
  const glow = it.type === "green"
    ? "rgba(90,230,160,0.35)"
    : "rgba(255,80,120,0.35)";

  ctx.shadowColor = glow;
  ctx.shadowBlur = 18;

  // circle
  const fill = it.type === "green"
    ? "rgba(90,230,160,0.22)"
    : "rgba(255,80,120,0.22)";
  const stroke = it.type === "green"
    ? "rgba(90,230,160,0.55)"
    : "rgba(255,80,120,0.55)";

  ctx.beginPath();
  ctx.arc(it.x, it.y, it.r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = stroke;
  ctx.stroke();

  // emoji
  ctx.shadowBlur = 0;
  ctx.font = `900 ${Math.floor(it.r * 1.3)}px system-ui`;
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(it.label, it.x, it.y + 1);

  ctx.restore();
}

function drawTopText() {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "700 16px system-ui";
  ctx.fillText(`Combo: ${combo}x`, 18, 24);
  ctx.fillText(`Difficulty: ${difficulty.toFixed(1)}`, 18, 48);
  ctx.restore();
}

function drawOverlay() {
  if (!overlay.show) return;

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, W, H);

  // box
  const bw = 520;
  const bh = 240;
  const bx = (W - bw) / 2;
  const by = (H - bh) / 2;

  ctx.fillStyle = "rgba(20,20,40,0.75)";
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 2;
  roundRect(ctx, bx, by, bw, bh, 18);
  ctx.fill();
  ctx.stroke();

  // title
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "900 36px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(overlay.title, bx + bw / 2, by + 70);

  // subtitle
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = "700 16px system-ui";
  wrapText(ctx, overlay.subtitle, bx + bw / 2, by + 110, 460, 20);

  // buttons
  overlay.buttons.forEach((b, i) => {
    const w = 180, h = 44;
    const x = bx + 80 + i * (w + 40);
    const y = by + 170;

    b._rect = { x, y, w, h };

    // button style
    const grad = ctx.createLinearGradient(x, y, x + w, y);
    grad.addColorStop(0, "rgba(124,77,255,0.45)");
    grad.addColorStop(1, "rgba(90,230,160,0.28)");
    ctx.fillStyle = grad;
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    roundRect(ctx, x, y, w, h, 999);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "900 16px system-ui";
    ctx.fillText(b.text, x + w / 2, y + 28);
  });

  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text || "").split(" ");
  let line = "";
  let yy = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, yy);
      line = words[i] + " ";
      yy += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) ctx.fillText(line.trim(), x, yy);
}

// ===== Update loop =====
let last = performance.now();

function tick(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  ctx.clearRect(0, 0, W, H);
  drawBackground();

  if (!paused) {
    update(dt);
  }

  drawPlayer();
  items.forEach(drawItem);
  drawTopText();
  drawOverlay();

  requestAnimationFrame(tick);
}

function update(dt) {
  if (!running) return;

  timeAlive += dt;
  // difficulty ramps slowly
  difficulty = 1 + timeAlive / 16;

  // movement
  let move = 0;
  if (leftDown) move -= 1;
  if (rightDown) move += 1;
  player.x += move * player.speed * dt;
  player.x = clamp(player.x, player.w / 2 + 8, W - player.w / 2 - 8);

  // combo timer drops if you stop catching
  if (combo > 0) {
    comboTimer -= dt;
    if (comboTimer <= 0) combo = 0;
  }

  // spawn logic
  const spawnEvery = Math.max(0.22, 0.60 - difficulty * 0.04);
  spawnTimer += dt;
  while (spawnTimer >= spawnEvery) {
    spawnTimer -= spawnEvery;
    spawnItem();
  }

  // update items
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];

    // wobble sideways
    it.phase += dt * it.wobble;
    it.x += Math.sin(it.phase) * 26 * dt;

    it.y += it.vy * dt;

    // collision with player
    const px = player.x - player.w / 2;
    const py = player.y;

    if (hitCircleRect(it.x, it.y, it.r, px, py, player.w, player.h)) {
      if (it.type === "red") {
        lives -= 1;
        combo = 0;
        comboTimer = 0;

        // little penalty
        score = Math.max(0, score - 6);

        items.splice(i, 1);
        setHUD();

        if (lives <= 0) {
          gameOver("You hit too many 🚩 red flags. Next time: dodge the bare minimum 😭");
        }
        continue;
      } else {
        // green caught
        combo = Math.min(10, combo + 1);
        comboTimer = 2.2; // keep streak alive
        const bonus = 8 + combo * 2; // streak bonus
        score += bonus;

        items.splice(i, 1);
        setHUD();
        continue;
      }
    }

    // off screen bottom
    if (it.y - it.r > H + 30) {
      // if it was green and you missed it, small “sad”
      if (it.type === "green") {
        combo = 0;
        comboTimer = 0;
        score = Math.max(0, score - 2);
      } else {
        // survive reds = points
        score += 1;
      }
      items.splice(i, 1);
      setHUD();
    }
  }

  // update high score live
  if (score > highScore) {
    highScore = score;
    const d = getAppData();
    d.highScore = highScore;
    setAppData(d);
    setHUD();
  }
}

// ===== Controls =====
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") leftDown = true;
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") rightDown = true;

  if (e.key === "Escape") paused = !paused;

  // Prevent page scroll on arrows
  if (["ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") leftDown = false;
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") rightDown = false;
});

// Touch / mouse drag
function pointerX(ev) {
  const rect = canvas.getBoundingClientRect();
  const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
  const x = (clientX - rect.left) * (canvas.width / rect.width);
  return x;
}

canvas.addEventListener("mousedown", (e) => {
  dragActive = true;
  dragOffsetX = pointerX(e) - player.x;
});
window.addEventListener("mousemove", (e) => {
  if (!dragActive || overlay.show) return;
  player.x = pointerX(e) - dragOffsetX;
  player.x = clamp(player.x, player.w / 2 + 8, W - player.w / 2 - 8);
});
window.addEventListener("mouseup", () => { dragActive = false; });

canvas.addEventListener("touchstart", (e) => {
  dragActive = true;
  dragOffsetX = pointerX(e) - player.x;
}, { passive: true });

canvas.addEventListener("touchmove", (e) => {
  if (!dragActive || overlay.show) return;
  player.x = pointerX(e) - dragOffsetX;
  player.x = clamp(player.x, player.w / 2 + 8, W - player.w / 2 - 8);
}, { passive: true });

canvas.addEventListener("touchend", () => { dragActive = false; });

// Click overlay buttons
canvas.addEventListener("click", (e) => {
  if (!overlay.show) return;

  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const my = (e.clientY - rect.top) * (canvas.height / rect.height);

  for (const b of overlay.buttons) {
    const r = b._rect;
    if (!r) continue;
    if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
      b.action();
      return;
    }
  }
});

// Restart button
restartBtn?.addEventListener("click", () => resetGame(true));

// Start
setHUD();
requestAnimationFrame(tick);
