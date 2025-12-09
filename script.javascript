// ====== NAVIGATION ======
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function showAgeVerification() {
    showPage('age-verification-page');
}

function goToPrivacy() {
    showPage('privacy-page');
}

// ====== AGE VERIFICATION ======
let minorLockout = false;
let minorContradictions = 0;
let adultLockout = false;

function verifyAge() {
    const dob = document.getElementById('dob').value;
    const age = new Date().getFullYear() - dob;

    if (!dob || age < 0) {
        document.getElementById('age-error').innerText = "Please enter a valid year.";
        return;
    }

    if (age >= 14 && age <= 17) {
        if (minorLockout) {
            alert("You are temporarily locked out due to previous inconsistencies.");
            return;
        }
        showPage('minor-quiz-page');
    } else if (age >= 18) {
        showPage('adult-page');
    } else {
        document.getElementById('age-error').innerText = "Sorry, this app is for ages 14+.";
    }
}

// ====== MINOR QUIZ SCORING ======
function submitMinorQuiz() {
    const form = document.getElementById('minor-quiz-form');
    const formData = new FormData(form);
    let score = 0;
    let contradictionDetected = false;

    formData.forEach(value => {
        const val = parseInt(value);
        score += val;
        if (val === 2) contradictionDetected = true;
    });

    // Lockout logic
    if (contradictionDetected) {
        minorContradictions++;
        if (minorContradictions === 1) {
            minorLockout = true;
            alert("We noticed inconsistent answers. Locked for 30 minutes.");
            setTimeout(() => minorLockout = false, 1800000); // 30 mins
        } else if (minorContradictions >= 2) {
            minorLockout = true;
            alert("Multiple inconsistencies detected. Locked permanently. Appeal via support.");
        }
    }

    // Show result
    let percent = Math.min(Math.floor((score / (formData.length*2)) * 100), 100);
    let resultText = "";
    if (percent <= 30) resultText = "Low delulu risk!";
    else if (percent <= 70) resultText = "Moderate delulu risk!";
    else resultText = "High delulu risk!";
    document.getElementById('minor-result').innerText = `Score: ${percent}% - ${resultText}`;
}

