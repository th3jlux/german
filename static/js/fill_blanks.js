document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggle-dropdown');
    const dropdownContent = document.getElementById('dropdown-content');
    const guessInput = document.getElementById('guess-input');

    toggleButton.addEventListener('click', function() {
        dropdownContent.classList.toggle('hidden');
    });

    document.getElementById('unique-case').addEventListener('change', fetchRandomPhrase);
    document.getElementById('unique-type').addEventListener('change', fetchRandomPhrase);

    // Check Answer on button click
    document.querySelector('button[onclick="checkAnswer()"]').addEventListener('click', checkAnswer);

    // Check Answer on Enter key press
    guessInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();  // Prevent form submission if inside a form
            checkAnswer();
        }
    });
});

correctArticle = ""

function fetchRandomPhrase() {
    const caseValue = document.getElementById('unique-case').value;
    const typeValue = document.getElementById('unique-type').value;

    fetch('/get_random_phrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case: caseValue, type: typeValue })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('english-text').textContent = data.english;
        document.getElementById('german-text').textContent = data.german;
        correctArticle = data.article
    })
    .catch(error => console.error('Error fetching phrase:', error));
}

function checkAnswer() {
    const input = document.getElementById('guess-input').value.trim();
    const feedback = document.getElementById('feedback');

    if (input === correctArticle) {
        feedback.textContent = "Correct!";
        feedback.style.color = "green";
    } else {
        feedback.textContent = `Try again. The correct answer is: ${correctArticle}`;
        feedback.style.color = "red";
    }
}
