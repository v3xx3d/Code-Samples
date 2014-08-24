
var username = '';
var hideinfo = false;
var ostatus = false;
var mynewstats;


function checkstatus(){
	if( username == null || username == '' || username == 'null' ){
		return false;
	} else return true;
}

function connectionerror(){
	alert('There was a problem with the connection.'
	+ ' Please try signing back in.'
	+ ' If the problem persists the server may be down for maintenance.' );
}

/*-----------------------------------------------
		Multiplayer Stuff
------------------------------------------------*/

function joinmpgame(gameid){
	server.emit('joinroom', gameid);
}

function leavempgame(){
	server.emit('leaveroom');
}

function finishmpgame(s,w,id){
	server.emit('finishmpgame', {words: w, score: s, gameid: id});
}	

var lastmpresult;

server.on('finishmpgame', function(data){
	var results = data.stats;
	lastmpresult = data;

	$('#waitingforplayersstatus').empty().append('building results...');
	
	results.sort(function(a, b) { 
		return b.score - a.score;
	})

	$('#mpresultssummary').empty();
	$('#mpresultstabs').empty();
	$('#mptop_tabs').empty();

	var pmarker = 0;
	var pscore = results[0].score;
	var places = [ '2nd', '3rd'];
	var place = '1st';
	for(i = 0; i < results.length; i++){

		if( results[i].score < pscore ){
			if( pmarker < 2 ){
				place = places[pmarker];
			} else {
				place = (pmarker+2) + 'th';
			}
			pmarker++;
			pscore = results[i].score;
		}
		
		var tlist = results[i].words.sort();

		$('#mpresultssummary').append('<tr><td><p>' + place + '</p></td><td><p>' + results[i].user + '</p></td><td><p>' + results[i].words.length + '</p></td><td><p>' + results[i].score + '</p></td><td><img class="mpresults_navs" id="mpresults_nav' + i + '" src="/somanywords/images/circlearrow.png" /></td></tr>');
		$('#mptop_tabs').append('<div style="display: none;" class="mptoptab" id="mptop_tab' + i + '"><p>' + results[i].user + ' Word Overview</p></div>')
		$('#mpresultstabs').append('<div style="display: none" class="mpresultstab" id="mpresults_tab' + i + '"><p>' + tlist.join(', ') + '</p><button class="mpcontentback">back to game summary</button></div>')
	}

	$('.mpresults_navs').click(function(){
		var tstring = $(this).attr('id');
		var num = tstring.substring(tstring.length-1);

		//top
		$('#mptop_home').hide();
		$('#mptop_tabs').show();

		$('#mptop_tab' + num).show();

		//content
		$('#mpresultshome').hide();
		$('#mpresultstabs').show();

		$('#mpresults_tab' + num).show();
	})

	$('.mpcontentback').click(function(){
		$('.mptoptab').hide();
		$('#mptop_tabs').hide();
		$('#mptop_home').show();

		$('.mpresultstab').hide();
		$('#mpresultstabs').hide();
		$('#mpresultshome').show();
	});

	$('#waitingforplayers').hide();

});

server.on('joinroom', function( data ){
	if( data.errors == '' ){
		var jrid = data.gameid;
		var jrplayers = data.players;

		clearmplobby();
		if( jrplayers.length > 0 ){
			for( i = 0; i < jrplayers.length; i++ ){
				$('#mpreadyplayers').append('<p id="mpplayerready' + jrplayers[i] + '" class="mpplayerready">' + jrplayers[i] + '</p>');
			}
		}
		
		$('#gamelobby').hide();
		$('#mplobby').show();
		
	} else {
		alert(data.errors);
	}
});

server.on('addroom', function(data){
	//console.log('adding room ' + data[0]);
	var roomid = data[0];
	var roomlet = data[1];
	var pcount = data[2];
	var pstring;
	if( pcount != 1 ){
		pstring = pcount + ' players';
	} else {
		pstring = pcount + ' player';
	}
	$('#roomwrapper').append('<div id="' + roomid + '" class="roommarker"><p class="roomlabel">Room ' + roomlet + '</p><p id="numplayers' + roomid + '"	class="numplayers">' + pstring + '</p><div id="join' + roomid + '" class="roomjoinbutton"></div></div>');
	
	var bindid = '#join' + roomid + ', #' + roomid;
	$(bindid).bind('click', function(){
		if( buttontimeout ){
			return;
		} else buttonpause();
		if( $(this).hasClass('roommarker') ){
			joinmpgame( $(this).attr('id'))
		} else {
			joinmpgame( $(this).parent().attr('id'));
		}
		return false;
	});
});

server.on('removeroom', function(data){
	var roomid = '#' + data;
	$(roomid).remove();
});

