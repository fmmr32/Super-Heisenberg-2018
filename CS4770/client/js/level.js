


class Level {
    constructor(file) {


        this.file = file;
        this.tiles = [[], []];
        this.entities = [];
        this.gravity = 0;


        this.loadBlocks(file);


    }



    //temporary load character function
    loadCharacter(response) {
        var any = JSON.parse(response);
        any = any[0];

        var options = {};
        options.id = any.Id;
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
        options2.leftHand = any.leftHand;
        options2.rightHand = any.rightHand;

        options2.level = this;
        options2.weapon = loadWeapon(any.weapon);
        this.entities.push(new Player(options2));
        this.getPlayer().spawn(this.spawnX, this.spawnY);


    }

    loadBlocks(file) {

        //make function that loads a resource from somewhere containing info of below
        var any = JSON.parse(file);
        this.gravity = any.gravity;
        this.width = any.width;
        this.height = any.height;

        canvas = create('canvas', 'fg', 0, 0, this.width, this.height);

        var background = create('canvas', 'bg', 0, 0, this.width, this.height);

        this.container = canvas;
        changeCanvas(canvas, this);

        this.spawnX = any.spawnX;
        this.spawnY = any.spawnY;

        //loading in the tiles of a level
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
            this.setSprite(block, background);
        }
        //loading in the entities of a level
        for (var ent of any.entities) {
            var id = ent.Id;
            var x = ent.X;
            var y = ent.Y;

            var img = new Image();
            img.src = getSprite(id).image.src;
            img.width = getSprite(id).width;
            img.height = getSprite(id).height;
            img.startX = getSprite(id).image.startX;
            img.startY = getSprite(id).image.startY;
            img.offSetX = 0;
            img.offSetY = 0;

            if (getSprite(id).animation != undefined) {
                var frames = getSprite(id).animation.frames;
                var frameRate = getSprite(id).animation.frameRate;
                var columns = getSprite(id).animation.columns;

                var animation = new Animation(img, frames, frameRate, columns, true);

                var options = {};
                options.x = x;
                options.y = y;
                options.level = this;
                options.sprite = getSprite(id);
                options.animation = animation;

                var entity = new Entity(options);
                this.entities.push(entity);
            }
        }
        for (var ent of any.creatures) {
            var id = ent.Id;
            var x = ent.X;
            var y = ent.Y;

            var sprite = getSprite(id);

            var options = {};
            options.gravity = this.gravity;
            options.jump = sprite.complex.jump;
            options.hp = sprite.complex.hp;
            options.speed = sprite.complex.speed;
            options.moves = sprite.complex.moves;
            options.level = this;
            options.x = x;
            options.y = y;
            options.sprite = sprite;
            options.weapon = loadWeapon(sprite.complex.weapon);
            options.damage = sprite.complex.damage;
            options.leftHand = sprite.complex.leftHand;
            options.rightHand = sprite.complex.rightHand;
            options.moveSet = new MoveSet(sprite.complex.moveSet);
            if (ent.moveSet != undefined) {
                options.moveSet = new MoveSet(ent.moveSet);
            }


            var creature = new EntityCreature(options);
            this.entities.push(creature);
        }


    }

    setImage(ctx) {
        this.image = new Image();
        this.image.src = ctx.canvas.toDataURL("image/png");



    }


    setSprite(block, background) {
        getSprite(block.Id).drawBackground(block.X, block.Y, background);
    }



    doTick() {
        if (this.getPlayer() != null) {
            for (var entity of this.entities) {
                //doing the bullet handling
                if (!(entity instanceof Bullet) && !(entity instanceof Player)) {
                    if (this.outSideFrame(entity.getX()) && this.sleep) {
                        continue;
                    } else {
                        entity.sleep = false;
                    }
                }

                if (entity instanceof Bullet) {
                    if (entity.bulletTravel(true)) {
                        this.removeEntity(entity);
                    }
                    //handles the creatures
                } else if (entity instanceof EntityCreature) {
                    entity.doMove("none", true, true);
                    //handles other entities
                } else {
                    entity.spawn(entity.getX(), entity.getY() - entity.getHeight());
                }

            }
        }
    }

    outSideFrame(X) {
        var x = this.getPlayer().getX();

        if (x + container.clientWidth / 2 + 20 < X) {
            return true;
        }
        return false;
    }

    removeEntity(entity) {
        if (this.entities.indexOf(entity) != -1) {
            this.entities.splice(this.entities.indexOf(entity), 1);
        }
    }

    getPlayer() {
        for (var char of this.entities) {
            if (char instanceof Player) {
                return char;
            }
        }
        return null;
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

    getEntity(X, Y) {
        for (var entity of this.entities) {
            if (entity.getX() < X && X < entity.getX() + entity.getSprite().width && entity.getY() - entity.getHeight() < Y && Y < entity.getY()) {
                return entity;
            }
        }
        return null;
    }

    isOOB(x, y) {
        if (x > this.width) {
            return 1;
        } else if (x < 2) {
            return 2;
        } else if (y > this.height || y < -1) {
            return 3;
        } else {
            return 0;
        }
    }

    //redraws the canvas with the player centered
    drawMap() {

        if (this.getPlayer() != undefined) {
            var x = container.clientWidth / 2 - this.getPlayer().getX() - this.getPlayer().getSprite().getCenter();


            var context = canvas.getContext("2d");

            try {
                context.drawImage(this.image, 0, 0, this.width, this.height, x, 0, this.width, this.height);
                context.beginPath();
                context.lineWidth = "6";
                context.strokeStyle = "black";
                context.rect(20, 10, 20, 105);
                context.stroke();

                context.beginPath();
                context.moveTo(30, 13);
                context.lineWidth = "14";
                context.strokeStyle = "green";
                context.lineTo(30, 113);
                context.stroke();

                context.beginPath();
                context.moveTo(30, 13);
                context.lineWidth = "14";
                context.strokeStyle = "red";

                var difference = this.getPlayer().maxHp - this.getPlayer().hp;
                var fromMax = difference / this.getPlayer().maxHp*100;

                context.lineTo(30, 13 +  fromMax);
                context.stroke();

            } catch (err) {
                console.log(err);
            }

        }
    }

    calcRect(inner) {
        var minX = 20;
            var minY =10;

            if (inner) {
                minX += 6;
                minY += 6;
            }
            return [minX, minY];
    }
}


function loadMap(name, callback) {
    loadJSONFile(function (response) {
        map = new Level(response);
        getMap(map);
        callback(map);
    }, "/client/resources/" + name + ".json");
}







