<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Analyze • Delulu Detector</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
<nav>
  <div class="brand">
    <div class="logo">DD</div>
    <div><div class="title">Analyze</div><div class="sub">Paste texts → vibe check</div></div>
  </div>
  <div class="nav-right">
    <a class="navlink" href="menu.html">Menu</a>
    <a class="navlink" href="quiz.html">Quiz</a>
    <a class="navlink active" href="scan.html">Analyze</a>
    <a class="navlink" href="result.html">Results</a>
  </div>
</nav>

<div class="container">
  <div class="card center">
    <h2>Message Analyzer</h2>
    <p class="muted small">Paste a chunk of convo. It flags common overthinking triggers.</p>

    <div class="field">
      <label class="muted">Paste messages</label>
      <textarea id="textInput" rows="8" placeholder="Paste the convo here..."></textarea>
    </div>

    <div class="row">
      <button class="primary" type="button" id="analyzeBtn">Analyze</button>
      <button class="secondary" type="button" id="clearBtn">Clear</button>
      <button class="secondary" type="button" onclick="location.href='menu.html'">Back</button>
    </div>

    <div id="out" class="notice" style="display:none;"></div>
  </div>
</div>

<script src="scan.js"></script>
</body>
</html>
