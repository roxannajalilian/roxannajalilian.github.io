/* script.js
   Full front-end logic:
   - navigation
   - privacy/consent
   - age verification + lockout (persistent via localStorage)
   - minors quiz (10 q) with "Sometimes"
   - contradiction detection -> lockouts
   - adult analysis: text analyzer heuristics, mood detection, reality meter
   - voice input using Web Speech API if available
   - appeal flow (simulated)
*/

/* -----------------------
   Utilities & page switch
   ----------------------- */
function showPage(id){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(id);
  if(el) el.classList.add('active');
}

/* localStorage keys */
const LS = {
  contradictions: 'dd_contradictions',
  lockedUntil: 'dd_locked_until',
  permLock: 'dd_perm_lock',
  appealSent: 'dd_appeal_sent'
};

/* load local lock state */
function getContradictions(){ return Number(localStorage.getItem(LS.contradictions) || 0) }
function setContradictions(n){ localStorage.setItem(LS.contradictions, String(n)) }
function getLockedUntil(){ return Number(localStorage.getItem(LS.lockedUntil) || 0) }
function setLockedUntil(ts){ localStorage.setItem(LS.lockedUntil, String(ts)) }
function getPermLock(){ return localStorage.getItem(LS.permLock) === '1' }
function setPermLock(v){ localStorage.setItem(LS.permLock, v ? '1':'0') }
function setAppealSent(){ localStorage.setItem(LS.appealSent, '1') }
function getAppealSent(){ return localStorage.getItem(LS.appealSent) === '1' }

/* format remaining time */
function formatRemaining(ms){
  if(ms<=0) return '0s';
  const s = Math.floor(ms/1000)%60;
  const m = Math.floor(ms/60000)%60;
  return `${m}m ${s}s`;
}

/* check lock status and display message */
function checkLockAndNotify(){
  const lockedUntil = getLockedUntil();
  const perm = getPermLock();
  const now = Date.now();
  if(perm){
    document.getElementById('age-message').textContent = 'Account permanently locked. Submit an appeal.';
    return true;
  }
  if(lockedUntil && lockedUntil > now){
    document.getElementById('age-message').textContent = `Temporarily locked — try again in ${formatRemaining(lockedUntil - now)}.`;
    return true;
  }
  document.getElementById('age-message').textContent = '';
  return false;
}

/* -----------------------
   Privacy & initial set
   ----------------------- */
document.getElementById('accept-btn').addEventListener('click', () => {
  showPage('age-page');
});
document.getElementById('read-more-btn').addEventListener('click', () => {
  showPage('privacy-detail-page');
});
document.getElementById('agree-privacy-detail').addEventListener('click', () => {
  showPage('age-page');
});

/* -----------------------
   AGE verification + lockout
   ----------------------- */
document.getElementById('verify-age-btn').addEventListener('click', () => {
  const birthYear = Number(document.getElementById('birth-year').value);
  if(!birthYear || birthYear < 1900 || birthYear > 2100){
    document.getElementById('age-message').textContent = 'Enter a valid birth year.';
    return;
  }

  if(checkLockAndNotify()) return; // locked

  const age = new Date().getFullYear() - birthYear;
  if(age < 14){
    document.getElementById('age-message').textContent = 'Too young for this app (14+).';
    return;
  }
  // route by age
  if(age < 18){
    // minor
    showPage('minor-page');
    loadMinorQuiz();
    document.getElementById('welcome-title').textContent = 'Hello (Minor)';
    document.getElementById('adult-tools-btn').classList.add('hidden');
  } else {
    // adult
    showPage('home-page');
    document.getElementById('welcome-title').textContent = 'Welcome (Adult)';
    document.getElementById('adult-tools-btn').classList.remove('hidden');
  }
});

/* -----------------------
   Minor quiz questions & UI
   ----------------------- */
