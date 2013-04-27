/**
 * @author Piero Bozzolo
 */
OpenMindMap.utils = {
		rect : function(x, y, w, h){
			return {'x' : x, 'y' : y, 'width' : w, 'height' : h};
		},
		point : function(x,y){
			return {'x' : x, 'y' : y};
		},
		size : function(w,h){
			return {'w' : w, 'h' : h};
		},
		PHI : (1+Math.sqrt(5))/2,
		W_CONST : 1.2,
		KEY_BACKSPACE : 8,
		KEY_TAB : 9,
		KEY_NEWLINE : 10,
		KEY_ENTER : 13,
		KEY_ESC : 27,
		KEY_SPACE : 32,
		KEY_INS : 45,
		KEY_DEL : 46,		
		KEY_F : 70,
		KEY_G : 71,
		KEY_H : 72,		
		KEY_I : 73,		
		KEY_L : 76,
		KEY_W : 87,
		guidGenerator : function() {
		    var S4 = function() {
		       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		    };
		    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
		},
		pointInRect : function(point, rect){
			return (point.x >= rect.x && point.x <= (rect.x + rect.w) && point.y >= rect.y && (point.y <= rect.y + rect.h))
		},
		getNameSpacedFunction: function(functionName){
		  var namespaces = functionName.split(".");
		  var func = namespaces.pop();
		  var context = window;
		  for(var i = 0; i < namespaces.length; i++) {
		    context = context[namespaces[i]];
		  }
		  return context[func];
		}		
};

Array.prototype.unique = function () {
    var arrVal = this;
    var uniqueArr = [];
    for (var i = arrVal.length; i--; ) {
        var val = arrVal[i];
        if ($.inArray(val, uniqueArr) === -1) {
            uniqueArr.unshift(val);
        }
    }
    return uniqueArr;
}

String.format = function() {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {       
        var reg = new RegExp("\\{" + i + "\\}", "gm");             
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
}

String.prototype.endsWith = function (suffix) {
    return (this.substr(this.length - suffix.length) === suffix);
}

String.prototype.startsWith = function(prefix) {
    return (this.substr(0, prefix.length) === prefix);
}

String.prototype.mask = function(opts){
    if(!opts) opts = {};    
    if(!opts.maskChar) opts.maskChar = 'x';
    if(!opts.boldize) opts.boldize = true;
    if(!opts.maskSize) opts.maskSize = 4;
    if(this.length <= opts.maskSize) return opts.maskChar.multiplies(this.length);
    opts.mask = opts.maskChar.multiplies(opts.maskSize);
    var tmpMaskedString = this.trim();
    if(tmpMaskedString.isEmpty()) return tmpMaskedString;
    if(opts.direction && opts.direction == 'left'){            
        tmpMaskedString  = tmpMaskedString.substr(opts.maskSize);        
        if(opts.boldsize) tmpMaskedString = String.format('<span style="font-weight:bold;">{0}</b>', tmpMaskedString);
        tmpMaskedString = opts.mask + tmpMaskedString;
    } else {
         tmpMaskedString  = tmpMaskedString.substr(0, tmpMaskedString.length - opts.maskSize);
        if(opts.boldsize) tmpMaskedString = String.format('<span style="font-weight:bold;">{0}</b>', tmpMaskedString);
        tmpMaskedString = tmpMaskedString + opts.mask;
    } 

    return tmpMaskedString;    
};

String.prototype.isEmpty = function(){
  return ((this.replace(/^\s+|\s+$/, '').length) == 0);
};

String.prototype.trim = function(){
    return this.replace(/^\s+|\s+$/g,"");
}

String.prototype.multiplies = function(times){
    if(!times) return null;
    var multipliedString = '';
    for (i = 0; i < times; i++) {
        multipliedString += this;
    }
    return multipliedString;
}

String.prototype.isUpperCase = function()
{
    return (this[0] >= 'A') && (this[0] <= 'Z');
}
String.prototype.hasDescender = function()
{
    var glyphs = ['g', 'j', 'q', 'p', 'y'];
    for (var i = glyphs.length - 1; i >= 0; i--) {
        if(this.indexOf(glyphs[i]) > -1){ return true; }
    };
    return false;
}
String.prototype.capitalize = function(){
	return this.charAt(0).toUpperCase() + this.slice(1);	
}

String.prototype.isUrl = function(){
    var regexp = new RegExp("^((http|https|ftp)?:\\/\\/)?(www\\.)?([a-zA-Z1-90-]{2,}\\.)+?([a-zA-Z-]{2,6})(:\\d{2,})?(\\/\\S+)*$");
    return regexp.test(this);
}

String.prototype.hasUrlProtocol = function(){
    return this.startsWith('http://') || this.startsWith('ftp://') || this.startsWith('mailto://');
}

/* Error handler */
window.onerror = function(){
	console.log('Logging...', arguments)
};
