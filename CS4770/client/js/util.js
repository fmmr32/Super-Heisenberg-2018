class Achievement {
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

    constructPopUp() {
        var image = new Image();
        image.src = "../resources/achievementBar.png";
        image.color = "white";
        var text = ["ACHIEVEMENT GOT", this.text];
        var duration = 2;
        var position = "top";

        popUps.push(new PopUp(image, text, duration, position));
    }

}


class PopUp {
    constructor(image, text, duration, position) {
        this.image = image;
        this.text = text;
        this.duration = duration;
        this.position = position;
        this.x = (container.clientWidth - (canvas.getContext("2d").measureText(this.text).width + 10))/2;
        this.y = position == "top" ? 0 : container.clientHeight;

        this.tick = 0;
        this.traveling = true;
        this.finished = false;
    }

    doPopUp() {
        if (this.image.complete) {
            if (!this.finished) {
                if (this.traveling) {
                    if (this.tick < this.duration) {
                        if (this.position == "top") {
                            this.y += 5;
                            if (this.y >= this.image.height) {
                                this.traveling = false;
                            }
                        } else {
                            this.y -= 5;
                            if (this.y < container.clientHeight - this.image.height) {
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
                ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.x, this.y, ctx.measureText(this.text).width + 10, this.image.height);
              
                var yOffSet = 0;
                for (var text of this.text) {
                    ctx.fillStyle = this.image.color;
                    ctx.fillText(text, this.x + 2, this.y + this.image.height / 2 + yOffSet);
                    yOffSet += 10;
                }
            } else {
                popUps.splice(popUps.indexOf(this), 1);
            }
        }
    }


}

