var socket = io();

var loadDBFromQuery = function (query, collection, callback) {
    console.log(query + " " + collection);
    socket.emit('loadDBFromQuery', {
        query: query,
        collection: collection
    });

    if (socket.hasListeners(collection)) {
        console.log("inside socket.haslisteners");
        socket.removeListener();
    }

    socket.on(collection, function (data) {
        console.log(data);
        console.log(data[0]);
        callback(data);
    });

}


var writeDB = function (name, object) {
    socket.emit('writeDB', {
        collection: name,
        data: object
    });
}

var writePlayerDB = function (name, object) {
    socket.emit('writePlayerDB', {
        collection: name,
        data: object
    });
}


/*_________________________________________________________________________________*/

//login menu
var signDiv = document.getElementById('signDiv');
var signDivUsername = document.getElementById('signDiv-username');
var signDivSignIn = document.getElementById('signDiv-signIn');
var signDivSignUp = document.getElementById('signDiv-signUp');
var signDivPassword = document.getElementById('signDiv-password');
var menuDiv = document.getElementById("mainMenu");
var offLinePlay = document.getElementById("skipSign");

var playerUsername;

var getUsername = function () {
    return playerUsername;
}

socket.on('signInResponse', function (data) {
    if (data.success) {
        playerUsername = signDivUsername.value;

        document.getElementById("signDiv").style.display = "none";
        document.getElementById("mainMenu").style.display = "table-cell";
        loadUserDatabase();
        loadMenu();
        
    } else
        alert("Sign in unsuccessul.");
});



socket.on('signUpResponse', function (data) {
    if (data.success) {
        alert("Sign up successul.");

        playerUsername = signDivUsername.value;

        document.getElementById("signDiv").style.display = "none";
        document.getElementById("mainMenu").style.display = "table-cell";

        loadJSONFile(function (response) {
            var playerObject = JSON.parse(response);
            playerObject.id = getUsername();
            writePlayerDB('player', playerObject);
        }, "/client/resources/jsons/player.json");
        loadUserDatabase();
        loadMenu();

    } else
        alert("Sign up unsuccessul.");
});

socket.on('writePlayerFinished', function () {
    loadUserDatabase();
});


signDivSignIn.onclick = function () {
    playerUsername = signDivUsername.value;
    socket.emit('signIn', { username: signDivUsername.value, password: signDivPassword.value });
}


signDivSignUp.onclick = function () {
    if (signDivPassword.value.length > 0) {
        socket.emit('signUp', { username: signDivUsername.value, password: signDivPassword.value });
    }
    else {
        alert("Password must not be empty");
    }
}


function loadJSONFile(callback, file) {
    socket.emit('loadJSON', {
        fileName: file
    });
    if (!socket.hasListeners(name)) {
        socket.on(file, function (data) {
            callback(data.toString());
        });
    }
}

function getFiles(callback, file) {
    var path = "/client/resources/" + file;
    socket.emit('getFiles', { fileName: path });
    if (!socket.hasListeners(name)) {
        socket.on(path, function (data) {
            callback(data);
        });
    }
}

function storeLocally(map) {
    socket.emit('storeLocally',  map);
}
