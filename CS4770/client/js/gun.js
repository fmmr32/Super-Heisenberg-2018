var weapons = new Map();

function loadWeapon(list, weaponMod) {
    var temp = [];
    for (var id of list) {
        var newob = deepCopy(weapons.get(id));
        if (weaponMod != undefined) {
            for (var mods of weaponMod) {
                if (mods.id == id) {
                    newob.impact = mods.impact;
                    newob.damage = Math.floor(newob.damage*mods.damageMult);
                    newob.cooldown = Math.floor(newob.cooldown/mods.speedMult);
                }
            }
        }

        temp.push(newob);
    }
    return temp;
}

function deepCopy(c) {
    if (c instanceof Weapon) {
        var animations = [deepCopy(c.animations[0]), deepCopy(c.animations[1])];
        return new Weapon({ damage: c.damage, speed: c.speed, cooldown: c.cooldown, animations:animations, barrel: c.barrel, bullets: c.bullets, sound:c.sound, hidden:c.hidden, isFlame: c.isFlame, name:c.name});
    } else if (c instanceof Animation) {
        return new Animation(c.image, c.frames, c.frameRate, c.columns, c.forcedAnimate);
    } else {
        return null;
    }
}



function loadWeapons(file) {
    for (var w of JSON.parse(file)) {
        var imgNormal = new Image();
        imgNormal.src = "../resources/spriteSheets/weapons.png";
        imgNormal.width = w.width;
        imgNormal.height = w.height;
        imgNormal.startX = w.animation[0].startX;
        imgNormal.startY = w.animation[0].startY;
        imgNormal.offSetX = w.animation[0].offSetX;
        imgNormal.offSetY = w.animation[0].offSetY;

        var imgFlipped = new Image();
        imgFlipped.src = "../resources/spriteSheets/weapons.png";
        imgFlipped.width = w.width;
        imgFlipped.height = w.height;
        imgFlipped.startX = w.animation[1].startX;
        imgFlipped.startY = w.animation[1].startY;
        imgFlipped.offSetX = w.animation[1].offSetX;
        imgFlipped.offSetY = w.animation[1].offSetY;

        var frames = w.frames;
        var frameRate = w.frameRate;
        var columns = w.columns;
        var barrel = {};
        barrel.Normal = {};
        barrel.Flipped = {};
        barrel.Normal.x = w.animation[0].barrelX;
        barrel.Normal.y = w.animation[0].barrelY;
        barrel.Flipped.x = w.animation[1].barrelX;
        barrel.Flipped.y = w.animation[1].barrelY;

        var animations = [new Animation(imgNormal, frames, frameRate, columns, false), new Animation(imgFlipped, frames, frameRate, columns, false)];

        var bullets = [];
        var options = {};
        options.x = 0;
        options.y = 0;
        options.speed = w.speed;
        options.sprite = [getSprite(w.bulletSprite), getSprite(w.bulletSpriteFlip)];
        options.gravity = w.gravity;
        options.impact = w.impact;
        options.factor = w.factor;
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
        var options = {};
        options.name = w.name;
        options.damage = w.damage;
        options.speed = w.speed;
        options.cooldown = w.cooldown;
        options.animations = animations;
        options.barrel = barrel;
        options.bullets = bullets;
        options.impact = w.impact;
        options.price = w.price;
        options.sound = new SoundManager(w.sound, "game");
        options.impactUpgrades = w.impactUpgrades;
        options.hidden = w.hidden;
        weapons.set(w.id, new Weapon(options));
    }
}

class Weapon {
    constructor(options) {
        this.tick = 0;
        for (var obj of Object.keys(options)) {
            this[obj] = options[obj];
        }
    }

    canFire() {
        return this.tick === 0;
    }

