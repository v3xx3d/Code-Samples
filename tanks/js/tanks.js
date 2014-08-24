
// keep our tank location separate
var myTank;

// all enemy tanks
var enemyTankList = [];


// Tank constructor
function Tank(x,y,a,t,tur,n){

	// main properties
	this.type = t;
	this.name = n;
	this.x = x;
	this.y = y;
	this.angle = a;
	this.health = tanks_def[t].healthpool;
	this.image = tanks_def[t].image;
	this.speed = tanks_def[t].speed;
	this.rotationspeed = tanks_def[t].rotationspeed;
	this.speedmodifier = tanks_def[t].speedmodifier;
	this.reversespeed = tanks_def[t].reversespeed;

	this.damageDealt = 0;
	this.tanksDestroyed = 0;


	// location in viewport
	this.screenx = 0;
	this.screeny = 0;
	this.viewport_position();


	// bounding box
	this.boundingbox = {};
	this.boundingbox.length = this.image.naturalWidth;
	this.boundingbox.width = this.image.naturalHeight;
	this.centeroffsetx = this.boundingbox.length/2;
	this.centeroffsety = this.boundingbox.width/2;


	// corners
	this.point_fl = new game.point();
	this.point_fr = new game.point();
	this.point_rl = new game.point();
	this.point_rr = new game.point();
	this.computeCorners(x,y,a);


	// min and max x and y corner locations
	// mostly for collision detection
	this.minx = 0;
	this.maxx = 0;
	this.miny = 0;
	this.maxy = 0;
	this.computeMinMax();


	// define turret properties
	this.turret = {};
	this.turret.type = tur;
	this.turret.angle = a;
	this.turret.rotationspeed = turrets_def[tur].rotationspeed;
	this.turret.centeroffsetx = turrets_def[tur].centeroffsetx;
	this.turret.centeroffsety = turrets_def[tur].centeroffsety;
	this.turret.image = turrets_def[tur].image;
	this.turret.bulletvelocity = turrets_def[tur].bulletvelocity;
	this.turret.bulletradius = turrets_def[tur].bulletradius;
	this.turret.barrellength = turrets_def[tur].barrellength;
	this.turret.cooldown = turrets_def[tur].cooldown;
	this.turret.firetimer = turrets_def[tur].firetimer;
	this.turret.firex = 0;
	this.turret.firey = 0;


	//define tread properties
	this.treads = {};
	this.treads.image = treads_def[ tanks_def[t].treads ].image;
	this.treads.length = this.treads.image.naturalWidth;
	this.treads.width = this.treads.image.naturalHeight;
	this.treads.offset = {};
	this.treads.offset.right = 0;
	this.treads.offset.left = 0;


	// collision radius
	// for narrowing down collision detection
	this.radius = game.solveHypotenuse(this.centeroffsetx, this.centeroffsety) + 3;
	

	// different points of collision
	this.collid = false;
	this.radiusCollid = false;
	this.collidWithTank = false;


	// i don't like having this temp stuff
	// but it's necessary for now
	this.tempx = x;
	this.tempy = y;
	this.tempangle = a;
	this.prevangle = a;

}

Tank.prototype.viewport_position = function(){
	if( this.x > width/2 && this.x < mapwidth - (width/2) ){
		this.screenx = width/2;
	} else if( this.x < width/2 ){
		this.screenx = this.x;
	} else if( this.x > mapwidth - (width/2) ){
		this.screenx = mapwidth - (width/2);
	}

	if( this.y > height/2 && this.y < mapheight - (height/2) ){
		this.screeny = height/2;
	} else if( this.y < height/2 ){
		this.screeny = this.y;
	} else if( this.y > mapheight - (height/2) ){
		this.screeny = mapheight - (width/2);
	}
}


