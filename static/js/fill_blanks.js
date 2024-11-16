let correctArticle = "";  // Store the correct article globally
let score = { correct: 0, incorrect: 0 };  // Initialize score
let phrases = [];  // Store randomized phrases
let currentPhraseIndex = 0;  // Track current phrase index

document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    setupSelectAll('case');
    setupSelectAll('type');
    setupInputListener();
}

function setupInputListener() {
    const input = document.getElementById('guess-input');
    input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            checkAnswer();
        }
    });
}

function setupSelectAll(group) {
    const selectAllCheckbox = document.getElementById(`${group}-select-all`);
    const checkboxes = document.querySelectorAll(`input[name="${group}"]`);

    selectAllCheckbox.addEventListener('change', () => {
        checkboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
    });

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            selectAllCheckbox.checked = Array.from(checkboxes).every(cb => cb.checked);
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

    if (!caseValues.length || !typeValues.length) {
        return alert("Please select at least one filter in both dropdowns.");
    }

    fetch('/get_random_phrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case: caseValues, type: typeValues })
    })
    .then(response => response.json())
    .then(data => {
        phrases = shuffleArray(data.phrases);
        currentPhraseIndex = 0;
        showPhrase(phrases[currentPhraseIndex]);
    })
    .catch(handleError('Error loading phrases'));
}

function showPhrase(phrase) {
    setElementText('english-text', phrase.english);
    setElementText('german-text', phrase.german);
    correctArticle = phrase.article;

    toggleElementVisibility('main-content', true);

    loadRules(phrase.type, phrase.case);
}

function loadRules(type, sentenceCase) {
    fetch('/get_fill_blank_rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
    })
    .then(response => response.json())
    .then(data => displayRules(data.rules, sentenceCase))
    .catch(handleError("Error fetching rules"));
}

function displayRules(rules, sentenceCase) {
    const rulesTable = document.getElementById('rules-table');
    rulesTable.innerHTML = `
        <tr>
            <th>Case</th>
            <th>Masculine</th>
            <th>Neuter</th>
            <th>Feminine</th>
            <th>Plural</th>
        </tr>
    `;

    rules.forEach(rule => {
        const isHighlighted = rule.case === sentenceCase;
        rulesTable.innerHTML += `
            <tr ${isHighlighted ? 'style="font-weight: bold;"' : ''}>
                <td>${rule.case}</td>
                <td>${rule.masculine}</td>
                <td>${rule.neuter}</td>
                <td>${rule.feminine}</td>
                <td>${rule.plural}</td>
            </tr>
        `;
    });
}

function checkAnswer() {
    const input = document.getElementById('guess-input').value.trim();
    const feedback = document.getElementById('feedback');
    const englishText = document.getElementById('english-text').textContent;
    const germanText = document.getElementById('german-text').textContent;
    const fullGermanSentence = germanText.replace('[ ]', `<b><u>${correctArticle}</u></b>`);

    if (input === correctArticle) {
        score.correct++;
        feedback.className = "feedback correct";
        feedback.innerHTML = `Correct. ${correctArticle}<br><strong>English:</strong> ${englishText}<br><strong>German:</strong> ${fullGermanSentence}`;
    } else {
        score.incorrect++;
        feedback.className = "feedback incorrect";
        feedback.innerHTML = `Incorrect. The correct answer is: ${correctArticle}<br><strong>English:</strong> ${englishText}<br><strong>German:</strong> ${fullGermanSentence}`;
    }

    showRulesSection();
    updateScore();
    nextPhrase();
}

function showRulesSection() {
    const rulesSection = document.getElementById('rules-section');
    rulesSection.style.display = 'block'; // Ensure it's visible
}


function nextPhrase() {
    if (++currentPhraseIndex < phrases.length) {
        showPhrase(phrases[currentPhraseIndex]);
    } else {
        alert("You've completed all phrases!");
        currentPhraseIndex = 0;  // Reset index for reuse
    }
    document.getElementById('guess-input').value = "";  // Clear input
}

function updateScore() {
    setElementText('score', `Correct: ${score.correct} | Incorrect: ${score.incorrect}`);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Utility Functions
function setElementText(id, text) {
    document.getElementById(id).textContent = text;
}

function toggleElementVisibility(id, isVisible) {
    document.getElementById(id).classList.toggle('hidden', !isVisible);
}

function handleError(message) {
    return (error) => {
        console.error(message, error);
        alert(message);
    };
}
