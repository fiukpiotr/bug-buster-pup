import { Rolling, Diving } from "./playerState.js";

export class CollisionAnimation {
  constructor(game, x, y){
    this.game = game;
    this.image = collisionAnimation;
    this.sounds = [];
    this.spriteWidth = 100;
    this.spriteHeight = 90;
    this.sizeModifier = Math.random() + 0.5;
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;
    this.x = x - this.width * 0.5;
    this.y = y - this.height * 0.5;
    this.frameX = 0;
    this.maxFrame = 4;
    this.markedForDeletion = false;
    this.fps = Math.random() * 10 + 5;
    this.frameInterval = 1000/this.fps;
    this.frameTimer = 0;
  }
  playerHit(){
    const sound = new Audio();
    sound.src = './assets/hit30.flac';
    sound.volume = 0.1;
    sound.play();
    this.sounds.push(sound);   
    sound.addEventListener('ended', () => {
      this.sounds.splice(this.sounds.indexOf(sound), 1);
    });
  }
  enemyHit(){
    const sound = new Audio();
    sound.src = './assets/humanYell1.wav';
    sound.volume = 0.5;
    sound.play();
    this.sounds.push(sound);   
    sound.addEventListener('ended', () => {
      this.sounds.splice(this.sounds.indexOf(sound), 1);
    });
  }
  specialAttackSound(){
    const sound = new Audio();
    sound.src = './assets/whoosh.ogg';
    sound.volume = 0.5;
    sound.play();
    this.sounds.push(sound);   
    sound.addEventListener('ended', () => {
      this.sounds.splice(this.sounds.indexOf(sound), 1);
    });
  }
  draw(context){
    context.drawImage(
      this.image,
      this.frameX * this.spriteWidth, 0,
      this.spriteWidth, this.spriteHeight,
      this.x, this.y, this.width, this.height
    )
  }
  update(deltaTime){
    this.x -= this.game.speed;
    if ( this.frameTimer > this.frameInterval){
      this.frameX++;
      this.frameTimer = 0;
    } else {
      this.frameTimer += deltaTime;
    }
    if (this.frameX > this.maxFrame) this.markedForDeletion = true;
  }
}