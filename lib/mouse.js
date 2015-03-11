// ###############################################################################
"use strict";
// ###############################################################################
var thisFile = 'mouse.js';

var mouse = {};

// ***********************************************************
mouse.canvasXY = function(tag) {
    var thisFunc = 'mouse.canvasXY()';
    dbg.func(thisFile, thisFunc);

    var x, y;
    x = tag.offsetLeft;
    y = tag.offsetTop;

    if (tag.offsetParent) {
        while (tag = tag.offsetParent){
            x += tag.offsetLeft;
            y += tag.offsetTop;
        }
    }
    if (g.isDebug) log(thisFile, thisFunc, [x, y]);
    return [x, y];
}

// ***********************************************************
mouse.onClick = function(e){
    var thisFunc = 'mouse.onClick()';
    dbg.func(thisFile, thisFunc);

    g.mouse.x = e.clientX-g.canvas.offsetLeft;
    g.mouse.y = e.clientY-g.canvas.offsetTop;
    if (g.isDebug) log(thisFile, thisFunc, g.mouse);
    g.toggle.onClick = !g.toggle.onClick;
}

// ***********************************************************
mouse.onMouseMove = function(e){
    var thisFunc = 'mouse.onMouseMove()';
    dbg.func(thisFile, thisFunc);

    g.mouse.x = e.clientX-g.canvas.offsetLeft;
    g.mouse.y = e.clientY-g.canvas.offsetTop;
    if (g.isDebug) log(thisFile, thisFunc, g.mouse);
}

// ***********************************************************
mouse.onTouchStart = function(e){
    var thisFunc = 'mouse.onTouchStart()';
    dbg.func(thisFile, thisFunc);

    g.mouse.x = e.clientX-g.canvas.offsetLeft;
    g.mouse.y = e.clientY-g.canvas.offsetTop;
    if (g.isDebug) log(thisFile, thisFunc, g.mouse);
}

// ***********************************************************
mouse.onTouchMove = function(e){
    var thisFunc = 'mouse.onTouchMove()';
    dbg.func(thisFile, thisFunc);

    g.mouse.x = e.clientX-g.canvas.offsetLeft;
    g.mouse.y = e.clientY-g.canvas.offsetTop;
    if (g.isDebug) log(thisFile, thisFunc, g.mouse);
}

// ***********************************************************

// ###############################################################################