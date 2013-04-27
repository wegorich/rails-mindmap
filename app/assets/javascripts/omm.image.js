OpenMindMap.image = function(opt){
	this.url;
	this.size;
	this.position = opt.position;
	this.moveBox;
	this.omm = opt.omm;
	this.image;
	this.size = opt.size;
	this.filename = opt.filename;
	this.deleteBadge;

	var imgObj = this;
	this.draw = function(){
		var href = '/assets/clipart/' + this.filename;
		this.image = opt.omm.paper.image(href, this.position.x, this.position.y, this.size.w, this.size.h);
		this.image.drag(imgObj.move, imgObj.drag, imgObj.onEndDrag);
		this.image.attr('cursor', 'move');
		this.image.hover(function(){imgObj.deleteBadge.show()}, function(){imgObj.deleteBadge.hide()});
		this.image.toBack();
		this.drawBadges();
	};	
	this.getAllProperties = function(){
		return {
			size : this.size,
			position : this.position,
			filename : this.filename
		};
	}
	this.move = function(dx, dy){
		var att = {
			x : imgObj.image.ox + dx,
			y : imgObj.image.oy + dy
		};
		imgObj.image.attr(att);
		imgObj.position = att;
		imgObj.omm.changed = true;
		imgObj.deleteBadge.updateposition(imgObj.image.getBBox().x, imgObj.image.getBBox().y + 9);
	};
	this.drag = function(){
		imgObj.image.ox = imgObj.image.attr("x");
		imgObj.image.oy = imgObj.image.attr("y");

		imgObj.deleteBadge.updateposition(imgObj.image.getBBox().x, imgObj.image.getBBox().y + 9);
	};
	this.remove = function(){
		if (this.image) this.image.remove();
		if (this.deleteBadge) this.deleteBadge.remove();
		this.omm.removeImage(this);
	};
	this.drawBadges = function(){	
		this.deleteBadge = new OpenMindMap.node.badge({
			icon    : '/assets/delete.png', 
			width	: 18,
			height  : 18,		
			omm		: this.omm,					
			title   : 'Delete this image', 
			onclick : function(e){
				imgObj.remove();
			}
		});
		
		var y = imgObj.image.getBBox().y - 9;
		var x = imgObj.image.getBBox().x;
		this.deleteBadge.draw(x, y);
		this.deleteBadge.hover(function(){imgObj.deleteBadge.show()}, function(){if(!imgObj.image.removed) imgObj.deleteBadge.hide()});
		this.deleteBadge.hide();
	};

	return this;
}