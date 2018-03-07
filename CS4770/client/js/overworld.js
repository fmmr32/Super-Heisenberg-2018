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
        if (this.p != -1) {
            var path = this.world.paths[this.p];
            var delta = this.world.getChange(this.getDirection());
            var blockx = false;
            var blocky = false;
            if ((this.getX() != path.endX && this.getDirection() == 6) || (this.getX() != path.startX && this.getDirection() == 5)) {
                this.setX(this.getX() + delta[0]);
            } else {
                blockx = true;
            }
            if ((this.getY() != path.endY && this.getDirection() == 4) || (this.getY() != path.startY && this.getDirection() == 7)) {
                this.setY(this.getY() + delta[1]);
            } else {
                blocky = true;
            }
        //    console.log(blockx, blocky);
            if (blockx && blocky) {
                this.p = path.pointer;
                this.setDirection(this.calcDirection(this.getX(), this.getY(), this.p));
            }
        }
        this.animation[this.getDirection()].doAnimation(x, y);
    }
    calcDirection(startX, startY, p) {
        if (p == -1) {
            this.moving = false;
            return 0;
        } else {
            var path = this.world.paths[p];
            if (startX > path.endX && startY == path.endY) {
                return 6;
            } else if (startX > path.startX && startY == path.endY) {
                return 5;
            } else if (startY > path.endY && startX == path.endX) {
                return 7;
            } else {
                return 4;
            }
        }
    }

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
                    console.log(portal);
                    if (portal != null) {
                        //load into level
                        this.world.toMap(portal.mapName);
                    }
                    break;
            }
        }
    }
}

class OverWorld {
    constructor(player, file, playerx, playery) {
        this.user = JSON.parse(player);
        this.file = file;
        this.onOverworld = true;
        this.paths = [];
        this.width = 720;
        this.height = 500;
        this.loadOverWorld(file);

        if (playerx != undefined) {
            this.playerx = playerx;
            this.playery = playery;
        }
        
    }

    makeCanvas() {

        canvas = create("canvas", "fg", 0, 0, this.width, this.height);
    }

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

    loadPlayer(file) {
        for (var ani of JSON.parse(file)) {
            if (ani.id == this.user.currentCharacter) {
                var options = ani;
                options.world = this;
                options.src = ani.src;
                this.player = new OverWorldPlayer(options);
                loaded = true;
                if (this.playerx == undefined) {
                    this.getPlayer().spawn(this.startX, this.startY);
                } else {
                    this.getPlayer().spawn(this.playerx, this.playery);
                }
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
        if (this.width != 720) {
            this.width = 720;
        }
        if (this.height != 500) {
            this.height = 500;
        }
    }

    onPortal(x, y) {
        for (var portal of this.portals) {
            if (portal.X == x && portal.Y == y) {
                return portal
            }
        }
        return null;
    }

    onPath(x, y, d) {
        for (var path of this.paths) {
            if ((x == path.startX || x == path.endX) && (y == path.startY || y == path.endY)) {
                var delta = this.getDelta(d, x, y);
                if ((x >= path.startX && delta[0] <= path.endX) || (x >= path.endX && delta[0] <= path.startX) && (y >= path.startY && delta[1] <= path.endY) || (y >= path.endY && delta[1] <= path.startY)) {
                    return path;
                }
            }
        }
        return -1;
    }

    getDelta(d, x, y) {
        switch (d) {
            case 6:
                return [x + 1, y];
            case 5:
                return [x - 1, y];
            case 4:
                return [x, y + 1];
            case 7:
                return [x, y - 1];
            default:
                return [x, y];
        }
    }

    getChange(d) {
        switch (d) {
            case 6:
                return [ 1, 0];
            case 5:
                return [- 1, 0];
            case 4:
                return [0, + 1];
            case 7:
                return [0,  - 1];
            default:
                return [0, 0];
        }
    }

    toMap(name) {
        ////loading the test map
        this.onOverworld = false;
        this.playerx = this.getPlayer().getX();
        this.playery = this.getPlayer().getY();
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        canvas.remove();
        loadMap(name, JSON.stringify(this.user), function (m) {
            loadJSONFile(function (response) {
                m.loadCharacter(response);
            }
                , "/client/resources/characters.json");
        });
    }

    toOverWorld(player) {
        this.makeCanvas();
        this.onOverworld = true;
    }
}


function loadOverworld(player, callback, playerx, playery) {
    loadJSONFile(function (response) {
        try {
            overWorld = new OverWorld(player, response, playerx, playery);
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