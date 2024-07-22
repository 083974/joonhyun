const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

let player = {
  x: canvas.width / 2 - 15,
  y: canvas.height - 60,
  width: 30,
  height: 30,
  color: 'blue',
  dx: 0,
  lives: 3,
  shield: false
};

let bullets = [];
let enemies = [];
let obstacles = [];
let keys = {};
let score = 0;

const shootSound = new Audio('shoot.wav');
const hitSound = new Audio('hit.wav');
const shieldSound = new Audio('shield.wav');
const powerAttackSound = new Audio('power_attack.wav');

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

function updatePlayer() {
  if (keys['ArrowRight']) player.dx = 5;
  else if (keys['ArrowLeft']) player.dx = -5;
  else player.dx = 0;

  if (keys[' ']) shootBullet();
  if (keys['s']) activateShield();
  if (keys['p']) powerAttack();

  player.x += player.dx;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

function shootBullet() {
  if (bullets.length < 1 || bullets[bullets.length - 1].y < player.y - 20) {
    bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y, width: 5, height: 10, color: 'red', dy: -5 });
    shootSound.play();
  }
}

function activateShield() {
  if (!player.shield) {
    player.shield = true;
    shieldSound.play();
    setTimeout(() => {
      player.shield = false;
    }, 5000); // 5초 동안 방패 유지
  }
}

function powerAttack() {
  bullets.push({ x: player.x - 25, y: player.y, width: 5, height: 10, color: 'yellow', dy: -5 });
  bullets.push({ x: player.x + player.width + 20, y: player.y, width: 5, height: 10, color: 'yellow', dy: -5 });
  powerAttackSound.play();
}

function updateBullets() {
  bullets.forEach((bullet, index) => {
    bullet.y += bullet.dy;
    if (bullet.y + bullet.height < 0) bullets.splice(index, 1);
  });
}

function updateEnemies() {
  if (Math.random() < 0.02) {
    enemies.push({ x: Math.random() * (canvas.width - 30), y: 0, width: 30, height: 30, color: getRandomColor(), dy: 3 });
  }

  enemies.forEach((enemy, index) => {
    enemy.y += enemy.dy;
    if (enemy.y > canvas.height) {
      enemies.splice(index, 1);
      if (!player.shield) {
        player.lives--;
        if (player.lives === 0) {
          alert('Game Over! Final Score: ' + score);
          document.location.reload();
        }
      }
    }
  });
}

function updateObstacles() {
  if (Math.random() < 0.01) {
    obstacles.push({ x: Math.random() * (canvas.width - 30), y: 0, width: 50, height: 20, color: 'gray', dy: 2 });
  }

  obstacles.forEach((obstacle, index) => {
    obstacle.y += obstacle.dy;
    if (obstacle.y > canvas.height) {
      obstacles.splice(index, 1);
    }
  });
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function checkCollisions() {
  bullets.forEach((bullet, bulletIndex) => {
    enemies.forEach((enemy, enemyIndex) => {
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        bullets.splice(bulletIndex, 1);
        enemies.splice(enemyIndex, 1);
        hitSound.play();
        score += 10;
      }
    });
  });

  obstacles.forEach((obstacle, index) => {
    if (
      player.x < obstacle.x + obstacle.width &&
      player.x + player.width > obstacle.x &&
      player.y < obstacle.y + obstacle.height &&
      player.y + player.height > obstacle.y
    ) {
      obstacles.splice(index, 1);
      if (!player.shield) {
        player.lives--;
        if (player.lives === 0) {
          alert('Game Over! Final Score: ' + score);
          document.location.reload();
        }
      }
    }
  });
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
  if (player.shield) {
    ctx.strokeStyle = 'lightblue';
    ctx.lineWidth = 5;
    ctx.strokeRect(player.x - 5, player.y - 5, player.width + 10, player.height + 10);
  }
}

function drawBullets() {
  bullets.forEach((bullet) => {
    ctx.fillStyle = bullet.color;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
}

function drawEnemies() {
  enemies.forEach((enemy) => {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });
}

function drawObstacles() {
  obstacles.forEach((obstacle) => {
    ctx.fillStyle = obstacle.color;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  });
}

function drawScore() {
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 10, 20);
}

function drawLives() {
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText('Lives: ' + player.lives, canvas.width - 90, 20);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function gameLoop() {
  clearCanvas();
  updatePlayer();
  updateBullets();
  updateEnemies();
  updateObstacles();
  checkCollisions();
  drawPlayer();
  drawBullets();
  drawEnemies();
  drawObstacles();
  drawScore();
  drawLives();
  requestAnimationFrame(gameLoop);
}

gameLoop();