server.on('playermarker', function(data){
	var id = data[0];
	var num = data[1];
	var selector = '#numplayers' + id;
	
	var pstring;
	if( num == 0 ){
		pstring = '0 players';
	} else if( num == 1){
		pstring = '<span style="color: #fff;">' + num + ' player</span>';
	} else {
		pstring = '<span style="color: #fff;">' + num + ' players</span>';
	}
	
	$(selector).empty().append(pstring);
});

server.on('playerjoinroom', function(data){
	var pname = data;
	$('#mpreadyplayers').append('<p id="mpplayerready' + pname + '" class="mpplayerready">' + pname + '</p>');
});

server.on('playerleaveroom', function(data){
	var pname = '#mpplayerready' + data;
	$(pname).remove();
});

server.on('startmpgame', function(data){
	var mpboard = data.board;
	$('#mplobbyexit').hide();
	$('#mplobbystatus').empty().append('Players Found!!');
	var countdown = 5;
	$('#mplobbystart').empty().append(countdown).show();
	
	var cd = setInterval( function(){
		countdown--;
		$('#mplobbystart').empty().append(countdown);
	}, 1000);
	
	setTimeout( function(){
		newgame({type: 'mp', board: mpboard, gameid: data.gameid});
		clearInterval(cd);
	}, 5000);
	
});

/*-----------------------------------------------
		Connection thingies
------------------------------------------------*/

server.on('connect', function () {
	
})

server.on('reconnect', function () {
	$('#disconnectwrap').hide();
	if( checkstatus() ){
		var inchat = false;
		if( $('#tempchat').is(':visible') ){
			inchat = true;
		}
		$('#userlisting').empty();
		$('#chatterlisting').empty();
		$('#roomwrapper').empty();
		server.emit('userreconnect', [ username, inchat, ostatus ] );
	} else {
		if( ostatus ){
			connectionerror();
		}
	}
});

server.on('reconnecting', function () {

});

server.on('reconnect_failed', function () {
	forcesignout();
	alert('Connection failed. Please sign back in. If the problem persists please try restarting the app!');
});

server.on('disconnect', function(){
	$('#disconnectwrap').show();
})

/*-----------------------------------------------
		Handle server errors with alerts.
------------------------------------------------*/
server.on('error', function(err){
	//alert( err );
});

/*-----------------------------------------------
		Chat functions
------------------------------------------------*/

$('#joinchat').click(function(){
	if( checkstatus() ){
		$('#gamelobby').hide()
		$('#tempchat').show();
		server.emit('joinchat');
	} else {
		connectionerror();
	}
});

$('#exitchat').click(function(){
	$('#tempchat').hide();
	$('#gamelobby').show()
	server.emit('exitchat');
});

server.on('messages', function(data){
	//alert('message event fired' + data);
	insertMessage(data);
});

server.on('joinchat', function(data){
	if( ostatus ){
		insertchatter(data);
	}
});

server.on('exitchat', function(data){
	removechatter(data);
});

server.on('userlist', function(username){
	if( ostatus ){
		insertusername(username);
	}
});

server.on('userlistremove', function( username ){
	removeusername(username);
});

function insertMessage(data){
	
	var blockcheck = $.inArray( data.name, blockchat );
	
	if( blockcheck == -1 ){
		data.message = addEmoticons(data.message);
		
		
		if( data.type == 'info'){
			if( hideinfo ){
				$('#messagebox').append('<p class="minfo" style="display: none;">' + converttime(data.time) + data.name + data.message + '</p>');
			} else {
				$('#messagebox').append('<p class="minfo">' + converttime(data.time) + data.name + data.message + '</p>');
			}
		} else if(data.type == 'console'){
			$('#messagebox').append('<p class="console">' + data.message + '</p>')
		} else {
			if( data.name == username ){
				$('#messagebox').append('<p class="mes">' + converttime(data.time) + '<span class="username2">' + data.name + ': </span>' + data.message + '</p>');
			} else {
				$('#messagebox').append('<p class="mes">' + converttime(data.time) + '<span class="username">' + data.name + ': </span>' + data.message + '</p>');
			}
		}
	}
	
	
	var chatWindow = document.getElementById('messagebox');
	chatWindow.scrollTop = chatWindow.scrollHeight;
	//alert('inserted' + message);
}

function converttime(t){
	var t2 = t || new Date();
	var local = new Date(t2);

	var c = ':';
	var h = (local.getHours() > 12) ? local.getHours() -12 : local.getHours();
	var m = (local.getHours() > 11) ? 'pm' : 'am';

	if( local.getMinutes() < 10) c = ':0';
	if( h == 0 ) h = 12;

	return '[<span class="timestamp">' + h + c + local.getMinutes() + m + '</span>] ';
}

function insertusername( name ){
	$('#userlisting').append('<p class="onlineusers ' + name + '">' + name + '</p>');
	$('.viewuserstext').empty().append('USERS(' + $('.onlineusers').length + ')');
}

