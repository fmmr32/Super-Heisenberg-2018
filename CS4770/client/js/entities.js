
class Animation {
    constructor(image, frames, frameRate, columns, forcedAnimate) {
        this.image = image;

        this.frames = frames;
        this.frameRate = frameRate;
        this.columns = columns;

        this.width = image.width;
        this.height = image.height;
        this.startX = image.startX;
        this.startY = image.startY;
        this.offSetX = image.offSetX;
        this.offSetY = image.offSetY;

        this.column = 0;
        this.frame = 1;
        this.row = 0;

        this.forcedAnimate = forcedAnimate;
        this.animating = forcedAnimate;

        this.factor = 1;
        this.despawn = false;
        this.then = 0;
    }

    doAnimation(X, Y) {

        var now = Date.now();
        var delta = now - this.then;
        //this loops the animation frame on the animation framerate
        if (this.animating && delta > 1000 / this.frameRate) {
            this.frame++;
            this.column++;
            if (this.column == this.columns) {
                this.column = 0;
                this.row++;
            }
            if (this.frame > this.frames) {
                this.frame = 1;
                this.column = 0;
                this.row = 0;
                this.animating = this.forcedAnimate;
                if (this.despawn) {
                    return true;
                }
            }

            this.then = now - (delta % this.frameRate);

        }


        var ctx = canvas.getContext("2d");
        var img = this.image;
        ctx.drawImage(img, this.column * this.width + this.startX, this.row * this.height + this.startY, this.width, this.height, X + this.offSetX - (this.factor - 1) * this.width / 2, Y + this.offSetY - (this.factor - 1) * this.height / 2, this.width * this.factor, this.height * this.factor);


    }

}



class HealthBar {
    constructor(maxHp, canvas, name, alignment, x, y) {
        HealthBar.bars = HealthBar.bars || [];

        this.maxHp = maxHp;
        this.name = name;
        this.context = canvas;

        this.alignment = alignment;
        this.x = x;
        this.y = y;

        if (this.alignment == "h") {
            this.width = 100;
            this.height = 16;
        } else {
            this.width = 16;
            this.height = 100;
        }
        for (var bars of HealthBar.bars) {

            if (this.x <= bars.x && bars.x <= this.x + this.width && this.y <= bars.y && bars.y <= this.y + this.height) {
                if (this.alignment == "h") {
                    this.y += this.height * 2;
                } else {
                    this.x += this.width * 2;
                }
            }
        }


        HealthBar.bars.push(this);
    }


    drawHp(hp) {
        //box
        this.context.beginPath();
        this.context.lineWidth = "3";
        this.context.strokeStyle = "black";

        if (this.alignment == "v") {
            this.context.rect(this.x, this.y, this.width, this.height);
        } else {
            this.context.rect(this.x, this.y, this.width, this.height);
        }

        this.context.stroke();

        //red bar
        this.context.beginPath();
        this.context.lineWidth = Math.min(this.width, this.height) - 2;
        this.context.strokeStyle = "red";

        if (this.alignment == "v") {
            this.context.moveTo(this.x + this.width / 2, this.y + 1);
            this.context.lineTo(this.x + this.width / 2, this.y + this.height);
        } else {
            this.context.moveTo(this.x + 1, this.y + this.height / 2);
            this.context.lineTo(this.x + this.width, this.y + this.height / 2);
        }
        this.context.stroke();

        //green bar
        this.context.beginPath();
        this.context.lineWidth = Math.min(this.width, this.height) - 2;
        this.context.strokeStyle = "green";

        var fromMax = hp / this.maxHp * 100;


        if (this.alignment == "v") {
            this.context.moveTo(this.x + this.width / 2, this.y + (this.height - fromMax));
            this.context.lineTo(this.x + this.width / 2, this.y + this.height);
        } else {
            this.context.moveTo(this.x + 1, this.y + this.height / 2);
            this.context.lineTo(this.x + (this.width - (100 - fromMax)), this.y + this.height / 2);
        }
        this.context.stroke();

        if (this.alignment == "v") {
            this.context.fillText(this.name, this.x, this.y + this.height + 14);
        } else {
            this.context.fillText(this.name, this.x, this.y + this.height + 12, this.width);
        }

    }

    removeBar(b) {
        HealthBar.bars.splice(HealthBar.bars.indexOf(this), 1);
        for (var bar of HealthBar.bars) {
            if (b.x <= bar.x && (bar.x <= b.x + b.width || b.x <= bar.x + bar.width) && b.y < bar.y) {
                if (bar.alignment == b.alignment) {
                    bar.y -= bar.height * 2;
                    //moves all bars up.
                    this.removeBar(bar);
                }
            }
        }
    }


}

