const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

const ROW = 20;
const COL = 10;
const SQ = 30;
const VACANT = "black";

let score = 0;
let linesCleared = 0;
let level = 1;

function updateScore() {
  document.getElementById("score").innerText = "Score: " + score;
}

function updateLevel() {
  document.getElementById("level").innerText = "Level: " + level;
}

let board = [];
for (let r = 0; r < ROW; r++) {
  board[r] = [];
  for (let c = 0; c < COL; c++) {
    board[r][c] = VACANT;
  }
}

function updateHighscore() {
  let highscore = localStorage.getItem("highscore") || 0;
  if (score > highscore) {
    localStorage.setItem("highscore", score);
    highscore = score;
  }
  document.getElementById("highscore").innerText = "Highscore: " + highscore;
}

function drawSquare(x, y, color) {
  context.fillStyle = color;
  context.fillRect(x * SQ, y * SQ, SQ, SQ);
  context.strokeStyle = "white";
  context.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

function drawBoard() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let r = 0; r < ROW; r++) {
    for (let c = 0; c < COL; c++) {
      drawSquare(c, r, board[r][c]);
    }
  }
}

drawBoard();
updateHighscore();

const PIECES = [
  [
    [
      [
        [1, 1, 0],
        [0, 1, 1],
      ],
      [
        [0, 1],
        [1, 1],
        [1, 0],
      ],
    ], // Z-shape rotations
    "#FF5733",
  ],
  [
    [
      [
        [0, 1, 1],
        [1, 1, 0],
      ],
      [
        [1, 0],
        [1, 1],
        [0, 1],
      ],
    ], // S-shape rotations
    "#33FF57",
  ],
  [
    [
      [
        [1, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 1],
        [1, 1],
        [0, 1],
      ],
      [
        [0, 1, 0],
        [1, 1, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 0],
      ],
    ], // T-shape
    "#FFC300",
  ],
  [
    [
      [
        [1, 0, 0],
        [1, 1, 1],
      ],
      [
        [1, 1],
        [1, 0],
        [1, 0],
      ],
      [
        [1, 1, 1],
        [0, 0, 1],
      ],
      [
        [0, 1],
        [0, 1],
        [1, 1],
      ],
    ], // L-shape
    "#3357FF",
  ],
  [
    [
      [
        [0, 0, 1],
        [1, 1, 1],
      ],
      [
        [1, 1],
        [0, 1],
        [0, 1],
      ],
      [
        [1, 1, 1],
        [1, 0, 0],
      ],
      [
        [1, 0],
        [1, 0],
        [1, 1],
      ],
    ], // Reverse L-shape
    "#A933FF",
  ],
  [
    [[[1, 1, 1, 1]], [[1], [1], [1], [1]]], // I-shape
    "#33FFF5",
  ],
  [
    [
      [
        [1, 1],
        [1, 1],
      ],
    ], // O-shape
    "#FF33B5",
  ],
];

function randomPiece() {
  const r = Math.floor(Math.random() * PIECES.length);
  return new Piece(PIECES[r][0], PIECES[r][1]);
}

class Piece {
  constructor(tetromino, color) {
    this.tetromino = tetromino;
    this.color = color;
    this.currentRotationIndex = 0;
    this.activeTetromino = this.tetromino[this.currentRotationIndex];
    this.x = 3;
    this.y = -2;
  }

  fill(color) {
    for (let r = 0; r < this.activeTetromino.length; r++) {
      for (let c = 0; c < this.activeTetromino[r].length; c++) {
        if (this.activeTetromino[r][c]) {
          drawSquare(this.x + c, this.y + r, color);
        }
      }
    }
  }

  draw() {
    this.fill(this.color);
  }

  undraw() {
    this.fill(VACANT);
  }

  moveDown() {
    if (!this.collision(0, 1, this.activeTetromino)) {
      this.undraw();
      this.y++;
      this.draw();
      score += 1;
      updateScore();
    } else {
      this.lock();
      p = randomPiece();
    }
  }

  moveRight() {
    if (!this.collision(1, 0, this.activeTetromino)) {
      this.undraw();
      this.x++;
      this.draw();
    }
  }

