var game_port       = 4065,

    sio             = require('socket.io'),
    express         = require('express'),
    UUID            = require('node-uuid'),

    verbose         = false,
    http            = require('http'),
    app             = express(),
    server          = http.createServer(app);

/* Express server set up. */

//The express server handles passing our content to the browser,
//As well as routing users where they need to go. This example is bare bones
//and will serve any file the user requests from the root of your web server (where you launch the script from)
//so keep this in mind - this is not a production script but a development teaching tool.

//Tell the server to listen for incoming connections
server.listen(game_port)

//Log something so we know that it succeeded.

//By default, we forward the / path to index.html automatically.
app.get( '/', function( req, res ){
    if(verbose) console.log('trying to load %s', __dirname + '/index.html');
    res.sendfile( '/index.html' , { root:__dirname });
});


//This handler will listen for requests on /*, any file from the root of our server.
//See expressjs documentation for more info on routing.

app.get( '/*' , function( req, res, next ) {

        //This is the current file they have requested
    var file = req.params[0];

        //For debugging, we can track what files are requested.
    if(verbose) console.log('\t :: Express :: file requested : ' + file);

        //Send the requesting client the file.
    res.sendfile( __dirname + '/' + file );

}); //app.get *


//Configure the socket.io connection settings.
//See http://socket.io/

//Create a socket.io instance using our express server
var io = sio.listen(server);

// io.configure(function (){

//     io.set('log level', 0); // stop outputting dumb shit to the console pls.

//     io.set('authorization', function (handshakeData, callback) {
//       callback(null, true); // error first callback style
//     });

// });


//pretty colors (awthanks)
var colors = require('colors');

colors.addSequencer("america", function(letter, i, exploded) {
  if(letter === " ") return letter;
  switch(i%3) {
    case 0: return letter.red;
    case 1: return letter.white;
    case 2: return letter.blue;
  }
});

colors.addSequencer("rasta", function(letter, i, exploded) {
  if(letter === " ") return letter;
  switch(i%3) {
    case 0: return letter.red;
    case 1: return letter.yellow;
    case 2: return letter.green;
  }
});

//colors demo
console.log(
	'\n\nAWW YEE PRETTY COLORS\n\n'.rasta +
	' yellow'.yellow + ' - warnings\n' +
	' red'.red + ' - errors\n' +
	' green'.green + ' - server notifications\n' +
	' cyan'.cyan + ' - user interactions\n' +
	' magenta'.magenta + ' - connection notifications\n' +

	' grey'.grey + ' - not sure yet\n' +
	' blue'.blue + ' - not sure yet\n' +

	' rainbow'.rainbow +' - homos\n' +
	' america'.america + ' - murca\n' +
	' rasta'.rasta + ' - blaze it'
);

console.log('\n :: Game Server :: Listening on port '.green + game_port + '\n' );


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*--------------------------------------------------------------------------------------------------------------------
							Allthethings! Socket.IO
--------------------------------------------------------------------------------------------------------------------*/



//Enter the game server code. The game server handles
//client connections looking for a game, creating games,
//leaving games, joining games and ending games when they leave.
game_server = require('./js/game_server.js');

//Socket.io will call this function when a client connects,
//So we can send that client looking for a game to play,
//as well as give that client a unique ID to use so we can
//maintain the list if players.
io.sockets.on('connection', function (client) {
    
    //Generate a new UUID, looks something like
    //5b2ca132-64bd-4513-99da-90e838ca47d1
    //and store this on their socket/connection
    client.userid = UUID();

    //tell the player they connected, giving them their id
    client.emit('onconnected', { id: client.userid } );

    //now we can find them a game to play with someone.
    //if no game exists with someone waiting, they create one and wait.
    // game_server.findGame(client);

    //Useful to know when someone connects
    console.log('socket.io:: player '.magenta + client.userid.toString().magenta + ' connected'.magenta);
    

    //Now we want to handle some of the messages that clients will send.
    //They send messages here, and we send them to the game_server to handle.
    client.on('message', function(m) {

        // game_server.onMessage(client, m);

    }); //client.on message

    //When this client disconnects, we want to tell the game server
    //about that as well, so it can remove them from the game they are
    //in, and make sure the other player knows that they left and so on.
    client.on('disconnect', function () {

        //Useful to know when soomeone disconnects
        console.log('socket.io:: player '.magenta + client.userid.toString().magenta + ' disconnected'.magenta );
        
        //If the client was in a game, set by game_server.findGame,
        //we can tell the game server to update that game state.
        if(client.game && client.game.id) {

            //player leaving a game should destroy that game
            game_server.endGame(client.game.id, client.userid);

        }

    }); 
 
});
