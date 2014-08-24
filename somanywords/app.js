//Include some things.
// var app = require('express');
// var http = require('http');
// var server = http.createServer(app);
// var io = require('socket.io').listen(server);
var app = require('http').createServer(handler)
var io = require('socket.io').listen(4040)
var fs = require('fs');
var path = require('path');
var cronJob = require('cron').CronJob;
var spawn = require('child_process').spawn; //lets backup our db with a child process
io.set('log level', 0 ); //stop outputting heartbeats to the console pls.
app.listen(4045);

//Database connectors.
//var databaseurl = "mongodb://127.0.0.1:51024/test";

var databaseurl = "smw";
var collections = ['users', 'dc4', 'dc3', 'dc5', 'mpcache', 'mparchive'];
var db = require('mongojs').connect(databaseurl, collections);


//Build dictionary.
var dic = require('./masterlist');

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
	'yellow'.yellow + 
	' cyan'.cyan + 
	' white'.white + 
	' magenta'.magenta + 
	' green'.green + 
	' red'.red + 
	' grey'.grey + 
	' blue'.blue + 
	' rainbow'.rainbow +
	' america'.america + 
	' rasta'.rasta
);


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
					Webserver - This is bad. Need to host the static files elsewhere.
--------------------------------------------------------------------------------------------------------------------*/


function handler(request, response) {
 
    //console.log( request.method + ' request url: ' + request.url);
    var requrl = request.url;
	var extname = path.extname(request.url);
	//console.log('Extension: ' + extname );
	
	//get rid of urlparams
    if( requrl.indexOf('?') != -1){
        requrl = requrl.substring(0, requrl.indexOf('?'));
    }
	
    var filePath =  '.' + requrl;
    //console.log('new url: ' + filePath );
	
	//check if file or directory
	if( filePath == './' ){
		filePath = filePath + 'index.html';
	} else if( path.extname(filePath) == ''){
		//console.log( filePath.charAt( filePath.length -1 ))
		if( filePath.charAt(filePath.length - 1) == '/' ){
			filePath = filePath + 'index.html';
		} else {
			filePath = filePath + '/index.html';
		}
	}
	
	//console.log('final url: ' + filePath);
    var extname = path.extname(filePath);
    var checkforencoding = true;
    var contentType = 'text/html';
    var zipPath = '';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
		case '.jpg':
			contentType = 'image/jpeg';
			break;
		case '.gif':
			contentType = 'image/gif';
			break;
		case '.jpeg':
			contentType = 'image/jpeg';
			break;
		case '.jpg':
			contentType = 'image/jpeg';
			break;
		case '.png':
			contentType = 'image/png';
			break;
		case '.ogg':
			contentType = 'audio/ogg';
			//console.log('ogg');
			break;
		case '.aac':
			contentType = 'audio/aac';
			break;
		case '.m4a':
			contentType = 'audio/mpeg';
			//console.log('mpeg');
			break;
		case '.mp3':
			contentType = 'audio/mp3';
			//console.log('mpeg');
			break;
    }

    //check for gzip capability. If yes, check for gzip js files. Send them over when available.
    if( checkforencoding && contentType == "text/javascript" && request.headers["accept-encoding"].indexOf("gzip") != -1 ){
    	zipPath = filePath + '.gz';
    	//console.log('Browser accepts encoding: Checking for file.')

    	path.exists(zipPath, function(exists) {
	        if (exists) {
		    	//console.log('Encoded file found at ' + zipPath)
	            fs.readFile(zipPath, function(error, content) {
	                if (error) {
	                    response.writeHead(500);
	                    response.end();
	                } else {
                		response.writeHead(200, { 'Content-Type': contentType, 'Content-Encoding': 'gzip' });
                    	response.end(content, 'utf-8');
	                }
	            });
	        } else {
	        	//console.log('Encoded file NOT found at ' + zipPath + ' sending regular file.')
			    path.exists(filePath, function(exists) {
			        if (exists) {
				    //console.log('path exists');
			            fs.readFile(filePath, function(error, content) {
			                if (error) {
			                    response.writeHead(500);
			                    response.end();
			                } else {
		                		response.writeHead(200, { 'Content-Type': contentType });
		                    	response.end(content, 'utf-8');
			                }
			            });
			        } else {
				    //console.log('path does not exist');
			            response.writeHead(404);
			            response.end();
			        }
			    });
	        }
	    });

    } else {
     
	    path.exists(filePath, function(exists) {
	     
	        if (exists) {
		    //console.log('path exists');
	            fs.readFile(filePath, function(error, content) {
	                if (error) {
	                    response.writeHead(500);
	                    response.end();
	                } else {
                		response.writeHead(200, { 'Content-Type': contentType });
                    	response.end(content, 'utf-8');
	                }
	            });
	        } else {
		    //console.log('path does not exist');
	            response.writeHead(404);
	            response.end();
	        }
	    });  
	}  
}
 
console.log('Server running at vexterity.com');


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

