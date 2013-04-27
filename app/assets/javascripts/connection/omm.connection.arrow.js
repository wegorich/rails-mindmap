OpenMindMap.connection.arrow  = function() {
	OpenMindMap.connection.base.call(this);
	this.reverseDirection = true;

	this.getPath = function(){				
		var size = 5;
		var angle = Math.atan2(this.endPoint.x - this.startPoint.x, this.startPoint.y - this.endPoint.y);	
		angle = 90 + (( angle / (2 * Math.PI)) * 360);	
		var oPath = ["M", 
					this.startPoint.x,
					this.startPoint.y,
					"L", 
					this.endPoint.x, 
					this.endPoint.y].join(",");
		
		if(this.reverseDirection){
			var r_x = x1;
			var r_y = y1;
			var x1 = this.startPoint.x;
			var y1 = this.startPoint.y;
			var x2 = this.endPoint.x;
			var y2 = this.endPoint.y;

		}else{
			var r_x = x2;
			var r_y = y2;
			var x1 = this.endPoint.x;
			var y1 = this.endPoint.y;
			var x2 = this.startPoint.x;
			var y2 = this.startPoint.y;					
		}
		var arrowPath = ["M",
						  x1, 
						  y1, 
						  "L", 
						  (x1 - size), 
						  (y1 + size),
						  "L", 
						  (x1 - size), 
						  (y1 - size), 
						  "L", 
						  x1, 
						  y1].join(",");

		if(this.arrow) this.arrow.remove();
		this.arrow = this.paper.path(arrowPath).rotate(angle, r_x, r_y);
		this.arrow.attr('fill', this.endNode.color);		
		return oPath;
	}

	this.remove = function(){
		this.path.remove();
		if(this.arrow) this.arrow.remove();
		if(this.dText) this.dText.remove();
	}	
};

OpenMindMap.connection.arrow.prototype = OpenMindMap.connection.base.prototype;
OpenMindMap.connection.arrow.constructor = OpenMindMap.connection.arrow;