Tank.prototype.checkTankCollisions = function(){
	var tankcollisions = 0;

	for( var i = 0; i < enemyTankList.length; i ++ ){
		if( game.solveHypotenuse( Math.abs(this.x - enemyTankList[i].x), Math.abs(this.y - enemyTankList[i].y)) < this.radius + enemyTankList[i].radius ){
			this.radiusCollid = true;

			var axis = [{},{},{},{}];
			var points = ['point_fr', 'point_fl', 'point_rr', 'point_rl'];

			var axiscollisions = 0;

			axis[0].x = this.point_fr.x - this.point_fl.x;
			axis[0].y = this.point_fr.y - this.point_fl.y;

			axis[1].x = this.point_fr.x - this.point_rr.x;
			axis[1].y = this.point_fr.y - this.point_rr.y;

			axis[2].x = enemyTankList[i].point_fl.x - enemyTankList[i].point_rl.x;
			axis[2].y = enemyTankList[i].point_fl.y - enemyTankList[i].point_rl.y;

			axis[3].x = enemyTankList[i].point_fl.x - enemyTankList[i].point_fr.x;
			axis[3].y = enemyTankList[i].point_fl.y - enemyTankList[i].point_fr.y;
			

			// loop through each axis
			for( var a = 0; a < axis.length; a++ ){
				var boxa = [];
				var boxb = [];


				// plot points along current axis
				for( var b = 0; b < points.length; b++ ){
					var idk = (this[points[b]].x * axis[a].x + this[points[b]].y * axis[a].y) / ((axis[a].x * axis[a].x) + (axis[a].y * axis[a].y));
					var projx = idk * axis[a].x;
					var projy = idk * axis[a].y;

					var scalar = ( projx * axis[a].x ) + (projy * axis[a].y );

					boxa.push(scalar);



					var idk = (enemyTankList[i][points[b]].x * axis[a].x + enemyTankList[i][points[b]].y * axis[a].y) / ((axis[a].x * axis[a].x) + (axis[a].y * axis[a].y));
					var projx = idk * axis[a].x;
					var projy = idk * axis[a].y;

					var scalar = ( projx * axis[a].x ) + (projy * axis[a].y );

					boxb.push(scalar);
				}

				var mina = Math.min.apply(null,boxa);
				var maxa = Math.max.apply(null,boxa);

				var minb = Math.min.apply(null,boxb);
				var maxb = Math.max.apply(null,boxb);

				// if
				// minb <= maxa && mina <= maxb
				// there is an overlap on this axis

				// if minb > maxa || mina > maxb

				if( minb <= maxa && mina <= maxb ){
					axiscollisions++;
				}
			}

			if( axiscollisions == 4 ){
				tankcollisions++;
			}
		}
	}

	if( tankcollisions == 0 ){
		return false;
	} else return true;
}

