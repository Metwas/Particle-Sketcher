/*
        Code by: Metwas,
        Description: Particle image and text sketcher,
        
        
        UPDATE (1.2.2):
        > Updated the image sketcher to support portrait images
        
        UPDATE (1.2.1):
        > Added a image sketcher.
        > Added color support for emoticons in the text sketcher
        > More code compatibilty for various devices and versions
        
        Thanks for viewing my project
        Let me know in the comments if you have any issues.
 */

//==================================================================== Function Definitions =================================================================================//

/**
    * @summary This particle class will be used to render out a text based of points in a ImageData buffer from the context
    * @param {Number} posX The destination position point along the x-axis
    * @param {Number} posY The destination position point along the y-axis
    * @param {Number} radius The maximum radius of the particle
    */
   function Particle(posX, posY, startX, startY, radius) {
    this.x = startX || Math.floor(random(windowWidth / 2 - windowWidth / 4, windowWidth / 2 + windowWidth / 4));
    this.y = startY || Math.floor(random(windowHeight / 2 - windowHeight / 4, windowHeight / 2 + windowHeight / 4));
    this.velX = random(5, 15);
    this.velY = random(5, 15);
    this.accX = 0;
    this.accY = 0;

    this.setRadius(2, radius);
    this.friction = random(0.8, 0.98);
    this.strength = random(50, 90);

    this.pointX = posX;
    this.pointY = posY;

    this.color = "steelblue";
}


/**
* @summary Calculates the amount of velocity and acceleration from the particles current postion and the fine destination point
* @param {CanvasRenderingContext2D} context The renderer for the html canvas
*/
Particle.prototype.draw = function (context) {
    this.accX = (this.pointX - this.x) / this.strength;
    this.accY = (this.pointY - this.y) / this.strength;
    this.velX += this.accX;
    this.velY += this.accY;

    // slow the particle's velocity by its frictional force value
    this.velX *= this.friction;
    this.velY *= this.friction;

    this.x += this.velX;
    this.y += this.velY;

    // draw the particle
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fillStyle = this.color;
    context.fill();
};


/**
* @summary Vibrates the particles based off a given amount
* @param {Number} amount The amount value to vibrate
*/
Particle.prototype.vibrate = function (amount) {
    var _amount = amount || 10;

    this.accX = (this.pointX - this.x - random(-_amount, _amount)) / this.strength;
    this.accY = (this.pointY - this.y - random(-_amount, _amount)) / this.strength;
    this.velX += this.accX;
    this.velY += this.accY;

    // slow the particle's velocity by its frictional force value
    this.velX *= this.friction;
    this.velY *= this.friction;

    this.x += this.velX;
    this.y += this.velY;
};


/**
* @summary Moves the particle to the new cartisian points provided
* @param {Number} pointX The end point to react to on the x-axis
* @param {Number} pointY The end point to react to on the y-axis
*/
Particle.prototype.moveTo = function (pointX, pointY) {
    this.pointX += pointX;
    this.pointY += pointY;
};

/**
* @summary Reacts to a set of coordinates by pushing away from the particles origin and returning after a calculated time, which is dependant on the distance
* @param {Number} pointX The end point to react to on the x-axis
* @param {Number} pointY The end point to react to on the y-axis
* @param {Number} radius [Optional] Reacts only if the cartisian points given fall within this radius parameter
*/
Particle.prototype.pushFromPoint = function (pointX, pointY, radius) {
    var _disX = this.x - pointX;
    var _disY = this.y - pointY;
    radius = radius || 100;

    var _distance = Math.sqrt((_disX * _disX) + (_disY * _disY));

    if (_distance < radius) {
        this.accX = (this.x - pointX) / this.strength / 3;
        this.accY = (this.y - pointY) / this.strength / 3;
        this.velX += this.accX;
        this.velY += this.accY;
    }
};


/**
* @summary Sets the particle to a defined minimum and maximum radius values
* @param {Number} min The minimum radius amount
* @param {Number} max The maximum radius amount
*/
Particle.prototype.setRadius = function (min, max) {
    min = min || 1;
    max = max || windowWidth * 0.005;
    this.radius = random(min, max);
};


