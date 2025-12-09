/* script.js
   Delulu Detector — front-end prototype (iOS style)
   - All navigation & UI wiring
   - Age verification + lockouts (localStorage)
   - Minor quiz (10 q) with contradiction detection
   - Adult analysis (text + voice heuristics)
   - Brutal mode, reality meter, red-flag translator
   - Appeal flow + download report
*/

/* ---------- Helpers & Page Switch ---------- */
function showPage(id){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(id);
  if(el) el.classList.add('active');
}

/* ---------- Local Storage Keys ---------- */
const LS_KEYS = {
  contradictions: 'dd_contradictions',
  lockedUntil: 'dd_locked_until',
  permLock: 'dd_perm_lock',
  appealSent: 'dd_appeal_sent'
};
const now = () => Date.now();

/* ---------- Local lock utils ---------- */
function getNum(key){ return Number(localStorage.getItem(key) || 0) }
function setNum(key,val){ localStorage.setItem(key, String(val)) }
function getBool(key){ return localStorage.getItem(key) === '1' }
function setBool(key,val){ localStorage.setItem(key, val ? '1' : '0') }

function setTempLockMinutes(minutes){
  const until = now() + minutes*60*1000;
  setNum(LS_KEYS.lockedUntil, until);
}
function clearTempLock(){ localStorage.removeItem(LS_KEYS.lockedUntil) }
function checkLocked(){
  if(getBool(LS_KEYS.permLock)) return {locked:true, perm:true};
  const until = getNum(LS_KEYS.lockedUntil);
  if(until && until > now()) return {locked:true, perm:false, until};
  return {locked:false};
}

/* ---------- Page wiring: privacy -> age ---------- */
document.getElementById('accept-btn').addEventListener('click', () => showPage('age-page'));
document.getElementById('privacy-detail-btn').addEventListener('click', () => showPage('privacy-detail-page'));
document.getElementById('agree-privacy-detail').addEventListener('click', () => showPage('age-page'));

/* ---------- Age verification & routing ---------- */
document.getElementById('verify-age-btn').addEventListener('click', () => {
  const birthYear = Number(document.getElementById('birth-year').value);
  const msg = document.getElementById('age-message');
  msg.textContent = '';
  if(!birthYear || birthYear < 1900 || birthYear > 2100){ msg.textContent = 'Please enter a valid birth year.'; return; }

  const lockState = checkLocked();
  if(lockState.locked){
    if(lockState.perm) msg.textContent = 'Account permanently locked. Submit an appeal.';
    else msg.textContent = `Temporarily locked — try again later.`;
    return;
  }

  const age = new Date().getFullYear() - birthYear;
  if(age < 14){ msg.textContent = 'Too young for this app (14+).'; return; }

  // route
  if(age < 18){
    // minor
    document.getElementById('welcome-title').textContent = 'Hello — Minor Mode';
    document.getElementById('welcome-sub').textContent = 'PG quiz only — no message scanning.';
    document.getElementById('adult-tools-btn').classList.add('hidden');
    loadMinorQuiz();
    showPage('minor-page');
  } else {
    // adult
    document.getElementById('welcome-title').textContent = 'Welcome — Adult Mode';
    document.getElementById('welcome-sub').textContent = 'Full tools available: text & voice analysis.';
    document.getElementById('adult-tools-btn').classList.remove('hidden');
    showPage('home-page');
  }
});

/* ---------- Home buttons ---------- */
document.getElementById('start-quiz-btn').addEventListener('click', () => showPage('minor-page'));
document.getElementById('adult-tools-btn').addEventListener('click', () => showPage('adult-page'));
document.getElementById('appeal-btn').addEventListener('click', () => showPage('appeal-page'));

/* ---------- Minor Quiz (10 Q) ---------- */
const minorQuestions = [
  {id:'q0', text:'They reply fast when you message them.'},
  {id:'q1', text:'You overthink short replies like "ok" or "k".'},
  {id:'q2', text:'You re-read messages multiple times.'},
  {id:'q3', text:'You imagine worst-case scenarios from small delays.'},
  {id:'q4', text:'You check their social media for clues.'},
  {id:'q5', text:'They sometimes ignore you for days.'}, // contradicts q0 if both yes
  {id:'q6', text:'You feel anxious if a reply takes longer than an hour.'},
  {id:'q7', text:'You replay conversations in your head.'},
  {id:'q8', text:'Small punctuation changes make you overthink.'},
  {id:'q9', text:'You feel better once you get a clear reply.'}
];

