var socket;

window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    button = document.getElementById("submitButton");

    //listener for button click
    button.onclick = (function () {
        main();
        state.playerName = document.getElementById("playerName").value;

        //determine color from select



        state.player.name = state.playerName;
        let queryVal = createPacket(state);
        console.warn(queryVal);
        socket = io.connect('', { query: queryVal });
        state.socket = socket;
    });

});

function main() {

    state = {
        player: null,
        players: [],
        playerName: null,
        socketMessages: {
            receivedInitialPlayerList: false
        }
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


    movementControls(state);

    let clock = new THREE.Clock();
    var scene = new THREE.Scene();
    state.scene = scene;
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    state.camera = camera;
    camera.position.set(0, 0, -10);

    var controls = new THREE.OrbitControls(state.camera);
    controls.update();

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    document.body.appendChild(renderer.domElement);

    let pointLight = createPointLight(0xffffff, 1.0, 100, 1, [0, 1, 0]);
    scene.add(pointLight);
    let ambientLight = createAmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);

    let playerCube = createCube({ x: createRandomNumber(5, -5), y: 0, z: 0 }, true, true, true, [1, 1, 1],
        state.color, false, 1.0);
    state.player = playerCube;

    scene.add(playerCube);
    state.camera.lookAt(state.player.position);


    controls.target = state.player.position;
    controls.enablePan = false;

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
                addNewPlayer(player, state);
            })

            socket.on('playerLeft', function (player) {
                removePlayer(player, state);
            })

            socket.on('playerUpdate', function (playerToUpdate) {
                updatePlayer(playerToUpdate, state);
            })
        }

        controls.update();
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
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

function isPlayerInPlayerList(playerName, state) {
    for (let i = 0; i < state.players.length; i++) {
        if (playerName === state.players[i]) {
            return true;
        }
    }

    return false;
}

function updatePlayer(player, state) {
    let playerObj = player.playerObject;

    //map the variables of the mesh to the corresponding values sent from the server
    for (child in state.scene.children) {
        if (state.scene.children[child].name === player.playerObject.playerName) {
            let scenePlayerToUpdate = state.scene.children[child];

            //position first
            scenePlayerToUpdate.position.set(playerObj.position.x, playerObj.position.y, playerObj.position.z);

            //rotation next
            scenePlayerToUpdate.rotation.copy(playerObj.rotation);
            scenePlayerToUpdate.updateMatrixWorld(true);
        }
    }
}

function removePlayer(player, state) {
    for (child in state.scene.children) {
        //console.log(state.scene.children[child].name + " vs. " + player.playerObject.playerName);
        if (state.scene.children[child].name === player.playerObject.playerName) {
            console.log(state.scene.children[child]);
            //remove from players array
            state.players.splice(state.players.indexOf(player.playerObject.playerName), 1);
            state.scene.remove(state.scene.children[child]);
        }
    }
}

function addNewPlayer(player, state) {
    if (!isPlayerInPlayerList(player.playerObject.playerName, state)) {
        let obj = player.playerObject;
        let playerCube = createCube(obj.position, obj.castShadow, obj.receiveShadow, obj.visible,
            obj.geometry, obj.color, false, 1.0);

        playerCube.name = obj.playerName;
        state.scene.add(playerCube);
        state.players.push(obj.playerName);
        console.log(`Added new player ${obj.playerName}`)
        console.log(state.players);
    }
}

function addPlayersToScene(playerList, state) {
    for (player in playerList) {
        console.warn(playerList);

        let obj = playerList[player].playerObject;
        let playerCube = createCube(obj.position, obj.castShadow, obj.receiveShadow, obj.visible,
            obj.geometry, obj.color, false, 1.0);

        playerCube.name = obj.playerName;
        state.scene.add(playerCube);
        state.players.push(obj.playerName);
    }
}

function createRandomNumber(max, min) {
    return Math.random() * (max - min) + min;
}