io.sockets.on('connection', function(client){

	var clientip = client.handshake.address;
    console.log('Client connected from: ' + clientip.address);
	client.set('ip', clientip.address);
	client.set('ingame', false );
	
	client.on('userreconnect', function(data){
		var username = data[0];
		var inchat = data[1];
		var online = data[2];
		
		if( online ){
			if( username != 'null' && username != '' ){

				console.log( username + ' reconnected!' );
				client.set('username', username);
				adduser( username );
				client.broadcast.emit('userlist', username);

				client.get('username', function( err, n ){
					console.log('USERNAME ON RECONNECT: '.yellow + n );
				});


				//check if user was in a game when they left
				var gam = userinbailers(username);
				if( gam != -1 ){
					
					console.log('user '.yellow + username + ' was in a game!'.yellow);
					if( gam.status == 'new'){
						console.log('Game not started yet. Adding user back to room ' + gam.letter + ':' + gam.gameid);
						unbailplayer(gam.gameid, username);
					} else {
						console.log('Game in progress. Adding user back to room ' + gam.letter + ':' + gam.gameid);
						unbailplayer(gam.gameid, username);
					}
					
				}
				
				//send over the user list
				if( userlist.length > 0 ){
					for( p = 0; p < userlist.length; p++){
						client.emit('userlist', userlist[p]);
					}
				} 
				
				//send over the chatter list
				if( chatlist.length > 0 ){
					for( i = 0; i < chatlist.length; i++){
						client.emit('joinchat', chatlist[i]);
					}
				} 
				
				//send list of open rooms
				if( roomlist.length > 0 ){
					console.log('sending rooms');
					for( u = 0; u < roomlist.length; u++){
						if( roomlist[u].status == 'new' ){
							client.emit('addroom', [roomlist[u].gameid, roomlist[u].letter, roomlist[u].players.length] );
						}
					}
				}
				
				if( inchat ){ 
					addtochat( username );
					client.emit('messages', {name: username, message: ' joined the chat!', type: 'info'} );
					client.broadcast.emit('messages', {name: username, message: ' joined the chat!', type: 'info'});
					storemessage({name: username, message: ' joined the chat!', type: 'info'});
					client.emit('joinchat', username );
					client.broadcast.emit('joinchat', username);
				}
				
				
			} else {
			
			}
		}
	});
	
	client.on('logout', function( name ){
		client.get('username', function( err, username ){
			if( username == '' || username == null || username == 'null' || name == '' || name == null || name == 'null'){
				var clientip = client.handshake.address;
				console.log('There was a problem with client: ' + clientip.address + '... Forcing Sign-Out' );
			} else {
				
				removeuser( username );
				console.log( username + ' signed out' );
				client.broadcast.emit('userlistremove', username );
				client.broadcast.emit('chatlistremove', username );
			}
		});
	});
	
	client.on('disconnect', function(){
		client.get('username', function(err, name){
			if( name != '' && name != null ){
				console.log( name + ' disconnected' );
			}
			client.broadcast.emit('userlistremove', name );
			removeuser( name );
			
			if( chatterexists( name ) != -1 ){
				client.broadcast.emit('exitchat', name);
				removefromchat( name );
				client.broadcast.emit('messages', { name: name, message: ' left the chat!', type: 'info'});
				storemessage({ name: name, message: ' left the chat!', type: 'info'});
			}

			client.get('ingame', function(err, gamestatus){
				console.log(name + ' had a game status of '.yellow + gamestatus);
				var gam = getgamebyplayer(name);
				console.log('game id: '.yellow + gam.gameid );
				if( gamestatus == true && gam != -1){
					
					console.log('player was found in game ' + gam.letter + ':' + gam.gameid + '...REMOVING...');
					if( gam.status == 'new' ){
						bailplayerfromroom(gam.gameid, name);
						console.log('Game not started yet. Adding to temp list of bailers.');
					} else {
						bailplayerfromroom(gam.gameid, name);
						console.log('Game started. Adding player to list of bailers.');
					}
					client.leave(gam.gameid);
					io.sockets.in(gam.gameid).emit('playerleaveroom', name );
					client.emit('playermarker', [gam.gameid, gam.players.length]);
					client.broadcast.emit('playermarker', [gam.gameid, gam.players.length]);
					console.log( name + ' left room ' + gam.letter + ':' + gam.gameid );

				} else {
					//console.log('game status for ' + name + ' was false');
				}
			});
			
		});
	});
    
    client.on('messages', function(data){
		client.get('username', function(err, name){
			storemessage({name: name, message: data, type: 'text'});
			client.broadcast.emit('messages', {name: name, message: data, type: 'text'});
			client.emit('messages', {name: name, message: data, type: 'text'});
		});
    });
	
	client.on( 'joinchat', function(){
		client.get('username', function( err, name ){
		
			addtochat( name );
			client.emit('messages', {name: name, message: ' joined the chat!', type: 'info'} );
			client.broadcast.emit('messages', {name: name, message: ' joined the chat!', type: 'info'});
			storemessage({name: name, message: ' joined the chat!', type: 'info'});
			client.emit('joinchat', name );
			client.broadcast.emit('joinchat', name);
			
		});
	});
	
	client.on( 'exitchat', function(){
		client.get('username', function( err, name ){
			
			removefromchat( name );
			client.emit('messages', {name: name, message: ' left the chat!', type: 'info'});
			client.broadcast.emit('messages', {name: name, message: ' left the chat!', type: 'info'});
			storemessage({name: name, message: ' left the chat!', type: 'info'});
			client.emit('exitchat', name );
			client.broadcast.emit('exitchat', name);
			
		});
	});
	
	
	//USER LOGIN
	client.on('login', function(data){
		var testname = data[0]
		var testpword = data[1];
		var testres = false;
		
		var usertest = testname.toUpperCase();
		//console.log('user trying to login with username ' + usertest + ' and password ' + testpword);
		db.users.find({username: usertest}, function(err, res) {
			//console.log( 'db returned: ' + res + ' , errors: ' + err );
			
			if( err != null ){
				client.emit('error', 'There was a problem with the login request, if the problem persists the server may be down for maintainance.');
				console.log('DB ERROR: ' + err );
			} else if( res == ''){
				//username did not exist
				client.emit('login', [testres, '', '']);
				console.log('username does not exist');
			} else {
				//check password
				var response = res[0].password;
				
				
				if( response == testpword ){
					if( userexists( testname ) == -1 ){
						testres = true;
						var tempdata = [testres, testname, '', res[0].stats];
						client.emit('login', tempdata);
						client.set('username', testname);
						console.log('user: ' + testname + ' logged in');

						//check if user stats exist
						var statstest = res[0].stats;
						if( statstest == undefined ){
							//if not add a fresh slate of stats
							db.users.update({username: usertest}, {$set: {stats: newstats()}});
						} else {
							//update current stats to newest spec.
							var estattest = newstats();
							for( var key in estattest ){
								if( res[0].stats[key] == undefined ){
									console.log(key + ' not found for ' + usertest);
									var t = estattest[key];
									var doc = {};
									doc['stats.'+key] = t;
									db.users.update({username: usertest}, {$set: doc});
								}
							}
						}
						
						//check datejoined
						var datejointest = res[0].datejoined;
						//console.log(usertest + ' joined: ' + datejointest);

						if( datejointest == undefined ){
							db.users.update({username: usertest}, {$set: {datejoined: new Date()}});
							//console.log('adding date joined for user: ' + usertest);
						}

						//set last login date to now
						db.users.update({username: usertest}, {$set: {lastlogin: new Date()}});
						
						//check for recent messages
						if( messagememory.length > 0 ){
							console.log('sending chat history');
							for( i = 0; i < messagememory.length; i++){
								client.emit('messages', messagememory[i]);
							}
						}

						client.emit('getpdcstats', pdailies);
						
						//send over the user list
						adduser( testname );
						if( userlist.length > 0 ){
							console.log('sending online users');
							for( x = 0; x < userlist.length; x++){
								client.emit('userlist', userlist[x]);
							}
						} 
						
						//send over the chatter list
						if( chatlist.length > 0 ){
							console.log('sending online chatters');
							for( z = 0; z < chatlist.length; z++){
								client.emit('joinchat', chatlist[z]);
							}
						} 
						
						//send list of open rooms
						if( roomlist.length > 0 ){
							console.log('sending rooms');
							for( u = 0; u < roomlist.length; u++){
								if( roomlist[u].status == 'new' ){
									client.emit('addroom', [roomlist[u].gameid, roomlist[u].letter, roomlist[u].players.length] );
								}
							}
						}
						
						client.broadcast.emit('userlist', testname);
						
					} else {
						client.emit('login', [testres, '', 'ALI']); 
						console.log('User already signed in!');
					}
					
				} else {
					client.emit('login', [testres, '', '']);
					console.log('invalid password');
				}
				
			}
		});
	});
	
	//USER SIGNING UP FOR NEW ACCOUNT
	client.on('signup', function(data){
		var testusername = data[0]
		var testpassword = data[1];
		var testresponse = false;
		console.log('Sign up attempt from new user: ' + testusername );
		
		var usernametest = testusername.toUpperCase();
		db.users.find({username: usernametest}, function(err, users) {
			//console.log( 'db returned: ' + users + ' , errors: ' + err );
			var response = users;
			console.log( response );
			if( err != null ){
				client.emit('error', 'There was a problem with the request, if the problem persists the server may be down for maintainance.');
				console.log('DB ERROR: ' + err );
			} else if( users == ''){
				//add new user to the db 
				testresponse = true;
				client.emit('signup', testresponse);
				client.set('username', testusername);
				//log date joined and lastlogin as well
				var curdate = new Date();
				db.users.save({username: usernametest, password: testpassword, datejoined: curdate, lastlogin: curdate, stats: newstats() });
				console.log('new user: ' + testusername + ' added to users');
				
				var testres = true;
				var tempdata = [testres, testusername];
				client.emit('login', tempdata);
				client.set('username', testusername);
				console.log('user: ' + testusername + ' logged in');
				
				//check for recent messages
				if( messagememory.length > 0 ){
					console.log('sending chat history');
					for( i = 0; i < messagememory.length; i++){
						client.emit('messages', messagememory[i]);
					}
				}
				
				//send over the user list
				adduser( testusername );
				if( userlist.length > 0 ){
					console.log('sending online users');
					for( i = 0; i < userlist.length; i++){
						client.emit('userlist', userlist[i]);
					}
				} 
				
				//send over the chatter list
				if( chatlist.length > 0 ){
					console.log('sending online chatters');
					for( i = 0; i < chatlist.length; i++){
						client.emit('joinchat', chatlist[i]);
					}
				} 
				
				//send list of open rooms
				if( roomlist.length > 0 ){
					console.log('sending rooms');
					for( u = 0; u < roomlist.length; u++){
						if( roomlist[u].status == 'new' ){
							client.emit('addroom', [roomlist[u].gameid, roomlist[u].letter, roomlist[u].players.length] );
						}
					}
				}
					
				client.broadcast.emit('userlist', testusername);
				
				
			} else {
				//tell user to pick a different username
				client.emit('signup', testresponse);
			}
		});
	});
	
	//USER WANTS TO PLAY THE DAILY PUZZLE
	client.on('dcstart', function(d){
		client.get('ip', function( err, uip ){

			if( err == undefined ){
				client.get('username', function( err2, uname ){
					
					if( err2 == undefined ){ 
						var uname2 = uname.toUpperCase();
						var date = getdatestring();
						var siz = d.size || 4;
						var dbs = 'dc' + siz;
						console.log('checking db size: ' + siz+ ' for: ' + uip + ' or ' + uname2 + ' in ' + date );
						
						//check username
						db[dbs].find({date: date, users: uname2 }, function(err, items) {
							if( err != null ){
								console.log('dc: DB ERROR: ' + err );
							} else if( items == ''){
								
								//check ip
								db[dbs].find({date: date, ips: uip }, function(err, items2) {
									if( err != null ){
										console.log('dc: DB ERROR: ' + err );
									} else if( items2 == ''){
										var dboard;
										eval('dboard = dailyboard' + siz);
										client.emit('dcstart', {res: true, board: dboard, date: date, size: siz} );
										console.log('sending daily puzz... ' + dboard );
										db[dbs].update({date: date},{ $push: { users: uname2 } });
										db[dbs].update({date: date},{ $push: { ips: uip } });
									} else {
										console.log('someone at location already played dc');
										client.emit('dcstart', {res: false} );
									}
								});
								
							} else {
								console.log('user already played dc');
								client.emit('dcstart', {res: false} );
							}
						});
					} else {
						console.log('ERROR: user not properly logged in while trying to start dc.');
					}
					
				});

			} else {
				console.log('ERROR: user ip not properly located in session. denying access to dc.');
			}

		});
	});
	
	//GET STATS FROM DAILY PUZZLE
	client.on('getdcstats', function(){
		var datestring = getdatestring();
		var dcobject = {};
		
		dailies.forEach( function(n){
			
			db['dc' + n].find({date: datestring}, function(err, result){
				if( err != null ){
					console.log('dc: DB ERROR: ' + err );
				} else if( result == ''){
					console.log('dc: no stats to return. Searching wrong date?');
				} else {
					dcobject['dc' + n] = result[0].stats;
					//console.log( statarray );
					
					
					if( Object.keys(dcobject).length == dailies.length ){
						client.emit( 'getdcstats', dcobject );
					}
				}

			});
		})
		
	});
	
	//STORE DAILY PUZZLE STATS
	client.on('senddcstats', function(data){
		client.get('username', function( err, name ){
			if( name != '' && name != null && name != 'null' ){
				var datestring = data[3];
				var dct = 'dc' + data[4];
				db[dct].update({date: datestring},{ $push: { stats: { u: name.toUpperCase(), s: data[0], n: data[1], w: data[2]} } });
				console.log('User ' + name + ' submitted dc results for size: ' + data[4]);
			} else {
				console.log('user not properly logged in while trying to submit dc stats');
			}
		});
	});
	
	
	
	/*--------------------------------------------------------------------------------------------------------------------
							Multiplayer Stuff
	--------------------------------------------------------------------------------------------------------------------*/
	
	//User requested to join a multiplayer room.
	client.on('joinroom', function(data){
		client.get('username', function( err, name ){
			if( err == null ){
				
				console.log( name + ' trying to join room ' + data );

				//snatch room out of roomlist by id.
				var roomtest = getroom(data);


				
				//if room wasn't found in list it will return a -1. verify it didn't.
				if( roomtest != -1 ){

					removefrombaillist(roomtest.gameid, name);


					if( !(checkforplayer(data, name)) ){
						//check if room is full. possible i guess if 2 ppl clicked join at the same time.
						if( roomtest.players.length < maxplayers ){
							client.set('ingame', true); 
							roomtest.players.push(name); //add player to room.
							io.sockets.in(data).emit('playerjoinroom', name); //send new user to all other players in the room
							client.join(data); //add player to room in session

							client.emit('playermarker', [roomtest.gameid, roomtest.players.length]);
							client.broadcast.emit('playermarker', [roomtest.gameid, roomtest.players.length]);
							
							client.emit('joinroom', {errors: '', id: roomtest.gameid, players: roomtest.players} );
							console.log( name + ' joined table ' + data );

							var auto_timer;
							
							//check if room is now full, if so start the game.
							if( roomtest.players.length >= maxplayers ){
								clearTimeout('auto_timer');
								io.sockets.in(data).emit('startmpgame', { board: roomtest.board, gameid: roomtest.gameid});
								emptybaillist(roomtest.gameid);
								client.broadcast.emit('removeroom', data );
								client.emit('removeroom', data );
								setroomstatus( data, 'inprogress' );
								createroom(true);
								console.log('Game ' + roomtest.letter + ':' + roomtest.gameid + ' started! With players: ' + roomtest.players);
								setTimeout( function(){
									var roomtemp = getunusedroom();
									if( roomtemp != -1 ){
										setused( roomtemp );
										client.emit('addroom', [roomtemp, getroomletter(roomtemp), '0'] );
										client.broadcast.emit('addroom', [roomtemp, getroomletter(roomtemp), '0'] );
									} else {
										console.log('Error getting unused room!');
									}
								}, 1000);
							} else if( roomtest.players.length >= minplayers && roomtest.players.length < maxplayers ){
								// io.sockets.in(data).emit('auto_timer');
							}
							
						} else {
							client.emit('joinroom', {errors: 'Room is full!'} );
							console.log( 'Cannot join. Room is full.' );
						}
					} else {
						console.log("THE ERROR I'M TRYING TO FIX: USERS CAN NOT PLAY THEMSELVES YA HEARRRRD?");
					}
				} else {
					client.emit('joinroom', {errors: 'Game alredy started!'} );
					console.log('Cannot join. Game already started.' );
				}
				
			} else {
				client.emit('joinroom', {errors: 'Something went horribly wrong! Please sign out then sign back in and try again!'} );
				console.log('ERROR GETTING USERNAME: MULTIPLAYER JOIN ROOM');
			}
		});
	});
	
	client.on('leaveroom', function(){
		client.get('username', function( err, name ){
			if( err == null ){


				client.set('ingame', false);
				var gam = getgamebyplayer(name);
				console.log('user: '.yellow + name + ', gameid: '.yellow + gam.gameid)
				if( gam != -1 ){


					console.log( name + ' left room ' + gam.gameid );

					removeplayerfromroom(gam.gameid, name);

					//addtobaillist(gam.gameid, name);
					client.leave(gam.gameid);
					io.sockets.in(gam.gameid).emit('playerleaveroom', name );
					client.emit('playermarker', [gam.gameid, gam.players.length]);
					client.broadcast.emit('playermarker', [gam.gameid, gam.players.length]);
					console.log( name + ' left room ' + gam.letter + ':' + gam.gameid );

							
				}
						


			} else {
				console.log('ERROR GETTING USERNAME: MULTIPLAYER LEAVE ROOM');
			}
		});
	});
	
	client.on('finishmpgame', function(data){
		client.get('username', function( err, name ){
			if( err == null ){
				client.set('ingame', false);
				//console.log(data);
				var temproom = getroom(data.gameid);
				console.log(name.toUpperCase() + ' submitted stats for room ' + data.gameid);
				var statcheck = pushstatstoroom(data.gameid, {'user': name, 'tscore': data.score, 'words': data.words, 'won': false});
				if( temproom != -1 && statcheck != -1 ){
					console.log('stats accepted');
							
							
							if( getstatlength(data.gameid) == temproom.players.length ){
								console.log('All player stats collected for room ' + data.gameid);
								console.log('computing game stats...');
								setroomstatus(data.gameid, 'computingstats');
								computestats(data.gameid);
								
								function statsdonecomputing(r){
										console.log('closing out room: ' + r + '!');
										temproom = getroom(r);
										io.sockets.in(temproom.gameid).emit('finishmpgame', temproom);
										clearInterval(checkifdone);

										
										var temps = [];
										var len = temproom.stats.length;
										var xi = 1;
										temproom.stats.forEach( function(stat){
											db.users.find({username: stat.user.toUpperCase()}, function(err, ures){
												if( err == undefined ){
													var response = ures[0].stats;
													if( response != undefined ){
														temps.push({ n: ures[0].username, p: response.totalpoints, w: response.wins, l: response.losses});
													} else {
														temps.push({ n: doc.username, p: -1 });
													}
												} else {
													console.log('ERROR FINDING USER IN DB: updating leaderboard');
												}

												if( len == xi ){
													client.broadcast.emit('lbupdate', temps);
													client.emit('lbupdate', temps);
												}
												xi++;
											});
										});
								}

								var checkifdone = setInterval( function(){
									console.log('checking if stats done computing room: ' + data.gameid);
									if( getroomstatus(data.gameid) == 'completed' ){
										statsdonecomputing(data.gameid);
									}
								}, 250);
							}
				} else {
					console.log('stats not accepted, for unknown reasons, possible server restart');
				}
					

			} else {
				console.log('ERROR GETTING USERNAME: FINISH MULTIPLAYER GAME');
			} 
		});
	});
	
	// Client request refresh a player's stats
	client.on('get_statistics', function(n){
		console.log('stats requested for: ' + n);
		db.users.find({username: n}, function(err, response){
			if( err == undefined ){
				client.emit('get_statistics', { stat: response[0].stats, name: n } );
			} else {
				console.log('ERROR FINDING USER IN DB: USER REQUESTING A PLAYERS STATS');
			}
		})
	});

	// Client Requst entire leaderboard refresh ( now only runs on login )
	// Should proabably cache this server side later when we get more users.
	client.on('getleaderboard', function(){
		var leadobj = [];

		//count users so we know when to break the loop.
		db.users.count(function(err, c){
			times = c;
			//console.log('Times to check: ' + times);
			var inc = 0; 

			//roll through all users in the database and add their stats to the leadobj array
			//if they don't have stats yet, throw a -1 in their points to signify it.
			db.users.find().forEach(function(err, doc){
				if( doc != null ){
					if( doc.stats != undefined ){
						leadobj.push({ n: doc.username, p: doc.stats.totalpoints, w: doc.stats.wins, l: doc.stats.losses});
					} else {
						leadobj.push({ n: doc.username, p: -1 }); //users who haven't been around since early in dev
					}
				}

				//console.log(inc)
				if( inc >= times ){
					//console.log('SENDING LEAD OBJECT');
					client.emit('getleaderboard', leadobj );
				}
				inc++;
			})
		});
		
	});

	client.on('getallwords', function(b){
		client.emit('getallwords', {list: dic.getwordlist(b.list), type: b.type});
	})

	client.on('gettestlist', function(){
		var idkwtflist = ["B","C","A","B","D","M","E","D","T","E","L","B","B","S","A","L"];
		client.emit('getallwords', {list: dic.getwordlist(idkwtflist), type: "sp" });
	})


	/////////////////////
	//Testing Functions//
	/////////////////////
	/* shouldn't do anything except return test data */

	// Send back new user stats to inject into leaderboard.
	client.on('lbupdate', function(){
		client.emit('lbupdate', [{ n: 'Ant', p: 1000, w: 2000, l: 3 },{ n: 'Aja', p: 1001, w: 23423, l: 111 }]);
	});



	/////////////////////
	//Utility Functions//
	/////////////////////

	client.on('getmpcache', function(){
		client.emit('getmpcache', roomlist);
	})

	//temp function for setting player count
	client.on('setplayercount', function(data){
		client.get('username', function(err, n){
			if( n != '' && n != undefined ){
				if( n.toUpperCase() == 'KWAZYDAVE' || n.toUpperCase() == 'SHERLOCKER' || n.toUpperCase() == 'ANT' || n.toUpperCase() == 'ELPEDRO18' || n.toUpperCase() == 'AJA' || n.toUpperCase() == 'NULL' || n.toUpperCase() == 'VLADMAN'){
					if( data > 1 && data < 6){
						maxplayers = data;
						minplayers = data;
						console.log('player min/max set to: '.rasta + data)
						var pstring = 'Playercount set to ' + data;
						client.emit('messages', { message: pstring, type: 'console'} );
					} else {
						client.emit('messages', { message: 'Playercount not valid. Please enter a # from 2-5.', type: 'console'});
						console.log('Error: player min/max NOT set to: '.rasta + data)
					}
				} else {
					console.log(n.red + ' IS TRYING TO EDIT PLAYER LIMITATIONS! BANHAMMER!'.red);
					client.emit('messages', { message: 'You DO NOT have permission to do that!', type: 'console'});
				}
			}
			
		})
	});

	//temp function for getting player count
	client.on('getplayercount', function(){
		var pstring = "Playercount is currently set to " + maxplayers;
		client.emit('messages', { message: pstring, type: 'console' });
	})



});



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
							Stuff involving stats and stat calculations