/* design questions with at least one contradictory pair: q1 & q6 contradict if both 'Yes' */
const minorQuestions = [
  {id:'q0', text:"They reply instantly when you message them.", options:["Yes","Sometimes","No"]},
  {id:'q1', text:"You overthink short replies like 'k' or 'ok'.", options:["Yes","Sometimes","No"]},
  {id:'q2', text:"You re-read messages multiple times.", options:["Yes","Sometimes","No"]},
  {id:'q3', text:"You imagine worst-case scenarios from small delays.", options:["Yes","Sometimes","No"]},
  {id:'q4', text:"You check their social media for clues.", options:["Yes","Sometimes","No"]},
  // contradictory with q0: "They ignore you for days" contradicts "They reply instantly"
  {id:'q5', text:"They sometimes ignore you for days.", options:["Yes","Sometimes","No"]},
  {id:'q6', text:"You feel anxious if a reply takes longer than an hour.", options:["Yes","Sometimes","No"]},
  {id:'q7', text:"You replay conversations in your head.", options:["Yes","Sometimes","No"]},
  {id:'q8', text:"Small punctuation makes you panic (e.g., missing emoji).", options:["Yes","Sometimes","No"]},
  {id:'q9', text:"You feel better once you get a clear reply.", options:["Yes","Sometimes","No"]}
];

function loadMinorQuiz(){
  const form = document.getElementById('minor-quiz-form');
  form.innerHTML = '';
  minorQuestions.forEach((q, idx) => {
    const wrap = document.createElement('div');
    wrap.className = 'quiz-question';
    const p = document.createElement('p'); p.textContent = `${idx+1}. ${q.text}`;
    wrap.appendChild(p);
    q.options.forEach(opt => {
      const label = document.createElement('label');
      label.className = 'quiz-option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = q.id;
      input.value = opt;
      label.appendChild(input);
      label.appendChild(document.createTextNode(' ' + opt));
      wrap.appendChild(label);
    });
    form.appendChild(wrap);
  });
}

/* contradiction detection logic for minors
   rule: if q0 === Yes (they reply instantly) AND q5 === Yes (they ignore for days) -> contradiction
   also if user selects extreme contradictory pattern: e.g. both q0 Yes and q5 Yes OR other impossible combos
*/
function detectMinorContradiction(formData){
  const a = formData.get('q0');
  const b = formData.get('q5');
  if(a === 'Yes' && b === 'Yes') return true;
  // additional heuristic: if answers include many direct contradictions like extremes
  return false;
}

/* scoring: Yes=2, Sometimes=1, No=0 -> normalize to percentage */
document.getElementById('minor-submit-btn').addEventListener('click', () => {
  // check lock
  if(checkLockAndNotify()) return;

  const form = new FormData(document.getElementById('minor-quiz-form'));
  if([...form.entries()].length < minorQuestions.length){
    alert('Please answer all questions.');
    return;
  }

  // contradiction detection
  if(detectMinorContradiction(form)){
    // increment contradictions and apply lockout
    let c = getContradictions();
    c++;
    setContradictions(c);
    if(c === 1){
      const until = Date.now() + 30*60*1000; // 30 minutes
      setLockedUntil(until);
      alert('We noticed inconsistent answers. You are locked for 30 minutes for safety.');
      showPage('age-page');
      return;
    } else {
      setPermLock(true);
      alert('Multiple inconsistencies detected. Account permanently locked. Submit an appeal.');
      showPage('appeal-page');
      return;
    }
  }

  // scoring
  let raw = 0;
  minorQuestions.forEach(q => {
    const v = form.get(q.id);
    if(v === 'Yes') raw += 2;
    else if(v === 'Sometimes') raw += 1;
  });
  const max = minorQuestions.length * 2;
  const pct = Math.round((raw / max) * 100);
  const resultEl = document.getElementById('minor-result');
  let msg = '';
  if(pct <= 30) msg = 'Low delulu risk — you are mostly grounded.';
  else if(pct <= 70) msg = 'Medium — some overthinking, be mindful.';
  else msg = 'High delulu risk — step back and breathe, talk to someone.';
  resultEl.textContent = `Score: ${pct}% — ${msg}`;
});

