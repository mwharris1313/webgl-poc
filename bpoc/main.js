// WebGL spec available at https://www.khronos.org/registry/webgl/specs/1.0/
function main(){

	log("START main()...");

	var canvas = document.getElementById('glCanvas');

	var errorInfo = "";
	function onContextCreationError(event) {
		canvas.removeEventListener("webglcontextcreationerror", onContextCreationError, false);
		errorInfo = e.statusMessage || "Unknown";
	}
	canvas.addEventListener("webglcontextcreationerror", onContextCreationError, false);

	var gl = canvas.getContext("experimental-webgl");
	if(!gl) {
		alert("A WebGL context could not be created.\nReason: " + errorInfo);
	}

	canvas.width = 640;
	canvas.height = 360;
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

	// =======================================================================
	// setup a GLSL program

	var vertexShader = createShaderFromScriptElement(gl, "2d-vertex-shader");
	var fragmentShader = createShaderFromScriptElement(gl, "2d-fragment-shader");
	var program = createProgram(gl, [vertexShader, fragmentShader]);
	gl.useProgram(program);

	// look up where the vertex data needs to go.
	var positionLocation = gl.getAttribLocation(program, "a_position");

	// Create a buffer and put a single clipspace rectangle in it (2 triangles)
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(
		gl.ARRAY_BUFFER, 
		new Float32Array([
			-1.0, -1.0, 
			 1.0, -1.0, 
			-1.0,  1.0, 
			-1.0,  1.0, 
			 1.0, -1.0, 
			 1.0,  1.0]), 
		gl.STATIC_DRAW);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	// draw
	gl.drawArrays(gl.TRIANGLES, 0, 6);

	// =======================================================================
	log("END main()...");

}

var log = console.log.bind(console);