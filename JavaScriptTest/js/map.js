var tiles = [[], []];

MAP = function (container, file) {
    //make function that loads a resource from somewhere containing info of below
    loadBlocks(container, file);
};

function loadBlocks(container, file) {
    //make function that loads a resource from somewhere containing info of below
    var any = JSON.parse(file);
    for (var tile of any) {
        var block = {};
        block.Id = tile.blockId;
        block.meta = tile.meta;
        block.X = tile.blockX;
        block.Y = tile.blockY;

        tiles[tile.blockX, block.Y] = block;
        setSprite(container, block);
    }
}

function setSprite(container, block) {
    getSprite(block.Id).draw(block.X, block.Y);
}





