
class Editor {
    constructor(canvas) {
        this.canvas = canvas

        this.p = 0;		//offset
        this.cw = 32;	//cell width
        this.ch = 32;	//cell height
        this.bw = canvas.width;
        this.bh = canvas.height;



        this.selection = 1000;
        this.editor = null;
        //Selection var for tile placement.
        this.mouseClicked = false;   //Var for mouse listeners
        this.move = null;
        this.mouseReleased = true;
        this.mouseLeft = false;
        this.mouseRight = false;
        this.img = new Image();
        this.img.src = 'gameTile.png';
        this.elem = "Content";
        this.id = JSON.stringify(window.performance.now());
        this.userName = getUsername();
        this.date = this.getDate();
        this.levelName = "";
        this.map = {};

        this.select = [];

        this.oldName = "";

        document.addEventListener("mousemove", this.onMouseMove, false);



        var editor = this;
        this.canvas.addEventListener("mousedown", function (e) {
            if (e.which == 1) {
                editor.mouseLeft = true
                editor.placeTile();
            }

            else if (e.which == 3) {
                editor.mouseRight = true;
                editor.removeTile();
            }



            window.addEventListener("mouseup", function (e) {
                switch (e.which) {
                    case 1:
                        editor.mouseLeft = false;
                        break;

                    case 2:
                        editor.updateSpawn();
                        break;

                    case 3:
                        editor.mouseRight = false;
                        break;
                }
            }, false);


        }, false);

        this.setup();
    }

    resizeImage(image, canvas, t) {
        if ((image.width < canvas.width || image.width < this.map.width) && t < 50) {
            //create temp canvas that is twice the size of the current image
            var c = document.createElement("canvas");
            c.width = image.width * 2;
            c.height = image.height;
            var ctx = c.getContext("2d");
            //drawing the image
            ctx.drawImage(image, 0, 0);
            ctx.drawImage(image, image.width, 0);
            image = new Image();
            image.src = c.toDataURL("image/png");
            var obj = this;
            image.onload = function () {
                //recursive step
                obj.resizeImage(this, canvas, t++);
            };
        }
        return image;
    }

    drawBoard() {
        //grid square width
        var context = this.canvas.getContext("2d");


        for (var x = 0; x <= this.bw; x += this.cw) {
            context.moveTo(0.5 + x + this.p, this.p);
            context.lineTo(0.5 + x + this.p, this.bh + this.p);
        }

        //grid square height
        for (var x = 0; x <= this.bh; x += this.ch) {
            context.moveTo(this.p, 0.5 + x + this.p);
            context.lineTo(this.bw + this.p, 0.5 + x + this.p);
        }
        context.strokeStyle = "black";
        context.stroke();
    }

