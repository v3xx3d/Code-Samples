window.setTimeout( 'makeboxes()' , 1000 );

function makeboxes(){
	$beforewidth = $('#box1').width();
	$afterwidth = $beforewidth - $beforewidth * .5;
	
	$displace = ($beforewidth - $afterwidth) / 2;
	
	
	$('.box').hover( function(){
		$(this).stop();
		$(this).animate({
			width: $afterwidth + 'px',
			height: $afterwidth + 'px',
			top: $displace + 'px',
			left: $displace + 'px'
		}, 400 );
	});

	$('.box').mouseout( function(){
		$(this).stop();
		$(this).animate({
			width: $beforewidth + 'px',
			height: $beforewidth + 'px',
			top: '0px',
			left: '0px'
		}, 400 );
	});
}