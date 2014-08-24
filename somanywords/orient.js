var mobile = false;

function setaspect(){

	var width = $('#bodywrap').width();
	var height = $('#bodywrap').height(); 
	
	if( width < 500 ){
		mobile = true;
		
		$('#gamewrap').css({
			'width': '100%',
			'height': '100%',
			'margin-left': '0px',
			'margin-top': '0px',
			'top': '0px',
			'left': '0px'
		});
		
		//$('.letterblock').css('font-size', Math.round($('.letterblock').height()/3));
		
		$('#game h1').css('font-size', 25);
		
		$('#statsoverlay').css({
			'top': '23px'
		});
		
		$('#timeleft').hide();
		$('#timeleftmobile').show();
		
		$('#statsoverlay').hide();
		$('#statsoverlaymobile').show();

		$('#resultslogo').css({
			'height': '30px',
			'margin-top': '45px'
		})
		
	} else {
		mobile = false;
		
		$('#gamewrap').css({
			'width': '400px',
			'height': '600px',
			'margin-left': '-200px',
			'margin-top': '-300px',
			'paddig-top': '0px',
			'top': '50%',
			'left': '50%'
		});

		//$('.letterblock').css('font-size', Math.round($('.letterblock').height()/3));

		$('#game h1').css('font-size', 32);
		
		$('#statsoverlay').css({
			'top': '0px'
		});
		
		$('#timeleft').show();
		$('#timeleftmobile').hide();
		
		$('#statsoverlay').show();
		$('#statsoverlaymobile').hide();
		
		$('#resultslogo').css({
			'height': '40px',
			'margin-top': '40px'
		})
	}
	
	//$('#lbscrollfix').css('width', $('.lbbox').width());
	
	var tempwidth = $('#gamewrap').width()
	$('#tablewrap').css('height', tempwidth);
	//$('.row').width($('#gamewrap').width());
	//$('.letterblock').width($('.row').width()/4);

	//compute background sizes
	if( board != undefined ){
		var curcell;
		var curblock;
		var cuwidth = $('.letterblock').height() * -1
		for( x = 0; x < board.length; x++ ){
			//curcell = '#text' + x;
			curblock = '#cell' + x;
			//$(curcell).empty().append( board[x] );

			var charcode = board[x].charCodeAt(0) - 65;
			$(curblock).css('background-position-x', charcode * cuwidth)
			$(curblock).css('background-size', 26 * cuwidth * -1);
		}
	}
	
	//$('.selected p').css('line-height', Math.round($('.letterblock').width()) + 'px' );
	//$('.unselected p').css('line-height', (Math.round($('.letterblock').width()) * .8) + 'px');
}


setaspect();


$(window).resize( function(){
	setaspect();
	var chatWindow = document.getElementById('messagebox');
	chatWindow.scrollTop = chatWindow.scrollHeight;
});	

if( "ontouchstart" in document.documentElement ){
	window.addEventListener('orientationchange', function updateOrientation(){
		switch(window.orientation)
		{
			case 0:
				$('#gamewrap').css('-webkit-transform', 'rotate(0deg)');
				break;

			case -90:
				$('#gamewrap').css('-webkit-transform', 'rotate(90deg)');
				break;

			case 90:
				$('#gamewrap').css('-webkit-transform', 'rotate(-90deg)');
				break;

			case 180:
				$('#gamewrap').css('-webkit-transform', 'rotate(180deg)');
				break;

		}
		
		setaspect();
	});
}