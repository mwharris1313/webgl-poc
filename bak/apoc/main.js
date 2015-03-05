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

}

var log = console.log.bind(console);