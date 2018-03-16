class Item {
    constructor(options, player, texts) {
        for (var obj of Object.keys(options)) {
            this[obj] = options[obj];
        }
        this.width = 0;
        this.selected = 1;
        this.impactSelected = false;
        this.impactSelect = 0;
        this.impacts = [];
        this.texts = texts;

        for (var impacts of weapons.get(this.id).impactUpgrades) {
            if (this.getWeapon(this.id, player) != null && this.getWeapon(this.id, player).availableImpact.indexOf(impacts) == -1) {
                this.impacts.push(impacts);
            }
        }

        this.ignored = ["texts","width", "selected", "ignored", "impacts", "id", "impactSelect", "impactSelected"];
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

    //gets the impact message
    getImpactMessage(impact) {
        return this.texts.impacts[impact];
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
    //gets the message
    getMessage(value, player, impact, type) {
        if (!impact) {
            if (this.canBuy(Math.ceil(value * 1.2 * 3), player)) {
                return this.texts.shop.canBuy.upgrade.replace("%value%", (value * 1.2).toFixed(2)).replace("%price%",Math.ceil(value * 1.2 * 3));
            } else {
                return this.texts.shop.noBuy.upgrade.replace("%price%", Math.ceil(value * 1.2 * 3));
            }
        } else {
            if (this.canBuy(Math.ceil(value * 1.2 * 3), player)) {
                return this.texts.shop.canBuy.impact.replace("%impact%", type).replace("%price%", Math.ceil(value * 1.2 * 3));
            } else {
                return this.texts.shop.noBuy.impact.replace("%price%", Math.ceil(value * 1.2 * 3));;
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
                    this.getWeapon(this.id, player).damageMult = (this.getWeapon(this.id, player).damageMult * 1.2).toFixed(2);
                } else {
                    this.getWeapon(this.id, player).speedMult = (this.getWeapon(this.id, player).speedMult * 1.2).toFixed(2);
                }


            }
        }
    }
}

class Shop {
    constructor(items, player, texts) {

        this.selected = 0;
        this.height = 30;
        this.width = 0;

        this.items = items;
        this.texts = texts;
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
        for (var i = this.offSet; i < this.items.length && drawn < 10; i++) {



            ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, 0, drawn * this.height, this.width, this.height);
            ctx.fillText(this.items[i].name, (this.width - ctx.measureText(this.items[i].name).width) / 2, (drawn * this.height + this.height / 2));

            drawn++;
            //draw for the menu stuff;


            ctx.strokeRect(0, container.clientHeight / 2 + 50, container.clientWidth, container.clientHeight/2);
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
    //gets the correct message
    getMessage(id) {
        if (this.hasWeapon(id)) {
            return this.texts.shop.toUpgrade;;
        } else {
            if (this.canBuy(weapons.get(id).price)) {
                return this.texts.shop.canBuy.weapon.replace("%price%", weapons.get(id).price);
            } else {
                return this.texts.shop.noBuy.weapon.replace("%price%", weapons.get(id).price);
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
            case "action":
                //checks if the player has the weapon and if can buy
                if (!this.hasWeapon(this.items[this.selected + this.offSet].id)) {
                    if (!this.canBuy(weapons.get(this.items[this.selected + this.offSet].id).price)) {
                        return;
                    } else {
                        //buys the weapon for the player
                        if (!this.itemSelected) {
                            this.player.money -= weapons.get(this.items[this.selected + this.offSet].id).price;
                            this.player.weapons.push({ id: this.items[this.selected + this.offSet].id, damageMult: 1, speedMult: 1, equippedImpact: weapons.get(this.items[this.selected + this.offSet].id).impact, availableImpact: weapons.get(this.items[this.selected + this.offSet].id).impactUpgrades});
                        }
                    }
                    //handles the item upgrades
                } else if (this.itemSelected) {
                    this.items[this.selected + this.offSet].handlePurchase(this.player);
                }
                this.itemSelected = true;
                break;
            case "quit":
                //going back a menu
                if (this.itemSelected) {
                    if (this.items[this.selected + this.offSet].impactSelected) {
                        this.items[this.selected + this.offSet].impactSelected = false;
                    } else {
                        this.itemSelected = false;
                    }
                } else {
                    overWorld.inShop = false;
                    overWorld.onOverWorld = true;
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
//loads the shop
function loadShop(player, texts) {
    var items = [];
    for (var weapon of weapons.keys()) {
        var w = weapons.get(weapon);
        var options = {};
        options.name = w.name;
        options.damage = w.damage;
        options.speed = w.speed;
        options.impact = w.impact;
        options.id = weapon;

        items.push(new Item(options, player, texts));
    }
    return new Shop(items, player, texts);
}

class CharacterSelect {
    constructor(overWorld, characters, player, texts) {
        this.player = player;
        this.overWorldCharacter = overWorld;
        this.characters = characters;
        this.texts = texts;

        this.img = new Image();
        this.img.src = "../resources/TextBox.png";
        this.width = 0;
        this.height = 30;
        this.mainText = ["Character Select", "Armory"];
        this.selected = 0;
        this.statSelected = 1;
        this.offSet = 0;
        this.characterSelect = false;
        this.armory = false;
        this.weaponSelected = false;
        this.impactSelect = false;
    }

    openHouse() {
        var ctx = canvas.getContext("2d");
        ctx.font = "15px sans-serif";
        if (this.characterSelect) {
            this.openCharacters(ctx);
        } else if (this.armory) {
            this.openArmory(ctx);
        } else {
            this.mainMenu(ctx);
        }
    }
    //main menu for the house
    mainMenu(ctx) {

        for (var t of this.mainText) {
            this.width = Math.max(this.width, ctx.measureText(t).width + 10);
        }
        var offSet = - this.width - this.width / 2;
        for (var t of this.mainText) {
            ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, canvas.width / 2 + offSet, canvas.height / 2 - this.height, this.width, this.height);
            ctx.fillText(t, canvas.width / 2 + offSet + (this.width - ctx.measureText(t).width) / 2, canvas.height / 2 - this.height + this.height / 2);
            offSet += this.width * 2;
        }
        ctx.fillText("V", canvas.width / 2 - this.width + (this.selected * this.width * 2), canvas.height / 2 - this.height - this.height / 2);
    }
    //this is for selecting the characters
    openCharacters(ctx) {
        for (var char of this.characters) {
            this.width = Math.max(this.width, ctx.measureText(char.name).width + 10);
        }
        //drawing the boxes and the character names
        var offSet = - this.width - this.width / 2 - this.width / 4;
        for (var char of this.characters) {
            ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, canvas.width / 2 + offSet, canvas.height / 2 - this.height, this.width, this.height);
            ctx.fillText(char.name, canvas.width / 2 + offSet + (this.width - ctx.measureText(char.name).width) / 2, canvas.height / 2 - this.height + this.height / 2);
            offSet += this.width + this.width / 4;
            if (this.player.currentCharacter == char.Id && this.characters[this.selected].Id == char.Id) {
                ctx.fillText("Currently selected to play as.", 20, canvas.height / 2 + 100);

            }
        }
        //indicating which one is selected and making the description
        ctx.fillText("V", canvas.width / 2 - this.width - this.width / 2 + this.width / 4 + (this.selected * (this.width + this.width / 4)), canvas.height / 2 - this.height - this.height / 2);
        ctx.strokeRect(0, container.clientHeight / 2 + 50, container.clientWidth, container.clientHeight/2);
        wrapText(ctx, this.characters[this.selected].description, 20, container.clientHeight / 2 + 150, container.clientWidth - 40, 20);
    }

    openArmory(ctx) {
        var drawn = 0;
        for (var t of this.player.weapons) {
            var weapon = weapons.get(t.id);

            this.width = Math.max(this.width, ctx.measureText(weapon.name).width + 10);
        }
        for (var i = this.offSet; i < this.player.weapons.length && drawn < 10; i++) {
            var weapon = weapons.get(this.player.weapons[i].id);


            ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, 0, drawn * this.height, this.width, this.height);
            ctx.fillText(weapon.name, (this.width - ctx.measureText(weapon.name).width) / 2, (drawn * this.height + this.height / 2));

            drawn++;
        }
        if (!this.weaponSelected) {
            ctx.fillText("<-", this.width + 5, ((this.selected) * this.height + this.height / 2));
        } else {
            if (!this.impactSelect) {
                this.openWeaponStats(ctx);
            } else {
                this.openAvailableImpacts(ctx);
            }
        }
    }
    //for selecting the stats, mostly just overlooking what you have
    openWeaponStats(ctx) {
        for (var stats in this.player.weapons[this.selected]) {
            var text = stats + ": " + this.player.weapons[this.selected][stats];
            if (stats == "equippedImpact") {
                text = "Equipped Impact: " + this.player.weapons[this.selected][stats];
            }
            this.width = Math.max(this.width, ctx.measureText(text).width + 10);
        }
        var offSet = 0;
        for (var stats in this.player.weapons[this.selected]) {
            ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, this.width * 2, offSet * this.height, this.width, this.height);
            var text = stats + ": " + this.player.weapons[this.selected][stats];
            if (stats == "id") {
                text = "name: " + weapons.get(this.player.weapons[this.selected].id).name;
            }
            if (stats == "availableImpact") {
                text = "Available Impacts";
            }
            if (stats == "equippedImpact") {
                text = "Equipped Impact: " + this.player.weapons[this.selected][stats];
            }
            if (stats == "damageMult") {
                text = "Damage: " + this.player.weapons[this.selected][stats];
            }
            if (stats == "speedMult") {
                text = "Speed: " + this.player.weapons[this.selected][stats];
            }
            ctx.fillText(text, this.width * 2 + (this.width - ctx.measureText(text).width) / 2, (offSet * this.height + this.height / 2));
            offSet++;
        }
        var text = this.player.equipped.indexOf(this.player.weapons[this.selected].id) != -1 ? "Equipped in slot: " + (this.player.equipped.indexOf(this.player.weapons[this.selected].id) +1) : "Equip";
        ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, this.width * 2, offSet * this.height, this.width, this.height);
        ctx.fillText(text, this.width * 2 + (this.width - ctx.measureText(text).width) / 2, (offSet * this.height + this.height / 2));
        ctx.fillText("<-", this.width * 2 + this.width + 5, ((this.statSelected) * this.height + this.height / 2));

        ctx.strokeRect(0, container.clientHeight / 2 + 50, container.clientWidth, container.clientHeight/2);
        if (this.statSelected == 5 && this.player.equipped.indexOf(this.player.weapons[this.selected].id) == -1) {
            ctx.fillText("By equipping this weapon it will replace the weapon equipped in slot 1.", 20, container.clientHeight / 2 + 150);
        }
    }
    //for selecting which impact you want on a weapon
    openAvailableImpacts(ctx) {
        for (var t of this.player.weapons[this.selected].availableImpact) {
            this.width = Math.max(this.width, ctx.measureText(t).width + 10);
        }
        var offSet = 0;
        ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, this.width * 2, offSet * this.height, this.width, this.height);
        ctx.fillText(weapons.get(this.player.weapons[this.selected].id).name + " bullet impact", this.width * 2 + (this.width - ctx.measureText(weapons.get(this.player.weapons[this.selected].id).name + " bullet impact").width) / 2, (offSet * this.height + this.height / 2));
        for (var t of this.player.weapons[this.selected].availableImpact) {
            offSet++;
            ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, this.width * 2, offSet * this.height, this.width, this.height);
            ctx.fillText(t, this.width * 2 + (this.width - ctx.measureText(t).width) / 2, (offSet * this.height + this.height / 2));

        }
        ctx.fillText("<-", this.width * 2 + this.width + 5, ((this.statSelected) * this.height + this.height / 2));
        if (this.player.weapons[this.selected].equippedImpact == this.player.weapons[this.selected].availableImpact[this.statSelected - 1]) {
            ctx.fillText("You current have this impact equipped", 20, container.clientHeight / 2 + 100);
        }
        ctx.strokeRect(0, container.clientHeight / 2 + 50, container.clientWidth, container.clientHeight/2);
        ctx.fillText(this.getImpactMessage(this.player.weapons[this.selected].availableImpact[this.statSelected - 1]), 20, container.clientHeight / 2 + 150);

    }
    //gets the impact message
    getImpactMessage(impact) {
        return this.texts.impacts[impact];
    }


    navigate(type) {
        switch (type) {
            case "up":
                if (this.armory) {
                    this.setDirection(-1, this.weaponSelected);
                }
                break;
            case "down":
                if (this.armory) {
                    this.setDirection(1, this.weaponSelected);
                }
                break;
            case "left":
                if (!this.armory) {
                    this.setDirection(-1);
                }
                break;
            case "right":
                if (!this.armory) {
                    this.setDirection(1);
                }
                break;
            case "quit":
                this.selected = 0;
                if (this.characterSelect) {
                    this.characterSelect = false;
                } else if (this.armory) {
                    if (this.impactSelect) {
                        this.impactSelect = false;
                        this.statSelected = 4
                    } else if (this.weaponSelected) {
                        this.weaponSelected = false;
                    }else {
                        this.armory = false;
                    }
                } else {
                    overWorld.inCharacterSelect = false;
                    overWorld.onOverWorld = true;
                }
                break;
            case "action":
                if (this.characterSelect) {
                    this.player.currentCharacter = this.characters[this.selected].Id;
                } else if (this.armory) {
                    if (this.weaponSelected) {
                        //check for impact/equipping
                        if (this.impactSelect) {
                            this.player.weapons[this.selected].equippedImpact = this.player.weapons[this.selected].availableImpact[this.statSelected - 1];
                        } else if (Object.keys(this.player.weapons[this.selected])[this.statSelected] == "availableImpact") {
                            //do for impacts
                            this.statSelected = 1;
                            this.impactSelect = true;
                        } else if (this.player.weapons[this.selected][this.statSelected] == undefined) {
                            //do for equipping
                            if (this.player.equipped.indexOf(this.player.weapons[this.selected].id) == -1) {
                                this.player.equipped.push(this.player.weapons[this.selected].id);
                                this.player.equipped.splice(0, 1);
                            }
                        }
                    } else {
                        this.weaponSelected = true;
                        this.statSelected = 1;
                    }
                } else {
                    if (this.mainText[this.selected] == "Armory") {
                        this.armory = true;
                    } else {
                        this.characterSelect = true;
                    }
                    this.selected = 0;
                }
                break;
        }
    }

    setDirection(d, stat) {
        var limit = 1;
        var min = 0;
        if (this.weaponSelected) {
            min = 1;
        }


        if (this.impactSelect) {
            limit = this.player.weapons[this.selected].availableImpact.length - 1;
        }

        if (this.characterSelect) {
            limit = this.characters.length - 1;
        } else if (this.armory) {
            if (this.impactSelect) {
                limit = this.player.weapons[this.selected].availableImpact.length;
            } else if (stat) {
                limit = 5;
            } else {
                limit = this.player.weapons.length - 1;
            }
        }

        if ((!stat && (this.selected + d > limit || this.selected + d < min)) || (stat && (this.statSelected + d > limit || this.statSelected + d < min))) {
            return
        }
        if (stat) {
            this.statSelected += d;
        } else {

            this.selected += d;
            if (this.armory && !this.weaponSelected) {
                if (this.selected > 9) {
                    this.offSet++;
                    this.selected = 9;
                } else if (this.selected < 0) {
                    this.offSet--;
                    this.selected = 0;
                }
            }
        }
    }



    //gets the right overworld character
    getOverWorldCharacter() {
        for (var ov of this.overWorldCharacter) {
            if (ov.id == this.player.currentCharacter) {
                return ov;
            }
        }
        return null;
    }

    //gets the right character for playing the level
    getCharacter() {
        for (var ch of this.characters) {
            if (ch.Id == this.player.currentCharacter) {
                return ch;
            }
        }
        return null;
    }

}
