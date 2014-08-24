//Intro Animation
function initIntro(){

}


//Main Menu

var menux = -850;
var menuy = height/2 - 518/2;
var goalx = width/2 - 400;
var menuspeed = 5;
var menuexitspeed = 10;
var menusactive = true;

//menu image
var mainmenuimg = new Image();
mainmenuimg.src = '/dd/images/menu_bg.png';

//play button stuff
var playx = menux + 400 - 207/2;
var playy = menuy + 160;
var playhover = false;
var play = new Image();
play.src = '/dd/images/play.png';
var playh = new Image();
playh.src = '/dd/images/play_hover.png';

//option button stuff
var optx = playx;
var opty = playy + 75;
var opthover = false;
var options = new Image();
options.src = '/dd/images/options.png';
var optionsh = new Image();
optionsh.src = '/dd/images/options_hover.png';
	
function initMainMenu(){
	clearallqueues();
	processqueue.push( menu_process );
	clearqueue.push( menu_clear );
	drawqueue.push( menu_draw );
	clickevents.push( main_menu_mouse );
}

function menu_process(){
	if( menux < goalx ){
		menux += menuspeed;
		playx += menuspeed;
		optx += menuspeed;
	}
	
	if( mouseX >= playx + 33 && mouseX <= playx + 207 - 33 && mouseY >= playy + 33 && mouseY <= playy + 124 - 33){
		playhover = true;
	} else {
		playhover = false;
	}
	
	if( mouseX >= optx + 33 && mouseX <= optx + 207 - 33 && mouseY >= opty + 33 && mouseY <= opty + 124 - 33){
		opthover = true;
	} else {
		opthover = false;
	}
	
	if( menux >= width + 10 ){
		initGame();
	}
}


function menu_draw(){
	
	context.drawImage(mainmenuimg, menux, menuy);
	
	if(playhover){
		context.drawImage(playh, playx, playy);
	} else {
		context.drawImage(play, playx, playy);
	}
	
	if(opthover){
		context.drawImage(optionsh, optx, opty);
	} else {
		context.drawImage(options, optx, opty);
	}
}

function menu_clear(){
	context.clearRect( menux, menuy, 800, 518 );
}

function main_menu_mouse(){
	if( playhover ){
		menuspeed = menuexitspeed;
		goalx = width + 10;
	}
	
	if( opthover ){
		//menusactive = false;
		//initOptions();
		alert('lolwut? options?');
	}
}

function initOptions(){

}

