let correctArticle = "";  // Store the correct article globally
let score = { correct: 0, incorrect: 0 };  // Initialize score
let phrases = [];  // Store randomized phrases
let currentPhraseIndex = 0;  // Track current phrase index

document.addEventListener('DOMContentLoaded', () => {
    setupSelectAll('case');
    setupSelectAll('type');

    // Allow 'Enter' key to submit the answer
    document.getElementById('guess-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            checkAnswer();
        }
    });
});

function setupSelectAll(group) {
    const selectAllCheckbox = document.getElementById(`${group}-select-all`);
    const checkboxes = document.querySelectorAll(`input[name="${group}"]`);

    selectAllCheckbox.addEventListener('change', function () {
        checkboxes.forEach(checkbox => checkbox.checked = selectAllCheckbox.checked);
    });

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            if (!this.checked) {
                selectAllCheckbox.checked = false;
            } else if (Array.from(checkboxes).every(cb => cb.checked)) {
                selectAllCheckbox.checked = true;
            }
        });
    });
}

function getSelectedValues(group) {
    return Array.from(document.querySelectorAll(`input[name="${group}"]:checked`))
        .map(cb => cb.value);
}

function loadPhrase() {
    const caseValues = getSelectedValues('case');
    const typeValues = getSelectedValues('type');

    if (caseValues.length === 0 || typeValues.length === 0) {
        alert("Please select at least one filter in both dropdowns.");
        return;
    }

    fetch('/get_random_phrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case: caseValues, type: typeValues })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        console.log("Received data:", data);  // Debugging line
        phrases = shuffleArray(data.phrases);  // Randomize phrases
        currentPhraseIndex = 0;
        showPhrase(phrases[currentPhraseIndex]);
    })
    .catch(error => {
        console.error('Error loading phrases:', error);
        alert("Error loading phrases. Please try again.");
    });
}

function showPhrase(phrase) {
    document.getElementById('english-text').textContent = phrase.english;
    document.getElementById('german-text').textContent = phrase.german;
    correctArticle = phrase.article;

    document.getElementById('main-content').classList.remove('hidden');  // Show the main content
}

function checkAnswer() {
    const input = document.getElementById('guess-input').value.trim();
    const feedback = document.getElementById('feedback');

    if (input === correctArticle) {
        score.correct++;
        feedback.textContent = "Correct!";
        feedback.className = "feedback correct";
    } else {
        score.incorrect++;
        feedback.textContent = `Incorrect. The correct answer is: ${correctArticle}`;
        feedback.className = "feedback incorrect";
    }

    updateScore();  // Update the score display
    nextPhrase();   // Move to the next phrase
}

function nextPhrase() {
    currentPhraseIndex++;
    if (currentPhraseIndex < phrases.length) {
        showPhrase(phrases[currentPhraseIndex]);
    } else {
        alert("You've completed all phrases!");
        currentPhraseIndex = 0;  // Reset index for reuse
    }

    document.getElementById('guess-input').value = "";  // Clear input field
}

function updateScore() {
    document.getElementById('score').textContent = 
        `Correct: ${score.correct} | Incorrect: ${score.incorrect}`;
}

// Utility function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}