class MoveSet {
    constructor(options) {
        this.moves = options;

        this.currentMove = 0;
        this.tick = 0;

        this.then = 0;

        this.delay = 0;
    }

    doMove() {
        var now = Date.now();
        var delta = now - this.then;
        var move = "stop";
        var current = this.moves[this.currentMove];
        if (delta > 1000 * (this.delay + current.delayBefore)) {
            var current = this.moves[this.currentMove];
            move = current.type;

            this.then = now - (delta % this.delay);
            this.delay = current.delayAfter;
            this.tick++;
            if (this.tick == current.advanceAfter) {
                this.advanceMove(current);
            }

            if (isNaN(this.then)) {
                this.then = now
            }
        }
        return move;
    }

    advanceMove(move) {
        this.tick = 0;
        this.currentMove++;
        this.delta = move.delayAfter;
        if (this.currentMove == this.moves.length) {
            this.currentMove = 0;
        }
    }


}

class Entity {
    constructor(options) {
        this.level = options.level;
        this.posX = options.x;
        this.posY = options.y;
        this.sprite = options.sprite;


        if (options.animation != undefined) {
            this.animation = options.animation;
        }

    }


    getSprite() {
        return this.sprite[0];
    }

    setX(x) {
        this.posX = x;
    }

    getX() {
        return this.posX;
    }

    setY(y) {
        this.maxY = Math.min(y, this.maxY);
        this.posY = y;
    }
    getY() {
        return this.posY + this.getHeight();
    }

    spawn(X, Y, flipCode) {
        this.posX = X;
        this.posY = Y;
        //makes sure the entity is drawn at the correct place
        X -= this.level.getPlayer().getX();
        X += container.clientWidth / 2;
        X -= this.getSprite().width / 2;
        X = Math.floor(X);


        if (this.animation == undefined || this instanceof Grenade) {
            this.sprite[(flipCode != undefined && this.sprite[flipCode] != undefined) ? flipCode : 0].draw(X, Y);
        } else {
            if (this.animation[flipCode].doAnimation(X, Y)) {
                this.level.removeEntity(this);
            }
        }

        //drawing the weapon on the entity if it has one
        if (this.currentWeapon != undefined) {
            var flipped = false;
            if (this.getLastOffSet() <= 0) {
                X += this.rightHand[0];
                Y += this.rightHand[1];
            } else {
                X += this.leftHand[0];
                Y += this.leftHand[1];
                flipped = true;
            }
            this.currentWeapon.drawGun(X, Y, +flipped);
        }

        if (this.healthBar != undefined) {
            this.healthBar.drawHp(this.hp);
        }

    }

    getHeight() {
        return this.getSprite().height;
    }





}

class EntityMovable extends Entity {
    constructor(options) {
        super(options);
        this.speed = options.speed;
        this.vs = 0;
        this.hs = 0;
        this.lastOffSet = 0;
        this.elapsedTime = 1;
        this.onFloor = false;
    }


    getDamage() {
        return this.damage;
    }

    getSpeed() {
        return this.speed;
    }

    setVSpeed(s) {
        this.vs = Math.floor(s);
    }

    getVSpeed() {
        return this.vs;
    }

    setHSpeed(s) {
        this.hs = Math.floor(s);

    }

    getHSpeed() {
        return this.hs;
    }

