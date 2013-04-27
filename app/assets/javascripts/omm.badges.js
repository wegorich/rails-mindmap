OpenMindMap.node.badge = function(opts){
	this.icon  = opts.icon;
	this.width = opts.width;
	this.height = opts.height;
	this.title = opts.title;
	this.onclick = opts.onclick;
	this.onDragStart = opts.onDragStart;
	this.onDrag = opts.onDrag;
	this.onDragEnd = opts.onDragEnd;
	this.image = null;
	this.omm = opts.omm;
	this.drawed = false;

	this.show = function(){
		if(!this.image) return;
		this.image.attr({
			'opacity' : 1
		});
	};
	this.remove = function(){
		if(!this.image) return;
		this.image.remove();
	};
	this.hide = function(){
		if(!this.image) return;
		this.image.attr({
			'opacity' : 0
		});
	};
	this.draw = function(x,y){
		if(!this.icon) return;
		this.image = this.omm.paper.image(this.icon, x, y, this.width, this.height);
		this.image.drag(this.onDrag, this.onDragStart, this.onDragEnd)
		this.image.click(this.onclick);
		this.drawed = true;
	};
	this.getBBox = function(){
		if(this.image){
			return this.image.getBBox();
		}else{
			return {x:0,y:0};
		}
	};
	this.updateposition = function(x,y){
		if(!this.image) return;
		this.image.attr('x',x);
		this.image.attr('y',y);
	};
	this.hover = function(fIn, fOut){		
		if(!this.image) return;		
		this.image.hover(fIn,fOut);
	};
}