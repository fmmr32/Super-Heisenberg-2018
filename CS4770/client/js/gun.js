function loadWeapon(name) {
    switch (name) {
        case "pistol":
            return new Pistol(10, 5, 15, 0);
        case "shotgun":
            return new Shotgun(10, 5, 30, 0);
    }
}

class Weapon {
    constructor(damage, speed, cooldown) {
        this.damage = damage;
        this.speed = speed;
        this.cooldown = cooldown;
        this.tick = 0;
        this.bullets = [];
    }



    fireWeapon(character, map) {
        if (this.tick === 0) {
            for (var bullet of this.bullets) {
                var options = {};
                options.speed = bullet.speed;
                options.x = bullet.x;
                options.y = bullet.y;
                options.sprite = bullet.sprite;
                options.map = map;

                var temp = new Bullet(bullet.angle, bullet.alive, options);
                temp.setX(character.getX() + character.getSprite().getCenter() + character.getSprite().getOffSet() * 2);
                temp.setY(character.getY() - character.getHeigth() / 2);
                this.tick = this.cooldown;
                map.entities.push(temp);
            }
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
    constructor(damage, speed, cooldown, sprite) {
        super(damage, speed, cooldown);
        var options = {};
        options.x = 0;
        options.y = 0;
        options.speed = 5;
        options.sprite = getSprite(999);

        this.bullets.push(new Bullet(0, 120, options));
    }
}

class Shotgun extends Weapon {
    constructor(damage, speed, cooldown, sprite) {
        super(damage, speed, cooldown);
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
            //delete drawing and redraw at new x

            var dy = Math.sin(this.angle / 180 * Math.PI) * this.speed;
            // console.log(dy);
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
            if (collision.code !== 0) {
                if (collision.code === 3) {
                    this.getY() - this.getHeigth();
                }

                var block = this.map.getBlock(x, this.getY());
                if (block.meta !== null) {
                    if (block.meta.ricochet) {
                        if (this.angle == 0) {
                            return true;
                        }
                        console.log(collision.code);
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
                    }
                }
            }


            this.doMove(onTick);


            return false;
        } else {
            //despawn
            return true;

        }
    }
}