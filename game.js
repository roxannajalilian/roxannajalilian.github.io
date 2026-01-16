console.log("GAME JS LOADED ✅");

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highEl = document.getElementById("high");
const livesEl = document.getElementById("lives");
const restartBtn = document.getElementById("restart");
const statusEl = document.getElementById("jsStatus");

statusEl.textContent = "JS loaded ✔";

let player = { x: canvas.width / 2, y: canvas.height - 30, w: 50, h: 10 };
let flags = [];
let score = 0;
let lives = 3;
let speed = 2;
let running = true;

let high = Number(localStorage.getItem("dd_highscore") || 0);
highEl.textContent = high;

function spawnFlag() {
  flags.push({
    x: Math.random() * (canvas.width - 20),
    y: -20,
    good: Math.random() > 0.6
  });
}

function drawPlayer() {
  ctx.fillStyle = "#a78bfa";
  ctx.fillRect(player.x, player.y, player.w, player.h);
}

function drawFlags() {
  flags.forEach(f => {
    ctx.font = "20px system-ui";
    ctx.fillText(f.good ? "✅" : "🚩", f.x, f.y);
  });
}

function updateFlags() {
  flags.forEach(f => (f.y += speed));

  flags = flags.filter(f => {
    if (f.y > canvas.height) {
      if (!f.good) {
        lives--;
        livesEl.textContent = lives;
      }
      return false;
    }

    const hit =
      f.x < player.x + player.w &&
      f.x + 20 > player.x &&
      f.y < player.y + player.h &&
      f.y + 20 > player.y;

    if (hit) {
      if (f.good) {
        score += 10;
      } else {
        lives--;
      }
      scoreEl.textContent = score;
      livesEl.textContent = lives;
      return false;
    }
    return true;
  });
}

function gameOver() {
  running = false;
  if (score > high) {
    high = score;
    localStorage.setItem("dd_highscore", high);
    highEl.textContent = high;
  }

  ctx.fillStyle = "rgba(0,0,0,.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  ctx.font = "28px system-ui";
  ctx.fillText("Game Over", canvas.width / 2 - 70, canvas.height / 2 - 10);
  ctx.font = "18px system-ui";
  ctx.fillText("Press Restart", canvas.width / 2 - 65, canvas.height / 2 + 25);
}

function loop() {
  if (!running) return gameOver();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPlayer();
  drawFlags();
  updateFlags();

  if (lives <= 0) return gameOver();

  requestAnimationFrame(loop);
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" || e.key === "a") player.x -= 20;
  if (e.key === "ArrowRight" || e.key === "d") player.x += 20;
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
});

restartBtn.onclick = () => {
  flags = [];
  score = 0;
  lives = 3;
  running = true;
  scoreEl.textContent = 0;
  livesEl.textContent = 3;
  loop();
};

setInterval(spawnFlag, 900);
loop();
