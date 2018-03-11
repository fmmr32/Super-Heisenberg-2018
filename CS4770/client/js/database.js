//This loads things from the database
var loadDB = function (name, callback) {
    console.log("inside loadDB");
    socket.emit('loadDB', {
        collection: name
    });

    socket.on(type, function (data) {
        newData = data[0];
        console.log("inside socket.on " + newData.playerName);
        callback(data);
    });
}

var writeDB = function (name, object) {
    socket.emit('writeDB', {
        collection: name,
        data: object
    });
}