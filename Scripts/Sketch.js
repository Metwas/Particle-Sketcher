/**
* @summary This abstract class acts as a base class which is to uniquely create and identify different sketches that are used to draw on the canvas
* @param {String} name The unique name for the sketch
* @param {CanvasRenderingContext2D} context The rendering context
*/
function Sketch(name, context) {
    this.name = name;
    // generate a id based off a global static id that holds all the sketches
    this.sketchID = this.name + (++Sketch.ID || 0);
    this.context = context || document.getElementsByTagName("CANVAS").getContext("2d");
    // In case a developer creates a new instance of this base class sketch, throw an error
    // Object.create will not create a new instance of this class, but rather pass its properties to the decendant classes
    throw new error("Not to implement abstract classes");
}


/**
* @summary Initializes the sketch, which can be overridden by decendant classes
*/
Sketch.prototype.initialize = function () {
    console.log("Initialization function has not been overridden");
};


/**
* @summary The main animation sketch per request frame, which can be overridden by decendant classes
*/
Sketch.prototype.update = function () {
    console.log("Initialization function has not been overridden");
};
