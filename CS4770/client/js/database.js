//This loads things from the database
var loadDB = function (type, callback) {
    console.log("inside loadDB");
    socket.emit('loadDB', {
        collection: type
    });

    socket.on(type, function (data) {
        newData = data[0];
        console.log("inside socket.on " + newData.playerName);
        callback(data);
    });
}

var writeDB = function (type, object) {
    socket.emit('type', {
        type: name,
        data: object
    });
}