    setUpDocument() {
        var editor = this;

        document.getElementById("selectTiles").onclick = function () {
            editor.elem = "Content";
            document.getElementById("creature").style.display = "none";
            document.getElementById("entity").style.display = "none";
            document.getElementById("tiles").style.display = "inline-block";

        }

        document.getElementById("selectCreature").onclick = function () {
            editor.elem = "Creature";
            document.getElementById("entity").style.display = "none";
            document.getElementById("tiles").style.display = "none";
            document.getElementById("creature").style.display = "inline-block";

        }

        document.getElementById("selectEntity").onclick = function () {
            editor.elem = "Entities";
            document.getElementById("creature").style.display = "none";
            document.getElementById("tiles").style.display = "none";
            document.getElementById("entity").style.display = "inline-block";
        }


        document.getElementById("levelName").onchange = function () {
            var name = document.getElementById("levelName").value;
            editor.levelName = name;
            editor.map.levelName = name;
        }

        document.getElementById("mapW").onchange = function () {
            var w = document.getElementById("mapW").value;
            if (w < 30000) {
                editor.bw = w;
                editor.canvas.width = w;
                editor.drawBoard();
                editor.map.width = w;
                editor.draw(this.map);
            }
            else {
                alert("Please select a value below 30,000 for the width of the map");
            }
        }

        document.getElementById("mapH").onchange = function () {
            var h = document.getElementById("mapH").value;
            if (h < 5000) {
                editor.bh = h;
                editor.canvas.height = h;
                editor.drawBoard();
                editor.map.height = h;
                editor.draw(this.map);
            }
            else {
                alert("Please select a value below 5000 for the height of the map");
            }
        }

        document.getElementById("Y").onchange = function () {
            var ycoord = document.getElementById("Y").value;
            var y = parseInt(ycoord);
            editor.map.spawnY = y;
        }

        document.getElementById("X").onchange = function () {
            var xcoord = document.getElementById("X").value;
            var x = parseInt(xcoord);
            editor.map.spawnX = x;
        }

        document.getElementById("Overwrite").onclick = function () {
            if (editor.oldName != editor.levelName) {
                editor.levelName = editor.oldName;
            }
            document.getElementById("editor").style.display = "none";
            document.getElementById("gameDiv").style.display = "table-cell";
            overWorld.isTestAndSave = true;
            overWorld.toMapFromDB(elemt.map);

        }

        document.getElementById("Save").onclick = function () {
            loadDBFromQuery({ levelName: editor.levelName, user: getUsername() }, "level", function (reponse) {
                if (reponse.length == 0) {
                    editor.map._id = JSON.stringify(window.performance.now());
                    editor.map.id = JSON.stringify(window.performance.now());



                    document.getElementById("editor").style.display = "none";
                    document.getElementById("gameDiv").style.display = "table-cell";
                    overWorld.isTestAndSave = true;
                    overWorld.toMapFromDB(elemt.map);

                }
                else {
                    alert("New level must have a different name than any levels you've published previously.")
                }
            });
        }


            document.getElementById("LoadLevel").onclick = function () {
            document.getElementById("levelBrowser").style.display = "table-cell";
            document.getElementById("selectionBox").selectedIndex = 0;
            document.getElementById("selectionBoxDiv").style.display = "none";
            document.getElementById("levelEditorOptions").style.display = "none";

            editor.loadLevelsForEditor({ user: getUsername }, "level");

        }

        //this adds the movesets to a creature
        document.getElementById("MoveSetsDropdown").onchange = function () {
            if (elemt.select[0] != "interacts") {
                elemt.map[elemt.select[0]][elemt.select[1]].moveSet = parseInt(this.value);
            } else {
                elemt.map.interacts[elemt.select[1]].action[elemt.select[3]].moveSet = parseInt(this.value);
            }
        }

        document.getElementById("Lut").onchange = function () {
            if (elemt.select[0] != "interacts") {
                elemt.map.creatures[elemt.select[1]].loot = parseInt(this.value);
            } else {
                elemt.map.interacts[elemt.select[1]].action[elemt.select[3]].loot = parseInt(this.value);
            }
        }

        document.getElementById("entAmount").onchange = function () {
            if (elemt.select[0] != "interacts") {
                elemt.map[elemt.select[0]][elemt.select[1]].amount = parseInt(this.value);
            } else {
                elemt.map.interacts[elemt.select[1]].action[elemt.select[3]].amount = parseInt(this.value);
            }
        }
        //for the damage
        document.getElementById("damAmount").onchange = function () {
            if (elemt.select[0] != "interacts") {
                elemt.map[elemt.select[0]][elemt.select[1]].damage = parseInt(this.value);
            } else {
                elemt.map.interacts[elemt.select[1]].action[elemt.select[3]].damage = parseInt(this.value);
            }
        }

        document.getElementById("Ricochet").onchange = function () {
            //checks if we are doing something with the interacts
            if (elemt.select[0] != "interacts") {
                var m = elemt.hasMeta("ricochet", elemt.map[elemt.select[0]][elemt.select[1]]);
                if (m != -1) {
                    elemt.map[elemt.select[0]][elemt.select[1]].meta[m] = { "ricochet": this.checked };
                } else {
                    elemt.map[elemt.select[0]][elemt.select[1]].meta.push({ "ricochet": this.checked });
                }
                //sets the ineract action for elemt block
            } else {
                var block;
                if (elemt.select[3] instanceof Array) {
                    block = elemt.map.content[elemt.select[3][1]];
                } else {
                    var thing = elemt.hasMeta(type, elemt.map.interacts[elemt.select[1]].action[elemt.select[3]])
                    if (thing != -1) {
                        elemt.map.interacts[elemt.select[1]].action[elemt.select[3]].meta[thing]["ricochet"] = this.checked;
                    } else {
                        elemt.map.interacts[elemt.select[1]].action[elemt.select[3]].meta.push({ "ricochet": this.checked });
                    }
                    return;
                }
                var options = {};
                options.x = block.blockX;
                options.y = block.blockY;
                options.type = "meta";
                options.meta = { "ricochet": elemt.this.checked };
                options.id = block.blockId;
                getSprite(1003).drawBackground(block.blockX, block.blockY, elemt.canvas, elemt.cw, elemt.hw);
                elemt.map.interacts[elemt.select[1]].action.push(options);
            }
        }

        document.getElementById("Ice").onchange = function () {
            //checks if we are doing something with the interacts
            if (elemt.select[0] != "interacts") {
                var m = elemt.hasMeta("ice", elemt.map[elemt.select[0]][elemt.select[1]]);
                if (m != -1) {
                    elemt.map[elemt.select[0]][elemt.select[1]].meta[m] = { "ice": this.checked };
                } else {
                    elemt.map[elemt.select[0]][elemt.select[1]].meta.push({ "ice": this.checked });
                }
                //sets the ineract action for elemt block
            } else {
                var block;
                if (elemt.select[3] instanceof Array) {
                    block = elemt.map.content[elemt.select[3][1]];
                } else {
                    var thing = elemt.hasMeta(type, elemt.map.interacts[elemt.select[1]].action[elemt.select[3]])
                    if (thing != -1) {
                        elemt.map.interacts[elemt.select[1]].action[elemt.select[3]].meta[thing]["ice"] = this.checked;
                    } else {
                        elemt.map.interacts[elemt.select[1]].action[elemt.select[3]].meta.push({ "ice": this.checked });
                    }
                    return;
                }
                var options = {};
                options.x = block.blockX;
                options.y = block.blockY;
                options.type = "meta";
                options.meta = { "ice": elemt.this.checked };
                options.id = block.blockId;
                getSprite(1003).drawBackground(block.blockX, block.blockY, elemt.canvas, elemt.cw, elemt.hw);
                elemt.map.interacts[elemt.select[1]].action.push(options);
            }
        }

        document.getElementById("PassThrough").onchange = function () {
            //checks if we are doing something with the interacts
            if (elemt.select[0] != "interacts") {
                var m = elemt.hasMeta("passThrough", elemt.map[elemt.select[0]][elemt.select[1]]);
                if (m != -1) {
                    elemt.map[elemt.select[0]][elemt.select[1]].meta[m] = { "passThrough": this.checked };
                } else {
                    elemt.map[elemt.select[0]][elemt.select[1]].meta.push({ "passThrough": this.checked });
                }
                //sets the ineract action for elemt block
            } else {
                var block;
                if (elemt.select[3] instanceof Array) {
                    block = elemt.map.content[elemt.select[3][1]];
                } else {
                    var thing = elemt.hasMeta(type, elemt.map.interacts[elemt.select[1]].action[elemt.select[3]])
                    if (thing != -1) {
                        elemt.map.interacts[elemt.select[1]].action[elemt.select[3]].meta[thing]["passThrough"] = this.checked;
                    } else {
                        elemt.map.interacts[elemt.select[1]].action[elemt.select[3]].meta.push({ "passThrough": this.checked });
                    }
                    return;
                }
                var options = {};
                options.x = block.blockX;
                options.y = block.blockY;
                options.type = "meta";
                options.meta = { "passThrough": this.checked };
                options.id = block.blockId;
                getSprite(1003).drawBackground(block.blockX, block.blockY, elemt.canvas, elemt.cw, elemt.hw);
                elemt.map.interacts[elemt.select[1]].action.push(options);
            }
        }



        document.getElementById("InteractType").onchange = function () {
            elemt.select[2] = this.value;
            if (this.value == "damage") {
                elemt.map.interacts[elemt.select[1]].action.push({ "type": "damage", "damage": 1 });
                elemt.select[3] = elemt.map.interacts[elemt.select[1]].action.length - 1;
                elemt.showDamage(true);
            }
        }
        document.getElementById("InteractRepeat").onchange = function () {
            elemt.map[elemt.select[0]][elemt.select[1]].repeatable = this.checked;
        }
        document.getElementById("TestLevel").onclick = function () {
            document.getElementById("editor").style.display = "none";
            document.getElementById("gameDiv").style.display = "table-cell";
            overWorld.isTestLevel = true;
            overWorld.toMapFromDB(elemt.map);
        }
    }

