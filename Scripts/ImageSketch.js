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
