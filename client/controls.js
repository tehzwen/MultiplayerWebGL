function movementControls(state) {
    let movementSpeed = 0.3;

    document.addEventListener("keydown", (event) => {
        let updateSent = false;

        if (event.key === 'w') {
            state.player.position.z += movementSpeed;
            state.camera.position.z += movementSpeed;
        } else if (event.key === 'a') {
            state.player.position.x += movementSpeed;
            state.camera.position.x += movementSpeed;
        } else if (event.key === 'd') {
            state.player.position.x -= movementSpeed;
            state.camera.position.x -= movementSpeed;
        } else if (event.key === 's') {
            state.player.position.z -= movementSpeed;
            state.camera.position.z -= movementSpeed;
        } else if (event.key === 'q') {
            state.player.rotation.x += movementSpeed;
        } else if (event.key === 'e') {
            state.player.rotation.x -= movementSpeed;
        }

        if (!updateSent) {
            let packet = {
                playerObject: {
                    playerName: state.playerName,
                    position: JSON.stringify(state.player.position),
                    rotation: JSON.stringify(state.player.rotation),
                    scale: JSON.stringify(state.player.scale),
                    visible: state.player.visible,
                    castShadow: state.player.castShadow,
                    receiveShadow: state.player.receiveShadow,
                    geometry: JSON.stringify([state.player.geometry.parameters.width, state.player.geometry.parameters.height, state.player.geometry.parameters.depth]),
                    color: JSON.stringify({ r: state.player.material.color.r, g: state.player.material.color.g, b: state.player.material.color.b })
                },
                socketID: state.socket.id
            }

            socket.emit('playerUpdate', packet);
            updateSent = true;
        }
    })
}