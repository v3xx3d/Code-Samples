var clickevents = [];

var mouseX, mouseY;
var mouseactive = false;

var xmin = $('#wrap').offset().left;
var ymin = $('#wrap').offset().top;
var xmax = xmin + width;
var ymax = ymin + height;

$('#canvas').mousemove(function(e){
	mouseactive = true;
	if(e.pageX) {
		mouseX = e.pageX - xmin;
		mouseY = e.pageY - ymin;
	}
	
});

$('#canvas').click(function(){
	for( c = 0; c < clickevents.length; c++){
		clickevents[c]();
	}
});

$('#canvas').mouseout(function(){
	mouseactive = false;
});

