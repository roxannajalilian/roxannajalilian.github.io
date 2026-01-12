document.getElementById("continueTeen").onclick = () => {
  const data = getData();
  data.mode = "teen";
  setData(data);

  // Teen users go straight to quiz
  window.location.href = "quiz.html";
};
