﻿var sprites = new Map();
var characters = new Map();

SPRITE = function (options) {
    this.container = options.context;
    this.width = options.width;
    this.height = options.height;
    this.image = options.image;
    this.name = options.name;
    this.id = options.id;
    this.center = options.center;
    this.offSet = options.offSet;

      
    this.getCenter = function () {
        return this.center;
    };

    this.getOffSet = function () {
        return this.offSet;
    };
};


SPRITE.prototype = {
    //draw function for the sprite
    draw: function (desX, desY, canv) {
        //all the values that the sprite holds
        var img = new Image();
        img.src = this.image.src;
        var width = this.width;
        var height = this.height;
        var context = this.container.getContext("2d");
        var image = this.image;
        //draws the actual image when the image is loaded
            context.drawImage(
                img, //the image
                image.startX, //start x of the image in the spritesheet
                image.startY, //start y of the image in the spritesheet
                width, //width of the sprite
                height, //height of the sprite
                desX, //destination x of the sprite on the canvas
                desY, //destination of y of the sprite on the canvas
                width, //width of sprite
                height //height of sprite
            );
    },
    drawBackground : function (desX, desY, canv) {
        //all the values that the sprite holds
        var img = new Image();
        var width = this.width;
        var height = this.height;
        var context = this.container.getContext("2d");
        var image = this.image;
        //draws the actual image when the image is loaded
        img.onload = function () {
            context.drawImage(
                img, //the image
                image.startX, //start x of the image in the spritesheet
                image.startY, //start y of the image in the spritesheet
                width, //width of the sprite
                height, //height of the sprite
                desX, //destination x of the sprite on the canvas
                desY, //destination of y of the sprite on the canvas
                width, //width of sprite
                height //height of sprite
            );
            map.setImage(context);
        };
        img.src = image.src;
    }
};

function newSprite(options) {
    var sprite = new SPRITE(options);
    sprites.set(options.id, sprite);
}

function getSprite(id) {
    return sprites.get(id);
}

function loadSprites(json, container, tile) {
    var any = JSON.parse(json);
    for (var tile of any) {
        var options = {};
        options.context = container;
        options.image = {};

        //from tiles.png if it is a tile (floor), from character.png if character, object.png if trap etc...
        options.image.src = tile.source;
        options.id = tile.id;
        options.name = tile.name;
        //these values differ from sprite to sprite
        options.width = tile.width;
        options.height = tile.height;
        options.image.startX = tile.startX;
        options.image.startY = tile.startY;
        options.center = tile.centerPX;
        options.offSet = tile.offSetPX;
        if (tile.offSetY !== undefined) {
            options.offSet = tile.offSetY;
        }

        newSprite(options);
    }
}