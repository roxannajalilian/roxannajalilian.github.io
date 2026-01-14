<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Delulu Detector • Start</title>
  <link rel="stylesheet" href="./style.css" />
</head>

<body>
  <div class="cursorGlow"></div>

  <nav>
    <div class="brand">
      <div class="logo">DD</div>
      <div>
        <div class="title">Delulu Detector</div>
        <div class="sub">Age verification</div>
      </div>
    </div>

    <div class="nav-actions">
      <a class="pill" href="policy.html">Policy</a>
      <button class="pill" id="readBtn" type="button">🔊 Read aloud</button>
    </div>
  </nav>

  <main class="container">
    <div class="card center" style="max-width: 900px; margin: 0 auto;">
      <h1 style="margin: 6px 0 10px;">Start</h1>
      <p class="muted" style="margin-top:0;">
        Enter your age to continue. You must be <b>18+</b>.
      </p>

      <div style="max-width: 460px; margin: 18px auto 0; text-align:left;">
        <label class="muted tiny" for="age">Your age (18+)</label>
        <input id="age" class="input" type="number" inputmode="numeric" placeholder="e.g., 18" />

        <label class="checkRow" style="margin-top:14px;">
          <input id="agree" type="checkbox" />
          <span>I agree to the <a href="policy.html">Terms & Privacy</a></span>
        </label>

        <p class="tiny muted" id="msg" style="margin:10px 0 0;"></p>

        <div class="row" style="margin-top:16px; justify-content:center;">
          <button class="btn primary" id="continueBtn" type="button">Continue</button>
          <button class="btn ghost" id="resetBtn" type="button">Reset</button>
        </div>
      </div>
    </div>

    <p class="tiny muted centerText" style="margin-top:14px;">
      Everything stays in your browser — nothing uploads.
    </p>
  </main>

  <script src="./glow.js"></script>
  <script type="module" src="./index.js"></script>
</body>
</html>
