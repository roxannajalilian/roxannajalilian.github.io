const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const livesEl = document.getElementById("lives");

const gameOverScreen = document.getElementById("gameOver");
const finalScoreEl = document.getElementById("finalScore");

const restartTopBtn = document.getElementById("restartBtn");
const playAgainBtn = document.getElementById("playAgain");

const W = canvas.width;
const H = canvas.height;

// PLAYER
const player = {
  x: W / 2 - 35,
  y: H - 26,
  w: 70,
  h: 12,
  speed: 7
};

// STATE
let score = 0;
let lives = 3;
let running = true;
let keys = {};
let shake = 0;
let speedMultiplier = 1;

let highScore = Number(localStorage.getItem("dd_highscore") || 0);
highScoreEl.textContent = highScore;

// FLAGS
const flags = [];

// INPUT
window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});
window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

// SPAWN
function spawnFlag() {
  flags.push({
    x: Math.random() * (W - 30),
    y: -35,
    size: 28,
    speed: (2.1 + Math.random() * 2.2) * speedMultiplier,
    good: Math.random() < 0.42 // 42% green flags
  });
}

const spawnTimer = setInterval(() => {
  if (running) spawnFlag();
}, 780);

// HELPERS
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function hitBox(a, b) {
  return (
    a.x < b.x + b.size &&
    a.x + a.w > b.x &&
    a.y < b.y + b.size &&
    a.y + a.h > b.y
  );
}

// UPDATE
function update() {
  if (!running) return;

  // Move player
  if (keys["arrowleft"] || keys["a"]) player.x -= player.speed;
  if (keys["arrowright"] || keys["d"]) player.x += player.speed;
  player.x = clamp(player.x, 0, W - player.w);

  // Update flags
  for (let i = flags.length - 1; i >= 0; i--) {
    const f = flags[i];
    f.y += f.speed;

    // collision
    if (hitBox(player, f)) {
      flags.splice(i, 1);

      if (f.good) {
        score += 15;
        speedMultiplier += 0.03; // ramps difficulty
      } else {
        lives -= 1;
        shake = 10;
      }
      continue;
    }

    // remove off screen
    if (f.y > H + 60) flags.splice(i, 1);
  }

  scoreEl.textContent = score;
  livesEl.textContent = lives;

  if (lives <= 0) endGame();
}

// DRAW
function draw() {
  ctx.save();

  // screen shake
  if (shake > 0) {
    ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    shake--;
  }

  ctx.clearRect(0, 0, W, H);

  // background subtle grid
  ctx.globalAlpha = 0.08;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // player
  ctx.fillStyle = "rgba(167,139,250,0.95)";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // player glow
  ctx.shadowColor = "rgba(124,77,255,0.55)";
  ctx.shadowBlur = 18;
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.shadowBlur = 0;

  // flags (emoji)
  flags.forEach((f) => {
    ctx.font = "24px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(f.good ? "💚" : "🚩", f.x + f.size / 2, f.y + f.size / 2);
  });
}

// LOOP
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// END GAME
function endGame() {
  running = false;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("dd_highscore", String(highScore));
  }

  highScoreEl.textContent = highScore;
  finalScoreEl.textContent = score;

  gameOverScreen.style.display = "flex";
}

// RESTARTS
restartTopBtn.addEventListener("click", () => location.reload());
playAgainBtn.addEventListener("click", () => location.reload());

// START
loop();
