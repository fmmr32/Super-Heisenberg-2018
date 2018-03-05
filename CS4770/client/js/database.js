//This loads things from the database
var loadDB = function (type, callback) {
    socket.emit('loadDB', {
        collectionName: type
    });

    socket.on('levelList', function (data) {
        callback(data.toString());
    });
}

var writeDB = function (type, data) {
    socket.emit('type', {
        type: name,
        data: data
    });
}