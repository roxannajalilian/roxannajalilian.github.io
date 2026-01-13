<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Delulu Detector • Analyzer</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
<nav>
  <div class="nav-inner">
    <div class="brand">
      <div class="logo">DD</div>
      <div>
        <div class="title">Text Analyzer</div>
        <div class="sub">Paste convo + optional screenshot</div>
      </div>
    </div>
    <div class="nav-right">
      <a class="navlink" href="menu.html">Menu</a>
      <a class="navlink" href="plan.html">Plan</a>
    </div>
  </div>
</nav>

<div class="container">
  <div class="card">
    <div class="grid">
      <div class="col-6">
        <h2>Paste the messages</h2>
        <p class="muted" style="margin-top:6px;">
          Choose format + whose messages you want to scan. (Auto works for most pasted chats.)
        </p>

        <!-- NEW: FORMAT + WHO FILTERS -->
        <div class="grid" style="margin:12px 0;">
          <div class="col-6">
            <div class="field">
              <label class="muted">Input format</label>
              <select id="formatMode">
                <option value="auto" selected>Auto-detect</option>
                <option value="texts">Texts (one-sided)</option>
                <option value="chat">Chat (two-sided)</option>
              </select>
            </div>
          </div>
          <div class="col-6">
            <div class="field">
              <label class="muted">Scan whose messages?</label>
              <select id="whoMode">
                <option value="both" selected>Both</option>
                <option value="me">Only me</option>
                <option value="them">Only them</option>
              </select>
            </div>
          </div>

          <div class="col-12">
            <div class="field">
              <label class="muted">Your name (optional, helps auto-detect)</label>
              <input id="myName" type="text" placeholder="e.g., Roxanna" />
            </div>
          </div>
        </div>

        <textarea id="textInput" placeholder="Paste conversation text here…"></textarea>

        <div class="row" style="justify-content:flex-start; margin-top:10px;">
          <input id="imgInput" type="file" accept="image/*" />
        </div>

        <div class="row" style="justify-content:flex-start; margin-top:12px;">
          <button class="primary" id="analyzeBtn">Analyze</button>
          <button class="secondary" onclick="location.href='menu.html'">Back</button>
          <button class="secondary" id="clearBtn">Clear</button>
        </div>

        <div id="scanWarn" class="notice" style="display:none;"></div>
      </div>

      <div class="col-6">
        <h2>Result</h2>

        <div class="circleWrap">
          <div class="circle">
            <div>
              <div class="big" id="scanPct">--%</div>
              <div class="label" id="scanLabel">No scan yet</div>
            </div>
          </div>
        </div>

        <div id="signalsBox" class="muted" style="margin-top:12px;"></div>
        <hr/>
        <div id="scanAdvice"></div>
      </div>
    </div>
  </div>
</div>

<script src="storage.js"></script>
<script src="scan.js"></script>
</body>
</html>