function removeusername( name ){
	var userps = $('.onlineusers');
	userps.each( function(){
		if( $(this).hasClass( name )){
			$(this).remove();
		}
	});
	$('.viewuserstext').empty().append('USERS(' + $('.onlineusers').length + ')');
}

function insertchatter( name ){
	$('#chatterlisting').append('<p class="chatusers ' + name + '">' + name + '</p>');
}

function removechatter( name ){
	var chatterps = $('.chatusers');
	chatterps.each( function(){
		if( $(this).hasClass( name )){
			$(this).remove();
		}
	});
}

var blockchat = [];
$('#chatsubmit').click(function(){
	if( $('#submitmessage').val() == '' || $('#submitmessage').val() == ' ' || $('#submitmessage').val() == '  '){
		return false;
	}
	var message = $('#submitmessage').val();
	
	if( message.substring(0, 1) == '/' ){
	
		var clist = message.split(' ');
		var command = clist[0];
		var value = clist[1];
		
		switch( command ){
			case '/':
				$('#messagebox').append('<p class="console">Command List:</p>');
				// $('#messagebox').append('<p class="console">/ - show list of commands</p>');
				$('#messagebox').append('<p class="console">/clear - empty the chat window</p>');
				$('#messagebox').append('<p class="console">/block USERNAME - block messages from a specific user</p>');
				$('#messagebox').append('<p class="console">/unblock USERNAME - unblock a users messages</p>');
				$('#messagebox').append('<p class="console">/showinfo - show info messages</p>');
				$('#messagebox').append('<p class="console">/hideinfo - hide info messages</p>');
				$('#messagebox').append('<p class="console">/getplayercount - retrieve current player count</p>');
				scrollup();
				break;
			case '/clear':
				$('#messagebox').empty();
				break;
			case '/block':
				var tempc = 'Messages from ' + value + ' will now be blocked.';
				chatconsole( tempc );
				blockchat.push( value );
				break;
			case '/unblock':
				var tempindex = $.inArray( value, blockchat );
				if( tempindex != -1 ){
					blockchat.splice( tempindex, 1 );
					var tempc = 'Messages from ' + value + ' will no longer be blocked.';
					chatconsole( tempc );
				} else {
					var tempc = value + ' was not on your blocklist!';
					chatconsole( tempc );
				}
				break;
			case '/hideinfo':
				chatconsole('Info messages will no longer be shown.');
				hideinfo = true;
				var infos = $('.minfo');
				infos.each( function(){
					$(this).hide();
				});
				break;
			case '/showinfo':
				chatconsole('Info messages will now be displayed.');
				hideinfo = false;
				$('.minfo').show();
				break;
			case '/zen':
				$('#zenzenzen').css('opacity', '1');
				$('#zenzenzen').show()
				$('#zenzenzen').stop().animate({'opacity': '0'}, 5000, function(){
					$('#zenzenzen').hide();
				})
				break;
			case '/setplayercount':
				server.emit('setplayercount', value);
				break;
			case '/getplayercount':
				server.emit('getplayercount');
				break;
			default:
				var tempc = command + ' is not a command!';
				chatconsole( tempc );
				
		}
		$('#submitmessage').val('');
	} else {
		server.emit('messages', message);
		$('#submitmessage').attr('value', "");
	}
});

function chatconsole( ctext ){
	$('#messagebox').append('<p class="console">' + ctext + '</p>');
	scrollup()
}

function scrollup(){
	var chatWindow = document.getElementById('messagebox');
	chatWindow.scrollTop = chatWindow.scrollHeight;
}

/*-----------------------------------------------
		Sign Up
------------------------------------------------*/
function signupsubmission(pusername, ppassword){
	server.emit('signup', [ pusername, ppassword ]);
}

server.on('signup', function(res){
	if(res){
		
	} else {
		$('#signuperrors').append('* Username already taken, please select a different username!!');
	}
	
});

$('#signupsubmitbutton').click( function(){

	$('#signupusername').removeClass('error');
	$('#signuppassword').removeClass('error');
	$('#signuppasswordtest').removeClass('error');
	$('#signuperrors').empty();
	
	var tempuser = $('#signupusername').val();
	var temppword = $('#signuppassword').val();
	var temppword2 = $('#signuppasswordtest').val();
	
	if( tempuser.length == 0 ){
		$('#signupusername').addClass('error');
		$('#signuperrors').append('* Please enter a user name!!');
		return false;
	} else if( tempuser.length < 3){
		$('#signupusername').addClass('error');
		$('#signuperrors').append('* Username must be at least 3 characters!!');
		return false;
	} else if( temppword.length == 0){
		$('#signuppassword').addClass('error');
		$('#signuperrors').append('* Please enter a password!!');
		return false;
	} else if( temppword2.length == 0){
		$('#signuppasswordtest').addClass('error');
		$('#signuperrors').append('* Please verify your password!!');
		return false;
	} else if( temppword != temppword2 ){
		$('#signuppassword').addClass('error');
		$('#signuppasswordtest').addClass('error');
		$('#signuperrors').append('* Passwords do not match!!');
		return false;
	} else if(temppword.length < 5) {
		$('#signuppassword').addClass('error');
		$('#signuppasswordtest').addClass('error');
		$('#signuperrors').append('* Password must be at least 5 characters!!');
		return false;
	}
	
	
	signupsubmission(tempuser, temppword);
	
});

