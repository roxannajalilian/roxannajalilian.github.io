function analyzeText(){
  let text=document.getElementById("textInput").value.toLowerCase();
  let score=0;
  const keywords=["why","maybe","think","sure","feel","okay","sorry"];
  keywords.forEach(k=>{if(text.includes(k)) score+=1;});
  let percent=Math.min(Math.round((score/10)*100),100);
  let result="";
  if(percent<35) result="This conversation seems relaxed. You are unlikely overthinking.";
  else if(percent<70) result="Some parts of the conversation could trigger overthinking. Pause and check your assumptions.";
  else result="High chance of overthinking. Consider asking directly or giving space before stressing.";
  document.getElementById("scanResult").innerHTML="<b>Analysis:</b> "+result+"<br><b>Score:</b> "+percent+"%";
}

function analyzeImage(){
  document.getElementById("scanResult").innerHTML="Image analysis feature coming soon! (Future AI enhancement)";
}
