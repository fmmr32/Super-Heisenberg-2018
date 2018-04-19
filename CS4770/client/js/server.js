var socket = io();

/**
 * Loads anything from the database
 * @param {any} query - query to be searched inside the database
 * @param {any} collection - collections to be queried
 * @param {any} callback - the function to be called once the database has returned the data.
 */
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

/**
 * Writes any object to the database under the specified collection.
 * @param {any} name - collection name
 * @param {any} object - object to be written
 */
var writeDB = function (name, object) {
    socket.emit('writeDB', {
        collection: name,
        data: object
    });
}

/**
 * Seperate writeDB function for writing player data.
 */
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

/**
 * The handler for messages emitted from the server with the message 'signInResponse'. This executes once the 
 * database has successfully ran the query to see if the account is registered.
 */
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


/**
 * The handler for messages emitted from the server with the message 'signUpResponse'. This executes once the 
 * database has successfully ran the query to see if the account is already registered.
 */
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

//Handler for what to do once database has finished writing player progress.
socket.on('writePlayerFinished', function () {
    loadUserDatabase();
});

//Sends message to database for it to check and see if player is registered.
signDivSignIn.onclick = function () {
    playerUsername = signDivUsername.value;
    socket.emit('signIn', { username: signDivUsername.value, password: signDivPassword.value });
}

//Sends message to database for it to check if player is already registered.
signDivSignUp.onclick = function () {
    if (signDivPassword.value.length > 0) {
        socket.emit('signUp', { username: signDivUsername.value, password: signDivPassword.value });
    }
    else {
        alert("Password must not be empty");
    }
}

/**
 * Load a objects from specified JSON file
 * @param {any} callback - the function called once data retrieval is done
 * @param {any} file - the JSON file to retrieve the data from
 */
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

/**
 * Gets all files inside the path indicated under resources
 * @param {any} callback - what to do once retrieval has finished
 * @param {any} file - the folder to get all the files from.
 */
function getFiles(callback, file) {
    var path = "/client/resources/" + file;
    socket.emit('getFiles', { fileName: path });
    if (!socket.hasListeners(name)) {
        socket.on(path, function (data) {
            callback(data);
        });
    }
}

/**
 * Store a map as a local JSON file
 * @param {any} map - the map to be stored.
 */
function storeLocally(map) {
    socket.emit('storeLocally',  map);
}
