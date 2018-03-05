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
    //making a popup
    constructPopUp() {
        var image = new Image();
        image.src = "../resources/achievementBar.png";
        image.color = "white";
        var text = ["ACHIEVEMENT GOT", this.text];
        var duration = 2;
        var position = "top";
        var size = 15;
        popUps.push(new PopUp(image, text, duration, position, size));
    }

}


class PopUp {
    constructor(image, text, duration, position, size) {
        this.image = image;

        this.position = position;
        this.maxWidth = container.clientWidth / (position == "top" ? 4 : 2);

        this.text = text;
        this.duration = duration;
        
        this.x = (container.clientWidth - this.maxWidth) / 2;
        this.y = position == "top" ? 0 : container.clientHeight;

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
                            if (this.y < container.clientHeight - (this.size * (this.r+1) + 10)) {
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
                ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.x, this.y, this.maxWidth, this.size * (this.r+1) + 10);
                
                //draws the text of the popup
                var offSetY = 5;
                for (var text of this.text) {
                    ctx.fillStyle = this.image.color;
                    //ctx.font = this.size + 'px sans-serif';
                    this.r = Math.max(this.r, this.wrapText(ctx, text, this.x, this.y + this.image.height / 2 + offSetY, this.maxWidth, this.size));
                    offSetY += this.size;
                }
            } else {
                popUps.splice(popUps.indexOf(this), 1);
            }
        }
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeigth) {
        var rows = 1;
        var words = text.split(' ');
        var l = '';
        //looping through the words
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
        return rows;
    }
    

}

