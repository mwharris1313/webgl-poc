// ###############################################################################
"use strict";
// ###############################################################################
var thisFile = 'global.js';

var log = console.log.bind(console);
var g, canvas, gl, program;

g = {
	isLogging: true,
	isLoggingFrequent: false,
    isDebug: true,
    isProfiling: true,
    screen: {width:640, height:360},
    //screen: {width:1280, height:720},
    tile: {width:32, height:32, rows:13, cols:21},
    frame: {count:0, tLast:0, profileCount:60, repeat:1},
    atlas: {width:2048, height:2048},
    toggle: {onClick:true},
    canvas: {offsetLeft:0,offsetTop:0},
    mouse: {x:0, y:0}
};

// ###############################################################################
