var MAX_POINTS = 500;

/**
 * 
 * @param {State variable containing game information} state 
 * @param {Number - distance to check of objects} distanceThreshold 
 * @purpose Checks distances to add and remove objects from state.collidableObjects to cut down on cost for collision detection
 */
function collidableDistanceCheck(state, distanceThreshold) {
    //check the distance of each object in the objects array that isnt our ship and add to collidable array if close
    if (state.allObjects.length > 0) {
        for (let x = 0; x < state.allObjects.length; x++) {
            if (state.player.position.distanceTo(state.allObjects[x].position) <= distanceThreshold && state.allObjects[x] !== state.player && !state.collidableObjects.includes(state.allObjects[x])) {
                state.collidableObjects.push(state.allObjects[x]);
            }
        }
    }

    //check if collidable objects have left collidable range
    if (state.collidableObjects.length > 0) {
        for (let i = 0; i < state.collidableObjects.length; i++) {
            if (state.player.position.distanceTo(state.collidableObjects[i].position) >= distanceThreshold) {
                state.collidableObjects.splice(i);
            }
        }
    }
}

/**
 * 
 * @param @param {Object{x,y,z} of position of cube} position 
 * @param {Boolean - determines if cube will cast a shadow} castShadow 
 * @param {Boolean - determines if cube will receive a shadow} receiveShadow 
 * @param {Boolean - determines if cube is visible} visible 
 * @param {Array - Geometry of cube [x,y,z]} geometryVals 
 * @param {Object{r,g,b} - value for color as object} color
 * @param {Boolean - determines if the object is transparent} transparent
 * @param {float - determines the value for object's opacity} opacity 
 * @return cube - cube object
 * @purpose creates a cube and returns it
 */
function createCube(position, castShadow, receiveShadow, visible, geometryVals, color, transparent, opacity) {
    var geometry = new THREE.BoxGeometry(geometryVals[0], geometryVals[1], geometryVals[2]);
    var material = new THREE.MeshPhongMaterial({ transparent: transparent, opacity: opacity });
    var cube = new THREE.Mesh(geometry, material);

    cube.material.color = color;
    cube.position.x = position.x;
    cube.position.y = position.y;
    cube.position.z = position.z;
    cube.castShadow = castShadow;
    cube.receiveShadow = receiveShadow;
    cube.visible = visible;
    cube.geometry.computeBoundingBox();

    return cube;
}

/**
 * 
 * @param {Object{x,y,z} of position of cube} position 
 * @param {Boolean whether cube will cast a shadow or not} castShadow 
 * @param {Boolean whether cube will receive a shadow or not} receiveShadow 
 * @param {Boolean whether cube is visible or not} visible 
 * @param {Array[l,w,d] of geometry values for cube} geometryVals,
 * @param {Object{r,g,b} for color of cube to be made} color 
 * @param {Path for texture to be loaded} textureURL 
 * @purpose Creates cubes with textures loaded onto them and adds to scene
 */
function createCubeWithTexture(position, castShadow, receiveShadow, visible, geometryVals, color, textureURL, bmapURL) {
    let repetitions = 2;
    let texture = new THREE.TextureLoader().load(textureURL);
    let geometry = new THREE.BoxGeometry(geometryVals[0], geometryVals[1], geometryVals[2]);
    let material, bmap, newColor;

    if (color.r) {
        newColor = 0x220000;
    } else if (color.g) {
        newColor = 0x002200;
    } else {
        newColor = 0x000022;
    }

    bmap = new THREE.TextureLoader().load(bmapURL);
    bmap.wrapS = THREE.MirroredRepeatWrapping;
    bmap.wrapT = THREE.MirroredRepeatWrapping;
    bmap.repeat.set(repetitions / 2, repetitions);

    texture = new THREE.TextureLoader().load(textureURL);
    texture.wrapS = THREE.MirroredRepeatWrapping;
    texture.wrapT = THREE.MirroredRepeatWrapping;
    texture.repeat.set(repetitions / 2, repetitions);

    material = new THREE.MeshPhongMaterial({
        map: texture,
        bumpScale: 0.9,
        bumpMap: bmap,
        emissive: newColor,
        specular: 0xf,
        side: THREE.FrontSide,
        shininess: 1
    });

    let cube = new THREE.Mesh(geometry, material);
    cube.position.x = position.x;
    cube.position.y = position.y;
    cube.position.z = position.z;
    cube.castShadow = castShadow;
    cube.receiveShadow = receiveShadow;
    cube.visible = visible;

    return cube;
}