/*-----------------------------------------------
				Log In
------------------------------------------------*/
server.on('connectionerror', function(){
	alert('There was an error with the connection. The server may have been restarted. Please sign back in!');
});

function loginsubmission( lusername, lpassword ){
	server.emit('login', [ lusername, lpassword ]);
}


server.on('login', function(data){
	var res = data[0];
	var name = data[1];
	var errcode = data[2];
	var allmystats = data[3];
	
	if(res){
		$('#messagebox').empty();
		$('#login').hide();
		$('#signup').hide();
		$('#gamelobby').show();
		username = name;
		ostatus = true;
		server.emit('getdcstats');
		server.emit('getleaderboard');
		if( seconds < 180 ){
			alert('If you see this message the game timers are currently set to ' + seconds + " seconds for testing! Please come back in a bit or let me know in the chat if you wanna help me test! :D")
		}
		mynewstats = allmystats;
	} else {
		if( errcode == 'ALI' ){
			$('#loginerrors').append('* User already signed in!');
		} else {
			$('#loginerrors').append('* Invalid login information!!');
		}
	}
});

$('#loginbutton').click(function(){
	$('#loginusername').removeClass('error');
	$('#loginpassword').removeClass('error');
	$('#loginerrors').empty();
	
	var tempusername = $('#loginusername').val();
	var temppassword = $('#loginpassword').val();
	
	if( tempusername.length == 0 ){
		$('#loginusername').addClass('error');
		$('#loginerrors').append('* Please enter a username!!');
		return false;
	} else if( tempusername.length < 3){
		$('#loginusername').addClass('error');
		$('#loginerrors').append('* Invalid username!!');
		return false;
	} else if( temppassword.length == 0){
		$('#loginpassword').addClass('error');
		$('#loginerrors').append('* Please enter a password!!');
		return false;
	}  else if(temppassword.length < 5) {
		$('#loginpassword').addClass('error');
		$('#loginpasswordtest').addClass('error');
		$('#loginerrors').append('* Invalid password!!');
		return false;
	} else {
		loginsubmission(tempusername, temppassword);
	}
});



/*-----------------------------------------------
				Log Out
------------------------------------------------*/
$('#signout').click(function(){
	server.emit('logout', username);
	$('#userlisting').empty();
	$('#chatterlisting').empty();
	$('#roomwrapper').empty();
	ostatus = false;
	mainmenu();
});

/*-----------------------------------------------
				Daily Challenge
------------------------------------------------*/

$('.dcplay').click( function(){
	//server.emit('dcstart', {size: 4});
	if( $(this).attr('id') == 'dcplay3' ){
		server.emit('dcstart', {size: 3});
		//alert('not yet! almost though!')
	} else if( $(this).attr('id') == 'dcplay4' ){
		server.emit('dcstart', {size: 4});
	} else if( $(this).attr('id') == 'dcplay5' ){
		server.emit('dcstart', {size: 5});
		//alert('not yet! almost though!')
	}
});

server.on('dcstart', function(data){
	
	if( data.res ){
		if( data.board.length < 2 ){
			alert( 'Error getting daily puzzle!' );
		} else {
			newgame({type: 'dc', board: data.board, time: data.date, size: data.size});
		}
	} else {
		alert('Daily Puzzle already played from this account or location!');
	}
});

function getdcstats(){
	server.emit('getdcstats');
}
var dailystats = {};
server.on('getdcstats', function(data){
	dailystats = data;
	//console.log(data);
	for( var dckey in dailystats ){
		var statsarray = dailystats[dckey];
		var selector = '#dscinner' + dckey.substring(2);
		//console.log(statsarray);
		$(selector).empty();
		if( statsarray.length > 0 ){
		
			
			statsarray.sort(function(a, b) { 
				return b.s - a.s;
			})

			var num = 1;
			var pnum = 1;
			var xscore = 0;
			for(var i in statsarray){
				if( statsarray.hasOwnProperty(i) ){
					if( statsarray[i].s != xscore ){
						pnum = num;
					}
					num++;
					xscore = statsarray[i].s;
					$(selector).append('<div class="statwrap dclist_' + statsarray[i].u + '"><div class="dscnumber"><p>' + pnum + '</p></div><div class="dscname"><p>' + statsarray[i].u + '</p></div><div class="dscwords"><p>' + statsarray[i].n + '</p></div><div class="dscscore"><p>' + statsarray[i].s + '</p></div></div>');
				}
			}
		} else {
			$(selector).append('<div class="statwrap"><div class="dscnumber"><p>0</p></div><div class="dscname"><p>No Players Yet!</p></div><div class="dscwords"><p>--</p></div><div class="dscscore"><p>--</p></div></div>');
		}
	}
});

