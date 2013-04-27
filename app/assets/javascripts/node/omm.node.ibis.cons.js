OpenMindMap.node.ibis.cons = function(params){
	params.size = params.size ? params.size : OpenMindMap.utils.size(100,60);
	OpenMindMap.node.image.call(this, params);
	this.setImage('/assets/cons.png', this.size.w/2 - 16, 5, 33, 33);
	this.setLabel(OpenMindMap.utils.point(this.size.w/2, this.size.h-12));
	this.toString = function(){ return 'OpenMindMap.node.ibis.cons' }
}
OpenMindMap.node.ibis.cons.prototype = OpenMindMap.node.image.prototype;
OpenMindMap.node.ibis.cons.constructor = OpenMindMap.node.ibis.cons;