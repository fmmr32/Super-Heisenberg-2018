class Entity {
    constructor(options) {

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
        this.map = options.map;
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
        var x = this.getX() + this.getSprite().getCenter();
        if (this.getLastOffSet() > 0) {
            x += this.getSprite().getCenter();
        } else {
            x -= this.getSprite().getCenter();
        }
        var y = this.getY() - this.getSprite().heigth;
        //checking for when going right
        for (var dX = 0; dX < this.getHSpeed(); dX++) {
            //checking for hitting the ground
            for (var dY = 0; dY < this.getVSpeed(); dY++) {
                if (this.map.getBlock(x + dX, y + dY).Id !== 0) {
                    //hits flood
                    if (dY == 0) {
                        return 1;
                    //hits wall
                    } else {
                        return 2;
                    }
                }
            }
            //checking for hitting the ceiling
            for (var dY = 0; dY > this.getVSpeed(); dY--) {
                if (this.map.getBlock(x + dX, y + dY).Id !== 0) {
                    //hits ceiling
                    if (dY == 0) {
                        return 3;
                    //hits wall
                    } else {
                        return 2;
                    }
                }
            }
        }

        //checking for when going left
        for (var dX = 0; dX > this.getHSpeed(); dX--) {
            //check for hitting the floor
            for (var dY = 0; dY < this.getVSpeed(); dY++) {
                if (this.map.getBlock(x + dX, y + dY).Id !== 0) {
                    //hits floor
                    if (dY == 0) {
                        return 1;
                    //hits wall
                    } else {
                        return 2;
                    }
                }
            }
            //check for hitting the ceiling
            for (var dY = 0; dY > this.getVSpeed(); dY--) {
                if (this.map.getBlock(x + dX, y + dY).Id !== 0) {
                    //hits ceiling
                    if (dY == 0) {
                        return 3;
                    //hits wall
                    } else {
                        return 2;
                    }
                }
            }
        }
        return 0;
       
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



        this.jmpcd = 0;
    }



    getJump() {
        return this.jump;
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

        this.leftDown = false;
        this.rightDown = false;
        this.jumpDown = false;
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
            this.lastOffSet = -this.getSprite().getOffSet();
        } else if (this.leftDown) {
            this.setHSpeed(-this.getSpeed());
            this.doCollision();
            this.lastOffSet = this.getSprite().getOffSet();
        } else {
            this.setHSpeed(0);
        }

        if (this.jumpDown) {

            var x = this.getX() + this.getSprite().getCenter();

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