var pdailystats = {};

server.on( 'getpdcstats', function(data){
	pdailystats = data;

	for( var dckey in pdailystats ){
		var statsarray = pdailystats[dckey].stats;
		var selector = '#pdscinner' + dckey.substring(2);
		//console.log(statsarray);
		$(selector).empty();
		if( statsarray.length > 0 ){

			statsarray.sort(function(a, b) { 
				return b.s - a.s;
			})

			var num = 1;
			var pnum = 1;
			var xscore = 0;
			for(var i in statsarray){
				if( statsarray.hasOwnProperty(i) ){
					if( statsarray[i].s != xscore ){
						pnum = num;
					}
					num++;
					xscore = statsarray[i].s;
					$(selector).append('<div class="pdailystat statwrap pdclist' + dckey.substring(2) + '_' + statsarray[i].u + '"><div class="dscnumber"><p>' + pnum + '</p></div><div class="dscname"><p>' + statsarray[i].u + '</p></div><div class="dscwords"><p>' + statsarray[i].n + '</p></div><div class="dscscore"><p>' + statsarray[i].s + '</p></div></div>');
				}
			}
		} else {
			$(selector).append('<div class="statwrap"><div class="dscnumber"><p>0</p></div><div class="dscname"><p>No Players :(</p></div><div class="dscwords"><p>--</p></div><div class="dscscore"><p>--</p></div></div>');
		}
	}

	$('.pdailystat').click(function(){
		var n = $(this).children('.dscname').children('p')[0].innerHTML
		var o = $(this).parent().attr('id').substring(9, 10)
		view_daily_words(n, o);
	})
})

function getpdailyustats(n, o){
	for( i = 0; i < pdailystats['dc' + o].stats.length; i++ ){
		if( pdailystats['dc' + o].stats[i].u == n ) return pdailystats['dc' + o].stats[i];
	}
	return -1;
}

function view_daily_words(n, o){

	// $('.mb2cells').empty();
	// for( u = 0; u < board.length; u++ ){
	// 	var curmbcell = '.mb2_cell' + u;
	// 	$(curmbcell).append('<p>' + pdailystats['dc' + o].board[u] + '</p>');
	// }

	$('#pdnhead').empty().append(n);

	var mystat = "";
	var isme = false
	if( username ){
		var mystat = getpdailyustats(username.toUpperCase(), o);
		if( username.toUpperCase() == n ) isme = true;
	}
	var theystat = getpdailyustats(n, o);
	theystat.w.sort();

	var pstring = "";
	if( mystat != "" && mystat != -1 && !isme ){
		for( i = 0; i < theystat.w.length; i++ ){
			var foundit = false;
			for( j = 0; j < mystat.w.length; j++ ){
				if( theystat.w[i] == mystat.w[j] ){
					foundit = true;
				}
			}
			if( foundit ){
				if( i != theystat.w.length-1 ){
					pstring += '<span class="slash2">' + theystat.w[i] + '</span>, ';
				} else {
					pstring += '<span class="slash2">' + theystat.w[i] + '</span>';
				}
			} else {
				if( i != theystat.w.length-1 ){
					pstring += theystat.w[i] + ', ';
				} else {
					pstring += theystat.w[i];
				}
			}
		}
	} else {
		for( i = 0; i < theystat.w.length; i++ ){
			if( i != theystat.w.length-1 ){
				pstring += theystat.w[i] + ', ';
			} else {
				pstring += theystat.w[i];
			}
		}
	}

	$('#pdlist').empty().append(pstring);
	$('#pdailypopwrap').show();
}


function senddcstats(s, n, w, d, z){
	server.emit('senddcstats', [s,n,w,d,z]);
}




/*-----------------------------------------------
			Leaderboard stuff
------------------------------------------------*/
var lb = [];
server.on('getleaderboard', function(data){
	lb = data;
	buildleaderboard();
})

