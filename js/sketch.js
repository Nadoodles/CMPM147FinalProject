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

let planetSelected; 
let currentPlanet = [];

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

let worldSeed;
let input;

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

function randomStrings() {
  clearStrings();

  let numStrings = Math.floor(random(3, 6)); 

  for (let i = 0; i < numStrings; i++) {
    let startStar = constellationStars[Math.floor(random(constellationStars.length))];
    let endStar;
    
    do {
      endStar = constellationStars[Math.floor(random(constellationStars.length))];
    } while (startStar === endStar); 

    let newSpark = new spark(startStar, endStar);
    sparks.push(newSpark);
    startStar.vertices.push(newSpark);
    endStar.vertices.push(newSpark);

    connections.push([startStar, endStar]);
  }
}



function clearStrings(){
  selectedStars = []; 
  connections = [];
  sparks = [];
  for (let i = 0; i < constellationStars.length; i++) {
    constellationStars[i].vertices = [];
  }
  if (window.drumInterval) {
    clearInterval(window.drumInterval);
  }
}

function preload() {
  soundFormats('mp3', 'ogg', 'wav');
 // guitarStrum = loadSound('./assets/guitar_strum.wav');
  guitarPluck = loadSound('./assets/pluck.wav');
  drumKick = loadSound('./assets/808_Kick.wav');
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

  randomStringsButton = select('#randomStringsButton');
  randomStringsButton.mousePressed(randomStrings);

  // Create planets
  randomNumberPlanets = Math.floor(random(1, 4));
  for (let i = 0; i < randomNumberPlanets; i++) {
    planets.push(new Planet());
  }
  
  // world key
  let label = createP();
  label.html("World Key: ");
  label.parent("canvas-container");
  label.style('color', 'white');
  label.position('center');
  label.style('border', '5px #FFBF00 solid');
  label.style('border-radius', '50px');
  input = createInput("727");
  input.parent(label);
  input.input(() => {
    window.changeWorldKey(input.value())
    reseedNeeded = true;
    clearStrings();

  
  });

  window.changeWorldKey(input.value())
}

