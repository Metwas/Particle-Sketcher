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
var resolution = 180;
var alphaThreshold = 255;
var sketches = [];
var currentSketch = {};

var input = document.getElementById("input"),
    mainContent = document.getElementById("main"),
    burgerLink = document.getElementById("burger-link"),
    menu = document.getElementById("menu-container"),
    controlContainer = document.getElementById("control-container");

//==================================================================== Event handlers =================================================================================//

/**
 * @summary Handles any mouse movement and passes the mouse x and y coordinates to the mouse object
 */
function mouseMove(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
}


/**
 * @summary The main sketch draw per frame
 */
function drawFrame() {
    requestAnimationFrame(drawFrame);
    currentSketch.update();
}


/**
 * @summary Event handler for when the window has started loading
 */
window.onload = function (event) {
    canvas = document.getElementById("canvas"),
        ctx = canvas.getContext("2d"),
        input = document.getElementById("input"),
        mainContent = document.getElementById("main"),
        burgerLink = document.getElementById("burger-link"),
        menu = document.getElementById("menu-container"),
        controlContainer = document.getElementById("control-container");

    var _textsketch = new FontSketch("text", ctx);
    var _imagesketch = new ImageSketch();

    sketches.push(_textsketch);
    sketches.push(_imagesketch);

    if (loadSketch("text", false)) {
        requestAnimationFrame(drawFrame);
    }

    // add event listeners
    input.addEventListener("keyup", textChanged);
    window.addEventListener("resize", function () { loadSketch(currentSketch.name); });
    window.addEventListener("mousemove", mouseMove);
    // add menu hover event listener
    burgerLink.addEventListener("mouseover", mouseOverMenu);
    burgerLink.addEventListener("mouseleave", mousLeaveMenu);
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
* @summary Calculates a specific position that will be used within a one dimesional array
* @param {Number} x The position in a row (0 indexed)
* @param {Number} y The position in a column (0 indexed)
* @param {Number} width The total width to calculate over
* @returns {Number} The point or position that can be used in a one dimensional array
*/
function getCoordinates2D(x, y, width) {
    // The total number of channels per pixel RGBA
    const _channelLength = 4;
    const _channel = y * (width * _channelLength) + x * 4;
    return [_channel, _channel + 1, _channel + 2, _channel + 3];
}


/**
* @summary Obtains the index position based off the given x and y coordinates (one dimensional algorithm)
* @param {Number} x The x coordinate
* @param {Number} y The y coordinate
* @param {Number} width The width of a row on the canvas
* @param {Uint8ClampedArray} imageData The one dimensional array of the buffered data in a CanvasRenderingContext2D object
* @returns {Pixel} returns a single instance of a Pixel object with the correct RGBA value representation at that index position
*/
function createPixelFromCoordinates(x, y, width, imageData) {

    // obtain a set pixel by iterating through in multiples of the channel lengrh
    const channels = getCoordinates2D(x, y, width);

    // obtain each color chennel, positioned by R = 0, G = 1, B = 2, A = 3
    const red = imageData[channels[0]];
    const green = imageData[channels[1]];
    const blue = imageData[channels[2]];
    const alpha = imageData[channels[3]];

    var _pixel = Pixel.createPixel(x, y, red, green, blue, alpha / 255);

    return _pixel;
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
 * @summary Sets the image to a new dimension whilst maintaining the aspect ratio
 * @param {Image} image The image to calculate
 * @param {Number} desiredDimension The new dimension to set the image to, either width or height
 * @returns {Object} The dimensions that have been set
*/
function setImageDimension(image, desiredDimension) {
    var _ratio = getImageAspectRatio(image).ratio;
    var _dimension = 0;
    // the formulae for this ratio would be greater than one if the width is greater than the height
    if(_ratio >= 1){
    _dimension = (desiredDimension / _ratio); 
     return { width: desiredDimension, height: _dimension };
    }else{
      _dimension = (desiredDimension * _ratio); 
      return { width: _dimension, height: desiredDimension };   
    }
}


/**
 * @summary Calculates a given images aspect ratio
 * @param {Image} image The image to calculate
*/
function getImageAspectRatio(image) {
    if (image !== null && image instanceof Image) {
        var _ratio = (image.width / image.height);
        return { ratio: _ratio };
    }
}


/**
 * @summary Generates a random rgb color and returns it as a string
*/
function getRandomColor() {
    return 'rgba(' + Math.floor(Math.random() * 255) + ',' +
        Math.floor(Math.random() * 255) + ',' +
        Math.floor(Math.random() * 255) + ',1)';
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
 * @param {CanvasRenderingContext2D} context The context object
 * @param {Number} width The height of the data within the canvas to retrieve
 * @param {Number} height The height of the data within the canvas to retrieve
 */
function getImageData(context, width, height) {
    return getPositionalImageData(context, 0, 0, width, height);
}


/**
 * @summary Retrieves image data from the canvas context within a given cartisian coordinate and dimesion
 * @param {CanvasRenderingContext2D} context The context object
 * @param {Number} posX The start position on the x-axis
 * @param {Number} posY The start position on the y-axis
 * @param {Number} width The width of the data within the canvas to retrieve
 * @param {Number} height The height of the data within the canvas to retrieve
 */
function getPositionalImageData(context, posX, posY, width, height) {
    if (typeof context !== 'undefined' && context instanceof CanvasRenderingContext2D)
        return context.getImageData(posX, posY, width, height).data;
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

/**
 * @summary This will initialize the image sketch with the image file passed in
 * @param {Blob} file The image file to load
*/
function initializeImageSketchFromFile(file) {
    if (file !== null && file instanceof File) {
        // ensure we are running the image sketch
        if (this.currentSketch instanceof ImageSketch) {
            currentSketch.setImageFromFile(file);
        }
        // else load the image sketch then try again
        else {
            if (this.loadSketch("image"))
                initializeImageSketchFromFile(file);
        }
    }
}


//==================================================================== Extension functions =================================================================================//

/**
 * @summary Gets the value of the property from the object
 * @param {String} propertyName The name of the property to be retrieved
 */
Object.prototype.getValue = function (propertyName) {
    return this[this.getProperty(propertyName)];
};


/**
 * @summary Checks to see if a string value is included in the extended string, there is a fallback function for compatibilty support for older devices
 * @param {String} val The string value to lookup in the original extended string
 */
String.prototype.includes = String.prototype.includes || function(val){
    return this.indexOf(val) >= 0;
};


/**
 * @summary Gets the specified property that is owned by the object
 * @param {String} propertyName The name of the property to be retrieved
 */
Object.prototype.getProperty = function (propertyName) {
    if (typeof propertyName !== 'string')
        return;

    for (var _prop in this) {
        if (this.hasOwnProperty(_prop) && _prop.toString().toLowerCase() === propertyName.toLowerCase()) {
            return _prop;
        }
    }
};


/**
 * @summary Filters out the array and returns the elements that meet the condition in the callback function
 * @param {Function} filterFunction The user-defined function that takes in each of the elements in the array to be filtered
 */
Array.prototype.where = function (filterFunction) {
    if (typeof filterFunction !== 'function')
        // return the base array and don't filter anything  
        return this;

    return this.filter(filterFunction);
};


/**
  * @summary Raises the provided value to the power of 2 
  * @param {Number} value The value to be squared
  * @returns {Number} The newly squared value
  */
Math.square = function (value) {
    return Math.pow(value, 2);
}


//==================================================================== UI functions =================================================================================//

var _menuOpen = false;

/**
  * @summary Toggles a css class on the menu container which animates the menu
  */
function toggleMenu(button) {
    _menuOpen = !_menuOpen;
    button = button || burgerLink;

    if (_menuOpen) {
        mainContent.classList.remove("menu-hover");
        burgerLink.classList.remove("menu-hover");
    }
    mainContent.classList.toggle("menu-active");
    menu.classList.toggle("menu-active");
    burgerLink.classList.toggle("menu-active");
    button.classList.toggle("burger-link-open");
}


/**
  * @summary Handles the css styling for when the user mouse enters the ui menu burger link
  */
function mouseOverMenu() {
    if (!_menuOpen) {
        mainContent.classList.add("menu-hover");
        burgerLink.classList.add("menu-hover");
    }

}


/**
  * @summary Handles the css styling for when the user mouse leaves the ui menu burger link
  */
function mousLeaveMenu() {
    mainContent.classList.remove("menu-hover");
    burgerLink.classList.remove("menu-hover");
}

/**
  * @summary Handles the file that has been uploaded by the user
  * @param {HTMLElement} element The html element container holding the file
  */
function handleFile(element) {
    if (element instanceof HTMLElement) {
        // only get the first and single file
        var _file = element.files[0];
        this.initializeImageSketchFromFile(_file);
    }
}


/**
  * @summary Handles text input from the user
  * @param {HTMLElement} element The html element container such as an input
  */
function textChanged(event) {
    if (event.keyCode === 37 ||
        event.keyCode === 38 ||
        event.keyCode === 39 ||
        event.keyCode === 40) {
        return;
    }
    loadSketch("text");
}


/**
  * @summary Loads the sketch based on the button dataset name and clears any previous sketches in the context frame draw
  * @param {Object} elementOrSketchName The html element that called this function or the name of the sketch to load
  * @param {Boolean} reloadMenu The option to close the menu after a sketch selection has been made
  */
function loadSketch(elementOrSketchName, reloadMenu) {
    var _name = "";

    if (typeof elementOrSketchName === "string") {
        _name = elementOrSketchName;
    }
    else {
        _name = elementOrSketchName.dataset.name;
    }

    var _sketch = sketches.where(function (element, index, array) {
        if (array[index].name === _name) {
            return element;
        }
    })[0];

    if (_sketch !== null && typeof _sketch !== "undefined") {
        currentSketch = _sketch;
        currentSketch.initialize();
        switchControls(currentSketch.name);
        if (reloadMenu) {
            toggleMenu();
        }
        return true;
    }

    return false;
}

/**
  * @summary Loads the sketch, but this will mainly be called from the UI
  * @param {HTMLElement} element The html element that called this function
  */
function refreshUIElements(element) {
    // set the second parameter to true to hide the menu after sketch selection
    loadSketch(element, true);
}

/**
  * @summary Switches the controls depending on which sketch is being shown
  * @param {String} sketchName The name of the sketch being shown
  */
function switchControls(sketchName) {
    if (controlContainer.hasChildNodes) {
        var _controlChildren = controlContainer.children;
        for (var i = 0; i < _controlChildren.length; i++) {
            var _name = _controlChildren[i].id || _controlChildren[i].dataset.name || _controlChildren[i].name || "";
            if (_name.toLowerCase().includes(sketchName.toLowerCase())) {
                if (_controlChildren[i].classList.contains("display-none"))
                    _controlChildren[i].classList.remove("display-none");
            } else {
                if (!_controlChildren[i].classList.contains("display-none"))
                    _controlChildren[i].classList.add("display-none");
            }
        }
    }
}
