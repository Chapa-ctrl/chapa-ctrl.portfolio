// script.js — fully working quiz logic
document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const startBtn = document.getElementById("startBtn");
  const resetQuizBtn = document.getElementById("resetQuizBtn");
  const quizArea = document.getElementById("quizArea");
  const questionText = document.getElementById("questionText");
  const optionsEl = document.getElementById("options");
  const tracker = document.getElementById("tracker");
  const leftCountEl = document.getElementById("leftCount");
  const correctCountEl = document.getElementById("correctCount");
  const wrongCountEl = document.getElementById("wrongCount");
  const progressBar = document.getElementById("progressBar");

  const resultArea = document.getElementById("resultArea");
  const scoreText = document.getElementById("scoreText");
  const usernameInput = document.getElementById("username");
  const saveScoreBtn = document.getElementById("saveScoreBtn");
  const restartBtn = document.getElementById("restartBtn");

  const leaderboardBody = document.querySelector("#leaderboard tbody");
  const clearLeaderboardBtn = document.getElementById("clearLeaderboardBtn");
  const debugDiv = document.getElementById("debug");

  // State
  let bank = [];            // normalized complete bank
  let questions = [];       // current quiz questions
  let currentIndex = 0;
  let totalQuestions = 10;
  let correct = 0;
  let wrong = 0;
  let running = false;

  // Utilities
  function debug(msg){
    console.log("[Quiz]", msg);
    if (debugDiv) debugDiv.textContent = msg;
  }

  function shuffle(array){
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Load JSON (expects questions.json in same folder)
  async function loadBank(){
    try {
      const res = await fetch("questions.json", {cache: "no-store"});
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("questions.json must contain an array");
      debug(`Loaded ${data.length} raw items`);
      // normalize items to {question, choices[], answer}
      bank = data.map((q, idx) => {
        if (!q || typeof q !== "object") return null;
        const question = q.question || q.prompt || q.q || "";
        const choices = Array.isArray(q.choices) ? q.choices : Array.isArray(q.options) ? q.options : null;
        const answer = q.answer || q.correct || q.solution || null;
        if (!question || !choices || !answer) {
          console.warn("Skipping invalid question at index", idx, q);
          return null;
        }
        return { question: String(question), choices: choices.map(String), answer: String(answer) };
      }).filter(Boolean);
      debug(`Normalized bank length: ${bank.length}`);
      return bank;
    } catch (err){
      console.error("Failed to load questions.json:", err);
      questionText.textContent = "Error loading questions.json — open console for details.";
      return [];
    }
  }

  // Start quiz
  async function startQuiz(){
    if (running) return;
    const select = document.getElementById("questionCount");
    totalQuestions = parseInt(select.value, 10) || 10;

    if (!bank.length){
      await loadBank();
    }
    if (!bank.length){
      debug("No questions available");
      return;
    }

    if (totalQuestions > bank.length) {
      debug(`Requested ${totalQuestions} but only ${bank.length} available — using ${bank.length}`);
      totalQuestions = bank.length;
    }

    questions = shuffle(bank).slice(0, totalQuestions);
    currentIndex = 0;
    correct = 0;
    wrong = 0;
    running = true;

    // UI
    quizArea.classList.remove("hidden");
    resultArea.classList.add("hidden");
    updateStatus();
    showQuestion();
    debug("Quiz started");
  }

  // Show a question
  function showQuestion(){
    if (!running) return;
    if (currentIndex >= questions.length){
      finishQuiz();
      return;
    }
    const q = questions[currentIndex];
    questionText.textContent = `Q${currentIndex + 1}: ${q.question}`;
    optionsEl.innerHTML = "";

    // shuffle choices for this question
    const choices = shuffle(q.choices);
    choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option btn-option";
      btn.textContent = choice;
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", () => handleChoice(btn, choice, q.answer));
      optionsEl.appendChild(btn);
    });

    updateStatus();
  }

  // Handle a selected answer
  function handleChoice(button, selected, correctAnswer){
    // disable all choices
    const all = optionsEl.querySelectorAll("button.option");
    all.forEach(b => { b.disabled = true; b.setAttribute("aria-pressed", "false"); });

    if (selected === correctAnswer){
      button.classList.add("correct");
      button.setAttribute("aria-pressed", "true");
      correct++;
    } else {
      button.classList.add("wrong");
      wrong++;
      // highlight correct button
      all.forEach(b => {
        if (b.textContent === correctAnswer) {
          b.classList.add("correct");
        }
      });
    }

    updateStatus();

    // small delay to show feedback
    setTimeout(() => {
      currentIndex++;
      if (currentIndex < totalQuestions) {
        showQuestion();
      } else {
        finishQuiz();
      }
    }, 800);
  }

  // Update tracker/progress
  function updateStatus(){
    tracker.textContent = running ? `Question ${Math.min(currentIndex + 1, totalQuestions)} of ${totalQuestions}` : "Ready";
    correctCountEl.textContent = String(correct);
    wrongCountEl.textContent = String(wrong);
    leftCountEl.textContent = String(Math.max(0, totalQuestions - (currentIndex)));
    const pct = Math.round((currentIndex / totalQuestions) * 100);
    progressBar.style.width = `${pct}%`;
  }

  // Finish quiz
  function finishQuiz(){
    running = false;
    quizArea.classList.add("hidden");
    resultArea.classList.remove("hidden");
    const percent = Math.round((correct / totalQuestions) * 100);
    scoreText.textContent = `${correct} / ${totalQuestions} (${percent}%)`;
    updateStatus();
    loadLeaderboard();
    debug("Quiz finished");
  }

  // Save score to localStorage
  function saveScore(){
    const name = (usernameInput.value || "Anonymous").trim();
    const percent = Math.round((correct / totalQuestions) * 100);
    const entry = { name, score: `${correct}/${totalQuestions}`, percent, date: new Date().toLocaleDateString() };
    const list = JSON.parse(localStorage.getItem("chem_quiz_leaderboard") || "[]");
    list.push(entry);
    // sort by percent descending then keep top 20
    list.sort((a,b) => b.percent - a.percent);
    localStorage.setItem("chem_quiz_leaderboard", JSON.stringify(list.slice(0,20)));
    loadLeaderboard();
    debug(`Saved score for ${name}`);
  }

  // Load leaderboard to table
  function loadLeaderboard(){
    const list = JSON.parse(localStorage.getItem("chem_quiz_leaderboard") || "[]");
    leaderboardBody.innerHTML = "";
    list.forEach((e, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${i+1}</td><td>${escapeHtml(e.name)}</td><td>${escapeHtml(e.score)}</td><td>${escapeHtml(String(e.percent))}%</td><td>${escapeHtml(e.date)}</td>`;
      leaderboardBody.appendChild(tr);
    });
  }

  // Clear leaderboard
  function clearLeaderboard(){
    localStorage.removeItem("chem_quiz_leaderboard");
    loadLeaderboard();
    debug("Leaderboard cleared");
  }

  // Reset quiz UI & internal state
  function resetQuiz(){
    running = false;
    questions = [];
    currentIndex = 0;
    correct = 0;
    wrong = 0;
    quizArea.classList.add("hidden");
    resultArea.classList.add("hidden");
    questionText.textContent = "Click Start Quiz to begin";
    optionsEl.innerHTML = "";
    progressBar.style.width = "0%";
    updateStatus();
    debug("Quiz reset");
  }

  // Safe text escape
  function escapeHtml(str){
    return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  // Wire events
  startBtn.addEventListener("click", startQuiz);
  resetQuizBtn.addEventListener("click", resetQuiz);
  saveScoreBtn.addEventListener("click", saveScore);
  restartBtn.addEventListener("click", () => {
    resetQuiz();
    // keep bank loaded; user can change question count and start again
  });
  clearLeaderboardBtn.addEventListener("click", clearLeaderboard);

  // Init: load leaderboard and pre-load bank (non-blocking)
  loadLeaderboard();
  loadBank().then(() => debug("Ready — choose number of questions and Start."));
});