function buildleaderboard(){
	if(lb.length > 0){

		$('#lbcinner').empty();

		lb.sort(function(a, b) { 
			return b.p - a.p;
		})

		var ninc = 1;
		var nincp = 1;
		var pscore = 0;
		for(var i in lb){
			if( lb.hasOwnProperty(i) ){
				if( lb[i].p != -1 ){
					if( lb[i].p != pscore ){
						nincp = ninc;
					}
					ninc++
					pscore = lb[i].p;
					var gp = lb[i].w + lb[i].l;
					$('#lbcinner').append('<div class="lbbox lb_' + lb[i].n + '"><div class="lbnumber"><p>' + nincp + '</p></div><div class="lbname"><p>' + lb[i].n + '</p></div><div class="lbwinloss"><p>' + gp + '</p></div><div class="lbpoints"><p>' + lb[i].p + '</p></div></div>');
				} else {
					$('#lbcinner').append('<div class="lbbox lb_' + lb[i].n + '"><div class="lbnumber"><p>---</p></div><div class="lbname"><p>' + lb[i].n + '</p></div><div class="lbwinloss"><p>---</p></div><div class="lbpoints"><p>---</p></div></div>');
				}
			}
		}
		
	} else {
		$('#lbcinner').append('<div class="lbbox"><div class="lbnumber"><p>0</p></div><div class="lbname"><p>LB is broke.</p></div><div class="lbwinloss"><p>---</p></div><div class="lbpoints"><p>---</p></div></div>');
	}

	$('.lbbox').click(function(){
		var n = $(this).children('.lbname').children('p')[0].innerHTML;
		get_statistics(n);
	})
}

function get_statistics(n){
	server.emit('get_statistics', n);
}


var s_data;
server.on('get_statistics', function(data){
	s_data = data.stat;
	view_statistics(data.stat, data.name);
})

function view_statistics(d, n){
	$('#userstatstable').empty();
	$('#specs').empty();
	$('#myusername').empty().append(n)
	for( var key in d ){
		if( key != 'wordarchive' ){
			$('#userstatstable').append('<tr><td>' + key + '</td><td>' + d[key] + '</td></tr>');
		}
	}
	$('#leaderboard').hide();
	$('#viewstats').show();

	analyze_archive(d.wordarchive);
}


//yep. this is what it's like to be a boss.
function analyze_archive(arch){
	var sbox = $('#specs');
	var counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var finds = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var words = [ {w:[],n:0}, {w:[],n:0}, {w:[],n:0}, {w:[],n:0}, {w:[],n:0}, {w:[],n:0}, {w:[],n:0}, 
				  {w:[],n:0}, {w:[],n:0}, {w:[],n:0}, {w:[],n:0}, {w:[],n:0}, {w:[],n:0}, {w:[],n:0}, {w:[],n:0}, {w:[],n:0} ]
	var curnode = arch;
	var letterbreakdown = {
		'A': { let: 0, w: 0, uw: 0 },
		'B': { let: 0, w: 0, uw: 0 },
		'C': { let: 0, w: 0, uw: 0 },
		'D': { let: 0, w: 0, uw: 0 },
		'E': { let: 0, w: 0, uw: 0 },
		'F': { let: 0, w: 0, uw: 0 },
		'G': { let: 0, w: 0, uw: 0 },
		'H': { let: 0, w: 0, uw: 0 },
		'I': { let: 0, w: 0, uw: 0 },
		'J': { let: 0, w: 0, uw: 0 },
		'K': { let: 0, w: 0, uw: 0 },
		'L': { let: 0, w: 0, uw: 0 },
		'M': { let: 0, w: 0, uw: 0 },
		'N': { let: 0, w: 0, uw: 0 },
		'O': { let: 0, w: 0, uw: 0 },
		'P': { let: 0, w: 0, uw: 0 },
		'R': { let: 0, w: 0, uw: 0 },
		'S': { let: 0, w: 0, uw: 0 },
		'T': { let: 0, w: 0, uw: 0 },
		'U': { let: 0, w: 0, uw: 0 },
		'V': { let: 0, w: 0, uw: 0 },
		'W': { let: 0, w: 0, uw: 0 },
		'X': { let: 0, w: 0, uw: 0 },
		'Y': { let: 0, w: 0, uw: 0 },
		'Z': { let: 0, w: 0, uw: 0 }
	};

	function analyze( n, d, s ){
		
		if( n.words > 0 ){
			//sbox.append('<p>' + s + ': ' + n.words + '</p>');
			counts[d]++;
			finds[d] += n.words;
			if( n.words > words[d].n ){
				words[d].w = [s];
				words[d].n = n.words;
			} else if( n.words == words[d].n ){
				words[d].w.push(s);
				words[d].n = n.words;
			}

			for( j = 0; j < s.length; j++ ){ 
				letterbreakdown[s[j]].let += n.words; 
			}
			letterbreakdown[s[0]].w += n.words;
			letterbreakdown[s[0]].uw++;
		}

		for( var let in n.children ){
			var s2 = s + let;
			var d2 = d + 1;
			analyze(n.children[let], d2, s2);
		}
	}

	analyze( curnode, -1, '' );
	var utotal = 0;
	var total = 0;
	var tletters = 0;
	sbox.append('<h4>Unique words breakdown: </h4>')
	for(i = 0; i < counts.length; i++){
		if( counts[i] > 0 ){
			sbox.append('<p>' + (i+1) + '-letter words: ' + counts[i] + '</p>');
			utotal += counts[i];
		}
	}
	sbox.append('<p>Total unique words: ' + utotal + '</p>')
	

	sbox.append('<h4>Total words breakdown:</h4>')
	for(i = 0; i < finds.length; i++){
		if( counts[i] > 0 ){
			sbox.append('<p>' + (i+1) + '-letter words: ' + finds[i] + '</p>');
			total += finds[i];
			tletters += ((i+1) * finds[i])
		}
	}
	sbox.append('<p>Total words found: ' + total + '</p>')

	sbox.append('<h4>Most found word per length: </h4>')
	for(i = 0; i < words.length; i++){
		if( words[i].n > 0 ){
			sbox.append('<p>' + (i+1) + ' letters: ' + words[i].w.join(', ') + ', finds: ' + words[i].n + '</p>');
		}
	}

	sbox.append('<h4>Letter breakdown: </h4>')
	sbox.append('<h5># of total times used, # of words that start with, # of unique words found that start with, percent of dictionary found</h5>')
	for( var p in letterbreakdown){
		sbox.append('<p>' + p + ': \t' + letterbreakdown[p].let + ', \t' + letterbreakdown[p].w + ', \t' + letterbreakdown[p].uw + ',\t' + ((letterbreakdown[p].uw/giantwordthingy[p].length)*100).toString().substring(0, ((letterbreakdown[p].uw/giantwordthingy[p].length)*100).toString().indexOf('.') + 3 ) + '% </p>');
	}

	sbox.append('<h4>Other random stats</h4>')
	if( s_data ){
		sbox.append( "<p> Average words per game: " + (s_data.totalwords/s_data.gamesplayed).toString().substring(0, (s_data.totalwords/s_data.gamesplayed).toString().indexOf('.') + 3 ) + '</p>')
		sbox.append( "<p> Average words scored per game: " + (s_data.acceptedwords/s_data.gamesplayed).toString().substring(0, (s_data.acceptedwords/s_data.gamesplayed).toString().indexOf('.') + 3 ) + '</p>')
		sbox.append( "<p> Average points per game: " + (s_data.totalpoints/s_data.gamesplayed).toString().substring(0, (s_data.totalpoints/s_data.gamesplayed).toString().indexOf('.') + 3 ) + '</p>' )
		sbox.append( "<p> Average points per word: " + (s_data.totalwords/s_data.totalpoints).toString().substring(0, (s_data.totalwords/s_data.totalpoints).toString().indexOf('.') + 3 ) + '</p>' )
		sbox.append( "<p> Average time per word: " + ((s_data.gamesplayed * 180)/s_data.totalwords).toString().substring(0, ((s_data.gamesplayed * 180)/s_data.totalwords).toString().indexOf('.') + 3 ) + ' seconds</p>' )
		sbox.append( '<p> Percentage of dictionary found: ' + ((utotal/178691)*100).toString().substring(0, ((utotal/178691)*100).toString().indexOf('.') + 3 ) + '%</p>' )
		sbox.append( '<p> Total letters used: ' + tletters + '</p>' );
	}
	
	

}


