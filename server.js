const express = require('express');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var pg = require('pg');
var connString = "postgres://test:Entropy@localhost:5432/entropy";

var client = new pg.Client(connString);
client.connect();

var state = {
    players: {}
}


app.use(express.static('client'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/client.html');
});

app.get('/gameobjects', function (req, res) {
    //go to database and get gameobjects & their types
    client.query('SELECT * FROM gameobject LEFT OUTER JOIN gameobjecttype ON (gameobject.gameobjecttypeid = gameobjecttype.id) ', (error, results) => {
        if (error) {
            res.sendStatus(500);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(results.rows));
    })

})

io.on('connection', function (socket) {
    //check if player exists already

    if (!playerExistsObject(socket.id, state)) {
        let playerListSent = false;
        let playerJoinedSent = false;
        let playerObject = {};

        for (item in socket.handshake.query) {
            try {
                playerObject[item] = JSON.parse(socket.handshake.query[item]);
            } catch (e) {
                playerObject[item] = socket.handshake.query[item];
            }
        }
        state.players = {
            ...state.players,
            [socket.id]: {
                playerObject
            }

        }

        console.log(`Number of players: ${Object.keys(state.players).length},`);
        console.log(state.players);

        if (!playerListSent) {
            playerListSent = true;
            let playerList = sendPlayerListForPlayer(socket.id, state);
            io.to(socket.id).emit('playerListSend', playerList);

            //console.log(state.players[socket.id]);


            for (player in state.players) {
                //console.log(player);
                if (player !== socket.id) {
                    io.to(player.toString()).emit('playerJoined', state.players[socket.id]);
                }
            }
        }

    }

    socket.on('disconnect', function () {

        for (player in state.players) {
            //console.log(player);
            if (player !== socket.id) {
                io.to(player.toString()).emit('playerLeft', state.players[socket.id]);
            }
        }

        delete state.players[socket.id];
        console.log("DISCONNECT");
        console.log(`Number of players: ${Object.keys(state.players).length},`);
        console.log(state.players);

    });

    socket.on('playerUpdate', function (updateObject) {
        //console.log("player movement of " + updateObject);
        let userToUpdate = updatePlayer(updateObject, state);
        for (player in state.players) {
            if (player != userToUpdate) {
                //console.log(player);
                io.to(player.toString()).emit('playerUpdate', state.players[userToUpdate]);
            }
        }
    })
});

/**
 * 
 * @param {id of the user to send the list to} id 
 * @param {state variable containing all players} state 
 * Sends an object containing all the players except the one who requested it
 */
function sendPlayerListForPlayer(id, state) {
    let tempVar = Object.assign({}, state.players);
    delete tempVar[id];
    return tempVar;
}

function playerExistsObject(playerName, state) {
    if (playerName in state.players) {
        return true;
    }
    return false;
}

function updatePlayer(playerObj, state) {
    playerObj.playerObject = jsonParseObjectFields(playerObj.playerObject);
    state.players[playerObj.socketID] = { ...state.players[playerObj.socketID], ...playerObj };
    //console.log(state.players[playerObj.socketID]);
    //emit that player has changed to all other players
    return playerObj.socketID;
}

io.on('Something', function (socket) {
    console.log("something");
})

http.listen(3000, function () {
    console.log('listening on *:3000');
});

function jsonParseObjectFields(object) {
    let playerObject = {};

    for (item in object) {
        try {
            playerObject[item] = JSON.parse(object[item]);
        } catch (e) {
            playerObject[item] = object[item];
        }
    }

    return playerObject;
}