    getLastOffSet() {
        return this.lastOffSet;
    }
    doCollision() {
        //getting the from and to values of the entity
        var creaX = this.getX() + this.getSprite().getCenter();
        if (this.getHSpeed() > 0) {
            creaX += this.getSprite().getCenter();
        } else if (this.getHSpeed() < 0) {
            creaX -= this.getSprite().getCenter();
        }
        var creaY = this.getY() - this.getHeight();

        var fromX = Math.min(creaX, creaX + this.getHSpeed());
        var fromY = Math.min(creaY, creaY + this.getVSpeed());

        var toX = Math.max(creaX, creaX + this.getHSpeed());
        var toY = Math.max(creaY, creaY + this.getVSpeed() + this.getHeight() - 1);



        //checking to see if the from x to the new x collides
        for (var x = fromX; x <= toX; x++) {
            //checking to see if the from y to the new y collides
            for (var y = fromY; y <= toY; y++) {

                //somewhere it collides
                if (!this.level.isOOB(x, y)) {
                    if (this.level.getBlock(x, y).Id != 0 && !this.level.getBlock(x, y).hasMeta("passThrough")) {
                        //setting back to the correct spawn x
                        if (this.getVSpeed() == 0) {
                            y = toY + 1;
                        }


                        this.setY(y - this.getHeight());

                        this.setHSpeed(0);
                        this.setVSpeed(0);
                        //below is needed for bullets, ignored for creatures
                        var temp = {};
                        temp.modDX = Math.abs(fromX - x);
                        if (y == fromY) {
                            temp.code = 2;
                        } else {
                            if (this.getVSpeed() > 0) {
                                temp.code = 3;
                            } else {
                                temp.code = 1;
                            }
                        }
                        return temp;
                    }


                    var collidingEntity = this.level.getEntity(x, y);
                    if (collidingEntity != null && collidingEntity != this) {
                        if (collidingEntity instanceof Bullet && this instanceof EntityCreature && !(collidingEntity instanceof Grenade)) {
                            if (collidingEntity.getOwner() != this) {
                                var owner = collidingEntity.getOwner();
                                //do damage to origin entity...
                                if (collidingEntity.impact == "explode") {
                                    var gren = new Grenade(0, 0, collidingEntity, 994, collidingEntity.getOwner());
                                    gren.setX(collidingEntity.getX());
                                    gren.setY(collidingEntity.getY() - collidingEntity.getHeight());
                                    gren
                                    return { code: 0, modDX: 0 };
                                }

                                if (this.level.removeEntity(collidingEntity)) {
                                    this.doDamage(collidingEntity.getDamage());
                                }
                            }
                        } else if (this instanceof Bullet && collidingEntity instanceof EntityCreature && !(this instanceof Grenade)) {
                            if (this.getOwner() != collidingEntity) {
                                if (this.impact == "explode") {
                                    var gren = new Grenade(0, 0, this, 994, this.getOwner());
                                    gren.setX(this.getX());
                                    gren.setY(this.getY() - this.getHeight());
                                    gren
                                    return { code: 0, modDX: 0 };
                                }
                                if (collidingEntity.level.removeEntity(this)) {
                                    collidingEntity.doDamage(this.getDamage());
                                }
                            }
                        }

                        else if (this instanceof Player && collidingEntity instanceof EntityCreature) {
                            //see if there is touch damage
                            this.doDamage(collidingEntity.getDamage());
                        } else if (this instanceof Player) {
                            //picking up a coin?
                            this.money++;
                            this.level.removeEntity(collidingEntity);
                        }
                    }
                }
            }
        }

        return { code: 0, modDX: 0 };

    }

    //handles the gravity
    doGravity() {
        var x = this.getX() + this.getSprite().getCenter();
        //checks if a enitty is in the air then setting the last offset, this allows the player to stand on the edge
        if (this.level.getBlock(x, this.getY()).Id == 0) {
            if (this.level.getBlock(x + this.getLastOffSet(), this.getY()).Id != 0) {
                x += this.getLastOffSet();
            } else if (this.level.getBlock(x - this.getLastOffSet(), this.getY()).Id != 0) {
                x -= this.getLastOffSet();
            }
        }
        //see if the entity is in the air then let the entity fall
        if (this.level.getBlock(x, this.getY()).Id == 0) {
            this.onFloor = false;


            this.setVSpeed(this.getVSpeed() + Math.floor(this.elapsedTime / this.level.gravity));
            this.elapsedTime++;
        } else {
            this.elapsedTime = 0;
            this.onFloor = true;
        }

        this.doCollision();
    }

    getFlipCode(overRide) {
        if (overRide) {
            if (this.getLastOffSet() > 0) {
                return 3;
            } else {
                return this.animation == undefined ? 0 : 2;
            }
        } else if (this.getHSpeed() > 0) {
            return 0;
        } else if (this.getHSpeed() < 0) {
            return 1;
        } else if (this.getLastOffSet() > 0) {
            return 3;
        } else {
            return this.animation == undefined ? 0 : 2;
        }
    }

    //bacis do move function for an entity
    doMove(onTick, flipCode) {
        if (onTick) {
            this.setX(this.getX() + this.getHSpeed());
            this.setY(this.getY() - this.getSprite().height + this.getVSpeed());
            this.spawn(this.getX(), this.getY() - this.getSprite().height, flipCode);
        }
    }
}

class EntityInteractable extends Entity {
    constructor(options) {
        super(options);
        this.state = false; //false if not activated, true if activated
        this.action = null; //action to be done when true;
    }

    flipState() {
        this.state = !this.state;
        this.doAction();
    }

    doAction() {

    }
}

class EntityCreature extends EntityMovable {
    constructor(options) {
        super(options);
        this.hp = options.hp;
        this.maxHp = this.hp;
        this.immunityFrame = 0;


        this.weapons = options.weapon;
        this.currentWeapon = this.weapons[0];

        this.leftHand = options.leftHand;
        this.rightHand = options.rightHand;


        this.jump = options.jump;

        this.respawn = false;
        this.leftDown = false;
        this.rightDown = false;
        this.jumpDown = false;
        this.jumping = false;
        this.jumpCounter = 0;

        if (options.healthBar != undefined) {
            this.healthBar = new HealthBar(options.hp, canvas.getContext("2d"), options.name, options.healthBar.alignment, options.healthBar.x, options.healthBar.y);
        }


        if (options.moveSet != undefined) {
            this.moveSet = options.moveSet;
            this.damage = options.damage;
            this.sleep = true;
        }
    }

