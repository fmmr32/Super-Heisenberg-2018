﻿


class Block {
    constructor(id, x, y) {
        this.Id = id;
        this.X = x;
        this.Y = y;
        this.meta = [];
    }
    //checks if a block has that meta
    hasMeta(m) {
        if (this.meta != null && this.meta[m] != undefined) {
            return true;
        }
        return false;
    }
    //adds a new meta parameter
    addMeta(key, value) {
        this.meta[key] = value;
    }
    //deletes a meta parameter
    deleteMeta(key) {
        delete this.meta[key];
    }

}

class Level {
    constructor(player, file) {

        this.user = JSON.parse(player);
        this.file = file;
        this.tiles = [[], []];
        this.entities = [];
        this.gravity = 0;


        this.loadLevel(file);
    }



    //temporary load character function
    loadCharacter(response) {

        var any = JSON.parse(response);

        for (var chars of any) {
            if (chars.Id == this.user.currentCharacter) {
                if (this.getPlayer() != undefined) {
                    return;
                }



                var options = {};
                options.id = chars.Id;
                options.name = chars.name;

                options.image = {};
                options.width = chars.width;
                options.height = chars.height;
                options.image.src = chars.source;
                options.image.startX = chars.startX;
                options.image.startY = chars.startY;
                options.center = chars.centerPX;
                options.offSet = chars.offSetPX;
                options.context = this.container;

                var options2 = {};

                options2.sprite = [newSprite(options)];
                options2.hp = chars.hp;
                options2.jump = chars.jump;
                options2.speed = chars.speed;
                options2.height = options2.sprite.height;
                options2.leftHand = [chars.leftHand, chars.leftHandLow];
                options2.rightHand = [chars.rightHand, chars.rightHandLow];

                options2.animation = Animation.loadAnimationArray(chars.animation, chars.Id, chars.source);


                options2.level = this;
                options2.weapon = loadWeapon(this.user.equipped, this.user, this.user.weapons);
                options2.name = chars.name;

                options2.money = this.user.money;
                options2.killcount = this.user.killcount;
                options2.timeplayed = this.user.timeplayed;
                options2.artifacts = this.user.artifacts;

                this.entities.push(new Player(options2));
                this.getPlayer().spawn(this.spawnX, this.spawnY, 2);
                this.player = response;
                this.time = performance.now();
                break;
            }
        }
    }