function loadMinorQuiz(){
  const form = document.getElementById('minor-quiz-form');
  form.innerHTML = '';
  minorQuestions.forEach((q, i) => {
    const block = document.createElement('div'); block.className = 'quiz-question';
    const title = document.createElement('p'); title.textContent = `${i+1}. ${q.text}`;
    block.appendChild(title);
    ['Yes','Sometimes','No'].forEach(opt => {
      const label = document.createElement('label'); label.className='quiz-option';
      const input = document.createElement('input'); input.type='radio'; input.name=q.id; input.value=opt;
      label.appendChild(input); label.appendChild(document.createTextNode(' ' + opt));
      block.appendChild(label);
    });
    form.appendChild(block);
  });
}

/* contradiction detection for minors */
function detectContradictionMinor(form){
  // q0 = reply fast, q5 = sometimes ignore -> both Yes is contradiction
  if(form.get('q0') === 'Yes' && form.get('q5') === 'Yes') return true;
  // if user answers impossible extremes across multiple Qs, flag (simple heuristic)
  let yesCount = 0;
  minorQuestions.forEach(q => { if(form.get(q.id) === 'Yes') yesCount++; });
  if(yesCount >= 9) return true; // almost all yes = suspicious
  return false;
}

/* submit minor quiz */
document.getElementById('minor-submit-btn').addEventListener('click', () => {
  const formEl = document.getElementById('minor-quiz-form');
  const form = new FormData(formEl);
  if([...form.entries()].length < minorQuestions.length){
    alert('Please answer all questions.');
    return;
  }

  // contradiction detection + lock logic
  if(detectContradictionMinor(form)){
    let c = getNum(LS_KEYS.contradictions) || 0; c++;
    setNum(LS_KEYS.contradictions, c);
    if(c === 1){
      setTempLockMinutes(30); // 30 min temp lock
      alert('Inconsistent answers detected. Locked temporarily for 30 minutes.');
      showPage('age-page'); return;
    } else {
      setBool(LS_KEYS.permLock, true);
      alert('Multiple inconsistencies detected. Permanently locked. Submit appeal.');
      showPage('appeal-page'); return;
    }
  }

  // scoring (Yes=2, Sometimes=1, No=0)
  let raw = 0;
  minorQuestions.forEach(q => {
    const v = form.get(q.id);
    if(v === 'Yes') raw += 2;
    else if(v === 'Sometimes') raw += 1;
  });
  const pct = Math.round((raw / (minorQuestions.length*2)) * 100);
  const out = document.getElementById('minor-result');
  let msg = '';
  if(pct <= 30) msg = 'Low delulu risk — you are mostly grounded.';
  else if(pct <= 70) msg = 'Moderate delulu risk — some overthinking.';
  else msg = 'High delulu risk — consider stepping back and checking facts.';
  out.textContent = `Score: ${pct}% — ${msg}`;
});

/* ---------- Adult Analysis (text heuristics, mood, red flags) ---------- */
const analysisHistory = []; // session-level

function analyzeTextHeuristic(text){
  const t = (text||'').toLowerCase();
  let score = 0;
  const smallHints = ['maybe','idk','i guess','kinda','sorta','hopefully'];
  smallHints.forEach(h => { if(t.includes(h)) score += 8; });
  const shortReplies = [' k ',' ok ','ok ',' k\n','...','... '];
  shortReplies.forEach(s => { if(t.includes(s)) score += 6; });
  if(t.includes('left on read') || t.includes('ghost') || t.includes('ignored')) score += 20;
  const exclam = (t.match(/!/g)||[]).length;
  const ques = (t.match(/\?/g)||[]).length;
  score += Math.min(15, exclam*2 + ques*3);
  // mood
  let mood = 'Neutral';
  if(/\b(lol|haha|😂|😍|😘)\b/.test(t)) mood='Playful / Flirty';
  else if(/\b(angry|ugh|annoy|bother|frustrat)\b/.test(t)) mood='Annoyed';
  else if(ques > 2) mood='Unsure / Questioning';
  // clamp
  score = Math.max(0, Math.min(100, Math.round(score)));
  // red flags
  const flags=[];
  if(t.includes('ignore') || t.includes('left on read')) flags.push('Repeated ignoring / passive behaviour');
  if(t.includes('i don\'t want to talk') || t.includes('don’t want to talk')) flags.push('Direct rejection phrase');
  if(t.includes('ghost')) flags.push('Ghosting language');
  return {deluluScore:score,mood,flags};
}

