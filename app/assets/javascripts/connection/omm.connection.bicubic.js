OpenMindMap.connection.bicubic  = function(){
	OpenMindMap.connection.base.call(this);
	this.originalPath;
	this.controlBallA;
	this.controlBallB;
	this.deltaA = {dx:0,dy:0};
	this.deltaB = {dx:0,dy:0};
	this._color = function(clr){
		if(1 == this.endNode.level){
			this.path.attr("fill", clr);
		}	
	};
	this.getPathString = function(){		
		if(this.originalPath){
			return this.originalPath.attr('path').toString()	
		}
		return this.path.attr('path').toString();
	};
		
	this.getPath = function(){
		var points = this.getControlPoint(this.endPoint, this.startPoint);		
		if(this.startPoint.x < this.endPoint.x){
			var oPath = ["M", 
						this.startPoint.x,
						this.startPoint.y,
						"C",
						points[1].x,
						points[1].y,
						points[0].x,
						points[0].y,
						this.endPoint.x, 
						this.endPoint.y].join(",");
		}else{			
			var oPath = ["M", 
						this.endPoint.x,
						this.endPoint.y,
						"C", 
						points[0].x,
						points[0].y,
						points[1].x,
						points[1].y,
						this.startPoint.x, 
						this.startPoint.y].join(",");
		}
		
		if(1 == this.endNode.level){
			if(this.originalPath) { 
				this.originalPath.attr('path', oPath);
			}else{
				this.originalPath = this.paper.path(oPath).attr({ opacity : 0 });	
			}			
			if(this.endNode.children.length > 0){
				var endPointSizeForChild = 2;
			} else {
				var endPointSizeForChild = 0;	
			}	
			return ['M',
					this.endPoint.x,
					this.endPoint.y - endPointSizeForChild,
					"C", 
					points[0].x,
					points[0].y,
					points[1].x,
					points[1].y,
					this.startPoint.x, 
					this.startPoint.y - 20 ,
					'L',
					this.startPoint.x, 
					this.startPoint.y + 20 ,
					'C',
					points[1].x,
					points[1].y,
					points[0].x,
					points[0].y,
					this.endPoint.x,
					this.endPoint.y + endPointSizeForChild,
					'Z'
					].join(",");
		}else{
			return oPath;
		}
	};

	this.afterDraw = function(){
		if(1 == this.endNode.level){
			this.path.attr('fill', this.color());
			this.path.attr('stroke-width', 3);
		}else{
			this.path.attr('stroke-width', 6);
		}		
		var connection = this;	
		this.path.click(function(e){
			connection.omm.selectedConnection = connection;
			connection.showBullets();
		});
		this.path.dblclick(function(){
			connection.deltaA = {dx:0,dy:0};
			connection.deltaB = {dx:0,dy:0};
			connection.update();
			connection.endNode.afterUpdate(false);
			connection.omm.selectedConnection = connection;
			connection.showBullets();
		});
	};

	this.showBullets = function(){
		var cPoint = this.getRealControlPoint(this.startPoint, this.endPoint);
		var att = {
			cx: cPoint[0] + this.deltaA.dx,
			cy: cPoint[1] + this.deltaA.dy,
			opacity : 1
		}
		this.controlBallA.attr(att);
		att = {
			cx: cPoint[2] + this.deltaB.dx,
			cy: cPoint[3] + this.deltaB.dy,
			opacity : 1
		}
		this.controlBallB.attr(att);
	};

	this.hideBullets = function(){
		this.controlBallA.attr('opacity', 0);
		this.controlBallB.attr('opacity', 0);
	};

	this.getRealControlPoint = function(startPoint, endPoint){
		var dx = Math.max(Math.abs(startPoint.x - endPoint.x) / 2, 10);
		var dy = Math.max(Math.abs(startPoint.y - endPoint.y) / 2, 10);

		if(startPoint.x < endPoint.x){
			var sx = startPoint.x + dx;
			var sy = startPoint.y;
			var ex = startPoint.x + dx;
			var ey = endPoint.y;
		}else{
			var sx = startPoint.x - dx;
			var sy = startPoint.y;
			var ex = startPoint.x - dx;
			var ey = endPoint.y;
		}
		return [ Math.floor(sx), Math.floor(sy), Math.floor(ex), Math.floor(ey)];
	}
	this.getControlPoint = function(startPoint, endPoint){
		if(!startPoint || !endPoint) throw('getControlPoint: Missing start or end point in connection');
		var realControlPoint = this.getRealControlPoint(startPoint, endPoint);
		var sx = realControlPoint[0];
		var sy = realControlPoint[1];
		var ex = realControlPoint[2];
		var ey = realControlPoint[3];
		if(!this.controlBallA) {
			this.drawControlBalls(sx,sy,ex,ey);
		}
		
		sx = sx + this.deltaA.dx * 2;
		sy = sy + this.deltaA.dy * 2;					
		ex = ex + this.deltaB.dx * 2;
		ey = ey + this.deltaB.dy * 2;	
				
		this.ballsCoords = {sx:sx, sy:sy, ex:ex, ey:ey};
		return [OpenMindMap.utils.point(sx, sy), OpenMindMap.utils.point(ex, ey)]; 
	};

	this.getDeltaCoords = function(){
		return { deltaA : this.deltaA, deltaB : this.deltaB};
	};
	
	this.drawControlBalls = function(sx,sy,ex,ey){		
		var self = this;
		this.controlBallA = this.omm.paper.circle(sx, sy, 5)
									.attr("fill", '#00a').drag(function(dx,dy){										
										var att = {
											cx : self.controlBallA.ox + dx,
											cy : self.controlBallA.oy + dy
										};
										self.controlBallA.attr(att);
										self.deltaA = {dx: att.cx - self.realControlPoint[0], dy: att.cy - self.realControlPoint[1]};
										self.update();
										self.endNode.afterUpdate(false);
									},function(){
										self.realControlPoint = self.getRealControlPoint(self.startPoint, self.endPoint);
										self.controlBallA.ox = self.controlBallA.attr("cx");
										self.controlBallA.oy = self.controlBallA.attr("cy");
									}).attr('opacity', 0);

		this.controlBallB = this.omm.paper.circle(ex, ey, 5)
									.attr("fill", '#0a0').drag(function(dx,dy){										
										var att = {
											cx : self.controlBallB.ox + dx,
											cy : self.controlBallB.oy + dy
										};
										self.controlBallB.attr(att);	
										self.deltaB = {dx: att.cx - self.realControlPoint[2], dy: att.cy - self.realControlPoint[3]};										
										self.update();	
										self.endNode.afterUpdate(false);
									},function(){
										self.realControlPoint = self.getRealControlPoint(self.startPoint, self.endPoint);
										self.controlBallB.ox = self.controlBallB.attr("cx");
										self.controlBallB.oy = self.controlBallB.attr("cy");										
									}).attr('opacity', 0);
	}	

	this.remove = function(){
		this.path.remove();
		if(this.originalPath) this.originalPath.remove();
		if(this.dText) this.dText.remove();
		if(this.controlBallA) this.controlBallA.remove();
		if(this.controlBallB) this.controlBallB.remove();
	};
}
OpenMindMap.connection.bicubic.prototype = OpenMindMap.connection.base.prototype;
OpenMindMap.connection.bicubic.constructor = OpenMindMap.connection.bicubic;