let words = [];
let currentIndex = 0;
let wordHistory = [];
let incorrectWords = [];


document.getElementById('select-all').addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('input[name="category"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = this.checked;
    });
});

document.querySelectorAll('input[name="category"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const allChecked = Array.from(document.querySelectorAll('input[name="category"]'))
            .every(cb => cb.checked);
        const anyChecked = Array.from(document.querySelectorAll('input[name="category"]'))
            .some(cb => cb.checked);

        document.getElementById('select-all').checked = allChecked;
        document.getElementById('select-all').indeterminate = !allChecked && anyChecked;
    });
});


document.getElementById('guess-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        checkAnswer();
        event.preventDefault();
    }
});

document.addEventListener('keydown', function (event) {
    const inputFocused = document.activeElement.id === 'guess-input';
    
    if (event.code === 'Space' && !inputFocused) {
        flipCard();
        event.preventDefault();
    } else if (event.code === 'ArrowLeft') {
        prevWord();
    } else if (event.code === 'ArrowRight') {
        nextWord();
    }
});

let wordsAttempted = {}; // Track words to handle correct/incorrect attempts

function insertCharacter(char) {
    const input = document.getElementById('guess-input');
    
    // Insert character at the current cursor position
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    input.value = text.substring(0, start) + char + text.substring(end);
    
    // Move cursor to the right of the inserted character
    input.selectionStart = input.selectionEnd = start + 1;
    
    // Keep focus on the input field
    input.focus();
}

function checkAnswer() {
    const input = document.getElementById('guess-input').value.trim();
    const feedback = document.getElementById('feedback');
    const currentWord = words[currentIndex];
    const correctArticle = getArticle(currentWord.gender);
    const expectedAnswer = `${correctArticle} ${currentWord.german.toLowerCase()}`.trim();

    if (input.toLowerCase() === expectedAnswer) {
        if (!wordsAttempted[currentWord.german]) {
            feedback.textContent = 'Correct!';
            feedback.style.color = 'green';

            // Remove word from list since it is correct on the first attempt (this time)
            words.splice(currentIndex, 1);
            delete wordsAttempted[currentWord.german];

            if (words.length === 0) {
                feedback.textContent = 'Congratulations! You have completed all words!';
                document.getElementById('flip-card-front').innerText = '';
                document.getElementById('flip-card-back').innerText = '';
                return;
            }

            if (currentIndex >= words.length) {
                currentIndex = 0;
            }
            nextWord();
        } else {
            feedback.textContent = 'Correct, but this word will appear again!';
            feedback.style.color = 'orange';
            delete wordsAttempted[currentWord.german];
            nextWord(); // Go to the next word without removing it
        }
    } else {
        feedback.textContent = `Incorrect. You entered: "${input}". Correct answer: "${correctArticle} ${currentWord.german}"`;;
        feedback.style.color = 'red';
        wordsAttempted[currentWord.german] = true; // Mark as attempted

        if (!incorrectWords.includes(expectedAnswer)) {
            incorrectWords.push(expectedAnswer);
            addToErrorList(expectedAnswer);
        }
    }

    document.getElementById('guess-input').value = ''; // Clear input
}

function addToErrorList(word) {
    const errorsList = document.getElementById('errors');
    const listItem = document.createElement('li');
    listItem.textContent = word;
    errorsList.appendChild(listItem);
}

function getArticle(gender) {
    switch (gender) {
        case 'M': return 'der';
        case 'F': return 'die';
        case 'N': return 'das';
        default: return '';
    }
}

function showWord() {
    if (words.length === 0) return;

    const cardInner = document.querySelector('.flip-card-inner');
    cardInner.style.transition = 'none'; // Disable animation temporarily

    resetCard(); // Reset to the English side before setting new content

    setTimeout(() => {
        const word = words[currentIndex];
        const genderClass = word.gender === 'M' ? 'blue' : word.gender === 'N' ? 'green' : 'red';

        document.getElementById('flip-card-front').innerText = word.english;
        document.getElementById('flip-card-back').innerText = word.german;
        document.getElementById('flip-card-back').className = `flip-card-back ${genderClass}`;

        setTimeout(() => {
            cardInner.style.transition = ''; // Restore original CSS transition
        }, 50);
    }, 50); // Short delay before setting new content

    document.getElementById('guess-input').focus();  // Automatically focus input
}

function nextWord() {
    if (currentIndex < words.length - 1) {
        currentIndex++;
    } else {
        currentIndex = 0;
    }
    showWord();
}

function toggleCategories() {
    const categoriesDiv = document.getElementById('categories');
    const collapseButton = document.getElementById('collapse-button');
    const elementsToToggle = categoriesDiv.querySelectorAll('h3, label, button:not(#collapse-button)');

    // Toggle visibility of all elements except the collapse button
    elementsToToggle.forEach(element => {
        element.style.display = element.style.display === 'none' ? 'block' : 'none';
    });

    // Toggle button text between + and −
    collapseButton.textContent = collapseButton.textContent === '−' ? '+' : '−';
}



function prevWord() {
    if (currentIndex > 0) {
        currentIndex--;
    } else {
        currentIndex = words.length - 1;
    }
    showWord();
}


function loadWords() {
    const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
        .map(cb => cb.value);

    fetch('/get_words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: selectedCategories })
    })
    .then(response => response.json())
    .then(data => {
        words = shuffleArray(data);
        currentIndex = 0;
        wordHistory = [];
        showWord();
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}



function flipCard() {
    const card = document.querySelector('.flip-card-inner');
    card.classList.toggle('flipped');
}

function resetCard() {
    const card = document.querySelector('.flip-card-inner');
    card.classList.remove('flipped'); // Ensure it starts on the German side
}
