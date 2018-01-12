CHARACTER = function (options) {
    

    var self = {};
    self.gravity = options.gravity;
    self.vs = 0;
    self.hs = 0;
    self.hp = options.hp;

    self.center = options.center;
    self.offSet = options.offset;

    self.posX;
    self.posY;

    self.sprite = options.sprite;

    self.weapon = options.weapon;
    self.heigth = options.heigth;
    self.jump = options.jump;
    self.speed = options.speed;
    self.leftDown = false;
    self.rightDown = false;
    self.jumpDown = false;

    self.lastOffSet = 0;

    self.getLastOffSet = function () {
        return self.lastOffSet;
    }

    self.getCenter = function () {
        return self.center;
    };

    self.getOffSet = function () {
        return self.offSet;
    }

    self.setVSpeed = function (s) {
        self.vs = s;
    };

    self.setX = function (x) {
        self.posX = x;
    };

    self.getX = function () {
        return self.posX;
    };

    self.setY = function (y) {
        self.posY = y;
    };
    self.getY = function () {
        return self.posY + self.getHeigth();
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

    self.spawn = function (X, Y) {
        self.posX = X;
        self.posY = Y;

        self.sprite.draw(X, Y);
    };

    self.getHeigth = function () {
        return self.heigth;
    };

    self.getJump = function () {
        return self.jump;
    };
    self.getSpeed = function () {
        return self.speed;
    };


    self.doMove = function (type, isDown, onTick) {
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
        }
        if (this.rightDown) {
            this.setHSpeed(this.getSpeed());
            this.lastOffSet = -this.getOffSet();
        } else if (this.leftDown) {
            this.setHSpeed(-this.getSpeed());
            this.lastOffSet = this.getOffSet();
        } else {
            this.setHSpeed(0);
        }

        if (this.jumpDown) {
            if (getBlock(this.getX(), this.getY()+1).Id !== 0) {
                this.setVSpeed(-(this.jump * this.gravity));
            }
        }

        if (onTick) {
            this.setX(this.getX() + this.getHSpeed());
            this.setY(this.getY() - this.getHeigth() + this.getVSpeed());

            this.spawn(this.getX(), this.getY() - this.getHeigth());
        }
    };
    return self;
};