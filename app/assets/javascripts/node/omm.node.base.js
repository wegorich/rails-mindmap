/**
 * @author Piero Bozzolo
 */
OpenMindMap.node.base = function(params) {	
	var ommnode = this;
	var omm = params.omm;
	ommnode.map = params.omm;
	ommnode.defaultSize = omm.setup.node.size;
	this.getPaper = function() { return omm.paper; };
	if(params.parentGUID){
		ommnode.parent = omm.getNodeByGUID(params.parentGUID)
	}else{
		ommnode.parent = params.parent;
	}
	ommnode.removed = false;
	ommnode.children = [];
	ommnode.attachments = [];
	ommnode.color = params.color ? params.color : Raphael.getColor();
	ommnode.isroot = (params.isroot == true);
	ommnode.size = params.size ? params.size : ommnode.defaultSize;	
	ommnode.labeltext = params.text;	
	ommnode.guid = params.guid ? params.guid : OpenMindMap.utils.guidGenerator();
	ommnode.dependencies = [];
	ommnode.childLocked = true;
	ommnode.childFolded = false;
	ommnode.hidden = false;
	ommnode.isEndingDrag = false;
	ommnode.connections = {};	
	ommnode.connections.from = [];
	ommnode.wiki = null;
	ommnode.level = ommnode.parent ? ommnode.parent.level + 1 : 0;
	ommnode.position = params.position;
	ommnode.radius = params.radius;
	
	ommnode.afterUpdate = function(){
		for (var i = this.children.length - 1; i >= 0; i--){
			ommnode.children[i].afterUpdate(true);
		};
	};
	ommnode._updateColor = function(){};
	ommnode.fixSize = function() {};
	ommnode.afterInsert = function(){};

	ommnode.updateColor = function(hex){
		ommnode.color = '#' + hex;
		ommnode._updateColor();
		if(ommnode.isroot) return;
		for (var i = ommnode.children.length - 1; i >= 0; i--) {
			ommnode.children[i].updateColor(hex);
		};
		for (var i = ommnode.connections.from.length - 1; i >= 0; i--) {
			ommnode.connections.from[i].color(ommnode.color);
		};
	}

	ommnode.switchToNodeStyle = function(style, doNotTrig){
		if(typeof style == 'string') style = OpenMindMap.utils.getNameSpacedFunction(style);
		hideColorPicker();
		var newNode = new style({omm : omm, position : ommnode.box.getBBox(), guid: ommnode.guid, parent : ommnode.parent, text : ommnode.labeltext, color : ommnode.color, radius : ommnode.radius});
		newNode.children = ommnode.children;
		newNode.connections = ommnode.connections;	
		newNode.attachments = ommnode.attachments;	
		newNode.wiki = ommnode.wiki;	
		if(!ommnode.isroot) newNode.connections.from[0].endNode = newNode;				
		for (var i = ommnode.children.length - 1; i >= 0; i--) {
			newNode.children.push(ommnode.children[i]);
			newNode.children[i].parent = newNode;
			newNode.children[i].connections.from[0].startNode = newNode;
			newNode.children[i].connections.from[0].endNode = newNode.children[i];
		};
		newNode.isroot = ommnode.isroot;
		ommnode.box.remove();
		ommnode.label.remove();
		ommnode.badges.remove();
		ommnode.removed = true;
		for(var i=0, ii=ommnode.dependencies.length; i<ii; i++){
			ommnode.dependencies[i].element.remove();
		}
		if(!ommnode.isroot){
			ommnode.parent.removeChild(ommnode);
			newNode.parent.removeChild(ommnode);
			newNode.parent.children.push(newNode);
		}
		var i = omm.nodes.indexOf(ommnode);
		omm.nodes[i] = newNode;
		omm.updateNodesRef();
		omm.updateconnections();
		newNode.afterUpdate(true);
		omm.changed = true;
		newNode.fixSize();
		if(!doNotTrig)	newNode.switchStyleTrigger(ommnode.guid, newNode.toString());
	};

	ommnode.switchStyleTrigger = function(guid, style){		
		omm.triggerEvent('node-switched-style', {node: guid,  style: style});		
	};
	ommnode.onMoveTrigger = function(dx, dy){
		omm.triggerEvent('node-moved', {position: OpenMindMap.utils.point(dx,dy), node: ommnode.guid, childLocked: ommnode.childLocked});		
	};
	ommnode.setTextTrigger = function(text){
		omm.triggerEvent('node-change-text', {text: text, node: ommnode.guid});			
	};
	ommnode.removeTrigger = function(text){
		omm.triggerEvent('node-deleted', {node: ommnode.guid});				
	};	
	/* end node triggers */
	
	ommnode.setDependent = function(element){
		var delta = OpenMindMap.utils.point(element.getBBox().x - ommnode.box.getBBox().x, element.getBBox().y - ommnode.box.getBBox().y)
		var i = ommnode.dependencies.push({element : element, delta : delta});
		ommnode.dependencies[i-1].element.drag(ommnode.onMove, ommnode.onStartDrag, ommnode.onEndDrag);
		ommnode.dependencies[i-1].element.hover(function(){ommnode.badges.show();}, function(){ommnode.badges.hide();});
		ommnode.dependencies[i-1].element.ommnode = ommnode;
		ommnode.dependencies[i-1].element.attr('cursor', 'move');
	}
	
	ommnode.badges = {
		badges : [],
		push : function(b){
			return this.badges.push(b);
		},
		draw : function(){
			var badge;
			var x;
			var y = ommnode.margin().y - 9;
			for(var i=0, ii = this.badges.length; i < ii; i++){
				badge = this.badges[i];
				if(badge.drawed) continue;
				if(0 == i){	
					x = ommnode.margin().x;
				}else{
					x = this.badges[i-1].getBBox().x + badge.width + 2;
				}
				badge.draw(x, y);				
			}
		},
		fixpositions : function(){
			var x;
			var y  =  ommnode.margin().y - 9;
			for(var i=0, ii = this.badges.length; i < ii; i++){
				if(ommnode.isroot){
					x = ommnode.margin().x + ommnode.margin().width / 2 - this.badges[i].width / 2;
				}else{
					if(0 == i){
						x = ommnode.margin().x - 9;					
					}else{
						x = this.badges[i-1].getBBox().x + badge.width + 2;
					}
				}
				badge = this.badges[i];
				badge.updateposition(x,y);
			}
		},
		show : function(){
			for(var i=0, ii = this.badges.length; i < ii; i++){
				this.badges[i].show();
			}
		},
		hide : function(){
			for(var i=0, ii = this.badges.length; i < ii; i++){
				this.badges[i].hide();
			}
		},
		hover : function(fIn, fOut){
			if(fIn && fOut){
				this.hoverIn = fIn;
				this.hoverOut = fOut;				
			}
			for(var i=0, ii = this.badges.length; i < ii; i++){
				this.badges[i].hover(this.hoverIn, this.hoverOut);
			}		
		},
		remove : function(){
			for(var i=0, ii = this.badges.length; i < ii; i++){
				this.badges[i].remove();				
			}
			delete this.badges;
			this.badges = [];
		},
		get : function(i){
			if(this.badges.length <= i) return;
			return this.badges[i];
		}
	};
		
	ommnode.getConnectionCoordinates = function(node){
		if(ommnode.isroot){
			var bbox = ommnode.box.getBBox();
			var x = bbox.x + bbox.width / 2;
			var y = bbox.y + bbox.height / 2;
			return OpenMindMap.utils.point(x,y);
		}
		if(ommnode.box){
			var bbox = ommnode.box.getBBox();
			if(ommnode.leftOf(node)){
				var x = bbox.x + bbox.width;
				var y = bbox.y + bbox.height / 2;	
			}else{
				var x = bbox.x;
				var y = bbox.y + bbox.height / 2;							
			}			
			return OpenMindMap.utils.point(x,y);
		}else{
			return OpenMindMap.utils.point(0,0);
		}
	};

	ommnode.showWiki = function(){
		if(!ommnode.popoverOpen){
			if(ommnode.popoverCloseTimeout){
				clearTimeout(ommnode.popoverCloseTimeout);
				ommnode.popoverCloseTimeout = null;
			}			
			ommnode.popoverOpen = true;
			$(ommnode.box.node).popover('show');				
		}		
	};

	ommnode.hideWiki = function(){
		if(!ommnode.popoverCloseTimeout){
			ommnode.popoverCloseTimeout = setTimeout(function(){
				ommnode.popoverOpen = false;
				$(ommnode.box.node).popover('hide');		
			},3000);
		}		
	};
	if(!omm.isReadOnly()){
		var add_badge = new OpenMindMap.node.badge({
				icon    : '/assets/add.png', 
				width	: 18,
				height  : 18,	
				omm		: omm,			
				title   : 'Drag to add a child node', 
				onDragStart: function(x,y,e){		
					x = Math.floor(x / omm.scaleratio) + omm.zoomX;		
					y = Math.floor(y / omm.scaleratio) + omm.zoomY;			
					if(ommnode.isroot){
						var color = omm.getcolor();	
					}else{
						var color = ommnode.color;
					}
					ommnode.originalCoordDragNode = new OpenMindMap.node.dummy(x,y);	
					ommnode.onStartDragNode 	  = new OpenMindMap.node.dummy(x,y,color);	
					ommnode.onStartDragConnection = omm.addconnection(ommnode, ommnode.onStartDragNode, color) - 1;			
					omm.isDraggingNode = true;
				},
				onDrag  : function(dx,dy,x,y,e){
					x = Math.floor(x / omm.scaleratio) + omm.zoomX;			
					y = Math.floor(y / omm.scaleratio) + omm.zoomY;			
					ommnode.onStartDragNode.setCoordinates(x, y);
					omm.connections[ommnode.onStartDragConnection].update();	
				},
				onDragEnd : function(e){
					var xy = ommnode.onStartDragNode.getConnectionCoordinates();			
					if(xy.x == ommnode.originalCoordDragNode.x){
						if(ommnode.isroot){
			                    var positionrl = 'right';
			                    var icon = omml.paper.getById(e.target.raphaelid).getBBox();
			                    var midX = icon.x + icon.width/2;
			                    if (e.offsetX < midX) {
			                        positionrl = 'left';
			                    }	                    
			                    omm.addnode({parent : ommnode, position : positionrl, color: ommnode.onStartDragNode.color});                                 
			            }else{
			                    omm.addnode({parent : ommnode});                
			            }
					}else{
						if(ommnode.isroot){
							var color = ommnode.onStartDragNode.color
						}else{
							var color = null;
						}
						omm.addnode({parent : ommnode, positionxy: xy, color: color});				
					}
					omm.connections[ommnode.onStartDragConnection].remove();	
					omm.connections.splice(ommnode.onStartDragConnection,1);	
					omm.updateNodesRef();
					delete ommnode.originalCoordDragNode;
					delete ommnode.onStartDragNode;	
					omm.isDraggingNode = false;		
				}
			});
			
			ommnode.badges.push(add_badge);
	}
		
	ommnode.foldChildren = function(){		
		for(var i=0, ii = ommnode.children.length;i<ii;i++){
			ommnode.children[i].foldChildren();
			ommnode.children[i].hide();
			ommnode.children[i].hidden = true;
		}
	};

	ommnode.unfoldChildren = function(){
		for(var i=0, ii = ommnode.children.length;i<ii;i++){
			ommnode.children[i].unfoldChildren();
			ommnode.children[i].show();
			ommnode.children[i].hidden = false;
		}
	};

	ommnode.show = function(){
		ommnode.box.show();
		ommnode.label.show();
		for(var i=0,ii=ommnode.dependencies.length;i<ii;i++){
			ommnode.dependencies[i].element.show();
		}
		ommnode.connections.from[0].show();		
	};

	ommnode.hide = function(){
		ommnode.box.hide();
		ommnode.label.hide();
		for(var i=0,ii=ommnode.dependencies.length;i<ii;i++){
			ommnode.dependencies[i].element.hide();
		}
		ommnode.connections.from[0].hide();
	};

	ommnode.text = function(val, trigger) {
		if (val) {
			ommnode.labeltext = val;
			ommnode.label.attr('text', val);
			if(trigger)	ommnode.setTextTrigger(val);
			omm.changed = true;
			if(val.isUrl()){
				console.log(val, 'is url')
			}
		}
		return ommnode.labeltext;
	};

	ommnode.showEditor = function(trigger) {
		omm.centerNode(ommnode);
		if(omm.isReadOnly()) return;
		omm.editorOpened = true;
		$editor = $('#placeHolder');
		$editor.css('top',  ommnode.margin().y / omm.scaleratio + omm.zoomY);
		$editor.css('left', ommnode.margin().x / omm.scaleratio + omm.zoomX);		
		$editor.show();
		$inputbox = $('#placeHolder > #inputBox');
		$inputbox.val(ommnode.text());
		$inputbox.focus();
		$inputbox.select();
		$editor.off('focusout');
		$inputbox.off('keyup');
		
		$inputbox.keyup(this, function(event){
			if(event.data.isroot){
				$('#map-title').text($inputbox.val());
				$('title').text(String.format('OpenMindMap - {0}', $inputbox.val()));
			}
			if (OpenMindMap.utils.KEY_ENTER == event.keyCode && !event.shiftKey){
				$inputbox.off('keyup');
				$editor.triggerHandler('focusout');
				return false;
			}
			if (OpenMindMap.utils.KEY_ESC == event.keyCode){
				$inputbox.val(event.data.text());
				$editor.triggerHandler('focusout');
			}
		});
		$editor.focusout(this, function(event) {
			$(this).hide();
			event.data.text($inputbox.val().trim());
			event.data.fixSize();
			trigger.call(ommnode, event.data.text());
			omm.changed = true;
			omm.editorOpened = false;
			return false;
		});
	};

	ommnode._moveBox = function(dx,dy){
		/* Don't go over the edge of paper */
		if(ommnode.box.ox + dx < 0 ){ dx = -ommnode.box.ox;	}		
		if(ommnode.box.oy + dy < 0 ){ dy = -ommnode.box.oy;	}

		/* BETA: enlarge paper while try to move node over the edge of paper */
		if(ommnode.box.ox + dx + ommnode.box.attrs.width > omm.setup.paper.size.width) {
			omm.paper.setSize(ommnode.box.ox + dx + ommnode.box.attrs.width + 150, omm.setup.paper.size.height);
		}
		if(ommnode.box.oy + dy + ommnode.box.attrs.height > omm.setup.paper.size.height ){
			omm.paper.setSize(omm.setup.paper.size.width, ommnode.box.oy + dy + ommnode.box.attrs.height + 150);
		}	

		var att = {
			x : ommnode.box.ox + dx,
			y : ommnode.box.oy + dy
		};
		ommnode.box.attr(att);
	}	

	ommnode.onMove = function(dx, dy, updateChild) {
		ommnode._moveBox(dx, dy);
		ommnode._moveLabel(dx, dy);		
		ommnode.badges.fixpositions();
		for(var i=0, ii=ommnode.dependencies.length;i<ii;i++){
			att = {
				x : ommnode.dependencies[i].element.ox + dx, 
				y : ommnode.dependencies[i].element.oy + dy
			};
			ommnode.dependencies[i].element.attr(att);
		}		
		for(var i=0, ii=ommnode.children.length;i<ii;i++){
			if(ommnode.childLocked){
				ommnode.children[i].onMove(dx, dy, true);
			}else{				
				ommnode.children[i].connections.from[0].update();
				ommnode.children[i].afterUpdate();
			}
		}
		if(updateChild == null) updateChild = true;
		if(updateChild && !ommnode.isroot) ommnode.connections.from[0].update();
		ommnode.afterUpdate(true);
		ommnode.isEndingDrag = true;		
	};
	
	ommnode.onStartDrag = function() {	
		omm.isDraggingNode = true;
		if(ommnode.wiki){
			$(ommnode.box.node).popover('hide');
		}
		omm.deselectConnection();
		// save original coordinates
		ommnode.box.ox = ommnode.box.attr("x");
		ommnode.box.oy = ommnode.box.attr("y");
		ommnode._dragLabel();
		for(var i=0, ii=ommnode.dependencies.length;i<ii;i++){
			ommnode.dependencies[i].element.ox = ommnode.dependencies[i].element.attr("x");
			ommnode.dependencies[i].element.oy = ommnode.dependencies[i].element.attr("y");
		}
		if(ommnode.childLocked){
			for(var i=0, ii=ommnode.children.length;i<ii;i++){
				ommnode.children[i].onStartDrag();
			}
		}
		omm.changed = false;
		if(omm.hud().hud){
			omm.hud().showHUD = true;
			omm.hud().togglePin();
		} 
	};
		
	ommnode.onEndDrag = function(e,b){
		if(ommnode.isEndingDrag){
			ommnode.isEndingDrag = false;
			ommnode.onMoveTrigger(ommnode.box.getBBox().x ,ommnode.box.getBBox().y);
		}	
		ommnode.afterUpdate(true);	
		omm.setSelectedNode(ommnode);
		omm.changed = true;
		omm.isDraggingNode = false;
	};

	/* new node position */
	ommnode.leftOfRoot = function() {
		return ommnode.leftOf(omm.root);		
	}

	ommnode.leftOf = function(node){
		return (node.margin().x > ommnode.box.getBBox().x);
	}
	
	ommnode.getOtherProperties = function(){return null}
	ommnode.getAllProperties = function(){
		var serializedNode =  {
				color 		: ommnode.color, 	
				position	: OpenMindMap.utils.point(ommnode.margin().x, ommnode.margin().y),
				delta 		: ommnode.getDeltaPosition(), 				
				size		: ommnode.size,
				text		: ommnode.text(),
				radius		: ommnode.radius,
				guid		: ommnode.guid,
				style		: ommnode.toString(),
				weight		: ommnode.weight(),
				italic		: ommnode.style(),
				font		: ommnode.font()
		};
		
		serializedNode.otherProperties = ommnode.getOtherProperties();
		if(ommnode.isroot){
			serializedNode.isroot = true;
		}else{
			serializedNode.parentGUID = ommnode.parent.guid;
			serializedNode.c_delta = ommnode.connections.from[0].getDeltaCoords();
		}
		return serializedNode;
	}

	ommnode.getDeltaPosition = function(){
		if(ommnode.isroot){
			return OpenMindMap.utils.point(0,0);	
		}
		var x = ommnode.margin().x - ommnode.parent.margin().x;
		var y = ommnode.margin().y - ommnode.parent.margin().y;
		return OpenMindMap.utils.point(x, y);
	}

	ommnode.remove = function(doNotTrig){
		if(omm.isReadOnly()) return;
		if(ommnode.isroot){
			alert('You can\'t remove the root node');
			throw('Trying to remove root');
		}		
		ommnode._remove();		
		ommnode.parent.removeChild(ommnode);		
		for(var i=0, ii = omm.connections.length; i < ii; i++){			
			if(omm.connections[i].startNode.removed || omm.connections[i].endNode.removed){
				omm.connections[i].remove();
				omm.connections[i].removed = true;
			}
		}		
		omm.updateNodesRef();
		omm.updateconnections();		
		if(!doNotTrig) ommnode.removeTrigger();	
		omm.changed = true;
		ommnode.parent.fixSize();
		omm.centerNode(ommnode.parent);
	};
	
	ommnode.removeChild = function(child){
		var i = ommnode.children.indexOf(child);
		if(-1 < i){
			ommnode.children.splice(i, 1);
		}
	};
	
	ommnode._remove = function(){
		ommnode.box.remove();
		ommnode.label.remove();
		ommnode.badges.remove();
		ommnode.removed = true;
		for(var i=0, ii=ommnode.dependencies.length; i<ii; i++){
			ommnode.dependencies[i].element.remove();
		}		
		for(var i=0, ii=ommnode.children.length; i<ii; i++){
			ommnode.children[i]._remove();
		}
	};
	
	ommnode.toString = function(){ return 'OpenMindMap.node.base' }
	this.setChanged = function(changed){
		this.changed = changed;
	};

	ommnode.getDeltaPositionBetween = function(node)
	{
		var thisPosition = ommnode.getCenter();
		var thatPosition = node.getCenter();
		var x = thisPosition.x - thatPosition.x;
		var y = thisPosition.y - thatPosition.y;
		return OpenMindMap.utils.point(x,y);
	};
	
	ommnode.setBox = function(element){
		ommnode.box = element;
		ommnode.box.node.setAttribute('class', 'nodes-menu');		
		/* add circular connections between shapes */
		ommnode.box.ommnode = ommnode;			
		/* end circular connections */
		ommnode.margin = function(){
			return ommnode.box.getBBox();
		};
		ommnode.getCenter = function(){
			var margin = ommnode.margin();
			return OpenMindMap.utils.point(margin.x + margin.width / 2, margin.y + margin.height / 2);
		};

		/* Picker additional function */
		ommnode.badges.draw();
		ommnode.badges.fixpositions();
		ommnode.badges.hide();
		
		/* Node triggers */
		ommnode.box.hover(function(){ 
			ommnode.badges.show(); 
			var oldStrokeWidth = ommnode.box.node.getAttribute('stroke-width');
			ommnode.box.node.setAttribute('stroke-width', ++oldStrokeWidth);
			if(ommnode.wiki) ommnode.showWiki();
		}, function(){
			ommnode.badges.hide();
			var oldStrokeWidth = ommnode.box.node.getAttribute('stroke-width');
			ommnode.box.node.setAttribute('stroke-width', --oldStrokeWidth);
			if(ommnode.wiki) {
				ommnode.hideWiki();
			}
		});			
		ommnode.box.drag(ommnode.onMove, ommnode.onStartDrag, ommnode.onEndDrag);
		ommnode.badges.hover(function(){ommnode.badges.show();}, function(){ommnode.badges.hide();});
		ommnode.box.dblclick(function(){
			ommnode.showEditor(ommnode.setTextTrigger);
		});
		ommnode.box.click(function(e){
			if(e.shiftKey && e.ctrlKey && ommnode.labeltext.isUrl()){
				var url = ommnode.labeltext;
				if(!url.hasUrlProtocol()){
					url = 'http://' + url;
				}
				window.open(url, '_blank');					
			}
			omm.setSelectedNode(ommnode);
		})
		/* end node triggers */		
	};

	ommnode.setLabel = function(pos){	
		if(!pos) throw 'No position given';
		ommnode.label_padding = pos;
		if(ommnode.label){
			var new_position = OpenMindMap.utils.point(ommnode.label_padding.x + ommnode.margin().x, ommnode.label_padding.y + ommnode.margin().y);
			ommnode.label.attr(new_position);			
		}else{
			ommnode.label = omm.paper.text(ommnode.margin().x + pos.x, ommnode.margin().y + pos.y, ommnode.labeltext);				
			ommnode.label.node.setAttribute('class', 'nodes-menu');
		}
		
		ommnode.label.textsize = ommnode.label.attr('font').match(/^\d(\d)?(\d)?/)[0];
		ommnode.label.node.setAttribute('class', 'nodes-menu');

		/* add circular connections between shapes */
		ommnode.label.ommnode = ommnode;
		/* end circular connections */
		/* Node triggers */
		ommnode.label.hover(function(){
			ommnode.badges.show();
			if(ommnode.wiki) ommnode.showWiki();
		}, function(){
			ommnode.badges.hide();
			if(ommnode.wiki) ommnode.hideWiki();
		});
		ommnode.label.dblclick(function(){ommnode.showEditor(ommnode.setTextTrigger)});
		ommnode.label.touchmove(ommnode.onMove);
		ommnode.label.touchstart(ommnode.onStartDrag);
		ommnode.label.touchend(ommnode.onEndDrag);
		ommnode.label.drag(ommnode.onMove, ommnode.onStartDrag, ommnode.onEndDrag);
		ommnode.label.attr('cursor', 'move');
		ommnode.label.margin = function(){
			return ommnode.label.getBBox();
		};
		ommnode.label.click(function(e){
			if(e.shiftKey && e.ctrlKey && ommnode.labeltext.isUrl()){
				var url = ommnode.labeltext;
				if(!url.hasUrlProtocol()){
					url = 'http://' + url;
				}
				window.open(url, '_blank');					
			}
			omm.setSelectedNode(ommnode);			
		})
		ommnode.afterUpdate();
	};

	ommnode.setLabelStyle = function(style){
		if(!style) throw 'No style given';
		if(!ommnode.label) throw 'Label not initialized';
		ommnode.label.attr(style);
	};

	ommnode.setLabelTextSize = function(size){
		ommnode.setLabelStyle({ "font-size": size, "font-family": "Arial, Helvetica, sans-serif" });
		ommnode.afterUpdate();
	};

	ommnode.resetLabelPosition = function(){
		var new_position = OpenMindMap.utils.point(ommnode.margin().x + ommnode.margin().width/2, ommnode.margin().y + ommnode.margin().height/2);
		ommnode.label.attr(new_position);	
		return;
	};

	ommnode._dragLabel = function(){
		ommnode.label.ox = ommnode.label.attr("x");
		ommnode.label.oy = ommnode.label.attr("y");
	};

	ommnode._moveLabel = function(dx,dy){
		var att = {
			x : ommnode.label.ox + dx, 
			y : ommnode.label.oy + dy
		};
		ommnode.label.attr(att);
	};

	ommnode.fixLabelSize = function(){
		if (ommnode.label.getBBox().height * OpenMindMap.utils.PHI < omm.setup.node.size.height) {
			if(ommnode.isroot){
				ommnode.box.attr('height', omm.setup.node.root.size.height);
			}else{
				ommnode.box.attr('height', omm.setup.node.size.height);
			}
		} else {
			ommnode.box.attr('height', ommnode.label.getBBox().height * OpenMindMap.utils.PHI);
		}
	};
	
	ommnode.select = function(){		
		if(!ommnode.removed) ommnode.label.attr('fill', '#F00');
	}
	
	ommnode.deselect = function(){
		if(!ommnode.removed) ommnode.label.attr('fill', '#000');
	}
	
	ommnode.bold = function(){		
		var newWeight = 'bold';
		if(ommnode.weight() == 'bold'){
			newWeight = 400;
		};
		ommnode.weight(newWeight);
	}
	
	ommnode.weight = function(weight){
		if(!ommnode.label) return;
		if(weight){
			ommnode.label.attr('font-weight', weight);
			omm.changed = true;
		}
		return ommnode.label.attr('font-weight');
	}
	
	ommnode.style = function(style){
		if(!this.label) return;
		if(style){
			ommnode.label.attr('font-style', style);
			omm.changed = true;
		}		
		return ommnode.label.attr('font-style');
	}
	
	ommnode.italic = function(){		
		var style  = 'italic';
		if(ommnode.style() == 'italic'){
				style = 'normal';
		}	
		ommnode.style(style);		
	}
	
	ommnode.font = function(val){
		if(val){
			ommnode.label.attr('font-family', val);
		}
		return ommnode.label.attr('font-family');
	}
	
	ommnode.getOrderedChildren = function()
	{
		var leftOfNodes  = [];
		var rightOfNodes = [];
		for (var i = 0, ii=ommnode.children.length; i < ii; i++){
			if(ommnode.children[i].leftOf(ommnode)){
				leftOfNodes.push(ommnode.children[i]);
			}else{
				rightOfNodes.push(ommnode.children[i]);
			}			
		};
		var orderFunctionLeft = function(a,b){
			return a.margin().y <  b.margin().y
		};
		var orderFunctionRight = function(a,b){
			return a.margin().y >  b.margin().y
		};
		
		leftOfNodes.sort(orderFunctionLeft);
		rightOfNodes.sort(orderFunctionRight);
		rightOfNodes = rightOfNodes.concat(leftOfNodes);
		return rightOfNodes;
	}
	
	ommnode.zoomAndPan = function()
	{
		ommnode.map.zoomUpdateViewBox(300);
        ommnode.map.centerNode(ommnode);
	}
}