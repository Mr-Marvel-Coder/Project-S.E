const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Images
const playerImg = new Image();
playerImg.src = "player.png";

const enemyImg = new Image();
enemyImg.src = "enemy.png";

const effectsImg = new Image();
effectsImg.src = "effects.png";

// Player
let player = {
  x: canvas.width / 2,
  y: canvas.height - 120,
  size: 80,
  speed: 5,
  hp: 100,
  frame: 0
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
let effects = [];

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

  // Muzzle flash
  effects.push({
    x: player.x + Math.cos(angle) * 40,
    y: player.y + Math.sin(angle) * 40,
    life: 10,
    type: "muzzle"
  });
}

// Enemies
let enemies = [];
let wave = 1;
let score = 0;

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

  if (player.y < canvas.height / 2) player.y = canvas.height / 2;
}

// Bullets
function updateBullets() {
  bullets.forEach((b, i) => {
    b.x += b.dx;
    b.y += b.dy;

    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
      bullets.splice(i, 1);
    }
  });
}

// Enemies
function updateEnemies() {
  enemies.forEach((e, i) => {
    let angle = Math.atan2(player.y - e.y, player.x - e.x);
    e.x += Math.cos(angle) * e.speed;
    e.y += Math.sin(angle) * e.speed;

    if (Math.hypot(player.x - e.x, player.y - e.y) < 50) {
      player.hp -= 10;
      enemies.splice(i, 1);
    }
  });
}

// Collision
function checkCollisions() {
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if (Math.hypot(b.x - e.x, b.y - e.y) < 40) {

        // Explosion effect
        effects.push({
          x: e.x,
          y: e.y,
          life: 20,
          type: "explosion"
        });

        bullets.splice(bi, 1);
        enemies.splice(ei, 1);
        score += 10;
      }
    });
  });
}

// Effects
function updateEffects() {
  effects.forEach((ef, i) => {
    ef.life--;
    if (ef.life <= 0) effects.splice(i, 1);
  });
}

// Draw Player
function drawPlayer() {
  let angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);

  player.frame += 0.1;
  let scale = 1 + Math.sin(player.frame) * 0.05;

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(angle + Math.PI / 2);
  ctx.scale(scale, scale);
  ctx.drawImage(playerImg, -40, -40, 80, 80);
  ctx.restore();
}

// Draw Enemies
function drawEnemies() {
  enemies.forEach(e => {
    let angle = Math.atan2(player.y - e.y, player.x - e.x);

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(angle + Math.PI / 2);
    ctx.drawImage(enemyImg, -30, -30, 60, 60);
    ctx.restore();
  });
}

// Draw Bullets
function drawBullets() {
  bullets.forEach(b => {
    let color = wave % 5 === 0 ? "orange" : "yellow";

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

// Draw Effects
function drawEffects() {
  effects.forEach(ef => {
    if (ef.type === "explosion") {
      ctx.fillStyle = "orange";
      ctx.beginPath();
      ctx.arc(ef.x, ef.y, 20 - ef.life, 0, Math.PI * 2);
      ctx.fill();
    }

    if (ef.type === "muzzle") {
      ctx.fillStyle = "yellow";
      ctx.beginPath();
      ctx.arc(ef.x, ef.y, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// UI
function updateUI() {
  document.getElementById("wave").innerText = "Wave: " + wave;
  document.getElementById("score").innerText = "Score: " + score;
  document.getElementById("hpFill").style.width = player.hp + "%";
}

// Power up
function applyPowerUp() {
  if (wave === 2) player.speed += 1;
}

// Game Loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  movePlayer();
  updateBullets();
  updateEnemies();
  checkCollisions();
  updateEffects();

  drawPlayer();
  drawEnemies();
  drawBullets();
  drawEffects();

  updateUI();

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