    loadLevel(file) {

        //make function that loads a resource from somewhere containing info of below
        var any = JSON.parse(file);
        this.gravity = any.gravity;
        this.width = any.width;
        this.height = any.height;

        while (container.children.length != 0) {
            container.children[0].remove();
        }
        canvas = create('canvas', 'fg', 0, 0, this.width, this.height);

        var background = create('canvas', 'bg', 0, 0, this.width, this.height);

        this.container = canvas;
        changeCanvas(canvas, this);

        this.spawnX = any.spawnX;
        this.spawnY = any.spawnY;

        //loading in the tiles of a level
        for (var tile of any.content) {
            var block = new Block(tile.blockId, tile.blockX, tile.blockY);

            if (getSprite(tile.blockId).meta != undefined) {
                for (var key in getSprite(tile.blockId).meta) {
                    block.addMeta(key, getSprite(tile.blockId).meta[key]);
                }
            }
            for (var m of tile.meta) {
                block.addMeta(Object.keys(m), Object.values(m));
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
        this.loadEntity(any.entities);

        //loading in the interactable objects
        this.loadInteracts(any.interacts);

        //loading the creatures
        this.loadCreature(any.creatures);



    }
    //takes in an arracy of basic interact values
    loadInteracts(interacts) {
        for (var interact of interacts) {
            var id = interact.Id;

            var options = {};
            options.x = interact.X;
            options.y = interact.Y;
            options.action = interact.action;
            options.animation = Animation.loadAnimation(id);
            options.level = this;
            options.sprite = [getSprite(id)];
            options.name = getSprite(id).name;
            options.repeatable = interact.repeatable;
            this.entities.push(new EntityInteractable(options));
        }
    }

    //takes in an array of basic entitie values, each value consists of id, x, y
    loadEntity(entities) {
        for (var ent of entities) {
            var id = ent.Id;

            var options = {};
            options.x = ent.X;
            options.y = ent.Y;
            options.level = this;
            options.sprite = [getSprite(id)];
            //loading the entity animation

            options.animation = Animation.loadAnimation(id);
            this.entities.push(new Entity(options));
        }
    }


    //takes in an array of creature values, can be basic information as in id, x, y but can be more complex
    loadCreature(creatures) {
        //loading the creatures
        for (var ent of creatures) {
            var id = ent.Id;
            var x = ent.X;
            var y = ent.Y;

            var sprite = getSprite(id);

            var options = {};
            options.jump = sprite.complex.jump;
            options.hp = sprite.complex.hp;
            if (ent.hp != undefined) {
                options.hp = ent.hp;
            }


            options.speed = sprite.complex.speed;
            options.moves = sprite.complex.moves;
            options.level = this;
            options.x = x;
            options.y = y;

            options.sprite = [sprite];
            options.weapon = loadWeapon(sprite.complex.weapon, this.user);
            options.damage = sprite.complex.damage;
            options.leftHand = sprite.complex.leftHand;
            options.rightHand = sprite.complex.rightHand;

            options.moveSet = new MoveSet(sprite.complex.moveSet);
            //overrides the default moveSet
            if (ent.moveSet != undefined) {
                options.moveSet = new MoveSet(ent.moveSet);
            }
            //gets the correct name
            if (ent.name != undefined || sprite.name != undefined) {
                options.name = ent.name != undefined ? ent.name : sprite.name;
            }
            //sets a healthbar if any
            if (ent.healthBar != undefined || sprite.complex.healthBar != undefined) {
                options.healthBar = { x: 125, y: 10, alignment: "h" };
            }
            options.animation = Animation.loadAnimation(id);

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
                    if (this.outSideFrame(entity.getX()) && entity.sleep) {
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
                    if (entity instanceof Player) {
                        entity.timeplayed = Math.floor(performance.now() - this.time);
                    }

                    entity.doMove("none", true, true);
                    //handles other entities
                } else {
                    entity.spawn(entity.getX(), entity.getY() - entity.getHeight(), 0);
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
            return true;
        }
        return false;
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
            var block = new Block(0, X, Y);
            this.tiles[X][Y] = block;
        }
        return this.tiles[X][Y];
    }

    getEntity(X, Y) {
        for (var entity of this.entities) {
            try {
                if (entity.getX() < X && X < entity.getX() + entity.getSprite().width && entity.getY() - entity.getHeight() < Y && Y < entity.getY()) {
                    return entity;
                }
            } catch (err) {
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

        if (this.getPlayer() != undefined && this.image != undefined) {
            var width = container.clientWidth / 2;

            this.offSetX = width - this.getPlayer().getX() - 32;
            this.offSetX = Math.min(0, this.offSetX);

            //case for when the map is smaller than the viewport
            var space = container.clientWidth - this.width
            if (space > 0) { space = 0; }

            this.offSetX = Math.max(this.offSetX, space);
            var context = canvas.getContext("2d");


            context.drawImage(this.image, 0, 0, this.width, this.height, this.offSetX, 0, this.width, this.height);
        }
    }

    reload() {
        loaded = false;
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        canvas.remove();
        // canvas = {};
        this.entities.splice(0, this.entities.length);
        HealthBar.bars.splice(0, HealthBar.bars.length);
        this.loadLevel(this.file);
        this.loadCharacter(this.player);
    }

    exitMap(loot, completed) {
        var money = this.getPlayer().getMoney();
        var kills = this.getPlayer().killcount;
        var timeplayed = this.getPlayer().timeplayed;
        if (completed) {
            //add more...
            document.dispatchEvent(new Event("completed Level"));
        }

    }
}


function loadMap(name, player, callback) {
    loadJSONFile(function (response) {
        try {
            map = new Level(player, response);
            getMap(map);
            callback(map);
        } catch (err) {
            loaded = false;
            console.log(err);
            canvas.remove();
            canvas = undefined;
            clearInterval(interval)
            //   loadGame(false);
        }
    }, "/client/resources/" + name + ".json");

}







