class Item {
    constructor(options, player) {
        for (var obj of Object.keys(options)) {
            this[obj] = options[obj];
        }
        this.width = 0;
        this.selected = 1;
        this.impactSelected = false;
        this.impactSelect = 0;
        this.impacts = [];

        for (var impacts of weapons.get(this.id).impactUpgrades) {
            if (this.getWeapon(this.id, player) != null && this.getWeapon(this.id, player).availableImpact.indexOf(impacts) == -1) {
                this.impacts.push(impacts);
            }
        }

        this.ignored = ["width", "selected", "ignored", "impacts","id", "impactSelect", "impactSelected"];
    }
    //gui stuff for the item store
    drawItem(ctx, img, width, height, player) {
        if (this.impactSelected) {
            this.drawImpacts(ctx, img, width, height, player);
        } else {
            this.drawMain(ctx, img, width, height, player);
        }
    }
    //draws the different kinds of impacts
    drawImpacts(ctx, img, width, height, player) {
        for (var impacts of this.impacts) {
                this.width = Math.max(this.width, ctx.measureText(impacts).width + 10);
        }
        var offSet = 0;
        for (var impacts of this.impacts) {
                ctx.drawImage(img, 0, 0, img.width, img.height, width * 2, offSet * height, this.width, height);
                var text = impacts;
                ctx.fillText(text, width * 2 + (this.width - ctx.measureText(text).width) / 2, ((offSet) * height + height / 2));
                offSet++;
        }

        ctx.fillText(this.getImpactMessage(this.impacts[this.impactSelect]) + ". ", 20, container.clientHeight / 2 + 150);
        
        ctx.fillText(this.getMessage(this.getImpactValue(this.impacts[this.impactSelect]), player, true, this.impacts[this.impactSelect]), 20, container.clientHeight / 2 + 200);
        ctx.fillText("<-", width * 2 + this.width + 5, ((this.impactSelect) * height + height / 2));
    }

    //change this later
    getImpactMessage(impact) {
        switch (impact) {
            case "die":
                return "your bullet will go away and do nothing upon hitting a block";
            case "ricochet":
                return "your bullet will try to ricochet when hitting a block";
            case "explode":
                return "your bullet will explode upon impact";
        }
    }

    //change this later
    getImpactValue(impact) {
        switch (impact) {
            case "die":
                return 0;
            case "ricochet":
                return 200;
            case "explode":
                return 150;
        }
    }
    getWeapon(id, player) {
        for (var weapon of player.weapons) {
            if (weapon.id == id) {
                return weapon;
            }
        }
        return null;
    }
    //draws the main item upgrade selection
    drawMain(ctx, img, width, height, player) {
        for (var obj of Object.keys(this)) {
            this.width = Math.max(this.width, ctx.measureText(obj + ": " + this[obj]).width + 10);
        }


        var offSet = 0;
        for (var obj in this) {
            if (this.ignored.indexOf(obj) == -1) {
                ctx.drawImage(img, 0, 0, img.width, img.height, width * 2, offSet * height, this.width, height);
                var text = obj + ": ";
                //correct value selection
                if (obj == "damage") {
                    text += (this[obj] * this.getWeapon(this.id, player).damageMult).toFixed(2);
                } else if (obj == "speed") {
                    text += (this[obj] * this.getWeapon(this.id, player).speedMult).toFixed(2);
                } else {
                    text += this[obj];
                }
                if (obj == "impact") { text = obj };
                ctx.fillText(text, width * 2 + (this.width - ctx.measureText(text).width) / 2, ((offSet) * height + height / 2));
                
                offSet++;
            }
        }
        ctx.fillText("<-", width * 2 + this.width + 5, ((this.selected) * height + height / 2));
        if (Object.keys(this)[this.selected] != "impact") {
            var value = this[Object.keys(this)[this.selected]] * (Object.keys(this)[this.selected] == "damage" ? this.getWeapon(this.id, player).damageMult : this.getWeapon(this.id, player).speedMult);
            ctx.fillText("Your " + Object.keys(this)[this.selected] + " is: " + value.toFixed(2), 20, container.clientHeight / 2 + 150);
            ctx.fillText(this.getMessage(value, player), 20, container.clientHeight / 2 + 200);
        } else {
            ctx.fillText("For available impact upgrades press next.", 20, container.clientHeight / 2 + 150);
        }

    }
    //temp get message.. try and change 
    getMessage(value, player, impact, type) {
        if (!impact) {
            console.log(value);
            if (this.canBuy(Math.ceil(value * 1.2 * 3), player)) {
                return "You can upgrade this to " + (value * 1.2).toFixed(2) + " for " + Math.ceil(value * 1.2 * 3) + " bitcoins";
            } else {
                return "It seems you don't have enough to upgrade this, this upgrade costs " + Math.ceil(value * 1.2 * 3) + " bitcoins.";
            }
        } else {
            if (this.canBuy(Math.ceil(value * 1.2 * 3), player)) {
                return "You can upgrade this to " + type + " for " + Math.ceil(value * 1.2 * 3) + " bitcoins";
            } else {
                return "It seems you don't have enough to upgrade this, this upgrade costs " + Math.ceil(value * 1.2 * 3) + " bitcoins.";
            }
        }
    }