    hasMeta(type, block) {
        if (block.meta == undefined) {
            return -1;
        }
        for (var m of block.meta) {
            if (m[type] != undefined) {
                return block.meta.indexOf(m);
            }
        }
        return -1;
    }

    drawBackground() {
        var image = new Image();
        image.src = this.map.background;
        var bg = this.resizeImage(image, this.canvas, 0);
        this.canvas.getContext("2d").drawImage(bg, 0, 0);
    }

    setup() {
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.initMap();
        this.drawBoard();
        this.setUpDocument();
        this.loadTiles(this);
        this.loadCreatures(this);
        this.loadEntities(this);
        this.draw(map);
    }

    initMap() {

        this.map = {
            id: this.id,
            user: this.userName,
            dateCreated: this.date,
            levelName: this.levelName,
            gravity: 9.81,
            width: 720,
            height: 480,
            spawnX: 0,
            spawnY: 0,
            background: "../resources/Backgrounds/museum.png",
            music: "../resources/sounds/music/005_1.wav",
            creatures: [],
            interacts: [],
            entities: [],
            content: []
        }
    }

    getDate() {

        var today = new Date();
        var day = today.getDate();
        var month = today.getMonth() + 1; //January is 0!
        var year = today.getFullYear();

        if (day < 10) {
            day = '0' + day;
        }

        if (month < 10) {
            month = '0' + month;
        }

        today = month + '/' + day + '/' + year;
        return today;


    }

    updateSpawn() {
        var scrollPos = document.getElementById("editor").children[0];
        var scrollX = scrollPos.childNodes[1].scrollLeft;
        var scrollY = scrollPos.childNodes[1].scrollTop;
        var gameDiv = document.getElementById("canvas");
        var divOffsetX = gameDiv.offsetLeft;
        var divOffsetY = gameDiv.offsetTop;
        this.select = [];
        var x = Math.floor((event.clientX + scrollX - divOffsetX) / this.cw) * this.cw;
        var y = Math.floor((event.clientY + scrollY - divOffsetY) / this.ch) * this.ch;

        console.log(this.map);
        this.map.spawnX = x;
        this.map.spawnY = y;
        console.log(this.map);
        //this.canvas.fillRect(x, y, this.cw, this.ch);
        alert("spawn set to: " + this.map.spawnX + " " + this.map.spawnY);
        

    }

