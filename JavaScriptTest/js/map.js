var tiles;

MAP = function (container) {
    //make function that loads a resource from somewhere containing info of below

    var temp = new Map();

    var options = {};
    options.context = container.getContext("2d");
    options.image = {};

    //from tiles.png if it is a tile (floor), from character.png if character, object.png if trap etc...
    options.image.src = "../JavaScriptTest/images/ground/tiles.png";


    //these values differ from sprite to sprite
    options.width = 32;
    options.heigth = 10;
   

    options.image.startX = 0;
    options.image.startY = 12;

    temp.set("dirt", options);
    tiles = loadTiles(temp);

};

//simeple sprite loader
function loadTiles(tiles) {
    var temp = new Map();
    for (spriteName of tiles.keys()) {
        temp.set(spriteName, new Sprite(tiles.get(spriteName)));
    }
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