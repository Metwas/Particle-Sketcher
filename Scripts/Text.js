/*
        Code by: Metwas,
        Description: Particle text sketcher,
        Date: 06/12/18
 */

//==================================================================== Class Definitions =================================================================================//

/**
* @summary This particle class will be used to render out a text based of points in a ImageData buffer from the context
*/
class Particle {
    /**
    * @param {Number} posX The position of a point in a text
    */
    constructor(posX, posY) {
        this.x = Math.floor(random(-windowWidth, windowWidth));
        this.y = Math.floor(random(-windowHeight, windowHeight));
        this.radius = random(windowWidth * 0.001, windowWidth * 0.004);
        this.velX = random(5, 15);
        this.velY = random(5, 15);
        this.accX = 0;
        this.accY = 0;
        this.friction = random(0.6, 0.98);

        this.pointX = posX;
        this.pointY = posY;

        this.color = "steelblue";
    }
}

/**
* @summary Calculates the amount of velocity and acceleration from the particles current postion and the fine destination point
*/
Particle.prototype.draw = function () {
    this.accX = (this.pointX - this.x) / 150;
    this.accY = (this.pointY - this.y) / 150;
    this.velX += this.accX;
    this.velY += this.accY;

    // slow the particle's velocity by its frictional force value
    this.velX *= this.friction;
    this.velY *= this.friction;

    this.x += this.velX;
    this.y += this.velY;

    // draw the particle
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
};

/**
* @summary Vibrates the particles based off a given amount
* @param {Number} amount The amount value to vibrate
*/
Particle.prototype.vibrate = function (amount) {
    var _amount = amount || 15;

    this.accX = (this.pointX - this.x - random(-_amount, _amount)) / 100;
    this.accY = (this.pointY - this.y - random(-_amount, _amount)) / 100;
    this.velX += this.accX;
    this.velY += this.accY;

    // slow the particle's velocity by its frictional force value
    this.velX *= this.friction;
    this.velY *= this.friction;

    this.x += this.velX;
    this.y += this.velY;
};


/**
* @summary Reacts to a set of mouse coordinates which are supplied by the user moving the mouse or by touch
*/
Particle.prototype.mouseDetect = function () {
    var _disX = this.x - mouse.x;
    var _disY = this.y - mouse.y;

    var _distance = Math.sqrt((_disX * _disX) + (_disY * _disY));

    if (_distance < 80) {
        this.accX = (this.x - mouse.x) / 125;
        this.accY = (this.y - mouse.y) / 125;
        this.velX += this.accX;
        this.velY += this.accY;
    }
};


//==================================================================== Global definitions ====================================================================//

var canvas = {},
    ctx = {};

var windowWidth = window.innerWidth,
    windowHeight = window.innerHeight;

var canvasWidth = windowWidth,
    canvasHeight = windowHeight;

var mouse = { x: 0, y: 0 };

var particles = [];
var particleCount = 0;
var _resolution = 150;
var colors = [];

var input = document.getElementById("input");

//==================================================================== Event handlers =================================================================================//

/**
 * @summary Handles any mouse movement and passes the mouse x and y coordinates to the mouse object
 */
function mouseMove(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
}


/**
 * @summary Handles once the touch has ended
 */
function touchEnd(event) {
    // move coordiates out of view from the canvas
    mouse.x = -windowWidth * 2;
    mouse.y = -windowHeight * 2;
}


/**
 * @summary Handles any touch input from the user
 */
function touchMove(event) {
    if (event.touches.length > 0) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    }
}


/**
 * @summary The main animation sketch per request frame
 */
function sketch(event) {
    requestAnimationFrame(sketch);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particleCount; i++) {
        particles[i].draw();
        particles[i].mouseDetect();
        particles[i].vibrate();
    }
}


/**
 * @summary The main animation sketch per request frame
 */
