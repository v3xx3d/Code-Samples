//var sound1 = document.getElementById('audio1'); 
//sound1.play();

// var onEnded = function() {
// 	sound1.load();
//     sound1.play();
// };

// sound1.addEventListener('ended', onEnded, false);

var wmessage = "";
var encoding = false;
var giantwordthingy = {};

//// LOAD EVERYTHING
$(document).ready( function(){
		
	var increment = 0;
	
	function populate(){
		if( increment == 26 ){
			curlist = [];
			$('#loadingprogress').css('width', 300);
			mainmenu();
			setaspect();
			if( wmessage != '' ){
				alert(wmessage);
			}
			return;
		}
		var url = '/somanywords/dict/' + wordlist + '/list' + increment + '.js';
		$.getScript(url, function(){
			giantwordthingy[curlist[0][0]] = curlist;	
			var tempprogress = Math.round((((increment+1)/26)*100)) + '%';
			$('#loadingprogress').css('width', tempprogress);
			increment++;
			populate();
		});
	}
	populate();
	
});

Array.prototype.binsearch = function(s){
	var startIndex  = 0,
        stopIndex = this.length - 1,
        middle = Math.floor((stopIndex + startIndex)/2);

    while(this[middle] != s && startIndex < stopIndex){

        //adjust search area
        if (s < this[middle]){
            stopIndex = middle - 1;
        } else if (s > this[middle]){
            startIndex = middle + 1;
        }

        //recalculate middle
        middle = Math.floor((stopIndex + startIndex)/2);
    }

    //make sure it's the right value
    return (this[middle] != s) ? -1 : middle;
}

function mainmenu(){
	$('#gameexit').hide();
	$('#loading').hide();
	$('#gameboard').hide();
	$('#apptut').hide();
	$('#tempchat').hide();
	$('#gamelobby').hide();
	$('#signup').hide();
	$('#login').hide()
	$('#mplobby').hide();
	$('#userlistwrap').hide();
	$('#dclobby').hide();
	$('#dcfinishwrap').hide();
	$('#spresults').hide();
	$('#menu').show();
}

$('#play').click( function(){
	newgame({type: 'sp'});
});

$('#nativetut').click( function(){
	$('#menu').hide();
	$('#apptut').show();
});

$('.exit').click( function(){
	mainmenu();
});

$('#chatbutton').click( function(){
	$('#menu').hide();
	$('#login').show();
});

$('#signupbutton').click( function(){
	$('#signup').show();
	$('#login').hide();
});

$('#submitmessage').keydown( function(e){
	if( e.keyCode == 13 ){
		$('#chatsubmit').click();
	}
});

$('#loginpassword').keydown( function(e){
	if( e.keyCode == 13 ){
		$('#loginbutton').click();
	}
});

$('.viewusers').click( function(){
	$('#userlistwrap').show();
});

$('#userlistwrap, #userlistexit').click( function(){
	$('#userlistwrap').hide();
});

$('#userlist').click( function(e){
	e.stopPropagation();
});

$('#backtoindex, #backtoindex2').click( function(){
	mainmenu();
});

$('#backtosignup').click( function(){
	$('#signup').hide();
	$('#login').show();
});

$('#dcgameexit').click( function(){
	$('#gameboard').hide();
	$('#dclobby').show();
	stopgame();
});

$('#gameexit').click( function(){
	mainmenu();
	stopgame();
});

$('#dailybutton').click( function(){
	$('#gamelobby').hide();
	$('#dclobby').show();
});

$('#dcexit').click( function(){
	$('#dclobby').hide();
	$('#gamelobby').show();
});

$('.refreshstats').click( function(){
	//cleardcstats();
	getdcstats();
});

$('#dcfinishwrap, #dcfinishexit').click( function(){
	$('#dcfinishwrap').hide();
	scrolltome();
});

function cleardcstats(){
	$('#dscinner4').empty();
	$('#dscinner3').empty();
	$('#dscinner5').empty();
};

$('.findmedc').click( function(){
	scrolltome();
});

$('#findmelb').click( function(){
	scrolltome2();
});

function scrolltome(){
	var tempn = username.toUpperCase();
	var selector = '.dclist_' + tempn;
	if( $(selector).length > 0 ){
		$(selector).addClass('me');
		$('#dscinner').scrollTo( $(selector), 500 );
	}
}

function scrolltome2(){
	var tempn = username.toUpperCase();
	var selector = '.lb_' + tempn;
	if( $(selector).length > 0 ){
		$(selector).addClass('me');
		$('#lbcinner').scrollTo( $(selector), 500 );
	}
}

$('#mplobbyexit').click(function(){
	leavempgame();
	$('#mplobby').hide();
	$('#gamelobby').show();
	clearInterval(autostart_timer);
});

function clearmplobby(){
	$('#mplobbystatus').empty().append('Waiting for players....');
	$('#mpreadyplayers').empty();
	$('#mplobbyexit').show();
	$('#mplobbystart').hide();
}

$('#mpgameexit').click( function(){
	ingame = false;
	clearInterval(gametimer);
	locked = true;
	leavempgame();
	$('#gameboard').hide();
	$('#gamelobby').show();
});

