let maxNumber = 100;
let randomNumber;
let guessCount;
let currentPlayer = "";
let startTime;
let timerInterval;

// Jokes
const jokes = [
    "Nope! Even my grandma guesses better. Try again!",
    "Wrong! But hey, at least you’re consistent.",
    "Close… but not as close as my WiFi signal.",
    "Nope, but don’t worry — even Einstein was wrong sometimes!",
    "Try again! That guess was colder than ice cream."
];

// Start with name entry
function startGameWithName() {
    let nameInput = document.getElementById("playerName").value.trim();
    if (nameInput === "") {
        alert("Please enter your name!");
        return;
    }
    currentPlayer = nameInput;
    document.getElementById("name-screen").style.display = "none";
    playGame();
    loadLeaderboards();
}

// Difficulty setting
function setDifficulty() {
    let difficulty = document.getElementById("difficulty").value;
    maxNumber = parseInt(difficulty);
    document.getElementById("range-text").innerText = `Pick a number between 1 and ${maxNumber}`;
    playGame();
}

// Start/Reset game
function playGame() {
    randomNumber = Math.floor(Math.random() * maxNumber) + 1;
    guessCount = 0;
    document.getElementById("message").innerText = "";
    document.getElementById("guess").value = "";
    document.getElementById("reset-btn").style.display = "none";

    // Reset timer
    clearInterval(timerInterval);
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
}

// Timer update
function updateTimer() {
    let elapsed = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById("timer").innerText = `⏱ Time: ${elapsed}s`;
}

// Check guess
function checkGuess() {
    let guess = parseInt(document.getElementById("guess").value);
    let message = document.getElementById("message");

    if (isNaN(guess) || guess < 1 || guess > maxNumber) {
        message.innerText = `Please enter a number between 1 and ${maxNumber}.`;
        return;
    }

    guessCount++;

    if (guess === randomNumber) {
        clearInterval(timerInterval);
        let timeTaken = Math.floor((Date.now() - startTime) / 1000);
        message.innerText = `🎉 Correct! You guessed the number in ${guessCount} tries and ${timeTaken} seconds!`;
        document.getElementById("reset-btn").style.display = "inline-block";
        saveScore(currentPlayer, guessCount, timeTaken);
    } else if (guessCount >= 15) {
        clearInterval(timerInterval);
        message.innerText = `😅 Too many tries! The number was ${randomNumber}. Maybe numbers just aren’t your thing!`;
        document.getElementById("reset-btn").style.display = "inline-block";
    } else {
        let hint = guess > randomNumber ? "Too high!" : "Too low!";
        let randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        message.innerText = `${hint} ${randomJoke}`;
    }
}

// Random hints
function giveHint() {
    let hints = [];

    let half = Math.floor(maxNumber / 2);
    hints.push(randomNumber > half
        ? `💡 Hint: The number is greater than ${half}.`
        : `💡 Hint: The number is less than or equal to ${half}.`);

    hints.push(randomNumber % 2 === 0
        ? "💡 Hint: The number is even."
        : "💡 Hint: The number is odd.");

    let lastDigit = randomNumber % 10;
    hints.push(`💡 Hint: The number ends with ${lastDigit}.`);

    let randomHint = hints[Math.floor(Math.random() * hints.length)];
    document.getElementById("message").innerText = randomHint;
}

// Save score to correct leaderboard
function saveScore(name, guesses, time) {
    let difficulty = document.getElementById("difficulty").value;
    let key = `leaderboard-${difficulty}`;
    let leaderboard = JSON.parse(localStorage.getItem(key)) || [];
    leaderboard.push({ name, guesses, time });
    leaderboard.sort((a, b) => a.guesses - b.guesses || a.time - b.time);
    localStorage.setItem(key, JSON.stringify(leaderboard));
    loadLeaderboards();
}

// Load all leaderboards
function loadLeaderboards() {
    ["50", "100", "500"].forEach(difficulty => {
        let key = `leaderboard-${difficulty}`;
        let leaderboard = JSON.parse(localStorage.getItem(key)) || [];
        let listId = difficulty === "50" ? "leaderboard-easy"
            : difficulty === "100" ? "leaderboard-medium"
                : "leaderboard-hard";
        let list = document.getElementById(listId);
        list.innerHTML = "";
        leaderboard.forEach(player => {
            let li = document.createElement("li");
            li.textContent = `${player.name} - ${player.guesses} guesses - ${player.time}s`;
            list.appendChild(li);
        });
    });
}

// Reset leaderboards
function resetLeaderboards() {
    ["50", "100", "500"].forEach(difficulty => {
        localStorage.removeItem(`leaderboard-${difficulty}`);
    });
    loadLeaderboards();
}

window.onload = () => {
    document.getElementById("name-screen").style.display = "flex";
};
