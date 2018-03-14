//This loads things from the database
var loadDB = function (name, callback) {
    console.log("Inside first");
    socket.emit('loadDB', {
        collection: name
    });

    socket.on(name, function (data) {
        callback(data);
    });
}

var loadDBFromID = function (name, id_object, callback) {
    console.log("inside second");
    socket.emit('loadDBbasedID', {
        collection: name,
        id: id_object
    });

    socket.on(name, function (data) {
        callback(data);
    });
}

var writeDB = function (name, object) {
    socket.emit('writeDB', {
        collection: name,
        data: object
    });
}