var socket;
init();

window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    button = document.getElementById("submitButton");

    //listener for button click
    button.onclick = (function () {
        if (document.getElementById("playerName").value === "") {
            createLoginErrorText("* Username is required");
        } else {
            //check if the username isnt already taken first
            fetch("http://localhost:3000/login?username=" + document.getElementById("playerName").value)
                .then((res) => {
                    return res.json()
                        .then((data) => {
                            if (data.valid) {
                                document.getElementById("loginDiv").style.display = "none"; //hide main menu here
                                main();
                                state.playerName = document.getElementById("playerName").value;
                                //determine color from select
                                state.player.name = state.playerName;
                                let queryVal = createPacket(state);
                                socket = io.connect('', { query: queryVal });
                                state.socket = socket;
                            } else {
                                createLoginErrorText("* Username is already taken");
                            }
                        })
                })
                .catch((err) => {
                    console.error(err);
                })
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
        npcs: [],
        collisionMade: false,
        socketBools: {
            playerLeft: false,
            playerJoined: false,
            npcMoved: false
        },
        removePlayer: null, //player object to be removed
        addPlayer: null, //player object to be added
        movedNPC: null
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

    //setupGameFont(state);


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

            socket.once('npcMove', function (npc) {
                state.movedNPC = npc;
                state.socketBools.npcMoved = true;
            })

            socket.once('npcEat', function (foodObj) {
                removeObjectFromScene(state, foodObj);
            })
        }
        let forwardVector = state.camera.getWorldDirection(new THREE.Vector3());
        let sidewaysVector = new THREE.Vector3();
        sidewaysVector.crossVectors(forwardVector, state.player.up);

        //check collisions
        state.player.updateMatrixWorld(true);

        if (state.collidableObjects.length > 0) {
            var box = new THREE.Box3().setFromObject(state.player); //create collision box for player
            var collision = false;
            state.collidableObjects.map((object) => {
                var otherBox = new THREE.Box3().setFromObject(object); //create collision box for nearby object
                if (box.intersectsBox(otherBox)) {
                    collision = { status: true, collided: object };
                }
            })

        }

        checkForInput(state, forwardVector, sidewaysVector, collision);
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
        if (state.socketBools.npcMoved) {
            state.socketBools.npcMoved = false;
            addNPC(state, state.movedNPC);

        }
    }
    animate();

}

function createPacket(state) {

    let packet = {
        name: state.playerName,
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

    let playerToUpdate = state.scene.getObjectByName(player.name);

    if (playerToUpdate) {
        playerToUpdate.position.set(player.position.x, player.position.y, player.position.z);
        playerToUpdate.rotation.copy(player.rotation);
        playerToUpdate.updateMatrixWorld(true);
    }

}

function removePlayer(player, state) {

    let playerWhoLeft = state.scene.getObjectByName(player.name);

    if (playerWhoLeft && playerWhoLeft.children.length > 0) {
        for (let i = 0; i < playerWhoLeft.children.length; i++) {
            playerWhoLeft.children[i].geometry.dispose();
            playerWhoLeft.children[i].material.dispose();
            state.scene.remove(playerWhoLeft.children[i]);
        }
        playerWhoLeft.geometry.dispose();
        playerWhoLeft.material.dispose();
        state.scene.remove(playerWhoLeft);
        state.collidableObjects = [];
        state.allObjects.splice(state.allObjects.indexOf(playerWhoLeft), 1);
    }
}

function addNewPlayer(player, state) {

    if (!isPlayerInPlayerList(player.name, state)) {
        let playerCube = createCube(player.position, player.castShadow, player.receiveShadow, player.visible,
            [1, 1, 1], player.color, false, 1.0);
        playerCube.name = player.name;

        createPlayerNameText(state, playerCube);
        state.players.push({ name: player.name, objectIndex: state.scene.children.length, playerListIndex: state.players.length }); //indexes are unnecessary here
        state.scene.add(playerCube);
        state.allObjects.push(playerCube);
        console.log(`Added new player ${player.name}`)
    }
}

function addPlayersToScene(playerList, state) {
    let startIndex = state.scene.children.length;

    for (player in playerList) {
        let obj = playerList[player];
        let playerCube = createCube(obj.position, obj.castShadow, obj.receiveShadow, obj.visible,
            [1, 1, 1], obj.color, false, 1.0);

        console.log("GOT PLAYER LIST FROM SERVER");
        console.log(obj);
        playerCube.name = obj.name;
        createPlayerNameText(state, playerCube);
        state.players.push({ name: obj.name, objectIndex: startIndex, playerListIndex: state.players.length });
        state.scene.add(playerCube);
        state.allObjects.push(playerCube);
        startIndex++;
    }
}

function createRandomNumber(max, min) {
    return Math.random() * (max - min) + min;
}

function addNPC(state, npc) {

    if (state.npcs.indexOf(npc.npcName) === -1) {
        let npcObj = createCube(npc.currentPosition, true, true, [1, 1, 1], true, { r: npc.color[0], g: npc.color[1], b: npc.color[2] }, false, 1.0);
        //apply scale 
        npcObj.scale.x = npc.scale.x;
        npcObj.scale.y = npc.scale.y;
        npcObj.scale.z = npc.scale.z;
        npcObj.name = npc.npcName;
        state.npcs.push(npc.npcName);
        state.scene.add(npcObj);
        state.allObjects.push(npcObj);

    } else { //doing update on npc
        let movedNPC = state.scene.getObjectByName(npc.npcName);
        //apply scale
        movedNPC.scale.x = npc.scale.x;
        movedNPC.scale.y = npc.scale.y;
        movedNPC.scale.z = npc.scale.z;

        //apply color 
        movedNPC.material.color.r = npc.color[0];
        movedNPC.material.color.g = npc.color[1];
        movedNPC.material.color.b = npc.color[2];

        //apply transformation
        movedNPC.position.x = npc.currentPosition.x;
        movedNPC.position.y = npc.currentPosition.y;
        movedNPC.position.z = npc.currentPosition.z;
    }
    state.socketBools.movedNPC = false;
    state.movedNPC = null;
}

function removeObjectFromScene(state, objectName) {


    let objectToRemove = state.scene.getObjectByName(objectName);
    if (objectToRemove) {
        objectToRemove.geometry.dispose();
        objectToRemove.material.dispose();
        state.scene.remove(objectToRemove);
        state.collidableObjects = [];
        state.allObjects.splice(state.allObjects.indexOf(objectToRemove), 1);
    }
    //console.log(objectToRemove);

}

