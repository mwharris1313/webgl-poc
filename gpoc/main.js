"use strict";
var log = console.log.bind(console);
//var g, gl, program;
var g, gl, program;

g = {
	surface: {width:640, height:360},
	tile: {width: 32, height: 32},
	isOddFrame: false
};

var taCol = 1;
// =================================================================
window.onload = function(){

	gl = getContext("glCanvas", 640, 360);
	program = getProgram(gl);

	loadImages(["atlas2048_32.png","atlas2048_32.png"], render);
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

	taCol++;
	//var thisTile = getTile(1,5);
	var thisTile = getTile(1, taCol % 64);

	gl.bufferData(gl.ARRAY_BUFFER, thisTile, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(texCoordLocation);
	gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

	  // create 2 textures
	var textures = [];
	for (var i = 0; i < 1; i++) {
		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// Set the parameters so we can render any size image.
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

		// Upload the image into the texture.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);

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
	//setRectangle(gl, 0, 0, images[0].width, images[0].height);

	setTile(2,4);
	gl.drawArrays(gl.TRIANGLES, 0, 6);

	// Draw the rectangle.
}

function randomInt(range) {
	return Math.floor(Math.random() * range);
}

// =================================================================
// set tiles row,col position on drawing surface
function setTile(row, col) {
	var x1 = (col-1) * g.tile.width;
	var x2 = (col-1) * g.tile.width + g.tile.width;
	var y1 = (row-1) * g.tile.height;
	var y2 = (row-1) * g.tile.height + g.tile.height;
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
// return specific tile in texture atlas
var getTile = function(row, col){

	var width = 1 / 64.0;
	var height = 1 / 64.0;
	var xoffset = (col-1) * width;
	var yoffset = (row-1) * height;
	var xn = xoffset + width;
	var yn = yoffset + height;

	var xOffset = 0;
	var yOffset = 0;
	var xTL	= xoffset;
	var yTL	= yn;
	var xTR	= xn;
	var yTR	= yn;
	var xBL	= xoffset;
	var yBL	= yoffset;
	var xBR	= xn;
	var yBR	= yoffset;

	return new Float32Array([
		xBL, yBL,
		xBR, yBR,
		xTL, yTL,
		xTL, yTL,
		xBR, yBR,
		xTR, yTR
	]);

}

// =================================================================