    fireWeapon(character, level) {
        //can only shoot the weapon again if the cooldown of the weapon is 0 and it's done animating
        if (this.canFire()) {
            this.sound.play();
            if (character.getLastOffSet() < 0) {
                this.animations[0].animating = true;
            } else {
                this.animations[1].animating = true;
            }

            for (var bullet of this.bullets) {
                var options = {};
                options.speed = bullet.speed;
                options.x = bullet.x;
                options.y = bullet.y;
                options.sprite = bullet.sprite;
                options.level = level;
                options.damage = this.damage;
                options.gravity = bullet.gravity;
                options.impact = bullet.impact;
                options.factor = bullet.factor;
                options.flame = this.name.indexOf("flame") != -1;
                var angle = bullet.angle;
                var offsetHand = character.rightHand[character.slideDown ? 1 : 0];
                var offsetGun = this.barrel.Normal;

                //sets the correct angle according to the way the entity is facing
                if (character.getLastOffSet() > 0) {
                    angle = Math.abs(180 - angle);
                    offsetHand = character.leftHand[character.slideDown ? 1 : 0];
                    offsetGun = this.barrel.Flipped;
                }

                var temp;

                if (bullet instanceof Grenade) {
                    temp = new Grenade(angle, bullet.alive, options, bullet.id, character);
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
    //clean this up
    drawGun(X, Y, flipped) {
        this.animations[flipped].doAnimation(X, Y);
    }

    lowerCD() {
        if (this.tick > 0) {
            this.tick--;
        }
    }

    setAngle(angle) {
        for (var bullet of this.bullets) {
            bullet.angle = angle;
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

        this.factor = options.factor;
        this.impact = options.impact;
        this.float = false;
        this.sprite = options.sprite;
        this.gravity = options.gravity;

    }

    bulletTravel(onTick) {
        if (this.alive > 0) {
            this.alive--;

            //calculating the angle the bullet flies at and what the x,y changes to
            var dx = Math.sin((this.angle+90) * 2 * Math.PI / 360) * this.speed;
            var dy = Math.cos((this.angle + 90) * 2 * Math.PI / 360) * this.speed;
            dx = dx > 0 ? Math.floor(dx) : Math.ceil(dx);
            dy = dy > 0 ? Math.floor(dy) : Math.ceil(dy);

            this.setHSpeed(dx);

            this.setVSpeed(dy);

            var x = this.getX();
          
            if (this.gravity) {
                this.doGravity();
            }

            var collision = this.doCollision();
            x += collision.modDX;
            //handles what do do when the bullet hits a block
            if (collision.code !== 0) {
                if (this.impact == "die") {
                    return true;
                }
                var block = this.level.getBlock(x, this.getY());
                if (block.meta !== null) {
                    if (this.impact == "ricochet" && block.hasMeta("ricochet")) {
                        if (this.angle == 0 || this.angle == -180) {
                            return true;
                        }
                        switch (collision.code) {
                            case 1:

                                this.setVSpeed(-this.getVSpeed());
                                this.angle -= 180;

                                break;
                            case 2:
                                this.angle  -= 180;
                                break;
                            case 3:
                                this.angle -= 180;
                                break;
                        }
                    } if (this.impact == "explode") {
                        if (!(this instanceof Grenade)) {
                            var gren = new Grenade(0, 0, this, 994, this.getOwner());
                            gren.setX(this.getX());
                            gren.setY(this.getY() - this.getHeight());
                            gren.doExplosion();
                        }
                        return true;
                    } 
                } else {
                    return true;
                }
            }
            //finally do the move tick
            this.doMove(onTick, +(this.getHSpeed() < 0));
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
    constructor(angle, alive, options, id, owner) {
        super(angle, alive, options, owner);
        this.id = id;
        this.isFlame = options.flame;
        var img = new Image();
        img.src = getSprite(id).image.src;
        img.width = getSprite(id).width;
        img.height = getSprite(id).height;
        img.startX = getSprite(id).image.startX;
        img.startY = getSprite(id).image.startY;

        img.offSetX = 0;
        img.offSetY = 0;

        var frames = getSprite(id).animation[0].frames;
        var frameRate = getSprite(id).animation[0].frameRate;
        var columns = getSprite(id).animation[0].columns;

        this.exploding = false;
        this.damaged = [];
        this.animation = new Array(1).fill(new Animation(img, frames, frameRate, columns, false));
        this.animation[0].factor = this.factor;
    }

    bulletTravel(onTick) {
        if (super.bulletTravel(onTick)) {
            this.doExplosion();
            return true;
        }
        return false;
    }

    doExplosion() {
        var options = {};
        options.x = this.getX();
        options.y = this.getY() - this.getHeight();
        options.sprite = new Array(1).fill(this.getSprite());

        if (!this.isFlame) {
            getSprite(this.id).sound.play();
        }

        options.level = this.level;
        this.animation[0].animating = true;
        this.animation[0].despawn = true;
        options.animation = this.animation;
        this.level.entities.push(new Entity(options));

        var xOff = -(this.factor - 1) * this.animation[0].width / 2;
        var yOff = -(this.factor - 1) * this.animation[0].height / 2;

        var xMin = Math.min(this.getX() + this.animation[0].width * this.animation[0].factor, this.getX() + xOff);
        var xMax = Math.max(this.getX() + this.animation[0].width * this.animation[0].factor, this.getX() + xOff);

        var yMin = Math.min(this.getY() - this.getHeight() + this.animation[0].width * this.animation[0].factor, this.getY() - this.getHeight() + yOff);
        var yMax = Math.max(this.getY() - this.getHeight() + this.animation[0].width * this.animation[0].factor, this.getY() - this.getHeight() + yOff);


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

