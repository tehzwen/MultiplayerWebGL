const express = require('express');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var pg = require('pg');
var connString = "postgres://test:Entropy@localhost:5432/entropy";
const cors = require('cors');
var Npc = require('./Npc.js')

var client = new pg.Client(connString);
client.connect();

var state = {
    players: {},
    objects: [],
    disconnectSent: false
}

let something = new Npc(state, io, client, { x: 0.0, y: 0.0, z: 0.0 }, "Khan");


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static('client'));


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/client.html');
});

app.get('/gameobjects', cors(), function (req, res) {
    //go to database and get gameobjects & their types
    console.log("QUERY FOR GAME OBJECTS");
    client.query('SELECT * FROM gameobject LEFT OUTER JOIN gameobjecttype ON (gameobject.gameobjecttypeid = gameobjecttype.id) ', (error, results) => {
        if (error) {
            res.sendStatus(500);
        }

        res.setHeader('Access-Control-Allow-Origin', "*");
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(results.rows));
    })
})

app.get('/login', (req, res) => {
    let valid = true;

    for (let player in state.players) {
        if (state.players[player].name === req.query.username) {
            valid = false;
        }
    }

    res.send({valid});
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

        state.players[socket.id] = playerObject;

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
                    io.to(player).emit('playerJoined', state.players[socket.id]);
                }
            }
        }

    }

    socket.on('disconnect', function () {
        //console.log("DISCONNECT");

        for (player in state.players) {
            if (player !== socket.id && !state.disconnectSent) {
                io.to(player).emit('playerLeft', state.players[socket.id]);
            }
        }

        delete state.players[socket.id];

        console.log(`Number of players: ${Object.keys(state.players).length},`);
        console.log(state.players);

    });

    socket.on('playerUpdate', function (updateObject) {
        //console.log("player movement of " + updateObject);
        let userToUpdate = updatePlayer(updateObject, state);
        for (player in state.players) {
            if (player != userToUpdate) {
                //console.log(player);
                io.to(player).emit('playerUpdate', state.players[userToUpdate]);
            }
        }
    })

    socket.on('objectCreated', function (newObjectPacket) {
        for (player in state.players) {
            if (newObjectPacket.socketID !== player) {
                io.to(player).emit('objectCreated', newObjectPacket);
            }
        }

        let tempObj = {
            positionx: newObjectPacket.position.x,
            positiony: newObjectPacket.position.y,
            positionz: newObjectPacket.position.z,
            id: newObjectPacket.objectTypeID,
            color:[newObjectPacket.color.r, newObjectPacket.color.g, newObjectPacket.color.b],
            scale: newObjectPacket.scale,
            name: newObjectPacket.name
        }

        state.objects.push(tempObj);
        console.log(state.objects);
        //insert object into database but first check if it has already been accounted for
        if (state.objects.indexOf(newObjectPacket.uuid) === -1) {
            console.log(newObjectPacket.name);
            
            client.query(`INSERT INTO gameobject (positionx, positiony, gameobjecttypeid, positionz, color, scale, name) 
                VALUES(${newObjectPacket.position.x}, ${newObjectPacket.position.y},
                 ${newObjectPacket.objectTypeID}, ${newObjectPacket.position.z}, '{${newObjectPacket.color.r}, 
                 ${newObjectPacket.color.g}, ${newObjectPacket.color.b}}', '{${newObjectPacket.scale}}', '${newObjectPacket.name}');`,
                (error, results) => {
                    if (error) {
                        console.error(error);
                    } else {
                        console.log(`Object ${newObjectPacket.uuid} successfully added to database`);
                    }
                })
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
    playerObj = jsonParseObjectFields(playerObj);
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
    client.query('SELECT * FROM gameobject LEFT OUTER JOIN gameobjecttype ON (gameobject.gameobjecttypeid = gameobjecttype.id) where gameobject.gameobjecttypeid=1 ', (error, results) => {
        for (let object in results.rows) {
            state.objects.push(results.rows[object]);
        }
    })
    something.startMainLoop();
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
