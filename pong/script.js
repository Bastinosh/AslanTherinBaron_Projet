//init le score
let score = { left: 0 , right: 0 };

let gameMode = null;
window.onload = function () {modeRetrieve()};

//canvas represente la zone de jeu avec l'id gameCanvas
const canvas = document.getElementById("gameCanvas");
//ctx va obtenir les methode et rendu 2d 
const ctx = canvas.getContext("2d");

// Raquette gauche
const leftPaddle = {
  x: 20, //pos horizontal
  y: canvas.height / 2 - 40, //pos vertical centrer par rapport au centre du canvas
  width: 15, 
  height: 80,
  speed: 5,
  dy: 0 //vitesse vertical
};

// Raquette droite
const rightPaddle = {
  x: canvas.width - 35,
  y: canvas.height / 2 - 40,
  width: 15,
  height: 80,
  speed: 5,
  dy: 0
};

const ball ={
  positionX: canvas.width/2,
  positionY: canvas.height/2,
  vitesseX: 8,
  vitesseY: 3,
  solX: canvas.width,
  solY: canvas.height, // Position Y du sol
  width: 10,
  height: 10,

}

// objet vide pour inserer les touche appuiyer
const keys = {};

//ajoute un evennement a keys quand une touche est appuiyer
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function modeRetrieve()
{
    gameMode = localStorage.getItem('mode') === null ? "RETRIEVE FAILED" : localStorage.getItem('mode');
    document.getElementById("mode").textContent = gameMode;
}

function gradientScore()
{
    document.body.classList.add('blink')
    window.setTimeout(function() {
        document.body.classList.remove('blink')
    }, 100)
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${score.left} - ${score.right}`, canvas.width / 2, 40); //affiche le score
}

//fonction qui gere les deplacement 
function movePaddles() {
  // Joueur gauche : touches Z et S
  if (keys["z"]) {
    leftPaddle.dy = -leftPaddle.speed;
  } else if (keys["s"]) {
    leftPaddle.dy = leftPaddle.speed;
  } else {
    leftPaddle.dy = 0;
  }

  // Joueur droit
  if (gameMode === 'BOT') {
    // Bot qui suit la balle 
    if (ball.positionY + ball.height/2 < rightPaddle.y + rightPaddle.height/2) {
      rightPaddle.dy = -rightPaddle.speed;
    } else if (ball.positionY + ball.height/2 > rightPaddle.y + rightPaddle.height/2) {
      rightPaddle.dy = rightPaddle.speed;
    } else {
      rightPaddle.dy = 0;
    }
  } else {
    // Joueur humain : flèches ↑ et ↓
    if (keys["ArrowUp"]) {
      rightPaddle.dy = -rightPaddle.speed;
    } else if (keys["ArrowDown"]) {
      rightPaddle.dy = rightPaddle.speed;
    } else {
      rightPaddle.dy = 0;
    }
  }

  // Mise à jour des positions
  leftPaddle.y += leftPaddle.dy;
  rightPaddle.y += rightPaddle.dy;

  // Limite des raquettes à l'intérieur du canvas
  if (leftPaddle.y < 0) leftPaddle.y = 0;
  if (leftPaddle.y + leftPaddle.height > canvas.height) leftPaddle.y = canvas.height - leftPaddle.height;
  if (rightPaddle.y < 0) rightPaddle.y = 0;
  if (rightPaddle.y + rightPaddle.height > canvas.height) rightPaddle.y = canvas.height - rightPaddle.height;
}


// avec ctx defini au dessus desine un rectangle pour les raquette
function drawPaddle(paddle) {
  ctx.fillStyle = "white";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.fillStyle = "white";
  ctx.fillRect(ball.positionX, ball.positionY, ball.width, ball.height);
}

// la boucle de jeu 
function update() { //efface le contenu des canvas a chaque frame
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  movePaddles();

  drawPaddle(leftPaddle);
  drawPaddle(rightPaddle);
  drawScore();

  animateBall()

  requestAnimationFrame(update);
}

update();



function animateBall() {
  ball.positionY += ball.vitesseY;
  ball.positionX += ball.vitesseX;

  // Si la balle sort à droite = point pour le joueur gauche
  if (ball.positionX + ball.width / 2 >= canvas.width - 1) {
    score.left++;
    ball.positionX = canvas.width / 2;
    ball.positionY = canvas.height / 2;
      gradientScore()
  }

  // Si la balle sort à gauche = point pour le joueur droit
  if (ball.positionX + ball.width / 2 < 0) {
    score.right++;
    ball.positionX = canvas.width / 2;
    ball.positionY = canvas.height / 2;
      gradientScore()
  }

  // Rebond en bas
  if (ball.positionY + ball.height / 2 >= canvas.height - 1) {
    ball.positionY = canvas.height - ball.height;
    ball.vitesseY = -ball.vitesseY;
  }

  // Rebond en haut
  if (ball.positionY + ball.height / 2 < 0) {
    ball.positionY = ball.height;
    ball.vitesseY = -ball.vitesseY;
  }

  // Collision raquette gauche
  if (leftPaddle.x + leftPaddle.width / 2 > ball.positionX - ball.width / 2) {
    if (
      leftPaddle.y + leftPaddle.height <= ball.positionY - ball.height / 2 ||
      leftPaddle.y > ball.positionY + ball.height / 2
    ) {
      // perdu
    } else {
      ball.vitesseX = -ball.vitesseX;
    }
  }

  // Collision raquette droite
  if (rightPaddle.x - rightPaddle.width / 2 < ball.positionX + ball.width / 2) {
    if (
      rightPaddle.y + rightPaddle.height <= ball.positionY - ball.height / 2 ||
      rightPaddle.y > ball.positionY + ball.height / 2
    ) {
      // perdu
    } else {
      ball.vitesseX = -ball.vitesseX;
    }
  }

  drawBall();
}

