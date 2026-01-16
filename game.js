requireAdult("game.html");

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highEl = document.getElementById("high");
const livesEl = document.getElementById("lives");
const restartBtn = document.getElementById("restart");

const HIGH_KEY = "dd_game_highscore";

let score = 0;
let lives = 3;
let high = Number(localStorage.getItem(HIGH_KEY) || 0);

highEl.textContent = high;

const player = { x: 420, y: 460, w: 60, h: 40, speed: 7 };
const flags = [];

let keys = {};

window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

function spawnFlag(){
  flags.push({
    x: Math.random() * (canvas.width - 40),
    y: -40,
    size: 40,
    speed: 3 + Math.random() * 3,
    type: Math.random() < 0.6 ? "red" : "green"
  });
}

function reset(){
  score = 0;
  lives = 3;
  flags.length = 0;
  scoreEl.textContent = "0";
  livesEl.textContent = "3";
}

restartBtn.onclick = reset;

function update(){
  if(keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
  if(keys["ArrowRight"] || keys["d"]) player.x += player.speed;

  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

  if(Math.random() < 0.03) spawnFlag();

  for(let i = flags.length - 1; i >= 0; i--){
    const f = flags[i];
    f.y += f.speed;

    const hit =
      f.x < player.x + player.w &&
      f.x + f.size > player.x &&
      f.y < player.y + player.h &&
      f.y + f.size > player.y;

    if(hit){
      if(f.type === "red"){
        lives--;
        livesEl.textContent = lives;
      } else {
        score += 10;
        scoreEl.textContent = score;
      }
      flags.splice(i,1);
      continue;
    }

    if(f.y > canvas.height){
      flags.splice(i,1);
    }
  }

  if(lives <= 0){
    if(score > high){
      high = score;
      localStorage.setItem(HIGH_KEY, high);
      highEl.textContent = high;
    }
    alert("Game over 😭");
    reset();
  }
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // player
  ctx.fillStyle = "rgba(255,255,255,.85)";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // flags
  for(const f of flags){
    ctx.fillStyle = f.type === "red"
      ? "rgba(255,80,120,.9)"
      : "rgba(90,230,160,.9)";
    ctx.fillRect(f.x, f.y, f.size, f.size);
  }
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
