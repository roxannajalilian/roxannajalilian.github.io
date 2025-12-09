const verifyBtn = document.getElementById('verify-age');
verifyBtn.addEventListener('click', () => {
const age = parseInt(ageInput.value);
if (!age || age < 0) {
ageError.style.display = 'block';
return;
}
ageError.style.display = 'none';

container.innerHTML = `<h1>Delulu Detector Quiz</h1>`;

const questions = age < 18 ? minorQuestions : minorQuestions; // placeholder for adult

questions.forEach((q, i) => {
const div = document.createElement('div');
div.classList.add('question');
div.innerHTML = `<p>${i+1}. ${q}</p>`;
const optionsDiv = document.createElement('div');
optionsDiv.classList.add('options');
optionsDiv.innerHTML = `
<label><input type='radio' name='q${i}' value='1'> Yes</label>
<label><input type='radio' name='q${i}' value='0'> No</label>
`;
div.appendChild(optionsDiv);
container.appendChild(div);
});

const submitBtn = document.createElement('button');
submitBtn.textContent = 'Submit';
container.appendChild(submitBtn);

const resultDiv = document.createElement('div');
resultDiv.classList.add('result');
container.appendChild(resultDiv);

submitBtn.addEventListener('click', () => {
let score = 0;
questions.forEach((_, i) => {
const selected = document.querySelector(`input[name='q${i}']:checked`);
if (selected) score += parseInt(selected.value);
});
let percentage = Math.round((score / questions.length) * 100);
resultDiv.textContent = `Delulu Score: ${percentage}%`;

if (percentage < 30) resultDiv.textContent += ' - Calm, not overthinking';
else if (percentage < 70) resultDiv.textContent += ' - Moderate, watch your thoughts';
else resultDiv.textContent += ' - High, delulu alert!';
});
});
