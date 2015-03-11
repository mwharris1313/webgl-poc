// ###############################################################################
"use strict";
// ###############################################################################
var thisFile = 'main.js';

var texArray = [];
var texCoordBuffer;
var array = [];
var texture;
var buffer;
var frameBuffer;
var image;
var atlas;

// look up where the vertex data needs to go.
var positionLocation;
var texCoordLocation;
var screenLocation;
var mouseLocation;

var posX = 0;
var posY = 0;

// ***********************************************************
window.onload = function(){
    var thisFunc = 'windows.onload()';
    dbg.func(thisFile, thisFunc);

    atlas = new Image();
    atlas.src = "../assets/atlas2048_32.png";
    atlas.onload = function() {

    // image = new Image();
    // image.src = "../assets/atlas2048_32.png";
    // image.onload = function() {
    //     window.requestAnimationFrame(render);
        init();
    }

}

// ***********************************************************
// Set an image's position and dimensions. 
var setTileTexture = function(col,row,arr){
    var thisFunc = 'setTileTexture()';
    dbg.func(thisFile, thisFunc);

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

// ***********************************************************
// Set an image's position and dimensions. 
var setTile = function(row,col,arr){
    var thisFunc = 'setTile()';
    dbg.func(thisFile, thisFunc);

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

// **************************************************************************************************
function init(){
    var thisFunc = 'init()';
    dbg.func(thisFile, thisFunc);

    // -----------------------------------------------------------------
    canvas = document.getElementById('glCanvas');

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

    // -----------------------------------------------------------------
    var xy = mouse.canvasXY(canvas);
    g.canvas.offsetLeft = xy[0];
    g.canvas.offsetTop = xy[1];
    log(g.canvas.offsetLeft,g.canvas.offsetTop);

    // -----------------------------------------------------------------
    //document.addEventListener('keydown',    onkeydown,    false);
    //document.addEventListener('keyup',      onkeyup,      false);
    canvas.addEventListener('click', mouse.onClick, false);
    canvas.addEventListener('mousemove', mouse.onMouseMove, false);
    canvas.addEventListener('touchstart', mouse.onTouchStart, false);
    canvas.addEventListener('touchmove', mouse.onTouchMove, false);

    // provide texture coordinates for the rectangle.
    texCoordBuffer = gl.createBuffer();

    // look up where the vertex data needs to go.
    positionLocation = gl.getAttribLocation(program, "inPosition");
    texCoordLocation = gl.getAttribLocation(program, "inTexCoord");

    // uniforms
    screenLocation = gl.getUniformLocation(program, "uScreen");
    gl.uniform2f(screenLocation, g.screen.width, g.screen.height);

    mouseLocation = gl.getUniformLocation(program, "uMouse");
    gl.uniform2f(mouseLocation, g.mouse.x, g.mouse.y);


    setTileTexture(1,1,texArray);

    // provide texture coordinates for the rectangle.
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(texArray),
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Create a buffer for the position of the rectangle corners.
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    setTile(1,1,array);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(array),
        gl.STATIC_DRAW
    );

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas); // image into the texture.

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    window.requestAnimationFrame(render);

}

// ***********************************************************
/*
    Source for further research on Render-To-Texture:
    (http://www.opengl-tutorial.org/intermediate-tutorials/tutorial-14-render-to-texture/)
    (http://stackoverflow.com/questions/16287481/webgl-display-framebuffer)
*/

// **************************************************************************************************
// **************************************************************************************************
// **************************************************************************************************
function render() {
    var thisFunc = 'render()';
    dbg.funcFreq(thisFile, thisFunc);

    requestAnimationFrame(render);
    dbg.msPerFrame(thisFile, thisFunc);

    // can't find a way to disable vsync,
    // only way to gauge performance in efficient performance scenarios (beyond 60fps)
    // by running render loop multiple times, increasing until it dips below 17ms per frame
    for (var repeat=0; repeat<g.frame.repeat; repeat++){

        gl.uniform2f(mouseLocation, g.mouse.x, g.mouse.y);

        //gl.bindBuffer(gl.ARRAY_BUFFER, texture);
        //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        // Create a framebuffer and attach the texture.
        frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        //gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clearColor(1, 0, 1, 1); // red
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // -----------------------------------------------------------------
    } // for loop, repeat

}

// **************************************************************************************************
// **************************************************************************************************
// **************************************************************************************************

// ###############################################################################