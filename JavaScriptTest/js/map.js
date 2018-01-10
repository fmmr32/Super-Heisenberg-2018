
MAP = function (container) {
    //make function that loads a resource from somewhere containing info of below

    var temp = new Map();
    //need something better fort this
    var floor = '[ {"id":1, "name": "dirt", "source": "../JavaScriptTest/resources/tiles.png", "width": 32,"heigth": 10,"startX": 0,"startY": 12}, {"id":2,"name":"stone","source": "../JavaScriptTest/resources/tiles.png", "width": 32,"heigth": 10,"startX": 0,"startY": 43}]';

    loadSprites(floor, container);

    getSprite(2).draw(150, 100);
    getSprite(1).draw(100, 100); 
};