/* -----------------------
   Adult feature logic
   ----------------------- */

const analysisHistory = []; // in-memory session history; could be saved to localStorage if opt-in
let brutalMode = false;

/* basic text analyzer heuristics:
   - count hesitation words: maybe, idk, maybe, sorta -> add delulu points
   - short replies (ok, k) and ellipses -> add uncertainty points
   - presence of 'ghost' words -> red flag
   returns object {deluluScore (0-100), mood, redFlags}
*/
function analyzeTextSimple(text){
  const t = (text||'').toLowerCase();
  let score = 0;
  const hesitations = ['maybe','idk','i guess','kinda','sorta','hopefully'];
  hesitations.forEach(h => { if(t.includes(h)) score += 8; });
  // short reply patterns
  const shortReplies = [' k ',' ok ','ok ',' k\n','omg','...'];
  shortReplies.forEach(s => { if(t.includes(s)) score += 6; });
  // ghost words / ignore
  if(t.includes('left on read') || t.includes('ghost') || t.includes('ignored')) score += 20;
  // punctuation & emojis
  const exclam = (t.match(/!/g)||[]).length;
  const question = (t.match(/\?/g)||[]).length;
  score += Math.min(15, exclam*2 + question*3);

  // mood detection naive
  let mood = 'Neutral';
  if(/\b(lol|haha|😂|😍|😘)\b/.test(t)) mood = 'Playful / Flirty';
  else if(/\b(angry|ugh|bother|annoyed|frustrat)\b/.test(t)) mood = 'Annoyed';
  else if(question > 2) mood = 'Unsure / Questioning';

  // clamp
  score = Math.min(100, Math.max(0, Math.round(score)));

  // red flags
  const redFlags = [];
  if(t.includes('ignore') || t.includes('left on read')) redFlags.push('Repeated ignoring / passive behavior');
  if(t.includes('i don\'t want to talk')) redFlags.push('Direct rejection phrase');
  if(t.includes('ghost') || t.includes('ghosted')) redFlags.push('Ghosting language');

  return {deluluScore: score, mood, redFlags};
}

/* update UI results */
function updateAdultUI(result){
  document.getElementById('delulu-percentage')?.remove?.(); // safety
  const fb = document.getElementById('adult-feedback');
  fb.innerHTML = `<div>Delulu: <strong>${result.deluluScore}%</strong></div>
                  <div>Mood: <strong>${result.mood}</strong></div>
                  <div style="margin-top:8px">${result.redFlags.length ? '<strong>Red flags:</strong> ' + result.redFlags.join('; ') : 'No big red flags detected.'}</div>`;
  // meter
  const fill = document.getElementById('reality-fill');
  if(fill) fill.style.width = `${Math.max(4, 100 - result.deluluScore)}%`;

  // brutal mode message
  let brutalText = '';
  if(brutalMode){
    if(result.deluluScore >= 70) brutalText = "BruTal: Sis, you're imagining a whole Netflix series. Unplug and breathe.";
    else if(result.deluluScore >= 40) brutalText = "Brutal: Chill a bit — this looks like a 50/50 situation. Ask, don't stew.";
    else brutalText = "Brutal: Calm. You're fine. Go live your life.";
  }
  const redFlagOutput = document.getElementById('red-flag-output');
  const moodOutput = document.getElementById('mood-output');
  redFlagOutput.textContent = result.redFlags.join('; ') || 'No major red flags';
  moodOutput.textContent = `Mood hint: ${result.mood}`;
  if(brutalText) fb.innerHTML += `<div style="margin-top:8px;color:#ffd1e8">${brutalText}</div>`;

  // save session history
  analysisHistory.push({timestamp:Date.now(), inputPreview: (document.getElementById('chat-input')?.value||'').slice(0,120), result});
}

