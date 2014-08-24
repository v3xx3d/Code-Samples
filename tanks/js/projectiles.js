var projectileList = [];
var bulletvelocity = 10;

function Projectile(x1,y1,deltax,deltay){
	this.x = x1;
	this.y = y1;
	this.deltax = deltax;
	this.deltay = deltay;
	this.radius = 2;
	
	this.attackpower = 5;
}

Projectile.prototype.process = function(index){
	this.x += this.deltax;
	this.y += this.deltay;
	
	//if projectile leaves the map remove it
	if( this.x > mapwidth || this.x < 0 || this.y > mapheight || this.y < 0 ){
		projectileList.splice(index, 1);
	} else {
		//check for collisions
		// fancy Separating Axis Theorem
		for(p = 0; p < enemyTankList.length; p++){

			if( game.solveHypotenuse( Math.abs(this.x - enemyTankList[p].x), Math.abs(this.y - enemyTankList[p].y)) < this.radius + enemyTankList[p].radius ){


				var axiscollisions = 0;
				var axis = [{},{},{}];
				var points = ['point_fr', 'point_fl', 'point_rr', 'point_rl'];

				// find point closest to circle
				var closest_point = 'point_fr';
				var hlength = game.solveHypotenuse( Math.abs(this.x - enemyTankList[p].point_fr.x), Math.abs(this.y - enemyTankList[p].point_fr.y) );
				var newh;
				for( var n = 1; n < points.length; n++ ){
					newh = game.solveHypotenuse( Math.abs(this.x - enemyTankList[p][points[n]].x), Math.abs(this.y - enemyTankList[p][points[n]].y) )
					if( newh < hlength ){
						closest_point = points[n];
						hlength = newh;
					}
				}
				
				// circle axis
				axis[0].x = this.x - enemyTankList[p][closest_point].x;
				axis[0].y = this.y - enemyTankList[p][closest_point].y;

				// tank axis 1
				axis[1].x = enemyTankList[p].point_fl.x - enemyTankList[p].point_rl.x;
				axis[1].y = enemyTankList[p].point_fl.y - enemyTankList[p].point_rl.y;

				// tank axis 2
				axis[2].x = enemyTankList[p].point_fl.x - enemyTankList[p].point_fr.x;
				axis[2].y = enemyTankList[p].point_fl.y - enemyTankList[p].point_fr.y;
				

				// loop through each axis
				for( var a = 0; a < axis.length; a++ ){
					var box = [];
					var circle = [];


					// plot points for tank along current axis
					for( var b = 0; b < points.length; b++ ){
						var idk = (enemyTankList[p][points[b]].x * axis[a].x + enemyTankList[p][points[b]].y * axis[a].y) / ((axis[a].x * axis[a].x) + (axis[a].y * axis[a].y));
						var projx = idk * axis[a].x;
						var projy = idk * axis[a].y;

						var scalar = ( projx * axis[a].x ) + (projy * axis[a].y );

						box.push(scalar);
					}


					// plot circle on current axis
					var idk = (this.x * axis[a].x + this.y * axis[a].y) / ((axis[a].x * axis[a].x) + (axis[a].y * axis[a].y));
					var projx = idk * axis[a].x;
					var projy = idk * axis[a].y;

					var scalar = ( projx * axis[a].x ) + (projy * axis[a].y );

					circle.push(scalar);

					var min_box = Math.min.apply(null,box);
					var max_box = Math.max.apply(null,box);

					var min_circle = Math.min.apply(null,circle);
					var max_circle = Math.max.apply(null,circle);

					// if
					// minb <= maxa && mina <= maxb
					// there is an overlap on this axis

					// if minb > maxa || mina > maxb

					if( min_circle <= max_box && min_box <= max_circle ){
						axiscollisions++;
					}
				}

				if( axiscollisions == 3 ){
					enemyTankList[p].health -= this.attackpower;
					myTank.damageDealt += this.attackpower;
					projectileList.splice(index,1);

					if( enemyTankList[p].health <= 0 ){
						myTank.tanksDestroyed++;
						enemyTankList.splice(p,1);
					}
				}

			}
			
		}
	}
}


Projectile.prototype.draw = function(){
	//draw turret fire point
    var curx = myTank.x;
	var cury = myTank.y;

	var sx = myTank.screenx;
	var sy = myTank.screeny;

	var relx = projectileList[o].x - curx;
	var rely = projectileList[o].y - cury;

	if( Math.abs(relx) < width && Math.abs(rely) < height ){

		var drawx = sx + relx;
		var drawy = sy + rely;

		game.ctx.fillStyle = "white";
		game.ctx.beginPath();
		game.ctx.arc(drawx, drawy, projectileList[o].radius, 0, Math.PI*2, true);
		game.ctx.closePath();
		game.ctx.fill();
	}
}


