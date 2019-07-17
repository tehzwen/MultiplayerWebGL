function createPointLight(color, intensity, distance, decay, position) {
    let light = new THREE.PointLight(color, intensity, distance, decay);
    light.castShadow = true;
    light.position.x = position[0];
    light.position.y = position[1];
    light.position.z = position[2];
    return light;
}

function createAmbientLight(color, intensity) {
    let light = new THREE.AmbientLight(color, intensity);
    return light;
}