/**
 * 
 * @param {Array[x,y,z] holding position of pyramid} position 
 * @param {Boolean for whether object casts a shadow or not} castShadow 
 * @param {Boolean for whether object receives a shadow or not} receiveShadow 
 * @param {Array[l,w,d] for creating the geometry of the object} geometryVals 
 * @param {Boolean for whether the object is visible} visible 
 * @param {rgb object of the cone's color} color 
 * @param {Boolean for whether the object is transparent} transparent 
 * @param {Opacity value for the pyramid} opacity 
 */
function createCone(position, castShadow, receiveShadow, geometryVals, visible, color, transparent, opacity) {

    let geometry = new THREE.ConeGeometry(geometryVals[0], geometryVals[1], geometryVals[2]);
    let material = new THREE.MeshPhongMaterial({
        transparent: transparent,
        opacity: opacity
    });
    let cone = new THREE.Mesh(geometry, material);
    cone.material.color = color;
    cone.position.x = position.x;
    cone.position.y = position.y;
    cone.position.z = position.z;
    cone.castShadow = castShadow;
    cone.receiveShadow = receiveShadow;
    cone.visible = visible;

    return cone;
}

/**
 * 
 * @param {Array[x,y,z] holding position of pyramid} position 
 * @param {Boolean for whether object casts a shadow or not} castShadow 
 * @param {Boolean for whether object receives a shadow or not} receiveShadow 
 * @param {Array[l,w,d] for creating the geometry of the object} geometryVals 
 * @param {Boolean for whether the object is visible} visible 
 * @param {rgb object of the cone's color} color 
 * @param {Boolean for whether the object is transparent} transparent 
 * @param {Opacity value for the pyramid} opacity 
 */
function createConeWithTexture(position, castShadow, receiveShadow, geometryVals, visible, color, transparent, opacity, textureURL, bmapURL) {

    let repetitions = 1;
    let geometry = new THREE.ConeGeometry(geometryVals[0], geometryVals[1], geometryVals[2]);
    let texture = new THREE.TextureLoader().load(textureURL);
    let material, bmap;

    bmap = new THREE.TextureLoader().load(bmapURL);
    /*bmap.wrapS = THREE.MirroredRepeatWrapping;
    bmap.wrapT = THREE.MirroredRepeatWrapping;
    bmap.repeat.set(repetitions / 2, repetitions);*/

    texture = new THREE.TextureLoader().load(textureURL);
    /*texture.wrapS = THREE.MirroredRepeatWrapping;
    texture.wrapT = THREE.MirroredRepeatWrapping;
    texture.repeat.set(repetitions / 2, repetitions);*/

    material = new THREE.MeshPhongMaterial({
        map: texture,
        bumpScale: 0.9,
        bumpMap: bmap,
        side: THREE.FrontSide,
        specular: 0xff0000,
        shininess: 1
    });

    let cone = new THREE.Mesh(geometry, material);
    cone.material.color = color;
    cone.position.x = position.x;
    cone.position.y = position.y;
    cone.position.z = position.z;
    cone.castShadow = castShadow;
    cone.receiveShadow = receiveShadow;
    cone.visible = visible;
    cone.transparent = transparent;
    cone.opacity = opacity;

    return cone;
}


