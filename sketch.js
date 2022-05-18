let song;
let analyzer;
// texture for the particle
let particle_texture = null;
let songPlaying = false;
// variable holding our particle system
let ps = null;
let button = document.getElementById("startSong");
let color = 'r';
function preload() {
  song = loadSound('Never Gonna Give You Up Original.mp3');
  particle_texture = loadImage("https://th.bing.com/th/id/R.4939a8d27601adf3dd652e5703b6f679?rik=6cBF6VHx0SM4wg&riu=http%3a%2f%2fstemkoski.github.io%2fThree.js%2fimages%2fsmokeparticle.png&ehk=VYe1xXAqA7%2fowyNNm%2fZjzm6fFzYq14hK7d1AC3skDfU%3d&risl=&pid=ImgRaw&r=0");
}

function setup() {

  //set the canvas size
  createCanvas(640, 360);
  // create a new Amplitude analyzer
  analyzer = new p5.Amplitude();

  // Patch the input to an volume analyzer
  analyzer.setInput(song);
  // Create an Audio input
  mic = new p5.AudioIn();

  //let analyzer = new p5.Amplitude();
  //analyzer.setInput(song);
  // start the Audio Input.
  // By default, it does not .connect() (to the computer speakers)
  mic.start();
  //initialize our particle system
  ps = new ParticleSystem(0, createVector(width / 2, height - 60), particle_texture);

  
}

function playSong() {
  if (!songPlaying) {
  song.play();
  console.log('Playing Song hopefully');
  songPlaying = true;
  }
}

function stopSong() {
  if (songPlaying) {
    song.stop();
    songPlaying = false;
  }
}

function draw() {

  if(keyCode == 82) {
    color = 'r';
  }
  if(keyCode == 71) {
    color = 'g';
  }
  if(keyCode == 66) {
    color = 'b';
  }


  console.log(keyCode + color);
  let rms = analyzer.getLevel();
  fill(127);
  stroke(0);

  // Draw an ellipse with size based on volume
  ellipse(width / 2, height / 2, 10 + rms * 200, 10 + rms * 200);
  background(255);
  let vol = mic.getLevel();
  //console.log(analyzer.getLevel());

  if(color == 'r') {
    background(vol*700, 0, 0)
  }
  if(color == 'g') {
    background(0, vol*700, 0)
  }
  if(color == 'b') {
    background(0, 0, vol*700)
  }

  
  let dx = map(mouseX, 0, width, -0.2, 0.2);
  let wind = createVector(dx, 0);

  ps.applyForce(wind);
  ps.run();
  for (let i = 0; i < 2; i++) {
    ps.addParticle();
  }
  
  // Draw an arrow representing the wind force
  drawVector(wind, createVector(width / 2, 50, 0), 500);
}

/**
 *  This function draws an arrow showing the direction our "wind" is blowing.
 */
function drawVector(v, loc, scale){
  push();
  let arrowsize = 4;
  translate(loc.x, loc.y);
  stroke(255);
  rotate(v.heading());

  let len = v.mag() * scale;
  line(0, 0, len,0);
  line(len, 0, len-arrowsize, +arrowsize / 2);
  line(len, 0, len-arrowsize, -arrowsize / 2);
  pop();
}
//========= PARTICLE SYSTEM ===========

/**
 * A basic particle system class
 * @param num the number of particles
 * @param v the origin of the particle system
 * @param img_ a texture for each particle in the system
 * @constructor
 */
let ParticleSystem = function(num, v, img_) {

  this.particles = [];
  this.origin = v.copy(); // we make sure to copy the vector value in case we accidentally mutate the original by accident
  this.img = img_
  for(let i = 0; i < num; ++i){
    this.particles.push(new Particle(this.origin, this.img));
  }
};

/**
 * This function runs the entire particle system.
 */
ParticleSystem.prototype.run = function() {

  // cache length of the array we're going to loop into a variable
  // You may see <variable>.length in a for loop, from time to time but
  // we cache it here because otherwise the length is re-calculated for each iteration of a loop
  let len = this.particles.length;

  //loop through and run particles
  for (let i = len - 1; i >= 0; i--) {
    let particle = this.particles[i];
    particle.run();

    // if the particle is dead, we remove it.
    // javascript arrays don't have a "remove" function but "splice" works just as well.
    // we feed it an index to start at, then how many numbers from that point to remove.
    if (particle.isDead()) {
      this.particles.splice(i, 1);
    }
  }
}

/**
 * Method to add a force vector to all particles currently in the system
 * @param dir a p5.Vector describing the direction of the force.
 */
ParticleSystem.prototype.applyForce = function(dir) {
  let len = this.particles.length;
  for(let i = 0; i < len; ++i){
    this.particles[i].applyForce(dir);
  }
}

/**
 * Adds a new particle to the system at the origin of the system and with
 * the originally set texture.
 */
ParticleSystem.prototype.addParticle = function() {
    this.particles.push(new Particle(this.origin, this.img));
}

//========= PARTICLE  ===========
/**
 *  A simple Particle class, renders the particle as an image
 */
let Particle = function (pos, img_) {
  this.loc = pos.copy();

  let vx = randomGaussian() * 0.3;
  let vy = randomGaussian() * 0.3 - 1.0;

  this.vel = createVector(vx, vy);
  this.acc = createVector();
  this.lifespan = 100.0;
  this.texture = img_;
}

/**
 *  Simulataneously updates and displays a particle.
 */
Particle.prototype.run = function() {
  this.update();
  this.render();
}

/**
 *  A function to display a particle
 */
Particle.prototype.render = function() {
  imageMode(CENTER);
  tint(255, this.lifespan);
  image(this.texture, this.loc.x, this.loc.y);
}

/**
 *  A method to apply a force vector to a particle.
 */
Particle.prototype.applyForce = function(f) {
  this.acc.add(f);
}

/**
 *  This method checks to see if the particle has reached the end of it's lifespan,
 *  if it has, return true, otherwise return false.
 */
Particle.prototype.isDead = function () {
  if (this.lifespan <= 0.0) {
    return true;
  } else {
      return false;
    }
}

/**
 *  This method updates the position of the particle.
 */
Particle.prototype.update = function() {
  this.vel.add(this.acc);
  this.loc.add(this.vel);
  this.lifespan -= 2.5;
  this.acc.mult(0);
}