    //checks if a player can buy this..
    canBuy(value, player) {
        if (player.money >= value) {
            return true;
        } else {
            return false;
        }
    }

    //sets the right selected item
    setSelectItem(d) {
        if (!this.impactSelected) {
            if (this.selected + d >= Object.keys(this).length - (this.ignored.length) || this.selected + d < 1) {
                return false;
            }
            this.selected += d;
        } else {
            if (this.impactSelect + d >= Object.keys(this.impacts).length || this.impactSelect + d < 0) {
                return false;
            }
            this.impactSelect += d;
        }
    }

    //handles weapon upgrade purchases
    handlePurchase(player) {
        if (Object.keys(this)[this.selected] == "impact") {
            if (!this.impactSelected) {
                this.impactSelected = true;
            } else {
                var o = 0;
                var i = this.impacts[this.impactSelect];
           
                var value = this.getImpactValue(i);
                this.impacts.splice(this.impacts.indexOf(i), 1);
                this.getWeapon(this.id, player).availableImpact.push(i);
            }
        } else {
            var value = Math.ceil(this[Object.keys(this)[this.selected]] * 1.2 * 3);
            if (this.canBuy(value, player)) {
                player.money -= value;
                if (Object.keys(this)[this.selected] == "damage") {
                    this.getWeapon(this.id, player).damageMult = (this.getWeapon(this.id, player).damageMult* 1.2).toFixed(2);
                } else {
                    this.getWeapon(this.id, player).speedMult = (this.getWeapon(this.id, player).speedMult * 1.2).toFixed(2);
                }

                
            }
        }
    }
}

class Shop {
    constructor(items, player) {

        this.selected = 0;
        this.height = 30;
        this.width = 0;

        this.items = items;

        this.player = player;
        this.img = new Image();
        this.img.src = "../resources/TextBox.png";

        this.offSet = 0;
        this.itemSelected = false;
    }

    mainMenu(ctx) {
        ctx.fillText("<-", this.width + 5, ((this.selected) * this.height + this.height / 2));
    }


    openShop() {
        this.checkWidth();
        var ctx = canvas.getContext("2d");
        ctx.font = "15px sans-serif";
        var drawn = 0;
        // console.log(container.clientHeight)
        for (var i = this.offSet; i < this.items.length && drawn < 10; i++) {


           
            ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, 0, drawn * this.height , this.width, this.height);
            ctx.fillText(this.items[i].name, (this.width - ctx.measureText(this.items[i].name).width) / 2, (drawn  * this.height + this.height / 2));

            drawn++;
            //draw for the menu stuff;
           

            ctx.strokeRect(0, container.clientHeight / 2 + 50, 720, 200);
            ctx.fillText("This is the " + this.items[this.selected + this.offSet].name + ". " + this.getMessage(this.items[this.selected + this.offSet].id), 20, container.clientHeight / 2 + 100);

        }


