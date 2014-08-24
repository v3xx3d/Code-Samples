$(document).ready(function(){
	buildandanimate();
});

$(window).resize(function() {
	$('#everything').empty();
	buildandanimate();
});

function buildandanimate(){
	$columnwidth = Math.round( $(document).width() / 20 );

	var startscore = 2000;
	var howmanystars = 0;
	var randomnumber = 0;
	var randomnumbers = [];
	var winners = [];
	
	//make our randy numbers
	for( x = 0; x < howmanystars; x++ ){
	//pick one for a suprise ^.^
		randomnumbers.push( Math.floor( Math.random() * 200 ) );
	}
	
	//figure out where our stars will go
	for( i = 0; i < randomnumbers.length; i++){
		if( randomnumbers[i] < 10 ){
			winners.push( '#row0' + randomnumbers[i] );
		} else {
			winners.push( '#row' + randomnumbers[i] );
		}
	}
	
	var score = startscore;
	
	if( ($columnwidth % 2) ){
		$columnwidth = $columnwidth - 1;
	}
	
	$columnheight = 10 * $columnwidth;
	
	$boxcounter = 1;
	
	for( i = 0; i < 20; i++){
		// build a column
		$('#everything').append('<div id="column' + i + '" class="columns"></div>');
		$currentcol = '#column' + i;
		$($currentcol).css( 'width', $columnwidth );
		$($currentcol).css( 'height', $columnheight );
		$($currentcol).css( 'left', $columnwidth * i );
		
		//fill it with rows
		for( j = 0; j < 10; j++){
			$($currentcol).append('<div id="row' + i + j + '" class="rows"></div>');
			$currentrow = '#row' + i + j;
			$($currentrow).css('width', $columnwidth );
			$($currentrow).css('height', $columnwidth );
			$($currentrow).css('top', $columnwidth * j );
			
			
			//randomize the background images
			randomnumber = Math.floor(Math.random()*4);
			
			switch(randomnumber){
				case 0:
					$($currentrow).addClass('redbg');
					break;
				case 1:
					$($currentrow).addClass('yellowbg');
					break;
				case 2:
					$($currentrow).addClass('bluebg');
					break;
				case 3:
					$($currentrow).addClass('greenbg');
					break;
				default:
					alert('broke it');
			}
			
			//add a box into each row.
			$($currentrow).append('<div id="box' + $boxcounter + '" class="box"></div>');
			$currentbox = '#box' + $boxcounter;
			$($currentbox).css('width', $columnwidth );
			$($currentbox).css('height', $columnwidth );
			$boxcounter = $boxcounter + 1;
		}
	}
	
	//make background pic same size as box
	$('.rows').css( 'background-size', $columnwidth );
	
	//grab width of boxes and calculate position of inner box.... VERY BUGGY NEEDS WORK
	$beforewidth = $('#box1').width();
	$afterwidth = $beforewidth - $beforewidth * .5;
	$displace = ($beforewidth - $afterwidth) / 2;
	
	
	//add our star to the winner;
	for( k = 0; k < winners.length; k++){
		$winner = winners[k];
		$($winner).prepend('<img src="img/star.png" alt="winner" width="' + $columnwidth + '" height="' + $columnwidth + '"/>');
		$($winner).addClass('winner');
	}
	
	//add hover animation
	$('.box').hover( function(){
		$(this).stop();
		$(this).animate({
			width: $afterwidth + 'px',
			height: $afterwidth + 'px',
			top: $displace + 'px',
			left: $displace + 'px'
		}, 2 );
	});
	
	//make the box go back to original specs
	$('.box').mouseout( function(){
		$(this).stop();
		$(this).animate({
			width: $beforewidth + 'px',
			height: $beforewidth + 'px',
			top: '0px',
			left: '0px'
		}, 1000 );
	});
	
	//hide or unhide boxes on click to show background
	$('.rows').click(function(){
		$(this).children('.box').toggle();
		if( $(this).hasClass('winner') ){
			alert('CONGRATULATIONS!!!! YOU WON WITH A FINAL SCORE OF: ' + score);
			$('#everything').empty();
			buildandanimate();
			score = startscore;
		} else {
			score = score -5;
		}
	});
}