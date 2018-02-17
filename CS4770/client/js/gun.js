var weapons = new Map();

function loadWeapon(list) {
    var temp = [];
    for (var id of list) {
        var newob = deepCopy(weapons.get(id));
        temp.push(newob);
    }
    return temp;
}

function deepCopy(c) {
    if (c instanceof Weapon) {
        var animation = {};
        animation.normal = deepCopy(c.animation.normal);
        animation.flipped = deepCopy(c.animation.flipped);
        return new Weapon(c.damage, c.speed, c.cooldown, animation, c.barrel, c.bullets);
    } else if (c instanceof Animation) {
        return new Animation(c.image, c.frames, c.frameRate, c.columns, c.forcedAnimate);
    } else {
        loadNeeded();
        loadGame();
        return null;
    }
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

        var bullets = [];
        var options = {};
        options.x = 0;
        options.y = 0;
        options.speed = w.speed;
        options.sprite = getSprite(w.bulletSprite);
        options.spriteFlip = getSprite(w.bulletSpriteFlip);
        options.gravity = w.gravity;
        if (w.bullets != undefined) {
            for (var bullet of w.bullets) {
                bullets.push(new Bullet(bullet.angle, bullet.alive, options));
            }
        }
        if (w.grenades != undefined) {
            for (var grenade of w.grenades) {
                bullets.push(new Grenade(grenade.angle, grenade.alive, options, grenade.id, w.factor));
            }
        }

        weapons.set(w.id, new Weapon(w.damage, w.speed, w.cooldown, animations, barrel, bullets));
    }
}

class Weapon {
    constructor(damage, speed, cooldown, animation, barrel, bullets) {
        this.damage = damage;
        this.speed = speed;
        this.cooldown = cooldown;
        this.tick = 0;
        this.bullets = bullets;
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
                options.spriteFlip = bullet.spriteFlip;
                options.level = level;
                options.damage = this.damage;
                options.gravity = bullet.gravity;
                var angle = bullet.angle;
                var offsetHand = character.rightHand;
                var offsetGun = this.barrel.Normal;

                //sets the correct angle according to the way the entity is facing
                if (character.getLastOffSet() > 0) {
                    angle = -angle - 180;
                    offsetHand = character.leftHand;
                    offsetGun = this.barrel.Flipped;
                }

                var temp;

                if (bullet instanceof Grenade) {
                    temp = new Grenade(angle, bullet.alive, options, bullet.id, bullet.factor, character);
                } else {
                    temp = new Bullet(angle, bullet.alive, options, character);
                }



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


    getDamage() {
        return this.damage;
    }

    getSpeed() {
        return this.speed;
    }
}




class Bullet extends EntityMovable {
    constructor(angle, alive, options, owner) {
        super(options);
        this.angle = angle;
        this.alive = alive;
        this.owner = owner;
        this.damage = options.damage;

        this.sprite = options.sprite;
        this.spriteFlip = options.spriteFlip;
        this.gravity = options.gravity;
    }


    bulletTravel(onTick) {
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
            if (this.gravity) {
                this.doGravity();
            }

            var collision = this.doCollision();
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
            this.doMove(onTick, this.getHSpeed() < 0);

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

class Grenade extends Bullet {
    constructor(angle, alive, options, id, factor, owner) {
        super(angle, alive, options, owner);
        this.factor = factor;
        this.id = id;

        var img = new Image();
        img.src = getSprite(id).image.src;
        img.width = getSprite(id).width;
        img.height = getSprite(id).height;
        img.startX = getSprite(id).image.startX;
        img.startY = getSprite(id).image.startY;

        img.offSetX = 0;
        img.offSetY = 0;

        var frames = getSprite(id).animation.frames;
        var frameRate = getSprite(id).animation.frameRate;
        var columns = getSprite(id).animation.columns;

        this.exploding = false;
        this.damaged = [];

        this.animation = new Animation(img, frames, frameRate, columns, false);
        this.animation.factor = this.factor;
    }

    bulletTravel(onTick) {
        if (super.bulletTravel(onTick)) {
            this.doExplosion();
            return true;
        }
        return false;
    }

    getOwner() {
        return this.owner;
    }

    doExplosion() {
        var options = {};
        options.x = this.getX();
        options.y = this.getY() - this.getHeight();
        options.sprite = this.getSprite();
        options.level = this.level;
        this.animation.animating = true;
        this.animation.despawn = true;
        options.animation = this.animation;

        this.level.entities.push(new Entity(options));

        var xOff = -(this.factor - 1) * this.animation.width / 2;
        var yOff = -(this.factor - 1) * this.animation.height / 2;

        var xMin = Math.min(this.getX() + this.animation.width * this.animation.factor, this.getX() + xOff);
        var xMax = Math.max(this.getX() + this.animation.width * this.animation.factor, this.getX() + xOff);

        var yMin = Math.min(this.getY() - this.getHeight() + this.animation.width * this.animation.factor, this.getY() - this.getHeight() + yOff);
        var yMax = Math.max(this.getY() - this.getHeight() + this.animation.width * this.animation.factor, this.getY() - this.getHeight() + yOff);

        for (var x = xMin; x < xMax; x++) {
            for (var y = yMin; y < yMax; y++) {
                var ent = this.level.getEntity(x, y);
                if (ent != null && ent instanceof EntityCreature && ent != this.getOwner() && this.damaged.indexOf(ent) == -1) {
                    ent.doDamage(this.getDamage());
                    this.damaged.push(ent);
                }
            }
        }

    }
}