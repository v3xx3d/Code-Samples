//http://www.youtube.com/watch?v=aIrrdL6ydjs
//console.log();

"use strict";
var game = {};

var width = 0;
var height = 0;

var mapwidth = 6000;
var mapheight = 6000;

var minimapwidth = 140;
var minimapheight = 140;
var minimappadding = 5;

var gridwidth = 20;

var frameRate = 60;
var frames = 0;

var paused = false;



window.onload = function(){

	game = new game_core();

	game.viewport = document.getElementById("viewport");
	game.ctx = game.viewport.getContext("2d");

	game.resizeHandler();
	
	game.initGame();
	game.processLoop(new Date().getTime());
}

window.onresize = function() { game.resizeHandler(); };
