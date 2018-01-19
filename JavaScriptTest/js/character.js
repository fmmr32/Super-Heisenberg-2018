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
    doCollision(setspeed) {
        var x = this.getX() + this.getSprite().getCenter();
        if (this.getHSpeed() >= 0) {
            x += this.getSprite().getCenter();
        } else {
            x -= this.getSprite().getCenter();
        }
        var y = this.getY() - 1;

        //checking for when going right
        for (var dX = 0; dX <= this.getHSpeed(); dX++) {
            //checking for hitting the ground
            if (this.map.getBlock(x + dX, y).Id !== 0) {
                if (setspeed) {
                    this.setHSpeed(dX);
                }

                var temp = {};
                temp.modDX = dX;
                var block = this.map.getBlock(x, y);
                //hits flood
                ; if (this.map.getBlock(x + dX, this.getSprite(block.Id).heigth + y).Id === 0) {
                    temp.code = 1;
                    return temp;
                    //hits wall
                } else {
                    temp.code = 2;
                    return temp;
                }
            }
            //checking for hitting the ceiling
            if (this.map.getBlock(x + dX, y).Id !== 0) {
                if (setspeed) {
                    this.setHSpeed(dX);
                }

                var temp = {};
                temp.modDX = dX;
                var block = this.map.getBlock(x, y);
                //hits flood
                ; if (this.map.getBlock(x + dX, this.getSprite(block.Id).heigth + y).Id === 0) {
                    temp.code = 3;
                    return temp;
                    //hits wall
                } else {
                    temp.code = 2;
                    return temp;
                }
            }
        }

        //checking for when going left
        for (var dX = 0; dX >= this.getHSpeed(); dX--) {
            //check for hitting the floor
            if (this.map.getBlock(x + dX, y).Id !== 0) {
                if (setspeed) {
                    this.setHSpeed(dX);
                }

                var temp = {};
                temp.modDX = dX;

                var block = this.map.getBlock(x, y);
                //hits flood
                ; if (this.map.getBlock(x + dX, this.getSprite(block.Id).heigth + y).Id === 0) {
                    temp.code = 1;
                    return temp;
                    //hits wall
                } else {
                    temp.code = 2;
                    return temp;
                }
            }
            //check for hitting the ceiling
            if (this.map.getBlock(x + dX, y).Id !== 0) {
                if (setspeed) {
                    this.setHSpeed(dX);
                }

                var temp = {};
                temp.modDX = dX;

                var block = this.map.getBlock(x, y);
                //hits flood
                ; if (this.map.getBlock(x + dX, this.getSprite(block.Id).heigth + y).Id === 0) {
                    temp.code = 3;
                    return temp;
                    //hits wall
                } else {
                    temp.code = 2;
                    return temp;
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
            this.doCollision(true);
            this.lastOffSet = -this.getSprite().getOffSet();
        } else if (this.leftDown) {
            this.setHSpeed(-this.getSpeed());
            this.doCollision(true);
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


            if (this.map.getBlock(x, this.getY()).Id !== 0 && this.jmpcd === 0) {
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