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
                var temp = new Bullet(bullet.angle, bullet.alive, options);
                temp.x = character.getX() + character.getCenter() + character.getOffSet() * 2;
                temp.y = character.getY() - character.getHeigth() / 2;
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

        this.bullets.push(new Bullet(0, 60, options));
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

        this.bullets.push(new Bullet(-15, 60, options));
        this.bullets.push(new Bullet(0,  60, options));
        this.bullets.push(new Bullet(15, 60, options));
    }


}




class Bullet extends Entity{
    constructor(angle, alive, options) {
        super(options);
        this.angle = angle;
        this.alive = alive;
    }


    bulletTravel() {
        if (this.alive > 0) {
            this.alive--;
            //delete drawing and redraw at new x
            var dy = Math.sin(this.angle / 180 * Math.PI) * this.speed;

            if (dy < 0) {
                dy = Math.floor(dy);
            } else {
                dy = Math.ceil(dy);
            }
            dy = -dy;

            var dx = this.speed - Math.abs(dy);
            this.x += dx;
            this.y += dy;

            this.spawn(this.x, this.y);
            return false;
        } else {
            //despawn
            return true;

        }
    }
}