<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Delulu Detector - Quiz</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>

<nav class="nav">
  <div class="brand">
    <div class="logo">DD</div>
    <div class="brand-text">
      <div class="title">Delulu Detector</div>
      <div class="sub">Overthinking Questionnaire</div>
    </div>
  </div>

  <div class="nav-actions">
    <a class="navlink" href="menu.html">Menu</a>
    <a class="navlink active" href="quiz.html">Quiz</a>
    <a class="navlink planlink" href="plan.html">
      <span class="plan-ico" aria-hidden="true">◎</span>
      <span>Plan</span>
      <span id="planBadge" class="badge">–</span>
    </a>
  </div>
</nav>

<main class="container">
  <!-- QUESTION CARD -->
  <section id="quizCard" class="card">
    <div class="quiz-top">
      <div>
        <h1 id="quizTitle">Overthinking Questionnaire</h1>
        <div class="muted" id="progressText">Question 1 of 10</div>
      </div>
      <button id="returnBtnTop" class="btn btn-ghost">Return</button>
    </div>

    <p id="questionText" class="question">Loading...</p>

    <div id="options" class="options"></div>

    <div class="quiz-bottom">
      <button id="backBtn" class="btn btn-secondary">Back</button>
      <button id="nextBtn" class="btn btn-primary">Continue</button>
    </div>

    <p id="quizMsg" class="msg"></p>
  </section>

  <!-- RESULTS CARD -->
  <section id="resultsCard" class="card" style="display:none;">
    <h1>Your results</h1>

    <div class="score-wrap">
      <div class="score-circle">
        <div class="score-num" id="scorePercent">0%</div>
        <div class="score-sub muted">Overthinking level</div>
      </div>
    </div>

    <p id="scoreLabel" class="big"></p>
    <p id="scoreAdvice" class="muted"></p>

    <div class="grid">
      <a class="btn btn-primary" href="plan.html">Go to My Plan</a>
      <button id="restartBtn" class="btn btn-secondary">Restart Quiz</button>
      <a class="btn btn-ghost" href="menu.html">Return to Menu</a>
    </div>
  </section>
</main>

<script src="app.js"></script>
</body>
</html>
