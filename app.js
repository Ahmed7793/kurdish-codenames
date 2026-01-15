// Kurdish Codenames — full rules-ish: Assassin = lose, Clue+Number guesses, End Turn, Reset board.
const WORDS = [
  "نان","ئاو","خانوو","بازاڕ","رێگا","کلیل","هاوڕێ","دوژمن","منداڵ","افرەت",
  "پیاو","سەرباز","شار","گوند","قوتابخانە","شاخ","ڕوبار","ترس","هێز","هیوا",
  "نهێنی","دەنگ","یاری","موزیک","هەڵپەڕکێ","تۆپ","ئاگر","سێبەر",
  "وڵات","سنوور","ئاڵا","جەنگ","ئاشتی","یاسا","دەسەڵات","شۆڕش",
  "سیخوڕ","جفرە","دۆسیە","تۆڕ","چاودێری","نامە","ناپاکی","تەڵە",
  "زریان","بیابان","دارستان","مانگ","خۆر","ئەستێرە","ڕەشەبا","بەرد",
  "بیرەوەری","مێشک","خەو","خەوی ترسناک","بێدەنگی","توڕەیی","گومان","بڕیار",
  "اوێنە","دەرگا","ماسک","دیوار","زنجیرە","برین"
];

// UI
const grid = document.getElementById("grid");
const newGameBtn = document.getElementById("newGame");
const resetBoardBtn = document.getElementById("resetBoard");
const spymasterToggle = document.getElementById("spymaster");

const redLeftEl = document.getElementById("redLeft");
const blueLeftEl = document.getElementById("blueLeft");
const neutralLeftEl = document.getElementById("neutralLeft");

const turnTeamEl = document.getElementById("turnTeam");
const starterTeamEl = document.getElementById("starterTeam");

const clueInput = document.getElementById("clueInput");
const numInput = document.getElementById("numInput");
const setClueBtn = document.getElementById("setClue");
const endTurnBtn = document.getElementById("endTurn");

const clueTextEl = document.getElementById("clueText");
const guessesLeftEl = document.getElementById("guessesLeft");

// Overlay
const overlay = document.getElementById("overlay");
const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");
const playAgain = document.getElementById("playAgain");
const closeOverlay = document.getElementById("closeOverlay");

let state = null;

