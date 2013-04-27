//= require cocoon.i18n
//= require lang/omm.cocoon.i18n.it
//= require jquery.ui.position
//= require jquery.contextMenu
//= require eye
//= require colorpicker
//= require omm
//= require raphael
//= require omm.utils
//= require omm.utils.hud
//= require jquery.color
//= require ./connection/omm.connection.base
//= require_tree ./connection
//= require ./node/omm.node.base
//= require ./node/omm.node.noborder
//= require ./node/omm.node.image


//= require_tree ./node
//= require_tree ./config
//= require omm.map
//= require omm.badges
//= require omm.image
//= require omm.images.clipart
//= require omm.images.backgrounds
//= require autocomplete-rails
//= require myriad-pro.cufonfonts
//= require jquery.lightbox-0.5
//= require Markdown.Converter
//= require screenfull

var t = new CocoonJS.i18n({defaultLang : 'en'});

openWikiPage = function(content, title){
		$('#attachments-wiki-modal > .modal-header > h3').html(title);
		$('#attachments-wiki-modal > .modal-body > p').html(content);
		$('#attachments-wiki-modal').modal({
			keyboard: true,
			backdrop: 'static',
			show: true
		});
	};			

editFunc = function(guid){
	omml.save({versioning: false, callback : (function(guid){
		var node = omml.getNodeByGUID(guid);
		var editUrl = '/maps/' + omml.mapid + '/nodes/' + guid + '/attachments/' + node.wiki.id + '/edit?title=' + node.text();
		window.location.replace(editUrl);
	})(guid)});							
};

showWikiPageId = function(guid){
	if(!$('#wiki').is(':visible')){
		var node = omml.getNodeByGUID(guid);							
		if(!node.wiki) return;
		var buttons = "<a href='#' onclick='editFunc(\"" + guid+ "\")' class='btn primary'>Edit</a>&nbsp;<a href='#' onclick='$(\"#wiki\").hide()' class='btn success'>Close</a>";
		var content = '<h1>' + node.text() + '</h1>' + omml.converter.makeHtml(node.wiki.content) + buttons;
		$('#wiki').html(content);
		$('#wiki').show();		
	}else{
		$('#wiki').hide();
	}
};

var zoomLevel = 50;
zoom = function(event, ui){	
	$("#zoomSlider > a").text(ui.value + ' %')
	omml.zoomUpdateViewBox(ui.value);
};

resetZoom = function(){
	$("#zoomSlider").slider('option', 'value', 100)
	$("#zoomSlider > a").text('100 %');
	omml.zoomUpdateViewBox(100);
	omml.centerRootNode();
}

setZoomSlider = function(val){
	$("#zoomSlider > a").text(val + ' %');
	$("#zoomSlider").slider('option', 'value', val);
}

gotoWikiEditorClick = function(menu, element){
	var node = omml.paper.getById(element.$trigger[0].raphaelid).ommnode;
	gotoWikiEditor(node);
	return;		
};

gotoWikiEditor = function(node){
	if(omml.is_not_saved('You need to save the map before add a wiki page')) {
		return;
	}
	omml.save({versioning: false, callback: function(){			
		var wikiUrl = '/maps/' + omml.mapid + '/nodes/' + node.guid + '/attachments/';
		if(node.wiki){
			wikiUrl = wikiUrl + node.wiki.id + '/edit';
		}else{
			wikiUrl = wikiUrl + 'new';
		}
		window.location.replace(wikiUrl);
	}});		
};

selectColor = function(menu, element){
	$('#colorpickerHolder').ColorPicker({
		flat : true,
		onSubmit: function(hsb, hex, rgb, el) {
			omml.paper.getById(element.$trigger[0].raphaelid).ommnode.updateColor(hex);
			$(el).ColorPickerHide();
		},
		onBeforeShow: function () {
			$(this).ColorPickerSetColor(omml.paper.getById(element.$trigger[0].raphaelid).ommnode.color);
		}
	});
	var ommnode = omml.paper.getById(element.$trigger[0].raphaelid).ommnode;
	$('#colorpickerHolder').css('top',  ommnode.box.getBBox().y + ommnode.box.getBBox().height + 50);
	$('#colorpickerHolder').css('left', ommnode.box.getBBox().x);
	$('#colorpickerHolder > .colorpicker').show();
};

selectConnectionColor = function(menu, element){
	$('#colorpickerHolder').ColorPicker({
		flat : true,
		onSubmit: function(hsb, hex, rgb, el) {
			omml.paper.getById(element.$trigger[0].raphaelid).connection.updateEndNodeColor(hex);
			$(el).ColorPickerHide();
		}
	});
	var path = omml.paper.getById(element.$trigger[0].raphaelid);
	var coord = path.getPointAtLength(path.getTotalLength());
	$('#colorpickerHolder').css('top',  coord.y + 50);
	$('#colorpickerHolder').css('left', coord.x - 100);
	$('#colorpickerHolder > .colorpicker').show();
};

hideColorPicker = function(){
	$('#colorpickerHolder > .colorpicker').hide();
};

removeConnection = function(menu, element){
	if(!confirm('Delete connection and all connected nodes?')) return;
	var path = omml.paper.getById(element.$trigger[0].raphaelid);
	path.connection.endNode.remove();	
};

removeNode = function(menu, element){
	if(!confirm('Delete node and all descendant?')) return;
	var ommnode =  omml.paper.getById(element.$trigger[0].raphaelid).ommnode;
	ommnode.remove();
};


