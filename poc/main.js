// ###############################################################################
"use strict";
// ###############################################################################
var thisFile = 'main.js';

//var texArray = [];
var screenVertexBuffer, screenVertexArray = [], screenVertexLocation;
var tileMapTexture, tileMapBuffer, tileMapArray = [], tileMapTextureLocation;

var positionLocation;
var screenLocation;
var mouseLocation;
var cameraLocation;
var tileLocation;

var isFirstLocation = 0.0;

var frameBuffer;

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
    initTextures();

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
    //gl = canvas.getContext("experimental-webgl");
    gl = canvas.getContext("experimental-webgl", {alpha: false});
    //gl = canvas.getContext("experimental-webgl", {premultipliedAlpha: false});

    if(!gl) alert("ERROR: WebGL Context Not Created : " + errorStatus);

    canvas.width = g.screen.width;
    canvas.height = g.screen.height;
    //gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.viewport(0, 0, canvas.width, canvas.height);

    var vertexShader = createShaderEmbedded(gl, "VertexShader");
    var fragmentShader = createShaderEmbedded(gl, "FragmentShader");
    program = createProgram(gl, [vertexShader, fragmentShader]);
    gl.useProgram(program);

    //gl.enable(gl.DEPTH_TEST);
    //gl.depthFunc(gl.LESS);

    //gl.enable(gl.BLEND);
    //gl.disable(gl.DEPTH_TEST);
    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    //gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

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

    isFirstLocation = gl.getUniformLocation(program, "uIsFirst");
    gl.uniform1f(isFirstLocation, 0.0);

    // GLfloat v[10] = {...};
    // glUniform1fv(glGetUniformLocation(program, "v"), 10, v);

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
function initTextures(){
    var thisFunc = 'initBuffers()';
    dbg.func(thisFile, thisFunc);

    for (var i=0; i<8; i++) {
        image.initTexture(i, positionLocation);
    }

    // Eight texture layers, layers 0-7
    // 0:R "value", background    usually for terrain ,or background parallax if layer 1 is used for terrain 
    // 1:G underlay      usually for terrain
    // 2:B foreground    usually for players and mobs or active objects are drawn
    // 3:A overlay       usually for translucent clouds drawn (when in overhead perspective)
    // 4: 
    // 5: tile atlas B  can be used for player/mob animations/spritesheets or dynamic tiles
    // 6: tile atlas A  can be used for terrain and static tiles
    // 7: tile map level (256px x 256px), RBGA pixel stores 4 layers, 1 tile per byte (256 tiles in a tile atlas)

}

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

        // gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        // gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        // gl.uniform2f(mouseLocation, g.mouse.x, g.mouse.y);
        // if (g.frame.count === 0){
        //     gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, image.ref['clear'].texture, 0);
        //     gl.uniform1f(isFirstLocation, 0.0);
        //     g.frame.count++;
        // } else {
        //     gl.uniform1f(isFirstLocation, 1.0);
        // }

        //gl.uniform2f(cameraLocation, g.mouse.x, g.mouse.y);


        for (var i=0; i<image.arr.length; i++){
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, image.arr[i].texture);
        }

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // -----------------------------------------------------------------
    } // for loop, repeat

}

// **************************************************************************************************
// **************************************************************************************************
// **************************************************************************************************

// ###############################################################################
