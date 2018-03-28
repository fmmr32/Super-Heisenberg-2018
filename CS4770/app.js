var mongojs = require('mongojs');
var db = mongojs('localhost:27017/CS4770', ['account', 'player','progress','levels','entity','character','weapons','tiles','achievements']);



var express = require('express');
var fs = require('fs');
var app = express();
var serv = require('http').Server(app);

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
 
var isValidPassword = function(data,callback){
    db.account.find({username:data.username,password:data.password},function(err,res){
        
        if(res.length > 0) {
            callback(true);

        }else{
            callback(false);
        }
    });
     
};
var isUsernameTaken = function(data,callback){
    db.account.find({username:data.username},function(err,res){
        
        if(res.length > 0) {
            callback(true);

        }else{
            callback(false);
        }
    });
};
var addUser = function(data,callback){
    db.account.insert({username:data.username,password:data.password},function(err){
        callback();
    });
};


/*__________________________________________Load game thingies_________________________________*/

var loadDB = function (collection, callback) {
    console.log(collection + "inside loadDB game thingies");
    db.collection(collection).find({}, function (err, result) {
        callback(result);
    });
}

var loadDBFromID = function (collection, id_object, callback) {
    db.collection(collection).find({id:id_object}, function (err, result) {
        callback(result);
    });
}

/*_____________________________ Write Game Thingies _____________________________*/


var writeDB = function (data) {
    var object = data.data;
    console.log(object.id);
    db.collection(data.collection).update({ id: object.id }, object, { upsert: true });
}

/*_______________________________________________________________________________*/


var io = require('socket.io')(serv, {});
io.sockets.on('connection', function (socket) {
    console.log('socket connection');

    socket.on('loadDB', function (data) {
        loadDB(data.collection, function (result) {
            console.log(result);
			socket.emit(data.collection, result)
		})
    });

    socket.on('loadDBbasedID', function (data) {
        console.log(data.id);
        loadDBFromID(data.collection, data.id, function (result) {
            console.log("inside loaddbfromID" + result + "Inside loadDBFromID app.js");
            socket.emit(data.collection, result[0])
        })
    });

    socket.on('writeDB', function (data) {
		console.log("inside writeDB");
        writeDB(data);
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
 



	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	
	
	socket.on('signIn',function(data){
        isValidPassword(data,function(res){
            if(res){
                
                socket.emit('signInResponse',{success:true});
            } else {
                socket.emit('signInResponse',{success:false});         
            }
        });
    });
    
    socket.on('signUp',function(data){
        isUsernameTaken(data,function(res){
            if(res){
                socket.emit('signUpResponse',{success:false});     
            } else {
                addUser(data,function(){
                    socket.emit('signUpResponse',{success:true});                  
                });
            }
        });    
    });

}); 