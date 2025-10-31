// --- Datos constantes con ejemplos y tipos ---
const challenges = {
  verde: [
    "Sacarte una selfie con alguien que acabás de conocer. ",
    "Decir tres verdades y una mentira (y que adivinen). ",
    "Contar algo que hacías de chico y hoy te da vergüenza. ",
    "Tomar un trago sin usar las manos. ",
    "Decir algo que harías si volvieras a tener 20. ",
    "Inventá un nombre a tu trago. ",
    "“Modo DJ”: elegir el próximo tema, pero si el grupo no lo aprueba, perdés puntos. ",
    "Si fueras un trago, ¿cuál serías y por qué?",
    "Mostrá el sticker que más usas y actualo.",
    "Describir tu peor ruptura usando solo títulos de canciones."
  ],
  amarilla: [
    "Brindar y mirarse fijamente con alguien, hacerlo reír y el que aguanta la risa gana.",
    "Contar una anécdota vergonzosa de tus 20’s.",
    "Mostrá tu foto de DNI.",
    "Adivinar el año de una canción vieja.",
    "Inventá un eslogan para la fiesta.",
    "Decí el abecedario al revés (o morís en el intento 😅).",
    "Hacé una pose de yoga mientras brindás.",
    "Decí tu “crush famoso” sin dudar.",
    "Decí un trabalenguas tres veces rápido.",
    "Memorizá una frase que te digan y repetila al final de la ronda.",
    "Adiviná qué canción tararean.",
    "Tenés que hacer reír a alguien en menos de 20 segundos.",
    "Dejar que otra persona elija el fondo de pantalla de tu celu usalo toda la noche."
  ],
  roja: [
    "Tomar un shot sin hacer mueca (todos votan si lo lograste).",
    "Decir una verdad incómoda o responder una pregunta al estilo “verdad o shot”.",
    "Mostrar una foto vergonzosa de tu galería.",
    "Inventá una coreografía con una persona elegida al azar.",
    "Dejá que otro jugador lea el último mensaje que mandaste (con censura si querés).",
    "Hacé 5 flexiones… pero con tu vaso apoyado en la espalda.",
    "Improvisar un rap sobre los invitados.",
    "Crear un lema para la fiesta y gritarlo como un político en campaña.",
    "Intercambiar una prenda de ropa con alguna persona.",
    "Llamar a un número desconocido y pedir una pizza."
  ],
  bonus: [
    "Elige quien pierde 5 pts.",
    "Elije quienes hacen un brindis todos los 20’s. o +30. y suman 5 pts.",
    "“Desafío doble”: elegís a alguien y los dos hacen un reto juntos (Saca otra tarjeta).",
    "Contar tu recuerdo más gracioso o anécdota con el cumpleañero (aunque lo inventes)."
  ],
};
const cardTypes = [
  { key: "verde", title: "🟩 Verde", colorClass: "card-verde", points: 5, prob: 0.4 },
  { key: "amarilla", title: "🟨 Amarilla", colorClass: "card-amarilla", points: 10, prob: 0.3 },
  { key: "roja", title: "🟥 Roja", colorClass: "card-roja", points: 15, prob: 0.22 },
  { key: "bonus", title: "⭐ Bonus", colorClass: "card-bonus", points: 20, prob: 0.08 },
];

// --- Estado y variables ---
let players = [];
let scores = {};
let turnQueue = [];
let currentPlayer = "";
let roundNumber = 1;

// Elementos DOM usados frecuentemente
const nameInput = document.getElementById("name-input");
const addNameBtn = document.getElementById("add-name-btn");
const playerList = document.getElementById("player-list");
const startBtn = document.getElementById("start-btn");
const setupSection = document.getElementById("setup-section");
const gameSection = document.getElementById("game-section");
const cardArea = document.getElementById("card-area");
const turnIndicator = document.getElementById("turn-indicator");
const scoreboard = document.querySelector(".scoreboard");
const editSection = document.getElementById("edit-section");
const editList = document.getElementById("edit-list");
const finSection = document.getElementById("fin-section");
const finMsg = document.getElementById("fin-msg");
const finRanking = document.getElementById("fin-ranking");

