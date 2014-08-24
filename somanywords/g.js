var devmode = false;
//var wordlist = 'testlist';
var wordlist = 'fullwordlist';

var gametype = 'sp';

var board = [];
var cells = 16;
var allthetexts = '';
var alltheindexes = [];
var words = [];
var masterlist;
var selected = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
var score = 0;
var wordcount = 0;
var last = '';
var first = '';
var ingame = false;
var datestamp = '';
var gid = '';

var seconds = 180;
var timeleft = 0;
var gametimer;
var locked = true;

var hoverclass = 'unselected';

var size = 4;
var minwordlength = 3;


function isadjacent(index, li){

	var last_index = li || last;

	var xd = last_index%size;
	var differ = Math.abs(last_index-index);

	if( last_index == index ) return true;

	//aligned on the right of the board
	if( xd == size-1 ){

		if( index == last_index-size+1 || index == last_index+size+1 || index == last_index+1 ){
			return false;
		} else {
			if( differ == size + 1 || differ == size || differ == size -1 || differ == 1){
				return true;
			} else return false;
		}

	//aligned to the left
	} else if( xd == 0 ){

		if( index == last_index-size-1 || index == last_index+size-1 || index == last_index-1 ){
			return false;
		} else {
			if( differ == size + 1 || differ == size || differ == size -1 || differ == 1){
				return true;
			} else return false;
		}

	//middle
	} else {
		if( differ == size + 1 || differ == size || differ == size -1 || differ == 1){
			return true;
		} else return false;
	}
}
 
 
//all the games played here :D
function newgame(g){
	board = [];
	words = [];
	score = 0;
	wordcount = 0;
	ingame = true;
	cleartext();

	size = g.size || 4;

	if( g.size == 5 ){
		minwordlength = 4;
	} else minwordlength = 3

	$('.score').empty().append( 'Score: 0' );
	$('.wordcount').empty().append( 'Words: 0' );
	$('.timer').empty().append( formattime(seconds) );
	$('.timer').removeClass('timealmostup');
	
	if( g.type == 'sp' ){
	
		// SINGLE PLAYER GAME
		gametype = 'sp';
		board = generatenewboard();
		$('#gameexit').show();
		$('#dcgameexit').hide();
		$('#mpgameexit').hide(); 
		
	} else if( g.type == 'dc' ){
	
		// DAILY PUZZLE
		datestamp = g.time;
		gametype = 'dc';
		board = g.board;
		$('#gameexit').hide();
		$('#dcgameexit').show();
		$('#mpgameexit').hide();
		
	} else if( g.type == 'mp' ){
	
		// MULTIPLAYER
		gametype = 'mp';
		board = g.board;
		gid = g.gameid;
		$('#gameexit').hide();
		$('#dcgameexit').hide();
		$('#mpgameexit').show();
		
	}

	var letteri = 0;
	$('#gametable').empty();
	for( u = 0; u < size; u++ ){
		$('#gametable').append('<tr></tr>');
		var select = u+1;
		for( v = 0; v < size; v++ ){
			$('#gametable tr:nth-child(' + select + ')').append('<td><div class="letterblock unselected" id="cell' + letteri + '"><div class="slidebox"></div></div></td>')
			letteri++;
		}
	}
	

	//fill board with letters adjusting background images properly
	var curcell;
	var curblock;
	var cuwidth = $('.letterblock').width() * -1;
	for( x = 0; x < board.length; x++ ){
		curblock = '#cell' + x;
		var charcode = board[x].charCodeAt(0) - 65;
		$(curblock).css('background-position-x', charcode * cuwidth)
		$(curblock).css('background-size', 26 * cuwidth * -1);
	}
	
	
	if( g.type == 'sp' ){
		$('#menu').hide();
	}else if( g.type == 'dc' ){
		$('#dclobby').hide();
	}else if( g.type == 'mp' ){
		$('#mplobby').hide();
	}
	
	if( g.size == 3 ){
		timeleft = 90;
	} else timeleft = seconds;

	$('.timer').empty().append( formattime( timeleft ) );
	$('#gameboard').show();
	setaspect();
	locked = false;
	gametimer = setInterval('gtimer()', 1000);
}

