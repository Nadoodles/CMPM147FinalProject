// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
const VALUE1 = 1;
const VALUE2 = 2;

// Globals
let myInstance;
let canvas;
let canvasContainer;
var centerHorz, centerVert;

const starRadius = 10;
let backgroundStars = []; // Array to store star positions
let constellationStars = []; // Array to store consetallion star positions
let constellationStarCount;
let selectedStars = []; // Array to store selected star positions for drawing lines
let sparks = [];
let reseedButton;
let playAllButton;
let clearStringsButton;
let reseedNeeded = true;

let connections = [];
let currStar;
let starSelected;

let fadeOutSpeed = 0.1;
let sparkSpeed = 0.3;
let vibrationScale = 0.04;
let vibrateDrag = 0.075;
let sparkCenterSpeed = 0.3;
let sparkSize = 5;
let maxSparks = 100;

let audioContext;
let reverb;
let randomNumberPlanets; 
let planets = []; 

class MyClass {
    constructor(param1, param2) {
        this.property1 = param1;
        this.property2 = param2;
    }

    myMethod() {
        // code to run when method is called
    }
}

class Planet {
  constructor(size, color, x, y) {
    this.size = size;
    this.color = color;
    this.x = x;
    this.y = y;
  }

  show() {
    fill(this.color);
    ellipse(this.x, this.y, this.size, this.size);
  }
}

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
}

function playAllStrings() {
  for (let i = 0; i < connections.length; i++) {
    let startStar = connections[i][0];
    let endStar = connections[i][1];
    let d = dist(startStar.x, startStar.y, endStar.x, endStar.y);
    setTimeout(() => {
      playSound(d);
    }, i * 500); // 500ms delay between each sound

  }

}


function clearStrings(){
  selectedStars = []; 
  connections = [];
  sparks = [];
  for (let i = 0; i < constellationStars.length; i++) {
    constellationStars[i].vertices = [];
  }
  
}

function preload() {
  soundFormats('mp3', 'ogg', 'wav');
  guitarStrum = loadSound('./assets/guitar_strum.wav');
  guitarPluck = loadSound('./assets/pluck.wav')
}

// setup() function is called once when the program starts
function setup() {
  // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  canvas = createCanvas(1000, 500);
  canvas.parent("canvas-container");

  // create an instance of the class
  myInstance = new MyClass("VALUE1", "VALUE2");

  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();

  // Get the reseed button element and set up the event listener
  reseedButton = select('#reseedButton');
  reseedButton.mousePressed(reseedStars);

  // set up constellation stars
  constellationStarCount = Math.floor(random(10, 15))
  for (let i = 0; i < constellationStarCount; i++){
    constellationStars[i] = new constellationStar();
  }

  getAudioContext().suspend(); // Prevent audio from playing on startup
  reverb = new p5.Reverb();

  playAllButton = select('#playAllButton');
  playAllButton.mousePressed(playAllStrings);

  clearStringsButton = select('#clearStringsButton');
  clearStringsButton.mousePressed(clearStrings);

  // Create planets
  randomNumberPlanets = Math.floor(random(1, 4));
  for (let i = 0; i < randomNumberPlanets; i++) {
    planets.push(new Planet(random(10, 50), color(random(255), random(255), random(255)), random(width), random(height)));
  }
  
}

function reseedStars() {
  reseedNeeded = true;
  selectedStars = []; // Clear selected stars on reseed
  connections = [];
  sparks = [];
  planets = [];
  randomNumberPlanets = Math.floor(random(1, 4));
  for (let i = 0; i < randomNumberPlanets; i++) {
    planets.push(new Planet(random(10, 50), color(random(255), random(255), random(255)), random(width), random(height)));
  }
}


