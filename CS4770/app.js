var mongojs = require('mongojs');
var db = mongojs('localhost:27017/CS4770GAME',['account','progress']);



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

var SOCKET_LIST = {};



 
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