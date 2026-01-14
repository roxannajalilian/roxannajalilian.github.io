requireAdult("game.html");

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const restartBtn = document.getElementById("restartGame");
const overlay = document.getElementById("loseOverlay");
const overlayRestart = document.getElementById("overlayRestart");

let keys = {};
let running = true;

let player, flags, t, speed, score;

function reset() {
  player = { x: canvas.width / 2, y: canvas.height - 40, w: 44, h: 14 };
  flags = [];
  t = 0;
  speed = 2.4;
  score = 0;
  running = true;
  overlay.style.display = "none";
}

function spawnFlag() {
  const w = 18 + Math.random() * 26;
  flags.push({
    x: Math.random() * (canvas.width - w),
    y: -30,
    w,
    h: 16 + Math.random() * 24,
    vy: speed + Math.random() * 1.8
  });
}

function rectHit(a,b){
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function lose() {
  running = false;
  overlay.style.display = "block";
}

function step() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // background glow
  const g = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  g.addColorStop(0, "rgba(124,77,255,.10)");
  g.addColorStop(1, "rgba(60,200,255,.10)");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // movement
  const left = keys["ArrowLeft"] || keys["a"];
  const right = keys["ArrowRight"] || keys["d"];
  if (running) {
    if (left) player.x -= 6.2;
    if (right) player.x += 6.2;
  }
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

  // spawn
  if (running) {
    t++;
    if (t % 28 === 0) spawnFlag();
    if (t % 420 === 0) speed += 0.35;
  }

  // flags update
  for (let i = flags.length - 1; i >= 0; i--) {
    const f = flags[i];
    if (running) f.y += f.vy;

    // draw flags (red)
    ctx.fillStyle = "rgba(255,60,120,.85)";
    ctx.fillRect(f.x, f.y, f.w, f.h);

    if (rectHit(player, f) && running) lose();

    if (f.y > canvas.height + 40) {
      flags.splice(i, 1);
      if (running) score++;
    }
  }

  // player
  ctx.fillStyle = "rgba(90,230,160,.90)";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // HUD
  ctx.fillStyle = "rgba(255,255,255,.85)";
  ctx.font = "16px system-ui";
  ctx.fillText(`Score: ${score}`, 16, 28);

  requestAnimationFrame(step);
}

window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

restartBtn.addEventListener("click", reset);
overlayRestart.addEventListener("click", reset);

reset();
step();
