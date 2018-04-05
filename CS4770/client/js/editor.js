
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
                    case 3:
                        editor.mouseRight = false;
                        break;
                }
            }, false);


        }, false);

        this.setup();
        console.log(this);
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
        this.draw(this.map);
    }

    setUpDocument() {
        var editor = this;

        document.getElementById("selectTiles").onclick = function () {
            editor.elem = "Content";
            console.log("content");
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
            console.log(name);
        }

        document.getElementById("mapW").onchange = function () {
            var w = document.getElementById("mapW").value;
            editor.bw = w;
            editor.canvas.width = w;
            console.log("Changing Width...");
            editor.drawBoard();
            editor.map.width = w;
            editor.draw(this.map);
        }

        document.getElementById("mapH").onchange = function () {
            var h = document.getElementById("mapH").value;
            editor.bh = h;
            editor.canvas.height = h;
            console.log("Changing Height...");
            editor.drawBoard();
            editor.map.height = h;
            editor.draw(this.map);
        }

        document.getElementById("Y").onchange = function () {
            var ycoord = document.getElementById("Y").value;
            var y = parseInt(ycoord);
            editor.map.spawnY = y;
            console.log(editor.map.spawnY);
        }

        document.getElementById("X").onchange = function () {
            var xcoord = document.getElementById("X").value;
            var x = parseInt(xcoord);
            editor.map.spawnX = x;
            console.log(editor.map.spawnX);
        }

        document.getElementById("Save").onclick = function () {
            console.log(editor.map);
            writeDB("level", editor.map);
            //overWorld.toMapFromDB(editor.map);
        }

        document.getElementById("Load").onclick = function () {
            editor.loadLevelsForEditor({ user: getUsername }, "level");
            document.getElementById("editor").style.display = "none";
            document.getElementById("selectionBoxDiv").style.display = "none";
            document.getElementById("selectionBox").selectedIndex = 0;
            document.getElementById("levelBrowser").style.display = "table-cell";
            //  console.log(newMap);
            // this.draw(this.map);

        }

        document.getElementById("LoadLevel").onclick = function () {
            document.getElementById("levelBrowser").style.display = "table-cell";
            document.getElementById("selectionBox").selectedIndex = 0;
            document.getElementById("selectionBoxDiv").style.display = "none";
            document.getElementById("levelEditorOptions").style.display = "none";
            editor.loadLevelsForEditor({ user: getUsername }, "level");
            //  console.log(newMap);
            // this.draw(this.map);

        }

        //this adds the movesets to a creature
        document.getElementById("MoveSetsDropdown").onchange = function () {
            if (elemt.select[0] != "interacts") {
                elemt.map[elemt.select[0]][elemt.select[1]].moveSet = this.value;
            } else {

            }
        }

        document.getElementById("entAmount").onchange = function () {
            if (elemt.select[0] != "interacts") {
                elemt.map[elemt.select[0]][elemt.select[1]].amount = parseInt(this.value);
            } else {

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
                 //sets the ineract action for this block
            } else {
                var data = elemt.select[3];
                var block = elemt.map.content[data[1]];
                var options = {};
                options.x = block.blockX;
                options.y = block.blockY;
                options.type = "meta";
                options.meta = { "ricochet": this.checked };
                options.id = block.blockId;
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
                 //sets the ineract action for this block
            } else {
                var data = elemt.select[3];
                var block = elemt.map.content[data[1]];
                var options = {};
                options.x = block.blockX;
                options.y = block.blockY;
                options.type = "meta";
                options.meta = { "ice": this.checked };
                options.id = block.blockId;
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
                //sets the ineract action for this block
            } else {
                var data = elemt.select[3];
                var block = elemt.map.content[data[1]];
                var options = {};
                options.x = block.blockX;
                options.y = block.blockY;
                options.type = "meta";
                options.meta = { "passThrough": this.checked };
                options.id = block.blockId;
                elemt.map.interacts[elemt.select[1]].action.push(options);
            }
        }

        document.getElementById("InteractType").onchange = function () {
            elemt.select[2] = this.value;
        }
        document.getElementById("InteractRepeat").onchange = function () {
            elemt.map[elemt.select[0]][elemt.select[1]].repeatable = this.checked;
        }
    }

    hasMeta(type, block) {
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
        this.initMap();
        this.drawBackground();
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
        console.log(today);
        return today;


    }
    //StartEditor() {
    //    editor = new Editor(720, 480);
    //}



    //Editor(areaW, areaH) {
    //    this.areaH = areaH;
    //    this.areaW = areaW;


    //}

    setBackground(value) {
        console.log(value);
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
            var dropdown = row.children[0].children[1];
            if (dropdown.children.length == 0) {
                for (var mov of moves) {
                    var opt = document.createElement('option');
                    opt.value = mov.id;
                    opt.innerHTML = mov.name;
                    dropdown.appendChild(opt);
                }
            }
            var data = this.select;
            if (this.select[0] == "interacts") {
                data = this.select[2];
            }
            var set = this.map[data[0]][data[1]].moveSet
            dropdown.selectedIndex = set == undefined ? 0 : set;
        }
    }

    showMeta(show) {
        var block0 = document.getElementById("BlockMeta0");
        block0.style.display = show ? "" : "none";
        var block1 = document.getElementById("BlockMeta1");
        block1.style.display = show ? "" : "none";
        var block2 = document.getElementById("BlockMeta2");
        block2.style.display = show ? "" : "none";
        if (show) {
            var data = this.select;
            if (this.select[0] == "interacts") {
                data = this.select[3];
            }
            for (var child of block.children[0].children) {
                if (child.nodeName == "INPUT") {
                    if (this.map[data[0]][data[1]].meta == undefined) {
                        this.map[data[0]][data[1]].meta = [];
                    }
                    var thing = this.hasMeta(child.value, this.map[data[0]][data[1]]);
                    if (thing != -1) {
                        child.checked = this.map[data[0]][data[1]].meta[thing][child.value];
                    } else {
                        child.checked = false;
                    }
                }
            }
        }
    }

    showInteracts(show) {
        var ent = document.getElementById("Interacts");
        ent.style.display = show ? "" : "none";
    }

    showEntities(show) {
        var ent = document.getElementById("EntityAmount");
        ent.style.display = show ? "" : "none";
    }

    checkPosition(x, y) {
        this.showMoveSets(false);
        this.showMeta(false);
        this.showInteracts(false);
        this.showEntities(false);
        if (this.select[0] != "interacts") {
            this.select = [];
        }
        var type = null;
        var k = 0;
        for (k = 0; k < Math.max(this.map.content.length, this.map.entities.length, this.map.creatures.length); k++) {
            //check for the tiles
            if (k < this.map.content.length && this.map.content[k].blockX == x && this.map.content[k].blockY == y) { type = "content"; break; }
            //check for the entities
            if (k < this.map.entities.length && this.map.entities[k].X == x && this.map.entities[k].Y == y) { type = "entities"; break; }
            //check for the creatures
            if (k < this.map.creatures.length && this.map.creatures[k].X == x && this.map.creatures[k].Y == y) { type = "creatures"; break; }
            //check for the interacts
            if (k < this.map.interacts.length && this.map.interacts[k].X == x && this.map.interacts[k].Y == y) { this.select = []; type = "interacts"; break; }
        }
        return [type, k];
    }

    removeTile() {
        var context = this.canvas.getContext("2d");

        var scrollPos = document.getElementById("editor").children[0];
        var scrollX = scrollPos.scrollLeft;
        var scrollY = scrollPos.scrollTop;
        var gameDiv = document.getElementById("canvas");
        var divOffsetX = gameDiv.offsetLeft;
        var divOffsetY = gameDiv.offsetTop;

        var x = Math.floor((event.clientX + scrollX - divOffsetX) / this.cw) * this.cw;
        var y = Math.floor((event.clientY + scrollY - divOffsetY) / this.ch) * this.ch;
        var data = this.checkPosition(x, y);

        var k = data[1];
        var type = data[0];

        context.clearRect(x + 1, y + 1, this.cw - 1, this.ch - 1);





        switch (type) {

            case "content":

                console.log("Deleting Content...");
                this.map.content.splice(k, 1)
                break;
            case "entities":

                console.log("Deleting Entity...");
                this.map.entities.splice(k, 1)
                break;
            case "creatures":

                console.log("Deleting Creature...");
                this.map.creatures.splice(k, 1)
                break;
            case "interacts":
                this.map.interacts.splice(k, 1);
                break;
        }
        this.drawBoard();
    }

    placeTile() {
        var scrollPos = document.getElementById("editor").children[0];
        var scrollX = scrollPos.scrollLeft;
        var scrollY = scrollPos.scrollTop;
        var gameDiv = document.getElementById("canvas");
        var divOffsetX = gameDiv.offsetLeft;
        var divOffsetY = gameDiv.offsetTop;

        var x = Math.floor((event.clientX + scrollX - divOffsetX) / this.cw) * this.cw;
        var y = Math.floor((event.clientY + scrollY - divOffsetY) / this.ch) * this.ch;
        console.log(this.map);
        if (this.selection == 1000) {
            //do stuff with selecting anything
            var data = this.checkPosition(x, y);
            console.log(data);
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
                    break;
                case "interacts":
                    this.select = data;
                    this.select[2] = "spawn";
                    this.showInteracts(true);
                    break;
                default:
                    if (this.select[0] == "interacts" && this.select[2] == "spawn" && this.select[3] != undefined) {
                        var options = {};
                        options.x = x;
                        options.y = y;
                        options.type = this.select[2];
                        if (this.select[3] == 800) {
                            options.entType = "Entity";
                        } else if (this.select[3] < 400) {
                            options.entType = "Tile";
                        } else {
                            options.entType = "EntityCreature";
                        }
                        options.id = this.select[3];
                        options.amount = 1; //change this later maybe
                        this.map[this.select[0]][this.select[1]].action.push(options);
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
        }
        //check to see if tile position is already in existance
        for (i = 0; i < this.map.creatures.length; i++) {

            if (this.map.creatures[i].posX == x && this.map.creatures[i].posY == y) {

                taken = true;
                break;
            }
        }
        if (taken) {
            console.log("Overwriting position...");
            this.map.creatures.splice(i, 1)
            this.map.creatures.push(creat);



        }
        else {
            this.map.creatures.push(creat);
            console.log("pushing");
        }


    }


    placeEntity(x, y) {

        var taken = false;
        var i;
        var ent = {
            Id: this.selection,
            X: x,
            Y: y
        }
        //check to see if tile position is already in existance
        for (i = 0; i < this.map.entities.length; i++) {

            if (this.map.entities[i].posX == x && this.map.entities[i].posY == y) {
                taken = true;
                break;
            }
        }
        if (taken) {
            console.log("Overwriting position...");
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
            console.log("pushing");

        }


    }

    placeContent(x, y) {

        var taken = false;
        var i;
        var cont = {
            blockId: this.selection,
            blockX: x,
            blockY: y,
            meta: [{ "ricochet": true }]
        }
        //check to see if tile position is already in existance
        for (i = 0; i < this.map.content.length; i++) {

            if (this.map.content[i].posX == x && this.map.content[i].posY == y) {

                taken = true;
                break;
            }
        }
        if (taken) {
            console.log("Overwriting position...");
            this.map.content.splice(i, 1)
            this.map.content.push(cont);



        }
        else {
            this.map.content.push(cont);
            console.log("pushing");

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
        console.log(sprites);
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

    draw(map) {

        var k;
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
            getSprite(parseInt(drawId)).drawBackground(x, y, this.canvas,this.cw,this.ch);
        }
        for (k = 0; k < this.map.creatures.length; k++) {
            drawId = this.map.creatures[k].Id;
            x = this.map.creatures[k].X;
            y = this.map.creatures[k].Y;
            getSprite(parseInt(drawId)).drawBackground(x, y, this.canvas, this.cw, this.ch);
        }

    }

    loadLevelsForEditor(query, collection) {
        refreshLevelsTable();
        var levelsTable = document.getElementById('levelTable');
        loadDBFromQuery(query, collection, function (data) {
            console.log(data);
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
                    console.log(this.getAttribute("id"))
                    loadDBFromQuery({ id: this.getAttribute("id") }, "level", function (response) {
                        var temp = response[0];
                        elemt.map = temp;
                        console.log(response);
                        console.log(elemt.map);
                        var user = getUsername();

                        if (temp.user == user) {
                            console.log("loading...");
                           // console.log(this.map);
                           // overWorld.toMapFromDB(editor.map);
                          //  toLevel();
                            document.getElementById("levelBrowser").style.display = "none";
                            document.getElementById("editor").style.display = "table-cell";
                            elemt.draw(elemt.map);

                            //loadMap();
                        }
                        else {
                            alert("Cannot Edit Other Players Maps");
                        }

                        document.getElementById("levelBrowser").style.display = "none";




                        //toLevel();
                        // overWorld.toMapFromDB(response);
                    });
                }
            }
        });
    }
}
