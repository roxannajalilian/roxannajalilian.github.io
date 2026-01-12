<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Calculating…</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

<nav>
  <div class="nav-left brand">
    <div class="logo">DD</div>
    <div class="brand-text">
      <div class="title">Results</div>
      <div class="sub">Calculating your score…</div>
    </div>
  </div>
  <div class="nav-right">
    <a class="navlink" href="menu.html">Menu</a>
    <a class="navlink" href="quiz.html">Quiz</a>
  </div>
</nav>

<div class="container">
  <div class="card center">
    <h2>One sec bestie…</h2>
    <p class="muted">Putting your answers together.</p>

    <div class="loader-wrap">
      <div class="ring"></div>
      <div class="pill" id="txt">Checking patterns…</div>
    </div>

    <div class="muted small">If it gets stuck, your results probably didn’t save.</div>
  </div>
</div>

<script>
  const KEY="delulu_data_v1";
  const steps=["Checking patterns…","Doing the math…","Writing your advice…","Almost done…"];
  let i=0;
  const txt=document.getElementById("txt");
  const tick=setInterval(()=>{ i++; if(i<steps.length) txt.textContent=steps[i]; }, 520);

  setTimeout(()=>{
    clearInterval(tick);
    let d={};
    try{ d=JSON.parse(localStorage.getItem(KEY)||"{}"); }catch(e){ d={}; }

    // If quizResult is missing, send back to quiz
    if(!d.quizResult){ location.href="quiz.html"; return; }

    location.href="result.html";
  }, 2200);
</script>

</body>
</html>