/**
* @summary Represents a pixel which consist of RGBA byte values
* @param {Number} x The starting point on the x-axis
* @param {Number} y The starting point on the y-axis
*/
function Pixel(x, y) {
    this.red = 0;
    this.green = 0;
    this.blue = 0;
    this.alpha = 255;

    this.x = x || 0;
    this.y = y || 0;
}


/**
* @summary Converts this pixels rgba values into a single string
* @returns A rgba string representation of this pixels channel value
*/
Pixel.prototype.toRGBAString = function () {
    return 'rgba(' + this.red + ',' + this.green + ',' + this.blue + ',' + this.alpha + ')';
};


/**
* @summary Statically creates a new pixel based off the provided RGBA channels
* @param {Number} x The positioning for the pixel on the x-axis (0 indexed)
* @param {Number} y The positioning for the pixel on the y-axis (0 indexed)
* @param {Number} r The byte value for the red channel
* @param {Number} g The byte value for the green channel
* @param {Number} b The byte value for the blue channel
* @param {Number} a The byte value for the alpha channel
* @returns {Pixel} A new instance of Pixel
*/
Pixel.createPixel = function (x, y, r, g, b, a) {
    var _pixel = new Pixel(x, y);

    if (r >= 0 && r <= 255)
        _pixel.red = r || 0;
    if (g >= 0 && g <= 255)
        _pixel.green = g || 0;
    if (b >= 0 && b <= 255)
        _pixel.blue = b || 0;
    if (a >= 0 && a <= 255)
        _pixel.alpha = a || 0;

    return _pixel;
};


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


/**
* @summary This will draw any text on the canvas using particles
* @param {Number} name The unique name for the sketch
*/
function TextSketch(name, context) {
    this.name = name || "text";
    this.context = context || document.getElementsByTagName("CANVAS").getContext("2d");
}

// This will inherit all of base class sketch properties
TextSketch.prototype = Object.create(Sketch.prototype);

/**
* @summary [Overridden] Initializes the sketch
*/
TextSketch.prototype.initialize = function () {
    windowWidth = canvas.width = window.innerWidth;
    windowHeight = canvas.height = window.innerHeight;
    alphaThreshold = 255;

    // by having a resolution set, we can skip a few rows which increases performance
    if (windowWidth >= 1200) {
        resolution = 140;
    }
    else if (windowWidth <= 1200 && windowWidth >= 700) {
        resolution = 100;
    } else {
        resolution = 85;
    }

    var _addition = Math.round(windowWidth / resolution);

    input = document.getElementById("input") || { value: "Hello world!" };
    particles = [];

    this.context.clearRect(0, 0, canvas.width, canvas.height);
    // font styles
    this.context.fillStyle = "#CCC";
    if (windowWidth <= 900) {
        this.context.font = windowWidth / 5 + "px " + getComputedStyleProperty(document.getElementsByTagName("BODY")[0], "font-family");
    } else {
        this.context.font = windowWidth / 8 + "px " + getComputedStyleProperty(document.getElementsByTagName("BODY")[0], "font-family");
    }

    this.context.textAlign = "center";
    this.context.fillText(input.value, getCenteredCoordinates(0, windowWidth), getCenteredCoordinates(0, windowHeight));

    // get points from the text
    var _data = getImageData(this.context, windowWidth, windowHeight);

    for (var i = 0; i < windowWidth; i += _addition)
        for (var j = 0; j < windowWidth; j += _addition) {
            // obtain the alpha value for each pixel within the array
            var _alpha = _data[getCoordinates2D(i, j, windowWidth)[3]];

            // Only then obtain the pixels which alpha value is greater or equal to the variable threshold
            if (_alpha >= alphaThreshold) {
                var _pixel = createPixelFromCoordinates(i, j, windowWidth, _data);
                var _particle = new Particle(i, j, windowWidth / 2, windowHeight / 2, window.innerWidth * 0.005);
                _particle.color = _pixel.toRGBAString();
                particles.push(_particle);
            }
        }

    particleCount = particles.length;
};


