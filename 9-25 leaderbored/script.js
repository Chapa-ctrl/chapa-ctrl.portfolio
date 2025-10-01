const rowsPerPage = 10;
let currentPage = 1;
let players = [];

const leaderboardBody = document.getElementById("leaderboard-body");
const pageInfo = document.getElementById("page-info");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

function renderTable(page) {
  leaderboardBody.innerHTML = "";

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pagePlayers = players.slice(start, end);

  pagePlayers.forEach((player, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${start + index + 1}</td>
      <td><img class="avatar" src="${player.avatar_url}" alt="avatar"></td>
      <td>${player.name}</td>
      <td>${player.score}</td>
      <td>${player.level}</td>
      <td>${player.country}</td>
      <td>${player.join_date}</td>
    `;
    leaderboardBody.appendChild(row);
  });

  pageInfo.textContent = `Page ${page} of ${Math.ceil(players.length / rowsPerPage)}`;
  prevBtn.disabled = page === 1;
  nextBtn.disabled = end >= players.length;
}

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable(currentPage);
  }
});

nextBtn.addEventListener("click", () => {
  if (currentPage * rowsPerPage < players.length) {
    currentPage++;
    renderTable(currentPage);
  }
});

// Load players.json
fetch("players.json")
  .then(res => res.json())
  .then(data => {
    players = data.sort((a, b) => b.score - a.score);
    renderTable(currentPage);
  })
  .catch(err => console.error("Error loading players.json:", err));
