OpenMindMap.node.ellipse = function(params){
	OpenMindMap.node.base.call(this, params);
	this.name = 'Ellipse';
	this.fill_opacity_drag = 0.5;
	this.stroke_width = 2;
	var omm = params.omm;


	this.getFillColor = function(){
		var rgb = $.Color(this.color);
		rgb = rgb.lightness(0.9)		
		return rgb.toHexString();	
	};


	var newBox = this.getPaper().rect(this.position.x, this.position.y, this.size.w, this.size.h*1.5, this.size.w);
	this.setBox(newBox);
	this.setLabel(OpenMindMap.utils.point(this.size.w / 2, this.size.h / 2));	
	this.setLabelTextSize('20px');
	this.box.attr({
		fill : this.getFillColor(),
		stroke : this.color,
		"fill-opacity" : this.fill_opacity,
		"stroke-width" : this.stroke_width,
		cursor : "move"
	});
	this.fixSize = function() {
		var oldwidth = this.box.attr('width');
		if (this.label.getBBox().width * OpenMindMap.utils.W_CONST < omm.setup.node.size.width) {
			if(this.isroot){
				this.box.attr('width', omm.setup.node.root.size.width);
			}else{
				this.box.attr('width', omm.setup.node.size.width);
			}						
		} else {
			this.box.attr('width', this.label.getBBox().width * OpenMindMap.utils.W_CONST);
		}

		this.fixLabelSize();
		var newwidth = this.box.attr('width');
		this.box.attr('x', this.box.attr('x') + ((oldwidth - newwidth) / 2));
		this.resetLabelPosition();
		this.badges.fixpositions();
		var x,y;
		for(var i=0,ii=this.dependencies.length;i<ii;i++){
			x=this.dependencies[i].delta.x + this.box.attr('x');
			y=this.dependencies[i].delta.y + this.box.attr('y');
			this.dependencies[i].element.attr('x', x);
			this.dependencies[i].element.attr('y', y);
		}
		omm.updateconnections();
		this.afterUpdate();
	};
		
	this.fixSize();
	this._updateColor = function(){
		this.box.attr({
			fill : this.getFillColor(),
			stroke : this.color		
		});	
	}
	this.toString = function(){ return 'OpenMindMap.node.ellipse' }
}
OpenMindMap.node.ellipse.prototype = OpenMindMap.node.base.prototype;
OpenMindMap.node.ellipse.constructor = OpenMindMap.node.ellipse;