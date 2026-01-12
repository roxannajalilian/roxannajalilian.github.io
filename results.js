<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Results • Delulu Detector</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
<nav>
  <div class="brand">
    <div class="logo">DD</div>
    <div>
      <div class="title">Results</div>
      <div class="sub">Score + meaning + advice</div>
    </div>
  </div>
  <div class="nav-right">
    <a class="navlink" href="menu.html">Menu</a>
    <a class="navlink" href="quiz.html">Quiz</a>
    <a class="navlink active" href="result.html">Results</a>
    <a class="navlink" href="plan.html">Plan</a>
  </div>
</nav>

<div class="container">
  <div class="card center">
    <h2>Your score</h2>
    <div id="percent" class="big-number">—%</div>
    <div id="tier" class="pill">—</div>

    <hr style="border:none;height:1px;background:rgba(255,255,255,.14);margin:1rem 0;">

    <p id="bestieText" class="friend"></p>

    <div class="notice">
      <b>Why might you feel this way?</b>
      <div id="whyChips" class="chips" style="margin-top:.6rem;"></div>
      <div class="muted small">Pick 1–2 and it’ll adjust your advice.</div>
    </div>

    <div class="row" style="margin-top:1rem;">
      <button class="primary" onclick="location.href='plan.html'">Action Plan</button>
      <button class="secondary" onclick="location.href='quiz.html'">Change answers</button>
      <button class="secondary" id="saveBtn" type="button">Save</button>
    </div>
  </div>
</div>

<script src="result.js"></script>
</body>
</html>
