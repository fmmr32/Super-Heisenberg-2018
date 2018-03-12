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
            //when the player has reached the destination we set the new path
            if (blockx && blocky) {
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
            }
        }
    }
}

class OverWorld {
    constructor(player, file) {
        this.user = player;
        this.file = file;
        this.onOverworld = true;
        this.inShop = false;
        this.shop = loadShop(player);
        this.paths = [];
        this.width = container.clientWidth;
        this.height = container.clientHeight - 100;
        this.loadOverWorld(file);

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
            this.img = new Image();
            this.img.src = any.src;
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
    loadPlayer(file) {
        for (var ani of JSON.parse(file)) {
            if (ani.id ==this.user.currentCharacter) {
                var options = ani;
                options.world = this;
                options.src = ani.src;
                this.player = new OverWorldPlayer(options);
                loaded = true;
                this.getPlayer().spawn(this.startX, this.startY);
                break;
            }
        }

    }

    doTick() {
        this.check();
        this.drawWorld();
        this.getPlayer().spawn();
    }

    getPlayer() {
        return this.player;
    }

    drawWorld() {
        if (this.player != undefined) {
            var ctx = canvas.getContext("2d");
            ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, 0, 0, this.width, this.height);
        }
    }
    check() {
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
            if (portal.X == x && portal.Y == y) {
                return portal
            }
        }
        return null;
    }
    //checks if the player is trying to walk on a path and returns said path
    onPath(x, y, d) {
        for (var path of this.paths) {
            if ((x == path.startX || x == path.endX) && (y == path.startY || y == path.endY)) {
                var delta = this.getDelta(d, path);
                if (delta[0] == 0 && delta[1] == 0) {
                    continue;
                }
                if ((x + delta[0] == path.startX || x + delta[0] == path.endX) && (y + delta[1] == path.startY || y + delta[1] == path.endY)) {
                    return path;
                }
            }
        }
        return -1;
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

    toMap(name) {
        //loading the map the player chose
        this.onOverworld = false;
        loaded = false;
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        canvas.remove();
        loadMap(name, this.user, function (m) {
            loadJSONFile(function (response) {
                m.loadCharacter(response);
            }
                , "/client/resources/characters.json");
        });
    }

    //going back to the overworld
    toOverWorld() {
        this.makeCanvas();
        this.onOverworld = true;
    }

    handlePortal(portal) {
        switch (portal.type) {
            case "level":
                this.toMap(portal.mapName);
                break;
            case "store":
                this.toShop();
                break;
            case "house":
                break;
        }
    }
    //handles the going to shop
    toShop() {
        this.onOverworld = false;
        this.inShop = true;
    }
}


function loadOverworld(player, callback) {
    loadJSONFile(function (response) {
        try {
            overWorld = new OverWorld(player, response);
            getOverWorld(overWorld);
            callback(overWorld);
        } catch (err) {
            loaded = false;
            console.log(err);
            canvas.remove();
            canvas = undefined;
            clearInterval(interval)
            //   loadGame(false);
        }
    }, "/client/resources/overworld.json");

}