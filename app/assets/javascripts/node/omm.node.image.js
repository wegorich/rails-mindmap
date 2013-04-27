OpenMindMap.node.image = function(params){
	OpenMindMap.node.noborder.call(this, params);
	this.name = 'Image';
	this.setImage = function(href, x, y, w, h){
		if(this.image) {
			this.setImageSrc(href);
			return;
		}
		this.image = this.getPaper().image(href, this.position.x + x, this.position.y + y, w, h);
		this.image.node.setAttribute('class', 'nodes-menu');
		this.setDependent(this.image);		
	};
	this.setImageSrc = function(src) {
	    if(this.image.node.src){
	        this.image.node.src = src;
	    }else{
	        this.image.node.href.baseVal = src;
	    }
	};	
	this.resetLabelPosition = function(){
		var new_position = OpenMindMap.utils.point(this.label_padding.x + this.margin().x, this.label_padding.y + this.margin().y);
		this.label.attr(new_position);	
		return;
	}
	this.toString = function(){ return 'OpenMindMap.node.image' }
}
OpenMindMap.node.image.prototype = OpenMindMap.node.noborder.prototype;
OpenMindMap.node.image.constructor = OpenMindMap.node.image;