function forcesignout(){
	mainmenu();
}

$('.mpresultsexit').click( function(){
	wordlisttest = false;
	$('#mpresults').hide();
	$('#gamelobby').show();
});

$('#viewstatsopen').click( function(){
	get_statistics(username.toUpperCase());
});

$('#viewstatsexit').click( function(){
	$('#viewstats').hide();
	$('#leaderboard').show();
});

$('#notifyboxenlarge').click( function(){
	console.log($('#notificationbox').css('height'));
	if( $('#notificationbox').css('height') != '98px' ){
		$('#notificationbox').css('background-color', 'rgba(0,0,0,0.5)')
		$('#notificationbox').animate({
			height: '100px'
		}, 500);
	} else {
		$('#notificationbox').css('background-color', 'rgba(0,0,0,0.8)')
		$('#notificationbox').animate({
			height: $('#gamewrap').css('height')
		}, 500);
	}
})

$('#lbpop').click( function(){
	$('#gamelobby').hide();
	$('#leaderboard').show();
})

$('#lbexit').click( function(){
	$('#leaderboard').hide();
	$('#gamelobby').show();
})

var buttontimeout = false;
function buttonpause(){
	buttontimeout = true;
	setTimeout(function(){
		buttontimeout = false;
	}, 500);
}

var wordlisttest = false;
$('#spallwords, #mpallwords').click(function(){
	if( wordlisttest ){
		$('#fullwordlistpopwrap').show();
	} else {
		wordlisttest = true;
		if( $(this).attr('id') == 'spallwords' ){
			gow(board, 'sp');
		} else if( $(this).attr('id') == 'mpallwords' ){
			gow(board, 'mp');
		}
		
	}
	
})

$('#fullwordlistpopwrap, #fullwordlistexit').click(function(){
	$('#fullwordlistpopwrap').hide();
})

$('#fullwordlist').click( function(e){
	e.stopPropagation();
});

$('#spresultsexit').click( function(){
	mainmenu();
	wordlisttest = false;
});

$('.dctabselect').click( function(){
	$('.dctabselect').removeClass('redborder');
	if( $('#pdctabswitchy').hasClass('redborder') ){
		if( $(this).attr('id') == 'dctabswitch3' ){
			$(this).addClass('redborder');
			$('.dctabs').hide();
			$('#pdctab4').hide();
			$('#pdctab5').hide();
			$('#pdctab3').show();
		} else if( $(this).attr('id') == 'dctabswitch4' ){
			$(this).addClass('redborder');
			$('#pdctab3').hide();
			$('#pdctab5').hide();
			$('#pdctab4').show();
		} else if( $(this).attr('id') == 'dctabswitch5' ){
			$(this).addClass('redborder');
			$('#pdctab3').hide();
			$('#pdctab4').hide();
			$('#pdctab5').show();
		}
	} else if( $('#pdctabswitcht').hasClass('redborder') ){
		if( $(this).attr('id') == 'dctabswitch3' ){
			$(this).addClass('redborder');
			$('.pdctabs').hide();
			$('#dctab4').hide();
			$('#dctab5').hide();
			$('#dctab3').show();
		} else if( $(this).attr('id') == 'dctabswitch4' ){
			$(this).addClass('redborder');
			$('#dctab3').hide();
			$('#dctab5').hide();
			$('#dctab4').show();
		} else if( $(this).attr('id') == 'dctabswitch5' ){
			$(this).addClass('redborder');
			$('#dctab3').hide();
			$('#dctab4').hide();
			$('#dctab5').show();
		}
	}
	
})

$('.pdctabselect').click( function(){
	$('.pdctabselect').removeClass('redborder');
	if( $(this).attr('id') == 'pdctabswitchy' ){
		$(this).addClass('redborder');
		$('.dctabs').hide();
		if( $('#dctabswitch3').hasClass('redborder') ){
			$('#pdctab4').hide();
			$('#pdctab5').hide();
			$('#pdctab3').show();
		} else if( $('#dctabswitch4').hasClass('redborder') ){
			$('#pdctab5').hide();
			$('#pdctab3').hide();
			$('#pdctab4').show();
		} else if( $('#dctabswitch5').hasClass('redborder') ){
			$('#pdctab4').hide();
			$('#pdctab3').hide();
			$('#pdctab5').show();
		}
	} else if( $(this).attr('id') == 'pdctabswitcht' ){
		$(this).addClass('redborder');
		$('.pdctabs').hide();
		if( $('#dctabswitch3').hasClass('redborder') ){
			$('#dctab4').hide();
			$('#dctab5').hide();
			$('#dctab3').show();
		} else if( $('#dctabswitch4').hasClass('redborder') ){
			$('#dctab5').hide();
			$('#dctab3').hide();
			$('#dctab4').show();
		} else if( $('#dctabswitch5').hasClass('redborder') ){
			$('#dctab4').hide();
			$('#dctab3').hide();
			$('#dctab5').show();
		}
	}
})

$('.dschide').click( function(){
	$(this).hide();
})


$('#pdailypopwrap, #pdailypopexit').click(function(){
	$('#pdailypopwrap').hide();
})

$('#pdailypop').click( function(e){
	e.stopPropagation();
});

