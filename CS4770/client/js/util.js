class Achievement {
    constructor(file, level) {
        this.level = level;
        for (var any of Object.keys(file)) {
            this[any] = file[any];
        }
        //making the body for the funtion
        var body = "if(map.getPlayer() != undefined && map.getPlayer().hasAchievement(this.id)){";
        for (var b of this.function.body) {
            body += b;
        }
        body += "}";
        //replacacing the value for a function
        this.function = new Function(this.function.arguments, body);
        this.image;
    }
    //making a popup
    constructPopUp() {
        var image = new Image();
        image.src = "../resources/menus/achievementBar.png";
        image.color = "white";
        var text = ["ACHIEVEMENT GOT", this.text];
        var duration = 2;
        var position = "top";
        var size = 15;
        map.popUps.push(new PopUp(image, text, duration, position, size));
    }

}

function loadAchievements() {
    var ach = [];
    loadJSONFile(function (response) {
        for (var ac of JSON.parse(response)) {
            var a = new Achievement(ac, map);
            document.addEventListener(a.type, function (e) {
                for (var a of ach[e.type]) {
                    a.function();
                }
            });
            if (ach[a.type] == undefined) {
                ach[a.type] = [];
            }
            ach[a.type].push(a);
        }
    }, "/client/resources/jsons/achievements.json");

    return ach;
}


class PopUp {
    constructor(image, text, duration, position, size, maxHeight) {
        this.image = image;

        this.position = position;
        this.maxWidth = canvas.width / (position == "top" ? 4 : 2);
        this.maxHeight = maxHeight;
        this.text = text;
        this.duration = duration;

        this.x = (canvas.width - this.maxWidth) / 2;
        this.y;
        if (position == "top") {
            this.y = 0;
        } else if (position == "bottom") {
            this.y = canvas.height - maxHeight;
        } else {
            this.y = canvas.height;
        }



        this.size = size;
        this.tick = 0;
        this.traveling = true;
        this.finished = false;

        this.r = 1;
    }

    doPopUp() {
        if (this.image.complete) {
            if (!this.finished) {
                if (this.traveling) {
                    if (this.tick < this.duration) {
                        //for traveling to
                        if (this.position == "top") {
                            this.y += 5;
                            if (this.y >= this.image.height) {
                                this.traveling = false;
                            }
                        } else {
                            this.y -= 5;
                            if (this.y < container.clientHeight - (this.size * (this.r + 1) + 10)) {
                                this.traveling = false;
                            }
                        }
                    } else {
                        //for traveling back
                        if (this.position == "top") {
                            this.y -= 5;
                            if (this.y < 0) {
                                this.traveling = false;
                                this.finished = true;
                            }
                        } else {
                            this.y += 5;
                            if (this.y > container.clientHeight) {
                                this.traveling = false;
                                this.finished = true;
                            }
                        }
                    }
                } else {
                    this.tick += 1 / 60;
                    if (this.tick >= this.duration) {
                        this.traveling = true;
                    }
                }

                var ctx = canvas.getContext("2d");
                ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.x, this.y, this.maxWidth, this.size * (this.r + 1) + 10);

                //draws the text of the popup
                var offSetY = 5;
                for (var text of this.text) {
                    ctx.fillStyle = this.image.color;
                    ctx.font = this.size + 'px sans-serif';
                    this.r = Math.max(this.r, wrapText(ctx, text, this.x, this.y + this.image.height / 2 + offSetY, this.maxWidth, this.size));
                    ctx.font = '10px sans-serif';
                    ctx.fillStyle = "black";
                    offSetY += this.size;
                }
            } else {
                map.popUps.splice(map.popUps.indexOf(this), 1);
            }
        }
    }

    doDialog(img, diag, type) {
        if (this.index < this.text.length) {
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, img.width, img.height, this.x, this.y - this.size, img.width, img.height);
            ctx.font = this.size + "px sans-serif";
            var offSet = 5;
            if (this.text[this.index].includes("%main%")) {
                var main = diag.main == -1 ? overWorld.characters.getCharacter().Id : diag.main;
                offSet += diag.info[main].width;
            }
            wrapText(ctx, this.text[this.index].replace("%player%", overWorld.characters.getCharacter().name).replace("%main%", "").replace("%second%", ""), this.x + offSet, this.y + 25, this.maxWidth / 2, this.size);
            ctx.font = '10px sans-serif';
        } else {
            //destroy and go into level..
            this.index = 0;
            overWorld.doingDialog = false;
            var start = overWorld.startDialog;

            if (type instanceof Level && !(type instanceof Museum)) {
                type.reload();
                canvas.remove();
            }
        }
    }








}

