class Npc {
    constructor(state, socket, db, startPosition, npcName) {
        //console.log(db);
        this.position = startPosition;
        this.io = socket;
        this.db = db;
        this.moveMade = false;
        this.name = npcName;
        this.state = state;

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
            currentPosition: this.position
        }
        for (let player in this.state.players){
            this.io.to(player).emit('npcMove', packet);
        }

        return;
    }

    emitEatToPlayers(objectName, object) {
        for (let player in this.state.players){
            this.io.to(player).emit('npcEat', objectName);
        }
        //fire db query to kill this cube from the database
        this.db.query(`DELETE FROM gameobject WHERE name='${objectName}';`, (error, results) => {
            if(error) {
                console.error(error);
            } else{
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

        return Math.sqrt((vx*vx) + (vy*vy) + (vz*vz));
    }

    distanceCheck() {
        for(let object in this.state.objects) {
            let objectVector = {
                position : {
                    x:this.state.objects[object].positionx,
                    y:this.state.objects[object].positiony,
                    z:this.state.objects[object].positionz
                },
                name:this.state.objects[object].name
             }

             
            let distance = this.vectorDistance(this.position, objectVector.position) 
            //console.log(distance);
            if (distance < 2) {
                console.log(Date.now() + "Close to " + objectVector.name);
                this.emitEatToPlayers(objectVector.name, this.state.objects[object]);
            }
        } 

    }

}

module.exports = Npc