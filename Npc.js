const math = require('mathjs');

class Npc {
    constructor(state, socket, db, startPosition, npcName) {
        //console.log(db);
        this.position = startPosition;
        this.io = socket;
        this.db = db;
        this.moveMade = false;
        this.name = npcName;
        this.state = state;
        this.target = {
            movingToward: false,
            directionVector: null,
            targetPosition: null
        }
        this.scale = { x: 1.0, y: 1.0, z: 1.0 }
        this.color = [0.5, 0.2, 0.0];

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

        let decision = Math.floor(Math.random() * 4);
        let moveFunc;

        if (this.target.movingToward) {
            moveFunc = this.moveTowardTarget();
        }

        if (decision === 0) {
            //move forward
            moveFunc = this.moveForward;
        } else if (decision === 1) {
            //move backward
            moveFunc = this.moveBackward;
        } else if (decision === 2) {
            // move left
            moveFunc = this.moveLeft;
        } else if (decision === 3) {
            // move right
            moveFunc = this.moveRight;
        }

        setTimeout(() => {
            moveFunc();
            this.startMainLoop();
        }, Math.random() * 500);
    }

    moveForward() {
        this.position.z += 1;
        let packet = {
            npcName: this.name,
            currentPosition: this.position
        }
        this.emitMoveToPlayers();
    }

    moveBackward() {
        this.position.z -= 1;
        let packet = {
            npcName: this.name,
            currentPosition: this.position
        }
        this.emitMoveToPlayers();
    }

    moveLeft() {
        this.position.x += 1;
        let packet = {
            npcName: this.name,
            currentPosition: this.position
        }
        this.emitMoveToPlayers();
    }

    moveRight() {
        this.position.x -= 1;

        let packet = {
            npcName: this.name,
            currentPosition: this.position
        }
        this.emitMoveToPlayers();
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
            console.log(player);
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
            return val/scalar;
        })
    }

    addArrays(arr1, arr2) {
        //check if arrays are equal length
        if(arr1.length === arr2.length) {
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
        this.position.x += this.target.targetVector.x * 0.12;
        this.position.z += this.target.targetVector.z * 0.12;
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
                this.target.movingToward = true;
                this.target.targetPosition = objectVector.position;


                //eat at this distance
                if (distance < 2) {
                    this.target.movingToward = false;
                    console.log(Date.now() + "Ate a cube " + objectVector.name);
                    
                    //add colors in a way that we dont reach complete white but we mix our colors with that which we ate
                    let eatenColorChange = this.divideArrayByScalar(objectVector.color, 3);
                    this.color = this.addArrays(this.divideArrayByScalar(this.color, 1.5), eatenColorChange);
                    this.scale.x += 0.5;
                    this.scale.y += 0.5;
                    this.scale.z += 0.5;
                    this.emitEatToPlayers(objectVector.name, this.state.objects[object]);
                }

            }


        }

    }

}

module.exports = Npc