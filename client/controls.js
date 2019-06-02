var movementSpeed = 0.08;
var sensitivity = 0.0065;

function movementControls(state) {

    document.addEventListener("keypress", (event) => {
        state.keyboard[event.key] = true;

    }, false)

    document.addEventListener('keyup', (event) => {
        state.keyboard[event.key] = false;
        //console.log(keysPressed);
        //movementControls(state);
    }, false)

    document.addEventListener('mousemove', (event) => {
        //console.log(event);

        if (event.buttons === 1) {
            //rotate player
            state.player.rotation.y -= event.movementX * sensitivity;
            sendMovementUpdate(state);
        }
})

}

function sendMovementUpdate(state) {
    let packet = {
        playerObject: {
            playerName: state.playerName,
            position: JSON.stringify(state.player.position),
            rotation: JSON.stringify(state.player.rotation),
            scale: JSON.stringify(state.player.scale),
            visible: state.player.visible,
            castShadow: state.player.castShadow,
            receiveShadow: state.player.receiveShadow,
            color: JSON.stringify({ r: state.player.material.color.r, g: state.player.material.color.g, b: state.player.material.color.b })
        },
        socketID: state.socket.id
    }

    socket.emit('playerUpdate', packet);
}

function moveForward(state, forwardVector) {
    state.player.position.x += movementSpeed * forwardVector.x;
    state.player.position.z += movementSpeed * forwardVector.z;

    state.camera.position.x += movementSpeed * forwardVector.x;
    state.camera.position.z += movementSpeed * forwardVector.z;
}
function moveBackward(state, forwardVector) {
    state.player.position.x -= movementSpeed * forwardVector.x;
    state.player.position.z -= movementSpeed * forwardVector.z;

    state.camera.position.x -= movementSpeed * forwardVector.x;
    state.camera.position.z -= movementSpeed * forwardVector.z;
}
function moveLeft(state, sidewaysVector) {
    state.player.position.x -= movementSpeed * sidewaysVector.x;
    state.player.position.z -= movementSpeed * sidewaysVector.z;

    state.camera.position.x -= movementSpeed * sidewaysVector.x;
    state.camera.position.z -= movementSpeed * sidewaysVector.z;
}
function moveRight(state, sidewaysVector) {
    state.player.position.x += movementSpeed * sidewaysVector.x;
    state.player.position.z += movementSpeed * sidewaysVector.z;

    state.camera.position.x += movementSpeed * sidewaysVector.x;
    state.camera.position.z += movementSpeed * sidewaysVector.z;
}