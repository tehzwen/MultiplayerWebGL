var seedrandom = require('seedrandom');
var fs = require('fs');

class Spawner {
    constructor(mode, state, client) {
        this.mode = mode;
        this.state = state;
        this.client = client;
    }

    //checks if the seed has been created yet
    seedFileExists() {
        fs.access('seed.json', error => {
            if (error) { //the file doesn't exist yet
                var rng = seedrandom.alea(Math.floor(Math.random() * 500));
                this.seed = rng.int32();
                this.seed = Math.abs(this.seed);
                this.setFoodSpawn();
            } else { //it already exists
                console.log("ALREADY EXISTS");
            }
        })
    }

    createSeed() {
        this.seedFileExists();
    }

    //need to make this return a promise and have the game wait until this is done then write the data to a file representing the seed that way
    //the game knows if the seed has already been created that we dont need to remake it
    setFoodSpawn() {
        new Promise((resolve, reject) => {
            //use the random seed to determine how many food spawns will appear in the game
            this.numFoodSpawn = Math.floor(this.seed / (this.seed % 50000));

            let startPositions = [];
            let vector = { x: 0, y: 0, z: 0 };
            let count = 0;
            for (let i = 0; i < this.numFoodSpawn; i++) {
                let vectorLocation = Math.ceil(Math.random() * (this.numFoodSpawn % i));
                count++;
                //only apply x and z for now as we dont have support for y translation
                if (count === 1) {
                    vector.x = vectorLocation || 2;
                }
                else if (count === 2) {
                    count = 0;
                    vector.z = vectorLocation;
                    startPositions.push(vector);

                    let tempObj = {
                        positionx: vector.x,
                        positiony: vector.y,
                        positionz: vector.z,
                        id: 3,
                        color: [vector.x, 100, vector.z],
                        scale: [1, 1, 1],
                        name: "plantfood" + i
                    }

                    this.state.objects.push(tempObj);
                    this.client.query(`INSERT INTO gameobject (positionx, positiony, gameobjecttypeid, positionz, color, scale, name) 
                        VALUES(${vector.x}, ${vector.y},
                        3, ${vector.z}, '{${vector.x}, 
                        100, ${vector.z}}', '{1, 1, 1}', '${"plantfood" + i}');`)
                        .then((results) => {
                            console.log("Inserted plantfood" + i);
                        })
                        .catch((err) => {
                            console.error(err);
                            reject(err);
                        })

                    vector = { x: 0, y: 0, z: 0 };
                }
            }

            console.log(startPositions);
            //resolve(startPositions);
        })
            .then((results) => {
                fs.writeFile("seed.json", this.seed.toString(), err => {
                    if (err) {
                        throw err;
                    } else {
                        console.log("Seed written");
                    }
                })
                console.log(results.length);
            })
            .catch((err) => {
                throw (err);
            })

    }
}

module.exports = Spawner;