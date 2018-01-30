﻿


class MAP {
    constructor(container, file) {


        this.container = container;
        this.file = file;
        this.tiles = [[], []];
        this.characters = [];
        this.entities = [];
        this.gravity = 0;


        this.loadBlocks(container, file);

    }




    loadCharacter(response) {
        var any = JSON.parse(response);
        any = any[0];

        var options = {};
        options.Id = any.Id;
        options.name = any.name;

        options.image = {};
        options.width = any.width;
        options.height = any.height;
        options.image.src = any.source;
        options.image.startX = any.startX;
        options.image.startY = any.startY;
        options.center = any.centerPX;
        options.offSet = any.offSetPX;
        options.context = this.container;

        var options2 = {};
        options2.sprite = new SPRITE(options);
        options2.hp = any.hp;
        options2.jump = any.jump;
        options2.speed = any.speed;
        options2.height = options2.sprite.height;
        options2.gravity = this.gravity;


        options2.map = this;
        options2.weapon = loadWeapon(any.weapon);
        this.characters.push(new Player(options2));
        this.characters[0].spawn(this.spawnX, this.spawnY);

    }

    loadBlocks(container, file) {
        var ctx = document.createElement("canvas").getContext("2d");
        ctx.canvas.width = this.width;
        ctx.canvas.height = this.height;

        //make function that loads a resource from somewhere containing info of below
        var any = JSON.parse(file);
        this.gravity = any.gravity;
        this.width = any.width;
        this.height = any.height;
        this.spawnX = any.spawnX;
        this.spawnY = any.spawnY;
        for (var tile of any.content) {
            var block = {};
            block.Id = tile.blockId;
            block.meta = tile.meta;
            block.X = tile.blockX;
            block.Y = tile.blockY;
            block.meta = {};
            for (var m of tile.meta) {
                block.meta = m;
            }
            for (var x = tile.blockX; x < tile.blockX + getSprite(block.Id).width; x++) {
                if (this.tiles[x] === undefined) {
                    this.tiles[x] = [];
                }
                for (var y = tile.blockY + getSprite(block.Id).offSet; y < tile.blockY + getSprite(block.Id).height + getSprite(block.Id).offSet; y++) {
                    this.tiles[x][y] = block;
                }
            }
            this.setSprite(block, ctx);
        }
    }

    setImage(ctx) {
        this.image = new Image();
        this.image.src = ctx.canvas.toDataURL("image/png");

    }


    setSprite(block, canv) {
        getSprite(block.Id).drawBackground(block.X, block.Y, canv);
    }



    doTick() {
        for (var char of this.characters) {
            char.doMove("none", true, true);
        }


        for (var entity of this.entities) {
            if (entity instanceof Bullet) {
                if (entity.bulletTravel(true)) {
                    this.entities.splice(this.entities.indexOf(entity), 1);
                }
            }

        }
    }
    getPlayer() {
        for (var char of this.characters) {
            if (char instanceof Player) {
                return char;
            }
        }
    }

    getBlock(X, Y) {
        if (this.tiles[X] === undefined) {
            this.tiles[X] = [];
        }
        if (this.tiles[X][Y] === undefined) {
            var block = {};
            block.Id = 0;
            block.meta = null;
            block.X = X;
            block.Y = Y;
            this.tiles[X][Y] = block;
        }
        return this.tiles[X][Y];
    }

    isOOB(x, y) {
        if (x > this.width || x < 0 || y > this.height || y < 0) {
            return true;
        }
        return false;
    }

    drawMap() {

        if (this.getPlayer() != undefined) {
            var context = canvas.getContext("2d");

            var player = this.getPlayer();

            var x = context.canvas.width / 2 - player.getX() - 32;
            var y = 0;

            var sWidth = context.canvas.width;
            var sHeight = context.canvas.height;
            console.log(x, y);

            context.drawImage(this.image,-x, y, sWidth, sHeight, 0, 0, sHeight, sWidth);

        }
    }
    clamp(value, min, max) {
        console.log(value, min, max);
        if (value < min) return min;
        else if (value > max) return max;
        return value;
    }
}
function loadMap(name, callback) {
    loadJSONFile(function (response) {
        map = new MAP(canvas, response);
        getMap(map);
        callback(map);
    }, "/client/resources/" + name + ".json");
}






