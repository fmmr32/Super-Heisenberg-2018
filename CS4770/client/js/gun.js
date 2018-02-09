var weapons = new Map();

function loadWeapon(list) {
    var temp = [];
    for (var id of list) {
        temp.push(weapons.get(id));
    }
    return temp;
}

function loadWeapons(file) {
    for (var w of JSON.parse(file)) {

        var imgNormal = new Image();
        imgNormal.src = "../resources/weapons.png";
        imgNormal.width = w.width;
        imgNormal.height = w.height;
        imgNormal.startX = w.sheets[0].startX;
        imgNormal.startY = w.sheets[0].startY;
        imgNormal.offSetX = w.sheets[0].offSetX;
        imgNormal.offSetY = w.sheets[0].offSetY;

        var imgFlipped = new Image();
        imgFlipped.src = "../resources/weapons.png";
        imgFlipped.width = w.width;
        imgFlipped.height = w.height;
        imgFlipped.startX = w.sheets[1].startX;
        imgFlipped.startY = w.sheets[1].startY;
        imgFlipped.offSetX = w.sheets[1].offSetX;
        imgFlipped.offSetY = w.sheets[1].offSetY;

        var frames = w.frames;
        var frameRate = w.frameRate;
        var columns = w.columns;
        var barrel = {};
        barrel.Normal = {};
        barrel.Flipped = {};
        barrel.Normal.x = w.sheets[0].barrelX;
        barrel.Normal.y = w.sheets[0].barrelY;
        barrel.Flipped.x = w.sheets[1].barrelX;
        barrel.Flipped.y = w.sheets[1].barrelY;

        var animations = {};

        animations.normal = new Animation(imgNormal, frames, frameRate, columns, false);
        animations.flipped = new Animation(imgFlipped, frames, frameRate, columns, false);

        switch (w.id) {
            case 1:
                weapons.set(w.id, new Pistol(w.damage, w.speed, w.cooldown, 0,animations, barrel));
                break;
            case 2:
                weapons.set(w.id, new Shotgun(w.damage, w.speed, w.cooldown, 0, animations, barrel));
                break;
        }
    }
}

class Weapon {
    constructor(damage, speed, cooldown, animation, barrel) {
        this.damage = damage;
        this.speed = speed;
        this.cooldown = cooldown;
        this.tick = 0;
        this.bullets = [];
        this.animation = animation;
        this.barrel = barrel;


    }



    fireWeapon(character, level) {
        //can only shoot the weapon again if the cooldown of the weapon is 0 and it's done animating
        if (this.tick === 0 && !this.animation.normal.animating && !this.animation.flipped.animating) {
            if (character.getLastOffSet() < 0) {
                this.animation.normal.animating = true;
            } else {
                this.animation.flipped.animating = true;
            }

            for (var bullet of this.bullets) {
                var options = {};
                options.speed = bullet.speed;

                options.x = bullet.x;
                options.y = bullet.y;
                options.sprite = bullet.sprite;
                options.level = level;
                options.damage = this.damage;

                var angle = bullet.angle;
                var offsetHand = character.rightHand;
                var offsetGun = this.barrel.Normal;

                //sets the correct angle according to the way the entity is facing
                if (character.getLastOffSet() > 0) {
                    angle = -angle - 180;
                    offsetHand = character.leftHand;
                    offsetGun = this.barrel.Flipped;
                    options.sprite = getSprite(998);
                }

                var temp = new Bullet(angle, bullet.alive, options, character);
               

                temp.setX(character.getX() + offsetHand[0] + offsetGun.x);
                temp.setY(character.getY() - character.getHeight() + offsetHand[1] + offsetGun.y);
                this.tick = this.cooldown;
                level.entities.push(temp);
            }
        }
    }

    drawGun(X, Y, flipped) {
        if (flipped) {
            this.animation.flipped.doAnimation(X, Y);
        } else {
            this.animation.normal.doAnimation(X, Y);
        }

        
    }

    lowerCD() {
        if (this.tick > 0) {
            this.tick--;
        }
    }


    get Damage() {
        return this.damage;
    }

    get Speed() {
        return this.speed;
    }
}


class Pistol extends Weapon {
    constructor(damage, speed, cooldown, sprite, animation, barrel) {
        super(damage, speed, cooldown, animation, barrel);
        var options = {};
        options.x = 0;
        options.y = 0;
        options.speed = 5;
        options.sprite = getSprite(999);
        this.bullets.push(new Bullet(0, 120, options));
    }
}

class Shotgun extends Weapon {
    constructor(damage, speed, cooldown, sprite, animation, barrel) {
        super(damage, speed, cooldown, animation, barrel);
        var options = {};
        options.x = 0;
        options.y = 0;
        options.speed = 5;
        options.sprite = getSprite(999);

        this.bullets.push(new Bullet(15, 60, options));
        this.bullets.push(new Bullet(0, 60, options));
        this.bullets.push(new Bullet(195, 70, options));




    }


}




class Bullet extends EntityMovable {
    constructor(angle, alive, options, owner) {
        super(options);
        this.angle = angle;
        this.alive = alive;
        this.owner = owner;
        this.damage = options.damage;
    }


    bulletTravel(onTick) {
        if (this.sprite == undefined) {
            this.sprite = getSprite(999);
        }

        if (this.alive > 0) {
            this.alive--;

            //calculating the angle the bullet flies at and what the x,y changes to
            var dy = Math.sin(this.angle / 180 * Math.PI) * this.speed;
            dy = -dy;
            var dx;
            if (this.angle >= 0) {
                dx = this.speed - Math.abs(dy);
            } else {
                dx = -this.speed + Math.abs(dy);
            }
            dx = Math.floor(dx);

            if (dy >= 0) {
                dy = Math.floor(dy);
            } else {
                dy = Math.ceil(dy);
            }
            this.setHSpeed(dx);

            this.setVSpeed(dy);

            var x = this.getX();
            if (this.angle >= 0) {
                this.lastOffSet = this.getSprite().offSet;
                x += this.getSprite().getCenter();
            } else {
                this.lastOffSet = -this.getSprite().offSet;
                x -= this.getSprite().getCenter();
            }

            var collision = this.doCollision(false);

            x += collision.modDX;
            //handles what do do when the bullet hits a block
            if (collision.code !== 0) {
                var block = this.level.getBlock(x, this.getY());
                if (block.meta !== null) {
                    if (block.meta.ricochet) {
                        if (this.angle == 0 || this.angle == -180) {
                            return true;
                        }
                        switch (collision.code) {
                            case 1:

                                this.setVSpeed(-this.getVSpeed());
                                this.angle -= 180;

                                break;
                            case 2:
                                this.angle = -this.angle - 180;
                                break;
                            case 3:
                                this.angle += 180;
                                break;
                        }
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            }

            //finally do the move tick
            this.doMove(onTick);


            return false;
        } else {
            //despawn
            return true;

        }
    }

    getOwner() {
        return this.owner;
    }

}