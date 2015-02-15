"use strict";
// =================================================================
var createShaderEmbedded = function(gl, id) {

	var tag = document.getElementById(id);
	if (!tag) throw("ERROR: Unknown Script Tag ID : " + id);

	var shaderType = {"Vertex-Shader":gl.VERTEX_SHADER, "Fragment-Shader":gl.FRAGMENT_SHADER}
	var type = shaderType[tag.type];
	if (type === undefined) {
		throw("ERROR: Unknown Shader Type");
		return null;
	}

	var src = tag.text;
	var getShader = function(src, type){
		var shader = gl.createShader(type);
		gl.shaderSource(shader, src);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.log("ERROR: Compiling Shader [" + shader + "] : " + gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			return null;
		}

		return shader;
	}

	return getShader(src, type);
};

// =================================================================
var createProgram = function(gl, shaders, attribs, locations) {

	var program = gl.createProgram();

	for (var i = 0; i < shaders.length; i++) {
		gl.attachShader(program, shaders[i]);
	}

	if (attribs) {
		for (var i = 0; i < attribs.length; i++) {
			gl.bindAttribLocation(program, locations ? locations[i] : i, attribs[i]);
		}
	}

	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.log("ERROR: Linking Program : " + gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
		return null;
	}

	return program;
};

// =================================================================
var getContext = function(id, width, height){
	var canvas = document.getElementById(id);

	var errorStatus = "";
	function onContextCreationError(event) {
		canvas.removeEventListener("webglcontextcreationerror", onContextCreationError, false);
		errorStatus = e.statusMessage || "Unknown";
	}
	canvas.addEventListener("webglcontextcreationerror", onContextCreationError, false);

	gl = canvas.getContext("experimental-webgl");
	if(!gl) alert("ERROR: WebGL Context Not Created : " + errorStatus);

	canvas.width = width;
	canvas.height = height;
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

	return gl;
}

var getProgram = function(gl){

	var vertexShader = createShaderEmbedded(gl, "VertexShader");
	var fragmentShader = createShaderEmbedded(gl, "FragmentShader");
	var program = createProgram(gl, [vertexShader, fragmentShader]);
	gl.useProgram(program);	

	return program;
}