class Dialog {
    constructor(id, text, size, player, bar, img, main, second, info) {

        this.img = img;
        this.bar = bar;
        this.main = main;
        this.second = second;
        this.info = info;
        this.text = text;

        this.r = 1;
        this.maxWidth = container.clientWidth / 2;
        this.size = size;
        this.player = player;
        this.id = id;


        this.images = [];
        this.loadImages();
    }

    loadImages() {
        this.images = Dialog.loadImages(this.text, this.main, this.second, this.info, this.bar, this.img);
        this.popUp = new PopUp(this.bar, this.text, 0, "bottom", 15, 100);
        this.popUp.index = 0;
    }

    static loadImages(text, main, second, info, bar, img) {
        var images = [];
        main = main == -1 ? overWorld.characters.getCharacter().Id : main;
        second = second == -1 ? overWorld.characters.getCharacter().Id : second;

        var maxWidth = canvas.width / 2;
        var maxHeight = Math.max(info[main].height + 10, info[second].height + 10);
        var index = 0;
        //loads the different images per text line
        for (var t of text) {

            var tc = create("canvas", "diag", 0, 0, maxWidth, maxHeight);
            var ctx = tc.getContext("2d");
            var rows = wrapText(ctx, t, 0, 0, maxWidth / 2, 10, true);
            if (t.includes("%second%")) {
                var height = Math.max(info[second].height, maxHeight);

                ctx.drawImage(bar, 0, 0, maxWidth / 2, height + 10, 0, 0, maxWidth / 2, height + 10);
                ctx.drawImage(img, info[second].startX, info[second].startY, info[second].width, info[second].height, maxWidth / 2, 0, info[second].width, info[second].height);
            } else {
                var height = Math.max(info[main].height, maxHeight);
                ctx.drawImage(bar, 0, 0, maxWidth / 2, height + 10, info[main].width, 0, maxWidth / 2, height + 10);
                ctx.drawImage(img, info[main].startX, info[main].startY, info[main].width, info[main].height, 0, 0, info[main].width, info[main].height);
            }
            var i = new Image();
            i.src = ctx.canvas.toDataURL("image/png");
            images.push(i);
            tc.remove();
        }
        return images;
    }


    nextText() {
        this.popUp.index++;
    }

    doDialog() {
        this.popUp.doDialog(this.images[this.popUp.index], this, overWorld.type);
    }

    static loadImage(name, options) {
        var img = new Image();
        img.src = "../resources/" + name + ".png";
        if (options != undefined) {
            for (var k of Object.keys(options)) {
                img[k] = options[k];
            }
        }
        return img;
    }
}


function loadDialog(player) {
    var diag = [];
    loadJSONFile(function (response) {
        var r = JSON.parse(response);
        var info = [];
        var img = new Image();
        img.src = "../resources/spriteSheets/dialogs.png";
        img.onload = function () {

            for (var char of r.characters) {
                info[char.id] = char;
            }


            for (var any of JSON.parse(response).story) {
                var imgBar = Dialog.loadImage("menus/TextBox");
                diag[any.id] = new Dialog(any.id, any.text, 15, player, imgBar, img, any.main, any.second, info);
            }
        }

    }, "/client/resources/jsons/dialogs.json");
    return diag;
}


