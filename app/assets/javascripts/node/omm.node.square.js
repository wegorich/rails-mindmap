OpenMindMap.node.square = function(params){
	params.radius = 0;
	OpenMindMap.node.classic.call(this, params);
	this.name = 'Square';

	this.toString = function(){ return 'OpenMindMap.node.square' }
}
OpenMindMap.node.square.prototype = OpenMindMap.node.classic.prototype;
OpenMindMap.node.square.constructor = OpenMindMap.node.square;