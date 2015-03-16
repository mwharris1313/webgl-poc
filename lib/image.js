// ###############################################################################
"use strict";
// ###############################################################################
var thisFile = 'image.js';

var image = {};
image.arr = [
    {filename:"../assets/eagle_640x360.png",file:undefined},
    {filename:"../assets/placeholder_640x360.png",file:undefined},
    {filename:"../assets/r_640x360.png",file:undefined},
    {filename:"../assets/g_640x360.png",file:undefined},

    {filename:"../assets/b_640x360.png",file:undefined},
    {filename:"../assets/atlas2048_32.png",file:undefined},
    {filename:"../assets/atlas2048_32.png",file:undefined},
    {filename:"../assets/level_256x256.png",file:undefined},

];

image.loadCounter = 0;
image.textureCount = 0;

// ***********************************************************
image.load = function(callback) {
    var thisFunc = 'image.load()';
    dbg.func(thisFile, thisFunc);


    for (var layer=0; layer<image.arr.length; layer++){
        var obj = image.arr[layer];

	    obj.file = new Image();
	    obj.file.src = obj.filename;
	    obj.file.onload = function() {
	    	image.loadCounter++;
	    	if (image.loadCounter === image.arr.length) callback();
	    }

    }
}

// ***********************************************************
image.initTexture = function(layer, tPositionLocation) {
    var thisFunc = 'image.initTexture()';
    dbg.func(thisFile, thisFunc);

    // ------------------------------------------------------------------------
    var obj = image.arr[layer];

    obj.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, obj.texture);
    obj.texture.width = 640;
    obj.texture.height = 360;

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    obj.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);

    // Set an image's position and dimensions. 
    var setTile = function(width,height,arr){
        var thisFunc = 'setTile()';
        dbg.func(thisFile, thisFunc);

        var x1,y1,x2,y2,x,y,tw,th,xZoom,yZoom;
        xZoom = 1;
        yZoom = 1;
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
    tWidth = obj.file.width;
    tHeight = obj.file.height;

    obj.array = [];
    setTile(tWidth, tHeight, obj.array);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(obj.array),
        gl.STATIC_DRAW
    );

    gl.bindTexture(gl.TEXTURE_2D, obj.texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, obj.file);
 

    gl.enableVertexAttribArray(tPositionLocation);
    gl.vertexAttribPointer(tPositionLocation, 2, gl.FLOAT, false, 0, 0);

    obj.location = gl.getUniformLocation(program, 'layer'+layer);
    obj.textureNumber = image.textureCount;
    image.textureCount++;
    obj.textureUnit = gl.TEXTURE0 + layer;

    gl.uniform1i(obj.location, layer);
    gl.activeTexture(gl.TEXTURE0 + layer);

    obj.WHLocation = gl.getUniformLocation(program, 'layer'+layer+'WH');
    gl.uniform2f(obj.WHLocation, obj.file.width, obj.file.height);

    gl.bindTexture(gl.TEXTURE_2D, obj.texture);

}

// ***********************************************************