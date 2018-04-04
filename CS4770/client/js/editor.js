
class Editor {
    constructor(canvas) {
        this.canvas = canvas

        this.p = 0;		//offset
        this.cw = 32;	//cell width
        this.ch = 32;	//cell height
        this.bw = canvas.width;
        this.bh = canvas.height;


        this.selection = 0;
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


        document.getElementById("background").onchange = function () {
            var background = document.getElementById("background");
            var b = background.options[background.selectedIndex].value;
            editor.map.background = b;
            console.log(map);
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
            editor.draw(this.map);
        }

        document.getElementById("mapH").onchange = function () {
            var h = document.getElementById("mapH").value;
            editor.bh = h;
            editor.canvas.height = h;
            console.log("Changing Height...");
            editor.drawBoard();
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
            editor.loadLevelsForEditor();
            document.getElementById("levelBrowser").style.display = "table-cell";
          //  console.log(newMap);
           // this.draw(this.map);
            
        }
    }


    setup() {
        this.drawBoard();
        this.setUpDocument();
        this.loadTiles(this);
        this.loadCreatures(this);
        this.loadEntities(this);
        this.initMap();
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
            spawnX: 150,
            SpawnY: 10,
            background: "../resources/Backgrounds/museum.png",
            creatures: [],
            interacts:[],
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


    removeTile() {
        var context = this.canvas.getContext("2d");

        var scrollPos = document.getElementById("editor").children[0];
        var scrollX = scrollPos.scrollLeft;
        var scrollY = scrollPos.scrollTop;
        var gameDiv = document.getElementById("canvas");
        var divOffsetX = gameDiv.offsetLeft;
        var divOffsetY = gameDiv.offsetTop;

        var x = Math.floor((event.clientX + divOffsetX / 2 + scrollX - this.cw) / this.cw) * this.cw;
        var y = Math.floor((event.clientY + divOffsetY / 2 + scrollY - this.ch) / this.ch) * this.ch;
        var k;
        var type = null;

        context.clearRect(x + 1, y + 1, this.cw - 1, this.ch - 1);


        for (k = 0; k < this.map.content.length; k++) {
            if (this.map.content[k].posX == x && this.map.content[k].posY == y) { type = "content"; break; }
        }
        for (k = 0; k < this.map.entities.length; k++) {
            if (type != null) { break; }
            if (this.map.entities[k].posX == x && this.map.entities[k].posY == y) { type = "entities"; }
        }
        for (k = 0; k < this.map.creatures.length; k++) {
            if (type != null) { break; }
            if (this.map.creatures[k].posX == x && this.map.creatures[k].posY == y) { type = "creatures"; break; }
        }


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

        var x = Math.floor((event.clientX + divOffsetX  + scrollX - this.cw) / this.cw) * this.cw;
        var y = Math.floor((event.clientY + divOffsetY  + scrollY - this.ch) / this.ch) * this.ch;

        getSprite(this.selection).drawBackground(x, y, this.canvas, this.cw, this.ch);
        this.removeTile();
        console.log(this.map);

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
            this.map.entities.push(ent);
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
        var column = 0;
        var row;
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
            cell.onclick = function () {//insert whatever function handled the tiles selection here}
                editor.selection = parseInt(this.id);
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
        var column = 0;
        var row;
        for (var id of sprites) {
            var sprite = id[1];
            console.log(sprite.id);
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
                editor.selection = parseInt(this.id);
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
        var column = 0;
        var row;
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
                editor.selection = parseInt(this.id);
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

            drawId = this.map.content[k].id;
            x = this.map.content[k].posX;
            y = this.map.content[k].posY;
            getSprite(parseInt(drawId)).drawBackground(x, y, this.canvas);
        }
        for (k = 0; k < this.map.entities.length; k++) {

            drawId = this.map.entities[k].id;
            x = this.map.entities[k].posX;
            y = this.map.entities[k].posY;
            getSprite(parseInt(drawId)).drawBackground(x, y, this.canvas);
        }
        for (k = 0; k < this.map.creatures.length; k++) {
            drawId = this.map.creatures[k].id;
            x = this.map.creatures[k].posX;
            y = this.map.creatures[k].posY;
            getSprite(parseInt(drawId)).drawBackground(x, y, this.canvas);
        }

    }

    loadLevelsForEditor() {
    refreshLevelsTable();
    var levelsTable = document.getElementById('levelTable');
    loadDB('level', function (data) {
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
                loadDBFromID("level", this.getAttribute("id"), function (response) {
                    var temp = response;
                    editor.map = response;
                    console.log(response);
                    console.log(editor.map);
                    var user = getUsername();

                    if (temp.user == user) {
                        console.log("loading...");
                       // console.log(this.map);
                        overWorld.toMapFromDB(editor.map);
                        toLevel();
                        document.getElementById("levelBrowser").style.display = "none";
                        document.getElementById("editor").style.display = "none";
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
