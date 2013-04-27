OpenMindMap.connection.base  = function(){
	this.startPoint;
	this.endPoint;
	this.startNode;
	this.endNode;
	this.cText;
	this.cColor;
	this.path;
	this.afterDraw;
	this.dText;
	this.omm;
	this.enableTextPath;
	var conn = this;

	this.getPathString = function(){
		return this.path.attr('path').toString()
	};

	this.afterNodeUpdate = function(){};

	this.create = function(opts){
		this.startNode = opts.startNode;
		this.endNode = opts.endNode;
		this.startPoint = opts.startNode.getConnectionCoordinates(this.endNode);
		this.endPoint = opts.endNode.getConnectionCoordinates(this.startNode);
		this.paper = opts.paper;		
		this.omm = opts.omm;
		this.enableTextPath = opts.enableTextPath;
		this.draw(); 	
		if(opts.text){
			this.text(opts.text);
		}
		this.color(opts.color);			
		this.endNode.connections.from.push(conn);
	};

	this.update = function(){
		this.startPoint = this.startNode.getConnectionCoordinates(this.endNode);		
		this.endPoint = this.endNode.getConnectionCoordinates(this.startNode);
		this.draw();
		if(this.dText) this.drawText();		
		if(this.afterUpdate) this.afterUpdate();		
	};

	this.text = function(txt){
		if(txt){
			this.cText = txt;
			this.drawText();	
		}else{
			return this.cText;
		}		
	};

	this._color = function(){};
	this.color = function(clr){
		if(clr){
			this.cColor = clr;
			if(this.path){
				this.path.attr("stroke", clr);				
			}
			this._color(clr);
		}else{
			return this.cColor;
		}
	};

	this.updateEndNodeColor = function(clr){
		this.endNode.updateColor(clr);		
	}

	this.draw = function(){
		if(!this.startPoint || !this.endPoint) throw('draw: Missing start or end point in connection');
		if(this.path){
			this.path.remove();
			delete this.path;
		}
		var path = this.getPath();		
		this.path = this.paper.path(path).attr({
			stroke : this.cColor					
		});
		this.path.toBack();
		this.path.node.setAttribute('class', 'connection-menu');
		if(this.enableTextPath){
			this.path.dblclick(this.showEditor);	
		}	
		var currentConnection = this;			
		this.path.click(function(){
			currentConnection.omm.setSelectedNode(currentConnection.endNode)
		});
		this.path.connection = this;
		try{
			if(this.afterDraw) this.afterDraw();
		}catch(err){
			console.log("error executing afterDraw callback");
		}	
		if(this.startNode.childFolded){
			this.path.hide();
		}
	};

	this.getDeltaCoords = function(){};

	this.showEditor = function(){
		if(conn.originalPath) { 
			var pathToCheck = conn.originalPath;
		}else{
			var pathToCheck = conn.path;
		}
		var pathTotalLenght = pathToCheck.getTotalLength();
		var editorCood = pathToCheck.getPointAtLength(pathTotalLenght/2);
		$editor = $('#placeHolder');
		$editor.css('top',  editorCood.y);
		$editor.css('left', editorCood.x);
		$editor.show();
		$inputbox = $('#placeHolder > #inputBox');
		$inputbox.val(conn.text());
		$inputbox.focus();
		$inputbox.select();
		$editor.unbind('focusout');
		$inputbox.unbind('keyup');
		$inputbox.keyup(conn, function(event) {
			if (OpenMindMap.utils.KEY_ENTER == event.keyCode) {
				var value = $editor.val();
				value.substring(0, value.length - 2);
				$editor.val(value);
				$editor.triggerHandler('focusout');
			}
		});
		$editor.focusout(conn, function(event) {
			$('#placeHolder').hide();
			event.data.text($inputbox.val());			
			conn.omm.triggerEvent('node-change-connection-text', {text: $inputbox.val(), from: conn.startNode.guid, to: conn.endNode.guid});
		});		
	};

	this.drawText = function(){
		if(!this.path) throw('Path non defined');
		if(this.dText) this.dText.remove()
		if(this.originalPath) { 
			var pathToCheck = this.originalPath;
		}else{
			var pathToCheck = this.path;
		}
		var textToPrint = this.text();
		var pathTotalLenght = pathToCheck.getTotalLength();
		var isRtl = pathToCheck.getPointAtLength(0).x > pathToCheck.getPointAtLength(pathTotalLenght).x;
		if(isRtl){
			textToPrint = textToPrint.split('').reverse().join('');			
		}
		var gText = this.paper.print(100, 100, textToPrint, this.paper.getFont(this.omm.setup.connection.font.name, 800), 30);		
		var currentPosition = pathTotalLenght/2;
		var pathPoint = null;		
		var spacesCount = 0;
		var tmpDesc = this.paper.print(100, 100, 'o', this.paper.getFont(this.omm.setup.connection.font.name, 800), 30);
		var standardSize = tmpDesc[0].getBBox().height;		
		tmpDesc.remove();
		var t;
		for(var j, i=0, ii=textToPrint.length; i<ii; i++){
			if(textToPrint.charCodeAt(i) == OpenMindMap.utils.KEY_ENTER || textToPrint.charCodeAt(i) == OpenMindMap.utils.KEY_NEWLINE) {
				spacesCount++;
				continue;
			};
			if(textToPrint[i] == ' ') {
				spacesCount++;
				currentPosition += this.omm.setup.connection.font.space;
				continue;
			}
			j = i - spacesCount;
			pathPoint = pathToCheck.getPointAtLength(currentPosition);
			if(gText[j]){
				currentPosition += (gText[j].getBBox().width + this.omm.setup.connection.font.spacing);	
			}else{
				currentPosition += this.omm.setup.connection.font.space;
				spacesCount++;
				continue;
			}			
			t = gText[j].transform();
			t[0][1] += pathPoint.x - gText[j].getBBox().x;
			if(isRtl){
				t[0][1] -= gText[j].getBBox().width;
			}
			t[0][2]	+= pathPoint.y - gText[j].getBBox().y - 10;
			if(textToPrint.charAt(i).hasDescender()){
				t[0][2] -= standardSize;
			}else{
				t[0][2] -=  gText[j].getBBox().height
			}			
			t[3] = [];
			t[3].push('R');
			t[3].push((pathPoint.alpha - 180) % 180);
			gText[j].transform(t);			
		}
		this.dText = gText;		
	};

	this.remove = function(){
		this.path.remove();
		if(this.dText) this.dText.remove();
	};	
	this.hide = function(){
		if(this.dText) this.dText.hide();
		this.path.hide();
	};
	this.show = function(){
		if(this.dText) this.dText.show();
		this.path.show();
	};	
}