/**
* @summary [Overridden] The main animation sketch per request frame
*/
TextSketch.prototype.update = function () {
    this.context.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particleCount; i++) {
        particles[i].draw(this.context);
        particles[i].pushFromPoint(mouse.x, mouse.y);
        particles[i].vibrate(5);
    }
};


/**
* @summary This will draw a image that a user has uploaded using particles
* @param {Number} name The unique name for the sketch
*/
function ImageSketch(name, context) {
    this.name = name || "image";

    // if no parameters are passed into this image object, 
    // the uploaded image will be rendered at its original dimension
    this.image = new Image();
    this.fileReader = new FileReader();
    this.imageType = "";
    this.blob = null;
    this.context = context || document.getElementsByTagName("CANVAS")[0].getContext("2d");
}


// This will inherit all of base class sketch properties
ImageSketch.prototype = Object.create(Sketch.prototype);


/**
* @summary Retreives and reads the image from the url location
* @param {Object} urlOrFile The url location of the image to be loaded
*/
ImageSketch.prototype.getImageFromUrl = function (url) {
    if (this.image !== null && typeof this.image !== "undefined") {
        if (typeof url === "string") {
            /*
               By default the canvas wont allow cross-origin locations for files, 
               therefore we must set the crossOrigin property on the image object to anonymous,
               but the server must allow this and it should contain this property in the header section
            */
            this.image.crossOrigin = "Anonymous";
            this.image.src = url;
        }
    }
}


/**
* @summary Reads all the bytes from the stored image into a Uint8Array
* @param {File} file The file to be read
* @returns {Uint8Array} A new instance of a one dimensional array Uint8Array
*/
ImageSketch.prototype.readFileAsUint8Array = function (file, callback) {
    if (file !== null && file instanceof File) {
        var _callback = (function (event) {
            // only assign the blob objects data once the file reader has read all of the contents
            if (event.target.readyState === 2) {
                // access the data by the results object, then convert into a uint8array
                this.blob = new Uint8Array(event.target.result);

                if (callback !== null && typeof callback === "function") {
                    callback(event);
                }

                // only initialize once all the data has been retrieved
                this.initialize();
            }

            // set this function to only fire once
            this.fileReader.removeEventListener("load", _callback, false);
        }).bind(this);

        // add event listener to handle the process once done reading
        this.fileReader.addEventListener("load", _callback, false);

        this.fileReader.readAsArrayBuffer(file);
    }
}


/**
* @summary Reads all the data from the passed in file or blob object and creates a new image
* @param {File} file The file to be read
*/
ImageSketch.prototype.setImageFromFile = function (file) {
    if (file instanceof File) {

        if (!this.validateImageType(file.type)) {
            alert("not a support file!");
            return;
        }

        var _callback = (function (event) {
            // only assign the image source once the file reader has read all of the contents
            if (event.target.readyState === 2) {
                if (this.image === null || typeof this.image === "undefined")
                    this.image = new Image();

                this.image.src = event.target.result;

                // read and fill the blob object with the new file
                this.readFileAsUint8Array(file);
            }
            // set this function to only fire once
            this.fileReader.removeEventListener("load", _callback, false);
        }).bind(this);

        // add event listener to handle the process once done reading
        this.fileReader.addEventListener("load", _callback, false);

        /* 
            This will read the contents of the blob object, 
            and create a local reference as a source string, 
            which can be used by the image object
        */
        this.fileReader.readAsDataURL(file);
    }
}


/**
* @summary Obtains the header information from a blob buffer
* @param {File} file The file object
* @returns {String} Returns the undelying file type of the current blob array stored within this class
*/
ImageSketch.prototype.getHeaderFileType = function (file) {
    var _buffer = [];
    var _headerType = "";

    // first get the blob data from the file
    this.readFileAsUint8Array(blob, function (event) {
        // we only want to get the first 4 bytes in the header
        if (blob !== null && typeof blob !== "undefined" && blob >= 4) {
            _buffer = event.target.result.subarray(0, 4);
            for (var i = 0; i < _buffer.length; i++) {
                // convert the header value into hexidecimal
                _headerType += _buffer[i].toString(16);
            }
        }
    });
    return _headerType;
}


