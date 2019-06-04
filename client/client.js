var socket;
init();

window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    button = document.getElementById("submitButton");

    //listener for button click
    button.onclick = (function () {
        //hide main menu here
        if (document.getElementById("playerName").value != "") {
            document.getElementById("loginDiv").style.display = "none";

            main();
            state.playerName = document.getElementById("playerName").value;

            //determine color from select



            state.player.playerName = state.playerName;
            let queryVal = createPacket(state);
            socket = io.connect('', { query: queryVal });
            state.socket = socket;
        } else {
            let errorMessage = document.getElementById("userNameErrorText");
            errorMessage.style.display = "";
        }

    });

});

function main() {

    state = {
        player: null,
        players: [],
        playerName: null,
        keyboard: { movementMade: false },
        socketMessages: {
            receivedInitialPlayerList: false
        },
        createdObject: false,
        objects: [],
        collidableObjects: [],
        allObjects: [],
        collisionMade: false,
        socketBools: {
            playerLeft: false,
            playerJoined: false
        },
        removePlayer: null, //player object to be removed
        addPlayer: null //player object to be added
    };

    let color = document.getElementById("colorSelect").value;

    if (color === "red") {
        state.color = { r: 1.0, g: 0.0, b: 0.0 }
    } else if (color === "green") {
        state.color = { r: 0.0, g: 1.0, b: 0.0 }
    } else if (color === "blue") {
        state.color = { r: 0.0, g: 0.0, b: 1.0 }
    } else if (color === "white") {
        state.color = { r: 1.0, g: 1.0, b: 1.0 }
    }

    initObjects(state);

    movementControls(state);
    //mouseLookControls(state);

    let clock = new THREE.Clock();
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    state.scene = scene;
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    state.camera = camera;

    var controls = new THREE.OrbitControls(state.camera);
    state.controls = controls;
    //controls.update();

    //create jsonloader 
    let jsonLoader = new THREE.ObjectLoader();
    state.loader = jsonLoader;

    var renderer = new THREE.WebGLRenderer({ powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    document.body.appendChild(renderer.domElement);

    let pointLight = createPointLight(0xffffff, 1.0, 100, 1, [0, 1, 0]);
    scene.add(pointLight);
    let ambientLight = createAmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);

    let playerCube = createCube({ x: createRandomNumber(15, -15), y: 0, z: 0 }, true, true, true, [1, 1, 1],
        state.color, false, 1.0);
    state.player = playerCube;

    scene.add(playerCube);



    controls.enablePan = false;

    state.camera.position.set(state.player.position.x, 0.0, -5.0);
    state.camera.lookAt(state.player.position);
    controls.target = state.player.position;

    //var controls = new THREE.PointerLockControls(state.camera);
    //state.scene.add(state.controls.getObject()); //camera is still slightly broken

    setupGameFont(state);


    /**
     * test of making text over player head
     */
    //state.scene.add(new THREE.TextGeometry())
    function animate() {
        if (socket) {
            if (!state.socketMessages.receivedInitialPlayerList) {
                socket.on('playerListSend', function (playerList) {
                    addPlayersToScene(playerList, state);
                })
                state.socketMessages.receivedInitialPlayerList = true;
            }

            socket.on('playerJoined', function (player) {
                //add new player to scene
                //addNewPlayer(player, state);
                state.socketBools.playerJoined = true;
                state.addPlayer = player;
            })

            socket.once('playerLeft', function (player) {
                state.removePlayer = player;
                state.socketBools.playerLeft = true;
            })

            socket.on('playerUpdate', function (playerToUpdate) {
                updatePlayer(playerToUpdate, state);
            })

            socket.on('objectCreated', function (createdObject) {
                loadCreatedObject(state, createdObject);
            })
        }
        let forwardVector = state.camera.getWorldDirection(new THREE.Vector3());
        let sidewaysVector = new THREE.Vector3();
        sidewaysVector.crossVectors(forwardVector, state.player.up);

        //check collisions

        if (state.collidableObjects.length > 0) {
            for (var vertexIndex = 0; vertexIndex < state.player.geometry.vertices.length; vertexIndex++) {
                var localVertex = state.player.geometry.vertices[vertexIndex].clone();
                var globalVertex = localVertex.applyMatrix4(state.player.matrix)
                //var globalVertex = state.player.matrix.multiplyVector3(localVertex);
                var directionVector = globalVertex.sub(state.player.position);

                var ray = new THREE.Raycaster(state.player.position, directionVector.clone().normalize());
                var collisionResults = ray.intersectObjects(state.collidableObjects);

                // This will check the collision with other objects. If it detects collision, the player will be unable to move
                if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {

                    let collisionVector = new THREE.Vector3();


                    state.collisionMade = true;

                    collisionVector.subVectors(state.player.position, collisionResults[0].point).normalize();


                    let sideColVector = new THREE.Vector3();
                    sideColVector.crossVectors(collisionVector, state.player.up);
                    forwardVector = collisionVector;
                    sidewaysVector = sideColVector;
                }
                else {
                    // Else, the player can move forwards

                }
            }
        }

        //console.log(state);

        checkForInput(state, forwardVector, sidewaysVector);
        collidableDistanceCheck(state, 3);
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        state.collisionMade = false;
        if (state.socketBools.playerLeft) {
            state.socketBools.playerLeft = false;
            removePlayer(state.removePlayer, state);
        }
        if (state.socketBools.playerJoined) {
            state.socketBools.playerJoined = false;
            addNewPlayer(state.addPlayer, state);
        }
    }
    animate();

}

function createPacket(state) {

    let packet = {
        playerName: state.playerName,
        position: JSON.stringify(state.player.position),
        rotation: JSON.stringify(state.player.rotation),
        scale: JSON.stringify(state.player.scale),
        visible: state.player.visible,
        castShadow: state.player.castShadow,
        receiveShadow: state.player.receiveShadow,
        geometry: JSON.stringify([state.player.geometry.parameters.width, state.player.geometry.parameters.height, state.player.geometry.parameters.depth]),
        color: JSON.stringify({ r: state.player.material.color.r, g: state.player.material.color.g, b: state.player.material.color.b })

    }

    return packet;
}

function determineLowestDifference(vec1, vec2) {
    let xDiff = Math.abs(vec1.x - vec2.x);
    let yDiff = Math.abs(vec1.y - vec2.y);
    let zDiff = Math.abs(vec1.z - vec2.z);

    if (xDiff < zDiff) {
        return "x";
    } else if (zDiff < xDiff) {
        return "z";
    } else {
        return "No idea";
    }
}

function initObjects(state) {
    //send get request for existing game object data
    fetch(serverIP + ":3000/gameobjects", { mode: 'cors' })
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            //iterate through data and create objects 
            data.map((item) => {
                createGameObjectsFromServerFetch(state, item);
            })
        })
        .catch((err) => {
            console.error(err);
        })
}

