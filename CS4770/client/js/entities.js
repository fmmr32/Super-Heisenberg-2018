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
        return this.posY + this.getheight();
    }

    spawn(X, Y) {
        this.posX = X;
        this.posY = Y;


        this.sprite.draw(X, Y);

    }

    getheight() {
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
        } else if (this.getHSpeed() < 0) {
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
                if (x < 0 || x >= this.map.width || this.map.getBlock(x - this.map.offSetX, y).Id != 0) {
                    //setting back to the correct spawn x
                    if (this.getHSpeed() > 0) {
                        x -= this.getSprite().getCenter() * 2;
                    } else if (this.getHSpeed() == 0) {
                        x -= this.getSprite().getCenter();
                    }
                    //setting the values
                    this.setX(x);
                    this.setY(y - this.getheight());
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
                } else {
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
            // canvas.fg.getContext("2d").fillText(this.angle, this.getX(), this.getY());
        }
    }
}

class EntityCreature extends EntityMovable {
    constructor(options) {
        super(options);
        this.hp = options.hp;
        this.weapons = options.weapon;
        this.currentWeapon = this.weapons[0];


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

        if (this.jumpDown && this.onFloor) {


            if (onTick) {
                var y = -this.getJump() * this.map.gravity;
                this.setVSpeed(y);
                this.onFloor = false;
            }
        }
        this.doGravity();


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
            this.setY(this.getY() - this.getheight() + this.getVSpeed());
            this.currentWeapon.lowerCD();
            switch (this.map.isOOB(this.getX() + this.getSprite().getCenter()*2, this.getY())) {
                case 1:
                    this.setX(container.clientWidth - this.getSprite().getCenter()*2);
                    break;
                case 2:
                    this.setX(0);
                    break;
                case 3:
                    this.doRespawn();
                    break;
            }
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

            this.spawn(this.getX(), this.getY() - this.getheight());
        }
    }

}