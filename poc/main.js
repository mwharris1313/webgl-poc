"use strict";
var log = console.log.bind(console);
var g, gl, program;

g = {
    screen: {width:640, height:360},
    tile: {width:32, height:32, rows:13, cols:21},
    frame: {count:0, tLast:0, profileCount:15, repeat:1},
    atlas: {width:2048, height:2048},
    toggle: {onClick:true}
};

var image;
var posX = 0;
var posY = 0;
// =================================================================
window.onload = function(){

    init();

    image = new Image();
    //image.src = "../assets/tile32x32_640x360.png";
    image.src = "../assets/atlas2048_32.png";
    image.onload = function() {
        window.requestAnimationFrame(render);
        //startDrawing(img);
    }

}

// =================================================================
var msPerFrame = function(){
    if(g.frame.count % g.frame.profileCount === 0) {
        var tTemp = window.performance.now();
        var dt = tTemp - g.frame.tLast;
        g.frame.tLast = tTemp;
        log(dt/g.frame.profileCount, 'ms/frame');
    }
    g.frame.count++;
}


function onClick(){
    log('onClick');
    g.toggle.onClick = !g.toggle.onClick;
    log('g.toggle.onClick', g.toggle.onClick); 
}
function onMouseMove(){
    log('onMouseMove');
}
function onTouchStart(){
    log('onTouchStart');
}
function onTouchMove(){
    log('onTouchMove');
}


// =================================================================
function init(){

    var canvas = document.getElementById('glCanvas');

    //document.addEventListener('keydown',    onkeydown,    false);
    //document.addEventListener('keyup',      onkeyup,      false);
    canvas.addEventListener('click', onClick, false);
    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('touchstart', onTouchStart, false);
    canvas.addEventListener('touchmove', onTouchMove, false);


    var errorStatus = "";
    function onContextCreationError(event) {
        canvas.removeEventListener("webglcontextcreationerror", onContextCreationError, false);
        errorStatus = e.statusMessage || "Unknown";
    }
    canvas.addEventListener("webglcontextcreationerror", onContextCreationError, false);

    gl = canvas.getContext("experimental-webgl");
    if(!gl) alert("ERROR: WebGL Context Not Created : " + errorStatus);

    canvas.width = g.screen.width;
    canvas.height = g.screen.height;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    var vertexShader = createShaderEmbedded(gl, "VertexShader");
    var fragmentShader = createShaderEmbedded(gl, "FragmentShader");
    program = createProgram(gl, [vertexShader, fragmentShader]);
    gl.useProgram(program);

}


// =================================================================
function render() {
    requestAnimationFrame(render);

    msPerFrame();

for (var repeat=0; repeat<g.frame.repeat; repeat++){


    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "inPosition");
    var texCoordLocation = gl.getAttribLocation(program, "inTexCoord");

    // uniforms
    var screenLocation = gl.getUniformLocation(program, "uScreen");
    gl.uniform2f(screenLocation, g.screen.width, g.screen.height);

    var miscLocation = gl.getUniformLocation(program, "uMisc");
    var xMisc = g.toggle.onClick ? 1.0 : 0.0;
    gl.uniform2f(miscLocation, xMisc, 1.0);



    // Set an image's position and dimensions. 
    var setTileTexture = function(col,row,arr){
        var x1,y1,x2,y2,x,y,tw,th;
        tw = g.tile.width / g.atlas.width;
        th = g.tile.height / g.atlas.height;
        x = (col-1)*tw;
        y = (row-1)*th;
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

    // Set an image's position and dimensions. 
    var setTileTextureNew = function(col,row,arr){
        var x1,y1,x2,y2,x,y,tw,th;
        tw = g.screen.width / g.atlas.width;
        th = g.screen.height / g.atlas.height;
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
    // Set an image's position and dimensions. 
    var setTileNew = function(row,col,arr){
        var x1,y1,x2,y2,x,y,tw,th;
        tw = g.screen.width;
        th = g.screen.height;
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

    var texArray = [];
    setTileTextureNew(1,1,texArray);

    // provide texture coordinates for the rectangle.
    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(texArray),
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
    var setTile = function(row,col,arr){
        var x1,y1,x2,y2,x,y,tw,th;
        tw = g.tile.width;
        th = g.tile.height;
        x = (col-1)*tw;
        y = (row-1)*th;
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

    var array = [];

    setTileNew(1,1,array);


    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(array),
        gl.STATIC_DRAW
    );

    var numVerts = array.length / 2;
    gl.drawArrays(gl.TRIANGLES, 0, numVerts);

    // -----------------------------------------------------------------
}

}

// =================================================================