--------------------------------------------------------------------------------------------------------------------*/

//instantiate new user stats
function newstats(){

	var newstatsobject = {
		gamesplayed: 0,
		wins: 0,
		losses: 0,
		mostwords: 0,
		totalwords: 0,
		acceptedwords: 0,
		mostacceptedwords: 0,
		dupewords: 0,
		mostdupewords: 0,
		bestword: '',
		mostpoints: 0,
		totalpoints: 0,
		wordarchive: trie()
	}

	return newstatsobject;
}

var xlist = [];
var ylist = [];
var indexes = [];
var dupelist = [];
var xnames = [];
var ynames = [];
var statscomplete = false;

function abcfinder(){
	var abcdex = 0;
	for( x = 1; x < xlist.length; x++ ){
		if( xlist[x][indexes[x]] < xlist[abcdex][indexes[abcdex]] ){
			abcdex = x;
		}
	}
	return abcdex;
}

function getwordscore(w){
	switch(w.length){
		case 1:
		case 2:
		case 3:
		case 4:
			return 1;
		case 5:
			return 2;
		case 6:
			return 3;
		case 7:
			return 5;
		case 8:
		case 9:
		case 10:
		case 11:
		case 12:
		case 13:
		case 14:
		case 15:
		case 16:
			return 11;
		default:
			console.log('ERROR: BROKE WHILE GETTING WORD SCORE')
	}	
}

