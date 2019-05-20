function rotateCameraWithMouse(state) {
    document.addEventListener("mousemove", (event) => {
        //console.log(event.buttons);
        if (event.buttons === 1) {
            state.camera.rotation.x += event.movementY * 0.000012;
            state.camera.rotation.y += event.movementX * 0.000012;
        }
    })
}