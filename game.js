const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const livesEl = document.getElementById("lives");
const restartBtn = document.getElementById("restartBtn");

const gameOverScreen = document.getElementById("gameOver");
const finalScoreEl = document.getElementById("finalScore");
const playAgainBtn = document.getElementById("playAgain");

const W = canvas.width;
const H = canvas.height;

// PLAYER
const player = {
  x: W / 2 - 25,
  y: H - 40,
  w: 50,
  h: 12,
  speed: 6
};

// STATE
let score = 0;
let lives = 3;
let running = true;
let keys = {};

let highScore = Number(localStorage.getItem("dd_highscore") || 0);
highScoreEl.textContent = highScore;

// FLAGS
const flags = [];

function spawnFlag() {
  const good = Math.random() < 0.35;
  flags.push({
    x: Math.random() * (W - 24),
    y: -30,
    size: 22,
    speed: 2 + Math.random() * 2,
    good
  });
}

setInterval(spawnFlag, 900);

// INPUT
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// GAME LOOP
function update() {
  if (!running) return;

  // MOVE PLAYER
  if (keys["arrowleft"] || keys["a"]) player.x -= player.speed;
  if (keys["arrowright"] || keys["d"]) player.x += player.speed;

  player.x = Math.max(0, Math.min(W - player.w, player.x));

  // UPDATE FLAGS
  for (let i = flags.length - 1; i >= 0; i--) {
    const f = flags[i];
    f.y += f.speed;

    // COLLISION
    if (
      f.x < player.x + player.w &&
      f.x + f.size > player.x &&
      f.y < player.y + player.h &&
      f.y + f.size > player.y
    ) {
      flags.splice(i, 1);
      if (f.good) {
        score += 10;
      } else {
        lives--;
      }
      continue;
    }

    // OFF SCREEN
    if (f.y > H + 40) flags.splice(i, 1);
  }

  // UPDATE UI
  scoreEl.textContent = score;
  livesEl.textContent = lives;

  if (lives <= 0) endGame();
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  // PLAYER
  ctx.fillStyle = "#a78bfa";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // FLAGS
  flags.forEach(f => {
    ctx.fillStyle = f.good ? "#22c55e" : "#ef4444";
    ctx.fillRect(f.x, f.y, f.size, f.size);
  });
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function endGame() {
  running = false;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("dd_highscore", highScore);
  }

  highScoreEl.textContent = highScore;
  finalScoreEl.textContent = score;
  gameOverScreen.style.display = "flex";
}

function resetGame() {
  score = 0;
  lives = 3;
  flags.length = 0;
  running = true;
  gameOverScreen.style.display = "none";
}

restartBtn.onclick = resetGame;
playAgainBtn.onclick = resetGame;

// START
loop();
