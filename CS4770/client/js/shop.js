class Item {
    constructor(options) {
        for (var obj of Object.keys(options)) {
            this[obj] = options[obj];
        }
        this.width = 0;
        this.selected = 1;
    }
    //gui stuff for the item store
    drawItem(ctx, img, width, height, player) {
        
        for (var obj of Object.keys(this)) {
            this.width = Math.max(this.width, canvas.getContext("2d").measureText(obj + ": " + this[obj]).width + 10);
        }


        var offSet = 0;
        for (var obj in this) {
            if (obj != "selected" && obj != "width" && obj != "id") {
                ctx.drawImage(img, 0, 0, img.width, img.height, width * 2, offSet * height, this.width, height);
                var text = obj + ": " + this[obj];
                ctx.fillText(text, width * 2 + (this.width - ctx.measureText(text).width) / 2, ((offSet) * height + height / 2));
                ctx.fillText("<-", width * 2 + this.width + 5, ((this.selected) * height + height / 2));
                offSet++;
            }
        }
        ctx.fillText("Your " + Object.keys(this)[this.selected] + " is: " + this[Object.keys(this)[this.selected]], 20, container.clientHeight / 2 + 150);
        if (Object.keys(this)[this.selected] != "impact") {
            var value = this[Object.keys(this)[this.selected]]
            ctx.fillText(this.getMessage(value, player), 20, container.clientHeight / 2 + 200);
        }

    }
    getMessage(value, player) {
            if (this.canBuy(value*1.2*3, player)) {
                return "You can upgrade this to " + value * 1.2 + " for " + value * 1.2 * 3 + " bitcoins";
            } else {
                return "It seems you don't have enough to upgrade this, this upgrade costs " + value * 1.2*3 + " bitcoins.";
            }
    }

    canBuy(value, player) {
        if (player.money >= value) {
            return true;
        } else {
            return false;
        }
    }


    setSelectItem(d) {
            if (this.selected + d >= Object.keys(this).length-3 || this.selected + d < 1) {
                return false;
            }
            this.selected += d;
    }
}

class Shop {
    constructor(items, player) {

        this.selected = 0;
        this.height = 30;
        this.width = 0;

        this.items = items;

        this.player = JSON.parse(player);
        this.img = new Image();
        this.img.src = "../resources/TextBox.png";

        this.offSet = 0;
        this.itemSelected = false;
        this.inShop = false;
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
            this.items[this.selected].setSelectItem(d);
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
                        this.player.money -= weapons.get(this.items[this.selected + this.offSet].id).price;
                        this.player.weapons.push({ id: this.items[this.selected + this.offSet].id, damageMult: 1, speedMult: 1, impact: "die" });
                    }
                }
                this.itemSelected = true;
                break;
            case "left":
                if (this.itemSelected) {
                    this.itemSelected = false;
                } else {
                    this.inShop = false;
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
    while (items.length < 12) {
        for (var weapon of weapons.keys()) {
            var w = weapons.get(weapon);
            var options = {};
            options.name = w.name;
            options.damage = w.damage;
            options.speed = w.speed;
            options.impact = w.impact;
            options.id = weapon;

            items.push(new Item(options));
        }
    }
    var shop = new Shop(items, player);
    return shop
}