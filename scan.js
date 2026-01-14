(() => {
  const APP_KEY = "dd_app_v1";
  function getAppData(){ try { return JSON.parse(localStorage.getItem(APP_KEY) || "{}"); } catch { return {}; } }

  // 18+ gate
  const data = getAppData();
  if (!data.age || Number(data.age) < 18) {
    window.location.replace("start.html");
    return;
  }

  const textInput = document.getElementById("textInput");
  const imgInput = document.getElementById("imgInput");
  const imgWrap = document.getElementById("imgWrap");
  const imgPreview = document.getElementById("imgPreview");
  const removeImgBtn = document.getElementById("removeImgBtn");
  const imgNote = document.getElementById("imgNote");

  const analyzeBtn = document.getElementById("analyzeBtn");
  const clearBtn = document.getElementById("clearBtn");

  const bar = document.getElementById("bar");
  const scoreText = document.getElementById("scoreText");
  const summaryText = document.getElementById("summaryText");
  const notesEl = document.getElementById("notes");

  const usedPhotoBox = document.getElementById("usedPhotoBox");
  const photoNoteOut = document.getElementById("photoNoteOut");
  const photoOut = document.getElementById("photoOut");

  let photoDataUrl = ""; // stores image preview for output

  function setNotes(items){
    notesEl.innerHTML = items.map(x => `<li>${x}</li>`).join("");
  }

  function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }

  // Handle image upload preview
  imgInput.addEventListener("change", () => {
    const file = imgInput.files && imgInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      photoDataUrl = String(reader.result || "");
      imgPreview.src = photoDataUrl;
      imgWrap.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  removeImgBtn.addEventListener("click", () => {
    imgInput.value = "";
    imgWrap.style.display = "none";
    imgPreview.src = "";
    imgNote.value = "";
    photoDataUrl = "";
  });

  function analyzeText(raw, photoNoteText){
    const t = (raw || "").trim();
    const photoNoteClean = (photoNoteText || "").trim();

    if (!t && !photoDataUrl) {
      return { score: 0, summary: "Paste text or upload a photo first.", notes: ["Nothing to analyze yet."] };
    }

    const lower = t.toLowerCase();
    const lines = t ? t.split(/\n+/).map(s => s.trim()).filter(Boolean) : [];

    const signals = [];

    // signals lists
    const shutdown = ["k","kk","ok","okay","sure","fine","idk","nvm","whatever","seen","left on read","lol","nah","mhm","i guess"];
    const hotWords = ["leave me alone","stop texting","i’m done","blocked","unfollow","dont talk to me","forget it"];

    // counts
    const shortReplies = lines.filter(l => l.length <= 3).length;
    const seenHits = (lower.match(/\bseen\b/g) || []).length + (lower.match(/left on read/g) || []).length;
    const punctHits = (lower.match(/\.\.\./g) || []).length + (lower.match(/\?\?\?/g) || []).length + (lower.match(/!!+/g) || []).length;

    let shutdownHits = 0;
    shutdown.forEach(w => { if (lower.includes(w)) shutdownHits++; });

    let hotHits = 0;
    hotWords.forEach(w => { if (lower.includes(w)) hotHits++; });

    // base score
    let score = 0;
    score += shortReplies * 6;
    score += shutdownHits * 10;
    score += seenHits * 14;
    score += punctHits * 3;
    score += hotHits * 16;

    if (lines.length >= 18) score += 10;
    if (lines.length >= 30) score += 10;

    // photo note adds “realism” and small score influence
    if (photoDataUrl) {
      signals.push("Screenshot uploaded (used for context).");
      score += 10;
      if (photoNoteClean) {
        signals.push(`Photo note: “${photoNoteClean}”.`);
        score += 8;
      } else {
        signals.push("No photo note added (optional).");
      }
    }

    score = clamp(Math.round(score), 0, 100);

    // notes from text
    if (t) {
      if (shortReplies > 0) signals.push(`Short replies detected (${shortReplies}).`);
      if (shutdownHits > 0) signals.push(`Dry/shutdown wording detected.`);
      if (seenHits > 0) signals.push(`“Seen/left on read” detected.`);
      if (punctHits > 0) signals.push(`Heavy punctuation detected (can trigger overthinking).`);
      if (hotHits > 0) signals.push(`Conflict / shutdown phrases detected.`);
      if (signals.length === 0) signals.push("No obvious patterns detected from this text alone.");
    } else {
      signals.push("No text pasted — analysis based on screenshot context + note only.");
    }

    // summary
    const summary =
      score >= 80 ? "High delulu risk 🚨 — protect your peace, don’t chase, get clarity once." :
      score >= 60 ? "Moderate-high — mixed signals/dry energy present. Keep boundaries." :
      score >= 40 ? "Medium — a few triggers. Focus on patterns, not one message." :
      score >= 20 ? "Low — not many signals. Stay calm + direct." :
                    "Very low — looks normal.";

    return { score, summary, notes: signals };
  }

  function renderResult(result){
    bar.style.width = `${result.score}%`;
    scoreText.textContent = `${result.score}%`;
    summaryText.textContent = result.summary;
    setNotes(result.notes);

    if (photoDataUrl) {
      usedPhotoBox.style.display = "block";
      photoOut.src = photoDataUrl;
      photoNoteOut.textContent = imgNote.value.trim()
        ? `Note: ${imgNote.value.trim()}`
        : "No note was added for the photo.";
    } else {
      usedPhotoBox.style.display = "none";
      photoOut.src = "";
      photoNoteOut.textContent = "";
    }
  }

  analyzeBtn.addEventListener("click", () => {
    const result = analyzeText(textInput.value, imgNote.value);
    renderResult(result);
  });

  clearBtn.addEventListener("click", () => {
    textInput.value = "";
    bar.style.width = "0%";
    scoreText.textContent = "—%";
    summaryText.textContent = "Run an analysis to see results.";
    setNotes(["No scan yet."]);

    // clear photo
    imgInput.value = "";
    imgWrap.style.display = "none";
    imgPreview.src = "";
    imgNote.value = "";
    photoDataUrl = "";
    usedPhotoBox.style.display = "none";
    photoOut.src = "";
    photoNoteOut.textContent = "";
  });
})();
