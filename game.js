// ELEMENTS
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highEl = document.getElementById("high");
const livesEl = document.getElementById("lives");
const restartBtn = document.getElementById("restart");
const statusEl = document.getElementById("jsStatus");

// GAME STATE
let score = 0;
let lives = 3;
let running = true;

const HIGH_KEY = "delulu_highscore";
let highScore = Number(localStorage.getItem(HIGH_KEY) || 0);
highEl.textContent = highScore;

// PLAYER
const player = {
  x: canvas.width / 2 - 30,
  y: canvas.height - 30,
  w: 60,
  h: 12,
  speed: 7
};

// FLAGS
let flags = [];
const flagSpeed = 3;
const spawnRate = 55;

// INPUT
const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

// STATUS
statusEl.textContent = "JS loaded ✔";

// HELPERS
function spawnFlag() {
  const isGreen = Math.random() < 0.3;
  flags.push({
    x: Math.random() * (canvas.width - 30),
    y: -20,
    size: 18,
    good: isGreen
  });
}

function resetGame() {
  score = 0;
  lives = 3;
  flags = [];
  running = true;
  player.x = canvas.width / 2 - player.w / 2;
  updateUI();
}

function updateUI() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  highEl.textContent = highScore;
}

function gameOver() {
  running = false;
  statusEl.textContent = "Game over 💀  | Restart or go Menu";
}

// LOOP
let tick = 0;
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // MOVE PLAYER
  if ((keys["ArrowLeft"] || keys["a"]) && player.x > 0) {
    player.x -= player.speed;
  }
  if ((keys["ArrowRight"] || keys["d"]) && player.x + player.w < canvas.width) {
    player.x += player.speed;
  }

  // DRAW PLAYER
  ctx.fillStyle = "#b983ff";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // SPAWN FLAGS
  if (tick % spawnRate === 0 && running) spawnFlag();

  // UPDATE FLAGS
  flags.forEach(f => {
    f.y += flagSpeed;
    ctx.fillStyle = f.good ? "#5ae6a0" : "#ff4d6d";
    ctx.fillRect(f.x, f.y, f.size, f.size);

    // COLLISION
    if (
      f.x < player.x + player.w &&
      f.x + f.size > player.x &&
      f.y < player.y + player.h &&
      f.y + f.size > player.y
    ) {
      if (f.good) {
        score += 5;
      } else {
        lives -= 1;
      }
      f.hit = true;
      updateUI();
    }
  });

  // CLEAN FLAGS
  flags = flags.filter(f => !f.hit && f.y < canvas.height + 40);

  // CHECK GAME OVER
  if (lives <= 0 && running) {
    running = false;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem(HIGH_KEY, highScore);
    }
    gameOver();
  }

  tick++;
  requestAnimationFrame(loop);
}

// RESTART
restartBtn.addEventListener("click", () => {
  resetGame();
  statusEl.textContent = "Restarted ✔";
});

// START
resetGame();
loop();