function shuffle(arr){
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function uniqueWords(){
  const pool = WORDS.map(w => (w || "").trim()).filter(Boolean);
  return [...new Set(pool)];
}

// Roles: 9 starter team, 8 other, 7 neutral, 1 assassin (classic)
function makeRoles(starter){
  const roles = [];
  const starterCount = 9;
  const otherCount = 8;
  const other = starter === "red" ? "blue" : "red";

  for(let i=0;i<starterCount;i++) roles.push(starter);
  for(let i=0;i<otherCount;i++) roles.push(other);
  for(let i=0;i<7;i++) roles.push("neutral");
  roles.push("assassin");
  shuffle(roles);
  return roles;
}

function showOverlay(title, text){
  resultTitle.textContent = title;
  resultText.textContent = text;
  overlay.classList.remove("hidden");
}

function hideOverlay(){
  overlay.classList.add("hidden");
}

function setTurnPills(){
  turnTeamEl.textContent = state.turn.toUpperCase();
  turnTeamEl.style.borderColor = state.turn === "red" ? "rgba(255,77,77,.35)" : "rgba(77,125,255,.35)";
  turnTeamEl.style.color = state.turn === "red" ? "#ffb3b3" : "#b8c8ff";

  starterTeamEl.textContent = state.starter.toUpperCase();
  starterTeamEl.style.borderColor = state.starter === "red" ? "rgba(255,77,77,.25)" : "rgba(77,125,255,.25)";
}

function updateCounts(){
  redLeftEl.textContent = String(state.left.red);
  blueLeftEl.textContent = String(state.left.blue);
  neutralLeftEl.textContent = String(state.left.neutral);
}

function resetClue(){
  state.clue = "";
  state.number = 0;
  state.guessesLeft = 0;
  clueTextEl.textContent = "—";
  guessesLeftEl.textContent = "—";
}

function setClue(){
  const clue = (clueInput.value || "").trim();
  const n = Number(numInput.value);

  if(!clue || !Number.isFinite(n) || n < 0){
    alert("Enter a clue and a valid number.");
    return;
  }

  state.clue = clue;
  state.number = n;

  // Classic rule: guesses = number + 1
  state.guessesLeft = n + 1;

  clueTextEl.textContent = `${clue} / ${n}`;
  guessesLeftEl.textContent = String(state.guessesLeft);
}

function endTurn(){
  if(state.gameOver) return;
  state.turn = state.turn === "red" ? "blue" : "red";
  resetClue();
  render();
}

function reveal(i){
  if(state.gameOver) return;
  if(state.revealed[i]) return;

  state.revealed[i] = true;

  const role = state.roles[i];

  // Assassin = instant lose
  if(role === "assassin"){
    state.gameOver = true;
    render();
    showOverlay("💀 Assassin!", `${state.turn.toUpperCase()} team loses.`);
    return;
  }

  // Count left
  if(role === "red") state.left.red--;
  if(role === "blue") state.left.blue--;
  if(role === "neutral") state.left.neutral--;

  // Win check
  if(state.left.red === 0){
    state.gameOver = true;
    render();
    showOverlay("🏆 RED WINS", "Red team found all their words.");
    return;
  }
  if(state.left.blue === 0){
    state.gameOver = true;
    render();
    showOverlay("🏆 BLUE WINS", "Blue team found all their words.");
    return;
  }

  // Guess logic (only if clue set)
  if(state.guessesLeft > 0){
    state.guessesLeft--;
    guessesLeftEl.textContent = String(state.guessesLeft);
  }

  // If clicked a wrong color OR neutral, turn ends immediately (classic)
  const wrong =
    (state.turn === "red" && role !== "red") ||
    (state.turn === "blue" && role !== "blue");

  if(wrong){
    endTurn(); // will render + reset clue
    return;
  }

  // If guesses used up, force end turn
  if(state.guessesLeft === 0){
    endTurn();
    return;
  }

  render();
}

function render(){
  document.body.classList.toggle("spymaster", spymasterToggle.checked);

  setTurnPills();
  updateCounts();

  grid.innerHTML = "";

  state.words.forEach((w,i)=>{
    const card = document.createElement("div");
    const role = state.roles[i];

    card.className = `card ${role}${state.revealed[i] ? " revealed" : ""}`;
    card.textContent = w;

    card.onclick = () => reveal(i);
    grid.appendChild(card);
  });
}

function newGame(){
  const pool = uniqueWords();
  shuffle(pool);

  // ensure at least 25
  if(pool.length < 25){
    alert("Need at least 25 unique words in WORDS list.");
    return;
  }

  const starter = Math.random() < 0.5 ? "red" : "blue";
  const roles = makeRoles(starter);

  state = {
    words: pool.slice(0,25),
    roles,
    revealed: Array(25).fill(false),
    starter,
    turn: starter,
    left: {
      red: roles.filter(r => r === "red").length,
      blue: roles.filter(r => r === "blue").length,
      neutral: roles.filter(r => r === "neutral").length,
    },
    clue: "",
    number: 0,
    guessesLeft: 0,
    gameOver: false
  };

  resetClue();
  render();
}

function resetSameBoard(){
  if(!state) return;
  state.revealed = Array(25).fill(false);
  state.turn = state.starter;
  state.left = {
    red: state.roles.filter(r => r === "red").length,
    blue: state.roles.filter(r => r === "blue").length,
    neutral: state.roles.filter(r => r === "neutral").length,
  };
  state.gameOver = false;
  resetClue();
  hideOverlay();
  render();
}

// Events
newGameBtn.addEventListener("click", () => { hideOverlay(); newGame(); });
resetBoardBtn.addEventListener("click", () => resetSameBoard());

setClueBtn.addEventListener("click", () => setClue());
endTurnBtn.addEventListener("click", () => endTurn());

spymasterToggle.addEventListener("change", () => render());

playAgain.addEventListener("click", () => { hideOverlay(); newGame(); });
closeOverlay.addEventListener("click", () => hideOverlay());

// Start
newGame();
