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
let selectedStars = []; // Array to store selected star positions for drawing lines
let sparks = [];
let reseedButton;
let reseedNeeded = true;

let connections = [];
let currStar;
let starSelected;

let fadeOutSpeed = 0.1;
let sparkSpeed = 0.3;
let sparkSize = 5;

class MyClass {
    constructor(param1, param2) {
        this.property1 = param1;
        this.property2 = param2;
    }

    myMethod() {
        // code to run when method is called
    }
}

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
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

  //Jim 
  for (let i = 0; i < 20; i++){
    constellationStars[i] = new constellationStar();
  }
}

function reseedStars() {
  reseedNeeded = true;
  selectedStars = []; // Clear selected stars on reseed
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

    // Generate 10 sufficiently spaced stars
    while (backgroundStars.length < 300) {
      backgroundStars.push(new backgroundStar());
    }

    // generate constellation stars
    while (constellationStars.length < 20){
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

  for (let i = 0; i < sparks.length; i++) {
    sparks[i].show();
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

    this.x = random(width); // x position
    this.y = random(height); // y position
    this.size = random(4  ,6) * 1.5; // random size for ellipse
    this.line_resolution = 40; // resolution for the cross lines
    this.opacity = 255;
    this.vertices = [];

  }

  show(){

    // star circle
    ellipse(this.x, this.y, this.size, this.size);

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

        sparks.push(new spark(this, this.vertices[i])); 

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

        }

      }

    }    

  }

}

function mousePressed() {

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

          connections.push([currStar, constellationStars[i]]);
          currStar.vertices.push(constellationStars[i]);
          constellationStars[i].vertices.push(currStar);
          starSelected = false;
          return;

        }

      }

    }

  }

  starSelected = false;

}

/* wacky glow
// this looks cool but it slows down the code like heyo
    // star lines
    // it's scuffed but basically it increases the line thickeness as it gets closer to the ellipse using lerp
    let prev_x_left = this.x-10;
    let prev_x_right = this.x+10;
    let prev_y_up = this.y-10;
    let prev_y_down = this.y+10;
    for (let i = 0; i < this.line_resolution; i++){
      let current_x_left = lerp(this.x-10, this.x, i / this.line_resolution);
      let current_x_right = lerp(this.x+10, this.x, i / this.line_resolution);
      let current_y_up = lerp(this.y-10, this.y, i / this.line_resolution)
      let current_y_down = lerp(this.y+10, this.y, i / this.line_resolution)
      push()
      strokeWeight(lerp(1, this.size, i/this.line_resolution));
      line(prev_x_left, this.y, current_x_left, this.y);
      line(prev_x_right, this.y, current_x_right, this.y);
      line(this.x, prev_y_up, this.x, current_y_up);
      line(this.x, prev_y_down, this.x, current_y_down);
      pop()
      prev_x_left = current_x_left;
      prev_x_right = current_x_right;
      prev_y_up = current_y_up
      prev_y_down = current_y_down
    }

    // glow
    // wack i'll mess around more with it later, or someone else can
*/