/* analyze chat button */
document.getElementById('analyze-btn').addEventListener('click', () => {
  const text = document.getElementById('chat-input').value || '';
  if(!text.trim()){ alert('Paste some chat text to analyze.'); return; }
  const r = analyzeTextSimple(text);
  updateAdultUI(r);
});

/* clear chat */
document.getElementById('clear-chat-btn').addEventListener('click', () => {
  document.getElementById('chat-input').value = '';
  document.getElementById('adult-feedback').textContent = '';
});

/* brutal toggle */
document.getElementById('brutal-toggle-btn').addEventListener('click', () => {
  brutalMode = !brutalMode;
  document.getElementById('brutal-toggle-btn').textContent = brutalMode ? 'Brutal ON' : 'Brutal Mode';
});

/* reality meter initial fill */
(function initMeter(){
  const fill = document.getElementById('reality-fill');
  if(fill) fill.style.width = '60%';
})();

/* download report (JSON) */
document.getElementById('download-report-btn').addEventListener('click', () => {
  const payload = {history: analysisHistory, timestamp: Date.now()};
  const blob = new Blob([JSON.stringify(payload, null, 2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'delulu_report.json';
  a.click();
  URL.revokeObjectURL(url);
});

/* -----------------------
   Voice input (Web Speech API)
   ----------------------- */
let recognition, recognizing = false;
const voiceTranscriptEl = document.getElementById('voice-transcript');
if('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRec();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onstart = () => { recognizing = true; document.getElementById('voice-start-btn').textContent = 'Recording...'; document.getElementById('voice-stop-btn').disabled = false; };
  recognition.onend = () => { recognizing = false; document.getElementById('voice-start-btn').textContent = 'Start Recording'; document.getElementById('voice-stop-btn').disabled = true; };
  recognition.onerror = (e) => { console.error('Speech error', e); recognizing=false; };

  recognition.onresult = (ev) => {
    const transcript = Array.from(ev.results).map(r => r[0].transcript).join('');
    voiceTranscriptEl.textContent = transcript;
    // auto analyze when we have a full result
    if(ev.results[0].isFinal){
      document.getElementById('chat-input').value = transcript;
      const res = analyzeTextSimple(transcript);
      updateAdultUI(res);
    }
  };
} else {
  document.getElementById('voice-start-btn').disabled = true;
  document.getElementById('voice-stop-btn').disabled = true;
  voiceTranscriptEl.textContent = 'Voice not supported in this browser.';
}

document.getElementById('voice-start-btn').addEventListener('click', () => {
  if(recognition && !recognizing) recognition.start();
});
document.getElementById('voice-stop-btn').addEventListener('click', () => {
  if(recognition && recognizing) recognition.stop();
});

/* -----------------------
   Appeal flow (simulated)
   ----------------------- */
document.getElementById('send-appeal-btn').addEventListener('click', () => {
  const text = document.getElementById('appeal-text').value || '';
  if(!text.trim()){ document.getElementById('appeal-status').textContent = 'Please write a short appeal.'; return; }
  setAppealSent();
  document.getElementById('appeal-status').textContent = 'Appeal submitted. Staff will review and respond via the email you provided (simulated).';
});

/* -----------------------
   Home buttons & navigation
   ----------------------- */
document.getElementById('start-quiz-btn').addEventListener('click', () => showPage('minor-page'));
document.getElementById('adult-tools-btn').addEventListener('click', () => showPage('adult-page'));
document.getElementById('appeal-btn').addEventListener('click', () => showPage('appeal-page'));

/* restart (clear session state except permanent lock) */
function restart(){
  // only clear transient stuff
  localStorage.removeItem('dd_contradictions');
  localStorage.removeItem('dd_locked_until');
  // leave perm lock untouched
  showPage('privacy-page');
}

/* on load: check locks, and apply UI defaults */
(function init(){
  // if permanently locked, go to appeal
  if(getPermLock()){
    showPage('appeal-page');
    document.getElementById('appeal-status').textContent = 'Account is permanently locked. Submit an appeal.';
  } else {
    showPage('privacy-page');
  }
})();
