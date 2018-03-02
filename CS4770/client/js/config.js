CONFIG = function (json) {
    json = JSON.parse(json);
    var button = [];
    for (var any of Object.keys(json)) {
        button[json[any]] = any;
    }
    return button;

};