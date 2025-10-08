// === INITIALISATION ===
let score = { left: 0, right: 0 };
let gameMode = null;
window.onload = function () { modeRetrieve(); };

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const leftPaddle = {
  x: 20,
  y: canvas.height / 2 - 40,
  width: 15,
  height: 80,
  speed: 350, // pixels/sec
  dy: 0
};

const rightPaddle = {
  x: canvas.width - 35,
  y: canvas.height / 2 - 40,
  width: 15,
  height: 80,
  speed: 350,
  dy: 0
};

const ball = {
  positionX: canvas.width / 2,
  positionY: canvas.height / 2,
  vitesseX: 500, // pixels/sec
  vitesseY: 200,
  width: 10,
  height: 10,
  resetTimeWhenScored: 1200, // ms
  exists: true
};

const keys = {};
document.addEventListener("keydown", (e) => { keys[e.key] = true; });
document.addEventListener("keyup", (e) => { keys[e.key] = false; });

// === FONCTIONS UTILITAIRES ===
function modeRetrieve() {
  gameMode = localStorage.getItem('mode') === null ? "RETRIEVE FAILED" : localStorage.getItem('mode');
  document.getElementById("mode").textContent = gameMode;
}

function gradientScore() {
  document.body.classList.add('blink');
  setTimeout(() => { document.body.classList.remove('blink'); }, 100);
}

// === AFFICHAGE ===
function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${score.left} - ${score.right}`, canvas.width / 2, 40);
}

function drawCenterLine() {
  ctx.strokeStyle = "white";
  ctx.beginPath();
  for (let y = 0; y < canvas.height; y += 20) {
    ctx.moveTo(canvas.width / 2, y);
    ctx.lineTo(canvas.width / 2, y + 10);
  }
  ctx.stroke();
}

function drawPaddle(paddle) {
  ctx.fillStyle = "white";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.fillStyle = "white";
  ctx.fillRect(ball.positionX, ball.positionY, ball.width, ball.height);
}

// === DEPLACEMENTS ===
function movePaddles(dt) {
  // Joueur gauche
  if (keys["z"]) leftPaddle.dy = -leftPaddle.speed;
  else if (keys["s"]) leftPaddle.dy = leftPaddle.speed;
  else leftPaddle.dy = 0;

  // Joueur droit
  if (gameMode === 'BOT') {
    // Bot imbattable 😈
    if (ball.positionY + ball.height / 2 < rightPaddle.y + rightPaddle.height / 2)
      rightPaddle.dy = -rightPaddle.speed;
    else if (ball.positionY + ball.height / 2 > rightPaddle.y + rightPaddle.height / 2)
      rightPaddle.dy = rightPaddle.speed;
    else
      rightPaddle.dy = 0;
  } else {
    if (keys["ArrowUp"]) rightPaddle.dy = -rightPaddle.speed;
    else if (keys["ArrowDown"]) rightPaddle.dy = rightPaddle.speed;
    else rightPaddle.dy = 0;
  }

  // Mise à jour des positions avec delta time
  leftPaddle.y += leftPaddle.dy * dt;
  rightPaddle.y += rightPaddle.dy * dt;

  // Limites
  leftPaddle.y = Math.max(0, Math.min(canvas.height - leftPaddle.height, leftPaddle.y));
  rightPaddle.y = Math.max(0, Math.min(canvas.height - rightPaddle.height, rightPaddle.y));
}

// === SCORE + RESET ===
function incrementScore(incrementLeft) {
  if (incrementLeft) score.left++;
  else score.right++;
}

// Reset complet de la balle après un point
function resetBall(scoredLeft) {
  ball.exists = false;
  gradientScore();

  // Remet au centre
  ball.positionX = canvas.width / 2;
  ball.positionY = canvas.height / 2;

  // Détermine la direction initiale
  ball.vitesseX = scoredLeft ? 500 : -500;
  ball.vitesseY = (Math.random() - 0.5) * 400; // petit angle aléatoire

  // Après une courte pause, la balle revient
  setTimeout(() => {
    ball.exists = true;
  }, ball.resetTimeWhenScored);
}

// === BALLE ===
function animateBall(dt) {
  ball.positionY += ball.vitesseY * dt;
  ball.positionX += ball.vitesseX * dt;

  // Sortie à droite → point gauche
  if (ball.positionX + ball.width >= canvas.width) {
    incrementScore(true);
    resetBall(true);
  }

  // Sortie à gauche → point droit
  if (ball.positionX <= 0) {
    incrementScore(false);
    resetBall(false);
  }

  // Rebonds haut/bas
  if (ball.positionY <= 0 || ball.positionY + ball.height >= canvas.height) {
    ball.vitesseY = -ball.vitesseY;
  }

  // Collision raquette gauche
  if (
    ball.positionX <= leftPaddle.x + leftPaddle.width &&
    ball.positionY + ball.height >= leftPaddle.y &&
    ball.positionY <= leftPaddle.y + leftPaddle.height
  ) {
    let hitPos = (ball.positionY + ball.height / 2) - (leftPaddle.y + leftPaddle.height / 2);
    ball.vitesseY = hitPos * 10;
    ball.vitesseX = Math.abs(ball.vitesseX);
  }

  // Collision raquette droite
  if (
    ball.positionX + ball.width >= rightPaddle.x &&
    ball.positionY + ball.height >= rightPaddle.y &&
    ball.positionY <= rightPaddle.y + rightPaddle.height
  ) {
    let hitPos = (ball.positionY + ball.height / 2) - (rightPaddle.y + rightPaddle.height / 2);
    ball.vitesseY = hitPos * 10;
    ball.vitesseX = -Math.abs(ball.vitesseX);
  }

  drawBall();
}

// === BOUCLE DE JEU AVEC DELTA TIME ===
let lastTime = performance.now();

function update(now = performance.now()) {
  const dt = (now - lastTime) / 1000; // secondes
  lastTime = now;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawCenterLine();
  drawScore();

  movePaddles(dt);
  drawPaddle(leftPaddle);
  drawPaddle(rightPaddle);

  if (ball.exists) animateBall(dt);

  requestAnimationFrame(update);
}

update();
