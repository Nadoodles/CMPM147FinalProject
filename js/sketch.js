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

  for (let i = 0; i < connections.length; i++) {
    line(connections[i][0].x, connections[i][0].y, connections[i][1].x, connections[i][1].y);
  }

  if (starSelected) {
    line(mouseX, mouseY, currStar.x, currStar.y);
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

    this.x = random(10, width-10); 
    this.y = random(10, height-10); 
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

      if (fromStar != this.vertices[i]) {

        if (sparks.length <= maxSparks) {
        
            sparks.push(new spark(this, this.vertices[i])); 

        }

      }

    }

  }

}

class spark {

  constructor(fromStar, nextStar) {

    this.pos = createVector(fromStar.x, fromStar.y);
    console.log(this.pos.x, this.pos.y);
    this.fromStar = fromStar;
    this.nextStar = nextStar;

  }

  show() {

    fill(255);
    ellipse(this.pos.x, this.pos.y, sparkSize, sparkSize);
    let direction = createVector(this.nextStar.x - this.pos.x, this.nextStar.y - this.pos.y);
    direction = direction.normalize();
    this.pos.x = this.pos.x + (direction.x * sparkSpeed * deltaTime);
    this.pos.y = this.pos.y + (direction.y * sparkSpeed * deltaTime);

    for (let i = 0; i < constellationStars.length; i++) {

      let d = dist(this.pos.x, this.pos.y, constellationStars[i].x, constellationStars[i].y);   // get distance to star

      if (d < starRadius) {
        
        if (constellationStars[i] == this.nextStar) {

          constellationStars[i].twinkle(this.fromStar);
          let index = sparks.indexOf(this);
          sparks.splice(index, 1);
          playSound(dist(this.fromStar.x, this.fromStar.y, this.nextStar.x, this.nextStar.y))

        }

      }

    }    

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
  My brain isnt working to come up with a better way to calculte this val below
  d is distance between stars, multipy by .01 to scale it down and a negative to make longer dist be lower pitch
  add 5 to counter the negatives but still sometimes neg so abs at end for the outliers
  -Jac
*/
function playSound(d) {
  d = abs((d*-.01)+7);
  console.log(d);
  reverb.process(guitarStrum, 2, 2);  // 2 seconds reverb time, decay rate of 2%
  guitarStrum.rate(d);
  guitarStrum.play();
}


function mouseReleased() {

  if (starSelected) {
  
    for (let i = 0; i < constellationStars.length; i++) {

      let d = dist(mouseX, mouseY, constellationStars[i].x, constellationStars[i].y);   // get distance to star
      let starDist = dist(currStar.x, currStar.y, constellationStars[i].x, constellationStars[i].y)
      if (d < starRadius) {
        
        if (constellationStars[i] == currStar) {

          currStar.twinkle();
          starSelected = false;
          return;

        } else {

          connections.push([currStar, constellationStars[i]]);
          currStar.vertices.push(constellationStars[i]);
          constellationStars[i].vertices.push(currStar);
          playSound(starDist);
          starSelected = false;
          return;

        }

      }

    }

  }

  starSelected = false;

}


