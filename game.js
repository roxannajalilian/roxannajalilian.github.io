\const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const livesEl = document.getElementById("lives");

const gameOverScreen = document.getElementById("gameOver");
const finalScoreEl = document.getElementById("finalScore");

const W = canvas.width;
const H = canvas.height;

// PLAYER
const player = {
  x: W / 2 - 30,
  y: H - 28,
  w: 60,
  h: 12,
  speed: 7
};

// GAME STATE
let score = 0;
let lives = 3;
let speedMultiplier = 1;
let running = true;
let keys = {};
let shake = 0;

let highScore = Number(localStorage.getItem("dd_highscore") || 0);
highScoreEl.textContent = highScore;

// FLAGS
const flags = [];

// INPUT
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// SPAWN FLAGS
function spawnFlag() {
  flags.push({
    x: Math.random() * (W - 28),
    y: -30,
    size: 26,
    speed: (2 + Math.random() * 2) * speedMultiplier,
    good: Math.random() < 0.4 // 40% green flags
  });
}

setInterval(spawnFlag, 800);

// UPDATE
function update() {
  if (!running) return;

  // MOVE PLAYER
  if (keys["arrowleft"] || keys["a"]) player.x -= player.speed;
  if (keys["arrowright"] || keys["d"]) player.x += player.speed;

  player.x = Math.max(0, Math.min(W - player.w, player.x));

  // FLAGS
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
        score += 15;
        speedMultiplier += 0.03;
      } else {
        lives--;
        shake = 10;
      }
      continue;
    }

    if (f.y > H + 40) flags.splice(i, 1);
  }

  scoreEl.textContent = score;
  livesEl.textContent = lives;

  if (lives <= 0) endGame();
}

// DRAW
function draw() {
  ctx.save();

  if (shake > 0) {
    ctx.translate(
      (Math.random() - 0.5) * shake,
      (Math.random() - 0.5) * shake
    );
    shake--;
  }

  ctx.clearRect(0, 0, W, H);

  // PLAYER
  ctx.fillStyle = "#a78bfa";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // FLAGS
  flags.forEach(f => {
    ctx.font = "22px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      f.good ? "💚" : "🚩",
      f.x + f.size / 2,
      f.y + f.size / 2
    );
  });

  ctx.restore();
}

// LOOP
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// GAME OVER
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

// RESTART
document.getElementById("restartBtn").onclick = () => location.reload();
document.getElementById("playAgain").onclick = () => location.reload();

// START
loop();
