CONFIG = function (json) {
    json = JSON.parse(json);
    var button = [];
    button[json.left] = "left";
    button[json.right] = "right";
    button[json.up] = "up";
    button[json.jump] = "jump";
    button[json.fire] = "fire";

    return button;

};