var newlbstats = [];
server.on('lbupdate', function(data){
	newlbstats = data;

	if(newlbstats.length > 0){
		for( k = 0; k < newlbstats.length; k++ ){
			for( j = 0; j < lb.length; j++ ){
				var newname = newlbstats[k].n;
				if( newname.toUpperCase() == lb[j].n ){
					lb[j] = newlbstats[k];
					break;
				}
			}
		}
		
		buildleaderboard();
	} else {
		console.log('No data to insert into Leaderboard');
	}
});


//get all possible words
server.on('getallwords', function(w){
	testlist = w.list;

	if( w.type == 'sp'){
		testlist.sort();
		for( g = 0; g < testlist.length; g++ ){
			if( $.inArray(testlist[g], words) != -1 ){
				testlist[g] = '<span>' + testlist[g] + '</span>';
			}
		}

		$('#fullwordlist').empty().append(testlist.join(', '));
		$('#fullwordlistpopwrap').show();
	} else if( w.type == 'mp'){
		$('#fullwordlist').empty();
		//the colors duke, the colors
		var mstat = lastmpresult.stats;
		
		var colorwheel = ['#1296FD', '#0c830c', '#ff7a00', '#A51717', '#4F43E0'] //blue,green,orange,red,purple

		var tinc = 0;
		var pcolors = {};
		for( t = 0; t < mstat.length; t++ ){
			if( mstat[t].user == username ){
				pcolors[username] = {};
				pcolors[username].c= '#3F3F3F';
				$('#fullwordlist').append('<p style="color: #fff; background-color: #3f3f3f">' + username + '</p>')
			} else {
				pcolors[mstat[t].user] = {};
				pcolors[mstat[t].user].c = colorwheel[tinc];
				$('#fullwordlist').append('<p style="color: #fff; background-color: ' + colorwheel[tinc] + '">' + mstat[t].user + '</p>')
				tinc++;
			}
		}

		testlist.sort();
		for( g = 0; g < testlist.length; g++ ){
			var wdex = [];
			for( h = 0; h < mstat.length; h++ ){
				if( $.inArray(testlist[g], mstat[h].words) != -1 ){
					wdex.push(h);
				}
			}

			if( wdex.length > 1 ){
				testlist[g] = '<span class="slash" style="color: #800003; background-color: #fff">' + testlist[g] + '</span>';
			} else if( wdex.length == 1 ){
				var nombre = mstat[wdex[0]].user;
				testlist[g] = '<span style="color: #fff; background-color: ' + pcolors[nombre].c + '">' + testlist[g] + '</span>'; 
			}
		}

		$('#fullwordlist').append(testlist.join(', '));
		$('#fullwordlistpopwrap').show();
	}
	
});

