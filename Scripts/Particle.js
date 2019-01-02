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

    this.setRadius(radius/1.5, radius);
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
    min = min || max/1.5;
    max = max || min*1.5;
    this.radius = random(min, max);
};
