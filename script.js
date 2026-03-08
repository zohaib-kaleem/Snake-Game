const canvas = document.getElementById("snake-apple-game");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Start snake with length 4, horizontally to the right
let snake = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
  { x: 7, y: 10 },
];

let velocityX = 1; // default moving right
let velocityY = 0;

let apple = { x: 5, y: 5 };

let score = 0;
let running = false;
let dead = false;
let directionChanged = false;
let countdown = 0; // countdown timer in seconds

const scoreDisplay = document.getElementById("score");
const startBtn = document.getElementById("pause");
const restartBtn = document.getElementById("restart");

let gameLoopTimer = null; // for clearTimeout
let countdownTimer = null;

function gameLoop() {
  if (!running) return;

  update();
  draw();

  // Slow speed: 200ms per frame
  gameLoopTimer = setTimeout(gameLoop, 200);
}

function resetGame() {
  // Reset snake length and position
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 7, y: 10 },
  ];

  velocityX = 1;
  velocityY = 0;

  apple = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount),
  };

  score = 0;
  scoreDisplay.textContent = score;

  dead = false;
  countdown = 0;
  running = true;
  directionChanged = false;

  if (gameLoopTimer) clearTimeout(gameLoopTimer);
  if (countdownTimer) clearInterval(countdownTimer);

  gameLoop();
}

function update() {
  directionChanged = false;

  const head = {
    x: snake[0].x + velocityX,
    y: snake[0].y + velocityY,
  };

  // Wrap around edges
  if (head.x < 0) head.x = tileCount - 1;
  if (head.x >= tileCount) head.x = 0;
  if (head.y < 0) head.y = tileCount - 1;
  if (head.y >= tileCount) head.y = 0;

  // Check self collision first
  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return gameOver();
    }
  }

  snake.unshift(head);

  if (head.x === apple.x && head.y === apple.y) {
    score++;
    scoreDisplay.textContent = score;

    // Place apple somewhere new, avoid snake body
    do {
      apple = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
      };
    } while (snake.some((part) => part.x === apple.x && part.y === apple.y));
  } else {
    snake.pop();
  }
}

function draw() {
  const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bg.addColorStop(0, "#020617");
  bg.addColorStop(1, "#0f172a");

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();
  drawApple();
  drawSnake();

  if (dead && countdown > 0) {
    // Draw countdown message centered
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);

    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`Game Over! Restarting in ${countdown}`, canvas.width / 2, canvas.height / 2);
  }
}

function drawGrid() {
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;

  for (let i = 0; i < tileCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(canvas.width, i * gridSize);
    ctx.stroke();
  }
}

function drawApple() {
  const x = apple.x * gridSize + gridSize / 2;
  const y = apple.y * gridSize + gridSize / 2;
  const radius = gridSize / 2 - 2;

  const gradient = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, radius);
  gradient.addColorStop(0, "#ff8a8a");
  gradient.addColorStop(1, "#cc0000");

  ctx.fillStyle = gradient;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawSnake() {
  snake.forEach((part, index) => {
    const x = part.x * gridSize;
    const y = part.y * gridSize;

    const gradient = ctx.createLinearGradient(x, y, x + gridSize, y + gridSize);
    gradient.addColorStop(0, "#4ade80");
    gradient.addColorStop(1, "#166534");

    ctx.fillStyle = gradient;

    roundRect(x + 1, y + 1, gridSize - 2, gridSize - 2, 6);
    ctx.fill();

    if (index === 0) {
      // Draw eyes
      ctx.fillStyle = "white";

      ctx.beginPath();
      ctx.arc(x + 6, y + 6, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x + 14, y + 6, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "black";

      ctx.beginPath();
      ctx.arc(x + 6, y + 6, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x + 14, y + 6, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();

  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);

  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);

  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);

  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);

  ctx.closePath();
}

function gameOver() {
  dead = true;
  running = false;
  countdown = 3; // 3 seconds countdown

  if (gameLoopTimer) clearTimeout(gameLoopTimer);

  // Start countdown interval
  countdownTimer = setInterval(() => {
    countdown--;
    if (countdown <= 0) {
      clearInterval(countdownTimer);
      resetGame();
    }
    draw(); // redraw to update countdown text
  }, 1000);

  draw(); // initial draw to show game over immediately
}

document.addEventListener("keydown", (e) => {
  if (dead) {
    // Immediately cancel countdown and reset on any key
    if (countdownTimer) clearInterval(countdownTimer);
    resetGame();
    return;
  }

  if (directionChanged) return;

  switch (e.key.toLowerCase()) {
    case "arrowup":
    case "w":
      if (velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
        directionChanged = true;
      }
      break;

    case "arrowdown":
    case "s":
      if (velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
        directionChanged = true;
      }
      break;

    case "arrowleft":
    case "a":
      if (velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
        directionChanged = true;
      }
      break;

    case "arrowright":
    case "d":
      if (velocityX !== -1) {
        velocityX = 1;
        velocityY = 0;
        directionChanged = true;
      }
      break;
  }
});

startBtn.onclick = () => {
  if (!running) {
    running = true;
    gameLoop();
    startBtn.textContent = "Pause";
  } else {
    running = false;
    startBtn.textContent = "Start";
  }
};

restartBtn.onclick = () => {
  if (countdownTimer) clearInterval(countdownTimer);
  resetGame();
};

draw();