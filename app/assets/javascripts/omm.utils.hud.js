OpenMindMap.utils.hud = function(params) {
	var hudObject = this;

	this.classSetup = function() {
		this.hud = $('#' + params.id);
		this.title = $('#node-title');
		this.color = $('#node-color');
		this.font = $('#node-font');
		this.link = $('#node-link');
		this.link.css('visibility', 'hidden');
		this.nodeHud = $('#node-hud');
		this.mapHud = $('#map-hud').hide();
		this.selectedNode = null;
		this.showHUD = true;
		this.omm = null;
		this.pin = $('#btn-toggle-hud');
		this.hud.draggable({
			cursor : 'move'
		});
		this.title.on('focusin', function() {
			hudObject.omm.editorOpened = true;
			hudObject.omm.isDefaultEventHandler = false;
		}).on('focusout', function() {
			hudObject.omm.editorOpened = false;
			hudObject.omm.isDefaultEventHandler = true;
		}).on('keyup', function() {
			hudObject.selectedNode.text($(this).val());
		});

		this.hud.button();
		$('#btn-bold').click(function() {
			hudObject.selectedNode.bold();
		});
		$('#btn-italic').click(function() {
			hudObject.selectedNode.italic();
		});
		$('#node-color').ColorPicker({
			onSubmit : function(hsb, hex, rgb, el) {
				$(el).val(hex);
				$(el).ColorPickerHide();
				hudObject.selectedNode.updateColor(hex);				
			},
			onBeforeShow : function() {
				$(this).ColorPickerSetColor(this.value);
			},
			onChange : function(hsb, hex, rgb) {
				$('#node-color').val(hex);
				$('#node-color').css('color', '#' + hex);
				hudObject.selectedNode.updateColor(hex);
			}
		}).bind('keyup', function() {
			$(this).ColorPickerSetColor(this.value);
		});
		$('#btn-fold').click(function() {
			hudObject.omm.selectedNodeActions('foldunflodchild');
		});
		$('#btn-lock').click(function() {
			hudObject.omm.selectedNodeActions('lockunlockchild');
		});		
		$('#btn-remove').click(function() {
			hudObject.omm.selectedNodeActions('delete');
		});				
		$('#btn-hud-wiki-show').click(function() {
			hudObject.omm.selectedNodeActions('openwikipage');
		});		
		$('#btn-hud-wiki-edit').click(function() {
			hudObject.omm.selectedNodeActions('editwikipage');
		});		
		var nodeFonts = ['', 'arial', 'serif', 'cursive', 'times', 'fantasy', 'monospace'];
		
		for (var i = nodeFonts.length - 1; i >= 0; i--){
		  this.font.append(String.format("<option value='{0}'>{1}</option>", nodeFonts[i], nodeFonts[i].capitalize()))
		};
		this.font.val('');
		this.font.on('change', function(){
			if($(this).val() == ''){
				val = nodeFonts[1];
			}
			hudObject.selectedNode.font($(this).val());
		})

		/* map hud elements */
		$('#btn-share').click(function() {
			this.omm.share();
			this.setupShareButton();
		});
		
		this.togglePin = function(){
			if(!hudObject.selectedNode) return;
			hudObject.showHUD = !hudObject.showHUD;			
			if(hudObject.showHUD){
				hudObject.hud.show();			
			}else{
				hudObject.hud.hide();				
			}
			hudObject.pin.find('i').toggleClass('icon-resize-small icon-resize-full');
		};
		this.pin.click(this.togglePin)
		
		this.topDelta = 0;
		this.top = this.hud.css('top');
		$(document).on('scroll', function(){
			$('#node-hud').css('top', $(document).scrollTop() + 50 + 'px')
		})
		$('#node-hud').css('top', $(document).scrollTop() + 50 + 'px');
		this.hud.hide();
	}

	this.chooseNode = function(node) {
		if(!node) {
			this.clean();
			return;
		}
		this.selectedNode = node;
		this.pin.show();
		this.title.val(node.text()).attr('disabled', false);		
		this.hud.find('.btn').attr('disabled', false);
		this.color.val(node.color).attr('disabled', false);
		this.color.css('color', node.color);
		
		/* Settings button style */
		if(this.selectedNode.weight() == 'bold') {
			$('#btn-bold').addClass('active')
		} else {
			$('#btn-bold').removeClass('active')
		}
		if(this.selectedNode.style() == 'italic') {
			$('#btn-italic').addClass('active')
		} else {
			$('#btn-italic').removeClass('active')
		}
		if(hudObject.selectedNode.childFolded){
			$('#btn-fold').addClass('active');
		} else {
			$('#btn-fold').removeClass('active');
		}
		if(hudObject.selectedNode.childLocked){
			$('#btn-lock').removeClass('active');			
		} else {
			$('#btn-lock').addClass('active');
		}		
		
		/* Load wiki page */
		if(this.selectedNode.wiki){
			$('#hud-wiki-content').html(this.omm.converter.makeHtml(this.selectedNode.wiki.content));
		}else{
			$('#hud-wiki-content').html('');
		}

		if(this.selectedNode.text().isUrl()){
			var url = this.selectedNode.text();
			if(!url.hasUrlProtocol()){
				url = 'http://' + url;
			} 
			this.link.attr('href', url);
			this.link.css('visibility', 'visible');	
		}else{
			this.link.css('visibility', 'hidden');
		}
		var font = hudObject.selectedNode.font().split(', ');
		if(font.length > 1) font = font[0].toLowerCase();
		this.font.val(font);
		if(hudObject.showHUD){			
			this.hud.fadeIn('fast');
			this.mapHud.hide();
			this.nodeHud.show();
		}
		
	}
	this.chooseMap = function(){
		/*TODO: Create e Hud for map */
		return false;

		this.setupShareButton();
		$('#btn-share').attr('disabled', false);
		this.mapHud.show();
		this.nodeHud.hide();
	}
	this.setupShareButton = function(){
		if(this.omm.shared) {
			$('#btn-share').addClass('active');
			$('#btn-share i').removeClass('icon-eye-close').addClass('icon-eye-open');
			$('#btn-share span').text('public')
		} else {
			$('#btn-share').removeClass('active');
			$('#btn-share i').removeClass('icon-eye-open').addClass('icon-eye-close');
			$('#btn-share span').text('private')
		}
	}
	this.clean = function() {
		this.link.css('visibility', 'hidden');
		this.title.val('').attr('disabled', true);
		this.color.val('').attr('disabled', true);
		this.font.val('-');
		this.hud.find('.btn').attr('disabled', true);		
	}

	this.classSetup();
}