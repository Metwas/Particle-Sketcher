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