// draw() function is called repeatedly, it's the main animation loop
function draw() {
  background(0);    
  // call a method on the instance
  myInstance.myMethod();

  if (reseedNeeded) {
    // Clear stars array
    backgroundStars = [];
    constellationStars = [];

    while (backgroundStars.length < 300) {
      backgroundStars.push(new backgroundStar());
    }

    // generate constellation stars
    while (constellationStars.length < constellationStarCount){
      constellationStars.push(new constellationStar()); 
    }

    reseedNeeded = false; // Reset the flag
  }

  // Draw stars
  fill(255); // Set fill color to white
  noStroke(); // Remove stroke

  for (let i = 0; i < backgroundStars.length; i++) {
    backgroundStars[i].show()
  }

  // Draw lines between selected stars
  stroke(255); // Set stroke color to white
  strokeWeight(2); // Set line thickness

  if (starSelected) {
    line(mouseX, mouseY, currStar.x, currStar.y);
  }

  // Draw constellation stars - Jim
  for (let i = 0; i < sparks.length; i++) {
    sparks[i].show();
  }

  // Draw constellation stars - Jim
  for (let i = 0; i < constellationStars.length; i++) {
    constellationStars[i].show();
  }

  // Draw feedback
  for (let i = 0; i < constellationStars.length; i++) {

    let d = dist(mouseX, mouseY, constellationStars[i].x, constellationStars[i].y);   // get distance to star

    if (d < starRadius) {
      
      constellationStars[i].resetGlow();
      break;

    }

  }

  // Draw sparks
  for (let i = 0; i < sparks.length; i++) {
    sparks[i].show();
  }

  // Draw planets
  for (let i = 0; i < planets.length; i++) {
    planets[i].show();
  }

}

class backgroundStar{

  constructor(){

    this.x = random(width);
    this.y = random(height);
    this.size = random(1, 3);
    this.timer = random(0, 4); // twinkle timer

  }

  //https://editor.p5js.org/robert0504/sketches/srSzgJcCS <-- credits to the twinkle formula
  show(){

    fill(255,255,255,(0.5 * (Math.sin(this.timer)) + 0.5) * 255)
    ellipse(this.x,this.y, this.size, this.size);
    this.timer+=deltaTime/1000

  }

}

class constellationStar{

  constructor(){

    this.x = random(20, width-20); 
    this.y = random(20, height-20); 
    this.size = random(9, 10) ;
    this.opacity = 255;
    this.vertices = [];
    
  }

  show(){

    // star shape
    beginShape()
    vertex(this.x, this.y-this.size) // top point
    vertex(this.x - this.size/5, this.y - this.size/4)
    vertex(this.x - this.size, this.y) // left point
    vertex(this.x - this.size/5, this.y + this.size/4)
    vertex(this.x, this.y + this.size) // bottom point
    vertex(this.x + this.size/5, this.y + this.size/4)
    vertex(this.x + this.size, this.y) // right point
    vertex(this.x + this.size/5, this.y - this.size/4)
    endShape(CLOSE)

    drawingContext.shadowBlur = 32;
    drawingContext.shadowColor = color(173, 216, 230);
    ellipse(this.x, this.y, this.size/2, this.size/2);
    noStroke();

    fill(255, 255, 255, this.opacity);
    this.opacity = lerp(this.opacity, 0, fadeOutSpeed);
    ellipse(this.x, this.y, this.size * 5, this.size * 5);
    fill(255);

  }

  resetGlow() {

    this.opacity = 200;

  }

  twinkle(fromStar = null) {

    this.resetGlow();

    for (let i = 0; i < this.vertices.length; i++) {

      if (fromStar != this.vertices[i].fromStar) {

        this.vertices[i].pos.x = this.x;
        this.vertices[i].pos.y = this.y;

        this.vertices[i].center.x = this.x;
        this.vertices[i].center.y = this.y;

        let savedNext = this.vertices[i].nextStar;
        if (savedNext == this) {

          this.vertices[i].flip();

        }
        
        this.vertices[i].arrived = false;

        this.vertices[i].vibrate();
        
        let starDist = dist(this.vertices[i].fromStar.x, this.vertices[i].fromStar.y, this.vertices[i].nextStar.x, this.vertices[i].nextStar.y);
        playSound(starDist);

      }

    }

  }

}

