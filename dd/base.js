//http://www.youtube.com/watch?v=aIrrdL6ydjs
//console.log();

var canvas;
var context;
var width = $('#wrap').width();
var height = $('#wrap').height(); 

var frameRate = 100;
var frameCalc = 0;
var frames = 0;

var processqueue = [];
var drawqueue = [];
var clearqueue = [];

function main(){
	canvas = document.getElementById("canvas");
	canvas.setAttribute("width", width);
	canvas.setAttribute("height", height);
	
	context = canvas.getContext("2d");
	
	initMainMenu();
	processall();
}

function processall(){
	var startTime = (new Date()).getTime();
	process();
	clear();
	draw();
	var endTime = (new Date()).getTime();
	frameCalc = (1000/frameRate)-(endTime - startTime);
	var wait = Math.max(frameCalc,0);
	setTimeout("processall();", wait);
	frames++;
}

function process(){
	for( p = 0; p < processqueue.length; p++){
		processqueue[p]();
	}
}

function clear(){
	for( z = 0; z < clearqueue.length; z++){
		clearqueue[z]();
	}
}

function draw(){
	//clearCanvas();
	for( d = 0; d < drawqueue.length; d++){
		drawqueue[d]();
	}
}

function clearallqueues(){
	processqueue = [];
	drawqueue = [];
}

function clearCanvas(){
	context.clearRect(0,0, width, height);
}

function framerate(){
	context.font = "25px Verdana";
	context.fillText('fps: ' + 1000/frameCalc, 10, 50);
}

function initGame(){
	clearallqueues();
	processqueue.push( processCharacter );
	drawqueue.push( drawCharacter );
	clearqueue.push( clearCharacter );
}