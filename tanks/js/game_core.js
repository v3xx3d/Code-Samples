var frame_time = 60/1000; // run the local game at 16ms/ 60hz
if('undefined' != typeof(global)) frame_time = 45; //on server we run at 45ms, 22hz

// requestanimationframe polyfill and setTimout fallback
( function () {

    var lastTime = 0;
    var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

    for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++ x ) {
        window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
        window.cancelAnimationFrame = window[ vendors[ x ] + 'CancelAnimationFrame' ] || window[ vendors[ x ] + 'CancelRequestAnimationFrame' ];
    }

    if ( !window.requestAnimationFrame ) {
        window.requestAnimationFrame = function ( callback, element ) {
            var currTime = Date.now(), timeToCall = Math.max( 0, frame_time - ( currTime - lastTime ) );
            var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if ( !window.cancelAnimationFrame ) {
        window.cancelAnimationFrame = function ( id ) { clearTimeout( id ); };
    }

}() );





var game_core = function(s){

    //Store a flag if we are the server
    this.server = s !== undefined;

        //Set up some physics integration values
    this._pdt = 0.0001;                 //The physics update delta time
    this._pdte = new Date().getTime();  //The physics update last delta time
        //A local timer for precision on server and client
    this.local_time = 0.016;            //The local timer
    this._dt = new Date().getTime();    //The local timer delta
    this._dte = new Date().getTime();   //The local timer last frame time

    //Start a physics loop, this is separate to the rendering
    //as this happens at a fixed frequency
    // this.create_physics_simulation();

    //Start a fast paced timer for measuring time easier
    this.create_timer();

        //Client specific initialisation
    if(!this.server) {

    //         //Create the default configuration settings
        this.client_create_configuration();

    //         //A list of recent server updates we interpolate across
    //         //This is the buffer that is the driving factor for our networking
    //     this.server_updates = [];

    //         //Connect to the socket.io server!
    //     this.client_connect_to_server();

    //         //We start pinging the server to determine latency
    //     this.client_create_ping_timer();


    } else { //if !server

    //     this.server_time = 0;
    //     this.laststate = {};

    }
}

//server side we set the 'game_core' class to a global type, so that it can use it anywhere.
if( 'undefined' != typeof global ) {
    module.exports = global.game_core = game_core;
}

// (4.22208334636).fixed(n) will return fixed point value to n places, default n = 3
// idk if i really need this. will the additional decimals slow us down?
Number.prototype.fixed = function(n) { n = n || 3; return parseFloat(this.toFixed(n)); };

game_core.prototype.pos = function(a) { return {x:a.x,y:a.y}; };
    //Add a 2d vector with another one and return the resulting vector
game_core.prototype.v_add = function(a,b) { return { x:(a.x+b.x).fixed(), y:(a.y+b.y).fixed() }; };
    //Subtract a 2d vector with another one and return the resulting vector
game_core.prototype.v_sub = function(a,b) { return { x:(a.x-b.x).fixed(),y:(a.y-b.y).fixed() }; };
    //Multiply a 2d vector with a scalar value and return the resulting vector
game_core.prototype.v_mul_scalar = function(a,b) { return {x: (a.x*b).fixed() , y:(a.y*b).fixed() }; };
    //For the server, we need to cancel the setTimeout that the polyfill creates
game_core.prototype.stop_update = function() {  window.cancelAnimationFrame( this.updateid );  };
    //Simple linear interpolation
game_core.prototype.lerp = function(p, n, t) { var _t = Number(t); _t = (Math.max(0, Math.min(1, _t))).fixed(); return (p + _t * (n - p)).fixed(); };
    //Simple linear interpolation between 2 vectors
game_core.prototype.v_lerp = function(v,tv,t) { return { x: this.lerp(v.x, tv.x, t), y:this.lerp(v.y, tv.y, t) }; };


game_core.prototype.processLoop = function(t) {
    
        //Work out the delta time
    this.dt = this.lastframetime ? ( (t - this.lastframetime)/1000.0).fixed() : 0.016;

        //Store the last frame time
    this.lastframetime = t;

        //Update the game specifics
    if(!this.server) {
        this.client_update();
    } else {
        this.server_update();
    }

        //schedule the next update
    this.updateid = window.requestAnimationFrame( this.processLoop.bind(this), this.viewport );

}; //game_core.update


// client main function
game_core.prototype.client_update = function(){

    //Capture inputs from the player
    this.client_handle_input();

    //Network player just gets drawn normally, with interpolation from
    //the server updates, smoothing out the positions from the past.
    //Note that if we don't have prediction enabled - this will also
    //update the actual local client position on screen as well.
    if( !this.naive_approach ) {
        // this.client_process_net_updates();
    }

    //When we are doing client side prediction, we smooth out our position
        //across frames using local input states we have stored.
    // this.client_update_local_position();




	//process allthethings
	this.processTanks();
	this.processProjectiles();

	//clear the canvas
	this.clearCanvas();
	
	//draw allthethings
	this.drawGrid();
	
	this.drawMouse();
	this.drawTanks();
	this.drawMinimap();
	this.drawProjectiles();


    //Work out the fps average
    // this.client_refresh_fps();
}

// draw tanks
game_core.prototype.drawTanks = function(){
	myTank.draw();
	drawAltTanks();
}

// process tanks
game_core.prototype.processTanks = function(){
	myTank.process();
}

// reposition tanks
game_core.prototype.repositionTanks = function(){
	if( myTank ){
		myTank.viewport_position();
	}
}

// clear the canvas before redraws
game_core.prototype.clearCanvas = function(){
	this.ctx.clearRect(0,0, width, height);
}


game_core.prototype.generateRandomEnemyTanks = function(numtanks){
	for( var i = 0; i < numtanks; i++ ){
		var tmpx = Math.floor(Math.random() * ((mapwidth-90) - 90)) + 90;
		var tmpy = Math.floor(Math.random() * ((mapheight-90) - 90)) + 90;;
		var tmpangle = Math.random() * 361;

		enemyTankList.push( new Tank(tmpx,tmpy,tmpangle,'beta3','beta1','beta_test') );
	}
}

game_core.prototype.addProjectile = function(x1, y1, xvel, yvel){
    projectileList.push( new Projectile(x1, y1, xvel, yvel) );
}

game_core.prototype.processProjectiles = function(){
    for( q = 0; q < projectileList.length; q++ ){
        projectileList[q].process(q);
    }
}

game_core.prototype.drawProjectiles = function(){
    for( o = 0; o < projectileList.length; o++ ){
        projectileList[o].draw();
    }
}


// initialize a game with a new tank for ourself
// and some randy tanks for testing
game_core.prototype.initGame = function(){
        //We create a player set, passing them
        //the game that is running them, as well
    if(this.server) {

        this.tankList = [];

    } else {
        // initialize a game with a new tank for ourself
        // and some randy tanks for testing
        myTank = new Tank( mapwidth/2, mapheight/2, 0, 'beta4', 'beta1', 'v3xx3d');
        myTank.inputs = [];
        this.generateRandomEnemyTanks(40);

    }
}


// what we do when the browser is resized
game_core.prototype.resizeHandler = function(){
	this.clearCanvas();
    var tempwidth = $(window).width();
    var tempheight = $(window).height();

    if( tempwidth <= mapwidth ){
    	width = tempwidth;
    } else {
    	width = mapwidth;
    }

    $('#viewport').attr('width', width);
    viewport.width = width;
    
    if ( tempheight <= mapheight ){
    	height = tempheight;
    } else {
    	height = mapheight;
    }

    $('#viewport').attr('height', height);
	viewport.height = height;
    
    this.repositionTanks();

    xmin = $('#viewport').offset().left;
	ymin = $('#viewport').offset().top;
}


game_core.prototype.drawGrid = function(){
	var t = myTank;
	var xoffset = (t.x - t.screenx)%gridwidth;
	var yoffset = (t.y - t.screeny)%gridwidth;

	var marker = gridwidth;
	while( marker < width + xoffset ){

	    this.ctx.beginPath();
	    this.ctx.moveTo(marker - xoffset, 0);
	    this.ctx.lineTo(marker - xoffset, height);
	    this.ctx.lineWidth = 1;
      	this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
	    this.ctx.stroke();

	    marker += gridwidth;
	}

	marker = 0;
	while( marker < height + yoffset ){
		this.ctx.beginPath();
	    this.ctx.moveTo(0, marker - yoffset);
	    this.ctx.lineTo(width, marker - yoffset);
	    this.ctx.lineWidth = 1;
      	this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
	    this.ctx.stroke();

	    marker += gridwidth;
	}

	//draw map info
	this.ctx.textAlign = 'left';
	this.ctx.font = '13pt Calibri';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('Map Size: ' + mapwidth + 'x' + mapheight, 10, height-10);

    //draw viewport info
    this.ctx.fillText('Viewport Size: ' + width + 'x' + height, 10, height-30);
}


game_core.prototype.drawMinimap = function(){
	this.ctx.beginPath();
	this.ctx.strokeStyle = 'rgba(255,0,0,0.3)';
	this.ctx.lineWidth = 2;
	this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
	this.ctx.rect(width-minimapwidth-minimappadding,height-minimapheight-minimappadding,minimapwidth,minimapheight);
	this.ctx.fill();
	this.ctx.stroke();

	if( myTank ){
		var temptank = myTank;

		// x/mapwidth = i/120

		var tempx = (temptank.x/mapwidth) * minimapwidth;
		var tempy = (temptank.y/mapheight) * minimapheight;

		this.ctx.beginPath();
	    this.ctx.arc( width - minimapwidth - minimappadding + tempx , height - minimapheight - minimappadding + tempy, 1.5, 0, 2 * Math.PI, false);
	    this.ctx.fillStyle = 'green';
	    this.ctx.fill();
	}
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*--------------------------------------------------------------------------------------------------------------------
            Stuff i'm still trying to understand
--------------------------------------------------------------------------------------------------------------------*/
game_core.prototype.server_update = function(){

        //Update the state of our local clock to match the timer
    this.server_time = this.local_time;

        //Make a snapshot of the current state, for updating the clients
    this.laststate = {
        hp  : this.players.self.pos,                //'host position', the game creators position
        cp  : this.players.other.pos,               //'client position', the person that joined, their position
        his : this.players.self.last_input_seq,     //'host input sequence', the last input we processed for the host
        cis : this.players.other.last_input_seq,    //'client input sequence', the last input we processed for the client
        t   : this.server_time                      // our current local time on the server
    };

        //Send the snapshot to the 'host' player
    if(this.players.self.instance) {
        this.players.self.instance.emit( 'onserverupdate', this.laststate );
    }

        //Send the snapshot to the 'client' player
    if(this.players.other.instance) {
        this.players.other.instance.emit( 'onserverupdate', this.laststate );
    }

}; //game_core.server_update

game_core.prototype.create_timer = function(){
    setInterval(function(){
        this._dt = new Date().getTime() - this._dte;
        this._dte = new Date().getTime();
        this.local_time += this._dt/1000.0;
    }.bind(this), 4);
}


game_core.prototype.create_physics_simulation = function() {

    setInterval(function(){
        this._pdt = (new Date().getTime() - this._pdte)/1000.0;
        this._pdte = new Date().getTime();
        this.update_physics();
    }.bind(this), 15);

};

game_core.prototype.update_physics = function() {

    if(this.server) {
        this.server_update_physics();
    } else {
        this.client_update_physics();
    }

}; //game_core.prototype.update_physics


    //Updated at 15ms , simulates the world state
game_core.prototype.server_update_physics = function() {

        //Handle player one
    this.players.self.old_state.pos = this.pos( this.players.self.pos );
    var new_dir = this.process_input(this.players.self);
    this.players.self.pos = this.v_add( this.players.self.old_state.pos, new_dir );

        //Handle player two
    this.players.other.old_state.pos = this.pos( this.players.other.pos );
    var other_new_dir = this.process_input(this.players.other);
    this.players.other.pos = this.v_add( this.players.other.old_state.pos, other_new_dir);

        //Keep the physics position in the world
    this.check_collision( this.players.self );
    this.check_collision( this.players.other );

    this.players.self.inputs = []; //we have cleared the input buffer, so remove this
    this.players.other.inputs = []; //we have cleared the input buffer, so remove this

}; //game_core.server_update_physics


game_core.prototype.client_update_physics = function() {

        //Fetch the new direction from the input buffer,
        //and apply it to the state so we can smooth it in the visual state

    if(this.client_predict) {

        this.players.self.old_state.pos = this.pos( this.players.self.cur_state.pos );
        var nd = this.process_input(this.players.self);
        this.players.self.cur_state.pos = this.v_add( this.players.self.old_state.pos, nd);
        this.players.self.state_time = this.local_time;

    }

}; //game_core.client_update_physics


game_core.prototype.client_handle_input = function(){

    // take a snapshot of held keys
    heldKeys = tempKeys;

};




game_core.prototype.client_create_configuration = function() {

    this.show_help = false;             //Whether or not to draw the help text
    this.naive_approach = false;        //Whether or not to use the naive approach
    this.show_server_pos = false;       //Whether or not to show the server position
    this.show_dest_pos = false;         //Whether or not to show the interpolation goal
    this.client_predict = true;         //Whether or not the client is predicting input
    this.input_seq = 0;                 //When predicting client inputs, we store the last input as a sequence number
    this.client_smoothing = true;       //Whether or not the client side prediction tries to smooth things out
    this.client_smooth = 25;            //amount of smoothing to apply to client update dest

    this.net_latency = 0.001;           //the latency between the client and the server (ping/2)
    this.net_ping = 0.001;              //The round trip time from here to the server,and back
    this.last_ping_time = 0.001;        //The time we last sent a ping
    this.fake_lag = 0;                //If we are simulating lag, this applies only to the input client (not others)
    this.fake_lag_time = 0;

    this.net_offset = 100;              //100 ms latency between server and client interpolation for other clients
    this.buffer_size = 2;               //The size of the server history to keep for rewinding/interpolating.
    this.target_time = 0.01;            //the time where we want to be in the server timeline
    this.oldest_tick = 0.01;            //the last time tick we have available in the buffer

    this.client_time = 0.01;            //Our local 'clock' based on server time - client interpolation(net_offset).
    this.server_time = 0.01;            //The time the server reported it was at, last we heard from it
    
    this.dt = 0.016;                    //The time that the last frame took to run
    this.fps = 0;                       //The current instantaneous fps (1/this.dt)
    this.fps_avg_count = 0;             //The number of samples we have taken for fps_avg
    this.fps_avg = 0;                   //The current average fps displayed in the debug UI
    this.fps_avg_acc = 0;               //The accumulation of the last avgcount fps samples

    this.lit = 0;
    this.llt = new Date().getTime();

};//game_core.client_create_configuration






















/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*--------------------------------------------------------------------------------------------------------------------
            Utilities
--------------------------------------------------------------------------------------------------------------------*/





game_core.prototype.solvefory = function( h, angle ){
    return Math.sin(angle)*h;
}

game_core.prototype.solveforx = function(h, x){
    return Math.sqrt( Math.pow(h,2) - Math.pow(x,2));
}

game_core.prototype.rnd = function(n){
    return Math.round(n * 100) / 100;
}

game_core.prototype.solveHypotenuse = function(x,y){
    return Math.sqrt((x * x) + (y * y));
}

game_core.prototype.point = function(x,y){
    this.x = x || 0;
    this.y = y || 0;
}

    // if angle is greater than 2*pi or negative, shift it while keeping an equivalent angle
    // angle should always be between 0 and 2*pi ( 0degrees - 360degrees)   
game_core.prototype.normalizeAngle = function(a){
    if( a > 2*Math.PI ){
        return a - 2*Math.PI;
    } else if( a < 0 ){
        return a + 2*Math.PI;
    } else {
        return a;
    }
}