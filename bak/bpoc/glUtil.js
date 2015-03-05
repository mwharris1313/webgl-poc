"use strict";

var createShaderEmbedded = function(gl, id) {

	var tag = document.getElementById(id);
	if (!tag) throw("ERROR: Unknown Tag ID : " + id);

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
