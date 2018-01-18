


class MAP {
    constructor(container, file) {
        this.container = container;
        this.file = file;
        this.tiles = [[], []];
        this.characters = [];
        this.entities = [];
        this.gravity = 0;
        this.loadBlocks(container, file);
        console.log(this.tiles);
    }




    loadCharacter(response) {

        var any = JSON.parse(response);
        any = any[0];

        var options = {};
        options.Id = any.Id;
        options.name = any.name;

        options.image = {};
        options.width = any.width;
        options.heigth = any.heigth;
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
        options2.heigth = options2.sprite.heigth;
        options2.gravity = this.gravity;

       
        options2.map = this;
        options2.weapon = loadWeapon(any.weapon);
        this.characters.push(new Player(options2));
        this.characters[0].spawn(150, 10);

    }

    loadBlocks(container, file) {
        //make function that loads a resource from somewhere containing info of below
        var any = JSON.parse(file);
        this.gravity = any.gravity;
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
                this.tiles[x] = [];
                for (var y = tile.blockY; y < tile.blockY + getSprite(block.Id).heigth; y++) {
                    this.tiles[x][y] = block;
                }
            }
            this.setSprite(container, block);
        }
    }

    setSprite(container, block) {
        getSprite(block.Id).drawBackground(block.X, block.Y);
    }



    doGravity() {
        for (var char of this.characters) {
            var x = char.getX() + char.getSprite().getCenter();
            var y = char.getY();


            if (this.getBlock(x + char.getLastOffSet(), y).Id !== 0) {
                x += char.getLastOffSet();
            } else {
                x -= char.getLastOffSet();
            }



            if (this.getBlock(x, y).Id === 0) { //character is currently in the air
                for (var dY = 0; dY <= char.getVSpeed(); dY++) { //see if character can make the full journey
                    if (this.getBlock(x, y + dY).Id !== 0) {
                        char.setVSpeed(dY);//character can only make the journey dY far
                        return;
                    }
                }
                if (this.getBlock(x, y + char.getVSpeed()).Id === 0) {//char can rise or fall to air
                    for (var dY = 0; dY <= this.gravity; dY++) { //see if character can make the full journey
                        if (this.getBlock(x + char.getHSpeed(), y + char.getVSpeed() + dY).Id !== 0) {
                            char.setVSpeed(char.getVSpeed() + dY - 1);//character can only make the journey dY far
                            return;
                        }
                    }
                    char.setVSpeed(char.getVSpeed() + this.gravity);
                } else {
                    if (this.getBlock(x, y + char.getVSpeed()).Id !== 0) {
                        char.setVSpeed(0);
                    }
                }
            } else { //character is on the ground
                char.lowerCD();
                char.setVSpeed(0);
            }
        }

    }


    doEntityTick() {
        this.doGravity();
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

}

function loadMap(name) {
    var m;
    loadJSONFile(function (response) {
        m = new MAP(canvas, response);
    }, "./resources/" + name + ".json");
    return m;
}







