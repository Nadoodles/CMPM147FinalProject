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

const starRadius = 5;
let backgroundStars = []; // Array to store star positions
let constellationStars = []; // Array to store consetallion star positions
let selectedStars = []; // Array to store selected star positions for drawing lines
let reseedButton;
let reseedNeeded = true;

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
  for (let i = 0; i < 10; i++){
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
    while (constellationStars.length < 10){
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
  for (let i = 0; i < selectedStars.length - 1; i++) {
    line(selectedStars[i].x, selectedStars[i].y, selectedStars[i + 1].x, selectedStars[i + 1].y);
  }

  // Draw constellation stars - Jim
  for (let i = 0; i < constellationStars.length; i++) {
    constellationStars[i].show();
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
    this.size = random(4  ,6); // random size for ellipse
    this.line_resolution = 40; // resolution for the cross lines
  }

  show(){
    // star circle
    ellipse(this.x, this.y, this.size, this.size);

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
    drawingContext.shadowBlur = 32;
    drawingContext.shadowColor = color(173, 216, 230);
    ellipse(this.x, this.y, this.size/2, this.size/2);
  }
}

// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
  // Check if a star was clicked
  for (let i = 0; i < constellationStars.length; i++) {
    let d = dist(mouseX, mouseY, constellationStars[i].x, constellationStars[i].y);
    if (d < starRadius) {
      selectedStars.push(constellationStars[i]);
      break;
    }
  }
}
