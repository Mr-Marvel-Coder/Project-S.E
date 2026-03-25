const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Images
const playerImg = new Image();
playerImg.src = "file:///D:/Git Demo/1 SHOWS/soldier.png";

const enemyImg = new Image();
enemyImg.src = "file:///D:/Git Demo/1 SHOWS/enemy.png";

// Player
let player = {
  x: canvas.width / 2,
  y: canvas.height - 120,
  size: 80,
  speed: 5,
  hp: 100
};

// Controls
let keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// Mouse
let mouse = { x: 0, y: 0 };
canvas.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// Shooting
let bullets = [];
canvas.addEventListener("click", () => shoot());

function shoot() {
  let angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);

  bullets.push({
    x: player.x,
    y: player.y,
    dx: Math.cos(angle) * 10,
    dy: Math.sin(angle) * 10,
    size: 6
  });
}

// Enemies
let enemies = [];
let wave = 1;
let score = 0;

// Spawn enemies from top
function spawnEnemies() {
  for (let i = 0; i < wave * 2; i++) {
    enemies.push({
      x: Math.random() * canvas.width,
      y: -50,
      size: 60,
      speed: 1 + wave * 0.2
    });
  }
}

// Movement
function movePlayer() {
  if (keys["w"]) player.y -= player.speed;
  if (keys["s"]) player.y += player.speed;
  if (keys["a"]) player.x -= player.speed;
  if (keys["d"]) player.x += player.speed;

  // Restrict to bottom area
  if (player.y < canvas.height / 2) player.y = canvas.height / 2;
}

// Update bullets
function updateBullets() {
  bullets.forEach((b, i) => {
    b.x += b.dx;
    b.y += b.dy;

    // Remove off screen
    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
      bullets.splice(i, 1);
    }
  });
}

// Update enemies
function updateEnemies() {
  enemies.forEach((e, i) => {
    e.y += e.speed;

    // Collision with player
    if (Math.hypot(player.x - e.x, player.y - e.y) < 50) {
      player.hp -= 10;
      enemies.splice(i, 1);
    }

    // Remove if off screen
    if (e.y > canvas.height) enemies.splice(i, 1);
  });
}

// Collision bullets
function checkCollisions() {
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if (Math.hypot(b.x - e.x, b.y - e.y) < 40) {
        bullets.splice(bi, 1);
        enemies.splice(ei, 1);
        score += 10;
      }
    });
  });
}

// Power ups after wave 2
function applyPowerUp() {
  if (wave === 2) {
    player.speed += 1;
  }
}

// Drawing
function drawPlayer() {
  ctx.drawImage(playerImg, player.x - 40, player.y - 40, 80, 80);
}

function drawEnemies() {
  enemies.forEach(e => {
    ctx.drawImage(enemyImg, e.x - 30, e.y - 30, 60, 60);
  });
}

function drawBullets() {
  bullets.forEach(b => {
    ctx.fillStyle = wave % 5 === 0 ? "orange" : "yellow";
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

// UI
function updateUI() {
  document.getElementById("wave").innerText = "Wave: " + wave;
  document.getElementById("score").innerText = "Score: " + score;

  document.getElementById("hpFill").style.width = player.hp + "%";
}

// Game Loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  movePlayer();
  updateBullets();
  updateEnemies();
  checkCollisions();

  drawPlayer();
  drawEnemies();
  drawBullets();

  updateUI();

  // Next wave
  if (enemies.length === 0) {
    wave++;
    applyPowerUp();
    spawnEnemies();
  }

  requestAnimationFrame(gameLoop);
}

// Start
spawnEnemies();
gameLoop();