    doDamage(damage) {
        //checks if the immunityFrame is 0 so the creature can be damaged
        if (this.immunityFrame == 0) {
            this.hp -= damage;
            //immunityFrame is set if this is a player
            if (this instanceof Player) {
                this.immunityFrame = 1500;
            }
            //doing the respawn
            if (this.hp <= 0) {
                this.doRespawn();
            }
        }
    }

    doRespawn() {
        //checks if the creature is able to respawn
        if (this.respawn) {
            this.spawn(this.level.spawnX, this.level.spawnY, 2);
            this.setVSpeed(0);
            this.setHSpeed(0);
            this.hp = this.maxHp;
        } else {
            //removes the healthbar if any
            if (this.healthBar != undefined) {
                this.healthBar.removeBar(this.healthBar);
            }
            //removes the entity from the game
            this.level.removeEntity(this);
        }
    }


    getJump() {
        return this.jump;
    }

    doMove(type, isDown, onTick) {
        if (!this.sleep) {
            if (this.moveSet != undefined) {
                type = this.moveSet.doMove();
            }
            if (this.immunityFrame > 0) {
                this.immunityFrame -= 60;
                if (this.immunityFrame < 0) {
                    this.immunityFrame = 0;
                }
            }


            //see what type of movement the player did
            switch (type) {
                case "right":
                    this.rightDown = isDown;
                    this.leftDown = false;
                    break;
                case "left":
                    this.leftDown = isDown;
                    this.rightDown = false;
                    break;
                case "jump":
                    if (isDown && this.jumpDown) {
                        break;
                    }
                    this.jumpDown = isDown;
                    break;
                case "stop":
                    this.rightDown = false;
                    this.leftDown = false;
                    this.jumpDown = false;
                    break;
                case "fire":
                    this.currentWeapon.fireWeapon(this, this.level);
                    break;
                case "main":
                    if (this.weapons.length > 1) {
                        this.currentWeapon = this.weapons[1];
                    }
                    break;
                case "secondary":
                    this.currentWeapon = this.weapons[0];
                    break;
                case "action":
                    //insert for interacting with stuff like levers..
                    break;
            }
            var overRide = false;
            //handling to what the player did
            if (this.rightDown) {
                this.setHSpeed(this.getSpeed());
                this.lastOffSet = -this.getSprite().getOffSet();
            } else if (this.leftDown) {
                this.setHSpeed(-this.getSpeed());
                this.lastOffSet = this.getSprite().getOffSet();
            } else {
                //handles if the player is on ice
                if (!this.level.getBlock(this.getX(), this.getY()).hasMeta("ice")) {
                    this.setHSpeed(0);
                } else {
                    //this makes sure the correct sprite is chosen
                    overRide = true;
                }
            }


            //handling the jumping
            if (this.jumpDown && this.onFloor) {

                if (onTick) {
                    var y = -this.getJump() * this.level.gravity;
                    this.setVSpeed(y);
                    this.onFloor = false;
                }
            }
            //doing the gravity fuction
            this.doGravity();
            //handles what happens on the tick update
            if (onTick) {

                this.setX(this.getX() + this.getHSpeed());
                if (this.jumping) {
                    var y = -this.getJump() * this.level.gravity;
                    this.setVSpeed(y);
                    this.jumpCounter++;
                    if (this.jumpCounter == 0) {
                        this.jumping = false;
                    }
                }
                //setting the height correctly
                this.setY(this.getY() - this.getHeight() + this.getVSpeed());
                if (this.currentWeapon != undefined) {
                    this.currentWeapon.lowerCD();
                }
                //check for Out of bounds
                switch (this.level.isOOB(this.getX(), this.getY())) {
                    case 1:
                        this.setX(container.clientWidth + this.getSprite().getCenter() * 2);
                        break;
                    case 2:
                        this.setX(0);
                        break;
                    case 3:
                        this.doRespawn();
                        break;
                }
                //spawning at the new place
                this.spawn(this.getX(), this.getY() - this.getHeight(), this.getFlipCode(overRide));
            }
        }
    }



}


class Player extends EntityCreature {
    constructor(options) {
        super(options);
        this.respawn = true;

        this.money = 0;
        this.healthBar = new HealthBar(options.hp, canvas.getContext("2d"), options.name, "v", 10, 10);
    }


    getMoney() {
        return this.money;
    }


}