Tank.prototype.process = function(){

	var curspeed = this.speed * game.dt;
	var curreversespeed = this.reversespeed * game.dt;
	
	this.tempx = this.x;
	this.tempy = this.y;
	this.tempangle = this.angle;
	this.prevangle = this.angle;

	this.radiusCollid = false;

	var ydiff = Math.abs( game.solvefory( this.turret.barrellength, this.turret.angle ) );
	var xdiff = Math.abs( game.solveforx( this.turret.barrellength, ydiff ) );

	if( isHeld('left') ){
		this.tempangle = this.angle - (this.rotationspeed * game.dt);
		curspeed = curspeed * this.speedmodifier;
		curreversespeed = curreversespeed * this.speedmodifier;
	}

	if( isHeld('right') ){
		this.tempangle = this.angle + (this.rotationspeed * game.dt);
		curspeed = curspeed * this.speedmodifier;
		curreversespeed = curreversespeed * this.speedmodifier;
	}

	// if angle is greater than 2*pi or negative, shift it while keeping an equivalent angle
	// angle should always be between 0 and 2*pi ( 0degrees - 360degrees)

	this.tempangle = game.normalizeAngle( this.tempangle );

	// if( this.tempangle > 2*Math.PI ){
	// 	this.tempangle -= 2*Math.PI;
	// }
	// if( this.tempangle < 0 ){
	// 	this.tempangle += 2*Math.PI;
	// }

	if( isHeld('forward') && !isHeld('reverse') ){
		var ydiff = Math.abs( game.solvefory( curspeed, this.tempangle ) );
		var xdiff = Math.abs( game.solveforx( curspeed, ydiff ) );

		// southeast
		if( this.tempangle > 0 && this.tempangle < Math.PI/2 ){
			this.tempx = this.x + xdiff;
			this.tempy = this.y + ydiff;


		// southwest
		} else if( this.tempangle > Math.PI/2 && this.tempangle < Math.PI ){
			this.tempx = this.x - xdiff;
			this.tempy = this.y + ydiff;

		// northwest
		} else if( this.tempangle > Math.PI && this.tempangle < (3*Math.PI)/2 ){
			this.tempx = this.x - xdiff;
			this.tempy = this.y - ydiff;

		// northeast
		} else if( this.tempangle > (3*Math.PI/2) && this.tempangle <= 2*Math.PI ){
			this.tempx = this.x + xdiff;
			this.tempy = this.y - ydiff;

		// east
		} else if( this.tempangle == 0 ){
			this.tempx = this.x + xdiff;
			this.tempy = this.y;

		// north
		} else if( this.tempangle == Math.PI/2 ){
			this.tempy = this.y + ydiff;
			this.tempx = this.x;

		// west
		} else if( this.tempangle == Math.PI ){
			this.tempx = this.x - xdiff;
			this.tempy = this.y;

		// south
		} else if( this.tempangle == (3*Math.PI)/2 ){
			this.tempy = this.y - ydiff;
			this.tempx = this.x;
		}
		
	}

	if( isHeld('reverse') && !isHeld('forward') ){

		var ydiff = Math.abs( game.solvefory( curreversespeed, this.tempangle ) );
		var xdiff = Math.abs( game.solveforx( curreversespeed, ydiff ) );

		// southeast
		if( this.tempangle > 0 && this.tempangle < Math.PI/2 ){
			this.tempx = this.x - xdiff;
			this.tempy = this.y - ydiff;

		// southwest
		} else if( this.tempangle > Math.PI/2 && this.tempangle < Math.PI ){
			this.tempx = this.x + xdiff;
			this.tempy = this.y - ydiff;

		// northwest
		} else if( this.tempangle > Math.PI && this.tempangle < (3*Math.PI)/2 ){
			this.tempx = this.x + xdiff;
			this.tempy = this.y + ydiff;

		// northeast
		} else if( this.tempangle > (3*Math.PI/2) && this.tempangle <= 2*Math.PI ){
			this.tempx = this.x - xdiff;
			this.tempy = this.y + ydiff;

		// east
		} else if( this.tempangle == 0 ){
			this.tempx = this.x - xdiff;

		// north
		} else if( this.tempangle == Math.PI/2 ){
			this.tempy = this.y - ydiff;

		// west
		} else if( this.tempangle == Math.PI ){
			this.tempx = this.x + xdiff;

		// south
		} else if( this.tempangle == (3*Math.PI)/2 ){
			this.tempy = this.y + ydiff;
		}
	}

	// get x and y of corners
	this.computeCorners(this.tempx, this.tempy, this.tempangle);

	// get x min/max and y min/max for axis oriented bounding box
	this.computeMinMax();

	this.collidWithTank = this.checkTankCollisions();

	if( this.tempx + this.radius > mapwidth || this.tempy + this.radius > mapheight || this.tempx - this.radius < 0 || this.tempy - this.radius < 0 ){
		this.radiusCollid = true;
	}

	if( this.maxx <= mapwidth && this.minx >= 0 && this.maxy <= mapheight && this.miny >= 0 && !this.collidWithTank ){
		this.x = this.tempx;
		this.y = this.tempy;
		this.angle = this.tempangle;
		this.collid = false;
	} else {
		this.collid = true;
	}
	

	
	// compute location within viewport.
	// do this after other things for consistency
	if( this.x < width/2 ){
		this.screenx = this.x;
	}

	if( this.x > mapwidth - (width/2) ){
		this.screenx = width - (mapwidth - this.x);
	}

	if( this.y < height/2 ){
		this.screeny = this.y;
	}

	if( this.y > mapheight - (height/2) ){
		this.screeny = height - (mapheight - this.y);
	}

	// get x and y of corners
	this.computeCorners(this.screenx, this.screeny, this.angle);

	// get x min/max and y min/max for axis oriented bounding box
	this.computeMinMax();


	this.rotateTurret();

	if( isHeld('fire') || mousePressed ){
		var now = (new Date()).getTime();
		if( now - this.turret.firetimer > this.turret.cooldown ){
			this.turret.firetimer = now;
			this.openfire();
		}
	}



	// compute the location of tank treads
	// this needs worked on
	if( isHeld('forward') && !isHeld('reverse') ){

		if( isHeld('left') ){
			this.treads.offset.left = (this.treads.offset.left + (curspeed)) % (this.treads.length);
			this.treads.offset.right = (this.treads.offset.right + (curspeed)) % (this.treads.length);
		} else if( isHeld('right') ){
			this.treads.offset.left = (this.treads.offset.left + (curspeed)) % (this.treads.length);
			this.treads.offset.right = (this.treads.offset.right + (curspeed)) % (this.treads.length);
		} else {
			this.treads.offset.left = (this.treads.offset.left + curspeed) % (this.treads.length);
			this.treads.offset.right = (this.treads.offset.right + curspeed) % (this.treads.length);
		}

	} else if( isHeld('reverse') && !isHeld('forward') ){

		this.treads.offset.left = (this.treads.offset.left - curreversespeed) % (this.treads.length);
		this.treads.offset.right = (this.treads.offset.right - curreversespeed) % (this.treads.length);

	} else if( !isHeld('reverse') && !isHeld('forward') ){

		if( isHeld('left') && !isHeld('right') ){
			this.treads.offset.left = (this.treads.offset.left - (curspeed)) % (this.treads.length);
			this.treads.offset.right = (this.treads.offset.right + (curspeed)) % (this.treads.length);
		} else if( isHeld('right') && !isHeld('left') ){
			this.treads.offset.left = (this.treads.offset.left + curspeed) % (this.treads.length);
			this.treads.offset.right = (this.treads.offset.right - curspeed) % (this.treads.length);
		}	
	}
}


