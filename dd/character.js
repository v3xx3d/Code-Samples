var charskin = 'stick';

//STAND STATES
var stand_right_state = new Image();
stand_right_state.src = '/dd/images/skins/' + charskin + '/stand_right.png';
var stand_left_state = new Image();
stand_left_state.src = '/dd/images/skins/' + charskin + '/stand_left.png';
//RUN STATES
var run_right_state = new Image();
run_right_state.src = '/dd/images/skins/' + charskin + '/run_right.png';
var run_left_state = new Image();
run_left_state.src = '/dd/images/skins/' + charskin + '/run_left.png';
//JUMP STATES
var jump_right_state = new Image();
jump_right_state.src = '/dd/images/skins/' + charskin + '/jump_right.png';
var jump_left_state = new Image();
jump_left_state.src = '/dd/images/skins/' + charskin + '/jump_left.png';

function character(){
	this.charwidth = 35;
	this.charheight = 60;
	this.x = width/2 - this.charwidth/2;
	this.y = height - this.charheight;
	this.deltax = 0;
	this.deltay = false;
	
	this.health = 100;
	this.speed = 10; //horizontal speed
	this.speedmax = 10;
	this.acceleration = 2.5;
	this.direction = 'right';
	this.state = 'stand_right';
	this.cycle = 0;
	this.cycledelay = 5; //frames between sprite changes
	this.cycletimer = 0;
	
	this.jumpheight = 200;  //jump height
	this.jumpincrement = Math.PI/60;  //how long jump will last
	this.jumptimer = 0;	 //controls where we are on the sine wave
	this.tempy = this.y;  //temp number that stores our previous y value
	
	this.process = Process_Character;
	this.draw = Draw_Character;
	this.clear = Clear_Character;
}

var calvin = new character();

function Process_Character(){
	//check if our character is moving
	if( this.deltax == 0 && this.deltay == false ){
		//NOT MOVING
		this.cycle = 0;
		if( this.direction == 'left' ){
			this.state = 'stand_left';
		} else if( this.direction == 'right' ) {
			this.state = 'stand_right';
		}
	} else {
		//COMPUTE Y MOVEMENT////////////////////////////////////////////////////////////////////////////
		if( this.deltay ){
			//jump with a sine wave makin it smooth
			this.y = this.tempy - (this.jumpheight * Math.sin(this.jumptimer));
			this.jumptimer += this.jumpincrement;
			
			if( this.y > height - this.charheight ){
				this.y = height - this.charheight;
				this.jumptimer = 0;
				this.deltay = false;
			}
			
			if( this.deltax > 0 ){
				this.state = 'jump_right';
			} else if( this.deltax < 0 ){
				this.state = 'jump_left';
			} else {
				if( this.direction == 'left'){
					this.state = 'jump_left';
				} else if( this.direction == 'right') {
					this.state = 'jump_right';
				}
			}
		}///////////////////////////////////////////////////////////////////////////////////////////////
		//COMPUTE X MOVEMENT
		if ( this.deltax > 0 ){
			//RIGHT MOVEMENT
			if( this.x + this.charwidth + this.deltax > width ){
				//if we run into the right boundary
				this.x = width - this.charwidth + 6 ;
				if( this.deltay == false ){
					this.state = 'stand_right';
				}
			} else {
				if( this.deltay == false ){
					this.state = 'run_right';
				}
				this.x += this.deltax;
				
				//control the animation
				if( this.cycletimer == this.cycledelay){
					if(this.cycle < 4){
						if( this.state == 'run_right' || this.state == 'run_left'){
							this.cycle++;
						}
					}
					this.cycletimer = 0;
				} else { 
					if(this.cycle < 4){
						this.cycletimer++;
					}
				};
				this.direction = 'right';
				if( this.cycle > 3) {
					this.cycle = 0;
				}
			}
		} else if ( this.deltax < 0 ){
		
			//LEFT MOVEMENT
			if( this.x + this.deltax < 0 ){
				// if we run into the left boundary
				this.x = -7;
				if( this.deltay == false){
					this.state = 'stand_left';
				}
			} else {
				if( this.deltay == false){
					this.state = 'run_left';
				}
				this.x += this.deltax;
				
				//control the animation
				if( this.cycletimer == this.cycledelay){
					if(this.cycle < 4){
						if( this.state == 'run_right' || this.state == 'run_left'){
							this.cycle++;
						}
					}
					this.cycletimer = 0;
				} else { 
					if(this.cycle < 4){
						this.cycletimer++;
					}
				};
			}
			
			this.direction = 'left';
			if( this.cycle > 3) {
				this.cycle = 0;
			}
		}
	}
	
}

function Draw_Character(){
	
	switch( this.state ){
	//STANDING
		case 'stand_right':
			context.drawImage(stand_right_state, this.x, this.y);
			break;
		case 'stand_left':
			context.drawImage(stand_left_state, this.x, this.y);
			break;
	//RUNNING
		case 'run_right':
			context.drawImage(run_right_state, this.charwidth * this.cycle, 0, this.charwidth, this.charheight, this.x, this.y, this.charwidth, this.charheight );
			break;
		case 'run_left':
			context.drawImage(run_left_state, this.charwidth * this.cycle, 0, this.charwidth, this.charheight, this.x, this.y, this.charwidth, this.charheight ); 
			break;
	//JUMPING
		case 'jump_right':
			context.drawImage(jump_right_state, 0, 0, this.charwidth, this.charheight, this.x, this.y, this.charwidth, this.charheight );
			break;
		case 'jump_left':
			context.drawImage(jump_left_state, 0, 0, this.charwidth, this.charheight, this.x, this.y, this.charwidth, this.charheight ); 
			break;
	//BROKE IT
		default:
			alert('the state ' + this.state + ' does not exist!');
			break;
	}
}

function Clear_Character(){
	context.clearRect(this.x - this.speed,this.y - this.speed, this.charwidth + this.speed*2, this.charheight + this.speed*2);
}

function processCharacter(){
	calvin.process();
}

function drawCharacter(){
	calvin.draw();
}

function clearCharacter(){
	calvin.clear();
}