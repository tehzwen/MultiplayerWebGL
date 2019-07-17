const math = require('mathjs');
var THREE = require('./client/three.js-master');
var _ = require("lodash");

class Npc {
    constructor(state, socket, db, startPosition, npcName) {
        //console.log(db);
        this.position = startPosition;
        this.io = socket;
        this.db = db;
        this.moveMade = false;
        this.name = npcName;
        this.state = state;
        this.moveSpeed = 0.05;
        this.timeDelay = 50;
        this.destination = {
            status: false,
            direction: "",
            endVector: null
        }
        this.target = {
            movingToward: false,
            targetVector: null,
            targetPosition: null
        }
        this.scale = { x: 1.0, y: 1.0, z: 1.0 }
        this.color = [0.5, 0.2, 0.0];

        this.moveTowardTarget = this.moveTowardTarget.bind(this);
        this.moveRight = this.moveRight.bind(this);
        this.moveLeft = this.moveLeft.bind(this);
        this.moveBackward = this.moveBackward.bind(this);
        this.moveForward = this.moveForward.bind(this);
        this.emitMoveToPlayers = this.emitMoveToPlayers.bind(this);
        this.distanceCheck = this.distanceCheck.bind(this);
        this.emitEatToPlayers = this.emitEatToPlayers.bind(this);
    }

    startMainLoop() {
        this.distanceCheck();
        this.moveMade = false;
        this.move();
    }

    move() {
        var moveFunc;

        //console.log(this.destination)

        //check if a destination is already plotted and if it is then we move to it
        if (this.destination.status) {
            if (this.destination.direction === "forward") {
                moveFunc = this.moveForward;
            } else if (this.destination.direction === "backward") {
                moveFunc = this.moveBackward;
            } else if (this.destination.direction === "left") {
                moveFunc = this.moveLeft;
            } else if (this.destination.direction === "right") {
                moveFunc = this.moveRight;
            } else if (this.destination.direction === "target") {
                moveFunc = this.moveTowardTarget;
            }
            //console.log(this.destination)
            setTimeout(() => {
                moveFunc();
                this.startMainLoop();
            }, Math.random() * this.timeDelay);

        } else {
            
            moveFunc = this.moveForward; // initial movement so we can get the ball rolling


            let decision = Math.floor(Math.random() * 4);
            this.destination.endVector = { ...this.position }

            if (this.target.movingToward) {
                this.destination.direction = "target";
                this.destination.status = true;
            } else if (decision === 0) {
                //move forward
                this.destination.direction = "forward";
                this.destination.endVector.z += 1.0;
                this.destination.status = true;
            } else if (decision === 1) {
                //move backward
                this.destination.direction = "backward";
                this.destination.endVector.z -= 1.0;
                this.destination.status = true;
            } else if (decision === 2) {
                // move left
                this.destination.direction = "left";
                this.destination.endVector.x += 1.0;
                this.destination.status = true;
            } else if (decision === 3) {
                // move right
                this.destination.direction = "right";
                this.destination.endVector.x -= 1.0;
                this.destination.status = true;
            }

            //console.log(this.destination)

            setTimeout(() => {
                moveFunc();
                this.startMainLoop();
            }, Math.random() * this.timeDelay);
        }
    }

    moveForward() {
        //check if we have reached the destination end vector, if not lets move slowly toward it
        if (this.position.z <= this.destination.endVector.z) {
            this.position.z += this.moveSpeed;
        } else {
            this.destination = {
                status: false,
                endVector: null,
                direction: ""
            }
        }

        this.emitMoveToPlayers();
    }

    moveBackward() {
        if (this.position.z >= this.destination.endVector.z) {
            this.position.z -= this.moveSpeed;
        } else {
            this.destination = {
                status: false,
                endVector: null,
                direction: ""
            }
        }

        this.emitMoveToPlayers();
    }

    moveLeft() {
        if (this.position.x <= this.destination.endVector.x) {
            this.position.x += this.moveSpeed;
        } else {
            this.destination = {
                status: false,
                endVector: null,
                direction: ""
            }
        }
        this.emitMoveToPlayers();
    }

