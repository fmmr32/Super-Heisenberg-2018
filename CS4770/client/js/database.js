//This loads things from the database
var loadDB = function (name, callback) {
    socket.emit('loadDB', {
        collection: name
    });

    socket.on(type, function (data) {
        callback(data);
    });
}

var loadDB = function (name, id_object, callback) {
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