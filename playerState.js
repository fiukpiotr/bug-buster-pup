import { Dust, Fire, Splash } from "./particles.js";
import { CollisionAnimation } from "./collisionAnimation.js";

const states = {
  SITTING: 0,
  RUNNING: 1,
  JUMPING: 2,
  FALLING: 3,
  ROLLING: 4,
  DIVING: 5,
  HIT: 6,
}

class State {
  constructor(state, game){
    this.state = state;
    this.game = game;
  }
}

export class Sitting extends State {
  constructor(game){
    super('SITTING', game);
  }
  enter(){
    this.game.player.frameX = 0;
    this.game.player.maxFrame = 4;
    this.game.player.frameY = 5;
  }
  handleInput(input){
    if (input.includes('ArrowLeft') || input.includes('ArrowRight')){
      this.game.player.setState(states.RUNNING, 1);
    } else if (input.includes('ArrowUp')){
      this.game.player.setState(states.JUMPING, 1);
    } else if (input.includes('Control')){
      this.game.player.setState(states.ROLLING, 2);
    }
  }
}

export class Running extends State {
  constructor(game){
    super('RUNNING', game);
  }
  enter(){
    this.game.player.frameX = 0;
    this.game.player.maxFrame = 8;
    this.game.player.frameY = 3;
  }
  handleInput(input){
    this.game.particles.unshift(
      new Dust(
        this.game, 
        this.game.player.x + this.game.player.width * 0.7, 
        this.game.player.y + this.game.player.height
      )
    );
    if (input.includes('ArrowDown')){
      this.game.player.setState(states.SITTING, 0);
    } else if (input.includes('ArrowUp')){
      this.game.player.setState(states.JUMPING, 1);
    } else if (input.includes('Control')){
      this.game.player.setState(states.ROLLING, 2);
    }
  }
}

export class Jumping extends State {
  constructor(game){
    super('JUMPING', game);
  }
  enter(){
    this.game.player.frameX = 0;
    // zmienna wartości wysokości skoku
    if (this.game.player.onGround()) this.game.player.vy -= 27;
    this.game.player.frameY = 1;
    this.game.player.maxFrame = 6;
  }
  handleInput(input){
    if (this.game.player.vy > this.game.player.weight){
      this.game.player.setState(states.FALLING, 1);
    } else if (input.includes('Control')){
      this.game.player.setState(states.ROLLING, 2);
    } else if (input.includes('ArrowDown')){
      this.game.player.setState(states.DIVING, 0);
    }
  }
}

export class Falling extends State {
  constructor(game){
    super('FALLING', game);
  }
  enter(){
    this.game.player.frameX = 0;
    this.game.player.frameY = 2;
    this.game.player.maxFrame = 6;
  }
  handleInput(input){
    if (this.game.player.onGround()){
      this.game.player.setState(states.RUNNING, 1);
    } else if (input.includes('ArrowDown')){
      this.game.player.setState(states.DIVING, 0);
    }
  }
}

export class Rolling extends State {
  constructor(game){
    super('ROLLING', game);
    this.isAttacking = false; // Zmienna do śledzenia czy bohater atakuje
    this.attackCooldown = 3000; // Czas odnowienia ataku w milisekundach (3 sekundy)
    this.lastAttackTime = 0; // Czas ostatniego ataku
  }
  
  enter(){
    this.game.player.frameX = 0;
    this.game.player.maxFrame = 6;
    this.game.player.frameY = 6;
  }
  
  handleInput(input){
    // Sprawdź, czy minęło wystarczająco czasu od ostatniego ataku
    const currentTime = Date.now();
    if (!this.isAttacking && currentTime - this.lastAttackTime >= this.attackCooldown) {
      this.isAttacking = true;
      this.lastAttackTime = currentTime;
      
      // Tutaj umieść kod ataku bohatera, np. dodanie efektów, obrażeń itp.
      
      // Po zakończeniu ataku ustaw isAttacking na false, aby móc użyć ataku ponownie po 3 sekundach
      setTimeout(() => {
        this.isAttacking = false;
      }, 3000);
    }
    
    this.game.particles.unshift(new Fire(this.game, this.game.player.x + this.game.player.width * 0.5, this.game.player.y + this.game.player.height * 0.5));
    
    if (!input.includes('Control') && this.game.player.onGround()){
      this.game.player.setState(states.RUNNING, 1);
    } else if (!input.includes('Control') && !this.game.player.onGround()){
      this.game.player.setState(states.FALLING, 1);
    } else if (input.includes('Control') && input.includes('ArrowUp') && this.game.player.onGround()) {
      // wartość wysokości skoku w trakcie kulania
      this.game.player.vy -= 27;
    } else if (input.includes('ArrowDown') && !this.game.player.onGround()){
      this.game.player.setState(states.DIVING, 0);
    }
  }
}


export class Diving extends State {
  constructor(game){
    super('DIVING', game);
  }
  enter(){
    this.game.player.frameX = 0;
    this.game.player.maxFrame = 6;
    this.game.player.frameY = 6;
    this.game.player.vy = 15;
  }
  handleInput(input){
    this.game.particles.unshift(new Fire(this.game, this.game.player.x + this.game.player.width * 0.5, this.game.player.y + this.game.player.height * 0.5));
    if (this.game.player.onGround()){
      this.game.player.setState(states.RUNNING, 1);
      for (let i = 0 ; i < 30 ; i++){
        this.game.particles.unshift(new Splash(this.game, this.game.player.x, this.game.player.y));
      }
    } else if (input.includes('Control') && !this.game.player.onGround()){
      this.game.player.setState(states.ROLLING, 2);
    } 
  }
}

export class Hit extends State {
  constructor(game){
    super('HIT', game);
  }
  enter(){
    this.game.player.frameX = 0;
    this.game.player.maxFrame = 10;
    this.game.player.frameY = 4;
  }
  handleInput(input){
    if (this.game.player.frameX >= 10 && this.game.player.onGround()){
      this.game.player.setState(states.RUNNING, 1);
    } else if (this.game.player.frameX >= 10 && !this.game.player.onGround()){
      this.game.player.setState(states.FALLING, 1);
    } 
  }
}