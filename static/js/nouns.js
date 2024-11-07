let words = [];
let currentIndex = 0;
let wordHistory = [];

document.addEventListener('keydown', function (event) {
    if (event.code === 'Space') {
        flipCard();
        event.preventDefault();
    } else if (event.code === 'ArrowLeft') {
        prevWord();
    } else if (event.code === 'ArrowRight') {
        nextWord();
    }
});

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
        
        // Re-enable animation after setting new content
        setTimeout(() => {
            cardInner.style.transition = ''; // Restore original CSS transition
        }, 50);
    }, 50); // Short delay before setting new content
}


function flipCard() {
    const card = document.querySelector('.flip-card-inner');
    card.classList.toggle('flipped');
}

function resetCard() {
    const card = document.querySelector('.flip-card-inner');
    card.classList.remove('flipped'); // Ensure it starts on the German side
}

function nextWord() {
    if (currentIndex < words.length - 1) {
        wordHistory.push(currentIndex);
        currentIndex++;
        showWord();
    }
}

function prevWord() {
    if (wordHistory.length > 0) {
        currentIndex = wordHistory.pop();
        showWord();
    }
}