/**
 * 
 * @param {state object containing game info} state 
 * @param {string url of the obj file} objURL 
 * @param {string url of the mtl file} mtlURL 
 * @param {array of coordinates for position(x,y,z)} initialPosition 
 * @param {boolean for if the object is player} isPlayer
 * @param {basepath variable to show basepath of files} basePath
 * @param {array for scaling of object} scale
 * @param {color values for loaded model} color
 * @param {boolean value to add to moving asteroids} moving
 * @purpose Loads an obj file and applies it's material to it
 */
function loadModel(state, objURL, mtlURL, initialPosition, isPlayer, basePath, scale, color, moving) {

    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath(basePath);
    var url = mtlURL;

    mtlLoader.load(url, function (materials) {
        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(basePath);
        objLoader.load(objURL, function (object) {
            object.position.set(initialPosition[0], initialPosition[1], initialPosition[2])

            object.traverse(function (child) {
                child.castShadow = true;
                child.receiveShadow = true;
            });

            if (materials.materials.None != null && color) {
                materials.materials.None.color.r = color[0];
                materials.materials.None.color.g = color[1];
                materials.materials.None.color.b = color[2];
            }

            if (isPlayer) {
                object.scale.set(scale[0], scale[1], scale[2]);
                state.ship = object;
                state.scene.add(object);
            }
            else {
                object.scale.set(scale[0], scale[1], scale[2]);
                state.models.push(object);
                state.scene.add(object);
            }

            if (moving) {
                state.movingAsteroids.push(object);
            }

        });

    });
}

/**
 * 
 * @param {Game state variables} state 
 * @param {Path for the obj file} objURL 
 * @param {Array[x,y,z] of the initial object's position} initialPosition 
 * @param {Boolean flag to tell if it is the player or not} isPlayer 
 * @purpose Loads a model without any material and adds to the scene, used for
 * non player models
 */
function loadModelNoMaterial(state, objURL, initialPosition, isPlayer, color, callback) {
    console.log(color);
    let material = new THREE.MeshStandardMaterial({
        roughness: 0.8,
        color: new THREE.Color(color.r, color.g, color.b),

    });
    console.log(material);
    var objLoader = new THREE.OBJLoader();
    objLoader.setPath('../models/');
    objLoader.load(objURL,
        function (object) {
            object.position.set(initialPosition[0], initialPosition[1], initialPosition[2])

            console.log(object);
            object.traverse(function (child) {
                child.material = material;
                child.castShadow = true;
                child.receiveShadow = true;
            });

            if (isPlayer && state) {
                state.player = object;
                state.scene.add(object);
                state.camera.lookAt(getCenterPoint(object.children[0]));
            }
            else if (state) {
                state.scene.add(object);
            }
            callback();

        },
        function (xhr) {
            console.log("loading");
        }
    );
}

/**
 * 
 * @param {State variable holding all the game info} state 
 * @purpose Creates the base plane for the game and stores it in state.plane
 */
function setupPlane(state, position, materialURL, bmapURL) {
    let repetitions = 200;
    let side = 120;
    let geometry = new THREE.PlaneGeometry(side * 15, side * 15);
    let material, texture, bmap;

    if (materialURL && bmapURL) {
        bmap = new THREE.TextureLoader().load(bmapURL);

        //bmap.minFilter = THREE.LinearFilter;
        bmap.wrapS = THREE.MirroredRepeatWrapping;
        bmap.wrapT = THREE.MirroredRepeatWrapping;
        bmap.repeat.set(repetitions / 2, repetitions);

        texture = new THREE.TextureLoader().load(materialURL);
        //texture.minFilter = THREE.LinearFilter;
        texture.wrapS = THREE.MirroredRepeatWrapping;
        texture.wrapT = THREE.MirroredRepeatWrapping;
        texture.repeat.set(repetitions / 2, repetitions);
        material = new THREE.MeshPhongMaterial({
            map: texture,
            bumpMap: bmap,
            emissive: 0x0,
            specular: 0x0,
            bumpScale: 5,
            shininess: 1,
            side: THREE.FrontSide,
        });
    } else {
        material = new THREE.MeshStandardMaterial({
            roughness: 0.8,
            color: new THREE.Color(0x777777),
            side: THREE.FrontSide,

        });
    }

    plane = new THREE.Mesh(geometry, material);
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.renderSingleSided = false;
    plane.position.x = position.x;
    plane.position.y = position.y;
    plane.position.z = position.z;
    plane.rotation.x = -Math.PI / 2;
    state.plane = plane;

    state.scene.add(plane);
    state.collidableObjects.push(plane);
}

