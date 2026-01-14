import { requireAdultOrRedirect, getData, setData } from "./gate.js";
requireAdultOrRedirect();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const statusEl = document.getElementById("status");
const readBtn = document.getElementById("readBtn");

readBtn?.addEventListener("click", () => {
  statusEl.textContent = "Read aloud coming soon.";
});

let running = false;
let score = 0;
let lives = 3;
let speed = 2.2;

const player = {
  x: canvas.width / 2 - 24,
  y: canvas.height - 36,
  w: 48,
  h: 14,
  speed: 7
};

let keys = {};
let delulus = [];
let clarities = [];
let frame = 0;

window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnDelulu() {
  delulus.push({ x: rand(0, canvas.width - 28), y: -20, r: 14 });
}

function spawnClarity() {
  clarities.push({ x: rand(0, canvas.width - 20), y: -20, r: 10 });
}

function collideRect(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function update() {
  if (!running) return;
  frame++;

  // movement
  if (keys["arrowleft"] || keys["a"]) player.x -= player.speed;
  if (keys["arrowright"] || keys["d"]) player.x += player.speed;
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

  // spawns (slightly patterned so it feels gamey)
  if (frame % 18 === 0 && Math.random() < 0.65) spawnDelulu();
  if (frame % 55 === 0) spawnClarity();

  // move objects
  delulus.forEach(d => d.y += speed);
  clarities.forEach(c => c.y += speed * 0.85);

  // collisions / cleanup
  delulus = delulus.filter(d => {
    const hit = collideRect(player.x, player.y, player.w, player.h, d.x - d.r, d.y - d.r, d.r*2, d.r*2);
    if (hit) {
      lives--;
      statusEl.textContent = "Hit by delulu 😭";
    }
    return !hit && d.y < canvas.height + 30;
  });

  clarities = clarities.filter(c => {
    const hit = collideRect(player.x, player.y, player.w, player.h, c.x - c.r, c.y - c.r, c.r*2, c.r*2);
    if (hit) {
      score++;
      speed += 0.12;
      statusEl.textContent = "Clarity +1 ✨";
    }
    return !hit && c.y < canvas.height + 30;
  });

  if (lives <= 0) endGame();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // subtle HUD glow overlay (fake)
  ctx.fillStyle = "rgba(120,220,255,.06)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // player
  ctx.fillStyle = "rgba(120,220,255,.95)";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // delulus (red)
  ctx.fillStyle = "rgba(255,107,107,.92)";
  delulus.forEach(d => {
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // clarities (green)
  ctx.fillStyle = "rgba(125,255,179,.92)";
  clarities.forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // HUD text
  ctx.fillStyle = "rgba(255,255,255,.92)";
  ctx.font = "14px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText(`Score: ${score}`, 12, 22);
  ctx.fillText(`Lives: ${lives}`, canvas.width - 86, 22);
}

function loop() {
  update();
  draw();
  if (running) requestAnimationFrame(loop);
}

function startGame() {
  running = true;
  score = 0;
  lives = 3;
  speed = 2.2;
  delulus = [];
  clarities = [];
  frame = 0;
  statusEl.textContent = "GO! Dodge the delulu.";
  loop();
}

function endGame() {
  running = false;

  // save last score
  const d = getData();
  d.lastGameScore = score;
  setData(d);

  statusEl.textContent =
    `Game over. Score ${score}. ${score >= 10 ? "You’re lowkey sane 👑" : "It’s okay we all spiral 🫶"}`;
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
