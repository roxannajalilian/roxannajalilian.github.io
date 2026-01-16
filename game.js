<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Delulu Detector • Game</title>
  <link rel="stylesheet" href="style.css?v=9999" />
  <script src="shared.js?v=9999"></script>
  <script>requireAdult("game.html");</script>

  <style>
    #wrap{
      height:520px;
      border-radius:18px;
      border:1px solid rgba(255,255,255,.14);
      background: rgba(0,0,0,.18);
      overflow:hidden;
    }
    canvas{ width:100%; height:520px; display:block; }
  </style>
</head>
<body>

<nav>
  <div class="brand">
    <div class="logo">DD</div>
    <div>
      <div class="title">Delulu Detector</div>
      <div class="sub">Game</div>
    </div>
  </div>
  <div class="nav-actions">
    <a class="btn ghost" href="menu.html">Menu</a>
    <a class="btn ghost" href="quiz.html">Quiz</a>
    <a class="btn ghost" href="plan.html">Plan</a>
    <a class="btn ghost" href="scan.html">Analysis</a>
  </div>
</nav>

<div class="container">
  <div class="card">
    <div class="row" style="justify-content:space-between;">
      <div class="row">
        <span class="badge">Score: <b id="score">0</b></span>
        <span class="badge">High: <b id="high">0</b></span>
        <span class="badge">Lives: <b id="lives">3</b></span>
      </div>
      <button class="btn ghost" id="restart" type="button">Restart</button>
    </div>

    <p class="muted" style="margin:10px 0;">If you can see text inside the box, your canvas is working.</p>

    <div id="wrap">
      <canvas id="game" width="900" height="520"></canvas>
    </div>
  </div>
</div>

<script>
  // This draws even if game.js is broken.
  const c = document.getElementById("game");
  const ctx = c.getContext("2d");

  ctx.fillStyle = "rgba(124,77,255,.25)";
  ctx.fillRect(0,0,c.width,c.height);

  ctx.fillStyle = "rgba(255,255,255,.92)";
  ctx.font = "900 48px system-ui";
  ctx.fillText("CANVAS OK ✅", 260, 260);

  ctx.font = "700 18px system-ui";
  ctx.fillStyle = "rgba(255,255,255,.75)";
  ctx.fillText("If you see this, your problem is game.js NOT loading.", 220, 310);
</script>

</body>
</html>