function gow(l, t){
	server.emit('getallwords', {list: l, type:t});
}



function gmpc(){
	server.emit('getmpcache');
}

var fullmpcache;
server.on('getmpcache', function(b){
	fullmpcache = b;
})



// var autostart_timer;
// var autostart_inc;
// server.on('auto_timer', function(){
// 	autostart_inc = 30;
// 	$('#mp_autostart_timer span').empty().append('30');
// 	$('#mp_autostart_timer').show();
// 	autostart_timer = setInterval(function(){
// 		if( !autostart_inc ){
// 			clearInterval(autostart_timer);
// 		} else {
// 			autostart_inc--;
// 			$('#mp_autostart_timer span').empty().append(autostart_inc);
// 		}
// 	}, 1000);
// })

// server.on('auto_timer_stop', function(){
// 	clearInterval(autostart_timer);
// 	$('#mp_autostart_timer').hide();
// })






// //// testing the fucking thing


// var xlist = [];
// var ylist = [];
// var indexes = [];
// var dupelist = [];
// var xnames = [];
// var ynames = [];
// var statscomplete = false;


// //find which wordlist has the first word alphabetically
// function abcfinder(){
// 	var abcdex = 0; //start on 0

// 	for( x = 1; x < xlist.length; x++ ){
// 		if( xlist[x][indexes[x]] < xlist[abcdex][indexes[abcdex]] ){
// 			abcdex = x;
// 		}
// 	}
// 	return abcdex;
// }


// //REMOVE ALL DUPE WORDS
// function checkdupe(){

// 	//keep going until only 1 word list left on stack
// 	while( xlist.length > 1 ){

// 		//if there is a duplicate word
// 		var dupes = false;

// 		// index of array with first word alphabetically
// 		var inum = abcfinder();

// 		// next word not checked for dupes alphabetically
// 		var dword = xlist[inum][indexes[inum]];

// 		//check other current words against next word
// 		for( i = 0; i < xlist.length; i++ ){
// 			if( i != inum){

// 				//if words match they are dupes
// 				if( xlist[i][indexes[i]] == dword ){

// 					//if it's a duplicate remove it from list
// 					xlist[i].splice(indexes[i], 1);
// 					dupes = true;
// 				}
// 			}
// 		}


// 		if( dupes ){
// 			// if there's dupes splice word out of current list too then add to dupe list
// 			xlist[inum].splice(indexes[inum],1);
// 			dupelist.push( dword );
// 		} else {
// 			//if not a dupe move on to next index for current array
// 			indexes[inum]++;
// 		}

		
// 		for( i = 0; i < xlist.length; i++ ){
// 			if( indexes[i] >= xlist[i].length ){
// 				ylist.push(xlist[i]);
// 				xlist.splice(i,1)
// 				indexes.splice(i, 1); 
// 				ynames.push(xnames[i]);
// 				xnames.splice(i, 1);
// 				i--;
// 			}
// 		}
// 	}

// 	ylist.push(xlist[0]);
// 	xlist.splice(0,1);
// 	ynames.push(xnames[0]);
// 	xnames.splice(i, 1);
	
// }

// // FUNCTION TO RUN STAT COMPUTATION
// function computestats(g){
// 	var tempgame = getroom(g);

// 	//reset all arrays for repopulation
// 	xlist = [];
// 	ylist = [];
// 	indexes = [];
// 	dupelist = [];
// 	xnames = [];
// 	ynames = [];

// 	xlist = [];

// 	// loop through game stats
// 	for( n = 0; n < tempgame.stats.length; n++ ){
// 		//console.log( tempgame.stats[n].words);

// 		//SORT LIST FROM A-Z
// 		xlist.push(tempgame.stats[n].words.slice(0).sort());

// 		//PUSH A ZERO ONTO INDEXES
// 		//ALLOWS LOOP THROUGH EACH INDIVIDUAL WORD LIST
// 		indexes.push(0);

// 		//PUSH NAME ASSOCIATED WITH EACH LIST
// 		xnames.push(tempgame.stats[n].user)

// 	}
	
// 	//RECURSIVE SOLVING FUNCTION
// 	checkdupe();
// }




