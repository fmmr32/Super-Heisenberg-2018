var socket = io();

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
    document.getElementById("signDiv").style.display = "none";
    document.getElementById("mainMenu").style.display = "table-cell";
}

signDivSignUp.onclick = function () {
    socket.emit('signUp', { username: signDivUsername.value, password: signDivPassword.value });
    document.getElementById("signDiv").style.display = "none";
    document.getElementById("mainMenu").style.display = "table-cell";
}

socket.on('signInResponse', function (data) {
    if (data.success) {
        playerUsername = signDivUsername.value;
        console.log(playerUsername);
        loadMenu();
    } else
        alert("Sign in unsuccessul.");
});

socket.on('signUpResponse', function (data) {
    if (data.success) {
        alert("Sign up successul.");
    } else
        alert("Sign up unsuccessul.");
});

function loadJSONFile(callback, file) {
    socket.emit('loadJSON', {
        fileName: file
    });
    socket.on(file, function (data) {
        callback(data.toString());
    });
}