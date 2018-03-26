
class Editor {
    constructor(canvas) {
        this.canvas = canvas

        this.p = 0;		//offset
        this.cw = 32;	//cell width
        this.ch = 36;	//cell height
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
        this.img.src = 'tileset.png';

        this.elem = "Content";

        document.addEventListener("mousemove", this.onMouseMove, false);


        this.map = {
            gravity: 9.81,
            width: 720,
            height: 480,
            spawnX: 150,
            SpawnY: 10,

            creatures: [{

                moveset:
                    [
                        {

                        }
                    ]
            }],

            entities: [
                {

                }
            ],
            content: [
                {

                }
            ]
        }


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
        document.getElementById("selectTiles").onclick = function () {
            elem = "Content";
            console.log("content");
            document.getElementById("creature").style.display = "none";
            document.getElementById("entity").style.display = "none";
            document.getElementById("tiles").style.display = "inline-block";

        }

        document.getElementById("selectCreature").onclick = function () {
            elem = "Creature";
            document.getElementById("entity").style.display = "none";
            document.getElementById("tiles").style.display = "none";
            document.getElementById("creature").style.display = "inline-block";

        }

        document.getElementById("selectEntity").onclick = function () {
            elem = "Entities";
            document.getElementById("creature").style.display = "none";
            document.getElementById("tiles").style.display = "none";
            document.getElementById("entity").style.display = "inline-block";
        }


        document.getElementById("background").onchange = function () {
            var background = document.getElementById("background");
            var b = background.options[background.selectedIndex].value;
            map.background = b;
            console.log(map);
        }


        document.getElementById("mapW").onchange = function () {
            var w = document.getElementById("mapW").value;
            bw = w;
            canvas.width = w;
            console.log("Changing Width...");
            drawBoard();
        }

        document.getElementById("mapH").onchange = function () {
            var h = document.getElementById("mapH").value;
            bh = h;
            canvas.height = h;
            console.log("Changing Height...");
            drawBoard();
        }

        document.getElementsByName("X").onchange = function () {
            var ycoord = document.getElementById("Y").value;
            map.spawnY = ycoord;
        }

        document.getElementsByName("Y").onchange = function () {
            var xcoord = document.getElementById("X").value;
            map.spawnX = xcoord;
            console.log("changing y spawn");
        }

        document.getElementsByName("save").onclick = function () {

        }

        document.getElementsByName("load").onclick = function () {

        }
    }


    setup() {
        this.drawBoard();
        this.setUpDocument();
        this.loadTiles(this);
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

        var scrollPos = document.getElementById("gameDiv");
        var scrollX = scrollPos.scrollLeft;
        var scrollY = scrollPos.scrollTop;
        var x = Math.floor((event.clientX + scrollX-this.cw) / this.cw) * this.cw;
        var y = Math.floor((event.clientY + scrollY-this.cw) / this.ch) * this.ch;
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
        var scrollPos = document.getElementById("gameDiv");
        var scrollX = scrollPos.scrollLeft;
        var scrollY = scrollPos.scrollTop;

        var x = Math.floor((event.clientX + scrollX-this.cw) / this.cw) * this.cw;
        var y = Math.floor((event.clientY + scrollY-this.ch) / this.ch) * this.ch;

        getSprite(this.selection).drawBackground(x, y, this.canvas);

        switch (this.elem) {
            case "Creature":
                this.placeCreature(x,y);
                break;
            case "Entities":
                this.placeEntity(x,y);
                break;
            case "Content":
                this.placeContent(x,y);
                break;
        }
    }

    placeCreature(x,y) {

        var taken = false;
        var i;
        var creat = {
            id: selection,
            posX: x,
            posY: y,
            moveset: move
        }
        //check to see if tile position is already in existance
        for (i = 0; i < map.creatures.length; i++) {

            if (map.creatures[i].posX == x && map.creatures[i].posY == y) {

                taken = true;
                break;
            }
        }
        if (taken) {
            console.log("Overwriting position...");
            map.creatures.splice(i, 1)
            map.creatures.push(creat);



        }
        else {
            map.creatures.push(creat);
            console.log("pushing");
        }


    }


    placeEntity(x,y) {

        var taken = false;
        var i;
        var ent = {
            id: selection,
            posX: x,
            posY: y
        }
        //check to see if tile position is already in existance
        for (i = 0; i < map.entities.length; i++) {

            if (map.entities[i].posX == x && map.entities[i].posY == y) {
                taken = true;
                break;
            }
        }
        if (taken) {
            console.log("Overwriting position...");
            map.entities.splice(i, 1)
            map.entities.push(ent);



        }
        else {
            map.entities.push(ent);
            console.log("pushing");

        }


    }

    placeContent(x,y) {

        var taken = false;
        var i;
        var cont = {
            id: this.selection,
            posX: x,
            posY: y
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
                break;
            }
            //adding a new row
            if (column == 0) {
                row = table.insertRow(0);
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
            smallC.width = sprite.width;
            smallC.height = sprite.height;
            sprite.drawBackground(0, 0, smallC);
            cell.appendChild(smallC);
            column++;
            if (column == 3) { column = 0; }
        }
    }
}