        if (!this.itemSelected) {
            this.mainMenu(ctx);
        } else {
            this.items[this.selected].drawItem(ctx, this.img, this.width, this.height, this.player);
        }

    }
    hasWeapon(id) {
        for (var weapon of this.player.weapons) {
            if (weapon.id == id) {
                return true;
            }
        }
        return false;
    }
    //temp try and change
    getMessage(id) {
        if (this.hasWeapon(id)) {
            return "You can upgrade it by pressing next.";
        } else {
            if (this.canBuy(weapons.get(id).price)) {
                return "You can buy it for " + weapons.get(id).price + " bitcoins.";
            } else {
                return "It seems you don't have enough to buy it, this costs " + weapons.get(id).price + " bitcoins.";
            }
        }

    }

    addItem(item) {
        this.items.push(new Item(item));
    }
    //sets the selected item
    setSelectItem(d) {
        if (!this.itemSelected) {
            if (this.selected + d >= this.items.length || this.offSet + this.selected + d >= this.items.length || (this.selected + d < 0 && this.offSet == 0)) {
                return false;
            }
            this.selected += d;
            if (this.selected > 9) {
                this.offSet++;
                this.selected = 9;
            } else if (this.selected < 0) {
                this.offSet--;
                this.selected = 0;
            }
        } else {
                this.items[this.selected + this.offSet].setSelectItem(d);
        }
    }

    canBuy(price) {
        if (this.player.money >= price) {
            //reduce the players money
            return true;
        } else {
            return false;
        }
    }
    //this navigates the shop meny
    navigate(type) {
        switch (type) {
            case "down":
                this.setSelectItem(1);
                break;
            case "up":
                this.setSelectItem(-1);
                break;
            case "right":
                //checks if the player has the weapon and if can buy
                if (!this.hasWeapon(this.items[this.selected + this.offSet].id)) {
                    if (!this.canBuy(weapons.get(this.items[this.selected + this.offSet].id).price)) {
                        return;
                    } else {
                        //buys the weapon for the player
                        if (!this.itemSelected) {
                            this.player.money -= weapons.get(this.items[this.selected + this.offSet].id).price;
                            this.player.weapons.push({ id: this.items[this.selected + this.offSet].id, damageMult: 1, speedMult: 1, impact: weapons.get(this.items[this.selected + this.offSet].id).impact });
                        } 
                    }
                    //handles the item upgrades
                } else if (this.itemSelected){
                    this.items[this.selected + this.offSet].handlePurchase(this.player);
                }
                this.itemSelected = true;
                break;
            case "left":
                //going back a menu
                if (this.itemSelected) {
                    if (this.items[this.selected + this.offSet].impactSelected) {
                        this.items[this.selected + this.offSet].impactSelected = false;
                    } else {
                        this.itemSelected = false;
                    }
                } else {
                    overWorld.inShop = false;
                    overWorld.onOverworld = true;
                }
                break;
        }
    }
    checkWidth() {
        for (var item of this.items) {
            this.width = Math.max(this.width, canvas.getContext("2d").measureText(item.name).width + 10);
        }
    }
}

function loadShop(player){
    var items = [];
        for (var weapon of weapons.keys()) {
            var w = weapons.get(weapon);
            var options = {};
            options.name = w.name;
            options.damage = w.damage;
            options.speed = w.speed;
            options.impact = w.impact;
            options.id = weapon;

            items.push(new Item(options, player));
    }
    var shop = new Shop(items, player);
    return shop
}

class CharacterSelect {
    constructor(overWorld, characters, player) {
        this.player = player;
        this.overWorldCharacter = overWorld;
        this.otherCharacter = characters;
    }
}
