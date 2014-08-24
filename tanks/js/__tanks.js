var beta1 = new Image();
beta1.src = 'img/tanks/beta1.png';

var beta2 = new Image();
beta2.src = 'img/tanks/beta2.png';

var beta3 = new Image();
beta3.src = 'img/tanks/beta3.png';

var beta4 = new Image();
beta4.src = 'img/tanks/beta4.png';

var hull_beta1 = new Image();
hull_beta1.src = 'img/tanks/hull_beta1.png';

// tank defaults
var tanks_def = {

	beta1: {
		turretlength: 50,
		speed: 4,
		image: beta1,
		reversespeed: 2,
		rotationspeed: 0.02,
		speedmodifier: 0.7,
		healthpool: 100,
		treads: 'beta1'
	},

	beta2: {
		firedelay: 50,
		turretlength: 50,
		speed: 4,
		image: beta2,
		reversespeed: 2,
		rotationspeed: 0.02,
		speedmodifier: 0.7,
		healthpool: 100,
		treads: 'beta1'
	},

	beta3: {
		firedelay: 50,
		turretlength: 50,
		speed: 4,
		image: beta3,
		reversespeed: 2,
		rotationspeed: 0.02,
		speedmodifier: 0.7,
		healthpool: 100,
		treads: 'beta1'
	},

	beta4: {
		firedelay: 50,
		turretlength: 50,
		speed: 120,
		image: hull_beta1,
		reversespeed: 60,
		rotationspeed: 2.4,
		speedmodifier: 0.7,
		healthpool: 100,
		treads: 'beta1'
	}
}