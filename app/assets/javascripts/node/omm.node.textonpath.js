OpenMindMap.node.textonpath = function(params){
	this.size = params.size ? params.size : this.size
	OpenMindMap.node.base.call(this, params);	

	this.fill_opacity = 0;
	this.fill_opacity_drag = 0;
	this.stroke_width = 0;
	this.setBox(this.getPaper().rect(this.position.x, this.position.y, 0, 0, 0));
	this.box.attr({
		"fill-opacity" : this.fill_opacity,
		"stroke-opacity" : this.fill_opacity,
		"stroke-width" : this.stroke_width,
		cursor : "move"
	});

	this.labelMargin = function(){
		if(this.label){
			return Raphael.pathBBox(this.label.path.attrs.path.toString())
		}else{
			return ommnode.box.getBBox();
		}	
	};

	this.getCenter = function(){
		var margin = this.margin();
		console.log(margin)
		return OpenMindMap.utils.point(margin.x + margin.width / 2, margin.y + margin.height / 2);
	};
		
	this.afterUpdate = function(skipParent){
		if(this.connections.from[0] && this.label){			
			if(this.margin().x > this.parent.margin().x + this.parent.margin().width / 2){
				var offset = '100%';
				var anchor = 'end';
			}else{
				var offset = '0px';
				var anchor = 'start';
			}
			this.label.updatePath(this.connections.from[0].getPathString(), offset, anchor);					
		}
		if(!skipParent) this.parent.afterUpdate();
	};
	
	this.afterInsert = this.afterUpdate;
	
	this.setLabel = function(){		
		if(!this.label){			
			this.label = this.getPaper().textPath('M0,0L1,1', this.labeltext, null, '-10px');				
			this.label.node.setAttribute('class', 'nodes-menu');
			this.label.textsize = this.label.attr('font').match(/^\d(\d)?(\d)?/)[0];
			this.label.node.setAttribute('class', 'nodes-menu');
			this.label.toBack();
			/* add circular connections between shapes */
			this.label.ommnode = this;
			/* end circular connections */
			/* Node triggers */
			var self = this;
			this.label.hover(function(){		
				self.badges.show();
				if(this.wiki) this.showWiki();
			}, function(){
				self.badges.hide();
				if(this.wiki) this.hideWiki();
			});
			this.label.dblclick(function(){ self.showEditor(self.setTextTrigger) });
			this.label.drag(this.onMove, this.onStartDrag, this.onEndDrag);
			this.label.attr('cursor', 'move');
			this.label.margin = function(){
				return this.label.getBBox();
			}
			this.label.click(function(e){
				if(e.shiftKey && e.ctrlKey && self.labeltext.isUrl()){
					var url = self.labeltext;
					if(!url.hasUrlProtocol()){
						url = 'http://' + url;
					}
					window.open(url, '_blank');					
				}
				params.omm.setSelectedNode(self);
			})
		}			
	};
	
	this.text = function(val, trigger) {
		if (val) {
			this.labeltext = val;
			this.label.node.firstChild.textContent = val;
			if(trigger)	this.setTextTrigger(val);
			this.map.changed = true;
		}
		return this.labeltext;
	};
	this._moveLabel = function(){};

	this.getConnectionCoordinates = function(node){
		if(this.box){
			var bbox = this.box.getBBox();
			var y = bbox.y + bbox.height;
			var x = bbox.x;	
			return OpenMindMap.utils.point(x,y);
		}else{
			return OpenMindMap.utils.point(0,0);
		}		
	};
	
	this.setLabel();
	this.setLabelTextSize(parseInt(this.label.textsize) + (10 - this.level) );
	this.toString = function(){ return 'OpenMindMap.node.textonpath'; };
}
OpenMindMap.node.noborder.prototype = OpenMindMap.node.base.prototype;
OpenMindMap.node.noborder.constructor = OpenMindMap.node.noborder;