// Botones controles
const editPointsBtn = document.getElementById("edit-points-btn");
const resetBtn = document.getElementById("reset-btn");
const finishBtn = document.getElementById("finish-btn");
const confirmEditBtn = document.getElementById("confirm-edit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const restartBtn = document.getElementById("restart-btn");

// --- Funciones UI y lógica ---

// Activar botón agregar solo si hay texto válido
nameInput.addEventListener("input", () => {
  addNameBtn.disabled = nameInput.value.trim() === "";
});

// Agregar jugador
addNameBtn.addEventListener("click", () => {
  let name = nameInput.value.trim().substring(0, 16);
  if (name !== "" && !players.includes(name)) {
    players.push(name);
    scores[name] = 0;
    nameInput.value = "";
    addNameBtn.disabled = true;
    renderPlayerList();
    toggleStartButton();
  }
  nameInput.focus();
});
// Permitir enter para agregar
nameInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter" && !addNameBtn.disabled) addNameBtn.click();
});

// Mostrar lista de jugadores en setup
function renderPlayerList() {
  playerList.innerHTML = "";
  players.forEach((p, idx) => {
    const li = document.createElement("li");
    li.textContent = p;
    // Botón eliminar jugador
    const rmBtn = document.createElement("button");
    rmBtn.className = "remove-player";
    rmBtn.setAttribute("aria-label", `Eliminar jugador ${p}`);
    rmBtn.textContent = "×";
    rmBtn.onclick = () => {
      players.splice(idx, 1);
      delete scores[p];
      renderPlayerList();
      toggleStartButton();
    };
    li.appendChild(rmBtn);
    playerList.appendChild(li);
  });
}

// Mostrar y habilitar botón Iniciar
function toggleStartButton() {
  startBtn.disabled = players.length < 2;
}

// Empieza la partida: ocultar setup, mostrar juego, inicializar cola y scores
startBtn.addEventListener("click", () => {
  if (players.length < 2) return;
  roundNumber = 1;
  resetScores();
  shuffleTurnQueue();
  setupSection.style.display = "none";
  gameSection.style.display = "flex";
  finSection.style.display = "none";
  displayScoreboard();
  displayCurrentTurn();
  showNextCard();
});

// Resetea puntajes a 0
function resetScores() {
  players.forEach(p => {
    scores[p] = 0;
  });
}

// Baraja el array jugadores para la ronda actual
function shuffleTurnQueue() {
  turnQueue = [...players];
  for (let i = turnQueue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [turnQueue[i], turnQueue[j]] = [turnQueue[j], turnQueue[i]];
  }
}

// Actualiza el marcador con el estado actual y resalta jugador activo
function displayScoreboard() {
  scoreboard.innerHTML = "";
  // Ordenar por puntaje de mayor a menor
  const sortedPlayers = [...players].sort((a, b) => scores[b] - scores[a]);
  sortedPlayers.forEach(player => {
    const div = document.createElement("div");
    div.className = "score-player";
    if (player === currentPlayer) div.classList.add("current");
    div.innerHTML = `
      <span class="player-name">${player}</span>
      <span class="points">${scores[player]}</span>
    `;
    scoreboard.appendChild(div);
  });
}


// Actualiza indicador con el jugador actual y ronda
function displayCurrentTurn() {
  turnIndicator.textContent = `Turno de: ${currentPlayer} | Ronda ${roundNumber}`;
}

// Escoger tipo de carta basado en probabilidad
function pickRandomCardType() {
  let rnd = Math.random();
  let accum = 0;
  for (const card of cardTypes) {
    accum += card.prob;
    if (rnd < accum) return card;
  }
  return cardTypes[0]; // fallback
}

// Muestra tarjeta y crea botones de interacción
function showNextCard() {
  if (turnQueue.length === 0) {
    roundNumber++;
    shuffleTurnQueue();
  }
  currentPlayer = turnQueue.shift();
  displayScoreboard();
  displayCurrentTurn();

  const card = pickRandomCardType();
  const textArr = challenges[card.key];
  const challengeText = textArr[Math.floor(Math.random() * textArr.length)];

  cardArea.className = `card-area ${card.colorClass}`;
  cardArea.style.animation = "none"; // reiniciar animación
  cardArea.offsetHeight; // fuerza reflow
  cardArea.style.animation = null;

  cardArea.innerHTML = `
    <div class="card-type-title">${card.title} (${card.points} pts)</div>
    <div class="card-text">${challengeText}</div>
    <div class="btn-group" role="group" aria-label="Acciones para ${currentPlayer}">
      <button class="btn-action btn-success" id="btn-fulfilled" aria-label="Cumplió el reto, sumar puntos">✅ Cumplió</button>
      <button class="btn-action btn-fail" id="btn-notfulfilled" aria-label="No cumplió el reto, no sumar puntos">❌ No cumplió</button>
    </div>
  `;

  document.getElementById("btn-fulfilled").onclick = () => {
    scores[currentPlayer] += card.points;
    advanceTurn();
  };
  document.getElementById("btn-notfulfilled").onclick = () => {
    advanceTurn();
  };
}

