"use strict";

var log = console.log.bind(console);

window.onload = function(){
	var image = new Image();
	image.src = "kitty.jpg";
	image.onload = function() {
	render(image);
	}
}

function render(image) {

	var canvas = document.getElementById('glCanvas');

	var errorInfo = "";
	function onContextCreationError(event) {
		canvas.removeEventListener("webglcontextcreationerror", onContextCreationError, false);
		errorInfo = e.statusMessage || "Unknown";
	}
	canvas.addEventListener("webglcontextcreationerror", onContextCreationError, false);

	var gl = canvas.getContext("experimental-webgl");
	if(!gl) alert("ERROR: WebGL Context Not Created : " + errorInfo);

	canvas.width = 640;
	canvas.height = 360;
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

	var vertexShader = createShaderEmbedded(gl, "VertexShader");
	var fragmentShader = createShaderEmbedded(gl, "FragmentShader");
	var program = createProgram(gl, [vertexShader, fragmentShader]);
	gl.useProgram(program);

	// -------------------------------------------------------------------- From Tutorial Example for further study
	// look up where the vertex data needs to go.
	var positionLocation = gl.getAttribLocation(program, "a_position");
	var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

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

	// lookup uniforms
	var resolutionLocation = gl.getUniformLocation(program, "u_resolution");

	// set the resolution
	gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

	// Create a buffer for the position of the rectangle corners.
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	// Set a rectangle the same size as the image.
	var setRectangle = function(gl, x, y, width, height){
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
	setRectangle(gl, 0, 0, image.width, image.height);

	// Draw the rectangle.
	gl.drawArrays(gl.TRIANGLES, 0, 6);
	// --------------------------------------------------------------------

}
