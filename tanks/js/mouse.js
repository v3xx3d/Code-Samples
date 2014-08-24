
var mouseX, mouseY;
var mouseactive = false;

var mousePressed = false;

var xmin = 0;
var ymin = 0;

$('#viewport').mousemove(function(e){
	mouseactive = true;
	if(e.pageX) {
		mouseX = e.pageX - xmin;
		mouseY = e.pageY - ymin;
	}
});

$('#viewport').mouseout(function(){
	mouseactive = false;
	mouseX = -1;
	mouseY = -1;
});

game_core.prototype.drawMouse = function(){
	if( mouseactive ){
		this.ctx.beginPath();
	    this.ctx.moveTo(myTank.screenx, myTank.screeny);
	    this.ctx.lineTo(mouseX, mouseY);
	    this.ctx.lineWidth = 2;
	  	this.ctx.strokeStyle = 'rgba(255,0,0,0.2)';
	    this.ctx.stroke();

	    //in case i'd rather draw a cursor
	    // context.beginPath();
	    // context.linewidth = 0.5;
	    // context.moveTo(mouseX, mouseY + 25);
	    // context.lineTo(mouseX, mouseY - 25);
	    // context.moveTo(mouseX + 25, mouseY);
	    // context.lineTo(mouseX - 25, mouseY);
	    // context.strokeStyle = 'rgba(255,255,255,0.4)';
	    // context.stroke();
	}
}

$('#viewport').on('mousedown',function(){
	mousePressed = true;
})

$('#viewport').on('mouseup', function(){
	mousePressed = false;
})