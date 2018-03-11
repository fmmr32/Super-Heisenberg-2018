﻿class Achievement {
    constructor(file, level) {
        this.level = level;
        for (var any of Object.keys(file)) {
            this[any] = file[any];
        }
        //making the body for the funtion
        var body = "if(this.level.getPlayer() != undefined && this.level.getPlayer().hasAchievement(this.id)){";
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
        image.src = "../resources/achievementBar.png";
        image.color = "white";
        var text = ["ACHIEVEMENT GOT", this.text];
        var duration = 2;
        var position = "top";
        var size = 15;
        this.level.popUps.push(new PopUp(image, text, duration, position, size));
    }

}


class PopUp {
    constructor(image, text, duration, position, size, maxHeight) {
        this.image = image;

        this.position = position;
        this.maxWidth = container.clientWidth / (position == "top" ? 4 : 2);
        this.maxHeight = maxHeight;
        this.text = text;
        this.duration = duration;

        this.x = (container.clientWidth - this.maxWidth) / 2;
        this.y;

        if (position == "top") {
            this.y = 0;
        } else if (position == "bottom") {
            this.y = container.clientHeight;
        } else {
            this.y = container.clientHeight;
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
                map.popUps.splice(popUps.indexOf(this), 1);
            }
        }
    }

    doDialog() {
        if (this.index < this.text.length) {
            var ctx = canvas.getContext("2d");
            ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.x - this.image.width / 4, this.y - this.size, this.image.width, this.image.height);
            ctx.font = this.size + "px sans-serif";
            this.r = Math.max(this.r, wrapText(ctx, this.text[this.index], this.x + 5, this.y + 25, this.maxWidth, this.size));
            ctx.font = '10px sans-serif';
        } else {
            //destroy and go into level..
            canvas.remove();
            var start = map.startDialog == -1;
            map.reload();
            if (!start) {
                map.startDialog = -1;
                map.doingDialog = false;
            } else {
                //go to overworld
                map.toOverWorld();                
            }
        }
    }








}

class Dialog {
    constructor(id, text, size, bar, main, second, player) {
        this.main = main;
        this.secondary = second;
        this.r = 1;
        this.maxWidth = container.clientWidth / 2;
        this.size = size;
        this.player = player;
        this.id = id;

        var tempc = create('canvas', 'diag', 0, 0, container.clientWidth, container.clientHeight);
        for (var t of text) {
            this.r = Math.max(this.r, wrapText(tempc.getContext("2d"), t, 0, 0, this.maxWidth, 15));
        }
        this.maxHeight = this.size * (this.r + 1) + 20;

        tempc.getContext("2d").clearRect(0, 0, container.clientWidth, container.clientHeight);
        tempc.remove();

        if (main != undefined) {
            tempc = create('canvas', 'diag', 0, 0, container.clientWidth, container.clientHeight);

            this.image = new Image();
            this.image.src = tempc.toDataURL("image/png");
            this.popUp = new PopUp(this.image, text, 0, "b", this.size, this.maxHeight);
            this.popUp.index = 0;

            var popUp = this.popUp;
            var image = this.image;
            var size = this.size;
            var r = this.r;
            bar.onload = function () {
                tempc.getContext("2d").drawImage(bar, 0, 0, bar.width, bar.height, bar.posX, ((this.y + this.height) - (main.y + main.height)) / 2, bar.maxWidth, bar.maxHeight);
                image = new Image();
                image.src = tempc.toDataURL("image/png");
                popUp.image = image;

                if (main.complete && second.complete) {
                    tempc.remove();
                }

            }
            main.onload = function () {
                tempc.getContext("2d").drawImage(main, 0, 0, main.width, main.height, bar.posX - main.width / 2 - 20, 0, main.width, main.height);
                image = new Image();
                image.src = tempc.toDataURL("image/png");
                popUp.image = image;

                if (bar.complete && second.complete) {
                    tempc.remove();
                }
            }
            second.onload = function () {
                tempc.getContext("2d").drawImage(second, 0, 0, second.width, second.height, bar.posX + bar.maxWidth - second.width / 2 + 20, 0, second.width, second.height);
                image = new Image();
                image.src = tempc.toDataURL("image/png");
                popUp.image = image;

                if (main.complete && bar.complete) {
                    tempc.remove();
                }
            }

        }
    }



    nextText() {
        this.popUp.index++;


    }

    doDialog() {
        this.popUp.doDialog(this.player);
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
    loadJSONFile(function (response) {
        for (var any of JSON.parse(response)) {
            var temp = new Dialog(any.id, any.text, 15);

            var imgBar = Dialog.loadImage("TextBox", { maxWidth: temp.maxWidth, maxHeight: temp.maxHeight, posX: ((container.clientWidth - temp.maxWidth) / 2) });
            var imgMain = Dialog.loadImage(any.main);
            var imgSecond = Dialog.loadImage(any.second);

            diag[any.id] = new Dialog(any.id, any.text, temp.size, imgBar, imgMain, imgSecond, player);
        }
    }, "/client/resources/dialogs.json");
}


function wrapText(ctx, text, x, y, maxWidth, lineHeigth) {
    var rows = 1;
    var words = text.split(' ');
    var l = '';
    //looping through the words
    try {
        for (var i = 0; i < words.length; i++) {
            var temp = l + words[i] + ' ';
            //check if the maxWidth is reached           
            if (ctx.measureText(temp).width > maxWidth && i > 0) {
                ctx.fillText(l, x, y);
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
