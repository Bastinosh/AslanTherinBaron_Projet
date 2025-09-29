
//canvas represente la zone de jeu avec l'id gameCanvas
const canvas = document.getElementById("gameCanvas");
//ctx va obtenir les methode et rendu 2d 
const ctx = canvas.getContext("2d");

//init le score
let score = { left: 0 , right: 0 };

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${score.left} - ${score.right}`, canvas.width / 2, 40); //affiche le score
}

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

// objet vide pour inserer les touche appuiyer
const keys = {};

//ajoute un evennement a keys quand une touche est appuiyer
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});


//fonction qui gere les deplacement 
function movePaddles() {
  //si la touche z est appuiyer la raquette la vitesse de la raquette est defini a -vitesse (mouvement vert le bas) 
  if (keys["z"]) {
    leftPaddle.dy = -leftPaddle.speed;
  } else if (keys["s"]) {  //meme principe mais mouvement vers le haut
    leftPaddle.dy = leftPaddle.speed;
  } else {
    leftPaddle.dy = 0;
  }

  // Joueur droit : flèches ↑ et ↓
  if (keys["ArrowUp"]) {
    rightPaddle.dy = -rightPaddle.speed;
  } else if (keys["ArrowDown"]) {
    rightPaddle.dy = rightPaddle.speed;
  } else {
    rightPaddle.dy = 0;
  }

  // met a jour les position des raquettes
  leftPaddle.y += leftPaddle.dy;
  rightPaddle.y += rightPaddle.dy;

  // fait en sorte que les raquette ne vont pas plus loin que la zone du canvas
  if (leftPaddle.y < 0) leftPaddle.y = 0;
  if (leftPaddle.y + leftPaddle.height > canvas.height) {
    leftPaddle.y = canvas.height - leftPaddle.height;
  }

  if (rightPaddle.y < 0) rightPaddle.y = 0;
  if (rightPaddle.y + rightPaddle.height > canvas.height) {
    rightPaddle.y = canvas.height - rightPaddle.height;
  }
}

// avec ctx defini au dessus desine un rectangle pour les raquette
function drawPaddle(paddle) {
  ctx.fillStyle = "white";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// la boucle de jeu 
function update() { //efface le contenu des canvas a chaque frame
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  movePaddles();

  drawPaddle(leftPaddle);
  drawPaddle(rightPaddle);
  drawScore();

  requestAnimationFrame(update);
}

update();
