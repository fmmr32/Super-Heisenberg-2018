CHARACTER = function (weapon) {
    

    var self = {};

    self.vs = 0;
    self.hs = 0;
    self.hp = 100;

    self.posX;
    self.posY;

    self.sprite;

    self.guns = [];
    self.guns.push(weapon);

    self.setVSpeed = function (s) {
        self.vs = s;
    };

    self.setX = function (x) {
        self.posX = x;
    };

    self.setY = function (y) {
        self.posY = y;
    };

    self.addWeapon = function (w) {
        self.guns.push(w);
    };


    self.getVSpeed = function () {
        return self.vs;
    };

    self.setHSpeed = function (s) {
        self.hs = s;

    };

    self.getHSpeed = function () {
        return self.hs;
    };

    return self;
};