Tank.prototype.computeCorners = function(x,y,a){
	var tx = (this.boundingbox.length/2) * Math.cos(a) - (this.boundingbox.width/2) * Math.sin(a);
	var ty = (this.boundingbox.length/2) * Math.sin(a) + (this.boundingbox.width/2) * Math.cos(a);

	var ttx = (this.boundingbox.length/2) * Math.cos(-a) - (this.boundingbox.width/2) * Math.sin(-a);
	var tty = (this.boundingbox.length/2) * Math.sin(-a) + (this.boundingbox.width/2) * Math.cos(-a);

	// front right
	this.point_fr.x = x + tx;
	this.point_fr.y = y + ty;

	// rear right
	this.point_rr.x = x - ttx;
	this.point_rr.y = y + tty;

	//rear left
	this.point_rl.x = x - tx;
	this.point_rl.y = y - ty;

	//rear right
	this.point_fl.x = x + ttx;
	this.point_fl.y = y - tty;
}

var minmax = ['point_fl', 'point_rr', 'point_rl'];
Tank.prototype.computeMinMax = function(){
	this.minx = this.point_fr.x;
	this.maxx = this.point_fr.x;
	this.miny = this.point_fr.y;
	this.maxy = this.point_fr.y;

	for( var i = 0; i < minmax.length; i++ ){
		if( this[minmax[i]].x > this.maxx ){
			this.maxx = this[minmax[i]].x;
		} else if( this[minmax[i]].x < this.minx ){
			this.minx = this[minmax[i]].x;
		}

		if( this[minmax[i]].y > this.maxy ){
			this.maxy = this[minmax[i]].y;
		} else if( this[minmax[i]].y < this.miny ){
			this.miny = this[minmax[i]].y;
		}
	}
}