    setBackground(value) {
        this.map.background = "../resources/Backgrounds/" + value + ".png";
        this.drawBackground();
        this.drawBoard();
        this.draw(this.map);
    }

    setGravity(value) {
        this.map.gravity = value;
    }

    setMusic(value) {
        this.map.music = "../resources/sounds/music/" + value + ".wav";
    }

    onMouseMove() {

        if (this.mouseLeft) {
            placeTile();

            if (this.selection != null) {
                placeTile();

            }
        }
        else if (this.mouseRight) {
            removeTile();
        }
    }

    showMoveSets(show) {
        var row = document.getElementById("MoveSets");
        row.style.display = show ? "" : "none";
        if (show) {
            var dropdown = document.getElementById("MoveSetsDropdown");
            if (dropdown.children.length == 0) {
                for (var mov of moves) {
                    var opt = document.createElement('option');
                    opt.value = mov.id;
                    opt.innerHTML = mov.name;
                    dropdown.appendChild(opt);
                }
            }
            var data = this.select;
            var set;
            if (this.select[0] == "interacts") {
                data = this.select[2];
                set = this.map.interacts[this.select[1]].action[this.select[3]].moveSet;
            } else {
                set = this.map[data[0]][data[1]].moveSet
            }

            dropdown.selectedIndex = set == undefined ? 0 : set;
        }
    }

    showMeta(show) {
        var block = document.getElementById("BlockMeta");
        block.style.display = show ? "" : "none";
        if (show) {
            var data = this.select;
            if (this.select[0] == "interacts") {
                if (this.select[3] instanceof Array) {
                    data = this.select[3];
                }
            }
            var b = this.map[data[0]][data[1]];
            if (this.select[0] == "interacts" && !(this.select[3] instanceof Array)) {
                b = this.map.interacts[this.select[1]].action[this.select[3]];
            }


            for (var child of block.children[0].children) {
                if (child.children[1].children[0].nodeName == "INPUT") {

                    var thing = this.hasMeta(child.children[1].children[0].value, b);
                    if (thing != -1) {
                        child.children[1].children[0].checked = b.meta[thing][child.children[1].children[0].value];
                    } else {
                        child.children[1].children[0].checked = false;
                    }
                }
            }
        }
    }

    storeMap() {
        if (this.map.levelName == undefined) {
            this.map.levelName = "default";
        }
        storeLocally(this.map);
    }

    showInteracts(show) {
        var ent = document.getElementById("Interacts");
        ent.style.display = show ? "" : "none";
        document.getElementById("InteractType").selectedIndex = 0;
    }

    showEntities(show) {
        var ent = document.getElementById("EntityAmount");
        ent.style.display = show ? "" : "none";
        if (show) {
            var a = document.getElementById("entAmount");
            if (this.select[0] != "interacts") {
                a.value = this.map.entities[this.select[1]].amount;
            } else {
                a.value = this.map.interacts[this.select[1]].action[this.select[3]].amount;
            }
        }
    }
    //for the damage
    showDamage(show) {
        var dam = document.getElementById("DamageAmount");
        dam.style.display = show ? "" : "none";
        if (show) {
            var a = document.getElementById("damAmount");
            if (this.select[0] != "interacts") {
                a.value = this.map.entities[this.select[1]].damage;
            } else {
                a.value = this.map.interacts[this.select[1]].action[this.select[3]].damage;
            }
        }
    }

    showLoot(show) {
        var row = document.getElementById("LootDrop");
        row.style.display = show ? "" : "none";
        if (show) {
            var dropdown = document.getElementById("Lut");
            if (dropdown.children.length == 0) {
                for (var mov of drops) {
                    var opt = document.createElement('option');
                    opt.value = mov.id;
                    opt.innerHTML = mov.name;
                    dropdown.appendChild(opt);
                }
            }
            var data = this.select;
            var set;
            if (this.select[0] == "interacts") {
                data = this.select[2];
                set = this.map.creatures[this.select[1]].action[this.select[3]].loot;
            } else {
                set = this.map[data[0]][data[1]].loot
            }

            dropdown.selectedIndex = set == undefined ? 0 : set;
        }
    }