populateMenu = function(){
	var menuItems = omml.setup.allowedNodes;
	menuItems.separator1 = "---------";
	menuItems.wiki = {name: "Edit wiki page", icon: "wiki", callback: gotoWikiEditorClick, accesskey:"w"};
	menuItems.separator2 = "---------";
	menuItems.color = {name: "Select color", icon: "wiki", callback: selectColor, accesskey:"o"};
	menuItems.remove = {name: "Remove", icon: "remove", callback: removeNode, accesskey:"r"};
	$.contextMenu({selector: '.nodes-menu', items: menuItems});

	//Connections menu
	var connectionsItems = {};
	connectionsItems.color = {name: "Select color", icon: "wiki", callback: selectConnectionColor, accesskey:"o"};
	connectionsItems.separator1 = "---------";
	connectionsItems.remove = {name: "Remove", icon: "remove", callback: removeConnection, accesskey:"r"};
	
	$.contextMenu({selector: '.connection-menu', items: connectionsItems});
};

var showOrHideClipart = false;
var clipLoaded = false;

toggleClipartLibrary = function(){
	showOrHideClipart = !showOrHideClipart;
	$('#clipart').toggle(showOrHideClipart);
	if(showOrHideClipart){
		if(!clipLoaded){loadClip()}
	}	
};

loadClip = function(){
	$grid = $('#clipart > ul.thumbnails')
	var i = 0;
	$(OpenMindMap.images.clipart).each(function(){
		var data = '<li class="thumbnail"><img class="dragMe max-90x90" style="cursor:move" alt="' + i + '" height="90" style="height:90px" width="90" src="/assets/clipart/' + this.filename + '" /></li>';
		$grid.append(data)
		i++;
	});
	$('.dragMe').draggable({helper : 'clone', opacity : 0.7, handle : 'img'})
	$( "#holder" ).droppable({ 
		drop: function(e,ui){ omml.dropImage(e,ui); toggleClipartLibrary() },
		accept: "img.dragMe"	
	});
	$( "#holder > svg" ).droppable({ 
		drop: function(e,ui){ omml.dropImage(e,ui); toggleClipartLibrary() },
		accept: "img.dragMe"	
	});
	clipLoaded = true;
};

var showOrHideBackgrounds = false;
var backgroundLoaded = false;

toggleBackgroundLibrary = function(){
	showOrHideBackgrounds = !showOrHideBackgrounds;
	$('#backgounds').toggle(showOrHideBackgrounds);
	if(showOrHideBackgrounds){
		if(!backgroundLoaded){loadBackground()}
	}	
};

var showOrHideBackgroundsPicker = false;
toggleBackgroundColorpicker = function(){
	showOrHideBackgroundsPicker = !showOrHideBackgroundsPicker;
	if(!showOrHideBackgroundsPicker){
		$('#colorpickerBackgroundHolder').ColorPickerShow();
	}else{
		$('#colorpickerBackgroundHolder').ColorPickerHide();	
	}
};

loadBackgroundColorpicker = function() {
	$('#colorpickerBackgroundHolder').ColorPicker({
		color: '#fff',
		onShow: function (colpkr) {
			$(colpkr).fadeIn(500);
			return false;
		},
		onHide: function (colpkr) {
			$(colpkr).fadeOut(500);
			return false;
		},
		onChange: function (hsb, hex, rgb) {
			$('#holder').css('backgroundColor', '#' + hex);
		},
		onSubmit:  function(hsb, hex, rgb, el) {
			omml.changeBackgroundColor(hex);
			$(el).ColorPickerHide();
		},
		onCancel: function(){
			omml.resetBackgroundColor();
		}
	});
};

loadBackground = function(){
	var i = 0;
	$grid = $('#backgounds > ul.thumbnails')
	$(OpenMindMap.images.backgrounds).each(function(){
		var data = $('<li class="thumbnail"><a href="#"><img class="max-90x90" height="90" width="90" src="/assets/backgrounds/' + this.filename + '" /></a></li>');
		data.click(selectBackground);
		$grid.append(data);
		i++;
	});	
	backgroundLoaded = true;
};

resetBackgroundImage = function(){
	omml.resetBackgroundImage();
}

selectBackground = function(el){
	var img = $(this).children('a').children('img').attr('src');
	omml.changeBackgroundImage(img);
};

$(document).on('show', '#invite-user-modal, #youtube-modal, #attachment-modal', function(){
	omml.editorOpened = true;
});
$(document).on('hidden', '#invite-user-modal, #youtube-modal, #attachment-modal', function(){
	omml.editorOpened = false;
});

disableSelection = function(target){
	if (typeof target.onselectstart!="undefined"){ 		
		//IE route
		target.onselectstart = function(){ return false; };
	}else if(typeof target.style.MozUserSelect!="undefined"){
		//Firefox route
		target.style.MozUserSelect = "none";
	}else{
		//All other route (ie: Opera)
		target.onmousedown = function(){ return false; };
	}
	target.style.cursor = "default";
};

playMap = function()
{
	if(screenfull) screenfull.request( document.documentElement );
	$('#play-next').show();
	$('#play-map').hide();	
	$('#play-end').show();	
	$('#play-idx').show();
	omml.play()
};

hidePlayingNext = function(){
	$('#play-next').hide();
	$('#play-map').show();
	$('#play-end').hide();	
	$('#play-idx').hide();
};

closeMap = function()
{
	//Point to a inexistant node
	omml.playingIndex=-2;
	omml.next()
};

setSlideIndicator = function(idx, tot)
{
	$('#play-idx').text(String.format("{0}/{1}", ++idx, tot));
};