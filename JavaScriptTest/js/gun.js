function loadWeapon(name) {
    switch (name) {
        case "pistol":
            return new PISTOL();
    }
}

PISTOL = function () {
    var self = {};

    self.damage = 10;
    self.speed = 5;

    self.cooldown = 10;

    self.getDamage = function () {
        return self.damage;
    };

    self.getSpeed = function () {
        return self.speed;
    };

    self.bullets = [];
    self.bullets.push(new BULLET(270, 5, 60, 0,0,999));


    self.fireWeapon = function (character) {
        if (self.cooldown == 0) {
            for (var bullet of self.bullets) {
                var temp = new BULLET(bullet.angle, bullet.speed, bullet.alive, 0,0, bullet.sprite);
                temp.x = character.getX() + character.getCenter() + (character.getOffSet() * 2);
                temp.y = character.getY() - (character.getHeigth() / 2);
                self.cooldown = 10;
                entities.push(temp);
            }
        }
    }

    self.lowerCD = function () {
        if (self.cooldown > 0) {
            self.cooldown--;
        }
    }

    return self;
};




BULLET = function (angle, speed, alive, x, y, sprite) {
    var self = {};
    self.alive = alive;

    self.angle = angle;
    self.speed = speed;
    self.alive = alive;

    self.x = x;
    self.y = y;

    
    self.sprite = sprite;


    self.bulletTravel = function () {
        if (self.alive > 0) {
            self.alive--;
            //delete drawing and redraw at new x

            var dy = Math.sin(self.angle) * self.speed;
            var dx = self.speed - Math.ceil(dy);
            

            self.x += dx;
            self.y += dy;

            getSprite(self.sprite).draw(self.x, self.y);
            return false;
        } else {
            //despawn
            return true;

        }
    };


    return self;
};