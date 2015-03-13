// ###############################################################################
"use strict";
// ###############################################################################
var thisFile = 'main.js';

//var texArray = [];
var screenVertexArray = [];

//var texCoordBuffer;
var screenVertexBuffer;

var array = [];
var atlasTexture;
var buffer;
var frameBuffer;
var image;
var atlas;
var tileMap;
var tileMapTexture;
var tileMapBuffer;
var tileMapArray = [];
var tileMapImage;

// look up where the vertex data needs to go.
var positionLocation;
var screenVertexLocation;
var screenLocation;
var mouseLocation;
var cameraLocation;
var tileLocation;

var atlasTextureLocation;
var tileMapTextureLocation;



var posX = 0;
var posY = 0;


// ***********************************************************
window.onload = function(){
    var thisFunc = 'windows.onload()';
    dbg.func(thisFile, thisFunc);

    image.load(init);

}

// **************************************************************************************************
function init(){
    var thisFunc = 'init()';
    dbg.func(thisFile, thisFunc);

    initGL();
    initEvents();
    initUniforms();
    initScreenVertexBuffer();
    initBuffers();

    window.requestAnimationFrame(render);
}

// ***********************************************************
function initGL(){
    var thisFunc = 'initGL()';
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

}

// ***********************************************************
function initEvents(){
    var thisFunc = 'initEvents()';
    dbg.func(thisFile, thisFunc);

    // -----------------------------------------------------------------
    var xy = mouse.canvasXY(canvas);
    g.canvas.offsetLeft = xy[0];
    g.canvas.offsetTop = xy[1];

    // -----------------------------------------------------------------
    //document.addEventListener('keydown',    onkeydown,    false);
    //document.addEventListener('keyup',      onkeyup,      false);
    canvas.addEventListener('click', mouse.onClick, false);
    canvas.addEventListener('mousemove', mouse.onMouseMove, false);
    canvas.addEventListener('touchstart', mouse.onTouchStart, false);
    canvas.addEventListener('touchmove', mouse.onTouchMove, false);

}

// ***********************************************************
function initUniforms(){
    var thisFunc = 'initUniforms()';
    dbg.func(thisFile, thisFunc);

    // look up where the vertex data needs to go.
    positionLocation = gl.getAttribLocation(program, "inPosition");
    screenVertexLocation = gl.getAttribLocation(program, "inScreenVertex");

    // uniforms
    screenLocation = gl.getUniformLocation(program, "uScreen");
    gl.uniform2f(screenLocation, g.screen.width, g.screen.height);

    mouseLocation = gl.getUniformLocation(program, "uMouse");
    gl.uniform2f(mouseLocation, g.mouse.x, g.mouse.y);

    cameraLocation = gl.getUniformLocation(program, "uCamera");
    gl.uniform2f(cameraLocation, g.camera.x, g.camera.y);


    var tileArray = [0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01];

    tileLocation = gl.getUniformLocation(program, "uTile");
    gl.uniform1fv(tileLocation, tileArray);

// GLfloat v[10] = {...};
// glUniform1fv(glGetUniformLocation(program, "v"), 10, v);

    // lookup the sampler locations.
    atlasTextureLocation = gl.getUniformLocation(program, "atlasTexture");
    tileMapTextureLocation = gl.getUniformLocation(program, "tileMapTexture");
    // set which texture units to render with.
    gl.uniform1i(atlasTextureLocation, 0);  // texture unit 0
    gl.uniform1i(tileMapTextureLocation, 1);  // texture unit 1
  // Set each texture unit to use a particular texture.
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, tileMapTexture);

}

// ***********************************************************
function initScreenVertexBuffer(){
    var thisFunc = 'initBuffers()';
    dbg.func(thisFile, thisFunc);

    // Set an image's position and dimensions. 
    var setScreenVertexArray = function(arr){
        var thisFunc = 'setScreenVertexArray()';
        dbg.func(thisFile, thisFunc);

        var x1,y1,x2,y2;
        x1 = 0;
        x2 = 1;
        y1 = 0;
        y2 = 1;

        arr.push(
                x1, y1,
                x2, y1,
                x1, y2,
                x1, y2,
                x2, y1,
                x2, y2
        );

    }

    setScreenVertexArray(screenVertexArray);
    screenVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, screenVertexBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(screenVertexArray),
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(screenVertexLocation);
    gl.vertexAttribPointer(screenVertexLocation, 2, gl.FLOAT, false, 0, 0);
}

// ***********************************************************
function initBuffers(){
    var thisFunc = 'initBuffers()';
    dbg.func(thisFile, thisFunc);

    // Set an image's position and dimensions. 
    var setTile = function(width,height,arr){
        var thisFunc = 'setTile()';
        dbg.func(thisFile, thisFunc);

        var x1,y1,x2,y2,x,y,tw,th,xZoom,yZoom;
        xZoom = 1;
        yZoom = 1;
        tw = xZoom * g.atlas.width;
        th = yZoom * g.atlas.height;
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



    atlasTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);

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

    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image.img['atlas'].file); // image into the texture.

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);


  // gl.activeTexture(gl.TEXTURE1);
  // gl.bindTexture(gl.TEXTURE_2D, textures[1]);




    tileMapTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tileMapTexture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Create a buffer for the position of the rectangle corners.
    tileMapBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tileMapBuffer);

    setTile(1,1,tileMapArray);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(tileMapArray),
        gl.STATIC_DRAW
    );

    gl.bindTexture(gl.TEXTURE_2D, tileMapTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image.img['blank'].file); // image into the texture.

    gl.bindBuffer(gl.ARRAY_BUFFER, tileMapBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, tileMapTexture);




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

    gl.uniform1i(atlasTextureLocation, 0);  // texture unit 0
    gl.uniform1i(tileMapTextureLocation, 1);  // texture unit 1

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, tileMapTexture);


        gl.uniform2f(mouseLocation, g.mouse.x, g.mouse.y);
        //gl.uniform2f(cameraLocation, g.mouse.x, g.mouse.y);


        //gl.bindBuffer(gl.ARRAY_BUFFER, texture);
        //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        // Create a framebuffer and attach the texture.
        frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        //gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tileMapTexture, 0);

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