function isPlayerInPlayerList(playerName, state) {
    let playerObj = state.players.find((value) => {
        return value.playerName === playerName
    })

    if (playerObj !== undefined) {
        return true;
    }
    return false;
}

function updatePlayer(player, state) {
    let playerObj = player.playerObject;

    let playerToUpdate;
    //console.log(state.players);
    //console.log(player);

    for (let i = 0; i < state.players.length; i++) {
        if (playerObj.playerName === state.players[i].name) {
            playerToUpdate = state.players[i];
        }
    }

    //console.log(playerToUpdate);
    if (playerToUpdate) {
        state.scene.children[playerToUpdate.objectIndex].position.set(playerObj.position.x, playerObj.position.y, playerObj.position.z);
        state.scene.children[playerToUpdate.objectIndex].rotation.copy(playerObj.rotation);
        state.scene.children[playerToUpdate.objectIndex].updateMatrixWorld(true);
    }

    //map the variables of the mesh to the corresponding values sent from the server
    /*for (child in state.scene.children) {
        if (state.scene.children[child].playerName === player.playerObject.playerName) {
            let scenePlayerToUpdate = state.scene.children[child];

            //position first
            scenePlayerToUpdate.position.set(playerObj.position.x, playerObj.position.y, playerObj.position.z);

            //rotation next
            scenePlayerToUpdate.rotation.copy(playerObj.rotation);
            scenePlayerToUpdate.updateMatrixWorld(true);
        }
    } */

    

    //state.scene.children[]
}

function removePlayer(player, state) {

    //look through player array for this player name, then remove at its index in the scene objects
    let playerObj = state.players.find((value) => {
        return value.playerName === player.playerName
    })
    state.scene.children[playerObj.objectIndex]

    if (state.scene.children[playerObj.objectIndex].children.length > 0) {
        for (let i = 0; i < state.scene.children[playerObj.objectIndex].children.length; i++) {
            state.scene.children[playerObj.objectIndex].children[i].geometry.dispose();
            state.scene.children[playerObj.objectIndex].children[i].material.dispose();
            state.scene.remove(state.scene.children[playerObj.objectIndex].children[i]);
        }
    }

    state.scene.children[playerObj.objectIndex].geometry.dispose();
    state.scene.children[playerObj.objectIndex].material.dispose();
    state.scene.remove(state.scene.children[playerObj.objectIndex]);
    state.collidableObjects = [];
    state.players.splice(playerObj.playerListIndex, 1);



}

function addNewPlayer(player, state) {
    //console.log(player);

    if (!isPlayerInPlayerList(player.playerObject.playerName, state)) {
        let obj = player.playerObject;
        let playerCube = createCube(obj.position, obj.castShadow, obj.receiveShadow, obj.visible,
            [1, 1, 1], obj.color, false, 1.0);
        playerCube.playerName = obj.playerName;

        createPlayerNameText(state, playerCube);
        state.players.push({ name: obj.playerName, objectIndex: state.scene.children.length, playerListIndex: state.players.length });
        state.scene.add(playerCube);
        state.allObjects.push(playerCube);
        console.log(`Added new player ${obj.playerName}`)
        console.log(state.players);
        console.log("here");
    }
}

function addPlayersToScene(playerList, state) {
    for (player in playerList) {
        let obj = playerList[player].playerObject;
        let playerCube = createCube(obj.position, obj.castShadow, obj.receiveShadow, obj.visible,
            [1, 1, 1], obj.color, false, 1.0);

        console.log("GOT PLAYER LIST FROM SERVER");
        playerCube.playerName = obj.playerName;
        createPlayerNameText(state, playerCube);

        state.allObjects.push(playerCube);
        state.players.push({ name: obj.playerName, objectIndex: state.scene.children.length, playerListIndex: state.players.length });
        state.scene.add(playerCube);
    }
}

function createRandomNumber(max, min) {
    return Math.random() * (max - min) + min;
}

