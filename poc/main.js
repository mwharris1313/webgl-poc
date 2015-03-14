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



//{premultipliedAlpha: false}
    if(!gl) alert("ERROR: WebGL Context Not Created : " + errorStatus);

    canvas.width = g.screen.width;
    canvas.height = g.screen.height;
    //gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.viewport(0, 0, canvas.width, canvas.height);

    var vertexShader = createShaderEmbedded(gl, "VertexShader");
    var fragmentShader = createShaderEmbedded(gl, "FragmentShader");
    program = createProgram(gl, [vertexShader, fragmentShader]);
    gl.useProgram(program);

    // gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.LESS);


    // gl.enable(gl.BLEND);
    // gl.disable(gl.DEPTH_TEST);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
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

//    gl.BlendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    image.initTexture('clear', positionLocation); // not sure if positionLocation is even necessary
    image.initTexture('atlas', positionLocation); // will look into later...
    image.initTexture('edit', positionLocation); // will look into later...

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
// gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
// gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
// gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        for (var i=0; i<image.keys.length; i++){
            if (image.ref[image.keys[i]].textureUnit !== undefined) {
                gl.activeTexture(image.ref[image.keys[i]].textureUnit);
                gl.bindTexture(gl.TEXTURE_2D, image.ref[image.keys[i]].texture);
            }
        }


        // gl.uniform2f(mouseLocation, g.mouse.x, g.mouse.y);
        // if (g.frame.count === 0){
        //     gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, image.ref['clear'].texture, 0);
        //     gl.uniform1f(isFirstLocation, 0.0);
        //     g.frame.count++;
        // } else {
        //     gl.uniform1f(isFirstLocation, 1.0);
        // }

        //gl.uniform2f(cameraLocation, g.mouse.x, g.mouse.y);

        //gl.bindBuffer(gl.ARRAY_BUFFER, texture);
        //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);


        frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        frameBuffer.width = 640;
        frameBuffer.height = 360;

        //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, frameBuffer.width, frameBuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, frameBuffer.width, frameBuffer.height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);

        //gl.viewport(0, 0, canvas.width, canvas.height);

        //gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, image.ref['clear'].texture, 0);
        //gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, image.ref['clear'].texture, 0,1);

        // Render to the texture (using clear because it's simple)

        //gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, image.ref['atlas'].texture, 0);
        //gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, image.ref['clear'].texture, 0);
        //gl.clearColor(1, 1, 1, 1); // green;
        //gl.clear(gl.COLOR_BUFFER_BIT);

// gl.framebufferTexture2D( 
//     gl.FRAMEBUFFER,
//     gl.DEPTH_ATTACHMENT, 
//     gl.TEXTURE_2D, 
//     this.m_depthComponentTexture, 
//     0 );

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        // gl.clearColor(0, 1, 0, 0.5);
        // gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

// // Set the backbuffer's alpha to 1.0
// gl.clearColor(1, 1, 1, 1);
// gl.colorMask(false, false, false, true);
// gl.clear(gl.COLOR_BUFFER_BIT);

        // for (var i=0; i<image.keys.length; i++){
        //     if (image.ref[image.keys[i]].textureUnit !== undefined) {
        //         gl.activeTexture(image.ref[image.keys[i]].textureUnit);
        //         gl.bindTexture(gl.TEXTURE_2D, image.ref[image.keys[i]].texture);
        //     }
        // }


        //gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, image.ref['atlas'].texture, 0);

        //gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, image.ref['edit'].texture, 0);

        // // Set the backbuffer's alpha to 1.0
        // gl.clearColor(1, 1, 1, 1);
        // gl.colorMask(false, false, false, true);
        // gl.clear(gl.COLOR_BUFFER_BIT);


        // // Set the backbuffer's alpha to 1.0
        // gl.clearColor(1, 1, 1, 1);
        // gl.colorMask(false, false, false, true);
        // gl.clear(gl.COLOR_BUFFER_BIT);


        // -----------------------------------------------------------------
    } // for loop, repeat

}

// **************************************************************************************************
// **************************************************************************************************
// **************************************************************************************************

// ###############################################################################
