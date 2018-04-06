class OverWorldPlayer {
    constructor(options) {
        for (var o of Object.keys(options)) {
            this[o] = options[o];
        }
        this.animation = Animation.loadAnimationArray(this.animation, 0, options.src);
        this.p = -1;
        /**
        directions:
        0: standing still facing down
        1: standing still facing left
        2: standing still facing up
        3: standing still facing right
        4: moving down
        5: moving left
        6: moving up
        7: moving right
        **/
        this.direction = 0;
        this.moving = false;
        this.hasFlipped = false;
    }

    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }
    getSprite() {
        return this.sprite;
    }
    getDirection() {
        return this.direction;
    }

    setDirection(d) {
        this.direction = d;
    }
    setX(x) {
        this.x = x;
    }
    setY(y) {
        this.y = y;
    }
    

    spawn(x, y) {
        if (x == undefined) {
            x = this.getX();
            y = this.getY();
        } else {
            this.setY(y);
            this.setX(x);
        }
        //this checks if the player is traveling and set te correct place
        if (this.p != -1) {
            var path = this.world.paths[this.p];
            var delta = this.world.getChange(this.getDirection());
            var blockx = false;
            var blocky = false;
            //checks the x direction
            if ((this.getX() != path.endX && this.getDirection() == 6) || (this.getX() != path.startX && this.getDirection() == 5)) {
                this.setX(this.getX() + delta[0]);
            } else {
                blockx = true;
            }
            //checks the y direction
            if ((this.getY() != path.endY && this.getDirection() == 4) || (this.getY() != path.startY && this.getDirection() == 7)) {
                this.setY(this.getY() + delta[1]);
            } else {
                blocky = true;
            }
            var ob = this.world.isOOB(this.getX(), this.getY());
            if (ob != -1) {
                delta = [delta[0] * this.world.width, delta[1] * this.world.width];
                x -= delta[0];
                y -= delta[1];
                if (!this.hasFlipped) {
                    this.world.bg = this.world.getBackground(this.world.user, path);
                    this.hasFlipped = true;
                }
            }

            //when the player has reached the destination we set the new path
            if (blockx && blocky) {
                if (ob != -1) {
                    switch (ob) {
                        case 0:
                            this.setX(this.world.width + this.getX());
                            break;
                        case 1:
                            this.setX(this.getX() - this.world.width);
                            break;
                        case 2:
                            this.setY(this.world.height + this.getY());
                            break;
                        case 3:
                            this.setY(this.getY() - this.world.height);
                            break;
                    }
                    this.hasFlipped = false;
                }

                this.p = this.getPointer(path, this.getX(), this.getY());
                this.setDirection(this.calcDirection(this.getX(), this.getY(), this.p));
            }
        }


        //drawing the player
        this.animation[this.getDirection()].doAnimation(x, y);
    }

   

    //gets the correct next path
    getPointer(path, x, y) {
        if (path.startX == x && path.startY == y) {
            return path.endPointer;
        } else if (path.endX == x && path.startY == y) {
            return path.startPointer;
        } else if (path.starY == y && path.startX == x) {
            return path.endPointer;
        } else {
            return path.startPointer;
        }
    }
    /**
directions:
0: standing still facing down
1: standing still facing left
2: standing still facing up
3: standing still facing right
4: moving down
5: moving left
7: moving up
6: moving right
**/
    //calculates the direction the player is traveling to
    calcDirection(startX, startY, p) {
        if (p == -1) {
            this.moving = false;
            return 0;
        } else {
            var path = this.world.paths[p];
            if (startX == path.startX && startY == path.endY) {
                return 6;
            } else if (startX == path.endX && startY == path.endY) {
                return 5;
            } else if (startY == path.endY && startX == path.endX) {
                return 7;
            } else {
                return 4;
            }
        }
    }
    //handles the movements in the overworld
    doMove(type) {
        if (!this.moving) {
            switch (type) {
                case "left":
                    var p = this.world.onPath(this.getX(), this.getY(), 5);
                    if (p != -1) {
                        this.p = p.id;
                        this.setDirection(5);
                        this.moving = true;
                    }
                    break;
                case "right":
                    var p = this.world.onPath(this.getX(), this.getY(), 6);
                    if (p != -1) {
                        this.p = p.id;
                        this.setDirection(6);
                        this.moving = true;
                    }
                    break;
                case "down":
                    var p = this.world.onPath(this.getX(), this.getY(), 4);
                    if (p != -1) {
                        this.p = p.id;
                        this.setDirection(4);
                        this.moving = true;
                    }
                    break;
                case "up":
                    var p = this.world.onPath(this.getX(), this.getY(), 7);
                    if (p != -1) {
                        this.p = p.id;
                        this.setDirection(7);
                        this.moving = true;
                    }
                    break;
                case "action":
                    var portal = this.world.onPortal(this.getX(), this.getY())
                    if (portal != null) {
                        //load into level
                        this.world.handlePortal(portal);
                    }
                    break;
                case "quit":
                    //open exit menu
                    this.world.inExitMenu = true;
                    break;
            }
        }
    }
}