/**
 * 
 * @param {Game state variable} state 
 * @purpose This was a function we planned to use for 
 * shooting lines for the ability to shoot in game but
 * never fully implemented
 */
function drawLine(state) {

    var material = new THREE.LineBasicMaterial({
        color: 0x00ff00
    });

    var geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(-10, 0, 10),
        new THREE.Vector3(0, 10, 10)
    );

    var line = new THREE.Line(geometry, material);
    state.line = line;
    state.scene.add(line);
}

/**
 * 
 * @param {path of json file to be loaded} path 
 * @param {call back function upon success} success 
 * @param {call back function upon failure} error 
 * @purpose Loads json file and calls success callback with results
 */
function loadJSON(path, success, error) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

/**
 * 
 * @param {Game state variable} state 
 * @param {Path of sound file} path 
 * @param {Audioloader variable} audioLoader 
 * @param {Volume level for sound} volume 
 * @param {Boolean for whether the sound loops} loop 
 * @param {Boolean if the sound is a flying sound} flySound 
 * @purpose Function used to play sounds
 */
function playSound(state, path, audioLoader, volume, loop, flySound) {

    let sound = new THREE.Audio(state.listener);

    audioLoader.load(path, function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(loop);
        sound.setVolume(volume);
        sound.play();
    });

    return sound;
}

/**
 * 
 * @param {Game state variable} state 
 * @purpose Checks if the sound is still playing
 */
function checkIfSoundsPlaying(state) {
    for (let i = 0; i < state.flySounds.length; i++) {

        if (state.flySounds[i].isPlaying) {
            state.flySoundPlaying = true;
        }
        else {
            state.flySounds.pop();
        }
    }
}

/**
 * 
 * @param {Game state variable} state 
 * @purpose Updates the text values each frame
 */
function updateTextValues(state) {
    state.healthText.textContent = float2int(state.healthVal);
    state.scoreText.textContent = float2int(state.scoreVal);
}

/**
 * 
 * @param {float value to be converted} value
 * @purpose Converts float to ints 
 */
function float2int(value) {
    return value | 0;
}

function getCenterPoint(mesh) {
    var geometry = mesh.geometry;
    geometry.computeBoundingBox();
    center = geometry.boundingBox.getCenter();
    mesh.localToWorld(center);
    return center;
}

function createGameObjectsFromServerFetch(state, gameObject) {
    //creating cubes
    if (gameObject.gameobjecttypeid === 1) {
        let color = { r: gameObject.color[0], g: gameObject.color[1], b: gameObject.color[2] };
        let cube = createCube({ x: gameObject.positionx, y: gameObject.positiony, z: gameObject.positionz }, true, true, true, [1, 1, 1], color, false, 1.0);
        cube.scale.x = gameObject.scale[0];
        cube.scale.y = gameObject.scale[1];
        cube.scale.z = gameObject.scale[2];
        cube.name = gameObject.name;
        state.allObjects.push(cube);
        state.scene.add(cube);
    } else if (gameObject.gameobjecttypeid === 2) { //plane
        setupPlane(state, { x: gameObject.positionx, y: gameObject.positiony, z: gameObject.positionz }, '../images/concrete.jpg', '../images/concrete_inverted.png');
    } else if (gameObject.gameobjecttypeid === 3) { //plantfood
        let color = { r: gameObject.color[0], g: gameObject.color[1], b: gameObject.color[2] };
        let food = createConeWithTexture({ x: gameObject.positionx, y: gameObject.positiony, z: gameObject.positionz }, true, true, [2, 3, 4], true, color, false, 1.0, '../images/food.jpg', '../images/food_inverted.jpg')
        food.scale.x = gameObject.scale[0];
        food.scale.y = gameObject.scale[1];
        food.scale.z = gameObject.scale[2];
        food.name = gameObject.name;
        state.scene.add(food);
    }
}

