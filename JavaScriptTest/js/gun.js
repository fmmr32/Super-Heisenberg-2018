PISTOL = function () {
    var self = {};

    self.damage = 10;
    self.speed = 5;

    self.getDamage = function () {
        return self.damage;
    };

    self.getSpeed = function () {
        return self.speed;
    };

    return self;

};


BULLET = function () {
    var self = {};

    self.gun;
    self.angle;
    self.speed;


    return self;
};