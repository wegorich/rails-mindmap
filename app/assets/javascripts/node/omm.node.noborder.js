OpenMindMap.node.noborder = function(params){
	this.size = params.size ? params.size : this.size
	OpenMindMap.node.base.call(this, params);	
	this.fill_opacity = 0;
	this.fill_opacity_drag = 0;
	this.stroke_width = 0;
	this.setBox(this.getPaper().rect(this.position.x, this.position.y, this.size.w, this.size.h, this.radius))
	this.box.attr({
		"fill-opacity" : this.fill_opacity,
		"stroke-opacity" : this.fill_opacity,
		"stroke-width" : this.stroke_width,
		cursor : "move"
	});
	this.setLabel(OpenMindMap.utils.point(this.size.w/2, this.size.h-12));
	this.toString = function(){ return 'OpenMindMap.node.noborder' }
}
OpenMindMap.node.noborder.prototype = OpenMindMap.node.base.prototype;
OpenMindMap.node.noborder.constructor = OpenMindMap.node.noborder;