function drawAltTanks(){
	for(b = 0; b < enemyTankList.length; b++ ){

		var t = enemyTankList[b];

		var curx = myTank.x;
		var cury = myTank.y;

		var sx = myTank.screenx;
		var sy = myTank.screeny;

		var relx = t.x-curx;
		var rely = t.y-cury;

		if( Math.abs(relx) < width && Math.abs(rely) < height ){

			var drawx = sx + relx;
			var drawy = sy + rely;


			 // draw tank
			game.ctx.save();
			game.ctx.translate(drawx, drawy);
			game.ctx.rotate(t.angle);
			game.ctx.translate( -30, -25);
			game.ctx.drawImage(tanks_def.beta3.image, 0, 0);
			game.ctx.restore();

			//draw health bar
			if( isHeld('shift') ){
			    var barw = 60;
			    var barh = 6;

			    game.ctx.beginPath();
			    game.ctx.fillStyle = 'rgba(0,255,0,0.3)';
				game.ctx.rect(drawx - barw/2, drawy + 45, barw * (t.health/tanks_def[t.type].healthpool), barh);
				game.ctx.fill();

			    game.ctx.beginPath();
			    game.ctx.strokeStyle = 'rgba(0,255,0,0.1)';
				game.ctx.lineWidth = 2;
				game.ctx.rect(drawx - barw/2, drawy + 45, barw, barh);
				game.ctx.stroke();

				//draw health
				game.ctx.font = '13pt Calibri';
			    game.ctx.fillStyle = 'rgba(255,255,255,0.6)';
			    game.ctx.textAlign = 'center';
			    game.ctx.fillText(t.health + '/' + tanks_def[t.type].healthpool, drawx, drawy + 65);

				//draw name
			    game.ctx.fillText(t.name, drawx, drawy - 45);
			}
		}
	}
}


