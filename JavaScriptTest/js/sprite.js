var sprites = new Map();

SPRITE = function (options) {
    this.context = options.context;
    this.width = options.width;
    this.heigth = options.heigth;
    this.image = options.image;
    this.name = options.name;
    this.id = options.id;
};


SPRITE.prototype = {
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

function newSprite(options) {
    var sprite = new SPRITE(options);
    sprites.set(options.id, sprite);
}

function getSprite(name) {
    return sprites.get(name);
}

function loadSprites(json, container) {
    var any = JSON.parse(json);
    for (var tile of any) {
        var options = {};
        options.context = container.getContext("2d");
        options.image = {};

        //from tiles.png if it is a tile (floor), from character.png if character, object.png if trap etc...
        options.image.src = tile.source;
        options.id = tile.id;
        options.name = tile.name;
        //these values differ from sprite to sprite
        options.width = tile.width;
        options.heigth = tile.heigth;
        options.image.startX = tile.startX;
        options.image.startY = tile.startY;
        newSprite(options);
    }
}