let score = { left: 0, right: 0 };
let gameMode = null;
window.onload = function () { modeRetrieve(); };

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const leftPaddle = { x: 20, y: canvas.height / 2 - 40, width: 15, height: 80, speed: 350, dy: 0 };
const rightPaddle = { x: canvas.width - 35, y: canvas.height / 2 - 40, width: 15, height: 80, speed: 350, dy: 0 };

const ball = { positionX: canvas.width / 2, positionY: canvas.height / 2, vitesseX: 500, vitesseY: 200, width: 10, height: 10, resetTimeWhenScored: 1200, exists: true };

const keys = {};
document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

let bonus = null;
function spawnBonus() {
  if (!bonus) {
    bonus = { x: Math.random() * (canvas.width - 4), y: Math.random() * (canvas.height - 4), width: 10, height: 10, color: "red", duration: 15000 };
  }
  setTimeout(spawnBonus, 8000 + Math.random() * 4000);
}
spawnBonus();

function modeRetrieve() {
  gameMode = localStorage.getItem('mode') === null ? "RETRIEVE FAILED" : localStorage.getItem('mode');
  document.getElementById("mode").textContent = gameMode;
}

function gradientScore() { document.body.classList.add('blink'); setTimeout(() => document.body.classList.remove('blink'), 100); }

function isColliding(a, b) {
  return (a.positionX < b.x + b.width && a.positionX + a.width > b.x && a.positionY < b.y + b.height && a.positionY + a.height > b.y);
}

function drawScore() { ctx.fillStyle = "white"; ctx.font = "30px Arial"; ctx.textAlign = "center"; ctx.fillText(`${score.left} - ${score.right}`, canvas.width / 2, 40); }

function drawCenterLine() { ctx.strokeStyle = "white"; ctx.beginPath(); for (let y = 0; y < canvas.height; y += 20) { ctx.moveTo(canvas.width / 2, y); ctx.lineTo(canvas.width / 2, y + 10); } ctx.stroke(); }

function drawPaddle(p) { ctx.fillStyle = "white"; ctx.fillRect(p.x, p.y, p.width, p.height); }

function drawBall() { ctx.fillStyle = "white"; ctx.fillRect(ball.positionX, ball.positionY, ball.width, ball.height); }

function drawBonus() { if (bonus) { ctx.fillStyle = bonus.color; ctx.fillRect(bonus.x, bonus.y, bonus.width, bonus.height); } }

function movePaddles(dt) {
  if (keys["z"]) leftPaddle.dy = -leftPaddle.speed;
  else if (keys["s"]) leftPaddle.dy = leftPaddle.speed;
  else leftPaddle.dy = 0;

  if (gameMode === 'BOT') {
    if (ball.positionY + ball.height / 2 < rightPaddle.y + rightPaddle.height / 2) rightPaddle.dy = -rightPaddle.speed;
    else if (ball.positionY + ball.height / 2 > rightPaddle.y + rightPaddle.height / 2) rightPaddle.dy = rightPaddle.speed;
    else rightPaddle.dy = 0;
  } else {
    if (keys["ArrowUp"]) rightPaddle.dy = -rightPaddle.speed;
    else if (keys["ArrowDown"]) rightPaddle.dy = rightPaddle.speed;
    else rightPaddle.dy = 0;
  }

  leftPaddle.y += leftPaddle.dy * dt;
  rightPaddle.y += rightPaddle.dy * dt;

  leftPaddle.y = Math.max(0, Math.min(canvas.height - leftPaddle.height, leftPaddle.y));
  rightPaddle.y = Math.max(0, Math.min(canvas.height - rightPaddle.height, rightPaddle.y));
}

function incrementScore(left) { if (left) score.left++; else score.right++; }

function resetBall(scoredLeft) {
  ball.exists = false;
  gradientScore();
  ball.positionX = canvas.width / 2;
  ball.positionY = canvas.height / 2;
  ball.vitesseX = scoredLeft ? 500 : -500;
  ball.vitesseY = (Math.random() - 0.5) * 400;
  setTimeout(() => ball.exists = true, ball.resetTimeWhenScored);
}

function checkBonusCollision() {
  if (bonus && isColliding(ball, bonus)) {
    const originalVX = ball.vitesseX;
    const originalVY = ball.vitesseY;
    ball.vitesseX *= 3;
    ball.vitesseY *= 3;
    const duration = bonus.duration;
    bonus = null;
    setTimeout(() => {
      const dirX = ball.vitesseX / Math.abs(ball.vitesseX);
      ball.vitesseX = dirX * Math.abs(originalVX);
      ball.vitesseY = originalVY;
    }, duration);
  }
}

function animateBall(dt) {
  ball.positionY += ball.vitesseY * dt;
  ball.positionX += ball.vitesseX * dt;

  if (ball.positionX + ball.width >= canvas.width) { incrementScore(true); resetBall(true); }
  if (ball.positionX <= 0) { incrementScore(false); resetBall(false); }

  if (ball.positionY <= 0 || ball.positionY + ball.height >= canvas.height) ball.vitesseY = -ball.vitesseY;

  if (isColliding(ball, leftPaddle)) {
    let hitPos = (ball.positionY + ball.height / 2) - (leftPaddle.y + leftPaddle.height / 2);
    ball.vitesseY = hitPos * 10;
    ball.vitesseX = Math.abs(ball.vitesseX);
  }
  if (isColliding(ball, rightPaddle)) {
    let hitPos = (ball.positionY + ball.height / 2) - (rightPaddle.y + rightPaddle.height / 2);
    ball.vitesseY = hitPos * 10;
    ball.vitesseX = -Math.abs(ball.vitesseX);
  }
}

let lastTime = performance.now();
function update(now = performance.now()) {
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawCenterLine();
  drawScore();
  movePaddles(dt);
  drawPaddle(leftPaddle);
  drawPaddle(rightPaddle);

  if (ball.exists) {
    animateBall(dt);
    checkBonusCollision();
  }

  drawBall();
  drawBonus();

  requestAnimationFrame(update);
}
update();
