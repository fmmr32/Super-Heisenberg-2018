var mongojs = require('mongojs');
var db = mongojs('localhost:27017/cs4770', ['account', 'player', 'progress', 'levels', 'entity', 'character', 'weapons', 'tiles', 'achievements']);

var express = require('express');
var fs = require('fs');
var app = express();
var serv = require('http').Server(app);


//Shuts down the database properly
process.on('SIGHUP', function () {
    db.close();
    console.log('About to exit');
    process.exit();
});


//Specifies which directories are to be used
app.use(express.static(__dirname + '/client'));
app.use(express.static(__dirname + '/client/js'));
app.get('/', function (req, res) {
    console.log('/client/js/editor.html');
    res.sendFile(__dirname + '/client/js/editor.html');
});

app.get('/editor', function (req, res) {
    res.sendFile(__dirname + '/client/editor.html');
});



serv.listen(3000);
console.log("Server started.");

var SOCKET_LIST = {};


/*________________________________________Login____________________________________________________________*/

/**
 * Checks if entered login info is okay
 * @param {any} data - the object containing the entered username and password
 * @param {any} callback - the function to be called when query has finished
 */
var isValidLogin = function (data, callback) {
    db.account.find({ username: data.username, password: data.password }, function (err, res) { 
        if (res.length > 0) {
            callback(true);

        } else {
            callback(false);
        }
    });

};

/**
 * Checks if username has already been registered
 * @param {any} data - the object containing the entered username
 * @param {any} callback - the function to be called when query has finished
 */
var isUsernameTaken = function (data, callback) {
    db.account.find({ username: data.username }, function (err, res) {
        if (res.length > 0) {
            callback(true);

        } else {
            callback(false);
        }
    });
};

/**
 * Registers user 
 * @param {any} data - The login info to be stored on the database
 * @param {any} callback - What to be done after database insertion is finished
 */
var addUser = function (data, callback) {
    db.account.insert({ username: data.username, password: data.password }, function (err) {
        callback();
    });
};


/*__________________________________________Load game thingies_________________________________*/


/**
 * Loads anything from the database.
 * @param {any} query - info to match
 * @param {any} collection - the collection to be queried
 * @param {any} callback - what to do when done
 */
var loadDBFromQuery = function (query, collection, callback) {
    if (query == null) {
        console.log("inside if");
        db.collection(collection).find({}, function (err, result) {
            callback(result);
        });
    }
    else {
        console.log("inside else");
        db.collection(collection).find(query, function (err, result) {
            callback(result);
        });
    }
}

/*_____________________________ Write Game Thingies _____________________________*/

/**
 * Writes an object to the database
 * @param {any} data - contains the object and collection the object will be written to
 */
var writeDB = function (data) {
    var object = data.data;
    console.log(object._id);
    console.log(object.id);
    console.log("inside upsert");
    db.collection(data.collection).update({ id: object.id }, object, { upsert: true });
}

/**
 * Writes player object to database, containing their progress
 * @param {any} data - contains the object and collection the object will be written to
 * @param {any} callback - what to do when it has finished
 */
var writePlayerDB = function (data, callback) {
    var object = data.data;
    console.log(object._id);
    console.log(object.id);
    console.log("inside upsert");
    db.collection(data.collection).update({ id: object.id }, object, { upsert: true }, function (err, res) {
        callback();
    });
}

/*_______________________________________________________________________________*/

var io = require('socket.io')(serv, {});
io.sockets.on('connection', function (socket) {
    console.log('socket connection');


    socket.on('loadDBFromQuery', function (data) {
        console.log(data.query);
        loadDBFromQuery(data.query, data.collection, function (result) {
            console.log("inside loadDBbasedLevelName " + data.query + " inside loadDBbasedLevelName");
            console.log(result);
            socket.emit(data.collection, result)
        })
    });

    socket.on('writeDB', function (data) {
        console.log("inside writeDB");
        writeDB(data);
    });

    socket.on('writePlayerDB', function (data) {
        console.log("inside writePlayerDB");
        writePlayerDB(data, function () {
            socket.emit('writePlayerFinished');
        });
    });

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

    var DEBUG = true;

    socket.on('getFiles', function (data) {
        console.log(data.fileName);
        var files = [];
        console.log(data);
        var f = fs.readdirSync(__dirname + data.fileName);
        console.log(f);
        socket.emit(data.fileName, f);
    });


    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;


    socket.on('signIn', function (data) {
        isValidLogin(data, function (res) {
            if (res) {
                socket.emit('signInResponse', { success: true });
            } else {
                socket.emit('signInResponse', { success: false });
            }
        });
    });

    socket.on('signUp', function (data) {
        isUsernameTaken(data, function (res) {
            if (res) {
                socket.emit('signUpResponse', { success: false });
            } else {
                addUser(data, function () {
                    socket.emit('signUpResponse', { success: true });
                });
            }
        });
    });

    socket.on('storeLocally', function (map) {
        var name = map.levelName;
        var path = __dirname + "/client/resources/localLevels/" + name + ".json";
        fs.writeFile(path, JSON.stringify(map), 'utf-8', function (err) {
            if (err) throw err;
            console.log("HOORAY");
        });
    })

    
}); 