    clearCanvas() {
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    checkPosition(x, y) {
        this.showMoveSets(false);
        this.showMeta(false);
        this.showInteracts(false);
        this.showEntities(false);
        this.showDamage(false);
        if (this.select[0] != "interacts") {
            this.select = [];
        }
        var type = null;
        var k = 0;
        var j = 0;

        var t1 = performance.now();
        for (k = 0; k < Math.max(this.map.content.length, this.map.entities.length, this.map.creatures.length, this.map.interacts.length); k++) {
            //check for the tiles
            if (k < this.map.content.length && this.map.content[k].blockX == x && this.map.content[k].blockY == y) { type = "content"; break; }
            //check for the entities
            if (k < this.map.entities.length && this.map.entities[k].X == x && this.map.entities[k].Y == y) { type = "entities"; break; }
            //check for the creatures
            if (k < this.map.creatures.length && this.map.creatures[k].X == x && this.map.creatures[k].Y == y) { type = "creatures"; break; }
            //check for the interacts
            if (k < this.map.interacts.length && this.map.interacts[k].X == x && this.map.interacts[k].Y == y) { this.select = []; type = "interacts"; break; }
            //check for placed interact things
            if (k < this.map.interacts.length) {
                var interact = this.map.interacts[k];
                var br = false;
                for (var j = 0; j < interact.action.length; j++) {
                    if (interact.action[j].x == x && interact.action[j].y == y) {
                        this.select = ["interacts", k, interact.action[j].entType, j];
                        br = true;
                        break;
                    }
                }
                if (br) {
                    break;
                }
            }
        }
        console.log("check this in ", Math.abs(t1 - performance.now()), "ms");
        return [type, k];
    }

    removeTile() {
        var context = this.canvas.getContext("2d");
       
        var scrollPos = document.getElementById("editor").children[0];
        var scrollX = scrollPos.childNodes[1].scrollLeft;
        var scrollY = scrollPos.childNodes[1].scrollTop;
        var gameDiv = document.getElementById("canvas");
        var divOffsetX = gameDiv.offsetLeft;
        var divOffsetY = gameDiv.offsetTop;
        this.select = [];
        var x = Math.floor((event.clientX + scrollX - divOffsetX) / this.cw) * this.cw;
        var y = Math.floor((event.clientY + scrollY - divOffsetY) / this.ch) * this.ch;
        var data = this.checkPosition(x, y);

        if (this.select[0] == "interacts") {
            this.map.interacts[this.select[1]].action.splice(this.select[3], 1);
        }

        var k = data[1];
        var type = data[0];

        context.clearRect(x + 1, y + 1, this.cw - 1, this.ch - 1);





        switch (type) {

            case "content":

                this.map.content.splice(k, 1)
                break;
            case "entities":

                this.map.entities.splice(k, 1)
                break;
            case "creatures":

                this.map.creatures.splice(k, 1)
                break;
            case "interacts":
                this.map.interacts.splice(k, 1);
                this.clearCanvas();
                this.draw(this.map);
                this.drawBoard();
                break;

            case "action":
                var j = data[2];
                this.map.interacts[k].action.splice(j, 1);
        }

        this.drawBoard();

    }

    placeTile() {
        var scrollPos = document.getElementById("editor").children[0];
        var scrollX = scrollPos.childNodes[1].scrollLeft;
        var scrollY = scrollPos.childNodes[1].scrollTop;
        var gameDiv = document.getElementById("canvas");
        var divOffsetX = gameDiv.offsetLeft;
        var divOffsetY = gameDiv.offsetTop;

        var x = Math.floor((event.clientX + scrollX - divOffsetX) / this.cw) * this.cw;
        var y = Math.floor((event.clientY + scrollY - divOffsetY) / this.ch) * this.ch;
        if (this.selection == 1000) {
            //do stuff with selecting anything
            var data = this.checkPosition(x, y);
            switch (data[0]) {
                case "content":
                    if (this.select[0] == "interacts" && this.select[2] == "meta") {
                        this.select.push(data);
                    }
                    else {
                        this.select = data;
                    }
                    this.showMeta(true)
                    break;
                case "entities":
                    this.select = data;
                    this.showEntities(true);
                    break;
                case "creatures":
                    this.select = data;
                    this.showMoveSets(true);
                    this.showLoot(true);
                    break;
                case "interacts":
                    this.select = data;
                    this.select[2] = "spawn";
                    this.showInteracts(true);
                    break;
                default:
                    if (this.select[0] == "interacts") {
                        if (this.select[2] == "spawn" && this.select[3] != undefined) {
                            var options = {};
                            options.x = x;
                            options.y = y;
                            options.type = this.select[2];
                            if (this.select[3] >= 800 && this.select[3] <= 803) {
                                options.entType = "Entity";
                                getSprite(1001).drawBackground(x, y, this.canvas, this.cw, this.hw);
                            } else if (this.select[3] < 400 || this.select[3] == 1005) {
                                options.entType = "Tile";
                                options.meta = [getSprite(this.select[3]).meta];
                                getSprite(1002).drawBackground(x, y, this.canvas, this.cw, this.hw);
                            } else if (this.select[3] < 800) {
                                options.entType = "EntityCreature";
                                options.moveSet = 0;
                                options.loot = -1;
                                getSprite(1004).drawBackground(x, y, this.canvas, this.cw, this.hw);
                            }
                            options.id = this.select[3];
                            options.amount = 1; //change this later maybe
                            this.map[this.select[0]][this.select[1]].action.push(options);
                        } else if (this.select[2] != undefined && this.select[3] != undefined) {
                            switch (this.select[2]) {
                                case "Tile":
                                    this.showMeta(true);
                                    break;
                                case "Entity":
                                    this.showEntities(true);
                                    break;
                                case "EntityCreature":
                                    this.showMoveSets(true);
                                     this.showLoot(true);
                                    break;
                                case "interacts":
                                    this.showInteracts(true);
                                case "damage":
                                    this.showDamage(true);
                                    break;
                            }
                        }
                    }
                    break;
            }
            return;
        }

        getSprite(this.selection).drawBackground(x, y, this.canvas, this.cw, this.ch);
        this.removeTile();
        switch (this.elem) {
            case "Creature":
                this.placeCreature(x, y);
                break;
            case "Entities":
                this.placeEntity(x, y);
                break;
            case "Content":
                this.placeContent(x, y);
                break;
        }
    }

    placeCreature(x, y) {

        var taken = false;
        var i;
        var creat = {
            Id: this.selection,
            X: x,
            Y: y,
            loot: -1
        }
        //check to see if tile position is already in existance
        for (i = 0; i < this.map.creatures.length; i++) {

            if (this.map.creatures[i].posX == x && this.map.creatures[i].posY == y) {

                taken = true;
                break;
            }
        }
        if (taken) {
            this.map.creatures.splice(i, 1)
            this.map.creatures.push(creat);
        }
        else {
            this.map.creatures.push(creat);
        }


    }


    placeEntity(x, y) {

        var taken = false;
        var i;
        var ent = {
            Id: this.selection,
            X: x,
            Y: y,
        }
        if (ent.Id == 800) {
            ent.amount = 1;
        }
        if (ent.Id == 802) {
            ent.damage = 1;
        }

        //check to see if tile position is already in existance
        for (i = 0; i < this.map.entities.length; i++) {

            if (this.map.entities[i].posX == x && this.map.entities[i].posY == y) {
                taken = true;
                break;
            }
        }
        if (taken) {
            this.map.entities.splice(i, 1)
            this.map.entities.push(ent);
        }
        else {
            if (ent.Id == 800) {
                this.map.entities.push(ent);
            } else {
                ent.repeatable = false;
                ent.action = [];
                this.map.interacts.push(ent);
            }
        }


    }

    placeContent(x, y) {

        var taken = false;
        var i;
        var cont = {
            blockId: this.selection,
            blockX: x,
            blockY: y,
            meta: [getSprite(this.selection).meta != undefined ? getSprite(this.selection).meta : { "ricochet": true }]
        }
        //check to see if tile position is already in existance
        for (i = 0; i < this.map.content.length; i++) {

            if (this.map.content[i].posX == x && this.map.content[i].posY == y) {

                taken = true;
                break;
            }
        }
        if (taken) {
            this.map.content.splice(i, 1)
            this.map.content.push(cont);



        }
        else {
            this.map.content.push(cont);

        }


    }

    //so this is going to dynamically add the tiles to the table
    loadTiles(editor) {
        //this is the table we are using
        var table = document.getElementById("tiles").children[0];
        table.removeChild(table.children[0]);
        table.appendChild(document.createElement("tbody"));
        var row = table.insertRow(0);
        var column = 0;
        var c = row.insertCell(column);
        var smallC = document.createElement("canvas");
        smallC.width = this.cw;
        smallC.height = this.ch;
        c.setAttribute("id", 1000);
        c.onclick = function () {//insert whatever function handled the tiles selection here}
            editor.selection = parseInt(this.id);
        }
        getSprite(1000).drawBackground(0, 0, smallC, this.cw, this.ch);
        c.appendChild(smallC);
        column++;
        c = row.insertCell(column);
        smallC = document.createElement("canvas");
        smallC.width = this.cw;
        smallC.height = this.ch;
        c.setAttribute("id", 1005);
        c.onclick = function () {//insert whatever function handled the tiles selection here}
            if (editor.select[0] != "interacts") {
                editor.selection = parseInt(this.id);
            } else {
                editor.select[3] = parseInt(this.id);
            }
        }
        getSprite(1005).drawBackground(0, 0, smallC, this.cw, this.ch);
        c.appendChild(smallC);
        column++;

        for (var id of sprites) {
            var sprite = id[1];
            //just making sure we are only doing the tiles
            if (sprite.id > 400) {
                continue;
            }
            //adding a new row
            if (column == 0) {
                row = table.insertRow(table.rows.length);
            }
            //adding a new cell at the index of the column
            var cell = row.insertCell(column);
            cell.setAttribute("id", sprite.id);
            cell.onclick = function () {//insert whatever function handled the tiles selection here
                if (editor.select[0] != "interacts") {
                    editor.selection = parseInt(this.id);
                } else {
                    editor.select[3] = parseInt(this.id);
                }
            }
            //setting the image, we need to create different icons for every image it seems, every cell has his own id as well to use with the function,
            //this should all work
            var smallC = document.createElement("canvas");
            smallC.width = this.cw;
            smallC.height = this.ch;
            sprite.drawBackground(0, 0, smallC, this.cw, this.ch);
            cell.appendChild(smallC);
            column++;
            if (column == 3) { column = 0; }
        }
    }

    //so this is going to dynamically add the tiles to the table
    loadCreatures(editor) {
        //this is the table we are using
        var table = document.getElementById("creature").children[0];
        table.removeChild(table.children[0]);
        table.appendChild(document.createElement("tbody"));
        var row = table.insertRow(0);
        var column = 0;
        var c = row.insertCell(column);
        var smallC = document.createElement("canvas");
        smallC.width = this.cw;
        smallC.height = this.ch;
        c.setAttribute("id", 1000);
        c.onclick = function () {//insert whatever function handled the tiles selection here}
            editor.selection = parseInt(this.id);
        }
        getSprite(1000).drawBackground(0, 0, smallC, this.cw, this.ch);
        c.appendChild(smallC);
        column++;
        for (var id of sprites) {
            var sprite = id[1];
            //just making sure we are only doing the tiles
            if (sprite.id < 400 || sprite.id > 666) {
                continue;
            }
            //adding a new row
            if (column == 0) {
                row = table.insertRow(table.rows.length);
            }
            //adding a new cell at the index of the column
            var cell = row.insertCell(column);
            cell.setAttribute("id", sprite.id);
            cell.onclick = function () {//insert whatever function handled the tiles selection here}
                if (editor.select[0] != "interacts") {
                    editor.selection = parseInt(this.id);
                } else {
                    editor.select[3] = parseInt(this.id);
                }
            }
            //setting the image, we need to create different icons for every image it seems, every cell has his own id as well to use with the function,
            //this should all work
            var smallC = document.createElement("canvas");
            smallC.width = this.cw;
            smallC.height = this.ch;
            sprite.drawBackground(0, 0, smallC, this.cw, this.ch);
            cell.appendChild(smallC);
            column++;
            if (column == 3) { column = 0; }
        }
    }

    //so this is going to dynamically add the tiles to the table
    loadEntities(editor) {
        //this is the table we are using
        var table = document.getElementById("entity").children[0];
        table.removeChild(table.children[0]);
        table.appendChild(document.createElement("tbody"));
        var row = table.insertRow(0);
        var column = 0;
        var c = row.insertCell(column);
        var smallC = document.createElement("canvas");
        smallC.width = this.cw;
        smallC.height = this.ch;
        c.setAttribute("id", 1000);
        c.onclick = function () {//insert whatever function handled the tiles selection here}
            editor.selection = parseInt(this.id);
        }
        getSprite(1000).drawBackground(0, 0, smallC, this.cw, this.ch);
        c.appendChild(smallC);
        column++;
        for (var id of sprites) {
            var sprite = id[1];
            //just making sure we are only doing the tiles
            if (sprite.id < 669 || sprite.id > 900) {
                continue;
            }
            //adding a new row
            if (column == 0) {
                row = table.insertRow(table.rows.length);
            }
            //adding a new cell at the index of the column
            var cell = row.insertCell(column);
            cell.setAttribute("id", sprite.id);
            cell.onclick = function () {//insert whatever function handled the tiles selection here}
                if (editor.select[0] != "interacts") {
                    editor.selection = parseInt(this.id);
                } else {
                    editor.select[3] = parseInt(this.id);
                }
            }
            //setting the image, we need to create different icons for every image it seems, every cell has his own id as well to use with the function,
            //this should all work
            var smallC = document.createElement("canvas");
            smallC.width = this.cw;
            smallC.height = this.ch;
            sprite.drawBackground(0, 0, smallC, this.cw, this.ch);
            cell.appendChild(smallC);
            column++;
            if (column == 3) { column = 0; }
        }
    }

    //draws map object to canvas
    draw(map) {

        var k;
        var j;
        var x;
        var y;
        var drawId;

        for (k = 0; k < this.map.content.length; k++) {

            drawId = this.map.content[k].blockId;
            x = this.map.content[k].blockX;
            y = this.map.content[k].blockY;
            getSprite(parseInt(drawId)).drawBackground(x, y, this.canvas, this.cw, this.ch);
        }
        for (k = 0; k < this.map.entities.length; k++) {

            drawId = this.map.entities[k].Id;
            x = this.map.entities[k].X;
            y = this.map.entities[k].Y;
            getSprite(parseInt(drawId)).drawBackground(x, y, this.canvas, this.cw, this.ch);
        }
        for (k = 0; k < this.map.creatures.length; k++) {
            drawId = this.map.creatures[k].Id;
            x = this.map.creatures[k].X;
            y = this.map.creatures[k].Y;
            getSprite(parseInt(drawId)).drawBackground(x, y, this.canvas, this.cw, this.ch);
        }
        for (k = 0; k < this.map.interacts.length; k++) {
            drawId = this.map.interacts[k].Id;
            x = this.map.interacts[k].X;
            y = this.map.interacts[k].Y;
            getSprite(parseInt(drawId)).drawBackground(x, y, this.canvas, this.cw, this.ch);
            for (j = 0; j < this.map.interacts[k].action.length; j++) {
                drawId = this.map.interacts[k].action[j].id;
                x = this.map.interacts[k].action[j].x;
                y = this.map.interacts[k].action[j].y;

                if (this.map.interacts[k].action[j].type == "spawn") {
                    switch (this.map.interacts[k].action[j].entType) {
                        case "Tile":
                            drawId = 1002;
                            break;
                        case "Entity":
                            drawId = 1001;
                            break;

                        case "EntityCreature":
                            drawId = 1004;
                            break;
                    }
                } else if (this.map.interacts[k].action[j].type == "meta"){
                    drawId = 1003;
                }


                getSprite(drawId).drawBackground(x, y, this.canvas, this.cw, this.ch);

            }
        }


    }

    /**
     * Used for filling the level-browser with levels stored on the database that can be loaded into the level editor.
     * @param {any} query - the query for searching the database.
     * @param {any} collection - the collection in which to search.
     */
    loadLevelsForEditor(query, collection) {
        //Empty levels browser of all rows
        refreshLevelsTable();
        var levelsTable = document.getElementById('levelTable');

        document.getElementById('changeStorageBtn').value = "Show Local Levels";
        document.getElementById('changeStorageBtn').style.margin = "16px 0px 16px 0px";

        document.getElementById('searchLevelsForm').style.display = 'inline-block';

        document.getElementById('changeStorageBtn').setAttribute("onClick", "newLevel(false)");

        loadDBFromQuery(query, collection, function (data) {
            var levels;

            if (data == null) {
                return;
            }

            if (data.constructor === Array) {
                levels = data;
            }
            else {
                levels = [data];
            }

            for (var level of levels) {
                var levelName = level.levelName;
                var author = level.user;
                var dateCreated = level.dateCreated;

                var levelRow = levelsTable.insertRow(levelsTable.rows.length);
                levelRow.setAttribute("id", level.id);


                var levelNameCell = levelRow.insertCell(0);
                levelNameCell.innerHTML = levelName;

                var authorCell = levelRow.insertCell(1);
                authorCell.innerHTML = author;

                var dateCreatedCell = levelRow.insertCell(2);
                dateCreatedCell.innerHTML = dateCreated;


                levelRow.onclick = function () {
                    document.getElementById("Overwrite").style.display = "inline-block";
                    document.getElementById("Save").value = "Save As New";
                    loadDBFromQuery({ id: this.getAttribute("id") }, "level", function (response) {
                        var canvas = document.getElementById("canvas")
                        var clone = canvas.cloneNode();
                        canvas.parentNode.replaceChild(clone, canvas);
                        elemt = new Editor(clone);

                        var temp = response[0];
                        elemt.map = temp;
                        elemt.oldName = elemt.map.levelName;
                        var user = getUsername();

                        if (temp.user == user) {
                            document.getElementById("levelBrowser").style.display = "none";
                            document.getElementById("editor").style.display = "table-cell";
                            var canvas = document.getElementById('canvas');
                            var context = canvas.getContext('2d');
                            context.clearRect(0, 0, elemt.canvas.width, elemt.canvas.height);
                            elemt.drawBoard();
                            elemt.draw(elemt.map);
                            document.getElementById("levelBrowser").style.display = "none";
                        }
                        else {
                            alert("Cannot Edit Other Players Maps");
                        }
                    });
                }
            }
        });
    }

    /**
     * Used for filling the level-browser with levels stored locally that can be loaded into the level editor.
     */
    listLocalLevelsForEditor() {
        var levelsTable = document.getElementById('levelTable');

        document.getElementById('changeStorageBtn').value = "Show Remote Levels";
        document.getElementById('changeStorageBtn').style.margin = "16px 0px 16px 425px";
        
        document.getElementById('searchLevelsForm').style.display = 'none';

        refreshLevelsTable();
        getFiles(function (data) {
            for (var any of data) {
                loadJSONFile(function (response) {
                    var level = JSON.parse(response);

                    var levelName = level.levelName;
                    var author = level.user;
                    var dateCreated = level.dateCreated;

                    var levelRow = levelsTable.insertRow(levelsTable.rows.length);
                    levelRow.setAttribute("id", levelName);

                    var levelNameCell = levelRow.insertCell(0);
                    levelNameCell.innerHTML = levelName;

                    var authorCell = levelRow.insertCell(1);
                    authorCell.innerHTML = author;

                    var dateCreatedCell = levelRow.insertCell(2);
                    dateCreatedCell.innerHTML = dateCreated;

                    levelRow.onclick = function () {
                        document.getElementById("Overwrite").style.display = "inline-block";
                        document.getElementById("Save").value = "Save As New";

                        loadJSONFile(function (response) {
                            var temp = JSON.parse(response);
                            var user = getUsername();                 
                                console.log(temp)
                                console.log("loading...");

                                document.getElementById("levelBrowser").style.display = "none";
                                document.getElementById("editor").style.display = "table-cell";

                                var canvas = document.getElementById("canvas")
                                var clone = canvas.cloneNode();
                                var context = canvas.getContext('2d');
                                context.clearRect(0, 0, elemt.canvas.width, elemt.canvas.height);
                                canvas.parentNode.replaceChild(clone, canvas);
                                elemt = new Editor(clone);

                                elemt.bh = temp.height;
                                elemt.canvas.height = temp.height;

                                elemt.bw = parseInt(temp.width);
                                elemt.canvas.width = parseInt(temp.width);

                                elemt.drawBoard();
                                elemt.map = temp;

                                elemt.draw(elemt.map);
                        }, "/client/resources/localLevels/" + this.getAttribute("id") + ".json");       
                    }
                }, "/client/resources/localLevels/" + any);
            }
        }, "localLevels");
    } 
}