Tank.prototype.draw = function(){
	// draw crossing lines through tank center
	// game.ctx.beginPath();
 //    game.ctx.moveTo(myTank.screenx, 0);
 //    game.ctx.lineTo(myTank.screenx, height);
 //    game.ctx.lineWidth = 1;
 //  	game.ctx.strokeStyle = 'rgba(255,0,0,0.2)';
 //    game.ctx.stroke();

 //    game.ctx.beginPath();
 //    game.ctx.moveTo(0, myTank.screeny);
 //    game.ctx.lineTo(height, myTank.screeny);
 //    game.ctx.lineWidth = 1;
 //  	game.ctx.strokeStyle = 'rgba(255,0,0,0.2)';
 //    game.ctx.stroke();

    // draw tank collision threshold 
    // game.ctx.beginPath();
    // game.ctx.arc(myTank.screenx, myTank.screeny, myTank.radius, 0, 2 * Math.PI, false);
    //  if( myTank.radiusCollid ){
    // 	game.ctx.strokeStyle = 'rgba(255,0,0,0.6)';
    // } else {
    // 	game.ctx.strokeStyle = 'rgba(0,255,0,0.6)';
    // }
    // game.ctx.lineWidth = 2;
    // game.ctx.stroke();


    // // draw axis oriented bouding box
 //    game.ctx.beginPath();
 //    if( myTank.collidWithTank || myTank.collid ){
 //    	game.ctx.strokeStyle = 'rgba(255,0,0,0.6)';
 //    } else {
 //    	game.ctx.strokeStyle = 'rgba(0,255,0,0.6)';
 //    }
	// game.ctx.lineWidth = 2;
	// game.ctx.rect(myTank.minx, myTank.miny, myTank.maxx - myTank.minx, myTank.maxy - myTank.miny);
	// game.ctx.stroke();

	// draw reload circle
	var now = (new Date()).getTime();
	var timedif = (now - myTank.turret.firetimer)/myTank.turret.cooldown;
	if( timedif < 1.03 ){
		if( timedif < 1 ){
			game.ctx.beginPath();
		    game.ctx.arc(myTank.screenx, myTank.screeny, myTank.radius, 0, (2 * Math.PI) * (( now - myTank.turret.firetimer)/myTank.turret.cooldown) , false); 
		    // game.ctx.lineTo(myTank.screenx, myTank.screeny);
		    // game.ctx.closePath();
		    game.ctx.strokeStyle = 'rgba(255,0,0,0.5)';
		    game.ctx.lineWidth = 3;
		    game.ctx.stroke();
		} else {
			game.ctx.beginPath();
		    game.ctx.arc(myTank.screenx, myTank.screeny, myTank.radius, 0, (2 * Math.PI) , false); 
		    // game.ctx.lineTo(myTank.screenx, myTank.screeny);
		    // game.ctx.closePath();
		    game.ctx.strokeStyle = 'rgba(255,0,0,0.5)';
		    game.ctx.lineWidth = 3;
		    game.ctx.stroke();
		}
	    
	}
	
    // draw tank base
	game.ctx.save();
	game.ctx.translate(myTank.screenx, myTank.screeny);
	game.ctx.rotate(myTank.angle);
	game.ctx.translate( -myTank.centeroffsetx, -myTank.centeroffsety);

	// draw tank treads
	var ptrn = game.ctx.createPattern(myTank.treads.image,'repeat');
    game.ctx.fillStyle = ptrn;

    game.ctx.translate( myTank.treads.offset.left, 0);
    game.ctx.fillRect(0 - myTank.treads.offset.left, 0, myTank.boundingbox.length, myTank.treads.width);

    game.ctx.translate( - myTank.treads.offset.left + myTank.treads.offset.right, 0 );
    game.ctx.fillRect(0 - myTank.treads.offset.right, myTank.boundingbox.width- myTank.treads.width, myTank.boundingbox.length, myTank.treads.width);
    game.ctx.translate( -myTank.treads.offset.right, 0);
    // end tank treads

	game.ctx.drawImage(myTank.image, 0, 0);
	game.ctx.restore();
	// end drawing tank base



	// draw turret
	game.ctx.save();
	game.ctx.translate(myTank.screenx, myTank.screeny);
	game.ctx.rotate(myTank.turret.angle);
	game.ctx.translate( -myTank.turret.centeroffsetx, -myTank.turret.centeroffsety);
	game.ctx.drawImage(myTank.turret.image, 0, 0);
	game.ctx.restore();

	// draw a dot at tank center
	// game.ctx.beginPath();
 //    game.ctx.arc(myTank.screenx, myTank.screeny, 3, 0, 2 * Math.PI, false);
 //    game.ctx.fillStyle = 'green';
 //    game.ctx.fill();

    // draw a red dots at tank corners
	// game.ctx.beginPath();
 //    game.ctx.arc(myTank.point_fr.x, myTank.point_fr.y, 2, 0, 2 * Math.PI, false);
 //    game.ctx.fillStyle = 'red';
 //    game.ctx.fill();
 //    game.ctx.beginPath();
 //    game.ctx.arc(myTank.point_fl.x, myTank.point_fl.y, 2, 0, 2 * Math.PI, false);
 //    game.ctx.fillStyle = 'red';
 //    game.ctx.fill();
 //    game.ctx.beginPath();
 //    game.ctx.arc(myTank.point_rr.x, myTank.point_rr.y, 2, 0, 2 * Math.PI, false);
 //    game.ctx.fillStyle = 'red';
 //    game.ctx.fill();
 //    game.ctx.beginPath();
 //    game.ctx.arc(myTank.point_rl.x, myTank.point_rl.y, 2, 0, 2 * Math.PI, false);
 //    game.ctx.fillStyle = 'red';
 //    game.ctx.fill();
    
    // draw tank location and angle
    game.ctx.font = '13pt Calibri';
    game.ctx.fillStyle = '#ffffff';
    game.ctx.textAlign = 'left';
    game.ctx.fillText('x: ' + Math.round(myTank.x) + ', y: ' + Math.round(myTank.y) , 10, 20);
    game.ctx.fillText('angle: ' + (Math.round((myTank.angle * (180/Math.PI)) * 100) / 100) + '\u00B0' , 10, 40);

    //damage dealt and tanks destroyed
    game.ctx.textAlign = 'right';
    game.ctx.fillText('Damage: ' + myTank.damageDealt, width - (minimappadding + minimapwidth) - 10, height - 10 );
    game.ctx.fillText('Killed: ' + myTank.tanksDestroyed, width - (minimappadding + minimapwidth) - 10, height - 30 );

    //draw turret fire point
 //    var curx = myTank.x;
	// var cury = myTank.y;

	// var sx = myTank.screenx;
	// var sy = myTank.screeny;

	// var relx = myTank.turret.firex-curx;
	// var rely = myTank.turret.firey-cury;

	// if( Math.abs(relx) < width && Math.abs(rely) < height ){

	// 	var drawx = sx + relx;
	// 	var drawy = sy + rely;


	// 	//draw turret fire point
	//     game.ctx.beginPath();
	//     game.ctx.arc(drawx, drawy, 2, 0, 2 * Math.PI, false);
	//     game.ctx.fillStyle = 'red';
	//     game.ctx.fill();
	// }

	
    // if shift button is held draw alternate stuff
    if( isHeld('shift') ){


    	//draw health bar
		var barw = 60;
		var barh = 6;

		game.ctx.beginPath();
		game.ctx.fillStyle = 'rgba(0,255,0,0.3)';
		game.ctx.rect(myTank.screenx - barw/2, myTank.screeny + 45, barw * (myTank.health/tanks_def[myTank.type].healthpool), barh);
		game.ctx.fill();

		game.ctx.beginPath();
		game.ctx.strokeStyle = 'rgba(0,255,0,0.1)';
		game.ctx.lineWidth = 2;
		game.ctx.rect(myTank.screenx - barw/2, myTank.screeny + 45, barw, barh);
		game.ctx.stroke();

		//draw health
		game.ctx.font = '13pt Calibri';
	    game.ctx.fillStyle = 'rgba(255,255,255,0.6)';
	    game.ctx.textAlign = 'center';
	    game.ctx.fillText(myTank.health + '/' + tanks_def[myTank.type].healthpool, myTank.screenx, myTank.screeny + 65);

		//draw name
	    game.ctx.fillText(myTank.name, myTank.screenx, myTank.screeny - 45);
	}
}



