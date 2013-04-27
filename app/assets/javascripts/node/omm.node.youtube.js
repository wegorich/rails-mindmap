OpenMindMap.node.youtube = function(params){
	OpenMindMap.node.image.call(this, params);
	this.name = 'Youtube';
	this.videoData;
	if(params.otherProperties){
		this.videoData = params.otherProperties.videoData;		
	}
	var ommnode = this;
	this.loadYoutubeVideo = function(){
		if(!this.videoData) throw('Video data not found');
		this.text(this.videoData.title);
		if(this.videoData.thumbnail.hqDefault){
			var thumbUrl = this.videoData.thumbnail.hqDefault;
		}else{
			var thumbUrl = this.videoData.thumbnail.sdDefault;
		}
		this.setImage(thumbUrl, 0, 0, 240, 160);
		this.image.dblclick(function(){
			var videoFrame = String.format('<object width="{0}" height="{1}">', 500, 300) +
							 String.format('<param name="movie" value="http://www.youtube.com/v/{0}?version={1}&autohide={2}&showinfo={3}&autoplay={4}"></param>', ommnode.videoData.id, 3, 0, 0, 1) +
			  				 '<param name="allowScriptAccess" value="always"></param>' +
							 String.format('<embed src="http://www.youtube.com/v/{0}?version={1}&autohide={2}&showinfo={3}&autoplay={4}" type="application/x-shockwave-flash" allowscriptaccess="always" width="{5}" height="{6}"></embed></object>', ommnode.videoData.id, 3, 0, 0, 1, 500, 300) +
							 String.format('<a href="#" class="btn" onclick="changeVideo(\'{0}\')">Change video</a>', ommnode.guid);
			$('#attachment-modal .modal-body p').html(videoFrame);
			$('#attachment-modal').modal({
				keyboard: true,
				backdrop: 'static',
				show: true
			});
		});
		ommnode.setChanged(true);
	};
	this.showYouTubeSearchBox = function(){
		$('#youtube-modal input#guid').val(this.guid);
		$('#youtube-modal').modal({
			keyboard: true,
			backdrop: 'static',
			show: true
		});
	};
	this.getOtherProperties = function(){
		return {videoData : this.videoData};
	};
	this.toString = function(){ return 'OpenMindMap.node.youtube' };
	
	if(this.videoData) {
		this.loadYoutubeVideo();
	} else {
		this.showYouTubeSearchBox(this.loadYoutubeVideo);
	}
	this.label.hide();
}
OpenMindMap.node.youtube.prototype = OpenMindMap.node.image.prototype;
OpenMindMap.node.youtube.constructor = OpenMindMap.node.youtube;