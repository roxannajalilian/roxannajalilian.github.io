requireAdult("game.html");

// PROOF JS IS RUNNING:
const jsPing = document.getElementById("jsPing");
if (jsPing) jsPing.textContent = "JS: running ✅";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const loading = document.getElementById("gameLoading");
setTimeout(() => { if (loading) loading.style.display = "none"; }, 250);

const scoreEl = document.getElementById("score");
const highEl = document.getElementById("high");
const livesEl = document.getElementById("lives");
const restartBtn = document.getElementById("restart");

const HIGH_KEY = "dd_game_highscore";

let score = 0;
let lives = 3;
let high = Number(localStorage.getItem(HIGH_KEY) || 0);

highEl.textContent = high;

const player = { x: 420, y: 460, w: 70, h: 24, speed: 8 };
const items = [];
let keys = {};
let gameOver = false;

window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

function spawn(){
  items.push({
    x: Math.random() * (canvas.width - 44),
    y: -44,
    s: 44,
    v: 3.2 + Math.random() * 3.2,
    type: Math.random() < 0.65 ? "red" : "green"
  });
}

function reset(){
  score = 0;
  lives = 3;
  gameOver = false;
  items.length = 0;
  scoreEl.textContent = "0";
  livesEl.textContent = "3";
}
restartBtn.addEventListener("click", reset);

function rectHit(a, b){
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function update(){
  if (gameOver) return;

  // movement
  if (keys["arrowleft"] || keys["a"]) player.x -= player.speed;
  if (keys["arrowright"] || keys["d"]) player.x += player.speed;
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

  // spawn
  if (Math.random() < 0.035) spawn();

  // move items + collision
  for (let i = items.length - 1; i >= 0; i--){
    const it = items[i];
    it.y += it.v;

    const itRect = { x: it.x, y: it.y, w: it.s, h: it.s };
    const plRect = { x: player.x, y: player.y, w: player.w, h: player.h };

    if (rectHit(itRect, plRect)){
      if (it.type === "red"){
        lives--;
        livesEl.textContent = String(lives);
      } else {
        score += 10;
        scoreEl.textContent = String(score);
      }
      items.splice(i, 1);
      continue;
    }

    if (it.y > canvas.height + 80){
      items.splice(i, 1);
    }
  }

  if (lives <= 0){
    gameOver = true;
    if (score > high){
      high = score;
      localStorage.setItem(HIGH_KEY, String(high));
      highEl.textContent = String(high);
    }
    setTimeout(() => {
      alert(`Game over 😭\nScore: ${score}\nHigh score: ${high}`);
      reset();
    }, 60);
  }
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // player
  ctx.fillStyle = "rgba(255,255,255,.88)";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // items
  for (const it of items){
    if (it.type === "red"){
      ctx.fillStyle = "rgba(255,80,120,.92)";
      ctx.fillRect(it.x, it.y, it.s, it.s);
      // little flag pole
      ctx.fillStyle = "rgba(0,0,0,.25)";
      ctx.fillRect(it.x + 6, it.y + 6, 6, it.s - 12);
    } else {
      ctx.fillStyle = "rgba(90,230,160,.92)";
      ctx.fillRect(it.x, it.y, it.s, it.s);
      // check mark vibe
      ctx.fillStyle = "rgba(0,0,0,.25)";
      ctx.fillRect(it.x + 10, it.y + 22, 22, 6);
    }
  }

  // floor line
  ctx.strokeStyle = "rgba(255,255,255,.18)";
  ctx.beginPath();
  ctx.moveTo(0, player.y + player.h + 12);
  ctx.lineTo(canvas.width, player.y + player.h + 12);
  ctx.stroke();
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
