OpenMindMap.node.dummy = function(x,y,color){
	this.x = x;
	this.y = y;
	this.connections = {};	
	this.connections.from = [];
	this.color = color;
	this.setCoordinates = function(x,y){
		this.x = x;
		this.y = y;
	};
	this.getConnectionCoordinates = function(){
		return OpenMindMap.utils.point(this.x, this.y - 40);
	};
	this.margin = function(){
		return OpenMindMap.utils.rect(this.x,this.y,0,0);
	};
	this.toString = function(){
		return 'OpenMindMap.node.dummy';
	};
	this.afterUpdate = function(){};
}