function reseedStars() {
  // Stop any playing drum sound when reseeding
  if (window.drumInterval) {
    clearInterval(window.drumInterval);
  }
  reseedNeeded = true;
  selectedStars = []; // Clear selected stars on reseed
  connections = [];
  sparks = [];
  planets = [];
  let newSeed = random(1, 10000).toString();
  input.value(newSeed);
  window.changeWorldKey(newSeed);
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
    planets = [];

    while (backgroundStars.length < 300) {
      backgroundStars.push(new backgroundStar());
    }

    // generate constellation stars
    while (constellationStars.length < constellationStarCount){
      constellationStars.push(new constellationStar()); 
    }

    // generate planets
    while (planets.length < randomNumberPlanets){
      planets.push(new Planet());
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

class Planet {
  constructor() {
    this.size = random(10, 50);
    this.color = color(random(255), random(255), random(255));
    this.x = random(10, width-10);
    this.y = random(10, height-10);
  }
  show() {
    fill(this.color);
    ellipse(this.x, this.y, this.size, this.size);
  }

  isClicked(mx, my) {
    let d = dist(mx, my, this.x, this.y);
    return d < this.size / 2;
  }
}

// helper function to check if the mouse is near a connection line
function isMouseOnLine(x1, y1, x2, y2, mx, my, tolerance = 5, edgeTolerance = 10) {
    let d1 = dist(mx, my, x1, y1);
    let d2 = dist(mx, my, x2, y2);
    let lineLen = dist(x1, y1, x2, y2);
  
    // Check if the mouse is too close to the edges of the line
    if (d1 < edgeTolerance || d2 < edgeTolerance) {
      return false;
    }
  
    return (d1 + d2 >= lineLen - tolerance && d1 + d2 <= lineLen + tolerance);
}

function mousePressed() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }

  starSelected = false;
  planetSelected = false;

  for (let i = 0; i < planets.length; i++) {
    if (planets[i].isClicked(mouseX, mouseY)) {
      if (currentPlanet === planets[i]) {
        // If the same planet is clicked again, stop the drum and clear currentPlanet
        clearInterval(window.drumInterval);
        currentPlanet = null;
        planetSelected = false;
      } else {
        // Play drum sound and set currentPlanet
        playDrum(planets[i].size);
        currentPlanet = planets[i];
        planetSelected = true;
      }

      return;
    }
  }

  // Check if a line was clicked (with help from chatgpt)
  for (let i = 0; i < connections.length; i++) {
    let startStar = connections[i][0];
    let endStar = connections[i][1];

    if (isMouseOnLine(startStar.x, startStar.y, endStar.x, endStar.y, mouseX, mouseY)) {
      // remove the connection
      connections.splice(i, 1);

      // remove the corresponding sparks
      sparks = sparks.filter(s => !(s.fromStar === startStar && s.nextStar === endStar) && !(s.fromStar === endStar && s.nextStar === startStar));

      // remove the connection from the stars' vertices
      startStar.vertices = startStar.vertices.filter(v => v.nextStar !== endStar);
      endStar.vertices = endStar.vertices.filter(v => v.nextStar !== startStar);

      return;
    }
  }

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

function playDrum(size) {
  size = (1 / size) * 100;
  drumKick.rate(size);
  //drumKick.play();
  if (window.drumInterval) {
    clearInterval(window.drumInterval);
  }

  let intervalDuration = 1500 / size; // Play 'rate' times per second

  // Set an interval to play the drum sound repeatedly
  window.drumInterval = setInterval(function() {
    drumKick.play();
  }, intervalDuration);
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

function changeWorldKey(key){
  worldSeed = XXH.h32(key, 0);
  randomSeed(worldSeed);
}

// hash function
!function(t,r){"object"==typeof exports&&"object"==typeof module?module.exports=r():"function"==typeof define&&define.amd?define([],r):"object"==typeof exports?exports.XXH=r():t.XXH=r()}(this,function(){return function(t){function r(e){if(i[e])return i[e].exports;var o=i[e]={i:e,l:!1,exports:{}};return t[e].call(o.exports,o,o.exports,r),o.l=!0,o.exports}var i={};return r.m=t,r.c=i,r.d=function(t,i,e){r.o(t,i)||Object.defineProperty(t,i,{configurable:!1,enumerable:!0,get:e})},r.n=function(t){var i=t&&t.__esModule?function(){return t["default"]}:function(){return t};return r.d(i,"a",i),i},r.o=function(t,r){return Object.prototype.hasOwnProperty.call(t,r)},r.p="",r(r.s=2)}([function(t,r,i){"use strict";(function(t){function e(){try{var t=new Uint8Array(1);return t.__proto__={__proto__:Uint8Array.prototype,foo:function(){return 42}},42===t.foo()&&"function"==typeof t.subarray&&0===t.subarray(1,1).byteLength}catch(r){return!1}}function o(){return n.TYPED_ARRAY_SUPPORT?2147483647:1073741823}function h(t,r){if(o()<r)throw new RangeError("Invalid typed array length");return n.TYPED_ARRAY_SUPPORT?(t=new Uint8Array(r),t.__proto__=n.prototype):(null===t&&(t=new n(r)),t.length=r),t}function n(t,r,i){if(!(n.TYPED_ARRAY_SUPPORT||this instanceof n))return new n(t,r,i);if("number"==typeof t){if("string"==typeof r)throw new Error("If encoding is specified then the first argument must be a string");return f(this,t)}return s(this,t,r,i)}function s(t,r,i,e){if("number"==typeof r)throw new TypeError('"value" argument must not be a number');return"undefined"!=typeof ArrayBuffer&&r instanceof ArrayBuffer?p(t,r,i,e):"string"==typeof r?l(t,r,i):m(t,r)}function a(t){if("number"!=typeof t)throw new TypeError('"size" argument must be a number');if(0>t)throw new RangeError('"size" argument must not be negative')}function u(t,r,i,e){return a(r),0>=r?h(t,r):void 0!==i?"string"==typeof e?h(t,r).fill(i,e):h(t,r).fill(i):h(t,r)}function f(t,r){if(a(r),t=h(t,0>r?0:0|y(r)),!n.TYPED_ARRAY_SUPPORT)for(var i=0;r>i;++i)t[i]=0;return t}function l(t,r,i){if(("string"!=typeof i||""===i)&&(i="utf8"),!n.isEncoding(i))throw new TypeError('"encoding" must be a valid string encoding');var e=0|d(r,i);t=h(t,e);var o=t.write(r,i);return o!==e&&(t=t.slice(0,o)),t}function c(t,r){var i=r.length<0?0:0|y(r.length);t=h(t,i);for(var e=0;i>e;e+=1)t[e]=255&r[e];return t}function p(t,r,i,e){if(r.byteLength,0>i||r.byteLength<i)throw new RangeError("'offset' is out of bounds");if(r.byteLength<i+(e||0))throw new RangeError("'length' is out of bounds");return r=void 0===i&&void 0===e?new Uint8Array(r):void 0===e?new Uint8Array(r,i):new Uint8Array(r,i,e),n.TYPED_ARRAY_SUPPORT?(t=r,t.__proto__=n.prototype):t=c(t,r),t}function m(t,r){if(n.isBuffer(r)){var i=0|y(r.length);return t=h(t,i),0===t.length?t:(r.copy(t,0,0,i),t)}if(r){if("undefined"!=typeof ArrayBuffer&&r.buffer instanceof ArrayBuffer||"length"in r)return"number"!=typeof r.length||K(r.length)?h(t,0):c(t,r);if("Buffer"===r.type&&$(r.data))return c(t,r.data)}throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")}function y(t){if(t>=o())throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+o().toString(16)+" bytes");return 0|t}function _(t){return+t!=t&&(t=0),n.alloc(+t)}function d(t,r){if(n.isBuffer(t))return t.length;if("undefined"!=typeof ArrayBuffer&&"function"==typeof ArrayBuffer.isView&&(ArrayBuffer.isView(t)||t instanceof ArrayBuffer))return t.byteLength;"string"!=typeof t&&(t=""+t);var i=t.length;if(0===i)return 0;for(var e=!1;;)switch(r){case"ascii":case"latin1":case"binary":return i;case"utf8":case"utf-8":case void 0:return H(t).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*i;case"hex":return i>>>1;case"base64":return Z(t).length;default:if(e)return H(t).length;r=(""+r).toLowerCase(),e=!0}}function g(t,r,i){var e=!1;if((void 0===r||0>r)&&(r=0),r>this.length)return"";if((void 0===i||i>this.length)&&(i=this.length),0>=i)return"";if(i>>>=0,r>>>=0,r>=i)return"";for(t||(t="utf8");;)switch(t){case"hex":return z(this,r,i);case"utf8":case"utf-8":return P(this,r,i);case"ascii":return S(this,r,i);case"latin1":case"binary":return I(this,r,i);case"base64":return T(this,r,i);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return Y(this,r,i);default:if(e)throw new TypeError("Unknown encoding: "+t);t=(t+"").toLowerCase(),e=!0}}function w(t,r,i){var e=t[r];t[r]=t[i],t[i]=e}function v(t,r,i,e,o){if(0===t.length)return-1;if("string"==typeof i?(e=i,i=0):i>2147483647?i=2147483647:-2147483648>i&&(i=-2147483648),i=+i,isNaN(i)&&(i=o?0:t.length-1),0>i&&(i=t.length+i),i>=t.length){if(o)return-1;i=t.length-1}else if(0>i){if(!o)return-1;i=0}if("string"==typeof r&&(r=n.from(r,e)),n.isBuffer(r))return 0===r.length?-1:A(t,r,i,e,o);if("number"==typeof r)return r=255&r,n.TYPED_ARRAY_SUPPORT&&"function"==typeof Uint8Array.prototype.indexOf?o?Uint8Array.prototype.indexOf.call(t,r,i):Uint8Array.prototype.lastIndexOf.call(t,r,i):A(t,[r],i,e,o);throw new TypeError("val must be string, number or Buffer")}function A(t,r,i,e,o){function h(t,r){return 1===n?t[r]:t.readUInt16BE(r*n)}var n=1,s=t.length,a=r.length;if(void 0!==e&&(e=String(e).toLowerCase(),"ucs2"===e||"ucs-2"===e||"utf16le"===e||"utf-16le"===e)){if(t.length<2||r.length<2)return-1;n=2,s/=2,a/=2,i/=2}var u;if(o){var f=-1;for(u=i;s>u;u++)if(h(t,u)===h(r,-1===f?0:u-f)){if(-1===f&&(f=u),u-f+1===a)return f*n}else-1!==f&&(u-=u-f),f=-1}else for(i+a>s&&(i=s-a),u=i;u>=0;u--){for(var l=!0,c=0;a>c;c++)if(h(t,u+c)!==h(r,c)){l=!1;break}if(l)return u}return-1}function C(t,r,i,e){i=Number(i)||0;var o=t.length-i;e?(e=Number(e),e>o&&(e=o)):e=o;var h=r.length;if(h%2!==0)throw new TypeError("Invalid hex string");e>h/2&&(e=h/2);for(var n=0;e>n;++n){var s=parseInt(r.substr(2*n,2),16);if(isNaN(s))return n;t[i+n]=s}return n}function b(t,r,i,e){return G(H(r,t.length-i),t,i,e)}function E(t,r,i,e){return G(V(r),t,i,e)}function R(t,r,i,e){return E(t,r,i,e)}function x(t,r,i,e){return G(Z(r),t,i,e)}function B(t,r,i,e){return G(J(r,t.length-i),t,i,e)}function T(t,r,i){return Q.fromByteArray(0===r&&i===t.length?t:t.slice(r,i))}function P(t,r,i){i=Math.min(t.length,i);for(var e=[],o=r;i>o;){var h=t[o],n=null,s=h>239?4:h>223?3:h>191?2:1;if(i>=o+s){var a,u,f,l;switch(s){case 1:128>h&&(n=h);break;case 2:a=t[o+1],128===(192&a)&&(l=(31&h)<<6|63&a,l>127&&(n=l));break;case 3:a=t[o+1],u=t[o+2],128===(192&a)&&128===(192&u)&&(l=(15&h)<<12|(63&a)<<6|63&u,l>2047&&(55296>l||l>57343)&&(n=l));break;case 4:a=t[o+1],u=t[o+2],f=t[o+3],128===(192&a)&&128===(192&u)&&128===(192&f)&&(l=(15&h)<<18|(63&a)<<12|(63&u)<<6|63&f,l>65535&&1114112>l&&(n=l))}}null===n?(n=65533,s=1):n>65535&&(n-=65536,e.push(n>>>10&1023|55296),n=56320|1023&n),e.push(n),o+=s}return U(e)}function U(t){var r=t.length;if(tt>=r)return String.fromCharCode.apply(String,t);for(var i="",e=0;r>e;)i+=String.fromCharCode.apply(String,t.slice(e,e+=tt));return i}function S(t,r,i){var e="";i=Math.min(t.length,i);for(var o=r;i>o;++o)e+=String.fromCharCode(127&t[o]);return e}function I(t,r,i){var e="";i=Math.min(t.length,i);for(var o=r;i>o;++o)e+=String.fromCharCode(t[o]);return e}function z(t,r,i){var e=t.length;(!r||0>r)&&(r=0),(!i||0>i||i>e)&&(i=e);for(var o="",h=r;i>h;++h)o+=X(t[h]);return o}function Y(t,r,i){for(var e=t.slice(r,i),o="",h=0;h<e.length;h+=2)o+=String.fromCharCode(e[h]+256*e[h+1]);return o}function M(t,r,i){if(t%1!==0||0>t)throw new RangeError("offset is not uint");if(t+r>i)throw new RangeError("Trying to access beyond buffer length")}function L(t,r,i,e,o,h){if(!n.isBuffer(t))throw new TypeError('"buffer" argument must be a Buffer instance');if(r>o||h>r)throw new RangeError('"value" argument is out of bounds');if(i+e>t.length)throw new RangeError("Index out of range")}function O(t,r,i,e){0>r&&(r=65535+r+1);for(var o=0,h=Math.min(t.length-i,2);h>o;++o)t[i+o]=(r&255<<8*(e?o:1-o))>>>8*(e?o:1-o)}function N(t,r,i,e){0>r&&(r=4294967295+r+1);for(var o=0,h=Math.min(t.length-i,4);h>o;++o)t[i+o]=r>>>8*(e?o:3-o)&255}function D(t,r,i,e){if(i+e>t.length)throw new RangeError("Index out of range");if(0>i)throw new RangeError("Index out of range")}function k(t,r,i,e,o){return o||D(t,r,i,4,3.4028234663852886e38,-3.4028234663852886e38),W.write(t,r,i,e,23,4),i+4}function j(t,r,i,e,o){return o||D(t,r,i,8,1.7976931348623157e308,-1.7976931348623157e308),W.write(t,r,i,e,52,8),i+8}function F(t){if(t=q(t).replace(rt,""),t.length<2)return"";for(;t.length%4!==0;)t+="=";return t}function q(t){return t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")}function X(t){return 16>t?"0"+t.toString(16):t.toString(16)}function H(t,r){r=r||1/0;for(var i,e=t.length,o=null,h=[],n=0;e>n;++n){if(i=t.charCodeAt(n),i>55295&&57344>i){if(!o){if(i>56319){(r-=3)>-1&&h.push(239,191,189);continue}if(n+1===e){(r-=3)>-1&&h.push(239,191,189);continue}o=i;continue}if(56320>i){(r-=3)>-1&&h.push(239,191,189),o=i;continue}i=(o-55296<<10|i-56320)+65536}else o&&(r-=3)>-1&&h.push(239,191,189);if(o=null,128>i){if((r-=1)<0)break;h.push(i)}else if(2048>i){if((r-=2)<0)break;h.push(i>>6|192,63&i|128)}else if(65536>i){if((r-=3)<0)break;h.push(i>>12|224,i>>6&63|128,63&i|128)}else{if(!(1114112>i))throw new Error("Invalid code point");if((r-=4)<0)break;h.push(i>>18|240,i>>12&63|128,i>>6&63|128,63&i|128)}}return h}function V(t){for(var r=[],i=0;i<t.length;++i)r.push(255&t.charCodeAt(i));return r}function J(t,r){for(var i,e,o,h=[],n=0;n<t.length&&!((r-=2)<0);++n)i=t.charCodeAt(n),e=i>>8,o=i%256,h.push(o),h.push(e);return h}function Z(t){return Q.toByteArray(F(t))}function G(t,r,i,e){for(var o=0;e>o&&!(o+i>=r.length||o>=t.length);++o)r[o+i]=t[o];return o}function K(t){return t!==t}var Q=i(5),W=i(6),$=i(7);r.Buffer=n,r.SlowBuffer=_,r.INSPECT_MAX_BYTES=50,n.TYPED_ARRAY_SUPPORT=void 0!==t.TYPED_ARRAY_SUPPORT?t.TYPED_ARRAY_SUPPORT:e(),r.kMaxLength=o(),n.poolSize=8192,n._augment=function(t){return t.__proto__=n.prototype,t},n.from=function(t,r,i){return s(null,t,r,i)},n.TYPED_ARRAY_SUPPORT&&(n.prototype.__proto__=Uint8Array.prototype,n.__proto__=Uint8Array,"undefined"!=typeof Symbol&&Symbol.species&&n[Symbol.species]===n&&Object.defineProperty(n,Symbol.species,{value:null,configurable:!0})),n.alloc=function(t,r,i){return u(null,t,r,i)},n.allocUnsafe=function(t){return f(null,t)},n.allocUnsafeSlow=function(t){return f(null,t)},n.isBuffer=function(t){return!(null==t||!t._isBuffer)},n.compare=function(t,r){if(!n.isBuffer(t)||!n.isBuffer(r))throw new TypeError("Arguments must be Buffers");if(t===r)return 0;for(var i=t.length,e=r.length,o=0,h=Math.min(i,e);h>o;++o)if(t[o]!==r[o]){i=t[o],e=r[o];break}return e>i?-1:i>e?1:0},n.isEncoding=function(t){switch(String(t).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},n.concat=function(t,r){if(!$(t))throw new TypeError('"list" argument must be an Array of Buffers');if(0===t.length)return n.alloc(0);var i;if(void 0===r)for(r=0,i=0;i<t.length;++i)r+=t[i].length;var e=n.allocUnsafe(r),o=0;for(i=0;i<t.length;++i){var h=t[i];if(!n.isBuffer(h))throw new TypeError('"list" argument must be an Array of Buffers');h.copy(e,o),o+=h.length}return e},n.byteLength=d,n.prototype._isBuffer=!0,n.prototype.swap16=function(){var t=this.length;if(t%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var r=0;t>r;r+=2)w(this,r,r+1);return this},n.prototype.swap32=function(){var t=this.length;if(t%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var r=0;t>r;r+=4)w(this,r,r+3),w(this,r+1,r+2);return this},n.prototype.swap64=function(){var t=this.length;if(t%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var r=0;t>r;r+=8)w(this,r,r+7),w(this,r+1,r+6),w(this,r+2,r+5),w(this,r+3,r+4);return this},n.prototype.toString=function(){var t=0|this.length;return 0===t?"":0===arguments.length?P(this,0,t):g.apply(this,arguments)},n.prototype.equals=function(t){if(!n.isBuffer(t))throw new TypeError("Argument must be a Buffer");return this===t?!0:0===n.compare(this,t)},n.prototype.inspect=function(){var t="",i=r.INSPECT_MAX_BYTES;return this.length>0&&(t=this.toString("hex",0,i).match(/.{2}/g).join(" "),this.length>i&&(t+=" ... ")),"<Buffer "+t+">"},n.prototype.compare=function(t,r,i,e,o){if(!n.isBuffer(t))throw new TypeError("Argument must be a Buffer");if(void 0===r&&(r=0),void 0===i&&(i=t?t.length:0),void 0===e&&(e=0),void 0===o&&(o=this.length),0>r||i>t.length||0>e||o>this.length)throw new RangeError("out of range index");if(e>=o&&r>=i)return 0;if(e>=o)return-1;if(r>=i)return 1;if(r>>>=0,i>>>=0,e>>>=0,o>>>=0,this===t)return 0;for(var h=o-e,s=i-r,a=Math.min(h,s),u=this.slice(e,o),f=t.slice(r,i),l=0;a>l;++l)if(u[l]!==f[l]){h=u[l],s=f[l];break}return s>h?-1:h>s?1:0},n.prototype.includes=function(t,r,i){return-1!==this.indexOf(t,r,i)},n.prototype.indexOf=function(t,r,i){return v(this,t,r,i,!0)},n.prototype.lastIndexOf=function(t,r,i){return v(this,t,r,i,!1)},n.prototype.write=function(t,r,i,e){if(void 0===r)e="utf8",i=this.length,r=0;else if(void 0===i&&"string"==typeof r)e=r,i=this.length,r=0;else{if(!isFinite(r))throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");r=0|r,isFinite(i)?(i=0|i,void 0===e&&(e="utf8")):(e=i,i=void 0)}var o=this.length-r;if((void 0===i||i>o)&&(i=o),t.length>0&&(0>i||0>r)||r>this.length)throw new RangeError("Attempt to write outside buffer bounds");e||(e="utf8");for(var h=!1;;)switch(e){case"hex":return C(this,t,r,i);case"utf8":case"utf-8":return b(this,t,r,i);case"ascii":return E(this,t,r,i);case"latin1":case"binary":return R(this,t,r,i);case"base64":return x(this,t,r,i);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return B(this,t,r,i);default:if(h)throw new TypeError("Unknown encoding: "+e);e=(""+e).toLowerCase(),h=!0}},n.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};var tt=4096;n.prototype.slice=function(t,r){var i=this.length;t=~~t,r=void 0===r?i:~~r,0>t?(t+=i,0>t&&(t=0)):t>i&&(t=i),0>r?(r+=i,0>r&&(r=0)):r>i&&(r=i),t>r&&(r=t);var e;if(n.TYPED_ARRAY_SUPPORT)e=this.subarray(t,r),e.__proto__=n.prototype;else{var o=r-t;e=new n(o,void 0);for(var h=0;o>h;++h)e[h]=this[h+t]}return e},n.prototype.readUIntLE=function(t,r,i){t=0|t,r=0|r,i||M(t,r,this.length);for(var e=this[t],o=1,h=0;++h<r&&(o*=256);)e+=this[t+h]*o;return e},n.prototype.readUIntBE=function(t,r,i){t=0|t,r=0|r,i||M(t,r,this.length);for(var e=this[t+--r],o=1;r>0&&(o*=256);)e+=this[t+--r]*o;return e},n.prototype.readUInt8=function(t,r){return r||M(t,1,this.length),this[t]},n.prototype.readUInt16LE=function(t,r){return r||M(t,2,this.length),this[t]|this[t+1]<<8},n.prototype.readUInt16BE=function(t,r){return r||M(t,2,this.length),this[t]<<8|this[t+1]},n.prototype.readUInt32LE=function(t,r){return r||M(t,4,this.length),(this[t]|this[t+1]<<8|this[t+2]<<16)+16777216*this[t+3]},n.prototype.readUInt32BE=function(t,r){return r||M(t,4,this.length),16777216*this[t]+(this[t+1]<<16|this[t+2]<<8|this[t+3])},n.prototype.readIntLE=function(t,r,i){t=0|t,r=0|r,i||M(t,r,this.length);for(var e=this[t],o=1,h=0;++h<r&&(o*=256);)e+=this[t+h]*o;return o*=128,e>=o&&(e-=Math.pow(2,8*r)),e},n.prototype.readIntBE=function(t,r,i){t=0|t,r=0|r,i||M(t,r,this.length);for(var e=r,o=1,h=this[t+--e];e>0&&(o*=256);)h+=this[t+--e]*o;return o*=128,h>=o&&(h-=Math.pow(2,8*r)),h},n.prototype.readInt8=function(t,r){return r||M(t,1,this.length),128&this[t]?-1*(255-this[t]+1):this[t]},n.prototype.readInt16LE=function(t,r){r||M(t,2,this.length);var i=this[t]|this[t+1]<<8;return 32768&i?4294901760|i:i},n.prototype.readInt16BE=function(t,r){r||M(t,2,this.length);var i=this[t+1]|this[t]<<8;return 32768&i?4294901760|i:i},n.prototype.readInt32LE=function(t,r){return r||M(t,4,this.length),this[t]|this[t+1]<<8|this[t+2]<<16|this[t+3]<<24},n.prototype.readInt32BE=function(t,r){return r||M(t,4,this.length),this[t]<<24|this[t+1]<<16|this[t+2]<<8|this[t+3]},n.prototype.readFloatLE=function(t,r){return r||M(t,4,this.length),W.read(this,t,!0,23,4)},n.prototype.readFloatBE=function(t,r){return r||M(t,4,this.length),W.read(this,t,!1,23,4)},n.prototype.readDoubleLE=function(t,r){return r||M(t,8,this.length),W.read(this,t,!0,52,8)},n.prototype.readDoubleBE=function(t,r){return r||M(t,8,this.length),W.read(this,t,!1,52,8)},n.prototype.writeUIntLE=function(t,r,i,e){if(t=+t,r=0|r,i=0|i,!e){var o=Math.pow(2,8*i)-1;L(this,t,r,i,o,0)}var h=1,n=0;for(this[r]=255&t;++n<i&&(h*=256);)this[r+n]=t/h&255;return r+i},n.prototype.writeUIntBE=function(t,r,i,e){if(t=+t,r=0|r,i=0|i,!e){var o=Math.pow(2,8*i)-1;L(this,t,r,i,o,0)}var h=i-1,n=1;for(this[r+h]=255&t;--h>=0&&(n*=256);)this[r+h]=t/n&255;return r+i},n.prototype.writeUInt8=function(t,r,i){return t=+t,r=0|r,i||L(this,t,r,1,255,0),n.TYPED_ARRAY_SUPPORT||(t=Math.floor(t)),this[r]=255&t,r+1},n.prototype.writeUInt16LE=function(t,r,i){return t=+t,r=0|r,i||L(this,t,r,2,65535,0),n.TYPED_ARRAY_SUPPORT?(this[r]=255&t,this[r+1]=t>>>8):O(this,t,r,!0),r+2},n.prototype.writeUInt16BE=function(t,r,i){return t=+t,r=0|r,i||L(this,t,r,2,65535,0),n.TYPED_ARRAY_SUPPORT?(this[r]=t>>>8,this[r+1]=255&t):O(this,t,r,!1),r+2},n.prototype.writeUInt32LE=function(t,r,i){return t=+t,r=0|r,i||L(this,t,r,4,4294967295,0),n.TYPED_ARRAY_SUPPORT?(this[r+3]=t>>>24,this[r+2]=t>>>16,this[r+1]=t>>>8,this[r]=255&t):N(this,t,r,!0),r+4},n.prototype.writeUInt32BE=function(t,r,i){return t=+t,r=0|r,i||L(this,t,r,4,4294967295,0),n.TYPED_ARRAY_SUPPORT?(this[r]=t>>>24,this[r+1]=t>>>16,this[r+2]=t>>>8,this[r+3]=255&t):N(this,t,r,!1),r+4},n.prototype.writeIntLE=function(t,r,i,e){if(t=+t,r=0|r,!e){var o=Math.pow(2,8*i-1);L(this,t,r,i,o-1,-o)}var h=0,n=1,s=0;for(this[r]=255&t;++h<i&&(n*=256);)0>t&&0===s&&0!==this[r+h-1]&&(s=1),this[r+h]=(t/n>>0)-s&255;return r+i},n.prototype.writeIntBE=function(t,r,i,e){if(t=+t,r=0|r,!e){var o=Math.pow(2,8*i-1);L(this,t,r,i,o-1,-o)}var h=i-1,n=1,s=0;for(this[r+h]=255&t;--h>=0&&(n*=256);)0>t&&0===s&&0!==this[r+h+1]&&(s=1),this[r+h]=(t/n>>0)-s&255;return r+i},n.prototype.writeInt8=function(t,r,i){return t=+t,r=0|r,i||L(this,t,r,1,127,-128),n.TYPED_ARRAY_SUPPORT||(t=Math.floor(t)),0>t&&(t=255+t+1),this[r]=255&t,r+1},n.prototype.writeInt16LE=function(t,r,i){return t=+t,r=0|r,i||L(this,t,r,2,32767,-32768),n.TYPED_ARRAY_SUPPORT?(this[r]=255&t,this[r+1]=t>>>8):O(this,t,r,!0),r+2},n.prototype.writeInt16BE=function(t,r,i){return t=+t,r=0|r,i||L(this,t,r,2,32767,-32768),n.TYPED_ARRAY_SUPPORT?(this[r]=t>>>8,this[r+1]=255&t):O(this,t,r,!1),r+2},n.prototype.writeInt32LE=function(t,r,i){return t=+t,r=0|r,i||L(this,t,r,4,2147483647,-2147483648),n.TYPED_ARRAY_SUPPORT?(this[r]=255&t,this[r+1]=t>>>8,this[r+2]=t>>>16,this[r+3]=t>>>24):N(this,t,r,!0),r+4},n.prototype.writeInt32BE=function(t,r,i){return t=+t,r=0|r,i||L(this,t,r,4,2147483647,-2147483648),0>t&&(t=4294967295+t+1),n.TYPED_ARRAY_SUPPORT?(this[r]=t>>>24,this[r+1]=t>>>16,this[r+2]=t>>>8,this[r+3]=255&t):N(this,t,r,!1),r+4},n.prototype.writeFloatLE=function(t,r,i){return k(this,t,r,!0,i)},n.prototype.writeFloatBE=function(t,r,i){return k(this,t,r,!1,i)},n.prototype.writeDoubleLE=function(t,r,i){return j(this,t,r,!0,i)},n.prototype.writeDoubleBE=function(t,r,i){return j(this,t,r,!1,i)},n.prototype.copy=function(t,r,i,e){if(i||(i=0),e||0===e||(e=this.length),r>=t.length&&(r=t.length),r||(r=0),e>0&&i>e&&(e=i),e===i)return 0;if(0===t.length||0===this.length)return 0;if(0>r)throw new RangeError("targetStart out of bounds");if(0>i||i>=this.length)throw new RangeError("sourceStart out of bounds");if(0>e)throw new RangeError("sourceEnd out of bounds");e>this.length&&(e=this.length),t.length-r<e-i&&(e=t.length-r+i);var o,h=e-i;if(this===t&&r>i&&e>r)for(o=h-1;o>=0;--o)t[o+r]=this[o+i];else if(1e3>h||!n.TYPED_ARRAY_SUPPORT)for(o=0;h>o;++o)t[o+r]=this[o+i];else Uint8Array.prototype.set.call(t,this.subarray(i,i+h),r);return h},n.prototype.fill=function(t,r,i,e){if("string"==typeof t){if("string"==typeof r?(e=r,r=0,i=this.length):"string"==typeof i&&(e=i,i=this.length),1===t.length){var o=t.charCodeAt(0);256>o&&(t=o)}if(void 0!==e&&"string"!=typeof e)throw new TypeError("encoding must be a string");if("string"==typeof e&&!n.isEncoding(e))throw new TypeError("Unknown encoding: "+e)}else"number"==typeof t&&(t=255&t);if(0>r||this.length<r||this.length<i)throw new RangeError("Out of range index");if(r>=i)return this;r>>>=0,i=void 0===i?this.length:i>>>0,t||(t=0);var h;if("number"==typeof t)for(h=r;i>h;++h)this[h]=t;else{var s=n.isBuffer(t)?t:H(new n(t,e).toString()),a=s.length;for(h=0;i-r>h;++h)this[h+r]=s[h%a]}return this};var rt=/[^+\/0-9A-Za-z-_]/g}).call(r,i(4))},function(t,r,i){r.UINT32=i(8),r.UINT64=i(9)},function(t,r,i){t.exports={h32:i(3),h64:i(10)}},function(t,r,i){(function(r){function e(t){for(var r=[],i=0,e=t.length;e>i;i++){var o=t.charCodeAt(i);128>o?r.push(o):2048>o?r.push(192|o>>6,128|63&o):55296>o||o>=57344?r.push(224|o>>12,128|o>>6&63,128|63&o):(i++,o=65536+((1023&o)<<10|1023&t.charCodeAt(i)),r.push(240|o>>18,128|o>>12&63,128|o>>6&63,128|63&o))}return new Uint8Array(r)}function o(){return 2==arguments.length?new o(arguments[1]).update(arguments[0]).digest():this instanceof o?void h.call(this,arguments[0]):new o(arguments[0])}function h(t){return this.seed=t instanceof n?t.clone():n(t),this.v1=this.seed.clone().add(s).add(a),this.v2=this.seed.clone().add(a),this.v3=this.seed.clone(),this.v4=this.seed.clone().subtract(s),this.total_len=0,this.memsize=0,this.memory=null,this}var n=i(1).UINT32;n.prototype.xxh_update=function(t,r){var i,e,o=a._low,h=a._high;e=t*o,i=e>>>16,i+=r*o,i&=65535,i+=t*h;var n=this._low+(65535&e),u=n>>>16;u+=this._high+(65535&i);var f=u<<16|65535&n;f=f<<13|f>>>19,n=65535&f,u=f>>>16,o=s._low,h=s._high,e=n*o,i=e>>>16,i+=u*o,i&=65535,i+=n*h,this._low=65535&e,this._high=65535&i};var s=n("2654435761"),a=n("2246822519"),u=n("3266489917"),f=n("668265263"),l=n("374761393");o.prototype.init=h,o.prototype.update=function(t){var i,o="string"==typeof t;o&&(t=e(t),o=!1,i=!0),"undefined"!=typeof ArrayBuffer&&t instanceof ArrayBuffer&&(i=!0,t=new Uint8Array(t));var h=0,n=t.length,s=h+n;if(0==n)return this;if(this.total_len+=n,0==this.memsize&&(this.memory=o?"":i?new Uint8Array(16):new r(16)),this.memsize+n<16)return o?this.memory+=t:i?this.memory.set(t.subarray(0,n),this.memsize):t.copy(this.memory,this.memsize,0,n),this.memsize+=n,this;if(this.memsize>0){o?this.memory+=t.slice(0,16-this.memsize):i?this.memory.set(t.subarray(0,16-this.memsize),this.memsize):t.copy(this.memory,this.memsize,0,16-this.memsize);var a=0;o?(this.v1.xxh_update(this.memory.charCodeAt(a+1)<<8|this.memory.charCodeAt(a),this.memory.charCodeAt(a+3)<<8|this.memory.charCodeAt(a+2)),a+=4,this.v2.xxh_update(this.memory.charCodeAt(a+1)<<8|this.memory.charCodeAt(a),this.memory.charCodeAt(a+3)<<8|this.memory.charCodeAt(a+2)),a+=4,this.v3.xxh_update(this.memory.charCodeAt(a+1)<<8|this.memory.charCodeAt(a),this.memory.charCodeAt(a+3)<<8|this.memory.charCodeAt(a+2)),a+=4,this.v4.xxh_update(this.memory.charCodeAt(a+1)<<8|this.memory.charCodeAt(a),this.memory.charCodeAt(a+3)<<8|this.memory.charCodeAt(a+2))):(this.v1.xxh_update(this.memory[a+1]<<8|this.memory[a],this.memory[a+3]<<8|this.memory[a+2]),a+=4,this.v2.xxh_update(this.memory[a+1]<<8|this.memory[a],this.memory[a+3]<<8|this.memory[a+2]),a+=4,this.v3.xxh_update(this.memory[a+1]<<8|this.memory[a],this.memory[a+3]<<8|this.memory[a+2]),a+=4,this.v4.xxh_update(this.memory[a+1]<<8|this.memory[a],this.memory[a+3]<<8|this.memory[a+2])),h+=16-this.memsize,this.memsize=0,o&&(this.memory="")}if(s-16>=h){var u=s-16;do o?(this.v1.xxh_update(t.charCodeAt(h+1)<<8|t.charCodeAt(h),t.charCodeAt(h+3)<<8|t.charCodeAt(h+2)),h+=4,this.v2.xxh_update(t.charCodeAt(h+1)<<8|t.charCodeAt(h),t.charCodeAt(h+3)<<8|t.charCodeAt(h+2)),h+=4,this.v3.xxh_update(t.charCodeAt(h+1)<<8|t.charCodeAt(h),t.charCodeAt(h+3)<<8|t.charCodeAt(h+2)),h+=4,this.v4.xxh_update(t.charCodeAt(h+1)<<8|t.charCodeAt(h),t.charCodeAt(h+3)<<8|t.charCodeAt(h+2))):(this.v1.xxh_update(t[h+1]<<8|t[h],t[h+3]<<8|t[h+2]),h+=4,this.v2.xxh_update(t[h+1]<<8|t[h],t[h+3]<<8|t[h+2]),h+=4,this.v3.xxh_update(t[h+1]<<8|t[h],t[h+3]<<8|t[h+2]),h+=4,this.v4.xxh_update(t[h+1]<<8|t[h],t[h+3]<<8|t[h+2])),h+=4;while(u>=h)}return s>h&&(o?this.memory+=t.slice(h):i?this.memory.set(t.subarray(h,s),this.memsize):t.copy(this.memory,this.memsize,h,s),this.memsize=s-h),this},o.prototype.digest=function(){var t,r,i=this.memory,e="string"==typeof i,o=0,h=this.memsize,c=new n;for(t=this.total_len>=16?this.v1.rotl(1).add(this.v2.rotl(7).add(this.v3.rotl(12).add(this.v4.rotl(18)))):this.seed.clone().add(l),t.add(c.fromNumber(this.total_len));h-4>=o;)e?c.fromBits(i.charCodeAt(o+1)<<8|i.charCodeAt(o),i.charCodeAt(o+3)<<8|i.charCodeAt(o+2)):c.fromBits(i[o+1]<<8|i[o],i[o+3]<<8|i[o+2]),t.add(c.multiply(u)).rotl(17).multiply(f),o+=4;for(;h>o;)c.fromBits(e?i.charCodeAt(o++):i[o++],0),t.add(c.multiply(l)).rotl(11).multiply(s);return r=t.clone().shiftRight(15),t.xor(r).multiply(a),r=t.clone().shiftRight(13),t.xor(r).multiply(u),r=t.clone().shiftRight(16),t.xor(r),this.init(this.seed),t},t.exports=o}).call(r,i(0).Buffer)},function(t){var r;r=function(){return this}();try{r=r||Function("return this")()||(1,eval)("this")}catch(i){"object"==typeof window&&(r=window)}t.exports=r},function(t,r){"use strict";function i(t){var r=t.length;if(r%4>0)throw new Error("Invalid string. Length must be a multiple of 4");return"="===t[r-2]?2:"="===t[r-1]?1:0}function e(t){return 3*t.length/4-i(t)}function o(t){var r,e,o,h,n,s=t.length;h=i(t),n=new f(3*s/4-h),e=h>0?s-4:s;var a=0;for(r=0;e>r;r+=4)o=u[t.charCodeAt(r)]<<18|u[t.charCodeAt(r+1)]<<12|u[t.charCodeAt(r+2)]<<6|u[t.charCodeAt(r+3)],n[a++]=o>>16&255,n[a++]=o>>8&255,n[a++]=255&o;return 2===h?(o=u[t.charCodeAt(r)]<<2|u[t.charCodeAt(r+1)]>>4,n[a++]=255&o):1===h&&(o=u[t.charCodeAt(r)]<<10|u[t.charCodeAt(r+1)]<<4|u[t.charCodeAt(r+2)]>>2,n[a++]=o>>8&255,n[a++]=255&o),n}function h(t){return a[t>>18&63]+a[t>>12&63]+a[t>>6&63]+a[63&t]}function n(t,r,i){for(var e,o=[],n=r;i>n;n+=3)e=(t[n]<<16)+(t[n+1]<<8)+t[n+2],o.push(h(e));return o.join("")}function s(t){for(var r,i=t.length,e=i%3,o="",h=[],s=16383,u=0,f=i-e;f>u;u+=s)h.push(n(t,u,u+s>f?f:u+s));return 1===e?(r=t[i-1],o+=a[r>>2],o+=a[r<<4&63],o+="=="):2===e&&(r=(t[i-2]<<8)+t[i-1],o+=a[r>>10],o+=a[r>>4&63],o+=a[r<<2&63],o+="="),h.push(o),h.join("")}r.byteLength=e,r.toByteArray=o,r.fromByteArray=s;for(var a=[],u=[],f="undefined"!=typeof Uint8Array?Uint8Array:Array,l="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",c=0,p=l.length;p>c;++c)a[c]=l[c],u[l.charCodeAt(c)]=c;u["-".charCodeAt(0)]=62,u["_".charCodeAt(0)]=63},function(t,r){r.read=function(t,r,i,e,o){var h,n,s=8*o-e-1,a=(1<<s)-1,u=a>>1,f=-7,l=i?o-1:0,c=i?-1:1,p=t[r+l];for(l+=c,h=p&(1<<-f)-1,p>>=-f,f+=s;f>0;h=256*h+t[r+l],l+=c,f-=8);for(n=h&(1<<-f)-1,h>>=-f,f+=e;f>0;n=256*n+t[r+l],l+=c,f-=8);if(0===h)h=1-u;else{if(h===a)return n?0/0:(p?-1:1)*(1/0);n+=Math.pow(2,e),h-=u}return(p?-1:1)*n*Math.pow(2,h-e)},r.write=function(t,r,i,e,o,h){var n,s,a,u=8*h-o-1,f=(1<<u)-1,l=f>>1,c=23===o?Math.pow(2,-24)-Math.pow(2,-77):0,p=e?0:h-1,m=e?1:-1,y=0>r||0===r&&0>1/r?1:0;for(r=Math.abs(r),isNaN(r)||r===1/0?(s=isNaN(r)?1:0,n=f):(n=Math.floor(Math.log(r)/Math.LN2),r*(a=Math.pow(2,-n))<1&&(n--,a*=2),r+=n+l>=1?c/a:c*Math.pow(2,1-l),r*a>=2&&(n++,a/=2),n+l>=f?(s=0,n=f):n+l>=1?(s=(r*a-1)*Math.pow(2,o),n+=l):(s=r*Math.pow(2,l-1)*Math.pow(2,o),n=0));o>=8;t[i+p]=255&s,p+=m,s/=256,o-=8);for(n=n<<o|s,u+=o;u>0;t[i+p]=255&n,p+=m,n/=256,u-=8);t[i+p-m]|=128*y}},function(t){var r={}.toString;t.exports=Array.isArray||function(t){return"[object Array]"==r.call(t)}},function(t,r){var i,e;!function(o){function h(t,r){return this instanceof h?(this._low=0,this._high=0,this.remainder=null,"undefined"==typeof r?s.call(this,t):"string"==typeof t?a.call(this,t,r):void n.call(this,t,r)):new h(t,r)}function n(t,r){return this._low=0|t,this._high=0|r,this}function s(t){return this._low=65535&t,this._high=t>>>16,this}function a(t,r){var i=parseInt(t,r||10);return this._low=65535&i,this._high=i>>>16,this}({36:h(Math.pow(36,5)),16:h(Math.pow(16,7)),10:h(Math.pow(10,9)),2:h(Math.pow(2,30))}),{36:h(36),16:h(16),10:h(10),2:h(2)};h.prototype.fromBits=n,h.prototype.fromNumber=s,h.prototype.fromString=a,h.prototype.toNumber=function(){return 65536*this._high+this._low},h.prototype.toString=function(t){return this.toNumber().toString(t||10)},h.prototype.add=function(t){var r=this._low+t._low,i=r>>>16;return i+=this._high+t._high,this._low=65535&r,this._high=65535&i,this},h.prototype.subtract=function(t){return this.add(t.clone().negate())},h.prototype.multiply=function(t){var r,i,e=this._high,o=this._low,h=t._high,n=t._low;return i=o*n,r=i>>>16,r+=e*n,r&=65535,r+=o*h,this._low=65535&i,this._high=65535&r,this},h.prototype.div=function(t){if(0==t._low&&0==t._high)throw Error("division by zero");if(0==t._high&&1==t._low)return this.remainder=new h(0),this;if(t.gt(this))return this.remainder=this.clone(),this._low=0,this._high=0,this;if(this.eq(t))return this.remainder=new h(0),this._low=1,this._high=0,this;for(var r=t.clone(),i=-1;!this.lt(r);)r.shiftLeft(1,!0),i++;for(this.remainder=this.clone(),this._low=0,this._high=0;i>=0;i--)r.shiftRight(1),this.remainder.lt(r)||(this.remainder.subtract(r),i>=16?this._high|=1<<i-16:this._low|=1<<i);return this},h.prototype.negate=function(){var t=(65535&~this._low)+1;return this._low=65535&t,this._high=~this._high+(t>>>16)&65535,this},h.prototype.equals=h.prototype.eq=function(t){return this._low==t._low&&this._high==t._high},h.prototype.greaterThan=h.prototype.gt=function(t){return this._high>t._high?!0:this._high<t._high?!1:this._low>t._low},h.prototype.lessThan=h.prototype.lt=function(t){return this._high<t._high?!0:this._high>t._high?!1:this._low<t._low},h.prototype.or=function(t){return this._low|=t._low,this._high|=t._high,this},h.prototype.and=function(t){return this._low&=t._low,this._high&=t._high,this},h.prototype.not=function(){return this._low=65535&~this._low,this._high=65535&~this._high,this},h.prototype.xor=function(t){return this._low^=t._low,this._high^=t._high,this},h.prototype.shiftRight=h.prototype.shiftr=function(t){return t>16?(this._low=this._high>>t-16,this._high=0):16==t?(this._low=this._high,this._high=0):(this._low=this._low>>t|this._high<<16-t&65535,this._high>>=t),this},h.prototype.shiftLeft=h.prototype.shiftl=function(t,r){return t>16?(this._high=this._low<<t-16,this._low=0,r||(this._high&=65535)):16==t?(this._high=this._low,this._low=0):(this._high=this._high<<t|this._low>>16-t,this._low=this._low<<t&65535,r||(this._high&=65535)),this},h.prototype.rotateLeft=h.prototype.rotl=function(t){var r=this._high<<16|this._low;return r=r<<t|r>>>32-t,this._low=65535&r,this._high=r>>>16,this},h.prototype.rotateRight=h.prototype.rotr=function(t){var r=this._high<<16|this._low;return r=r>>>t|r<<32-t,this._low=65535&r,this._high=r>>>16,this},h.prototype.clone=function(){return new h(this._low,this._high)},i=[],e=function(){return h}.apply(r,i),!(void 0!==e&&(t.exports=e))}(this)},function(t,r){var i,e;!function(o){function h(t,r,i,e){return this instanceof h?(this.remainder=null,"string"==typeof t?a.call(this,t,r):"undefined"==typeof r?s.call(this,t):void n.apply(this,arguments)):new h(t,r,i,e)}function n(t,r,i,e){return"undefined"==typeof i?(this._a00=65535&t,this._a16=t>>>16,this._a32=65535&r,this._a48=r>>>16,this):(this._a00=0|t,this._a16=0|r,this._a32=0|i,this._a48=0|e,this)}function s(t){return this._a00=65535&t,this._a16=t>>>16,this._a32=0,this._a48=0,this}function a(t,r){r=r||10,this._a00=0,this._a16=0,this._a32=0,this._a48=0;for(var i=u[r]||new h(Math.pow(r,5)),e=0,o=t.length;o>e;e+=5){var n=Math.min(5,o-e),s=parseInt(t.slice(e,e+n),r);this.multiply(5>n?new h(Math.pow(r,n)):i).add(new h(s))}return this}var u={16:h(Math.pow(16,5)),10:h(Math.pow(10,5)),2:h(Math.pow(2,5))},f={16:h(16),10:h(10),2:h(2)};h.prototype.fromBits=n,h.prototype.fromNumber=s,h.prototype.fromString=a,h.prototype.toNumber=function(){return 65536*this._a16+this._a00},h.prototype.toString=function(t){t=t||10;

  var r=f[t]||new h(t);if(!this.gt(r))return this.toNumber().toString(t);for(var i=this.clone(),e=new Array(64),o=63;o>=0&&(i.div(r),e[o]=i.remainder.toNumber().toString(t),i.gt(r));o--);return e[o-1]=i.toNumber().toString(t),e.join("")},h.prototype.add=function(t){var r=this._a00+t._a00,i=r>>>16;i+=this._a16+t._a16;var e=i>>>16;e+=this._a32+t._a32;var o=e>>>16;return o+=this._a48+t._a48,this._a00=65535&r,this._a16=65535&i,this._a32=65535&e,this._a48=65535&o,this},h.prototype.subtract=function(t){return this.add(t.clone().negate())},h.prototype.multiply=function(t){var r=this._a00,i=this._a16,e=this._a32,o=this._a48,h=t._a00,n=t._a16,s=t._a32,a=t._a48,u=r*h,f=u>>>16;f+=r*n;var l=f>>>16;f&=65535,f+=i*h,l+=f>>>16,l+=r*s;var c=l>>>16;return l&=65535,l+=i*n,c+=l>>>16,l&=65535,l+=e*h,c+=l>>>16,c+=r*a,c&=65535,c+=i*s,c&=65535,c+=e*n,c&=65535,c+=o*h,this._a00=65535&u,this._a16=65535&f,this._a32=65535&l,this._a48=65535&c,this},h.prototype.div=function(t){if(0==t._a16&&0==t._a32&&0==t._a48){if(0==t._a00)throw Error("division by zero");if(1==t._a00)return this.remainder=new h(0),this}if(t.gt(this))return this.remainder=this.clone(),this._a00=0,this._a16=0,this._a32=0,this._a48=0,this;if(this.eq(t))return this.remainder=new h(0),this._a00=1,this._a16=0,this._a32=0,this._a48=0,this;for(var r=t.clone(),i=-1;!this.lt(r);)r.shiftLeft(1,!0),i++;for(this.remainder=this.clone(),this._a00=0,this._a16=0,this._a32=0,this._a48=0;i>=0;i--)r.shiftRight(1),this.remainder.lt(r)||(this.remainder.subtract(r),i>=48?this._a48|=1<<i-48:i>=32?this._a32|=1<<i-32:i>=16?this._a16|=1<<i-16:this._a00|=1<<i);return this},h.prototype.negate=function(){var t=(65535&~this._a00)+1;return this._a00=65535&t,t=(65535&~this._a16)+(t>>>16),this._a16=65535&t,t=(65535&~this._a32)+(t>>>16),this._a32=65535&t,this._a48=~this._a48+(t>>>16)&65535,this},h.prototype.equals=h.prototype.eq=function(t){return this._a48==t._a48&&this._a00==t._a00&&this._a32==t._a32&&this._a16==t._a16},h.prototype.greaterThan=h.prototype.gt=function(t){return this._a48>t._a48?!0:this._a48<t._a48?!1:this._a32>t._a32?!0:this._a32<t._a32?!1:this._a16>t._a16?!0:this._a16<t._a16?!1:this._a00>t._a00},h.prototype.lessThan=h.prototype.lt=function(t){return this._a48<t._a48?!0:this._a48>t._a48?!1:this._a32<t._a32?!0:this._a32>t._a32?!1:this._a16<t._a16?!0:this._a16>t._a16?!1:this._a00<t._a00},h.prototype.or=function(t){return this._a00|=t._a00,this._a16|=t._a16,this._a32|=t._a32,this._a48|=t._a48,this},h.prototype.and=function(t){return this._a00&=t._a00,this._a16&=t._a16,this._a32&=t._a32,this._a48&=t._a48,this},h.prototype.xor=function(t){return this._a00^=t._a00,this._a16^=t._a16,this._a32^=t._a32,this._a48^=t._a48,this},h.prototype.not=function(){return this._a00=65535&~this._a00,this._a16=65535&~this._a16,this._a32=65535&~this._a32,this._a48=65535&~this._a48,this},h.prototype.shiftRight=h.prototype.shiftr=function(t){return t%=64,t>=48?(this._a00=this._a48>>t-48,this._a16=0,this._a32=0,this._a48=0):t>=32?(t-=32,this._a00=65535&(this._a32>>t|this._a48<<16-t),this._a16=this._a48>>t&65535,this._a32=0,this._a48=0):t>=16?(t-=16,this._a00=65535&(this._a16>>t|this._a32<<16-t),this._a16=65535&(this._a32>>t|this._a48<<16-t),this._a32=this._a48>>t&65535,this._a48=0):(this._a00=65535&(this._a00>>t|this._a16<<16-t),this._a16=65535&(this._a16>>t|this._a32<<16-t),this._a32=65535&(this._a32>>t|this._a48<<16-t),this._a48=this._a48>>t&65535),this},h.prototype.shiftLeft=h.prototype.shiftl=function(t,r){return t%=64,t>=48?(this._a48=this._a00<<t-48,this._a32=0,this._a16=0,this._a00=0):t>=32?(t-=32,this._a48=this._a16<<t|this._a00>>16-t,this._a32=this._a00<<t&65535,this._a16=0,this._a00=0):t>=16?(t-=16,this._a48=this._a32<<t|this._a16>>16-t,this._a32=65535&(this._a16<<t|this._a00>>16-t),this._a16=this._a00<<t&65535,this._a00=0):(this._a48=this._a48<<t|this._a32>>16-t,this._a32=65535&(this._a32<<t|this._a16>>16-t),this._a16=65535&(this._a16<<t|this._a00>>16-t),this._a00=this._a00<<t&65535),r||(this._a48&=65535),this},h.prototype.rotateLeft=h.prototype.rotl=function(t){if(t%=64,0==t)return this;if(t>=32){var r=this._a00;if(this._a00=this._a32,this._a32=r,r=this._a48,this._a48=this._a16,this._a16=r,32==t)return this;t-=32}var i=this._a48<<16|this._a32,e=this._a16<<16|this._a00,o=i<<t|e>>>32-t,h=e<<t|i>>>32-t;return this._a00=65535&h,this._a16=h>>>16,this._a32=65535&o,this._a48=o>>>16,this},h.prototype.rotateRight=h.prototype.rotr=function(t){if(t%=64,0==t)return this;if(t>=32){var r=this._a00;if(this._a00=this._a32,this._a32=r,r=this._a48,this._a48=this._a16,this._a16=r,32==t)return this;t-=32}var i=this._a48<<16|this._a32,e=this._a16<<16|this._a00,o=i>>>t|e<<32-t,h=e>>>t|i<<32-t;return this._a00=65535&h,this._a16=h>>>16,this._a32=65535&o,this._a48=o>>>16,this},h.prototype.clone=function(){return new h(this._a00,this._a16,this._a32,this._a48)},i=[],e=function(){return h}.apply(r,i),!(void 0!==e&&(t.exports=e))}(this)},function(t,r,i){(function(r){function e(t){for(var r=[],i=0,e=t.length;e>i;i++){var o=t.charCodeAt(i);128>o?r.push(o):2048>o?r.push(192|o>>6,128|63&o):55296>o||o>=57344?r.push(224|o>>12,128|o>>6&63,128|63&o):(i++,o=65536+((1023&o)<<10|1023&t.charCodeAt(i)),r.push(240|o>>18,128|o>>12&63,128|o>>6&63,128|63&o))}return new Uint8Array(r)}function o(){return 2==arguments.length?new o(arguments[1]).update(arguments[0]).digest():this instanceof o?void h.call(this,arguments[0]):new o(arguments[0])}function h(t){return this.seed=t instanceof n?t.clone():n(t),this.v1=this.seed.clone().add(s).add(a),this.v2=this.seed.clone().add(a),this.v3=this.seed.clone(),this.v4=this.seed.clone().subtract(s),this.total_len=0,this.memsize=0,this.memory=null,this}var n=i(1).UINT64,s=n("11400714785074694791"),a=n("14029467366897019727"),u=n("1609587929392839161"),f=n("9650029242287828579"),l=n("2870177450012600261");o.prototype.init=h,o.prototype.update=function(t){var i,o="string"==typeof t;o&&(t=e(t),o=!1,i=!0),"undefined"!=typeof ArrayBuffer&&t instanceof ArrayBuffer&&(i=!0,t=new Uint8Array(t));var h=0,u=t.length,f=h+u;if(0==u)return this;if(this.total_len+=u,0==this.memsize&&(this.memory=o?"":i?new Uint8Array(32):new r(32)),this.memsize+u<32)return o?this.memory+=t:i?this.memory.set(t.subarray(0,u),this.memsize):t.copy(this.memory,this.memsize,0,u),this.memsize+=u,this;if(this.memsize>0){o?this.memory+=t.slice(0,32-this.memsize):i?this.memory.set(t.subarray(0,32-this.memsize),this.memsize):t.copy(this.memory,this.memsize,0,32-this.memsize);var l=0;if(o){var c;c=n(this.memory.charCodeAt(l+1)<<8|this.memory.charCodeAt(l),this.memory.charCodeAt(l+3)<<8|this.memory.charCodeAt(l+2),this.memory.charCodeAt(l+5)<<8|this.memory.charCodeAt(l+4),this.memory.charCodeAt(l+7)<<8|this.memory.charCodeAt(l+6)),this.v1.add(c.multiply(a)).rotl(31).multiply(s),l+=8,c=n(this.memory.charCodeAt(l+1)<<8|this.memory.charCodeAt(l),this.memory.charCodeAt(l+3)<<8|this.memory.charCodeAt(l+2),this.memory.charCodeAt(l+5)<<8|this.memory.charCodeAt(l+4),this.memory.charCodeAt(l+7)<<8|this.memory.charCodeAt(l+6)),this.v2.add(c.multiply(a)).rotl(31).multiply(s),l+=8,c=n(this.memory.charCodeAt(l+1)<<8|this.memory.charCodeAt(l),this.memory.charCodeAt(l+3)<<8|this.memory.charCodeAt(l+2),this.memory.charCodeAt(l+5)<<8|this.memory.charCodeAt(l+4),this.memory.charCodeAt(l+7)<<8|this.memory.charCodeAt(l+6)),this.v3.add(c.multiply(a)).rotl(31).multiply(s),l+=8,c=n(this.memory.charCodeAt(l+1)<<8|this.memory.charCodeAt(l),this.memory.charCodeAt(l+3)<<8|this.memory.charCodeAt(l+2),this.memory.charCodeAt(l+5)<<8|this.memory.charCodeAt(l+4),this.memory.charCodeAt(l+7)<<8|this.memory.charCodeAt(l+6)),this.v4.add(c.multiply(a)).rotl(31).multiply(s)}else{var c;c=n(this.memory[l+1]<<8|this.memory[l],this.memory[l+3]<<8|this.memory[l+2],this.memory[l+5]<<8|this.memory[l+4],this.memory[l+7]<<8|this.memory[l+6]),this.v1.add(c.multiply(a)).rotl(31).multiply(s),l+=8,c=n(this.memory[l+1]<<8|this.memory[l],this.memory[l+3]<<8|this.memory[l+2],this.memory[l+5]<<8|this.memory[l+4],this.memory[l+7]<<8|this.memory[l+6]),this.v2.add(c.multiply(a)).rotl(31).multiply(s),l+=8,c=n(this.memory[l+1]<<8|this.memory[l],this.memory[l+3]<<8|this.memory[l+2],this.memory[l+5]<<8|this.memory[l+4],this.memory[l+7]<<8|this.memory[l+6]),this.v3.add(c.multiply(a)).rotl(31).multiply(s),l+=8,c=n(this.memory[l+1]<<8|this.memory[l],this.memory[l+3]<<8|this.memory[l+2],this.memory[l+5]<<8|this.memory[l+4],this.memory[l+7]<<8|this.memory[l+6]),this.v4.add(c.multiply(a)).rotl(31).multiply(s)}h+=32-this.memsize,this.memsize=0,o&&(this.memory="")}if(f-32>=h){var p=f-32;do{if(o){var c;c=n(t.charCodeAt(h+1)<<8|t.charCodeAt(h),t.charCodeAt(h+3)<<8|t.charCodeAt(h+2),t.charCodeAt(h+5)<<8|t.charCodeAt(h+4),t.charCodeAt(h+7)<<8|t.charCodeAt(h+6)),this.v1.add(c.multiply(a)).rotl(31).multiply(s),h+=8,c=n(t.charCodeAt(h+1)<<8|t.charCodeAt(h),t.charCodeAt(h+3)<<8|t.charCodeAt(h+2),t.charCodeAt(h+5)<<8|t.charCodeAt(h+4),t.charCodeAt(h+7)<<8|t.charCodeAt(h+6)),this.v2.add(c.multiply(a)).rotl(31).multiply(s),h+=8,c=n(t.charCodeAt(h+1)<<8|t.charCodeAt(h),t.charCodeAt(h+3)<<8|t.charCodeAt(h+2),t.charCodeAt(h+5)<<8|t.charCodeAt(h+4),t.charCodeAt(h+7)<<8|t.charCodeAt(h+6)),this.v3.add(c.multiply(a)).rotl(31).multiply(s),h+=8,c=n(t.charCodeAt(h+1)<<8|t.charCodeAt(h),t.charCodeAt(h+3)<<8|t.charCodeAt(h+2),t.charCodeAt(h+5)<<8|t.charCodeAt(h+4),t.charCodeAt(h+7)<<8|t.charCodeAt(h+6)),this.v4.add(c.multiply(a)).rotl(31).multiply(s)}else{var c;c=n(t[h+1]<<8|t[h],t[h+3]<<8|t[h+2],t[h+5]<<8|t[h+4],t[h+7]<<8|t[h+6]),this.v1.add(c.multiply(a)).rotl(31).multiply(s),h+=8,c=n(t[h+1]<<8|t[h],t[h+3]<<8|t[h+2],t[h+5]<<8|t[h+4],t[h+7]<<8|t[h+6]),this.v2.add(c.multiply(a)).rotl(31).multiply(s),h+=8,c=n(t[h+1]<<8|t[h],t[h+3]<<8|t[h+2],t[h+5]<<8|t[h+4],t[h+7]<<8|t[h+6]),this.v3.add(c.multiply(a)).rotl(31).multiply(s),h+=8,c=n(t[h+1]<<8|t[h],t[h+3]<<8|t[h+2],t[h+5]<<8|t[h+4],t[h+7]<<8|t[h+6]),this.v4.add(c.multiply(a)).rotl(31).multiply(s)}h+=8}while(p>=h)}return f>h&&(o?this.memory+=t.slice(h):i?this.memory.set(t.subarray(h,f),this.memsize):t.copy(this.memory,this.memsize,h,f),this.memsize=f-h),this},o.prototype.digest=function(){var t,r,i=this.memory,e="string"==typeof i,o=0,h=this.memsize,c=new n;for(this.total_len>=32?(t=this.v1.clone().rotl(1),t.add(this.v2.clone().rotl(7)),t.add(this.v3.clone().rotl(12)),t.add(this.v4.clone().rotl(18)),t.xor(this.v1.multiply(a).rotl(31).multiply(s)),t.multiply(s).add(f),t.xor(this.v2.multiply(a).rotl(31).multiply(s)),t.multiply(s).add(f),t.xor(this.v3.multiply(a).rotl(31).multiply(s)),t.multiply(s).add(f),t.xor(this.v4.multiply(a).rotl(31).multiply(s)),t.multiply(s).add(f)):t=this.seed.clone().add(l),t.add(c.fromNumber(this.total_len));h-8>=o;)e?c.fromBits(i.charCodeAt(o+1)<<8|i.charCodeAt(o),i.charCodeAt(o+3)<<8|i.charCodeAt(o+2),i.charCodeAt(o+5)<<8|i.charCodeAt(o+4),i.charCodeAt(o+7)<<8|i.charCodeAt(o+6)):c.fromBits(i[o+1]<<8|i[o],i[o+3]<<8|i[o+2],i[o+5]<<8|i[o+4],i[o+7]<<8|i[o+6]),c.multiply(a).rotl(31).multiply(s),t.xor(c).rotl(27).multiply(s).add(f),o+=8;for(h>=o+4&&(e?c.fromBits(i.charCodeAt(o+1)<<8|i.charCodeAt(o),i.charCodeAt(o+3)<<8|i.charCodeAt(o+2),0,0):c.fromBits(i[o+1]<<8|i[o],i[o+3]<<8|i[o+2],0,0),t.xor(c.multiply(s)).rotl(23).multiply(a).add(u),o+=4);h>o;)c.fromBits(e?i.charCodeAt(o++):i[o++],0,0,0),t.xor(c.multiply(l)).rotl(11).multiply(s);return r=t.clone().shiftRight(33),t.xor(r).multiply(a),r=t.clone().shiftRight(29),t.xor(r).multiply(u),r=t.clone().shiftRight(32),t.xor(r),this.init(this.seed),t},t.exports=o}).call(r,i(0).Buffer)}])});
