// game.js — Bulletproof Delulu Game
(function () {
  const statusEl = document.getElementById("jsStatus");
  const canvas = document.getElementById("gameCanvas");

  function setStatus(t) {
    if (statusEl) statusEl.textContent = t;
  }

  if (!canvas) {
    setStatus("ERROR: Canvas not found. game.html must contain #gameCanvas.");
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    setStatus("ERROR: Canvas context failed.");
    return;
  }

  // OPTIONAL AGE GATE: do not let missing shared.js kill the game
  try {
    if (typeof requireAdult === "function") requireAdult("game.html");
  } catch (e) {
    // ignore and keep game running
  }

  // HUD elements
  const scoreEl = document.getElementById("score");
  const highEl = document.getElementById("highScore");
  const livesEl = document.getElementById("lives");

  const restartBtn = document.getElementById("restartBtn");
  const over = document.getElementById("gameOver");
  const finalScoreEl = document.getElementById("finalScore");
  const playAgainBtn = document.getElementById("playAgain");

  // Safe checks
  if (!scoreEl || !highEl || !livesEl || !restartBtn || !over || !finalScoreEl || !playAgainBtn) {
    setStatus("ERROR: Missing UI IDs (score/highScore/lives/restartBtn/gameOver/finalScore/playAgain).");
    return;
  }

  setStatus("JS loaded ✅ (use ← → / A D)");

  const W = canvas.width;
  const H = canvas.height;

  // High score
  const HIGH_KEY = "dd_game_highscore";
  let highScore = Number(localStorage.getItem(HIGH_KEY) || 0);
  highEl.textContent = String(highScore);

  // Player
  const player = {
    x: W / 2,
    y: H - 38,
    w: 86,
    h: 16,
    speed: 620 // px/sec
  };

  // Game state
  let score = 0;
  let lives = 3;
  let running = true;

  let difficulty = 1;         // ramps with time
  let timeAlive = 0;
  let shake = 0;

  // Combo for greens
  let combo = 0;
  let comboTimer = 0;

  // Input
  const keys = {};
  window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
    if (["arrowleft", "arrowright"].includes(e.key.toLowerCase())) e.preventDefault();
  });
  window.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

  // Touch drag
  let dragging = false;
  let dragOffset = 0;
  function pointerX(ev) {
    const rect = canvas.getBoundingClientRect();
    const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
    return (clientX - rect.left) * (canvas.width / rect.width);
  }
  canvas.addEventListener("mousedown", (e) => {
    dragging = true;
    dragOffset = pointerX(e) - player.x;
  });
  window.addEventListener("mouseup", () => (dragging = false));
  window.addEventListener("mousemove", (e) => {
    if (!dragging || !running) return;
    player.x = pointerX(e) - dragOffset;
  });
  canvas.addEventListener("touchstart", (e) => {
    dragging = true;
    dragOffset = pointerX(e) - player.x;
  }, { passive: true });
  canvas.addEventListener("touchend", () => (dragging = false), { passive: true });
  canvas.addEventListener("touchmove", (e) => {
    if (!dragging || !running) return;
    player.x = pointerX(e) - dragOffset;
  }, { passive: true });

  // Falling flags
  const flags = [];
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function spawnFlag() {
    const good = Math.random() < 0.40; // 40% green
    const size = good ? 28 : 30;

    const baseSpeed = good ? 150 : 170;
    const v = (baseSpeed + Math.random() * 120) * (1 + difficulty * 0.20);

    flags.push({
      x: Math.random() * (W - 60) + 30,
      y: -40,
      r: size,
      vy: v,
      good,
      wobble: 0.8 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2
    });
  }

  let spawnAcc = 0;

  function setHUD() {
    scoreEl.textContent = String(score);
    livesEl.textContent = String(lives);
    highEl.textContent = String(highScore);
  }

  function endGame() {
    running = false;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem(HIGH_KEY, String(highScore));
      highEl.textContent = String(highScore);
    }

    finalScoreEl.textContent = String(score);
    over.style.display = "flex";
    setStatus("Game over 💀");
  }

  function reset() {
    score = 0;
    lives = 3;
    running = true;
    difficulty = 1;
    timeAlive = 0;
    shake = 0;
    combo = 0;
    comboTimer = 0;
    flags.length = 0;
    over.style.display = "none";
    setStatus("JS loaded ✅ (use ← → / A D)");
    setHUD();
  }

  restartBtn.addEventListener("click", reset);
  playAgainBtn.addEventListener("click", reset);

  function hitCircleRect(cx, cy, r, rx, ry, rw, rh) {
    const closestX = clamp(cx, rx, rx + rw);
    const closestY = clamp(cy, ry, ry + rh);
    const dx = cx - closestX;
    const dy = cy - closestY;
    return dx * dx + dy * dy <= r * r;
  }

  // Draw helpers
  function drawBG() {
    // gradient-ish background
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "rgba(124,77,255,0.18)");
    g.addColorStop(1, "rgba(90,230,160,0.08)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // grid
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = "#fff";
    for (let x = 0; x < W; x += 48) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 48) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawPlayer() {
    const x = player.x - player.w / 2;
    const y = player.y;

    ctx.save();
    ctx.shadowColor = "rgba(124,77,255,0.55)";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(x, y, player.w, player.h);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(167,139,250,0.95)";
    ctx.fillRect(x, y, player.w, player.h);
    ctx.restore();
  }

  function drawFlags() {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    flags.forEach(f => {
      ctx.font = "28px system-ui";
      ctx.fillText(f.good ? "💚" : "🚩", f.x, f.y);
    });
    ctx.restore();
  }

  function drawMiniText() {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "700 14px system-ui";
    ctx.fillText(`Combo: ${combo}x`, 16, 20);
    ctx.fillText(`Difficulty: ${difficulty.toFixed(1)}`, 16, 40);
    ctx.restore();
  }

  // Main loop
  let last = performance.now();

  function loop(now) {
    const dt = Math.min(0.035, (now - last) / 1000);
    last = now;

    // shake effect
    ctx.save();
    if (shake > 0) {
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      shake = Math.max(0, shake - 1);
    }

    drawBG();

    if (running) {
      timeAlive += dt;
      difficulty = 1 + timeAlive / 15;

      // player move
      let move = 0;
      if (keys["arrowleft"] || keys["a"]) move -= 1;
      if (keys["arrowright"] || keys["d"]) move += 1;
      player.x += move * player.speed * dt;
      player.x = clamp(player.x, player.w / 2, W - player.w / 2);

      // combo decay
      if (combo > 0) {
        comboTimer -= dt;
        if (comboTimer <= 0) combo = 0;
      }

      // spawn flags
      const spawnEvery = Math.max(0.22, 0.70 - difficulty * 0.05);
      spawnAcc += dt;
      while (spawnAcc >= spawnEvery) {
        spawnAcc -= spawnEvery;
        spawnFlag();
      }

      // update flags
      const px = player.x - player.w / 2;
      const py = player.y;

      for (let i = flags.length - 1; i >= 0; i--) {
        const f = flags[i];
        f.phase += dt * f.wobble;
        f.x += Math.sin(f.phase) * 24 * dt;
        f.y += f.vy * dt;

        const hit = hitCircleRect(f.x, f.y, 18, px, py, player.w, player.h);
        if (hit) {
          flags.splice(i, 1);

          if (f.good) {
            combo = Math.min(10, combo + 1);
            comboTimer = 2.0;

            const gain = 10 + combo * 3;
            score += gain;
          } else {
            lives -= 1;
            combo = 0;
            comboTimer = 0;
            shake = 10;
          }

          setHUD();

          if (lives <= 0) endGame();
          continue;
        }

        if (f.y > H + 60) {
          // missing a green is a small penalty
          if (f.good) {
            combo = 0;
            comboTimer = 0;
            score = Math.max(0, score - 2);
          } else {
            // surviving red gives tiny points
            score += 1;
          }
          flags.splice(i, 1);
          setHUD();
        }
      }

      if (score > highScore) {
        highScore = score;
        localStorage.setItem(HIGH_KEY, String(highScore));
        highEl.textContent = String(highScore);
      }
    }

    drawPlayer();
    drawFlags();
    drawMiniText();

    ctx.restore();
    requestAnimationFrame(loop);
  }

  setHUD();
  requestAnimationFrame(loop);
})();