class spark {
  constructor(fromStar, nextStar) {
    this.pos = createVector(fromStar.x, fromStar.y);
    this.fromStar = fromStar;
    this.nextStar = nextStar;
    this.arrived = false;
    this.vibrateSpeed = 0;
    this.vibrateOffset = 0;
    this.center = createVector(fromStar.x, fromStar.y);

    // calculate dir and perp
    let stringDirection = createVector(this.nextStar.x - this.fromStar.x, this.nextStar.y - this.fromStar.y).normalize();
    this.perpendicular = createVector(stringDirection.y, -stringDirection.x);

    this.vibrate();
    let starDist = dist(this.fromStar.x, this.fromStar.y, this.nextStar.x, this.nextStar.y);
    playSound(starDist);

  }

  vibrate() {
    let d = dist(this.fromStar.x, this.fromStar.y, this.nextStar.x, this.nextStar.y);
    this.vibrateSpeed = d * vibrationScale;
    this.vibrateOffset = 0;

  }

  show() {
    fill(255);
    ellipse(this.pos.x, this.pos.y, sparkSize, sparkSize);

    if (!this.arrived) {
      let direction = createVector(this.nextStar.x - this.pos.x, this.nextStar.y - this.pos.y).normalize();
      this.pos.add(p5.Vector.mult(direction, sparkSpeed * deltaTime));

      // oscillation
      this.vibrateOffset += deltaTime * vibrateDrag;
      let oscillation = sin(this.vibrateOffset) * this.vibrateSpeed;
      this.vibrateSpeed = lerp(this.vibrateSpeed, 0, vibrateDrag);

      this.pos.add(p5.Vector.mult(this.perpendicular, oscillation));

      let d = dist(this.pos.x, this.pos.y, this.nextStar.x, this.nextStar.y);
      if (d < starRadius) {
        this.nextStar.twinkle(this.fromStar);
        this.pos.set(this.nextStar.x, this.nextStar.y);
        this.arrived = true;
      }
    }

    // Draw lines between selected stars
    stroke(255);
    strokeWeight(2);
    line(this.pos.x, this.pos.y, this.nextStar.x, this.nextStar.y);
    line(this.pos.x, this.pos.y, this.fromStar.x, this.fromStar.y);
  }

  flip() {
    let savedNext = this.nextStar;
    this.nextStar = this.fromStar;
    this.fromStar = savedNext;
    this.arrived = false;
  }
}


function mousePressed() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }

  starSelected = false;

  for (let i = 0; i < constellationStars.length; i++) {

    let d = dist(mouseX, mouseY, constellationStars[i].x, constellationStars[i].y);   // get distance to star

    if (d < starRadius) {

      currStar = constellationStars[i];
      starSelected = true;
      break;

    }

  }

}

/*
  rate() edits the pitch of a sound -- 1.0 is original, > 1 players higher pitch < 1 plays lower pitch
  negative values dont work
  -Jac
*/
function playSound(d) {
  d = (1 / d) * 200;
  reverb.process(guitarPluck, 2, 2);  // 2 seconds reverb time, decay rate of 2%
  guitarPluck.rate(d);
  guitarPluck.play();
}


function mouseReleased() {
  if (starSelected) {
    for (let i = 0; i < constellationStars.length; i++) {
      let d = dist(mouseX, mouseY, constellationStars[i].x, constellationStars[i].y);   // get distance to star
      if (d < starRadius) {
        if (constellationStars[i] == currStar) {
          currStar.twinkle();
          starSelected = false;
          return;
        } else {
          let newSpark = new spark(currStar, constellationStars[i]);
          sparks.push(newSpark); 
          starSelected = false;
          currStar.vertices.push(newSpark);
          constellationStars[i].vertices.push(newSpark);

          // Add the connection to the connections array
          connections.push([currStar, constellationStars[i]]);
          return;
        }
      }
    }
  }
  starSelected = false;
}



