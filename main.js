import Player from "./player.js";
import { InputHandler } from "./input.js";
import { Background } from "./background.js";
import { FlyingEnemy, GroundEnemy, ClimbingEnemy } from "./enemies.js";
import { UI } from "./UI.js";

window.addEventListener('load', function(){
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 900;
  canvas.height = 500;

  const backgroundAudio = document.getElementById('background-audio');
  backgroundAudio.volume = 0.1;
  const gameOverSound = document.getElementById('gameOverSound');
  gameOverSound.volume = 0.2;
  const startButton = document.getElementById('startButton');
  
  
  class Game {
    constructor(width, height){
      this.width = width;
      this.height = height;
      this.groundMargin = 50;
      this.speed = 0;
      //prędkość tła
      this.maxSpeed = 2;
      this.background = new Background(this);
      this.player = new Player(this);
      this.input = new InputHandler(this);
      this.UI = new UI(this);
      this.enemies = [];
      this.particles = [];
      this.collisions = [];
      this.floatingMessages = [];
      this.maxParticles = 200;
      this.enemyTimer = 0;
      this.enemyInterval = Math.random() * 1000 + 500;
      this.debug = false;
      this.score = 0;
      this.winningScore = 40;
      this.fontColor = 'green';
      this.startTime = new Date().getTime();
      this.time = 0;
      this.maxTime = 30000;
      this.isPlaying = false;
      this.gameOver = false;
      this.lives = 5;
      this.backgroundAudio = backgroundAudio;
      this.gameOverSound = gameOverSound;
      this.winningSound = winningSound;
      this.player.currentState = this.player.states[0];
      this.player.currentState.enter();
    }
    update(deltaTime){
      if (this.isPlaying) {
        this.time += deltaTime;
      }
      if (this.time > this.maxTime && this.score < 40){
        this.gameOver = true;
        this.backgroundAudio.pause();
        this.gameOverSound.play();
      } else if (this.time > this.maxTime && this.score >= 40) {
        this.gameOver = true;
        this.backgroundAudio.pause();
        this.winningSound.play();
      }
      this.background.update();
      this.player.update(this.input.keys, deltaTime);
      // handle enemies
      if (this.enemyTimer > this.enemyInterval){
        this.addEnemy();
        this.enemyTimer = 0;
      } else {
        this.enemyTimer += deltaTime;
      }
      this.enemies.forEach(enemy => {
        enemy.update(deltaTime);
        if (enemy.markedForDeletion) this.enemies.splice(this.enemies.indexOf(enemy), 1);
      });
      // handle messages
      this.floatingMessages.forEach(message => {
        message.update();
      });
      // handle particles
      this.particles.forEach((particle, index) => {
        particle.update();
      });
      if (this.particles.length > this.maxParticles) {
        this.particles.length = this.maxParticles;
      }
      // handle collision sprites
      this.collisions.forEach((collision, index) => {
        collision.update(deltaTime);
      });
      this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
      this.particles = this.particles.filter(particle => !particle.markedForDeletion);
      this.collisions = this.collisions.filter(collision => !collision.markedForDeletion);
      this.floatingMessages = this.floatingMessages.filter(message => !message.markedForDeletion);
    }
    draw(context){
      this.background.draw(context);
      this.enemies.forEach(enemy => {
        enemy.draw(context);
      });
      this.particles.forEach(particle => {
        particle.draw(context);
      });
      this.player.draw(context);
      this.collisions.forEach(collision => {
        collision.draw(context);
      });
      this.floatingMessages.forEach(message => {
        message.draw(context);
      });
      this.UI.draw(context);
    }
    addEnemy(){
      if (this.speed > 0 && Math.random() < 0.5) this.enemies.push(new GroundEnemy(this));
      else if (this.speed > 0) this.enemies.push(new ClimbingEnemy(this));
      this.enemies.push(new FlyingEnemy(this));
    }
  }

  
  const game = new Game(canvas.width, canvas.height);
  const targetFPS = 60;
  const frameDuration = 1000 / targetFPS;
  let lastTime = 0;
  
  function animate(timeStamp) {
    let deltaTime = timeStamp - lastTime;
    if (deltaTime > 30) {
      deltaTime = 30;
    }
    if (deltaTime >= frameDuration) {
      lastTime = timeStamp - (deltaTime % frameDuration);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      game.update(deltaTime);
      game.draw(ctx);
    } 
    if (!game.gameOver) {
      requestAnimationFrame(animate);
    }
  }

  startButton.addEventListener('click', function() {
    game.time = 0;
    game.isPlaying = true;
    backgroundAudio.play();
    startButton.style.display = "none";
    animate(0);
  });
  
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        game.isPlaying = true;
        backgroundAudio.play();
        startButton.style.display = "none";
        animate(0);
    }
  });


});