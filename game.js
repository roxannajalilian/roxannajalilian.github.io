import { requireAdultOrRedirect } from "./gate.js";
requireAdultOrRedirect();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const statusEl = document.getElementById("status");

document.getElementById("readBtn").onclick = () => {
  statusEl.textContent = "Read aloud coming soon.";
};

/* -------- GAME STATE -------- */
let running = false;
let score = 0;
let lives = 3;
let speed = 2;

const player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 40,
  w: 40,
  h: 14,
  speed: 6
};

let keys = {};
let delulus = [];
let clarities = [];

/* -------- INPUT -------- */
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

/* -------- HELPERS -------- */
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnDelulu() {
  delulus.push({
    x: rand(0, canvas.width - 26),
    y: -20,
    r: 14
  });
}

function spawnClarity() {
  clarities.push({
    x: rand(0, canvas.width - 18),
    y: -20,
    r: 10
  });
}

function collide(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/* -------- GAME LOOP -------- */
function update() {
  if (!running) return;

  // move player
  if (keys["arrowleft"] || keys["a"]) player.x -= player.speed;
  if (keys["arrowright"] || keys["d"]) player.x += player.speed;

  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

  // spawn objects
  if (Math.random() < 0.03) spawnDelulu();
  if (Math.random() < 0.01) spawnClarity();

  // move delulus
  delulus.forEach(d => d.y += speed);
  clarities.forEach(c => c.y += speed * 0.8);

  // collisions
  delulus = delulus.filter(d => {
    const hit = collide(player, { x:d.x, y:d.y, w:d.r*2, h:d.r*2 });
    if (hit) {
      lives--;
      statusEl.textContent = "Hit by delulu 😭";
    }
    return !hit && d.y < canvas.height + 20;
  });

  clarities = clarities.filter(c => {
    const hit = collide(player, { x:c.x, y:c.y, w:c.r*2, h:c.r*2 });
    if (hit) {
      score++;
      speed += 0.1;
      statusEl.textContent = "Clarity +1 ✨";
    }
    return !hit && c.y < canvas.height + 20;
  });

  if (lives <= 0) endGame();
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // player
  ctx.fillStyle = "#9df";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // delulus
  ctx.fillStyle = "#ff6b6b";
  delulus.forEach(d => {
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // clarities
  ctx.fillStyle = "#7dffb3";
  clarities.forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // HUD
  ctx.fillStyle = "#fff";
  ctx.font = "14px sans-serif";
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.fillText(`Lives: ${lives}`, canvas.width - 80, 20);
}

function loop() {
  update();
  draw();
  if (running) requestAnimationFrame(loop);
}

/* -------- GAME CONTROL -------- */
function startGame() {
  running = true;
  score = 0;
  lives = 3;
  speed = 2;
  delulus = [];
  clarities = [];
  statusEl.textContent = "GO! Dodge the delulu.";
  loop();
}

function endGame() {
  running = false;
  statusEl.textContent =
    `Game over. Score ${score}. ${score >= 10 ? "You’re lowkey sane 👑" : "It’s ok we all spiral 🫶"}`;
}

startBtn.onclick = startGame;
restartBtn.onclick = startGame;