function checkdupe(){
	while( xlist.length > 1 ){
		var dupes = false;
		var inum = abcfinder();
		var dword = xlist[inum][indexes[inum]];

		for( i = 0; i < xlist.length; i++ ){
			if( i != inum){
				if( xlist[i][indexes[i]] == dword ){
					xlist[i].splice(indexes[i], 1);
					dupes = true;
				}
			}
		}

		if( dupes ){
			xlist[inum].splice(indexes[inum],1);
			dupelist.push( dword );
		} else {
			indexes[inum]++;
		}

		var idk = false;
		for( i = 0; i < xlist.length; i++ ){
			if( indexes[i] == xlist[i].length ){
				ylist.push(xlist[i]);
				xlist.splice(i,1)
				indexes.splice(i, 1); 
				ynames.push(xnames[i]);
				xnames.splice(i, 1);
				i--;
			}
		}
	}
	
	if( xlist.length == 1 ){
		ylist.push(xlist[0]);
		xlist.splice(0,1);
		ynames.push(xnames[0]);
		xnames.splice(i, 1);
	}
	
	
}


function computestats(g){
	var tempgame = getroom(g);

	xlist = [];
	ylist = [];
	indexes = [];
	dupelist = [];
	xnames = [];
	ynames = [];

	xlist = [];
	for( n = 0; n < tempgame.stats.length; n++ ){
		//console.log( tempgame.stats[n].words);
		xlist.push(tempgame.stats[n].words.slice(0).sort());
		indexes.push(0);
		xnames.push(tempgame.stats[n].user)
	}
	
	console.log(xnames);
	checkdupe();
	tempgame.dupelist = dupelist;
	console.log(ynames);
	
	for( i = 0; i < ylist.length; i++ ){
		var tscore = 0;
		var bestword = '';
		for( k = 0; k < ylist[i].length; k++ ){
			tscore += getwordscore(ylist[i][k]);
			if( ylist[i][k].length > bestword.length ){
				bestword = ylist[i][k];
			}
		}

		for( z = 0; z < tempgame.stats.length; z++ ){
			//console.log('testing: ' + ynames[i] + ' vs ' + tempgame.stats[z].user)
			if( ynames[i] == tempgame.stats[z].user ){
				//console.log('adding this list to ' + tempgame.stats[z].user );
				tempgame.stats[z].score = tscore;
				tempgame.stats[z].acceptedwords = ylist[i].length;
				tempgame.stats[z].bestword = bestword;
			}
		}
		
		//console.log( tempgame.stats[i].words );
	}
	
	tempgame.stats.sort(function(a, b) { 
		return b.score - a.score;
	})

	var multiplewinners = [];
	var highscore = 0;

	for( d = 0; d < tempgame.stats.length; d++ ){
		if( tempgame.stats[d].score > highscore ){
			multiplewinners = [];
			multiplewinners.push(d);
			highscore = tempgame.stats[d].score;
		} else if( tempgame.stats[d].score == highscore ){
			multiplewinners.push(d);
		}
	}

	
	if( multiplewinners.length == 1 ){
		tempgame.stats[multiplewinners[0]].won = true;
		console.log("Player " + tempgame.stats[multiplewinners[0]].user + " won at table " + tempgame.gameid + " with a score of " + tempgame.stats[multiplewinners[0]].score );
	} else {
		var wtext = '';
		for( h = 0; h < multiplewinners.length; h++ ){
			tempgame.stats[multiplewinners[h]].won = true;
			if( h != multiplewinners.length - 1 ){
				wtext += tempgame.stats[multiplewinners[h]].user + ', ';
			} else {
				wtext += tempgame.stats[multiplewinners[h]].user;
			}
		}
		console.log("Multiple winners: " + wtext + " at table " + tempgame.gameid + " with a score of " + tempgame.stats[multiplewinners[0]].score );
	}


	

	//cycle through players that were in the game and update their stats in the database
	tempgame.stats.forEach(function(stat){

		db.users.find({username: stat.user.toUpperCase()}, function(err, ures){
			
			if( err == undefined ){

				//console.log('-- Updating stats for: ' + stat.user);
				//console.log(ures);
				var response = ures[0].stats; //pull a temp copy of player stats from db

				//cycle through each 
				for( var key in response ){
					//console.log('Editing: ' + key);
					switch( key ){


						//Games Played
						case 'gamesplayed':
							response.gamesplayed++;
							break;


						//Wins
						case 'wins':
							if( stat.won == true ){
								response.wins++;
							}
							break;


						//Losses
						case 'losses':
							if( stat.won == false ){
								response.losses++;
							}
							break;


						//Total words
						case 'totalwords':
							response.totalwords += stat.words.length;
							break;


						//Most words in a single round
						case 'mostwords':
							if( stat.words.length > response.mostwords ){
								response.mostwords = stat.words.length;
							}
							break;


						//Accepted Words
						case 'acceptedwords':
							response.acceptedwords += stat.acceptedwords;
							break;


						//Most Accepted Words
						case 'mostacceptedwords':
							if( stat.acceptedwords > response.mostacceptedwords ){
								response.mostacceptedwords = stat.acceptedwords;
							}
							break;


						//Dupe Words
						case 'dupewords':
							response.dupewords += stat.words.length - stat.acceptedwords;
							break;


						//Most Dupe Words
						case 'mostdupewords':
							if( stat.words.length - stat.acceptedwords > response.mostdupewords ){
								response.mostdupewords = stat.words.length - stat.acceptedwords;
							}
							break;



						//Total points
						case 'totalpoints':
							response.totalpoints += stat.score;
							break;


						//Most Points in a single round
						case 'mostpoints':
							if( stat.score > response.mostpoints ){
								response.mostpoints = stat.score;
							}
							break;


						//Best word found
						case 'bestword':
							if( stat.bestword.length >= response.bestword.length ){
								response.bestword = stat.bestword;
							}
							break;


						//Word archive for player
						case 'wordarchive':
							for( w = 0; w < stat.words.length; w++ ){
								obj_insert(response.wordarchive, stat.words[w] );
							}
							break;


						//Unknown field
						default:
							console.log('Property ' + key + ' not accounted for!')
							break;
					}
				}


				var responsedoc = {};
				for( var ukey in response ){
					var t = response[ukey];
					responsedoc['stats.'+ukey] = t;
				}

				//console.log(responsedoc);

				db.users.update({username: stat.user.toUpperCase()}, {$set: responsedoc}, {upsert: true});

			} else {
				console.log('ERROR: retrieving user stats from database');
			}

				
		});
	});

	
	console.log('stat computation completed for: ' + tempgame.gameid);
	setroomstatus(tempgame.gameid, 'completed');
}



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
							User List and Chatter List functions and storage
