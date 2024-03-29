﻿var moves = [];
var drops = [];

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

    //loads an animation for a specific id
    static loadAnimation(id) {
        if (getSprite(id).animation != undefined) {
            return this.loadAnimationArray(getSprite(id).animation, id);
        }
        return null;
    }

    static loadAnimationArray(animations, id, src, factor) {
        var a = [];
        for (var ani of animations) {
            var frames = ani.frames;
            var frameRate = ani.frameRate;
            var columns = ani.columns;
            var img = new Image();
            img.src = src != undefined ? src : getSprite(id).image.src;
            img.width = ani.width != undefined ? ani.width : getSprite(id).width;
            img.height = ani.height != undefined ? ani.height : getSprite(id).height;
            img.startX = ani.startX != undefined ? ani.startX : getSprite(id).image.startX;
            img.startY = ani.startY != undefined ? ani.startY : getSprite(id).image.startY;

            img.offSetX = ani.offSetX != undefined ? ani.offSetX : 0;
            img.offSetY = ani.offSetY != undefined ? ani.offSetY : 0;

            var animation = new Animation(img, frames, frameRate, columns, true);
            if (factor != undefined) animation.factor = factor;

            a.push(animation);
        }
        return a;
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

        if (this.moves.length > 0 && delta > 1000 * (this.delay + current.delayBefore)) {
            var current = this.moves[this.currentMove];
            if (current.type == "fire") {
                if (this.ent.currentWeapon != null && !this.ent.currentWeapon.canFire()) {
                    return move;
                }
            }
            if (current.type == "ai") {
                move = this.ai(current);
            } else {
                move = current.type;
            }

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

    ai(move) {
        var m = "stop";
        var d = this.ent.getX() - map.getPlayer().getX();
        switch (move.ai) {
            case "follow":
                var s = 0;
                if (d > 0) {
                    //player is behind the enemy
                    s -= this.ent.getSpeed();
                    m = "left";
                } else if (d < 0) {
                    //player is in front of the enemy
                    s += this.ent.getSpeed();
                    m = "right";
                }
                var nextX = this.ent.getX() + s;
                if (map.getBlock(nextX, this.ent.getY()).Id == 0) {
                    if (this.ent.getVSpeed() == 0 && !this.ent.jumpDown) {
                        m = "jump";
                    }
                }
                break;
            case "aim":
                if (this.ent.currentWeapon != undefined) {
                    var cx = this.ent.getX();
                    var cy = this.ent.getY() - this.ent.getHeight() / 2;

                    var px = map.getPlayer().getX();
                    var py = map.getPlayer().getY() - map.getPlayer().getHeight() / 2;

                    var t = Math.atan2(py - cy, px - cx);
                    if (t < 0) {
                        t += Math.PI * 2;
                    }
                    var angle = Math.floor(t * 180 / Math.PI);
                    if (this.ent.getLastOffSet() < 0 && (angle > 90 && angle < 270)) {
                        this.ent.lastOffSet = this.ent.getSprite().getOffSet();
                        angle = 180 - angle;
                    } else if (this.ent.getLastOffSet() > 0 && (angle <= 90 || angle > 270)) {
                        this.ent.lastOffSet = -this.ent.getSprite().getOffSet();
                        angle = 360 - angle;
                    } else {
                        if (this.ent.getLastOffSet() < 0) {
                            angle = 360 - angle;
                        } else if (this.ent.getLastOffSet() > 0) {
                            angle += 180;
                        }

                    }

                    this.ent.currentWeapon.setAngle(angle);
                }
                break;
            case "patrol":
                m = move.moves[move.index];
                var s = this.ent.getSpeed();
                if (m == "left") { s = -s };
                var nextX = this.ent.getX() +this.ent.getSprite().getCenter();
                this.ent.setHSpeed(s);
                var col = this.ent.doCollision();
                if (map.getBlock(nextX, this.ent.getY()).Id == 0 || map.isOOB(nextX, this.ent.getY()) != 0 || col.code == 2) {
                    move.index++;
                    if (move.index >= move.moves.length) {
                        move.index = 0;
                    }
                }
                m = move.moves[move.index];
                break;

        }
        return m;
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
        if (options.amount != undefined) {
            this.amount = options.amount;
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
    getY(spawn) {
        if (spawn == undefined) {
            spawn = false;
        }
        var off = 0;
        if (this instanceof EntityCreature && this.slideDown && this.getSprite().height instanceof Array && !spawn) {
            off = this.getSprite().height[0] - this.getSprite().height[1];
        }

        return this.posY+off + this.getHeight(spawn);
    }

    spawn(X, Y, flipCode) {
        this.posX = X;
        this.posY = Y;

        //makes sure the entity is drawn at the correct place
        X += this.level.offSetX;
        Y += this.level.offSetY;



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
                X += this.rightHand[flipCode == 7 || flipCode == 5 ? 1 : 0][0];
                Y += this.rightHand[flipCode == 7 || flipCode == 5 ? 1 : 0][1];
            } else {
                X += this.leftHand[flipCode == 7 || flipCode == 5 ? 1 : 0][0];
                Y += this.leftHand[flipCode == 7 || flipCode == 5 ? 1 : 0][1];
                flipped = true;
            }
            this.currentWeapon.drawGun(X, Y, +flipped);
        }

        if (this.healthBar != undefined) {
            this.healthBar.drawHp(this.hp);
        }

    }

    getHeight(spawn) {
        if (this.getSprite().height instanceof Array) {
            if (spawn) {
                return this.getSprite().height[0];
            }
            var index = this.slideDown ? 1 : 0;
            return this.getSprite().height[index];
        } else {
            return this.getSprite().height;
        }
    }





}

class Artifact extends Entity {
    constructor(options) {
        super(options);
        this.type = options.type;
        this.id = options.id;
    }
    //handles the pickups
    handlePickUp(player) {
        switch (this.type) {
            case "artifact":
                if (player.artifacts.indexOf(this.id) == -1) {
                    player.artifacts.push(this.id);
                }
                break;
            case "weapon":
                if (!Shop.hasWeapon(this.level.user, this.id)) {
                    var obj = {};
                    obj.id = this.id;
                    obj.damageMult = 1;
                    obj.speedMult = 1;
                    obj.equippedImpact = "ricochet";
                    obj.availableImpact = ["ricochet"];

                    this.level.user.weapons.push(obj);
                }
                break;
        }
    }
}

class EntityMovable extends Entity {
    constructor(options) {
        super(options);
        this.speed = options.speed;
        this.vs = 0;
        this.hs = 0;
        this.lastOffSet = -this.getSprite().getOffSet();
        this.elapsedTime = 1;
        this.onFloor = false;
        this.float = options.float;
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
    doCollision(ov) {
        //getting the from and to values of the entity
        var creaX = this.getX() + this.getSprite().getCenter() ;
 
        var creaY = this.getY() - this.getHeight();

        var fromX = Math.min(creaX, creaX + this.getHSpeed()) - this.getSprite().getOffSet();
        var fromY = Math.min(creaY, creaY + this.getVSpeed());

        var toX = Math.max(creaX, creaX + this.getHSpeed()) + this.getSprite().getOffSet();
        var toY = Math.max(creaY, creaY + this.getVSpeed() + this.getHeight() - 1);



        //checking to see if the from x to the new x collides
        for (var x = fromX; x <= toX; x++) {
            //checking to see if the from y to the new y collides
            for (var y = fromY; y <= toY; y++) {

                //somewhere it collides
                if (this.level.isOOB(x, y) == 0) {
                    if (this.level.getBlock(x, y).Id != 0 && !this.level.getBlock(x, y).hasMeta("passThrough")) {
                        if (ov) {
                            return { code: -1, modX: 0 };
                        }
                        //thing goes right
                        if (this.getHSpeed() > 0) {
                            this.setHSpeed(0);
                            //thing goes left
                        } else if (this.getHSpeed() < 0) {
                            this.setHSpeed(0);
                        }
                        //thing goes down
                        if (this.getVSpeed() > 0) {
                            var dy = Math.abs(fromY + this.getHeight() - y);
                            if (dy > this.getVSpeed()) {
                                dy = 0;
                            }

                            this.setVSpeed(dy);
                            //thing goes up
                        } else if (this.getVSpeed() < 0) {
                             this.setVSpeed(0);
                        }


                        //below is needed for bullets, ignored for creatures
                        var temp = {};
                        temp.modDX = Math.abs(fromX - x);
                        if (y == fromY) {
                            temp.code = 2;
                        } else {
                            if (this.getVSpeed() > 0) {
                                temp.code = 3;
                            } else if (this.getVSpeed() < 0) {
                                temp.code = 1;
                            } else {
                                temp.code = 2;
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
                                    this.doDamage(collidingEntity.getDamage(), owner);
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
                                    collidingEntity.doDamage(this.getDamage(), this.getOwner());
                                }
                            }
                        }

                        else if (this instanceof Player && collidingEntity instanceof EntityCreature) {
                            //see if there is touch damage
                            this.doDamage(collidingEntity.getDamage());
                        } else if (this instanceof Player) {
                            //doing with plates
                            if (collidingEntity instanceof EntityInteractable) {
                                if (collidingEntity.type == "pressurePlate" || collidingEntity.type == "spike") {
                                    //do stuff with a plate
                                    collidingEntity.flipState(this);
                                    var e = new CustomEvent("trap");
                                    document.dispatchEvent(e);
                                }
                            } else if (collidingEntity instanceof Artifact) {
                                collidingEntity.handlePickUp(this);
                                this.level.exitMap(true);
                                return;
                            } else {
                                //picking up a coin?
                                if (collidingEntity.amount != undefined) {
                                    this.money += collidingEntity.amount;
                                } else {
                                    this.money++;
                                }
                                this.level.removeEntity(collidingEntity);
                                var e = new CustomEvent("collection");
                                document.dispatchEvent(e);
                            }
                        }
                    }
                }
            }
        }

        return { code: 0, modDX: 0 };

    }

    //handles the gravity
    doGravity() {
        if (!this.float) {

            var x = this.getX() + this.getSprite().getCenter();
            //checks if a enitty is in the air then setting the last offset, this allows the player to stand on the edge

            //see if the entity is in the air then let the entity fall
            if (this.level.getBlock(x, this.getY()).Id == 0 || this.level.getBlock(x, this.getY()).hasMeta("passThrough")) {
                this.onFloor = false;

                if (this.getVSpeed() + Math.floor(this.elapsedTime / this.level.gravity) < 100) {
                    this.setVSpeed(this.getVSpeed() + Math.floor(this.elapsedTime / this.level.gravity));
                }
                this.elapsedTime++;
            } else {
                this.elapsedTime = 0;
                this.onFloor = true;
            }
        }

        this.doCollision();
    }

    getFlipCode(overRide, slide) {
        if (overRide) {
            if (this.getLastOffSet() > 0) {
                return 3;
            } else {
                return this.animation == undefined ? 0 : 2;
            }

        } else if (this.getVSpeed() != 0) {
            if (this.getHSpeed() > 0 || this.getLastOffSet() < 0) {
                return 4;
            } else {
                return 6;
            }
        } else if (slide != undefined && slide) {
            if (this.getHSpeed() > 0 || this.getLastOffSet() < 0) {
                return 5;
            } else {
                return 7;
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
        this.type = options.name;
        this.state = false; //false if not activated, true if activated
        this.action = options.action; //action to be done when true;
        this.repeatable = options.repeatable;
        if (this.action.type == "spawn") this.action.hasSpawned = false;
    }
    spawn(x, y) {
        super.spawn(x, y, +(this.state));
    }

    flipState(actor) {
        if (this.state && !this.repeatable) {
            return;
        }

        this.state = !this.state;
        this.doAction(this.state, actor);
    }

    doAction(state, actor) {
        //looping through all the actions
        for (var ac of this.action) {
            if (ac.type == "spawn" && !ac.hasSpawned && ac.entType == "Tile") {
                this.level.blockLoading += ac.amount;
            }
        }

        for (var action of this.action) {
            //filter by type
            switch (action.type) {
                case "spawn":
                    //check if already spawned
                    if (!action.hasSpawned) {
                        var x = action.x;
                        var y = action.y;
                        var id = action.id;
                        var amount = action.amount;
                        var entType = action.entType;
                        //loop for amount
                        for (var i = 0; i < amount; i++) {
                            //filter by type
                            switch (entType) {
                                //spawning a creature
                                case "EntityCreature":
                                    this.level.loadCreature([{ X: x, Y: y, Id: id, moveSet: action.moveSet, loot : action.loot !=undefined ? action.loot : -1 }]);
                                    break;
                                //spawning a basic entity
                                case "Tile":
                                    var tile = { blockId: id, blockX: x, blockY: y, meta: [{ "ricochet": true }] };
                                    this.level.loadBlock(tile, this.level.Tbackground);
                                    break;
                                default:
                                    this.level.loadEntity([{ X: x, Y: y, Id: id }]);
                                    break;
                            }
                        }
                        action.hasSpawned = true;
                    }

                    break;
                case "meta":
                    //adding or removing a meta tag
                    if (this.state) {
                        this.level.getBlock(action.x, action.y + getSprite(action.id).offSet).addMeta(Object.keys(action.meta)[0], Object.values(action.meta)[0])
                    } else {
                        this.level.getBlock(action.x, action.y + getSprite(action.id).offSet).addMeta(Object.keys(action.meta)[0], !Object.values(action.meta)[0])
                    }

                    break;
                case "damage":
                    actor.doDamage(action.damage, this);
                    break;
                case "end":
                    this.level.exitMap(true);
                    break;

            }
        }
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

        if (options.loot != undefined) {
            this.loot = options.loot; //add the loot of the boss
        }

        this.jump = options.jump;

        this.respawn = false;
        this.leftDown = false;
        this.rightDown = false;
        this.jumpDown = false;
        this.jumping = false;
        this.slideDown = false;
        this.jumpCounter = 0;

        if (options.healthBar != undefined) {
            this.healthBar = new HealthBar(options.hp, canvas.getContext("2d"), options.name, options.healthBar.alignment, options.healthBar.x, options.healthBar.y);
        }


        if (options.moveSet != undefined) {
            this.moveSet = options.moveSet;
            this.damage = options.damage;
            this.sleep = true;
            this.moveSet.ent = this;
        }
    }

    doDamage(damage, source) {
        //checks if the immunityFrame is 0 so the creature can be damaged
        if (this.immunityFrame == 0) {
            this.hp -= damage;
            //immunityFrame is set if this is a player
            if (this instanceof Player) {
                this.immunityFrame = 1500;
            }
            //doing the respawn
            if (this.hp <= 0) {
                this.doRespawn(source);
            }
        }
    }

    doRespawn(source) {
        if (this.loot != undefined) {
            var prop = this.loot;
            prop.x = this.getX();
            prop.y = this.getY() - this.getHeight() / 2;
            this.level.loadArtifact(prop);
        }

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
            if (source instanceof Player) {
                source.killcount++;
                document.dispatchEvent(new Event("kill"));
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
                case "down":
                    if (this.slideDown && !isDown) {
                        this.slideDown = isDown;
                        var c = this.doCollision(true).code;
                        if (c == -1) {
                            this.slideDown = true;
                            break;
                        }
                    }
                    this.slideDown = isDown;
                    break;
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
                    if (this.slideDown) {
                        this.slideDown = false;
                        var c = this.doCollision(true).code;
                        if (c == -1) {
                            this.slideDown = true;
                            break;
                        }
                    }

                    this.jumpDown = isDown;
                    this.slideDown = false;
                    break;
                case "stop":
                    this.rightDown = false;
                    this.leftDown = false;
                    this.jumpDown = false;
                    break;
                case "fire":
                    if (this.currentWeapon != undefined) {
                        this.currentWeapon.fireWeapon(this, this.level);
                    }
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
                    if (isDown) {
                        var index = this.slideDown ? 1 : 0;

                        for (var x = this.getX(); x < this.getX() + this.getSprite().width[index]; x++) {
                            var br = false;
                            for (var y = this.getY() - this.getHeight(); y < this.getY(); y++) {
                                if (this.level.getEntity(x, y) != null) {
                                    if (this.level.getEntity(x, y) instanceof EntityInteractable) {
                                        var ent = this.level.getEntity(x, y);
                                        br = true;
                                        ent.flipState();
                                        document.dispatchEvent(new Event("pull"));
                                        break;
                                    }
                                }
                            }
                            if (br) break;
                        }
                    }
                    break;
                case "quit":
                    //open exit menu
                    this.level.world.inExitMenu = true;
                    break;
                case "back":
                    if (this.level instanceof Museum) {
                        this.level.toOverWorld();
                    }
                    break;

            }
            var overRide = false;
            var slide = false;
            //handling to what the player did
            if (this.slideDown) {
                slide = true;
                if (!isDown) {
                    this.slideDown = false;
                    var c = this.doCollision(true).code;

                    if (c == -1) {
                        this.slideDown = true;
                    } else {
                        slide = false;
                    }
                }
            }
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
                this.setY(this.getY(true) - this.getHeight(true) + this.getVSpeed());
                if (this.currentWeapon != undefined) {
                    this.currentWeapon.lowerCD();
                }
                //check for Out of bounds
                switch (this.level.isOOB(this.getX(), this.getY(true))) {
                    case 1:
                        this.setX(this.getX() - this.getHSpeed());
                        this.setHSpeed(0);
                        break;
                    case 2:
                        this.setX(this.getX() - this.getHSpeed());
                        this.setHSpeed(0);
                        break;
                    case 3:
                        if (this.godlike) { break; }
                        this.doRespawn();
                        break;
                }
                //spawning at the new place
                this.spawn(this.getX(), this.getY(true) - this.getHeight(true), this.getFlipCode(overRide, slide));
            }
        }
    }



}


class Player extends EntityCreature {
    constructor(options) {
        super(options);
        this.respawn = true;
        this.achievements = options.achievements;
        this.money = options.money;
        this.artifacts = options.artifacts;
        this.timeplayed = options.timeplayed;
        this.killcount = options.killcount;
        this.healthBar = new HealthBar(options.hp, canvas.getContext("2d"), options.name, "v", 10, 10);
    }


    getMoney() {
        return this.money;
    }

    awardAchievement(id) {
        this.achievements.push(id);
    }

    hasAchievement(id) {
        return this.achievements.indexOf(id) == -1;
    }

}


class Boss extends EntityCreature {
    constructor(options) {
        super(options);


    }


    doRespawn(source) {

        var e = new CustomEvent("bossKill", { detail: this.getSprite().id });
        document.dispatchEvent(e);
        super.doRespawn(source);
    }
}