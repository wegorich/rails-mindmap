OpenMindMap.node.ibis.question = function(params){
	params.size = params.size ? params.size : OpenMindMap.utils.size(100,60);
	OpenMindMap.node.image.call(this, params);
	this.setImage('/assets/question.png', this.size.w/2 - 16, 5, 33, 33);
	this.setLabel(OpenMindMap.utils.point(this.size.w/2, this.size.h-12));
	this.toString = function(){ return 'OpenMindMap.node.ibis.question' }
}
OpenMindMap.node.ibis.question.prototype = OpenMindMap.node.image.prototype;
OpenMindMap.node.ibis.question.constructor = OpenMindMap.node.ibis.question;