--------------------------------------------------------------------------------------------------------------------*/


// user list
var userlist = [];
function adduser( name ){
	userlist.push( name );
	console.log( "['".cyan + userlist.join("', '").cyan + "']".cyan );
}
function removeuser( name ){
	if( userexists( name ) != -1 ){
		userlist.splice( userexists( name ), 1 );
		console.log( "['".cyan + userlist.join("', '").cyan + "']".cyan  );
	} else {
		if( name != null && name != ""){
			console.log('User: ' + name + ' does not exist in online user list!');
		}
	}
}
function userexists( name ){
	name = normalize( name );
	for( i = 0; i < userlist.length; i++ ){
		var name2 = normalize( userlist[i] );
		if( name == name2 ){
			return i;
		}
	}
	return -1;
}

// chat list
var chatlist = [];
function addtochat( name ){
	chatlist.push( name );
}
function removefromchat( name ){
	if( chatterexists( name ) != -1 ){
		chatlist.splice( chatterexists( name ), 1 );
	} else {
		console.log('User: ' + name + ' does not exist in online chat list!');
	}
}
function chatterexists( name ){
	name = normalize( name );
	for( i = 0; i < chatlist.length; i++ ){
		var name2 = normalize( chatlist[i] );
		if( name == name2 ){
			return i;
		}
	}
	return -1;
}

