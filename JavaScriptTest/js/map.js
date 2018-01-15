var tiles = [[], []];
var characters = [];

MAP = function (container, file) {
    var gravity;

    //make function that loads a resource from somewhere containing info of below
    loadBlocks(container, file);
    console.log(tiles);

    var options = {};
    loadJSONFile(function (response) {
        var any = JSON.parse(response);
        any = any[0];

        var options = {};
        options.Id = any.Id;
        options.name = any.name;

        options.image = {};
        options.width = any.width;
        options.heigth = any.heigth;
        options.image.src = any.source;
        options.image.startX = any.startX;
        options.image.startY = any.startY;
        options.context = container;

        var options2 = {};
        options2.sprite = new SPRITE(options);
        options2.hp = any.hp;
        options2.jump = any.jump;
        options2.speed = any.speed;
        options2.weapon = new PISTOL();
        options2.heigth = options2.sprite.heigth;
        options2.gravity = this.gravity;
        options2.center = any.centerPX;
        options2.offset = any.offSetPX;
        characters.push(new CHARACTER(options2));
        characters[0].spawn(150, 10);

    }, "./resources/stud.json");

    function loadBlocks(container, file) {
        //make function that loads a resource from somewhere containing info of below
        var any = JSON.parse(file);
        this.gravity = any.gravity;
        for (var tile of any.content) {
            var block = {};
            block.Id = tile.blockId;
            block.meta = tile.meta;
            block.X = tile.blockX;
            block.Y = tile.blockY;
            for (var x = tile.blockX; x < tile.blockX + getSprite(block.Id).width; x++) {
                tiles[x] = [];
                for (var y = tile.blockY; y < tile.blockY + getSprite(block.Id).heigth; y++) {
                    tiles[x][y] = block;
                }
            }
            setSprite(container, block);
        }
    }

    function setSprite(container, block) {
        getSprite(block.Id).drawBackground(block.X, block.Y);
    }
};

function loadMap(name) {
    var m;
    loadJSONFile(function (response) {
        m = new MAP(canvas, response);
    }, "./resources/" + name + ".json");
    return m;
}

function doGravity() {
    for (var char of characters) {
        var x = char.getX() + char.getCenter();
        var y = char.getY();

        

        if (getBlock(x + char.getLastOffSet(), y).Id !== 0) {
            x += char.getLastOffSet();
        } else {
            x -= char.getLastOffSet();
        }
        
        


       if (getBlock(x, y).Id === 0) { //character is currently in the air
           for (var dY = 0; dY <= char.getVSpeed(); dY++) { //see if character can make the full journey
               if (getBlock(x, y + dY).Id !== 0) {
                   char.setVSpeed(dY);//character can only make the journey dY far
                   return;
               }
           }
           if (getBlock(x, y + char.getVSpeed()).Id === 0) {//char can rise or fall to air
                for (var dY = 0; dY <= gravity; dY++) { //see if character can make the full journey
                    if (getBlock(x + char.getHSpeed(), y + char.getVSpeed() + dY).Id !== 0) {
                        char.setVSpeed(char.getVSpeed() + dY - 1);//character can only make the journey dY far
                        return;
                    }
               }
                char.setVSpeed(char.getVSpeed() + gravity);
           } else { //reduce the speed so they can
               if (getBlock(x, y + char.getVSpeed()).Id === 0) {
               } else {
                   char.setVSpeed(1);
               }
            }
       } else { //character is on the ground
            char.setVSpeed(0);
        }
    }

}

function getBlock(X, Y) {
    if (tiles[X] === undefined) {
        tiles[X] = [];
    }
    if (tiles[X][Y] === undefined) {
        var block = {};
        block.Id = 0;
        block.meta = null;
        block.X = X;
        block.Y = Y;
        tiles[X][Y] = block;
    }
    return tiles[X][Y];
}



