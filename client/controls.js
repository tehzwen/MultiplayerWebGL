var movementSpeed = 0.12;
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

            const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

            state.player.rotation.y -= movementX * sensitivity;


            state.camera.rotation.y -= movementX * sensitivity;
            //state.camera.rotation.x -= event.movementY * sensitivity;
            sendMovementUpdate(state);
        }
    })

}

function checkForInput(state, forwardVector, sidewaysVector, collision) {

    if (collision && collision.status) { //collision has occured
        let oppositeDir = new THREE.Vector3();
        oppositeDir.subVectors(state.player.position, collision.collided.position);
        // var arrowHelper = new THREE.ArrowHelper(oppositeDir, state.player.position, 1, 0xffff00)
        // state.scene.add(arrowHelper);

        moveCollision(state, oppositeDir);
        state.keyboard.movementMade = true;


    } else if (!state.chat.status) {
        if (state.keyboard['w']) {
            moveForward(state, forwardVector);
            state.keyboard.movementMade = true;
        }
        if (state.keyboard['s']) {
            moveBackward(state, forwardVector);
            state.keyboard.movementMade = true;
        }
        if (state.keyboard['a']) {
            moveLeft(state, sidewaysVector);
            state.keyboard.movementMade = true;
        }
        if (state.keyboard['d']) {
            moveRight(state, sidewaysVector);
            state.keyboard.movementMade = true;
        }

        if (state.keyboard['e']) {
            if (!state.createdObject) {
                state.createdObject = true;
                let placementVector = new THREE.Vector3();
                let forwardVectorProper = forwardVector.clone();
                forwardVectorProper.multiplyScalar(2);
                forwardVectorProper.y = state.player.position.y;
                placementVector.addVectors(state.player.position, forwardVectorProper);
                createObject(state, 1, placementVector);
            }

        }
    }

    if (state.keyboard.movementMade) {
        sendMovementUpdate(state);
        state.keyboard.movementMade = false;
    }
}

function sendMovementUpdate(state) {
    let packet = {
        name: state.playerName,
        position: JSON.stringify(state.player.position),
        rotation: JSON.stringify(state.player.rotation),
        scale: JSON.stringify(state.player.scale),
        visible: state.player.visible,
        castShadow: state.player.castShadow,
        receiveShadow: state.player.receiveShadow,
        color: JSON.stringify({ r: state.player.material.color.r, g: state.player.material.color.g, b: state.player.material.color.b }),
        socketID: state.socket.id
    }
    socket.emit('playerUpdate', packet);
}

function moveCollision(state, collisionVector) {
    state.player.position.x += (movementSpeed / 4) * collisionVector.x;
    state.player.position.z += (movementSpeed / 4) * collisionVector.z;

    state.camera.position.x += (movementSpeed / 4) * collisionVector.x;
    state.camera.position.z += (movementSpeed / 4) * collisionVector.z;
}

function moveForward(state, forwardVector) {
    state.player.position.x += movementSpeed * forwardVector.x;
    state.player.position.z += movementSpeed * forwardVector.z;

    state.camera.position.x += movementSpeed * forwardVector.x;
    state.camera.position.z += movementSpeed * forwardVector.z;
}
function moveBackward(state, forwardVector) {
    if (!state.collisionMade) {
        state.player.position.x -= movementSpeed * forwardVector.x;
        state.player.position.z -= movementSpeed * forwardVector.z;

        state.camera.position.x -= movementSpeed * forwardVector.x;
        state.camera.position.z -= movementSpeed * forwardVector.z;
    } else {
        state.player.position.x += movementSpeed * forwardVector.x;
        state.player.position.z += movementSpeed * forwardVector.z;

        state.camera.position.x += movementSpeed * forwardVector.x;
        state.camera.position.z += movementSpeed * forwardVector.z;
    }

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