function normalize( name ){
	if( name == null || name == 'null' || name == '' ){
		return name;
	} else {
		return name.toUpperCase();
	}
}

/*--------------------------------------------------------------------------------------------------------------------
							STORE CHAT HISTORY TEMPORARILY
--------------------------------------------------------------------------------------------------------------------*/

// chat history
var messagememory = [];
function storemessage(m){
	m.time = new Date();
	messagememory.push(m);
	if( messagememory.length > 100 ){
		messagememory.shift()
	}
}


/*--------------------------------------------------------------------------------------------------------------------
							Daily Challenge stuff
--------------------------------------------------------------------------------------------------------------------*/
//store daily challenge board
var dailies = [3,4,5];

var dailyboard3 = [];
var dailyboard4 = [];
var dailyboard5 = [];

function generategame(si){
	
	var sizy = si || 4;
	var genboard = [];
	var cells = sizy*sizy;
	
	var die;
	var sideofdie;

	//// create main board and fill with 0's
	for( g = 0; g < cells; g++){
		genboard[g] = false;
	}
	
	//// define all dice to be rolled
	var dice = [
		['A','A','A','F','R','S'],
		['A','A','F','I','R','S'],
		['A','D','E','N','N','N'],
		['A','E','E','E','E','M'],
		['A','E','E','E','E','R'],
		['A','E','E','G','M','U'],
		['A','E','G','M','N','N'],
		['A','F','I','R','S','Y'],
		['B','J','K','S','X','Z'],
		['C','C','E','N','S','T'],
		['C','E','I','I','L','T'],
		['C','E','I','L','P','T'],
		['C','E','I','P','S','T'],
		['D','D','H','N','O','T'],
		['D','H','H','L','O','R'],
		['D','H','L','N','O','R'],
		['D','H','L','N','O','R'],
		['E','I','I','I','T','T'],
		['E','M','O','T','T','T'],
		['E','N','S','S','S','U'],
		['F','I','P','R','S','Y'],
		['G','O','R','R','V','W'],
		['I','P','R','R','R','Y'],
		['N','O','O','T','U','W'],
		['O','O','O','T','T','U'] ];

	//// chose appropriate amount of dice to roll and place into main array
	for( z = 0; z < genboard.length; z++){
		while(!genboard[z]){
			die = (Math.floor(Math.random()*dice.length));
			sideofdie = (Math.floor(Math.random()*6));
			genboard[z] = dice[die][sideofdie];
			dice.splice(die, 1);
		}
	}
	
	return genboard;
}

