//control all the key presses.
//keycode ref - http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
/*

up - 38
down - 40
left - 37
right -	39
f - 70

*/

var keys = [];

function onKeyDown(evt) {
	var test = $.inArray(evt.keyCode, keys);
	if( test == -1 ){
		keys.push(evt.keyCode);
	}
	refactor();
	
	
}

function onKeyUp(evt) {
	var test2 = $.inArray(evt.keyCode, keys);
	keys.splice( test2, 1);
	refactor();
	
	/*if(evt.keyCode == 70){
		var findex = $.inArray( framerate, drawqueue);
		drawqueue.splice( findex, 1 );
	}*/
}

//tell our character which keys are currently pressed
function refactor(){
	
	//if no keys are pressed do this.
	if( keys.length == 0 ){
		calvin.deltax = 0;
	} else {
		//check for jump
		if( $.inArray(32,keys) != -1 ){
			calvin.deltay = true;
			if($.inArray(37, keys) == -1 && $.inArray(39,keys) == -1){
				calvin.deltax = 0;
			}
		}
		//check for x movement
		if( $.inArray(37, keys) != -1 && $.inArray(39,keys) != -1){
			calvin.deltax = 0;
		}else if( $.inArray(37, keys) != -1) {
			calvin.deltax = calvin.speed * -1;
		} else if( $.inArray(39, keys) != -1) {
			calvin.deltax = calvin.speed;
		}
	}
	
	/*if( $.inArray(70,keys) != -1 ){
		drawqueue.push( framerate );
	}*/
}

$(document).keydown(onKeyDown);
$(document).keyup(onKeyUp);