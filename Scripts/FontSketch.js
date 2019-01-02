/**
* @summary This will draw any text on the canvas using particles
* @param {Number} name The unique name for the sketch
*/
function FontSketch(name, context) {
    this.name = name || "text";
    this.context = context || document.getElementsByTagName("CANVAS").getContext("2d");
}

// This will inherit all of base class sketch properties
FontSketch.prototype = Object.create(Sketch.prototype);

/**
* @summary [Overridden] Initializes the sketch
*/
FontSketch.prototype.initialize = function () {
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
FontSketch.prototype.update = function () {
    this.context.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particleCount; i++) {
        particles[i].draw(this.context);
        particles[i].pushFromPoint(mouse.x, mouse.y);
        particles[i].vibrate(5);
    }
};
