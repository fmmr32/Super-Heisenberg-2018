class Animation {
    constructor(image, frames, frameRate, columns, forcedAnimate) {
        this.image = image;

        this.frames = frames;
        this.frameRate = frameRate;
        this.columns = columns;

        this.width = image.width;
        this.height = image.height;
        this.startX = image.startX;
        this.startY = image.startY;
        this.offSetX = image.offSetX;
        this.offSetY = image.offSetY;

        this.column = 0;
        this.frame = 1;
        this.row = 0;

        this.forcedAnimate = forcedAnimate;
        this.animating = forcedAnimate;

        this.then = 0;
        this.delta = 0;
    }

    doAnimation(X, Y) {

        var now = Date.now();
        this.delta = now - this.then;
        //this loops the animation frame on the animation framerate
        if (this.animating && this.delta > 1000 / this.frameRate) {
            this.frame++;
            this.column++;
            if (this.column == this.columns) {
                this.column = 0;
                this.row++;
            }
            if (this.frame > this.frames) {
                this.frame = 1;
                this.column = 0;
                this.row = 0;
                this.animating = this.forcedAnimate;
            }

            this.then = now - (this.delta % this.frameRate);

        }


        var ctx = canvas.getContext("2d");
        var img = this.image;

        ctx.drawImage(img, this.column * this.width + this.startX, this.row * this.height + this.startY, this.width, this.height, X + this.offSetX, Y + this.offSetY, this.width, this.height);

    }

}


class Entity {
    constructor(options) {
        this.level = options.level;
        this.posX = options.x;
        this.posY = options.y;
        this.sprite = options.sprite;


        if (options.animation != undefined) {
            this.animation = options.animation;
        }

    }


    getSprite() {
        return this.sprite;
    }

    setX(x) {
        this.posX = x;
    }

    getX() {
        return this.posX;
    }

    setY(y) {
        this.maxY = Math.min(y, this.maxY);
        this.posY = y;
    }
    getY() {
        return this.posY + this.getHeight();
    }

    spawn(X, Y) {

        canvas.getContext("2d").save();
        this.posX = X;
        this.posY = Y;
        //makes sure the entity is drawn at the correct place
        try {
            X -= this.level.getPlayer().getX();
        } catch (err) {
        }
        X += container.clientWidth / 2;
        X -= this.getSprite().width / 2;
        X = Math.floor(X);

        if (this.animation == undefined) {

            this.sprite.draw(X, Y);
        }

        //drawing the weapon on the entity if it has one
        if (this.currentWeapon != undefined) {
            var flipped = false;
            if (this.getLastOffSet() <= 0) {
                X += this.rightHand[0];
                Y += this.rightHand[1];
            } else {
                X += this.leftHand[0];
                Y += this.leftHand[1];
                flipped = true;
            }
            this.currentWeapon.drawGun(X, Y, flipped);
        }

        //running an animation loop for standard entities
        if (this.animation != undefined) {
            this.animation.doAnimation(X, Y);
        }

        canvas.getContext("2d").restore();
    }

    getHeight() {
        return this.getSprite().height;
    }





}

class EntityMovable extends Entity {
    constructor(options) {
        super(options);
        this.speed = options.speed;
        this.vs = 0;
        this.hs = 0;
        this.lastOffSet = 0;
        this.elapsedTime = 1;
        this.onFloor = false;
        this.flagged = false;
        this.maxY = 900;
    }

    getSpeed() {
        return this.speed;
    }

    setVSpeed(s) {
        this.vs = Math.floor(s);
    }

    getVSpeed() {
        return this.vs;
    }

    setHSpeed(s) {
        this.hs = Math.floor(s);

    }

    getHSpeed() {
        return this.hs;
    }

    getLastOffSet() {
        return this.lastOffSet;
    }
    doCollision() {

        //getting the from and to values of the entity
        var creaX = this.getX() + this.getSprite().getCenter();
        if (this.getHSpeed() > 0) {
            creaX += this.getSprite().getCenter();
        } else if (this.getHSpeed() < 0) {
            creaX -= this.getSprite().getCenter();
        }
        var creaY = this.getY() - this.getHeight();

        var fromX = Math.min(creaX, creaX + this.getHSpeed());
        var fromY = Math.min(creaY, creaY + this.getVSpeed());

        var toX = Math.max(creaX, creaX + this.getHSpeed());
        var toY = Math.max(creaY, creaY + this.getVSpeed() + this.getHeight()-1);

        //checking to see if the from x to the new x collides
        for (var x = fromX; x <= toX; x++) {
            //checking to see if the from y to the new y collides
            for (var y = fromY; y <= toY; y++) {
                //somewhere it collides
                if (!this.level.isOOB(x, y)) {
                    if (this.level.getBlock(x, y).Id != 0) {
                        //setting back to the correct spawn x
                        if (this.getVSpeed() == 0) {
                            y = toY+1;
                        }

                        this.setY(y - this.getHeight());

                        this.setHSpeed(0);
                        this.setVSpeed(0);

                        //below is needed for bullets, ignored for creatures
                        var temp = {};
                        temp.modDX = Math.abs(fromX - x);
                        if (y == fromY) {
                            temp.code = 2;
                        } else {
                            if (this.getVSpeed() > 0) {
                                temp.code = 3;
                            } else {
                                temp.code = 1;
                            }
                        }
                        return temp;
                    }
                    var collidingEntity = this.level.getEntity(x, y);
                    if (collidingEntity != null && collidingEntity != this) {
                        if (collidingEntity instanceof Bullet && this instanceof EntityCreature) {
                            if (collidingEntity.getOwner() != this) {
                                //do damage to origin entity...
                            }
                        } else if (this instanceof Player && collidingEntity instanceof EntityCreature) {
                            //see if there is touch damage
                            console.log("touching someone");
                        } else if (this instanceof Player) {
                            //picking up a coin?
                            this.money++;
                            this.level.removeEntity(collidingEntity);
                        }
                    }
                }
            }
        }
        return { code: 0, modDX: 0 };

    }

