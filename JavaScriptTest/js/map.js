var tiles;

MAP = function (container) {
    tiles = loadTiles(container);
    drawLine(tiles[0], container);
};

function drawLine(object, canvas) {
    for (var x = 0; x < canvas.width; x += object.width) {
        object.draw(x, 100);
    }

}


function loadTiles(container) {
    var temp = [];



    options = {};
    options.context = container.getContext("2d");
    options.width = 32;
    options.heigth = 10;
    options.image = {};
    options.image.src = "../JavaScriptTest/images/ground/dirt.png";
    options.image.startX = 0;
    options.image.startY = 12;


    var dirt = new Sprite(options);
    temp.push(dirt);

    return temp;
}


function Sprite(options) {
    this.context = options.context;
    this.width = options.width;
    this.heigth = options.heigth;
    this.image = options.image;

}

Sprite.prototype = {
    //draw function for the sprite
    draw: function (desX, desY) {
        //all the values that the sprite holds
        var img = new Image();
        var width = this.width;
        var heigth = this.heigth;
        var context = this.context;
        var image = this.image;
        //draws the actual image when the image is loaded
        img.onload = function () {
            context.drawImage(
                img, //the image
                image.startX, //start x of the image in the spritesheet
                image.startY, //start y of the image in the spritesheet
                width, //width of the sprite
                heigth, //height of the sprite
                desX, //destination x of the sprite on the canvas
                desY, //destination of y of the sprite on the canvas
                width, //width of sprite
                heigth //heigth of sprite
            );
        };
        img.src = image.src;
    }
};