function wrapText(ctx, text, x, y, maxWidth, lineHeigth, noDraw) {
    if (noDraw == undefined) {
        noDraw = false;
    }
    var rows = 1;
    var words = text.split(' ');
    var l = '';
    //looping through the words
    try {
        for (var i = 0; i < words.length; i++) {
            var temp = l + words[i] + ' ';
            //check if the maxWidth is reached           
            if (ctx.measureText(temp).width > maxWidth && i > 0) {
                if (!noDraw) {
                    ctx.fillText(l, x, y);
                }
                l = words[i] + ' ';
                y += lineHeigth;
                rows++;
            } else {
                l = temp;
            }
        }
        //finishing up
        ctx.fillText(l, x, y);
    } catch (err) {
        console.log(err);
    }
    return rows;
}


class ExitMenu {
    constructor(world) {
        this.image = new Image();
        this.image.src = "../resources/menus/TextBox.png";

        this.select = 0;
        this.options = ["Resume", "Exit"];
        this.width = 100;
        this.height = 30;

        this.world = world;

    }
    resetStyle(ctx) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = "black";
        ctx.font = "15px sans-serif";
    }

    menu() {
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.font = "15px sans-serif";
        for (var o of this.options) {
            this.width = Math.max(this.width, ctx.measureText(o).width + 10);
        }

        ctx.globalAlpha = 0.6;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, container.clientWidth, container.clientHeight);
        this.resetStyle(ctx);

        var offSet = 0;
        for (var o of this.options) {
            ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, container.clientWidth / 2 - this.width / 2, container.clientHeight / 2 - this.height * 3 + this.height * offSet, this.width, this.height);
            ctx.fillText(o, container.clientWidth / 2 - ctx.measureText(o).width / 2, container.clientHeight / 2 - this.height * 2 - 15 + this.height * offSet);
            offSet += 2;
        }
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = "white";
        ctx.fillRect(container.clientWidth / 2 - this.width / 2, container.clientHeight / 2 - this.height * 3 + this.height * this.select * 2, this.width, this.height);
        this.resetStyle(ctx);
    }



    navigate(type) {
        switch (type) {
            case "up":
                this.setSelect(-1);
                break;
            case "down":
                this.setSelect(1);
                break;
            case "action":
                switch (this.options[this.select]) {
                    case "Resume":
                        this.world.inExitMenu = false;
                        this.select = 0;
                        break;
                    case "Exit":
                        //go back to the main menu
                        loaded = false;
                        this.world.onOverWorld = true;
                        this.world.inShop = false;
                        this.world.inCharacterSelect = false;
                        this.world.inMuseum = false;
                        this.world.inExitMenu = false;
                        this.world.getPlayer().setX(overWorld.startX)
                        this.world.getPlayer().setY(overWorld.startY);
                        this.world.bg = 0;
                        this.world.music.stop();
                        this.select = 0;
                        back();
                        break;

                }
                break;
            case "quit":
                this.world.inExitMenu = false;
                break;
        }
    }

    setSelect(d) {
        if (this.select + d > 1 || this.select + d < 0) {
            return
        }
        this.select += d;
    }

}

class SoundManager {
    constructor(sound, type) {
        this.sound = new Audio(sound);
        this.sound.preload = 'auto';
        this.players = [];
        var v = 100;
        switch (type) {
            case "music":
                //get this value from the music volume settings
                this.sound.volume = v / 100;
                this.setLoop(true);
                break;
            case "game":
                //get this value from the game volume settings
                this.sound.volume = v / 100;
                break;
        }

    }

    setVolume(volume) {
        this.sound.volume = volume / 100;
    }

    setLoop(loop) {
        this.sound.loop = loop;
    }

    play() {
        var temp = this.sound.cloneNode();
        temp.play();
        var obj = this;
        if (!this.sound.loop) {
            temp.addEventListener("ended", function () {
                obj.players.splice(obj.players.indexOf(temp), 1);
            })
        }

        this.players.push(temp);
    }

    stop() {
        for (var t of this.players) {
            t.pause();
            t.currentTime = 0;
        }
    }
}