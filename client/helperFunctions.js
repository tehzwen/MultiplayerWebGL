var MAX_POINTS = 500;

/**
 * 
 * @param {State variable containing game information} state 
 * @param {Number - distance to check of objects} distanceThreshold 
 * @purpose Checks distances to add and remove objects from state.collidableObjects to cut down on cost for collision detection
 */
function collidableDistanceCheck(state, distanceThreshold) {
    //check the distance of each object in the objects array that isnt our ship and add to collidable array if close
    if (state.objects.length > 0) {
        for (let x = 0; x < state.objects.length; x++) {
            //console.log(state.ship.position.distanceTo(state.objects[x].position));
            if (state.ship.position.distanceTo(state.objects[x].position) <= distanceThreshold && state.objects[x] !== state.ship && !state.collidableObjects.includes(state.objects[x])) {
                state.collidableObjects.push(state.objects[x]);
            }
        }
    }

    //check if collidable objects have left collidable range
    if (state.collidableObjects.length > 0) {
        for (let i = 0; i < state.collidableObjects.length; i++) {
            if (state.ship.position.distanceTo(state.collidableObjects[i].position) >= distanceThreshold) {
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
function createCube(position, castShadow, receiveShadow, visible, geometryVals, color, transparent, opacity, name) {
    console.log(color);

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

    return cube;
}

/**
 * 
 * @param {Object{x,y,z} of position of cube} position 
 * @param {Boolean whether cube will cast a shadow or not} castShadow 
 * @param {Boolean whether cube will receive a shadow or not} receiveShadow 
 * @param {Boolean whether cube is visible or not} visible 
 * @param {Array[l,w,d] of geometry values for cube} geometryVals 
 * @param {Path for texture to be loaded} textureURL 
 * @purpose Creates cubes with textures loaded onto them and adds to scene
 */
function createCubeWithTexture(position, castShadow, receiveShadow, visible, geometryVals, textureURL) {
    let texture = new THREE.TextureLoader().load(textureURL);
    let geometry = new THREE.BoxGeometry(geometryVals[0], geometryVals[1], geometryVals[2]);
    let material = new THREE.MeshBasicMaterial({
        map: texture
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
 * @param {Hex value representing color} color 
 * @param {Boolean for whether the object is transparent} transparent 
 * @param {Opacity value for the pyramid} opacity 
 */
function createPyramid(position, castShadow, receiveShadow, geometryVals, visible, color, transparent, opacity) {

    color = parseInt(color, 16);
    let geometry = new THREE.ConeGeometry(geometryVals[0], geometryVals[1], geometryVals[2]);
    let material = new THREE.MeshPhongMaterial({
        color: color,
        transparent: transparent,
        opacity: opacity
    });
    let cone = new THREE.Mesh(geometry, material);

    cone.position.x = position[0];
    cone.position.y = position[1];
    cone.position.z = position[2];
    cone.castShadow = castShadow;
    cone.receiveShadow = receiveShadow;
    cone.visible = visible;
    cone.type = "powerup";

    return cone;
}


/**
 * 
 * @param {State variable holding all game info} state 
 * @param {Which direction we intend to move the ship} direction 
 * @purpose This was a rotation function planned to be used to rotate 
 * the ship in the direction being moved toward with the mouse. Was
 * never actually used in production.
 */
function rotateShip(state, direction) {
    var ship = state.objects[state.selectedIndex];
    let turnRate = 0.005;

    if (direction === "Left") {
        ship.rotation.z -= turnRate;
    }
    else if (direction === "Right") {
        ship.rotation.z += turnRate;
    }

    else if (direction === "Up") {
        ship.rotation.x += turnRate;
    }

    else if (direction === "Down") {
        ship.rotation.x -= turnRate;
    }
}

/**
 * 
 * @param {state variable holding game info} state 
 * @purpose Updates the ships position every frame based off of where the mouse is
 */
function updateShipPosition(state) {
    var ship = state.ship;
    var camera = state.camera;
    var mouseX = state.mouseX;
    var mouseY = state.mouseY;
    let speed = 0.0009;

    if (state.healthVal > 0) {

        if (state.mouseX > 700 || state.mouseX < -700) {

            if (state.flySounds.length <= 0) {

                var rand = state.flySoundsPaths[Math.floor(Math.random() * state.flySoundsPaths.length)];
                let sound = playSound(state, rand, state.audioLoader, 0.15, false)
                state.flySounds.push(sound);
            }
            else {
                if (state.flySounds[0].isPlaying) {
                }
                else {
                    state.flySounds.pop();
                }
            }
        }

        //move left
        if (state.mouseX > 0 && ship.position.x < state.canal.x0) {
            //console.log("MOVING MOUSE");
            ship.position.x += mouseX * speed;
            camera.position.x += mouseX * speed;
            state.mouseX += mouseX * speed;
            state.plane.position.x += mouseX * speed;
            state.collisionBox.position.x += mouseX * speed;
        }
        //move right
        else if (state.mouseX < 0 && ship.position.x > state.canal.x1) {
            //console.log(Math.abs(mouseX) * speed);
            ship.position.x -= Math.abs(mouseX) * speed;
            camera.position.x -= Math.abs(mouseX) * speed;
            state.mousex -= Math.abs(mouseX) * speed;
            state.plane.position.x -= Math.abs(mouseX) * speed;
            state.collisionBox.position.x -= Math.abs(mouseX) * speed;
        }
        //move up
        if (mouseY > 0 && ship.position.y < state.canal.y0) {

            ship.position.y += mouseY * speed;
            camera.position.y += mouseY * speed;
            state.mouseY += mouseY * speed;
            state.collisionBox.position.y += mouseY * speed;
        }
        //move down
        else if (mouseY < 0) {

            //check if above plane
            if (ship.position.y > -2) {
                ship.position.y -= Math.abs(mouseY) * speed;
                camera.position.y -= Math.abs(mouseY) * speed;
                state.mouseY -= Math.abs(mouseY) * speed;
                state.collisionBox.position.y -= Math.abs(mouseY) * speed;
            }
        }
    }
}


/**
 * 
 * @param {State variable holding all game information} state 
 * @purpose Listens for mouse movement and calculates mouse offset from center
 */
function setupMouseMove(state) {
    document.addEventListener("mousemove", (event) => {
        if (state.ship) {
            /*Get offset of mouse from screen center */
            let movementX = window.innerWidth / 2 - event.clientX;
            let movementY = window.innerHeight / 2 - event.clientY;

            if (event.ctrlKey) {

                if (movementX > 0) {
                    state.camera.rotation.y -= 0.002;
                }
                else if (movementX < 0) {
                    state.camera.rotation.y += 0.002;
                }

                if (movementY > 0) {
                    state.camera.rotation.x -= 0.002;
                }

                else if (movementY < 0) {
                    state.camera.rotation.x += 0.002;
                }
            }
            else {
                if (movementX > 0) {
                    state.mouseX = movementX;
                }
                else if (movementX < 0) {
                    state.mouseX = movementX;
                }

                if (movementY > 0) {
                    state.mouseY = movementY;
                }

                else if (movementY < 0) {
                    state.mouseY = movementY;
                }
            }
        }

    });
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
 * @param {Game State variable} state 
 * @purpose Function to move camera to the ship and return from
 */
function moveCameraToShip(state) {

    if (!state.firstPersonCam) {
        smoothCameraMovementToZ(state, state.ship.position.z, true);
    }
    else {
        smoothCameraMovementToZ(state, state.ship.position.z - 15);
    }
}

/**
 * 
 * @param {Game State variable} state 
 * @param {Z value that we would like to move towards} zVal 
 * @param {boolean flag for determining if we are moving to the ship or not to adjust y values} returnToShip 
 * @purpose Smoothly move camera to Z position
 */
function smoothCameraMovementToZ(state, zVal, returnToShip) {

    //check if we return to the ship or not
    if (returnToShip) {
        //move camera to appropriate y value
        smoothCameraMovementToY(state, state.ship.position.y);

        //if the z value is less than current camera z
        if (state.camera.position.z > zVal) {
            state.camera.position.z -= 0.5;
        }
        //if the z value is greater than current camera z
        else if (state.camera.position.z < zVal) {
            state.camera.position.z += 0.5;
        }
        //we have reached our destination so we set flags to stop camera movement
        else {
            state.moveCam = false;
            state.firstPersonCam = !state.firstPersonCam;
        }

    }

    //not returning to ship but need to move to z coordinate
    else {
        //if the z value is less than current camera z
        if (state.camera.position.z > zVal) {
            state.camera.position.z -= 0.5;
        }
        //if the z value is greater than current camera z
        else if (state.camera.position.z < zVal) {
            state.camera.position.z += 0.5;
        }
        //we have reached our destination so we set flags to stop camera movement
        else {
            state.moveCam = false;
            state.firstPersonCam = !state.firstPersonCam;
        }
    }

}

/**
 * 
 * @param {Game state variable} state 
 * @param {y value to move towards} yVal 
 * @purpose Smoothly moves camera to Y position
 */
function smoothCameraMovementToY(state, yVal) {

    if (state.camera.position.y > yVal) {
        state.camera.position.y -= 0.5;
    }
    else if (state.camera.position.y < yVal) {
        state.camera.position.y += 0.5;
    }
}

/**
 * 
 * @param {State variable holding all game info} state
 * @purpose Keyboard controls for moving camera
 */
function setupKeypresses(state) {
    document.addEventListener("keydown", (event) => {

        if (state.ship) {
            switch (event.code) {
                case "KeyC":
                    state.moveCam = !state.moveCam;
                    break;

                default:
                    break;
            }
        }
    });
}

/**
 * 
 * @param {holds game info} state 
 * @param {length of tube} lengthVal 
 * @param {color for the tube} color 
 * @param {array containing the points} pointsArray 
 * @param {tubular segment value} tubularSeg 
 * @param {radius for tube} radius 
 * @param {number of segments in radial direction} radialSeg 
 * @param {boolean to determine if tube is closed} closed 
 * @purpose Was a function we made to create tubes but never implemented fully
 */
function createTube(state, lengthVal, color, pointsArray, tubularSeg, radius, radialSeg, closed) {

    let pathBase = new THREE.CatmullRomCurve3(pointsArray);
    state.tube.curve = pathBase;

    let tubeGeo = new THREE.TubeBufferGeometry(pathBase, tubularSeg, radius, radialSeg, closed);
    tubeGeo.needsUpdate = true;
    state.tube.tubeGeo = tubeGeo;

    let tubeMat = new THREE.MeshPhongMaterial({
        side: THREE.BackSide,
        color: color
    });

    state.tube.mat = tubeMat;

    let mesh = new THREE.Mesh(tubeGeo, tubeMat);
    //mesh.position.z = 30;   
    state.tube.object = mesh;
    state.objects.push(mesh);
    state.scene.add(mesh);
}


/**
 * 
 * @param {State variable holding all the game info} state 
 * @purpose Creates the base plane for the game and stores it in state.plane
 */
function setupPlane(state, position) {
    let side = 120;
    geometry = new THREE.PlaneGeometry(side * 5, side * 10);
    let material = new THREE.MeshStandardMaterial({
        roughness: 0.8,
        color: new THREE.Color(0x777777),
        side: THREE.FrontSide
    });
    plane = new THREE.Mesh(geometry, material);
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.renderSingleSided = false;
    plane.position.x = 0;
    plane.position.y = -5;
    plane.position.z = 0;
    plane.rotation.x = 11;
    state.plane = plane;

    state.scene.add(plane);
}

/**
 * 
 * @param {Game state variable} state 
 * @param {collision game object} collision 
 * @purpose Checks collision types and calls functions depending on those types/subtypes
 */
function checkCollision(state, collision) {

    //detect if collision is a wall and remove health if that is the case
    if (collision.type === "wall" && !state.invincible) {
        state.moving = false;
        if (state.healthVal > 0) {
            state.healthVal -= 0.25;
        }

    }
    //detect when the collision is of type powerup and take appropriate action
    else if (collision.type === "powerup" && !state.collisionMade) {
        state.collisionMade = true;

        //if points, play sound, add points
        if (collision.effect === "points") {

            //play r2 beep, increment score text
            state.scoreVal += 0.5;
            playSound(state, '../sounds/R2D2Beep.mp3', state.audioLoader, 0.25, false, false);
        }

        //if health add health up to 100 and add some points
        else if (collision.effect === "health") {
            state.scoreVal += 0.8;
            if (state.healthVal < 100) {
                if (state.healthVal + 5 > 100) {
                    state.healthVal = 100;
                }
                else {
                    state.healthVal += 0.5;
                }
            }
            //play R2 Health
            playSound(state, '../sounds/R2D2Health.wav', state.audioLoader, 0.25, false, false);
        }

        //when red powerup we make the ship temporarily able to pass through walls and not take damage for 
        else if (collision.effect === "invincible") {
            //play scream sound 
            playSound(state, '../sounds/R2D2Scream.wav', state.audioLoader, 0.25, false, false);
            state.invincible = true;
            state.invincibleTime = Date.now();
            changeShipOpacity(state, 0.5);
        }

        //remove the powerup from the scene
        collision.geometry.dispose();
        collision.material.dispose();
        state.scene.remove(collision);
        state.collisionMade = false;
    }

    //if we reach the finish line we reset the game
    else if (collision.type === "finish") {
        resetGame(state);
    }

    //set moving to true if no collisions
    else {
        state.moving = true;
    }
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
 * @param {Variable to show how fast rotate speed} rotateSpeed 
 * @purpose Function used to rotate powerups in place
 */
function rotatePowerUps(state, rotateSpeed) {
    for (let i = 0; i < state.powerUpObjects.length; i++) {
        state.powerUpObjects[i].rotateY(rotateSpeed);
        state.powerUpObjects[i].rotateZ(rotateSpeed);
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
    //creating a cube
    if (gameObject.gameobjecttypeid === 1) {
        let color = state.color = { r: gameObject.color[0], g: gameObject.color[1], b: gameObject.color[2] }
        let cube = createCube({ x: gameObject.positionx, y: gameObject.positiony, z: gameObject.positionz }, true, true, true, [1, 1, 1], color, false, 1.0);
        state.scene.add(cube);
    }
}

function createPlayerNameText(state) {
    let text = new THREE.TextGeometry(state.playerName, {
        font: state.font,
        size: 0.2,
        height: 0.1,
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

    state.player.add(mesh);
}

function setupGameFont(state) {
    let fontLoader = new THREE.FontLoader();
    fontLoader.load('./fonts/outrun_future_Regular.json',
        function (font) {
            console.log(font)
            state.font = font;
            createPlayerNameText(state);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (err) {
            console.error(err);
        });
}