function generatenewboard(){

	var genboard = [];
	var cells = size*size;
	
	var die;
	var sideofdie;

	//// create main board and fill with 0's
	for( g = 0; g < cells; g++){
		genboard[g] = false;
	}

	//// create and fill test array with 0's
	//// this is to keep track of which dice have been rolled
	// var test = [];
	// for( r = 0; r < 25; r++){
	// 	test[r] = false;
	// }
	
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

function getindex( boxclicked ){

	switch(boxclicked){
		case 'cell0':
			return 0;
		case 'cell1':
			return 1;
		case 'cell2':
			return 2;
		case 'cell3':
			return 3;
		case 'cell4':
			return 4;
		case 'cell5':
			return 5;
		case 'cell6':
			return 6;
		case 'cell7':
			return 7;
		case 'cell8':
			return 8;
		case 'cell9':
			return 9;
		case 'cell10':
			return 10;
		case 'cell11':
			return 11;
		case 'cell12':
			return 12;
		case 'cell13':
			return 13;
		case 'cell14':
			return 14;
		case 'cell15':
			return 15;
		case 'cell16':
			return 16;
		case 'cell17':
			return 17;
		case 'cell18':
			return 18;
		case 'cell19':
			return 19;
		case 'cell20':
			return 20;
		case 'cell21':
			return 21;
		case 'cell22':
			return 22;
		case 'cell23':
			return 23;
		case 'cell24':
			return 24;
		default:
			alert('you broke it');
	}
}

function submitword(){
	if($.inArray(allthetexts, words) == -1){
		if(giantwordthingy[allthetexts[0]].binsearch(allthetexts) != -1){
			
			words.push(allthetexts);
			
			var wordscore = 0;
			
			if(allthetexts.length < 5){
				wordscore = 1;
			} else if(allthetexts.length == 5){
				wordscore = 2;
			} else if(allthetexts.length == 6){
				wordscore = 3;
			} else if(allthetexts.length == 7){
				wordscore = 5;
			} else if(allthetexts.length == 8){
				wordscore = 11;
			} else if(allthetexts.length == 9){
				wordscore = 11;
			} else if(allthetexts.length == 10){
				wordscore = 11;
			} else if(allthetexts.length > 10){
				wordscore = 11;
			}
			
			score += wordscore;
			wordcount += 1;
			$('.wordcount').empty().append( 'Words: ' + wordcount  );
			$('.score').empty().append( 'Score: ' + score );
			//s_sound1.play();
		}
		else{
			
		}
	} else { 

	}
   
   cleartext();
}

var selectedcells = [];
var touchmovestarted = false;
var touchstartedx = 0;
var touchstartedy = 0;
var touchmarginoferror = 40;
var touchgap = false;

//HANDLE CLICK EVENTS
if( "ontouchstart" in document.documentElement ){
	//hoverclass = 'nope';
	$('.letterblock').removeClass('unselected').addClass('hoverclass');
	document.body.addEventListener('touchmove', function(event) {
		event.preventDefault();
	}, false); 

	//if mobile device and box requires scrolling.
	$('.scrollpls').bind('touchmove', function(e) {
		if( $(this)[0].scrollHeight > $(this)[0].offsetHeight ){
			// if( username == "Ant" ){
			// 	alert( 'scroll height: ' + $(this)[0].scrollHeight + ' height: ' + $(this)[0].offsetHeight );
			// }
			
			e.stopPropagation();
		}
	});

	//alert('mobile device');
	$('.letterblock').live('touchstart', function(event) {
		letterclick($(this).attr('id'));
		selectedcells.push($(this).attr('id'))
	});

	window.addEventListener('touchmove', function(e){
		if( touchgap ){
			if( Math.abs(touchstartedx - e.pageX) > touchmarginoferror || Math.abs(touchstartedy - e.pageY) > touchmarginoferror){
				touchmovestarted = true;
				var blah = document.elementFromPoint(e.pageX, e.pageY);
				if( $(blah).hasClass('slidebox')){
					if( $.inArray($(blah).parent().attr('id'), selectedcells) == -1 ){
						selectedcells.push($(blah).attr('id'))
						$(blah).parent().trigger('touchstart');
					}
				}
			}
		} else {
			touchstartedx = e.pageX;
			touchstartedy = e.pageY;
			touchgap = true;
		}
	})

	window.addEventListener('touchend', function(){
		if( touchmovestarted == true ){
			var last = '#' + selectedcells[selectedcells.length-1];
			$(last).trigger('touchstart');
			selectedcells = [];
			touchmovestarted = false;
		}
		touchgap = false;
	})

} else {
	//alert('not a touchscreen device');
	var keyslist = [];
	
	$('#curword').keydown(function (e) { 
		e.preventDefault();
		keystrokes(e.keyCode);
	});
	
	$('.letterblock').live('mousedown', function(){
		letterclick($(this).attr('id'));
	});
}


/* mouse and tap functions */
function letterclick(id){

	if( !locked ){
		/*soundManager.sounds.s_select.play();*/
		var m = getindex(id);
			
		if( allthetexts.length == 0 ){
			last = m;
			first = alltheindexes[0];
		} else {
			last = alltheindexes[ alltheindexes.length - 1 ];
			first = alltheindexes[0];
		}
		
		
		/* if letter not already selected and adjacent to previous letter */
		if(!selected[m] && isadjacent(m)){
			selected[m] = true;
			allthetexts += board[m];
			last = m;
			alltheindexes.push(m);
			var tempstring3 = '#cell' + m;
			$(tempstring3).removeClass(hoverclass).addClass('selected');
			$('#curword').attr('value', allthetexts);
		
		/* if letter is already selected and the first letter of current word */
		} else if( selected[m] && m == first){
			cleartext();
			
		/* if letter was the last letter selected, is longer than 3 characters and ready to be submitted */
		} else if( selected[m] && m == last && allthetexts.length >= minwordlength){
			submitword();
		
		/* if selecting an inner letter, roll back the list */
		} else if ( selected[m] && m != last && m != first){
			var mindex = $.inArray(m, alltheindexes)
			subtract( alltheindexes[ mindex + 1 ] );
		}
	}
	
}

function cleartext(){
	allthetexts = "";
	alltheindexes = [];
	$('#curword').attr('value', '');
	for( l = 0; l < size*size; l++){
		var tempstring = '#cell' + l;
		$(tempstring).removeClass('selected').addClass(hoverclass);
		selected[l] = false;
	}
	first = '';
	last = '';
}

function subtract(index){
	var tempindex;
	do{
		tempindex = alltheindexes[ alltheindexes.length - 1 ];
		var tempstring2 = '#cell' + tempindex;
		$(tempstring2).removeClass('selected').addClass(hoverclass);
		selected[tempindex] = false;
		alltheindexes.pop();
		allthetexts = allthetexts.substring(0, allthetexts.length-1);
	}while( tempindex != index )
	$('#curword').attr('value', allthetexts);
	last = index;
}

function gtimer(){
  timeleft -= 1;
  
  if (timeleft <= 0){
	 $('.timer').empty().append( formattime( timeleft ) );
	 
	 //see if user left the game early
	 if( ingame ){
		endgame();
	 }
     return;
  }
  
  if( timeleft == 10 ){
	$('.timer').addClass('timealmostup');
  }
  
  $('.timer').empty().append( formattime( timeleft ) );
}

function formattime(num){
	var minutes = 0;
       
	while(num > 59){
		num -= 60;
		minutes++;   
	}
 
	if( num < 10 ){
		return minutes + ":0" + num;
	}else{
		return minutes + ":" + num;
	}
}

function stopgame(){
	clearInterval(gametimer);
	locked = true;
}

function endgame(){
	stopgame();

	
	if( gametype == 'sp' ){
		$('#spwordcount').empty().append(wordcount);
		$('#spscore').empty().append(score);
		$('#spwordlistscroll').empty().append('<p>' + words.join(', ') + '</p>');

		fillminiboard();

		$('#gameboard').hide();
		$('#spresults').show();
	} else if( gametype == 'mp' ){
		$('#gameboard').hide();
		clearmpresults();
		$('#mpresults').show();
		finishmpgame(score, words, gid);
		fillminiboard();
	} else if( gametype == 'dc' ){
		$('#dcfscore').empty().append( 'Score: ' + score);
		$('#dcfwords').empty().append( 'Wordcount: ' + wordcount);
		$('#dcfinishwrap').show();
		$('#gameboard').hide();
		$('#dclobby').show();
		senddcstats(score, wordcount, words, datestamp, size);
		
		setTimeout( 'getdcstats()', 1000);
	}
	
	//board = [];
	//words = [];
	score = 0;
	wordcount = 0;
	datestamp = '';
	cleartext();
}


function fillminiboard(){
	//fill in our miniboard with current board letters.
	$('.mbcells').empty();
	for( u = 0; u < board.length; u++ ){
		var curmbcell = '.mb_cell' + u;
		$(curmbcell).append('<p>' + board[u] + '</p>');
	}
}

function clearmpresults(){
	//clear editable areas
	$('#mpresultssummary').empty();
	$('#mpresultstabs').empty();
	$('#mptop_tabs').empty();

	//hide tab areas
	$('#mptop_tabs').hide();
	$('#mpresultstabs').empty();

	//show home areas
	$('#mpresultshome').show();
	$('#mptop_home').show();

	$('#waitingforplayersstatus').empty().append('waiting for players to finish...');
	$('#waitingforplayers').show();

}
