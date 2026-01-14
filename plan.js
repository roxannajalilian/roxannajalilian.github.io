(() => {
  const APP_KEY = "dd_app_v1";
  function getAppData(){ try { return JSON.parse(localStorage.getItem(APP_KEY) || "{}"); } catch { return {}; } }

  const data = getAppData();
  if (!data.age || Number(data.age) < 18) { window.location.replace("start.html"); return; }

  const loadingWrap = document.getElementById("loadingWrap");
  const emptyWrap = document.getElementById("emptyWrap");
  const resultWrap = document.getElementById("resultWrap");

  const scoreBadge = document.getElementById("scoreBadge");
  const planBar = document.getElementById("planBar");
  const savedAtText = document.getElementById("savedAtText");

  const meaningText = document.getElementById("meaningText");
  const ruleText = document.getElementById("ruleText");
  const todayList = document.getElementById("todayList");
  const boundariesList = document.getElementById("boundariesList");
  const linesBox = document.getElementById("linesBox");

  const last = data.lastQuiz;

  function setList(el, items){ el.innerHTML = items.map(x => `<li>${x}</li>`).join(""); }
  function cards(lines){ return lines.map(l => `<div class="quote">${l}</div>`).join(""); }

  function planFor(p){
    if (p >= 80) return {
      meaning:"Full spiral mode — your brain is writing stories from tiny signals.",
      rule:"One message max. If they’re inconsistent, detach. Don’t chase.",
      today:["Mute notifs for 2 hours.","Write facts only (actions, not guesses).","Ask ONE clear question then stop."],
      bounds:["No double text for 6 hours.","No checking views/activity.","Dry/rude twice = step back."],
      lines:["“Hey, are we good? I just want clarity.”","“No worries — I’ll give you space.”","“I’m not into mixed signals.”"]
    };
    if (p >= 60) return {
      meaning:"High delulu — silence/tone triggers you into overthinking.",
      rule:"Ask once, then wait. Your peace > their reply.",
      today:["Wait 5 minutes before replying.","Do a distraction task first.","Only respond when calm."],
      bounds:["No paragraphs for one-word replies.","Don’t reward disappearing.","Consistency > cute words."],
      lines:["“Can you be direct? I’m confused.”","“Okay, we can talk later.”","“I like consistent communication.”"]
    };
    if (p >= 40) return {
      meaning:"Half-delulu — mostly okay, but certain triggers flip you.",
      rule:"Patterns > moments. One text isn’t a prophecy.",
      today:["Stop rereading the chat.","Ask simple questions, no hints.","Do something productive."],
      bounds:["Don’t text when heated.","Mirror dry energy.","Don’t beg for replies."],
      lines:["“What’s the plan?”","“If you’re busy, talk later.”","“Just tell me straight.”"]
    };
    if (p >= 20) return {
      meaning:"Slight overthink — you notice signals but stay mostly grounded.",
      rule:"Stay chill and let actions speak.",
      today:["Reply normally.","Give time to respond.","Do something fun, not phone-watching."],
      bounds:["Don’t assume tone from punctuation.","Don’t change mood from one reply.","Ask instead of guessing."],
      lines:["“No worries, talk later.”","“What did you mean?”","“Cool, let me know.”"]
    };
    return {
      meaning:"Super grounded — you’re not spiraling, you’re watching reality.",
      rule:"Keep standards. Don’t entertain inconsistency.",
      today:["Stay consistent.","Protect your energy.","Choose effort-matching people."],
      bounds:["Don’t over-invest early.","Watch actions not promises.","Step back sooner if off."],
      lines:["“I like clear communication.”","“Let me know when you’re free.”","“I’m not guessing games.”"]
    };
  }

  setTimeout(() => {
    if (!last || typeof last.percent !== "number") {
      loadingWrap.style.display = "none";
      emptyWrap.style.display = "block";
      return;
    }

    const p = last.percent;
    const plan = planFor(p);

    loadingWrap.style.display = "none";
    resultWrap.style.display = "block";

    scoreBadge.textContent = `${p}%`;
    planBar.style.width = `${p}%`;
    savedAtText.textContent = last.savedAt ? `Saved: ${new Date(last.savedAt).toLocaleString()}` : "";

    meaningText.textContent = plan.meaning;
    ruleText.textContent = plan.rule;

    setList(todayList, plan.today);
    setList(boundariesList, plan.bounds);
    linesBox.innerHTML = cards(plan.lines);
  }, 850);
})();