    moveRight() {

        if (this.position.x >= this.destination.endVector.x) {
            this.position.x -= this.moveSpeed;
        } else {
            this.destination = {
                status: false,
                endVector: null,
                direction: ""
            }
        }

        this.emitMoveToPlayers();
    }

    lerpInVector(vectorChar, magnitude) {
        if (this.position[vectorChar] !== this.position[vectorChar] + magnitude) {
            this.position[vectorChar] += magnitude / 10;
            return this.lerpInVector(vectorChar, magnitude - 0.5)
        } else {
            return;
        }
    }

    emitMoveToPlayers() {
        let packet = {
            npcName: this.name,
            currentPosition: this.position,
            scale: this.scale,
            color: this.color
        }
        for (let player in this.state.players) {
            this.io.to(player).emit('npcMove', packet);
        }
        return;
    }

    emitEatToPlayers(objectName, object) {
        for (let player in this.state.players) {
            this.io.to(player).emit('npcEat', objectName);
        }
        //fire db query to kill this cube from the database
        this.db.query(`DELETE FROM gameobject WHERE name='${objectName}';`, (error, results) => {
            if (error) {
                console.error(error);
            } else {
                console.log("Successfully deleted from db");
                this.state.objects.splice(this.state.objects.indexOf(object), 1);
            }
        });
        return;
    }

    vectorDistance(vec1, vec2) {
        let vx = vec1.x - vec2.x;
        let vy = vec1.y - vec2.y;
        let vz = vec1.z - vec2.z;

        return Math.sqrt((vx * vx) + (vy * vy) + (vz * vz));
    }

    subractVectors(v1, v2) {
        let vx = v1.x - v2.x;
        let vy = v1.y - v2.y;
        let vz = v1.z - v2.z;
        return { x: vx, y: vy, z: vz };
    }

    divideArrayByScalar(arr, scalar) {
        return arr.map((val) => {
            return val / scalar;
        })
    }

    addArrays(arr1, arr2) {
        //check if arrays are equal length
        if (arr1.length === arr2.length) {
            let tempArr = [];
            for (let i = 0; i < arr1.length; i++) {
                tempArr.push(arr1[i] + arr2[i]);
            }
            return tempArr;
        } else {
            console.error("Arrays must be of equal size to add");
            return null;
        }
    }

    moveTowardTarget() {
        this.target.targetVector = this.subractVectors(this.target.targetPosition, this.position);
        this.position.x += this.target.targetVector.x * 0.02;
        this.position.z += this.target.targetVector.z * 0.02;

        let packet = {
            npcName: this.name,
            currentPosition: this.position
        }
        this.emitMoveToPlayers();
    }

    distanceCheck() {
        for (let object in this.state.objects) {
            //console.log(this.state.objects[object]);
            let objectVector = {
                position: {
                    x: this.state.objects[object].positionx,
                    y: this.state.objects[object].positiony,
                    z: this.state.objects[object].positionz
                },
                scale: this.scale,
                name: this.state.objects[object].name,
                color: this.state.objects[object].color
            }


            let distance = this.vectorDistance(this.position, objectVector.position)

            //check radius around us to detect if nearby a cube
            if (distance < 10) {
                this.target.objectName = this.state.objects[object].name;
                this.target.movingToward = true;
                this.target.targetPosition = objectVector.position;

                //eat at this distance
                if (distance < 2) {

                    console.log(Date.now() + "Ate a cube " + objectVector.name);

                    //add colors in a way that we dont reach complete white but we mix our colors with that which we ate
                    let eatenColorChange = this.divideArrayByScalar(objectVector.color, 3);
                    this.color = this.addArrays(this.divideArrayByScalar(this.color, 1.5), eatenColorChange);
                    this.scale.x += 0.5;
                    this.scale.y += 0.5;
                    this.scale.z += 0.5;
                    this.target.movingToward = false;
                    this.destination.direction = "";
                    this.destination.status = false;
                    this.emitEatToPlayers(objectVector.name, this.state.objects[object]);
                }
            } else {
                if (this.target.movingToward && _.findIndex(this.state.objects, ['name', this.target.objectName]) === -1) {
                    this.target.movingToward = false;
                    this.destination.direction = "forward";
                    this.destination.status = false;
                }
            }
        }
    }
}

module.exports = Npc