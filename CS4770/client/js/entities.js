class Animation {
    constructor(image, frames, frameRate, columns) {
        this.image = image;
        this.frames = frames;
        this.frameRate = frameRate;
        this.columns = columns;
        this.width = image.width;
        this.height = image.height;
        this.startX = image.startX;
        this.startY = image.startY;

        this.column = 0;
        this.frame = 1;
        this.row = 0;
        this.animating = false;
    }

    doAnimation(X, Y) {
        if (this.animating) {
            this.frame++;
            this.column++;
            if (this.column == this.columns) {
                this.column = 0;
                this.row++;
            }
            if (this.frame == this.frames) {
                this.frame = 1;
                this.column = 0;
                this.row = 0;
                this.animating = false;
            }
        }
        var ctx = canvas.getContext("2d");
        var img = this.image;
        ctx.drawImage(img, this.column * this.width + this.startX, this.row * this.height + this.startY, this.width, this.height, X, Y, this.width, this.height);

    }

}


class Entity {
    constructor(options) {
        this.map = options.map;
        this.posX = options.x;
        this.posY = options.y;
        this.sprite = options.sprite;
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
        X -= this.map.getPlayer().getX();
        X += container.clientWidth / 2;
        X -= this.getSprite().width / 2;
        X = Math.floor(X);

       
        this.sprite.draw(X, Y);
        if (this.currentWeapon != undefined) {
            var flipped = false;
            if (this.getHSpeed() >= 0) {
                X += this.rightHand[0];
                Y += this.rightHand[1];
            } else {
                X += this.leftHand[0];
                Y += this.leftHand[1];
                flipped = true;
            }
            this.currentWeapon.drawGun(X, Y, flipped);
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
    }

    getSpeed() {
        return this.speed;
    }

    setVSpeed(s) {
        this.vs = s;
    }

    getVSpeed() {
        return this.vs;
    }

    setHSpeed(s) {
        this.hs = s;

    }

    getHSpeed() {
        return this.hs;
    }

    getLastOffSet() {
        return this.lastOffSet;
    }
    doCollision() {
        var creaX = this.getX() + this.getSprite().getCenter();
        if (this.getHSpeed() > 0) {
            creaX += this.getSprite().getCenter();
        } else if (this.getHSpeed() <= 0) {
            creaX -= this.getSprite().getCenter();
        }
        var creaY = this.getY() - 1;

        var fromX = Math.min(creaX, creaX + this.getHSpeed());
        var fromFY = Math.min(creaY, creaY + this.getVSpeed());

        var toX = Math.max(creaX, creaX + this.getHSpeed());
        var toFY = Math.max(creaY, creaY + this.getVSpeed());

        //checking to see if the from x to the new x collides
        for (var x = fromX; x <= toX; x++) {
            //checking to see if the from y to the new y collides
            for (var y = fromFY; y <= toFY; y++) {
                //somewhere it collides
                if (x < 0 || x >= this.map.width || this.map.getBlock(x, y).Id != 0) {
                    //setting back to the correct spawn x
                    if (this.getHSpeed() > 0) {
                        x -= this.getSprite().getCenter() * 2;
                    } else if (this.getHSpeed() < 0) {
                        x += this.getSprite().getOffSet() / 2;
                    }

                    x += this.getLastOffSet() >= 0 ? 1 : -1;

                    this.setX(x);
                    this.setY(y - this.getHeight());

                    this.setHSpeed(0);
                    this.setVSpeed(0);

                    //below is needed for bullets, ignored for creatures
                    var temp = {};
                    temp.modDX = Math.abs(fromX - x);
                    if (y == fromFY) {
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
            }
        }
        return { code: 0, modDX: 0 };

    }

    doGravity() {
        if (tick % 40 == 0) {
            var x = this.getX() + this.getSprite().getCenter();
            if (this.map.getBlock(x, this.getY()).Id == 0) {
                if (this.map.getBlock(x + this.getLastOffSet(), this.getY()).Id != 0) {
                    x += this.getLastOffSet();
                } else if (this.map.getBlock(x - this.getLastOffSet(), this.getY()).Id != 0) {
                    x -= this.getLastOffSet();
                }
            }

            if (this.map.getBlock(x, this.getY()).Id == 0) {
                this.onFloor = false;
                this.setVSpeed(this.getVSpeed() + this.map.gravity);
                this.elapsedTime++;
            } else {
                this.elapsedTime = 1;
                this.onFloor = true;
            }
            this.doCollision();
        }
    }

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


        this.jump = options.jump;

        this.respawn = false;

    }

    doRespawn() {
        if (this.respawn) {
            console.log("Respawn called");
            this.spawn(this.map.spawnX, this.map.spawnY);
            this.setVSpeed(0);
            this.setHSpeed(0);
        }
    }


    getJump() {
        return this.jump;
    }


}


class Player extends EntityCreature {
    constructor(options) {
        super(options);
        this.respawn = true;
        this.leftDown = false;
        this.rightDown = false;
        this.jumpDown = false;
        this.jumping = false;
        this.jumpCounter = 0;
        this.startY = 0;
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
            case "stopH":
                this.setHSpeed(0);
                break;
            case "fire":
                this.currentWeapon.fireWeapon(this, self.map);
                break;
            case "main":
                if (this.weapons.length > 1) {
                    this.currentWeapon = this.weapons[1];
                }
                break;
            case "secondary":
                this.currentWeapon = this.weapons[0];
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
                var y = -this.getJump() * this.map.gravity;
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
                var y = -this.getJump() * this.map.gravity;
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
            switch (this.map.isOOB(this.getX(), this.getY())) {
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