//create a string to id daily challenge
function getdatestring(d){
	var today = d || new Date();
	var day = today.getDate();
	var month = today.getMonth() + 1;
	var year = today.getFullYear();
	var date = month + '_' + day + '_' + year;
	return date;
}

//load daily challenge if already generated, create new dc if one does not exist
function getboard(){

	dailies.forEach(function(t){
		var datestring = getdatestring();
		var dct = 'dc' + t;
		db[dct].find({date: datestring}, function(err, dc) {
			if( err != null ){
				console.log('dc: DB ERROR: ' + err );
			} else if( dc == ''){
				var newdc = generategame(t);
				console.log( 'NEW DC.. ' + datestring + ', SIZE: ' + t + ', BOARD: ' + newdc );
				db[dct].save({date: datestring, board: newdc, users: [], ips: [], stats: [] });
				
				eval('dailyboard' + t + ' = newdc');
				
			} else {
				console.log('DC for size ' + t + ' already exists');
				var dcx = dc[0].board
				eval('dailyboard' + t + ' = dcx');
			}

			if(t == 5) console.log('Dailies Loaded!')		

		});
	})
	
}

getboard();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//DAILY FUNCTIONS
var dcjob = new cronJob({
  cronTime: '00 00 00 * * *',
  onTick: function() {
  	
  	//CACHE OLD DAILY FOR DISPLAY LATER
  	cachepreviousdaily();

	//GENERATE NEW DAILY PUZZLES
	dailies.forEach(function(t){
		var datestring = getdatestring();
		var dct = 'dc' + t;
		db[dct].find({date: datestring}, function(err, dc) {
			if( err != null ){
				console.log('dc: DB ERROR: ' + err );
			} else if( dc == ''){
				var newdc = generategame(t);
				console.log( 'NEW DC.. ' + datestring + ', SIZE: ' + t + ', BOARD: ' + newdc );
				db[dct].save({date: datestring, board: newdc, users: [], ips: [], stats: [] });
				
				eval('dailyboard' + t + ' = newdc');
				
			} else {
				console.log('DC for size ' + t + ' already exists');
			}
		});
	})
	
	//BACK UP OUR DATABASE 
	console.log('running routine backup!');
    var args = ['--db', 'smw', '-o', 'c:\\mongodb\\bin\\dump']
      , mongodump = spawn('/mongodb/bin/mongodump', args);
    mongodump.stdout.on('data', function (data) {
      //console.log('stdout: ' + data);
    });
    mongodump.stderr.on('data', function (data) {
      console.log('stderr: '.red + data);
    });
    mongodump.on('exit', function (code) {
    	if( code == 0 ){
    		console.log('Backup successful!'.green);
    	} else {
    		console.log('There was a problem backing up! Error code: '.red + code)
    	}
      
    });
	

  },
  start: false
});
dcjob.start();

//STUFF TO DO ON SERVER START
var pdailies = {};

function cachepreviousdaily(){
	var temptime = new Date().getTime();
	var tempdate = new Date( temptime - 86400000 ); //cuz 86400000 = 1 day 
	var yesterdate = getdatestring(tempdate);
	console.log('Caching Previously dailies for... ' + yesterdate );

	dailies.forEach( function(n){
		
		db['dc' + n].find({date: yesterdate}, function(err, result){
			if( err != null ){
				console.log('dc: DB ERROR: ' + err );
			} else if( result == ''){
				console.log('dc: no stats to return. Searching wrong date?');
			} else {
				pdailies['dc' + n] = result[0];
				//console.log( statarray );
			}

		});
	})

}
cachepreviousdaily();

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
							Multiplayer Stuff
--------------------------------------------------------------------------------------------------------------------*/

var roomlist = [];
var roomcount = 3;
var maxplayers = 2;
var minplayers = 2;
var lastletter = "Z";

function nextletter(){
	var code = lastletter.charCodeAt(0);
	
	if( code != 90 ){
		lastletter = String.fromCharCode(code + 1);
	} else {
		lastletter = 'A';
	}
	
	return lastletter;
}

function getroom(id){
	for( i = 0; i < roomlist.length; i++ ){
		if( roomlist[i].gameid == id ){
			return roomlist[i];
		}
	}
	
	return -1;
}

function pushstatstoroom(id, s){
	for( i = 0; i < roomlist.length; i++ ){
		if( roomlist[i].gameid == id ){
			roomlist[i].stats.push(s);
			return 0;
		}
	}
	
	return -1;
}

function getstatlength(id){
	for( i = 0; i < roomlist.length; i++ ){
		if( roomlist[i].gameid == id ){
			return roomlist[i].stats.length;
		}
	}
	
	return -1;
}

function setroomstatus(id, stat){
	for( i = 0; i < roomlist.length; i++ ){
		if( roomlist[i].gameid == id){
			roomlist[i].status = stat;
		}
	}
}

function getroomstatus(id){
	for( i = 0; i < roomlist.length; i++ ){
		if( roomlist[i].gameid == id){
			return roomlist[i].status;
		}
	}
}

function addplayertoroom(id, n){
	for( i = 0; i < roomlist.length; i++ ){
		if( roomlist[i].gameid == id){
			roomlist[i].players.push(n);
		}
	}
}

function setused(id){
	for( i = 0; i < roomlist.length; i++ ){
		if( roomlist[i].gameid == id){
			roomlist[i].newroom = false;
		}
	}
}

