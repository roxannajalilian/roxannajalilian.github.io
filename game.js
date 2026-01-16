(() => {
  const status = (t) => {
    const s = document.getElementById("jsStatus");
    if (s) s.textContent = "JS status: " + t;
  };

  status("loaded");

  const canvas = document.getElementById("gameCanvas");
  if (!canvas) return status("ERROR: #gameCanvas missing");

  const ctx = canvas.getContext("2d");
  if (!ctx) return status("ERROR: canvas context failed");

  const scoreEl = document.getElementById("score");
  const highEl = document.getElementById("highScore");
  const livesEl = document.getElementById("lives");
  const restartBtn = document.getElementById("restartBtn");
  const overBox = document.getElementById("gameOver");
  const finalScoreEl = document.getElementById("finalScore");
  const playAgainBtn = document.getElementById("playAgain");

  if (!scoreEl || !highEl || !livesEl || !restartBtn || !overBox || !finalScoreEl || !playAgainBtn) {
    return status("ERROR: missing UI IDs");
  }

  status("running");

  const W = canvas.width;
  const H = canvas.height;

  const HIGH_KEY = "dd_game_high";
  let high = Number(localStorage.getItem(HIGH_KEY) || 0);
  highEl.textContent = high;

  let score = 0;
  let lives = 3;
  let running = true;

  const keys = {};
  window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
  window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

  const player = { x: W/2-50, y: H-24, w:100, h:14, speed:8 };
  let flags = [];

  function spawn() {
    flags.push({
      x: Math.random()*(W-40)+20,
      y: -30,
      good: Math.random() < 0.4,
      vy: 2 + Math.random()*3
    });
  }
  setInterval(() => { if (running) spawn(); }, 650);

  function reset() {
    score = 0;
    lives = 3;
    flags = [];
    running = true;
    overBox.style.display = "none";
    scoreEl.textContent = "0";
    livesEl.textContent = "3";
    status("running");
  }

  function endGame() {
    running = false;
    if (score > high) {
      high = score;
      localStorage.setItem(HIGH_KEY, high);
      highEl.textContent = high;
    }
    finalScoreEl.textContent = score;
    overBox.style.display = "flex";
    status("game over");
  }

  function loop() {
    ctx.clearRect(0,0,W,H);

    if (running) {
      if (keys["arrowleft"] || keys["a"]) player.x -= player.speed;
      if (keys["arrowright"] || keys["d"]) player.x += player.speed;
      player.x = Math.max(0, Math.min(W-player.w, player.x));
    }

    ctx.fillStyle = "rgba(167,139,250,.95)";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    for (let i = flags.length-1; i>=0; i--) {
      const f = flags[i];
      f.y += f.vy;

      ctx.font = "26px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(f.good ? "💚" : "🚩", f.x, f.y);

      const hit =
        f.x > player.x && f.x < player.x+player.w &&
        f.y > player.y-10 && f.y < player.y+player.h+10;

      if (running && hit) {
        flags.splice(i,1);
        if (f.good) score += 10;
        else lives -= 1;
        scoreEl.textContent = score;
        livesEl.textContent = lives;
        if (lives <= 0) endGame();
        continue;
      }

      if (f.y > H+40) flags.splice(i,1);
    }

    requestAnimationFrame(loop);
  }

  restartBtn.onclick = reset;
  playAgainBtn.onclick = reset;

  reset();
  loop();
})();