  moveLeft() {
    if (!this.collision(-1, 0, this.activeTetromino)) {
      this.undraw();
      this.x--;
      this.draw();
    }
  }

  rotate() {
    const nextRotationIndex =
      (this.currentRotationIndex + 1) % this.tetromino.length;
    const nextRotation = this.tetromino[nextRotationIndex];
    if (!this.collision(0, 0, nextRotation)) {
      this.undraw();
      this.currentRotationIndex = nextRotationIndex;
      this.activeTetromino = nextRotation;
      this.draw();
    }
  }

  lock() {
    for (let r = 0; r < this.activeTetromino.length; r++) {
      for (let c = 0; c < this.activeTetromino[r].length; c++) {
        if (!this.activeTetromino[r][c]) continue;
        if (this.y + r < 0) {
          saveHighScore();
          alert("Game Over! Score: " + score);
          board = Array.from({ length: ROW }, () => Array(COL).fill(VACANT));
          score = 0;
          linesCleared = 0;
          level = 1;
          updateScore();
          updateLevel();
          drawBoard();
          return;
        }
        board[this.y + r][this.x + c] = this.color;
      }
    }
    let clearedLines = this.removeFullLines();
    score += this.calculateScoreForLines(clearedLines);
    linesCleared += clearedLines;

    if (linesCleared >= 10) {
      level++;
      linesCleared = 0;
      updateLevel();
    }

    drawBoard();
  }

  removeFullLines() {
    let fullLines = 0;
    outer: for (let r = ROW - 1; r >= 0; r--) {
      for (let c = 0; c < COL; c++) {
        if (board[r][c] === VACANT) {
          continue outer;
        }
      }
      board.splice(r, 1);
      board.unshift(Array(COL).fill(VACANT));
      fullLines++;
    }
    return fullLines;
  }

  calculateScoreForLines(lines) {
    switch (lines) {
      case 1:
        return 100;
      case 2:
        return 300;
      case 3:
        return 500;
      case 4:
        return 800;
      default:
        return 0;
    }
  }

  collision(x, y, piece) {
    for (let r = 0; r < piece.length; r++) {
      for (let c = 0; c < piece[r].length; c++) {
        if (!piece[r][c]) continue;
        let newX = this.x + c + x;
        let newY = this.y + r + y;
        if (newX < 0 || newX >= COL || newY >= ROW) return true;
        if (newY < 0) continue;
        if (board[newY][newX] !== VACANT) return true;
      }
    }
    return false;
  }
}

let p = randomPiece();

document.addEventListener("keydown", (event) => {
  if (event.keyCode == 37) p.moveLeft();
  else if (event.keyCode == 38) p.rotate();
  else if (event.keyCode == 39) p.moveRight();
  else if (event.keyCode == 40) p.moveDown();
  else if (event.keyCode == 32) {
    while (!p.collision(0, 1, p.activeTetromino)) {
      p.moveDown();
      score += 2;
    }
    p.lock();
    p = randomPiece();
  }
});

let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
});

canvas.addEventListener("touchend", (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;

  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX > 0) {
      p.moveRight();
    } else {
      p.moveLeft();
    }
  } else {
    if (diffY > 0) {
      p.moveDown();
    } else {
      p.rotate();
    }
  }
});

let dropStart = Date.now();
function drop() {
  let now = Date.now();
  let delta = now - dropStart;
  const dropInterval = 1000 - (level - 1) * 100;
  if (delta > dropInterval) {
    p.moveDown();
    dropStart = Date.now();
  }
  requestAnimationFrame(drop);
}

drop();

function saveHighScore() {
  const username = prompt("Your name:");
  if (username) {
    fetch("/api/tetris/highscore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: username, score: score }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        updateHighscore();
      })
      .catch((error) => console.error("Failed to save highscore:", error));
  }
}
function loadHighscores() {
  fetch("/api/tetris/highscores")
    .then((response) => response.json())
    .then((data) => {
      let highscoreText = "Top 10 Highscores: ";
      highscoreText += data
        .map((entry, index) => `${index + 1}. ${entry.name}: ${entry.score}`)
        .join(", ");
      document.getElementById("highscores").innerText = highscoreText;
    })
    .catch((error) => console.error("Failed to get highscores:", error));
}
loadHighscores();
