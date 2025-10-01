const display = document.getElementById('display');
const buttons = document.querySelectorAll('.buttons button');
const toggleBtn = document.getElementById('toggleBtn');
const calculator = document.getElementById('calculator');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');
const lightThemeBtn = document.getElementById('lightTheme');
const darkThemeBtn = document.getElementById('darkTheme');

let currentInput = "";

// Short jokes
const zeroJokes = [
    "Nope, zero wins 😆",
    "Can’t do that! 🚫",
    "Infinity says hi ♾️",
    "Divide by 0? LOL",
    "Zero broke math 🤯"
];

function getRandomJoke() {
    return zeroJokes[Math.floor(Math.random() * zeroJokes.length)];
}

// Prime check
function isPrime(num) {
    num = parseInt(num);
    if (isNaN(num) || num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}

// Save history
function saveHistory(expression, result) {
    let history = JSON.parse(localStorage.getItem("calcHistory")) || [];
    history.unshift(`${expression} = ${result}`);
    if (history.length > 10) history.pop(); // keep last 10
    localStorage.setItem("calcHistory", JSON.stringify(history));
    loadHistory();
}

// Load history
function loadHistory() {
    let history = JSON.parse(localStorage.getItem("calcHistory")) || [];
    historyList.innerHTML = "";
    history.forEach(item => {
        let li = document.createElement("li");
        li.textContent = item;
        historyList.appendChild(li);
    });
}

// Clear history
clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem("calcHistory");
    loadHistory();
});

// Toggle drawer
toggleBtn.addEventListener("click", () => {
    calculator.classList.toggle("open");
    toggleBtn.textContent = calculator.classList.contains("open")
        ? "Close Calculator"
        : "Open Calculator";
});

// Theme switching
lightThemeBtn.addEventListener("click", () => {
    document.body.classList.add("light");
    document.body.classList.remove("dark");
});

darkThemeBtn.addEventListener("click", () => {
    document.body.classList.add("dark");
    document.body.classList.remove("light");
});

// Button actions
buttons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.textContent;

        if (value === '=') {
            try {
                let result = eval(currentInput);

                if (result === Infinity || result === -Infinity || isNaN(result)) {
                    display.value = getRandomJoke();
                    currentInput = "";
                } else {
                    saveHistory(currentInput, result);
                    currentInput = result.toString();
                    display.value = currentInput;
                }
            } catch {
                display.value = "Error";
                currentInput = "";
            }
        } else if (value === 'Clear') {
            currentInput = "";
            display.value = "";
        } else if (value === 'Prime?') {
            if (isPrime(currentInput)) {
                display.value = "Prime ✅";
            } else {
                display.value = "Not Prime ❌";
            }
            currentInput = "";
        } else {
            currentInput += value;
            display.value = currentInput;
        }
    });
});

// Load history on start
loadHistory();

// Default theme
document.body.classList.add("light");