// Avanza la ronda y muestra la siguiente tarjeta o fin si se desea
function advanceTurn() {
  if (players.length === 0) return;
  if (turnQueue.length === 0) {
    roundNumber++;
    shuffleTurnQueue();
  }
  showNextCard();
}

// Botón editar puntos abrir panel modal editSection
editPointsBtn.addEventListener("click", () => {
  populateEditList();
  editSection.style.display = "flex";
  gameSection.style.display = "none";
  finSection.style.display = "none";
});

// Población lista de edición de puntos con controles +/-
function populateEditList() {
  editList.innerHTML = "";
  players.forEach(p => {
    const div = document.createElement("div");
    div.className = "edit-player-row";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = p;
    nameSpan.className = "edit-player-name";

    const pointsSpan = document.createElement("span");
    pointsSpan.textContent = scores[p];
    pointsSpan.className = "edit-points-value";
    pointsSpan.id = `edit-points-${p}`;

    const btnGroup = document.createElement("div");
    btnGroup.className = "edit-btn-group";

    const decBtn = document.createElement("button");
    decBtn.className = "edit-btn-small";
    decBtn.setAttribute("aria-label", `Restar punto a ${p}`);
    decBtn.textContent = "−";
    decBtn.onclick = () => {
      if (scores[p] > 0) {
        scores[p]--;
        pointsSpan.textContent = scores[p];
        displayScoreboard();
      }
    };

    const incBtn = document.createElement("button");
    incBtn.className = "edit-btn-small";
    incBtn.setAttribute("aria-label", `Sumar punto a ${p}`);
    incBtn.textContent = "+";
    incBtn.onclick = () => {
      scores[p]++;
      pointsSpan.textContent = scores[p];
      displayScoreboard();
    };

    btnGroup.appendChild(decBtn);
    btnGroup.appendChild(incBtn);

    div.appendChild(nameSpan);
    div.appendChild(pointsSpan);
    div.appendChild(btnGroup);

    editList.appendChild(div);
  });
}

// Guardar cambios (ya está actualizado en scores) y regresar al juego
confirmEditBtn.addEventListener("click", () => {
  editSection.style.display = "none";
  gameSection.style.display = "flex";
  displayScoreboard();
  displayCurrentTurn();
});
cancelEditBtn.addEventListener("click", () => {
  editSection.style.display = "none";
  gameSection.style.display = "flex";
});

// Reiniciar juego con mismos jugadores, reset puntos y mezcla turnos
resetBtn.addEventListener("click", () => {
  roundNumber = 1;
  resetScores();
  shuffleTurnQueue();
  displayScoreboard();
  displayCurrentTurn();
  showNextCard();
  setupSection.style.display = "none";
  finSection.style.display = "none";
  gameSection.style.display = "flex";
  editSection.style.display = "none";
  nameInput.focus();
});

// Finalizar juego: mostrar ranking y ganador
finishBtn.addEventListener("click", () => {
  gameSection.style.display = "none";
  editSection.style.display = "none";
  finSection.style.display = "flex";
  showFinalResults();
});

// Mostrar resultados finales ordenados
function showFinalResults() {
  const ranking = [...players]
    .map(p => ({ name: p, points: scores[p] }))
    .sort((a, b) => b.points - a.points);

  const maxPoints = ranking[0]?.points || 0;
  const winners = ranking.filter(p => p.points === maxPoints).map(p => p.name);

  finMsg.textContent =
    winners.length === 1
      ? `¡Ganador/a: ${winners[0]} con ${maxPoints} puntos! 🏆`
      : `¡Empate entre: ${winners.join(", ")} (${maxPoints} pts)! 🎉`;

  let ol = "<ol>";
  ranking.forEach(p => {
    ol += `<li>${p.name} — <b>${p.points}</b> pts</li>`;
  });
  ol += "</ol>";
  finRanking.innerHTML = ol;
}

// Reiniciar juego completamente (limpia todo y vuelve a setup)
restartBtn.addEventListener("click", () => {
  players = [];
  scores = {};
  turnQueue = [];
  currentPlayer = "";
  roundNumber = 1;
  playerList.innerHTML = "";
  nameInput.value = "";
  addNameBtn.disabled = true;
  toggleStartButton();
  finSection.style.display = "none";
  setupSection.style.display = "flex";
  gameSection.style.display = "none";
  editSection.style.display = "none";
  nameInput.focus();
});

// Inicialización: enfocar input y deshabilitar botones innecesarios
window.onload = () => {
  nameInput.focus();
  addNameBtn.disabled = true;
  startBtn.disabled = true;
};
