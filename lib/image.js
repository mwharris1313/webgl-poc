// ###############################################################################
"use strict";
// ###############################################################################
var thisFile = 'image.js';

var image = {};
image.img = {};
image.img['atlas'] = {filename:"../assets/atlas2048_32.png",file:undefined};
image.img['blank'] = {filename:"../assets/eagle_640x360.png",file:undefined};
image.keys = Object.keys(image.img);
image.loadCounter = 0;

// ***********************************************************
image.load = function(callback) {
    var thisFunc = 'image.load()';
    dbg.func(thisFile, thisFunc);

    for (var i=0; i<image.keys.length; i++){

	    image.img[image.keys[i]].file = new Image();
	    image.img[image.keys[i]].file.src = image.img[image.keys[i]].filename;
	    image.img[image.keys[i]].file.onload = function() {
	    	image.loadCounter++;
	    	if (image.loadCounter === image.keys.length) callback();
	    }

    }
}

// ***********************************************************