class OverWorld {
    constructor(player, file) {
        this.user = player;
       
        this.ach = loadAchievements();
        this.file = file;

        this.onOverWorld = true;

        this.isTestLevel = false;
        this.inShop = false;
        this.inCharacterSelect = false;
        this.inMuseum = false;
        this.inExitMenu = false;

        this.shop = loadShop(player);
        this.exit = new ExitMenu(this);

        this.startDialog = false;
        this.doingDialog = false;
        this.dialog = -1;
        this.paths = [];
        this.width = container.clientWidth;
        this.height = container.clientHeight - 100;

        this.music = new SoundManager("../resources/sounds/music/005_1.wav", "music");

        this.img = [];
        this.bg = 0;
        this.loadOverWorld(file);

        this.music.play();
    }

    makeCanvas() {
        canvas = create("canvas", "fg", 0, 0, this.width, this.height);
    }

    //loads the overworld
    loadOverWorld(file) {
        this.makeCanvas();

        this.width = container.clientWidth;
        this.height = container.clientHeight;

        for (var any of JSON.parse(file)) {
            for (var bg of any.backgrounds) {
                var ig = new Image();
                ig.src = bg.src;
                this.img[bg.id] = ig;
            }
            this.portals = any.portals;

            this.paths[-1] = { id: -1, startX: 0, startY: 0, endX: 0, endY: 0 };
            for (var paths of any.paths) {
                this.paths[paths.id] = paths;
            }

            this.startX = any.startX;
            this.startY = any.startY;
        }
    }

    //loads the player
    loadPlayer(player, reload) {
        var options = player;
        options.world = this;
        options.src = player.src;
        var x = reload ? this.getPlayer().getX() : this.startX;
        var y = reload ? this.getPlayer().getY() : this.startY;
        this.player = new OverWorldPlayer(options);
        loaded = true;
        this.getPlayer().spawn(x, y);
        this.diag = loadDialog(player);
    }

    //gets the first available background for the world
    getBackground(player, path) {
        for (var bg of path.toOverworlds) {
            if (player.unlockedOverworlds.indexOf(bg) != -1) {
                return bg;
            }
        }
        return -1;
    }

    //checks if it is OOB
    isOOB(x, y) {
        if (x < 0) {
            return 0;
        }
        if (x > this.width) {
            return 1;
        }
        if (y < 0) {
            return 2;
        }
        if (y > this.height) {
            return 3;
        }
        return -1;
    }

    //handles every tick made
    doTick() {
        this.check();
        this.drawWorld();
        this.getPlayer().spawn();
    }

    getPlayer() {
        return this.player;
    }

    //draws the main background
    drawWorld() {
        if (this.player != undefined) {
            var ctx = canvas.getContext("2d");
            ctx.drawImage(this.img[this.bg], 0, 0, this.img[this.bg].width, this.img[this.bg].height, 0, 0, this.width, this.height);
        }
    }

    //checks if the canvas has the right size
    check() {
        if (canvas.width != sizeSettings[0]) {
            canvas.width = sizeSettings[0];
        }
        if (canvas.height != sizeSettings[1]) {
            canvas.height = sizeSettings[1];
        }

        if (this.width != container.clientWidth) {
            this.width = container.clientWidth;
        }
        if (this.height != container.clientHeight) {
            this.height = container.clientHeight;
        }
    }
    //check if the player is on a portal to a level or shop
    onPortal(x, y) {
        for (var portal of this.portals) {
            if (portal.X == x && portal.Y == y && portal.worldId.indexOf(this.bg) != -1) {
                return portal
            }
        }
        return null;
    }
    //checks if the player is trying to walk on a path and returns said path
    onPath(x, y, d) {
        for (var path of this.paths) {
            if (path.worldId.indexOf(this.bg) == -1) {
                continue;
            }
            if ((x == path.startX || x == path.endX) && (y == path.startY || y == path.endY)) {
                var delta = this.getDelta(d, path);
                if (delta[0] == 0 && delta[1] == 0) {
                    continue;
                }
                if ((this.isOOB(path.startX, path.startY) != -1 || this.isOOB(path.endX, path.endY) != -1) && this.getBackground(this.user, path) == -1) {
                    continue;
                }

                if ((x + delta[0] == path.startX || x + delta[0] == path.endX) && (y + delta[1] == path.startY || y + delta[1] == path.endY)) {
                    return path;
                }
            }
        }
        return -1;
    }
    //handles the operations in side the buildings
    handleBuildings() {
        if (this.inShop) {
            this.shop.openShop();
            return true;
        } else if (this.inCharacterSelect) {
            this.characters.openHouse();
            return true;
        } else if (this.onOverWorld) {
            this.doTick();

            return true;
        } else if (this.inMuseum) {
            this.museum.doTick();
            return true;
        }
        return false;
    }

