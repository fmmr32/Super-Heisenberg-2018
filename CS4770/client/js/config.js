var changer = [];
var isChanging = false;

CONFIG = function (json) {
    json = JSON.parse(json);
    var button = [];
    for (var any of Object.keys(json)) {
        button[json[any]] = any;
    }
    setConf(button);

    return button;

};

function setConf(button) {
    var settingsTable = document.getElementById("gameSettings");
    settingsTable.removeChild(settingsTable.children[0]);
    settingsTable.appendChild(document.createElement("tbody"));

    for (var b of Object.keys(button)) {
        var row = settingsTable.insertRow(0);
        var cell1 = row.insertCell(0);
        row.onclick = function () { isChanging = true; changer[0] = this.cells[1].innerHTML; };
        var cell2 = row.insertCell(1);
       
        cell2.innerHTML = button[b];
        var t = String.fromCharCode(b);
        if (t == " ") { t = "Space" }
        cell1.innerHTML = t;
    }
}

function changeKey(char) {
    if (conf[char] == undefined) {
        delete conf[conf.indexOf(changer[0])];
        conf[char] = changer[0];
        isChanging = false;
        setConf(conf);
    }
}