function initialize() {
    windowWidth = canvas.width = window.innerWidth;
    windowHeight = canvas.height = window.innerHeight;
    input = document.getElementById("input") || { value: "Hello world!" };
    _resolution = 150;

    particles = [];
    colors = ["#009FFF", "steelblue", "#1D2671", "#12c2e9", "#4A569D"];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // font styles
    ctx.font = "bold " + windowWidth / 8 + "px " + getComputedStyleProperty(input, "font-family");
    ctx.textAlign = "center";
    ctx.fillText(input.value, getCenteredCoordinates(0, windowWidth), getCenteredCoordinates(0, windowHeight));
    ctx.globalCompositeOperation = "screen";

    // get points from the text
    var _data = getImageData(windowWidth, windowHeight);
    var _additionWidth = Math.round(windowWidth / _resolution);
    var _additionHeight = Math.round(windowWidth / _resolution);

    for (var i = 0; i < windowWidth; i += _additionWidth)
        for (var j = 0; j < windowHeight; j += _additionHeight) {
            if (_data[((i + j * windowWidth) * 4) + 3] >= 150) {
                var _particle = new Particle(i, j);
                _particle.color = getRandomColor();
                particles.push(_particle);
            }
        }

    particleCount = particles.length;
}


/**
 * @summary Event handler for when the window has started loading
 */
window.onload = function (event) {
    canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d");

    initialize();
    // gets animation frame and starts the animation
    requestAnimationFrame(sketch);

    // add event listeners
    input.addEventListener("keyup", initialize);
    window.addEventListener("resize", initialize);
    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("touchend", touchEnd);
    window.addEventListener("touchmove", touchEnd);
}



//==================================================================== Helper functions =================================================================================//

/**
 * @summary Maps a value to a range between a specifed maximum and minimum
 * @param {Number} value The arbitrary number to be mapped
 * @param {Number} minFrom The minimum value to start
 * @param {Number} maxFrom The maximum value to start
 * @param {Number} minTo The minimum end value
 * @param {Number} maxTo The maximum end value
 * @returns {Number} a new value thats mapped correspondingly between the enter parameters
 */
function map(value, minFrom, maxFrom, minTo, maxTo) {

    if (value === null || value === 'undefined')
        return;

    return (value - minFrom) * (maxTo - minTo) / (maxFrom - minFrom) + minTo;
}


/**
 * @summary returns the center of the object based of its position and dimension
 * @param {Number} position The cartisian axis value
 * @param {Number} dimension A dimesion of a cartisian mapped shape, either width,height, radius, etc...
 * @returns {Number} The centered cartisian axis point
 */
function getCenteredCoordinates(position, dimension) {
    return (dimension - position) / 2;
}


/**
 * @summary Generates a random rgb color and returns it as a string
*/
function getRandomColor(r) {
    return 'rgba(' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ',1)';
}


/**
 * @summary Gets a random number between two points
 * @param {Number} min The minimum value
 * @param {Number} min The maximum value
 */
function random(min, max) {
    var rand = Math.random();

    if (typeof min === "undefined") {
        return rand;
    } else if (typeof max === "undefined") {
        return Math.floor(rand * min);
    } else {
        // get the highest of the two supplied values
        if (min > max) {
            // swap the values
            var temp = min;
            min = max;
            max = temp;
        }

        return rand * (max - min) + min;
    }
}


/**
 * @summary Gets a random element in an array
 * @param {Array} array The array
 */
function randomArray(arr) {
    if (typeof arr === "undefined")
        return;

    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * @summary Retrieves image data from the canvas context
 */
function getImageData(width, height) {
    return ctx.getImageData(0, 0, width, height).data;
}

/**
 * @summary Retrieves a css style property off a given element
 * @param {HTMLElement} element The HTML DOM element
 * @param {String} cssProperty The property to retrieve from the HTML element
 */
function getComputedStyleProperty(element, cssProperty) {
    if (element instanceof HTMLElement)
        return window.getComputedStyle(element, null).getPropertyValue(cssProperty);;
}