/* update adult UI with results */
function showAdultResult(res){
  const fb = document.getElementById('adult-feedback');
  fb.innerHTML = `<div>Delulu: <strong>${res.deluluScore}%</strong></div><div> Mood: <strong>${res.mood}</strong></div>
    <div style="margin-top:8px">${res.flags.length? '<strong>Red flags:</strong> '+res.flags.join('; ') : 'No major red flags detected.'}</div>`;
  // reality meter (higher delulu => lower reality)
  const fill = document.getElementById('reality-fill');
  if(fill) fill.style.width = `${Math.max(4,100-res.deluluScore)}%`;
  // show mood & flags in small boxes
  document.getElementById('red-flag-output').textContent = res.flags.join('; ') || 'No major red flags';
  document.getElementById('mood-output').textContent = `Mood hint: ${res.mood}`;
  analysisHistory.push({ts:now(),preview:(document.getElementById('chat-input').value||'').slice(0,120),res});
}

/* analyze button */
document.getElementById('analyze-btn').addEventListener('click', () => {
  const text = document.getElementById('chat-input').value || '';
  if(!text.trim()){ alert('Paste chat text to analyze.'); return; }
  const res = analyzeTextHeuristic(text);
  showAdultResult(res);
});

/* clear chat */
document.getElementById('clear-chat-btn').addEventListener('click', () => {
  document.getElementById('chat-input').value='';
  document.getElementById('adult-feedback').textContent='';
});

/* brutal mode toggle */
let brutalMode = false;
document.getElementById('brutal-toggle-btn').addEventListener('click', () => {
  brutalMode = !brutalMode;
  document.getElementById('brutal-toggle-btn').textContent = brutalMode ? 'Brutal ON' : 'Brutal Mode';
});

/* download report */
document.getElementById('download-report-btn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({history:analysisHistory,ts:now()},null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='delulu_report.json'; a.click(); URL.revokeObjectURL(url);
});

/* ---------- Voice input using Web Speech API ---------- */
let recognition, recognizing=false;
const voiceTranscriptEl = document.getElementById('voice-transcript');
if('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRec();
  recognition.lang='en-US';
  recognition.interimResults=false;
  recognition.onstart = () => { recognizing=true; document.getElementById('voice-start-btn').textContent='Recording...'; document.getElementById('voice-stop-btn').disabled=false; };
  recognition.onend = () => { recognizing=false; document.getElementById('voice-start-btn').textContent='Start Recording'; document.getElementById('voice-stop-btn').disabled=true; };
  recognition.onerror = (e) => { recognizing=false; console.error(e); };
  recognition.onresult = (ev) => {
    const transcript = Array.from(ev.results).map(r=>r[0].transcript).join('');
    voiceTranscriptEl.textContent = transcript;
    document.getElementById('chat-input').value = transcript;
    const res = analyzeTextHeuristic(transcript);
    showAdultResult(res);
  };
} else {
  document.getElementById('voice-start-btn').disabled=true;
  document.getElementById('voice-stop-btn').disabled=true;
  voiceTranscriptEl.textContent = 'Voice not supported';
}
document.getElementById('voice-start-btn').addEventListener('click', ()=> { if(recognition && !recognizing) recognition.start(); });
document.getElementById('voice-stop-btn').addEventListener('click', ()=> { if(recognition && recognizing) recognition.stop(); });

/* ---------- Appeal flow (simulated) ---------- */
document.getElementById('send-appeal-btn').addEventListener('click', () => {
  const text = document.getElementById('appeal-text').value || '';
  if(!text.trim()){ document.getElementById('appeal-status').textContent='Please write a short appeal.'; return; }
  setBool(LS_KEYS.appealSent, true);
  document.getElementById('appeal-status').textContent = 'Appeal submitted (simulated). Staff will review.';
});

/* ---------- Restart & init ---------- */
function restart(){
  // clear transient data but keep permanent lock state
  localStorage.removeItem(LS_KEYS.contradictions);
  localStorage.removeItem(LS_KEYS.lockedUntil);
  showPage('privacy-page');
}

/* initialisation */
(function init(){
  // if perm locked, go to appeal page
  if(getBool(LS_KEYS.permLock)) {
    showPage('appeal-page');
    document.getElementById('appeal-status').textContent = 'Account is permanently locked. Submit an appeal.';
  } else {
    showPage('privacy-page');
  }
  // set default meter
  const fill = document.getElementById('reality-fill'); if(fill) fill.style.width='60%';
})();