    //handles keyboard inputs while inside a building
    handleKeys(type, isDown) {
        if (this.inShop) {
            this.shop.navigate(type);
            return true;
        } else if (this.inCharacterSelect) {
            this.characters.navigate(type);
            return true;
        } else if (this.onOverWorld) {
            this.getPlayer().doMove(type);
            return true;
        } else if (this.inMuseum) {
            this.museum.getPlayer().doMove(type, isDown);
            return true;
        }
        return false;
    }

    /**
directions:
0: standing still facing down
1: standing still facing left
2: standing still facing up
3: standing still facing right
4: moving down
5: moving left
7: moving up
6: moving right
**/
    //gets the difference  between start and end of a path
    getDelta(d, path) {
        //change this with the path...
        switch (d) {
            case 6:
                return [path.endX - path.startX, 0];
            case 5:
                return [-(path.endX - path.startX), 0];
            case 4:
                return [0, path.endY - path.startY];
            case 7:
                return [0, -(path.endY - path.startY)];
            default:
                return [0, 0];
        }
    }
    //gets the way the player has to move
    getChange(d) {
        switch (d) {
            case 6:
                return [1, 0];
            case 5:
                return [- 1, 0];
            case 4:
                return [0, + 1];
            case 7:
                return [0, - 1];
            default:
                return [0, 0];
        }
    }

    //goes to a map from a local json file used for the campaign
    toMap(name) {
        //loading the map the player chose
        this.onOverWorld = false;
        this.music.stop();
        loaded = false;
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        canvas.remove();
        loadMap(name, this.user, function (m) {
            m.loadCharacter(overWorld.characters.getCharacter());
        }, this);
    }

    //goes to a map from a database object
    toMapFromDB(mapObject) {
        console.log(mapObject)
        //loading the map the player chose
        this.onOverWorld = false;
        this.music.stop();
        loaded = false;
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        canvas.remove();
        map = new Level(this.user, JSON.stringify(mapObject), this);
        map.loadCharacter(overWorld.characters.getCharacter());
    }

    //going back to the overworld
    toOverWorld(type) {
        if (this.isTestLevel) {
            back();
            return;
        }

        overWorld.inShop = false;
        this.inCharacterSelect = false;
        this.inMuseum = false;
        this.onOverWorld = true;
        this.music.play();

        var p = this.onPortal(this.getPlayer().getX(), this.getPlayer().getY());
        if (p != null && p.endDialog != -1) {
            this.doingDialog = true;
            this.dialog = p.endDialog;
            this.startDialog = false;
            this.type = type;
        } else {
            this.doingDialog = false;
        }
    }

    //remade of the canvas used, used for when switching from a map object to the overworld
    toOverWorldNewCanvas(type) {
        this.makeCanvas();
        this.toOverWorld(type);
    }

    //handles a portal on the overworld
    handlePortal(portal) {
        //checks if a dialog needs to start
        if (portal.startDialog != -1) {
            this.doingDialog = true;
            this.dialog = portal.startDialog;
            this.startDialog = true;
        }
        switch (portal.type) {
            case "level":
                this.toMap(portal.mapName);
                this.type = map;
                break;
            case "store":
                this.toShop();
                this.type = this.shop;
                break;
            case "house":
                this.toCharacterSelect();
                this.type = this.characters;
                break;
            case "museum":
                this.toMuseum();
                this.type = this.museum;
                break;
        }
    }
    //handles the going to shop
    toShop() {
        this.music.stop();
        this.onOverWorld = false;
        this.inShop = true;
    }
    //going to the character select
    toCharacterSelect() {
        this.music.stop();
        this.inCharacterSelect = true;
        this.onOverWorld = false;
    }

    //loads the characters
    loadCharacterSelect(overWorld, characters, player, texts) {
        this.characters = new CharacterSelect(overWorld, characters, player, texts);
        this.loadPlayer(this.characters.getOverWorldCharacter(), false);
        this.museum = new Museum(player, this.characters.getCharacter(), this);
    }

    //going to the museum
    toMuseum() {
        this.museum.loadArtifacts();
        this.onOverWorld = false;
        this.inMuseum = true;
        this.music.stop();
    }

}

//initial loading function
function loadOverworld(player, callback) {
    loadJSONFile(function (response) {
        try {
            overWorld = new OverWorld(player, response);
            callback(overWorld);
        } catch (err) {
            loaded = false;
            console.log(err);
            canvas.remove();
            canvas = undefined;
            clearInterval(interval)
            //   loadGame(false);
        }
    }, "/client/resources/jsons/overworld.json");

}