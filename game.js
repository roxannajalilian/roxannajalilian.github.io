const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const scoreBadge = document.getElementById("scoreBadge");
const overlay = document.getElementById("loseOverlay");
const restartBtn = document.getElementById("restartBtn");

let running = true;

const player = {
  x: canvas.width / 2,
  y: canvas.height - 40,
  w: 46,
  h: 14,
  speed: 10
};

let score = 0;
let ticks = 0;
let hazards = [];

function resetGame(){
  running = true;
  score = 0;
  ticks = 0;
  hazards = [];
  player.x = canvas.width / 2;
  overlay.classList.add("hidden");
  scoreBadge.textContent = `Score: ${score}`;
}

function showLose(){
  running = false;
  overlay.classList.remove("hidden");
}

restartBtn.addEventListener("click", () => {
  resetGame();
});

const keys = { left:false, right:false };

window.addEventListener("keydown", (e) => {
  if(e.key === "ArrowLeft") keys.left = true;
  if(e.key === "ArrowRight") keys.right = true;
});
window.addEventListener("keyup", (e) => {
  if(e.key === "ArrowLeft") keys.left = false;
  if(e.key === "ArrowRight") keys.right = false;
});

function spawnHazard(){
  const size = 18 + Math.random() * 18;
  hazards.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    s: size,
    v: 3 + Math.random() * 3
  });
}

function rectHit(a,b){
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function update(){
  if(!running) return;

  ticks++;

  // movement
  if(keys.left) player.x -= player.speed;
  if(keys.right) player.x += player.speed;
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

  // spawn hazards
  if(ticks % 18 === 0) spawnHazard();

  // move hazards
  for(const h of hazards){
    h.y += h.v;
  }

  // remove off screen + score
  hazards = hazards.filter(h => {
    if(h.y > canvas.height + h.s){
      score++;
      scoreBadge.textContent = `Score: ${score}`;
      return false;
    }
    return true;
  });

  // collision
  const pRect = { x: player.x, y: player.y, w: player.w, h: player.h };
  for(const h of hazards){
    const hRect = { x: h.x, y: h.y, w: h.s, h: h.s };
    if(rectHit(pRect, hRect)){
      showLose();
      break;
    }
  }
}

function draw(){
  // background
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // player
  ctx.fillStyle = "rgba(255,255,255,.9)";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // hazards (red flags)
  ctx.fillStyle = "rgba(255,80,110,.85)";
  for(const h of hazards){
    ctx.beginPath();
    ctx.roundRect(h.x, h.y, h.s, h.s, 6);
    ctx.fill();
  }

  // text
  ctx.fillStyle = "rgba(255,255,255,.65)";
  ctx.font = "14px system-ui";
  ctx.fillText("Avoid the red flags", 16, 24);
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

// Polyfill for roundRect if needed
if(!CanvasRenderingContext2D.prototype.roundRect){
  CanvasRenderingContext2D.prototype.roundRect = function(x,y,w,h,r){
    r = Math.min(r, w/2, h/2);
    this.beginPath();
    this.moveTo(x+r,y);
    this.arcTo(x+w,y, x+w,y+h, r);
    this.arcTo(x+w,y+h, x,y+h, r);
    this.arcTo(x,y+h, x,y, r);
    this.arcTo(x,y, x+w,y, r);
    this.closePath();
    return this;
  };
}

resetGame();
loop();
