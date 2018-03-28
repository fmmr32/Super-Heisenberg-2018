var socket = io();

//This loads things from the database
var loadDB = function (name, callback) {
    socket.emit('loadDB', {
        collection: name
    });

    if (!socket.hasListeners(name)) {
        socket.on(name, function (data) {
            callback(data);
        });
    }

    
}

var loadDBFromID = function (name, id_object, callback) {
    socket.emit('loadDBbasedID', {
        collection: name,
        id: id_object
    });

    if (!socket.hasListeners(name)) {
        socket.on(name, function (data) {
            callback(data);
        });
    }
}

var writeDB = function (name, object) {
    socket.emit('writeDB', {
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


signDivSignIn.onclick = function () {
    playerUsername = signDivUsername.value;
    console.log(playerUsername);
    socket.emit('signIn', { username: signDivUsername.value, password: signDivPassword.value });

    if (!socket.hasListeners("signInResponse")) {
        socket.on('signInResponse', function (data) {
            if (data.success) {
                playerUsername = signDivUsername.value;
                
                document.getElementById("signDiv").style.display = "none";
                document.getElementById("mainMenu").style.display = "table-cell";

                loadMenu();
            } else
                alert("Sign in unsuccessul.");
        });
    }
}


signDivSignUp.onclick = function () {
    socket.emit('signUp', { username: signDivUsername.value, password: signDivPassword.value });

    if (!socket.hasListeners("signUpResponse")) {
        console.log("Inside sign up");
        socket.on('signUpResponse', function (data) {
            if (data.success) {
                alert("Sign up successul.");

                document.getElementById("signDiv").style.display = "none";
                document.getElementById("mainMenu").style.display = "table-cell";
            } else
                alert("Sign up unsuccessul.");
        });
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