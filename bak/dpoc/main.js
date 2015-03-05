"use strict";
var log = console.log.bind(console);
var g, gl, program;

g = {
	surface: {width:640, height:360}
};

var image;
var posX = 0;
var posY = 0;
// =================================================================
window.onload = function(){

	init();

	image = new Image();
	image.src = "image.png";
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
	var positionLocation = gl.getAttribLocation(program, "aPosition");
	var texCoordLocation = gl.getAttribLocation(program, "aTexCoord");

	// lookup uniforms
	var resolutionLocation = gl.getUniformLocation(program, "uResolution");

	// set the resolution
	gl.uniform2f(resolutionLocation, g.surface.width, g.surface.height);

	// provide texture coordinates for the rectangle.
	var texCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([
			0.0, 0.0,
			1.0, 0.0,
			0.0, 1.0,
			0.0, 1.0,
			1.0, 0.0,
			1.0, 1.0]),
		gl.STATIC_DRAW
	);

	gl.enableVertexAttribArray(texCoordLocation);
	gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

	// Create a texture.
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Set the parameters so we can render any size image.
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	// Upload the image into the texture.
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);


	// Create a buffer for the position of the rectangle corners.
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	// Set an image's position and dimensions. 
	var setImage = function(x, y, width, height){
		var x1 = x;
		var x2 = x + width;
		var y1 = y;
		var y2 = y + height;
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([
				x1, y1,
				x2, y1,
				x1, y2,
				x1, y2,
				x2, y1,
				x2, y2
			]),
			gl.STATIC_DRAW
		);
	}

	// -----------------------------------------------------------------
	// trying to draw scaled image multiple times on gl canvas
	// some tiles randomly show or hide.

	posX += Math.floor(Math.random()*2) === 0 ? -2: 2;
	posY += Math.floor(Math.random()*2) === 0 ? -2: 2;

	var width = image.width;
	var height = image.height;
	for (var x=0; x<14*width; x+=width){
		for (var y=0; y<8*height; y+=height){
			if (Math.floor(Math.random()*2) === 1) {
				setImage(x+posX, y+posY, width, height);
				gl.drawArrays(gl.TRIANGLES, 0, 6);

			}
		}
	}

	// -----------------------------------------------------------------

}

// =================================================================
