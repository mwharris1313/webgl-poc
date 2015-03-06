"use strict";
var log = console.log.bind(console);
var g, gl, program;

g = {
	surface: {width:640, height:360},
	tile: {width:32, height:32},
};

var image;
var posX = 0;
var posY = 0;
// =================================================================
window.onload = function(){

	init();

	image = new Image();
	image.src = "../assets/tile32x32_640x360.png";
	image.onload = function() {
		window.requestAnimationFrame(render);
		//startDrawing(img);
	}
}


// =================================================================
function init(){

	var canvas = document.getElementById('glCanvas');

	var errorStatus = "";
	function onContextCreationError(event) {
		canvas.removeEventListener("webglcontextcreationerror", onContextCreationError, false);
		errorStatus = e.statusMessage || "Unknown";
	}
	canvas.addEventListener("webglcontextcreationerror", onContextCreationError, false);

	gl = canvas.getContext("experimental-webgl");
	if(!gl) alert("ERROR: WebGL Context Not Created : " + errorStatus);

	canvas.width = g.surface.width;
	canvas.height = g.surface.height;
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

	var vertexShader = createShaderEmbedded(gl, "VertexShader");
	var fragmentShader = createShaderEmbedded(gl, "FragmentShader");
	program = createProgram(gl, [vertexShader, fragmentShader]);
	gl.useProgram(program);

}


// =================================================================
function render() {
	requestAnimationFrame(render);

	// look up where the vertex data needs to go.
	var positionLocation = gl.getAttribLocation(program, "inPosition");
	var texCoordLocation = gl.getAttribLocation(program, "inTexCoord");

	// uniforms
	var surfaceLocation = gl.getUniformLocation(program, "uSurface");
	gl.uniform2f(surfaceLocation, g.surface.width, g.surface.height);


	var tw = g.tile.width / g.surface.width;
	var th = g.tile.height / g.surface.height;

	// provide texture coordinates for the rectangle.
	var texCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([
			0.0, 0.0,
			tw, 0.0,
			0.0, th,
			0.0, th,
			tw, 0.0,
			tw, th,

			0.0, 0.0,
			tw, 0.0,
			0.0, th,
			0.0, th,
			tw, 0.0,
			tw, th,

			0.0, 0.0,
			tw, 0.0,
			0.0, th,
			0.0, th,
			tw, 0.0,
			tw, th,

			0.0, 0.0,
			tw, 0.0,
			0.0, th,
			0.0, th,
			tw, 0.0,
			tw, th,

		]),
		gl.STATIC_DRAW
	);

	gl.enableVertexAttribArray(texCoordLocation);
	gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Set the parameters so we can render any size image.
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); // image into the texture.


	// Create a buffer for the position of the rectangle corners.
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	// Set an image's position and dimensions. 
	var setTile = function(x, y, width, height, arr){
		var x1,y1,x2,y2;
		x1 = x;
		x2 = x + width;
		y1 = y;
		y2 = y + height;

		arr.push(
				x1, y1,
				x2, y1,
				x1, y2,
				x1, y2,
				x2, y1,
				x2, y2
		);

	}

	var array = [];
	setTile(0,0,32,32,array);
	setTile(32,32,32,32,array);
	setTile(64,64,32,32,array);
	setTile(96,96,32,32,array);

	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(array),
		gl.STATIC_DRAW
	);
	//setImage(4, 4, g.tile.width, g.tile.height);

	// -----------------------------------------------------------------
	// trying to draw scaled image on gl canvas

	//setImage(0, 0, image.width, image.height);



	//setImage(160, 90, 320, 180);
	var numVerts = array.length / 2;
	gl.drawArrays(gl.TRIANGLES, 0, numVerts);

	// -----------------------------------------------------------------

}

// =================================================================
