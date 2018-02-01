var weapons = new Map();

function loadWeapon(list) {
    var temp = [];
    console.log(weapons);
    for (var id of list) {
        temp.push(weapons.get(id));
    }
    return temp;
}

function loadWeapons(file) {
    for (var w of JSON.parse(file)) {
        var img = new Image();
        img.src = "../resources/weapons.png";
        img.width = w.width;
        img.height = w.height;
        img.startX = w.startX;
        img.startY = w.startY;
        var frames = w.frames;
        var frameRate = w.frameRate;
        var columns = w.columns;

        var animation = new Animation(img, frames, frameRate, columns);

        switch (w.id) {
            case 1:
                weapons.set(w.id, new Pistol(w.damage, w.speed, w.cooldown, 0,animation));
                break;
            case 2:
                weapons.set(w.id, new Shotgun(w.damage, w.speed, w.cooldown,0, animation));
                break;
        }
        console.log(weapons);
    }
}

class Weapon {
    constructor(damage, speed, cooldown, animation) {
        this.damage = damage;
        this.speed = speed;
        this.cooldown = cooldown;
        this.tick = 0;
        this.bullets = [];
        this.animation = animation;
    }



    fireWeapon(character, map) {
        if (this.tick === 0) {
            this.animation.animating = true;
            for (var bullet of this.bullets) {
                var options = {};
                options.speed = bullet.speed;
                options.x = bullet.x;
                options.y = bullet.y;
                options.sprite = bullet.sprite;
                options.map = map;

                var temp = new Bullet(bullet.angle, bullet.alive, options);
                temp.setX(character.getX() + character.getSprite().getCenter() * 2);
                temp.setY(character.getY() - character.getHeight() / 2);
                this.tick = this.cooldown;
                map.entities.push(temp);
            }
        }
    }

    drawGun(X, Y, flipped) {
        this.animation.doAnimation(X, Y, flipped);
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
    constructor(damage, speed, cooldown, sprite, animation) {
        super(damage, speed, cooldown, animation);
        var options = {};
        options.x = 0;
        options.y = 0;
        options.speed = 5;
        options.sprite = getSprite(999);

        this.bullets.push(new Bullet(0, 120, options));
    }
}

class Shotgun extends Weapon {
    constructor(damage, speed, cooldown, sprite, animation) {
        super(damage, speed, cooldown, animation);
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
    constructor(angle, alive, options) {
        super(options);
        this.angle = angle;
        this.alive = alive;
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
            if (dx >= 0) {
                dx = Math.floor(dx);
            } else {
                dx = Math.ceil(dx);
            }
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
                var block = this.map.getBlock(x, this.getY());
                console.log(block);
                if (block.meta !== null) {
                    if (block.meta.ricochet) {
                        if (this.angle == 0) {
                            console.log("stopping bullet");
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

}