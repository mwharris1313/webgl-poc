// ###############################################################################
"use strict";
// ###############################################################################
var thisFile = 'image.js';

var image = {};
image.ref = {};

// image.ref['clear'] = {filename:"../assets/gray_640x360.png",file:undefined};
// image.ref['edit'] = {filename:"../assets/overlay_640x360.png",file:undefined};
// image.ref['atlas'] = {filename:"../assets/atlas2048_32.png",file:undefined};

image.ref['clear']	= {filename:"../assets/ra_640x360.png",file:undefined};
image.ref['atlas']	= {filename:"../assets/atlas2048_32.png",file:undefined};
image.ref['edit']	= {filename:"../assets/ba_640x360.png",file:undefined};

image.keys = Object.keys(image.ref);
image.loadCounter = 0;
image.textureCount = 0;

// ***********************************************************
image.load = function(callback) {
    var thisFunc = 'image.load()';
    dbg.func(thisFile, thisFunc);

    for (var i=0; i<image.keys.length; i++){

	    image.ref[image.keys[i]].file = new Image();
	    image.ref[image.keys[i]].file.src = image.ref[image.keys[i]].filename;
	    image.ref[image.keys[i]].file.onload = function() {
	    	image.loadCounter++;
	    	if (image.loadCounter === image.keys.length) callback();
	    }

    }
}

// ***********************************************************
image.initTexture = function(key, tPositionLocation) {
    var thisFunc = 'image.initTexture()';
    dbg.func(thisFile, thisFunc);

    // ------------------------------------------------------------------------


    image.ref[key].texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, image.ref[key].texture);
    image.ref[key].texture.width = 640;
    image.ref[key].texture.height = 360;

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    image.ref[key].buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, image.ref[key].buffer);

    // Set an image's position and dimensions. 
    var setTile = function(width,height,arr){
        var thisFunc = 'setTile()';
        dbg.func(thisFile, thisFunc);

        var x1,y1,x2,y2,x,y,tw,th,xZoom,yZoom;
        xZoom = 1;
        yZoom = 1;
        // tw = xZoom * g.atlas.width;
        // th = yZoom * g.atlas.height;
        // tw = xZoom * g.screen.width;
        // th = yZoom * g.screen.height;
        //log(key,image.ref[key].file.width);

        // tw = xZoom * width;
        // th = yZoom * height;
        tw = xZoom * g.screen.width;
        th = yZoom * g.screen.height;
        x = 0;
        y = 0;
        x1 = x;
        x2 = x + tw;
        y1 = y;
        y2 = y + th;

        arr.push(
                x1, y1,
                x2, y1,
                x1, y2,
                x1, y2,
                x2, y1,
                x2, y2
        );

    }

    var tWidth, tHeight;
    tWidth = image.ref[key].file.width;
    tHeight = image.ref[key].file.height;

    image.ref[key].array = [];
    setTile(tWidth, tHeight, image.ref[key].array);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(image.ref[key].array),
        gl.STATIC_DRAW
    );

    gl.bindTexture(gl.TEXTURE_2D, image.ref[key].texture);
	//gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.ref[key].texture.width, image.ref[key].texture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE,  image.ref[key].file);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image.ref[key].file);
 

    gl.enableVertexAttribArray(tPositionLocation);
    gl.vertexAttribPointer(tPositionLocation, 2, gl.FLOAT, false, 0, 0);

    image.ref[key].location = gl.getUniformLocation(program, key);
    image.ref[key].textureNumber = image.textureCount;
    image.textureCount++;
    image.ref[key].textureUnit = gl.TEXTURE0 + image.ref[key].textureNumber;

    gl.uniform1i(image.ref[key].location, image.ref[key].textureNumber);
    gl.activeTexture(image.ref[key].textureUnit);


    image.ref[key].WLLocation = gl.getUniformLocation(program, key+'WLLocation');
    gl.uniform2f(image.ref[key].WLLocation, image.ref[key].file.width, image.ref[key].file.height);

    gl.bindTexture(gl.TEXTURE_2D, image.ref[key].texture);


}

// ***********************************************************