    //handles the gravity
    doGravity() {
        var x = this.getX() + this.getSprite().getCenter();
        //checks if a enitty is in the air then setting the last offset, this allows the player to stand on the edge
        if (this.level.getBlock(x, this.getY()).Id == 0) {
            if (this.level.getBlock(x + this.getLastOffSet(), this.getY()).Id != 0) {
                x += this.getLastOffSet();
            } else if (this.level.getBlock(x - this.getLastOffSet(), this.getY()).Id != 0) {
                x -= this.getLastOffSet();
            }
        }
        //see if the entity is in the air then let the entity fall
        if (this.level.getBlock(x, this.getY()).Id == 0) {
            this.onFloor = false;
            this.setVSpeed(this.getVSpeed() + Math.floor(this.elapsedTime / this.level.gravity));
            this.elapsedTime++;
        } else {
            this.elapsedTime = 0;
            this.onFloor = true;
        }
        this.doCollision();
    }

    //bacis do move function for an entity
    doMove(onTick) {
        if (onTick) {
            this.setX(this.getX() + this.getHSpeed());
            this.setY(this.getY() - this.getSprite().height + this.getVSpeed());
            this.spawn(this.getX(), this.getY() - this.getSprite().height);
        }
    }
}

class EntityCreature extends EntityMovable {
    constructor(options) {
        super(options);
        this.hp = options.hp;
        this.weapons = options.weapon;
        this.currentWeapon = this.weapons[0];

        this.leftHand = options.leftHand;
        this.rightHand = options.rightHand;

        this.gravity = options.gravity;

        this.startY = 0;
        this.jump = options.jump;

        this.respawn = false;
        this.leftDown = false;
        this.rightDown = false;
        this.jumpDown = false;
        this.jumping = false;
        this.jumpCounter = 0;
    }

    doRespawn() {
        if (this.respawn) {
            this.spawn(this.level.spawnX, this.level.spawnY);
            this.setVSpeed(0);
            this.setHSpeed(0);
        }
    }


    getJump() {
        return this.jump;
    }

    doMove(type, isDown, onTick) {
        //see what type of movement the player did
        switch (type) {
            case "right":
                this.rightDown = isDown;
                break;
            case "left":
                this.leftDown = isDown;
                break;
            case "jump":
                if (isDown && this.jumpDown) {
                    return;
                }

                this.jumpDown = isDown;
                break;
            case "stop":
                this.rightDown = false;
                this.leftDown = false;
                this.jumpDown = false;
                break;
            case "fire":
                this.currentWeapon.fireWeapon(this, this.level);
                break;
            case "main":
                if (this.weapons.length > 1) {
                    this.currentWeapon = this.weapons[1];
                }
                break;
            case "secondary":
                this.currentWeapon = this.weapons[0];
                break;
            case "action":
                //insert for interacting with stuff like levers..
                break;
        }
        //handling to what the player did
        if (this.rightDown) {
            this.setHSpeed(this.getSpeed());
            this.doCollision();
            this.lastOffSet = -this.getSprite().getOffSet();
        } else if (this.leftDown) {
            this.setHSpeed(-this.getSpeed());
            this.doCollision();
            this.lastOffSet = this.getSprite().getOffSet();
        } else {
            this.setHSpeed(0);
        }

        //handling the jumping
        if (this.jumpDown && this.onFloor) {


            if (onTick) {
                var y = -this.getJump() * this.level.gravity;
                this.setVSpeed(y);
                this.onFloor = false;
            }
        }
        //doing the gravity fuction
        this.doGravity();

        //handles what happens on the tick update
        if (onTick) {

            this.setX(this.getX() + this.getHSpeed());
            if (this.jumping) {
                var y = -this.getJump() * this.level.gravity;
                this.setVSpeed(y);
                this.jumpCounter++;
                if (this.jumpCounter == 0) {
                    this.jumping = false;
                }
            }
            //setting the height correctly
            this.setY(this.getY() - this.getHeight() + this.getVSpeed());
            this.currentWeapon.lowerCD();
            //check for Out of bounds
            switch (this.level.isOOB(this.getX(), this.getY())) {
                case 1:
                    this.setX(container.clientWidth + this.getSprite().getCenter() * 2);
                    break;
                case 2:
                    this.setX(0);
                    break;
                case 3:
                    this.doRespawn();
                    break;
            }
            //spawning at the new place
            this.spawn(this.getX(), this.getY() - this.getHeight());
        }
    }


}


class Player extends EntityCreature {
    constructor(options) {
        super(options);
        this.respawn = true;
       
        

        this.money = 0;
    }


    getMoney() {
        return this.money;
    }
    

}