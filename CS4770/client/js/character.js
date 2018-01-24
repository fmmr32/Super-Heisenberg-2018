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
        return this.posY + this.getHeigth();
    }

    spawn(X, Y) {
        this.posX = X;
        this.posY = Y;
        this.sprite.draw(X, Y);

    }

    getHeigth() {
        return this.getSprite().heigth;
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
        } else if (this.getHSpeed() < 0){
            creaX -= this.getSprite().getCenter();
        }
        var footY = this.getY()-1;
        var headY = this.getY() - this.getHeigth();

        var fromX = Math.min(creaX, creaX + this.getHSpeed());
        var fromFY = Math.min(footY, footY + this.getVSpeed());
        var fromHY = Math.min(headY, headY + this.getVSpeed());

        var toX = Math.max(creaX, creaX + this.getHSpeed());
        var toFY = Math.max(footY, footY + this.getVSpeed());
        var toHY = Math.max(headY, headY + this.getVSpeed());


        for (var x = fromX; x <= toX; x++) {
            for (var y = fromFY; y <= toFY; y++) {
                if (x < 0 || x >= this.map.width || this.map.getBlock(x, y).Id != 0) {
                    if (this.getHSpeed() > 0) {
                        x -= this.getSprite().getCenter()*2;
                    } else if (this.getHSpeed() == 0) {
                        x -= this.getSprite().getCenter();
                    } 
                    this.setX(x);
                    this.setY(y - this.getHeigth());
                    this.setHSpeed(0);
                    this.setVSpeed(0);
                    return;
                }
            }
        }

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
            this.setY(this.getY() - this.getSprite().heigth + this.getVSpeed());
            this.spawn(this.getX(), this.getY() - this.getSprite().heigth);
            // canvas.fg.getContext("2d").fillText(this.angle, this.getX(), this.getY());
        }
    }
}

class EntityCreature extends EntityMovable {
    constructor(options) {
        super(options);
        this.hp = options.hp;
        this.weapon = options.weapon;

        this.gravity = options.gravity;


        this.jump = options.jump;



    }

    respawn() {
        this.spawn(this.map.startX, this.map.startY);
    }


    getJump() {
        return this.jump;
    }


}


class Player extends EntityCreature {
    constructor(options) {
        super(options);

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
                this.weapon.fireWeapon(this, self.map);
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
            this.setY(this.getY() - this.getHeigth() + this.getVSpeed());
            this.weapon.lowerCD();
            this.spawn(this.getX(), this.getY() - this.getHeigth());
        }
    }

}