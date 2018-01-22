var mongojs = require('mongojs');
var express = require('express');
var fs = require('fs');
var app = express();
var serv = require('http').Server(app);

app.use(express.static(__dirname + '/client'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});



serv.listen(3000);
console.log("Server started.");

var io = require('socket.io')(serv, {});
io.sockets.on('connection', function (socket) {
    console.log('socket connection');

   
    socket.on('loadJSON', function (data) {
        console.log(data.fileName);
        var fileName = data.fileName;
        fs.readFile(__dirname + data.fileName, "utf8", function read(err, data) {
            if (err) {
                throw err;
            }

            var substring = data.trim();

            socket.emit(fileName, substring);
        });
    });
}); 