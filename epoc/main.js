"use strict";
var log = console.log.bind(console);
//var g, gl, program;
var g, gl, program;

g = {
	surface: {width:640, height:360},
	isOddFrame: false
};

// =================================================================
window.onload = function(){

	gl = getContext("glCanvas", 640, 360);
	program = getProgram(gl);

	loadImages(["image1.png", "image2.png"], render);
}

// =================================================================
function render(images) {
	var renderWrapper = function(){render(images);};
	requestAnimationFrame(renderWrapper);
	//console.log("test");

	// look up where the vertex data needs to go.
	var positionLocation = gl.getAttribLocation(program, "a_position");
	var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

	// provide texture coordinates for the rectangle.
	var texCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		// 0.0,  0.0,
		// 1.0,  0.0,
		// 0.0,  1.0,
		// 0.0,  1.0,
		// 1.0,  0.0,
		// 1.0,  1.0
		0.0,  0.0,
		0.5,  0.0,
		0.0,  0.5,
		0.0,  0.5,
		0.5,  0.0,
		0.5,  0.5
	]), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(texCoordLocation);
	gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

	  // create 2 textures
	var textures = [];
	for (var ii = 0; ii < 2; ++ii) {
		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// Set the parameters so we can render any size image.
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

		// Upload the image into the texture.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[ii]);

		// add the texture to the array of textures.
		textures.push(texture);
	}

	// lookup uniforms
	var resolutionLocation = gl.getUniformLocation(program, "u_resolution");

	// lookup the sampler locations.
	var u_image0Location = gl.getUniformLocation(program, "u_image0");
	var u_image1Location = gl.getUniformLocation(program, "u_image1");

	// set the resolution
	gl.uniform2f(resolutionLocation, g.surface.width, g.surface.height);

	// set which texture units to render with.
	gl.uniform1i(u_image0Location, 0);  // texture unit 0
	gl.uniform1i(u_image1Location, 1);  // texture unit 1

	// Set each texture unit to use a particular texture.
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, textures[0]);



	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, textures[1]);

	// Create a buffer for the position of the rectangle corners.
	var positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	// Set a rectangle the same size as the images.
	setRectangle(gl, 40, 0, images[0].width, images[0].height);
	gl.drawArrays(gl.TRIANGLES, 0, 6);

	// Draw the rectangle.

}

function randomInt(range) {
	return Math.floor(Math.random() * range);
}

function setRectangle(gl, x, y, width, height) {
	var x1 = x;
	var x2 = x + width;
	var y1 = y;
	var y2 = y + height;
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		x1, y1,
		x2, y1,
		x1, y2,
		x1, y2,
		x2, y1,
		x2, y2
	]), gl.STATIC_DRAW);
}


// =================================================================