Tank.prototype.rotateTurret = function(){
	var angledif = this.angle - this.prevangle;
	this.turret.angle = game.normalizeAngle( this.turret.angle + angledif );

	if( mouseactive ){
		

		//calculate angle between tower and its target
		var testangle = Math.atan2( mouseY - this.screeny, mouseX - this.screenx );
		testangle = game.normalizeAngle( testangle );

		if( this.turret.angle > testangle ){
			if( this.turret.angle-testangle > Math.PI ){
				this.turret.angle += this.turret.rotationspeed;
			} else {
				if( this.turret.angle - testangle < this.turret.rotationspeed ){
					this.turret.angle = testangle;
				} else {
					this.turret.angle -= this.turret.rotationspeed;
				}
			}
		} else if ( this.turret.angle < testangle ){
			if( testangle - this.turret.angle > Math.PI ){
				this.turret.angle -= this.turret.rotationspeed;
			} else {
				if( testangle - this.turret.angle < this.turret.rotationspeed ){
					this.turret.angle = testangle;
				} else {
					this.turret.angle += this.turret.rotationspeed;
				}
				
			}
		}
		
	}
}

Tank.prototype.openfire = function(){
	var ydiff = Math.abs( game.solvefory( this.turret.barrellength - this.turret.bulletradius, this.turret.angle ) );
	var xdiff = Math.abs( game.solveforx( this.turret.barrellength - this.turret.bulletradius, ydiff ) );

	var bullety = Math.abs( game.solvefory( this.turret.bulletvelocity, this.turret.angle ) );
	var bulletx = Math.abs( game.solveforx( this.turret.bulletvelocity, bullety ) );

	var xvel = 0;
	var yvel = 0;

	if( this.turret.angle > 0 && this.turret.angle < Math.PI/2 ){
		xvel = xdiff;
		yvel = ydiff;

	// southwest
	} else if( this.turret.angle > Math.PI/2 && this.turret.angle < Math.PI ){
		xvel = -1 * xdiff;
		yvel = ydiff;
		bulletx = -1 * bulletx;

	// northwest
	} else if( this.turret.angle > Math.PI && this.turret.angle < (3*Math.PI)/2 ){
		xvel = -1 * xdiff;
		yvel = -1 * ydiff;
		bulletx = -1 * bulletx;
		bullety = -1 * bullety;

	// northeast
	} else if( this.turret.angle > (3*Math.PI/2) && this.turret.angle <= 2*Math.PI ){
		xvel = xdiff;
		yvel = -1 * ydiff;
		bullety = -1 * bullety;

	// east
	} else if( this.turret.angle == 0 ){
		xvel = xdiff;

	// north
	} else if( this.turret.angle == Math.PI/2 ){
		yvel = ydiff;

	// west
	} else if( this.turret.angle == Math.PI ){
		xvel = -1 * xdiff;
		bulletx = -1 * bulletx;

	// south
	} else if( this.turret.angle == (3*Math.PI)/2 ){
		yvel = -1 * ydiff;
		bullety = -1 * bullety;
	}

	this.turret.firex = this.x + xvel;
	this.turret.firey = this.y + yvel;

	game.addProjectile(this.turret.firex, this.turret.firey, bulletx, bullety);
}