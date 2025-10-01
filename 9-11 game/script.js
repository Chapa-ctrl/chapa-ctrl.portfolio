let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer = 0;
let timerInterval;

async function loadQuestions() {
    try {
        const response = await fetch("questions.json");
        questions = await response.json();
        shuffleArray(questions); // shuffle questions on load
        startGame();
    } catch (error) {
        document.getElementById("question-container").textContent = "Failed to load questions.";
    }
}

function startGame() {
    currentQuestionIndex = 0;
    score = 0;
    timer = 0;
    document.getElementById("result").textContent = "";
    document.getElementById("next-btn").disabled = true;
    document.getElementById("next-btn").style.display = "block";

    startTimer();
    showQuestion();
    renderLeaderboard();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer++;
        document.getElementById("timer").textContent = `⏳ Time: ${timer}s`;
    }, 1000);
}

function showQuestion() {
    const q = questions[currentQuestionIndex];
    document.getElementById("question-container").textContent = q.question;

    const optionsContainer = document.getElementById("options-container");
    optionsContainer.innerHTML = "";

    // Shuffle answers but keep track of the correct one
    const optionIndexes = q.options.map((_, i) => i);
    shuffleArray(optionIndexes);

    optionIndexes.forEach((shuffledIndex) => {
        const btn = document.createElement("button");
        btn.textContent = q.options[shuffledIndex];
        btn.onclick = () => selectAnswer(shuffledIndex, btn);
        optionsContainer.appendChild(btn);
    });
}

function selectAnswer(selectedIndex, button) {
    const q = questions[currentQuestionIndex];
    const optionButtons = document.querySelectorAll("#options-container button");

    optionButtons.forEach(btn => btn.disabled = true);

    if (selectedIndex === q.answer) {
        button.classList.add("correct");
        score++;
    } else {
        button.classList.add("wrong");

        // highlight the real correct answer
        optionButtons.forEach((btn, idx) => {
            if (btn.textContent === q.options[q.answer]) {
                btn.classList.add("correct");
            }
        });
    }

    document.getElementById("next-btn").disabled = false;
}

document.getElementById("next-btn").addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
        document.getElementById("next-btn").disabled = true;
    } else {
        endGame();
    }
});

function endGame() {
    clearInterval(timerInterval);
    document.getElementById("question-container").textContent = `📘 Study Session Over! Score: ${score}/${questions.length}`;
    document.getElementById("options-container").innerHTML = "";
    document.getElementById("next-btn").style.display = "none";

    saveScore(score, timer);
    renderLeaderboard();
}

function saveScore(score, time) {
    const name = prompt("Enter your name:") || "Student";
    const newEntry = { name, score, time };

    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push(newEntry);

    leaderboard.sort((a, b) => b.score - a.score || a.time - b.time);
    leaderboard = leaderboard.slice(0, 10);

    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function renderLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    const list = document.getElementById("leaderboard");
    list.innerHTML = "";

    leaderboard.forEach(entry => {
        const li = document.createElement("li");
        li.textContent = `${entry.name} - ${entry.score} pts (${entry.time}s)`;
        list.appendChild(li);
    });
}

// ✅ Clear leaderboard button
document.getElementById("clear-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the leaderboard?")) {
        localStorage.removeItem("leaderboard");
        renderLeaderboard();
    }
});

// ✅ Restart game button
document.getElementById("restart-btn").addEventListener("click", () => {
    shuffleArray(questions); // reshuffle for new run
    startGame();
});

// ✅ Shuffle helper
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

loadQuestions();
