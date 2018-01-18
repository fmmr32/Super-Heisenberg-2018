class Entity {
    constructor(options) {

        this.posX = options.x;
        this.posY = options.y;
        this.speed = options.speed;
        this.sprite = options.sprite;

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

    getSpeed() {
        return this.speed;
    }

    

}

class EntityCreature extends Entity {
    constructor(options) {
        super(options);
        this.hp = options.hp;
        this.weapon = options.weapon;

        this.gravity = options.gravity;


        this.jump = options.jump;
        this.heigth = options.heigth;
        this.center = options.center;
        this.offSet = options.offSet;



        this.vs = 0;
        this.hs = 0;
        this.jmpcd = 0;


        this.leftDown = false;
        this.rightDown = false;
        this.jumpDown = false;

        this.lastOffSet = 0;
        this.map = options.map;

    }



    getLastOffSet() {
        return this.lastOffSet;
    }

    getCenter() {
        return this.center;
    }

    getOffSet() {
        return this.offSet;
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



    getHeigth() {
        return this.heigth;
    }

    getJump() {
        return this.jump;
    }


    doCollision() {
        var x = this.getX() + this.getCenter();
        if (this.getLastOffSet() > 0) {
            x -= this.getCenter();
        } else {
            x += this.getCenter();
        }
        var y = this.getY() - 10;

        //checking for when going right
        for (var dX = 0; dX < this.getHSpeed(); dX++) {
            if (this.map.getBlock(x + dX, y).Id !== 0) {
                this.setHSpeed(dX);
                return;
            }
        }

        //checking for when going left
        for (var dX = 0; dX > this.getHSpeed(); dX--) {
            if (this.map.getBlock(x + dX, y).Id !== 0) {
                this.setHSpeed(dX);
                return;
            }
        }

    }

    lowerCD() {
        if (this.jmpcd > 0) {
            this.jmpcd -= 1;
        }
    }
}


class Player extends EntityCreature {
    constructor(options) {
        super(options);
    }



    doMove(type, isDown, onTick) {
        switch (type) {
            case "right":
                this.rightDown = isDown;
                break;
            case "left":
                this.leftDown = isDown;
                break;
            case "up":
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
            this.lastOffSet = -this.getOffSet();
        } else if (this.leftDown) {
            this.setHSpeed(-this.getSpeed());
            this.doCollision();
            this.lastOffSet = this.getOffSet();
        } else {
            this.setHSpeed(0);
        }

        if (this.jumpDown) {

            var x = this.getX() + this.getCenter();

            if (this.map.getBlock(x + this.getLastOffSet(), this.getY()).Id !== 0) {
                x += this.getLastOffSet();
            } else {
                x -= this.getLastOffSet();
            }

            if (this.map.getBlock(x, this.getY() + 1).Id !== 0 && this.jmpcd === 0) {
                if (onTick) {
                    self.jmpcd = 10;
                }
                this.setVSpeed(-(this.jump * this.gravity));
            }
        }


        if (onTick) {

            this.setX(this.getX() + this.getHSpeed());
            this.setY(this.getY() - this.getHeigth() + this.getVSpeed());
            this.weapon.lowerCD();
            this.spawn(this.getX(), this.getY() - this.getHeigth());
        }
    }

}