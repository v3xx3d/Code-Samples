var lastEvent, kname;
var tempKeys = [];
var heldKeys = [];

var keyMap = {
	forward: 87,
	left: 65,
	right: 68,
	reverse: 83,
    fire: 32,
    shift: 16
}

var handlekeydown = function(event) {
    if (lastEvent && lastEvent.keyCode == event.keyCode) {
        return;
    }
    if( isKeyHeld( event.keyCode ) ){
        return;
    }
    lastEvent = event;

    kname = keyFromCode( event.keyCode );
    if( kname ){
        tempKeys.push( kname );
    }
    // console.log( heldKeys );
};

var handlekeyup = function(event) {
    lastEvent = null;

    kname = keyFromCode( event.keyCode );

    for( var i = 0; i < tempKeys.length; i++ ){
    	if( tempKeys[i] == kname ){
    		tempKeys.splice(i, 1);
    	}
    }
    // console.log( heldKeys );
};

document.addEventListener("keydown", handlekeydown, false); 
document.addEventListener("keyup", handlekeyup, false); 

function keyFromCode( code ){
    for( var keyName in keyMap ){
        if( keyMap[keyName] == code ){
            return keyName;
        }
    }

    return false;
}

function isHeld( keyname ){
	for( var i = 0; i < heldKeys.length; i++ ){
        if( heldKeys[i] == keyname ){
            return true;
        }
    }
    return false;
}

function isKeyHeld( key ){
    var tkey;

    for( var kname in keyMap ){
        if( keyMap[kname] == key){
            tkey = kname;
        }
    }

    if( tkey ){
        return isHeld(tkey);
    } else return false;
    
}