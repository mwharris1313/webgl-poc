// ###############################################################################
"use strict";
// ###############################################################################
var thisFile = 'debug.js';

var dbg = {};

// ***********************************************************
dbg.func = function(tFileName, tFunction, tMessage){
	if (g.isLogging) log(tFileName, tFunction, 'START');
}

// ***********************************************************
dbg.funcFreq = function(tFileName, tFunction, tMessage){
	if (g.isLoggingFrequent) log(tFileName, tFunction, 'START');
}

// ***********************************************************
dbg.out = function(tFileName, tFunction, tMessage){
	if (g.isDebug) log(tFileName, tFunction, 'DEBUG', tMessage);
}

// ***********************************************************
dbg.msPerFrame = function(tFileName, tFunction){
    var thisFunc = 'dbg.msPerFrame()';

    if (g.isProfiling) {
	    if(g.frame.count % g.frame.profileCount === 0) {
	        var tTemp = window.performance.now();
	        var dt = tTemp - g.frame.tLast;
	        g.frame.tLast = tTemp;
	        log(tFileName, tFunction, thisFunc, 'PROFILING', dt/g.frame.profileCount, 'ms/frame');
	    }
	    g.frame.count++;	
	}
}

// ***********************************************************

// ###############################################################################