function getroomletter(id){
	for( i = 0; i < roomlist.length; i++ ){
		if( roomlist[i].gameid == id ){
			return roomlist[i].letter;
		}
	}
}

function getunusedroom(){
	for( i = 0; i < roomlist.length; i++ ){
		if( roomlist[i].newroom ){
			return roomlist[i].gameid;
		}
	}
	
	return -1;
}
												

function checkforplayer(id, n){
	var ulist;
	for( i = 0; i < roomlist.length; i++ ){
		if( roomlist[i].gameid == id ){
			ulist = roomlist[i].players;
			break;
		}
	}
	for( i = 0; i < ulist.length; i++ ){
		if( ulist[i] == n ){
			return true;
		}
	}

	return false;
}

function getgamebyplayer(n){
	for( i = 0; i < roomlist.length; i++ ){
		if( roomlist[i].status == 'inprogress' || roomlist[i].status == 'new'){
			//console.log('checking room: '.yellow + roomlist[i].gameid);
			for( j = 0; j < roomlist[i].players.length; j++ ){
				
				if( roomlist[i].players[j] == n ){
					return roomlist[i];
				}
			}

			for( j = 0; j < roomlist[i].bailers.length; j++ ){
				if( roomlist[i].bailers[j] == n ){
					return roomlist[i];
				}
			}
		}
	}

	return -1;
}

function unbailplayer(id, n){
	for( i = 0; i < roomlist.length; i++ ){
		if( roomlist[i].gameid == id ){
			for( h = 0; h < roomlist[i].bailers.length; h++ ){
				if( roomlist[i].bailers[h] == n ){
					roomlist[i].bailers.splice(h, 1);
					roomlist[i].players.push(n);
				}
			}
		}
	}
}

function removefrombaillist(id, n){
	for( i = 0; i < roomlist.length; i ++ ){
		if( roomlist[i].gameid == id ){
			for( b = 0; b < roomlist[i].bailers; b++ ){
				if( roomlist[i].bailers[b] == n ){
					roomlist[i].bailers.spice(b, 1);
					console.log('removed'.yellow + name + ' from bail list. table ' + id);
				}
			}
		}
	}
}

function addtobaillist(id, n ){
	for( i = 0; i < roomlist.length; i ++ ){
		if( roomlist[i].gameid == id ){
			roomlist[i].bailers.push(n);
		}
	}
}

function bailplayerfromroom(id, n){
	for( i = 0; i < roomlist.length; i++ ){
		if( roomlist[i].gameid == id ){
			for( h = 0; h < roomlist[i].players.length; h++ ){
				if( roomlist[i].players[h] == n ){
					roomlist[i].players.splice(h, 1);
					roomlist[i].bailers.push(n);
					console.log('user removed from room and added to bail list');
				}
			}
		}
	}
}

function removeplayerfromroom(id, n){
	for( i = 0; i < roomlist.length; i++ ){
		if( roomlist[i].gameid == id ){
			for( h = 0; h < roomlist[i].players.length; h++ ){
				if( roomlist[i].players[h] == n ){
					roomlist[i].players.splice(h, 1);
				}
			}
		}
	}
}

function emptybaillist(id){
	for( i = 0; i < roomlist.length; i++ ){
		if( roomlist[i].gameid == id ){
			roomlist[i].bailers = [];
		}
	}
}

function userinbailers(n){
	for( i = 0; i < roomlist.length; i++ ){
		if( roomlist[i].status == 'new' || roomlist[i].status == 'inprogress'){
			for( g = 0; g < roomlist[i].bailers; g++ ){
				if( roomlist[i].bailers[g] == n ){
					return roomlist[i];
				}
			}
		}
	}

	return -1;
}

function room(){
	this.players = [];
	this.bailers = [];
	this.board = generategame();
	this.gameid = new Date().getTime();
	this.date = getdatestring();
	this.newroom = false;
	this.status = 'new';
	this.letter = nextletter;
	this.stats = [];
	
	//db.mpcache.save({ gameid: this.roomid, board: this.board, players: this.players, completed: this.complete });
}

function createroom(n){
	
	var newr = false;
	if( n ){
		var newr = n;
	}
	
	var exists = false;
	var room1 = new room();
	
	for( i = 0; i < roomlist.length; i++ ){
		//console.log( room1.gameid + ', ' + roomlist[i].gameid );
		if( room1.gameid == roomlist[i].gameid ){
			exists = true;
		}
	}
	
	if( !exists ){
	
		if( newr ){
			room1.newroom = true;
		}
		room1.letter = nextletter();
		roomlist.push( room1 );
		console.log( 'New room: ' + room1.letter + ' ' + room1.gameid + ' added to stack.... ' + room1.board );
		
	} else {
		//console.log("lol u can't create 2 rooms with the same id silly" );
		createroom();
	}
	
};

function loadrooms(){
	var count = 0;
	var temp = db.mpcache.find();
	
	temp.forEach(function( err, doc ){
		if(!doc){
			console.log( count + ' unfinished games' );
			newrooms();
		} else {
			roomlist.push( doc.gameid );
			count++;
		}
	});
	
	function newrooms(){
		if( count < roomcount ){
			while( count < roomcount ){
				createroom();
				count++;
			}
		}
	}
	
}

loadrooms();




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Trie Implementation because idk where else to put it for now.

function trie() {
    var o = new Object;
    o.words = 0;
    o.children = {};
    return o;
};

function obj_insert(obj, str, pos) {
    if(str.length == 0) { //blank string cannot be inserted
        return;
    }
    
    var T = obj;
        
    if(pos === undefined) {
        pos = 0;
    }
    if(pos === str.length) {
        T.words ++;
        return;
    }
    /*T.prefixes ++;*/
    k = str[pos];
    if(T.children[k] === undefined) { //if node for this char doesn't exist, create one
        T.children[k] = trie();
    }
    child = T.children[k];
    obj_insert(child, str, pos + 1);
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
	daily_server_stats = { //will be identified by date
		unique_visitors: [
			{ 
				user: 'name1',
				games: #,
				wins: #
			},
			{ 
				user: 'name2',
				games: #,
				wins: #
			}
		],
		total_visits: #, 
		games_played: #,
		daily_word: 'word',
		dc_plays: {
			dc3: #,
			dc4: #,
			dc5: #
		},
		daily_records: {
			most_games: { user: 'name', data: # },
			most_words: { user: 'name', data: # },
			most_points: { user: 'name', data: # },
			best_word: { user: 'name', data: 'word' },
			most_wins: { user: 'name', data: # }
		}
	}
*/