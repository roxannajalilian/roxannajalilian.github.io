function checkAge() {
  const age = Number(document.getElementById("age").value);

  if (!age) {
    alert("Please enter your age.");
    return;
  }

  if (age < 18) {
    window.location.href = "under18.html";
  } else {
    window.location.href = "privacy.html";
  }
}