/**
* @summary Validates the passed in image type to see if the canvas will support it
* @param {Blob} typeOrBlob The type of the image file e.g image/jpeg, image/png or a blob file which will be read
*/
ImageSketch.prototype.validateImageType = function (typeOrBlob) {
    /* 
        we could validate the image simple by splitting the extension method,
        then comparing the extension to a list of valid extensions.
        But this can be broken by a user manually changing the extension of the image file.

        To do this properly, image files contain header information in the first 4 bytes,
        which tell us what type of file and version it is. Its represented in binary, 
        Found this article on the jpeg format as an example http://www.file-recovery.com/jpg-signature-format.htm
    */
    var _header = typeOrBlob || "";
    if (typeOrBlob instanceof Blob) {
        _header = this.getHeaderFileType(typeOrBlob);

        switch (_header) {
            // jpeg header id, which do support different versions declared by the last byte e0 - e8
            case "ffd8ffe0":
            case "ffd8ffe1":
            case "ffd8ffe2":
            case "ffd8ffe3":
            case "ffd8ffe8":
                this.imageType = "image/jpeg";
                return true;
            // png header id
            case "89504e47":
                this.imageType = "image/png";
                return true;
            // gif
            case "":
                this.imageType = "image/gif"
                return true;
            default:
                // no supported image files
                return false;
        }
    } else {
        switch (_header) {
            case "image/jpeg":
            case "image/bmp":
            case "image/png":
            case "image/gif":
                this.imageType = _header;
                return true;
        }

        return false;
    }
}

/**
* @summary Renders the current image stored to the canvas
*/
ImageSketch.prototype.render = function () {
    windowWidth = canvas.width = window.innerWidth;
    windowHeight = canvas.height = window.innerHeight;
    alphaThreshold = 255;
    var _minRadius = 0;
    var _maxWidth = 0;


    // by having a resolution set, we can skip a few rows which increases performance
    if (windowWidth >= 1200) {
        resolution = 90;
        _minRadius = 10;
        _maxWidth = windowWidth / 1.8;
    }
    else if (windowWidth <= 1200 && windowWidth >= 700) {
        resolution = 80;
        _minRadius = 5;
        _maxWidth = windowWidth / 1.7;
    } else {
        resolution = 70;
        _minRadius = 4;
        _maxWidth = windowWidth / 1.5;
    }

    var _dimensions = setImageDimension(this.image, _maxWidth);
    var _addition = Math.round(windowWidth / resolution);

    particles = [];

    this.context.clearRect(0, 0, canvas.width, canvas.height);

    var _sumCenteredWidth = Math.round((windowWidth / 2) - (_dimensions.width / 2));
    var _sumCenteredHeight = Math.round((windowHeight / 2) - (_dimensions.height / 2));

    // draw the initial image to the canvas
    this.context.drawImage(this.image, _sumCenteredWidth, _sumCenteredHeight, _dimensions.width, _dimensions.height);

    // get points from the image
    var _data = getImageData(this.context, windowWidth, windowHeight);

    for (var i = 0; i < windowWidth; i += _addition)
        for (var j = 0; j < windowWidth; j += _addition) {
            // obtain the alpha value for each pixel within the array
            var _alpha = _data[getCoordinates2D(i, j, windowWidth)[3]];

            // Only then obtain the pixels which alpha value is greater or equal to the variable threshold
            if (_alpha >= alphaThreshold) {
                var _pixel = createPixelFromCoordinates(i, j, windowWidth, _data);
                var _particle = new Particle(i, j, windowWidth / 2, windowHeight / 2);
                _particle.setRadius(_minRadius, null);
                _particle.color = _pixel.toRGBAString();
                particles.push(_particle);
            }
        }

    particleCount = particles.length;
};


/**
* @summary [Overridden] Initializes the sketch
*/
ImageSketch.prototype.initialize = function () {
    this.render();
};


/**
* @summary [Overridden] The main animation sketch per request frame
*/
ImageSketch.prototype.update = function () {
    this.context.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particleCount; i++) {
        particles[i].draw(this.context);
        particles[i].pushFromPoint(mouse.x, mouse.y);
        particles[i].vibrate(5);
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

    var _textsketch = new TextSketch("text", ctx);
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