function createPlayerNameText(state, playerObject) {
    if (!state.font) {
        let fontLoader = new THREE.FontLoader();
        fontLoader.load('./fonts/outrun_future_Regular.json',
            function (font) {
                state.font = font;
                let text = new THREE.TextGeometry(playerObject.name, {
                    font: state.font,
                    size: 0.2,
                    height: 0.05,
                    curveSegments: 12,
                    bevelEnabled: false,
                    bevelThickness: 1,
                    bevelSize: 2,
                    bevelOffset: 0,
                    bevelSegments: 5
                });


                let textMaterial = new THREE.MeshPhongMaterial(
                    { color: 0x000000, specular: 0xffffff }
                );


                let mesh = new THREE.Mesh(text, textMaterial);
                mesh.position.y += 1;
                mesh.opacity = 0.7;

                playerObject.add(mesh);
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (err) {

                console.error(err);
            });
    } else {
        let text = new THREE.TextGeometry(playerObject.name, {
            font: state.font,
            size: 0.2,
            height: 0.05,
            curveSegments: 12,
            bevelEnabled: false,
            bevelThickness: 1,
            bevelSize: 2,
            bevelOffset: 0,
            bevelSegments: 5
        });


        let textMaterial = new THREE.MeshPhongMaterial(
            { color: 0x000000, specular: 0xffffff }
        );


        let mesh = new THREE.Mesh(text, textMaterial);
        mesh.position.y += 1;
        mesh.opacity = 0.7;

        playerObject.add(mesh);
    }

}

function setupGameFont(state) {

    let fontLoader = new THREE.FontLoader();
    fontLoader.load('./fonts/outrun_future_Regular.json',
        function (font) {
            console.log(font)
            state.font = font;
            createPlayerNameText(state, state.player);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (err) {

            console.error(err);
        });
}

function loadCreatedObject(state, packet) {
    //should probably check if this object exists already or not
    //create a cube
    if (packet.objectTypeID === 1) {
        //check if this object has already been made
        if (state.objects.indexOf(packet.uuid) === -1) {
            let obj = createCube(packet.position, true, true, true, packet.geometry, packet.color, false, 1.0);
            obj.name = packet.name;
            state.objects.push(packet.uuid);
            state.allObjects.push(obj);
            state.scene.add(obj);
        }
    }
}

function createObject(state, objectTypeID, position) {
    //create a cube
    if (objectTypeID === 1) {
        let cube = createCube(position, true, true, true, [1, 1, 1], { r: Math.random(), g: Math.random(), b: Math.random() }, false, 1.0);
        cube.name = Date.now() + "cube";
        state.scene.add(cube);
        state.allObjects.push(cube);
        let packet = {
            geometry: cube.geometry,
            color: cube.material.color,
            socketID: state.socket.id,
            position: position,
            objectTypeID,
            scale: [1, 1, 1], //can add scale customization later
            name: cube.name,
            uuid: cube.uuid
        }
        state.socket.emit('objectCreated', packet);
    }
    //half second cool down on creating objects
    setTimeout(function () {
        state.createdObject = false
    }, 500);
}

function createLoginErrorText(text) {
    let errorMessage = document.getElementById("userNameErrorText");
    errorMessage.innerHTML = text;
    errorMessage.style.display = "";
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return parseInt("0x" + componentToHex(r) + componentToHex(g) + componentToHex(b), 16);
}