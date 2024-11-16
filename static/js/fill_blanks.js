let correctArticle = "";  
let score = { correct: 0, incorrect: 0 };  
let phrases = [];  
let currentPhraseIndex = 0;  
let savedRules = {};  // Store rules for each phrase

document.addEventListener('DOMContentLoaded', () => {
    setupCheckboxGroups(['case', 'type']);
    setupEnterKeyListener('guess-input', checkAnswer);
});

function setupCheckboxGroups(groups) {
    groups.forEach(group => {
        const selectAll = document.getElementById(`${group}-select-all`);
        const checkboxes = document.querySelectorAll(`input[name="${group}"]`);

        selectAll.addEventListener('change', () => {
            checkboxes.forEach(cb => cb.checked = selectAll.checked);
        });

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                selectAll.checked = Array.from(checkboxes).every(cb => cb.checked);
            });
        });
    });
}

function setupEnterKeyListener(inputId, callback) {
    document.getElementById(inputId).addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            callback();
        }
    });
}

function getSelectedValues(group) {
    return Array.from(document.querySelectorAll(`input[name="${group}"]:checked`))
        .map(cb => cb.value);
}

function loadPhrase() {
    const filters = { case: getSelectedValues('case'), type: getSelectedValues('type') };

    if (!filters.case.length || !filters.type.length) {
        return alert("Please select at least one filter in both dropdowns.");
    }

    fetch('/get_random_phrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
    })
    .then(response => response.json())
    .then(data => {
        phrases = shuffleArray(data.phrases);
        currentPhraseIndex = 0;
        saveAndDisplayPhrase();
    })
    .catch(handleError('Error loading phrases'));
}

function saveAndDisplayPhrase() {
    const phrase = phrases[currentPhraseIndex];
    if (!phrase) return;

    setText('english-text', phrase.english);
    setText('german-text', phrase.german);
    correctArticle = phrase.article;

    fetch('/get_fill_blank_rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: phrase.type })
    })
    .then(response => response.json())
    .then(data => {
        savedRules[phrase.german] = data.rules;  // Save rules for the current phrase
        toggleVisibility('main-content', true);
    })
    .catch(handleError("Error fetching rules"));
}

function checkAnswer() {
    const input = document.getElementById('guess-input').value.trim();
    const feedback = document.getElementById('feedback');
    const englishText = document.getElementById('english-text').textContent;
    const germanText = document.getElementById('german-text').textContent;

    const correctSentence = germanText.replace('[ ]', `<b><u>${correctArticle}</u></b>`);
    const userSentence = germanText.replace('[ ]', `<b><u>${input || "(nothing)"}</u></b>`);

    if (input === correctArticle) {
        score.correct++;
        feedback.className = "feedback correct";
        feedback.innerHTML = `
            <span style="color: green;"><em>Correct!</em></span><br>
            <em>The English sentence was: ${englishText}</em><br>
            <em>You correctly entered: ${correctSentence}</em>
        `;

        updateScore();
        displaySavedRules(germanText);  // Display rules for the current phrase
        nextPhrase();
    } else {
        score.incorrect++;
        feedback.className = "feedback incorrect";
        feedback.innerHTML = `
            <span style="color: red;"><em>Incorrect. Try Again</em></span><br>
        `;

        updateScore();
        displaySavedRules(germanText);  // Display rules for the current phrase
    }
}

function nextPhrase() {
    currentPhraseIndex++;
    if (currentPhraseIndex < phrases.length) {
        saveAndDisplayPhrase(); // Display next phrase
    } else {
        alert("You've completed all phrases!");
        currentPhraseIndex = 0; // Reset for new session
        saveAndDisplayPhrase();
    }
    document.getElementById('guess-input').value = ""; // Clear input field
}

function updateScore() {
    setText('score', `Correct: ${score.correct} | Incorrect: ${score.incorrect}`);
}

  

function displaySavedRules(phraseText) {
    const rules = savedRules[phraseText] || [];
    const currentCase = phrases[currentPhraseIndex]?.case; // Get the case for the current phrase
    const table = document.getElementById('rules-table');

    table.innerHTML = `
        <tr>
            <th><em>Case</em></th>
            <th><em>Masculine</em></th>
            <th><em>Feminine</em></th>
            <th><em>Neuter</em></th>
            <th><em>Plural</em></th>
        </tr>
        ${rules.map(rule => `
            <tr style="${rule.case === currentCase ? 'font-weight: bold;' : ''}">
                <td><em>${rule.case}</em></td>
                <td><em>${rule.masculine}</em></td>
                <td><em>${rule.feminine}</em></td>
                <td><em>${rule.neuter}</em></td>
                <td><em>${rule.plural}</em></td>
            </tr>`).join('')}
    `;
    toggleVisibility('rules-section', true);
}



function nextPhrase() {
    if (++currentPhraseIndex < phrases.length) {
        saveAndDisplayPhrase();
    } else {
        alert("You've completed all phrases!");
        currentPhraseIndex = 0;
        saveAndDisplayPhrase();
    }
    document.getElementById('guess-input').value = ""; 
}

function updateScore() {
    setText('score', `Correct: ${score.correct} | Incorrect: ${score.incorrect}`);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function setText(id, text) {
    document.getElementById(id).textContent = text;
}

function toggleVisibility(id, show) {
    document.getElementById(id).style.display = show ? 'block' : 'none';
}

function handleError(message) {
    return (error) => {
        console.error(message, error);
        alert(message);
    };
}
