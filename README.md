The server requires access to a postgres database called entropy. I can provide the schema for the database or you can edit your own to look similar to mine. For now all it holds is the definitions for the object types. These objects are fetched at startup and loaded into the game.

To run the server, run npm install in the base folder, then node server.js. (Keep in mind that the package.json isn't always up to date so may need to npm install --save any missing libraries).

The client requires you to download three.js from  https://threejs.org/ and put the folder in the client folder.
