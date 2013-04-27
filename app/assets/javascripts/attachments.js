// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
//= require Markdown.Converter
//= require Markdown.Sanitizer
//= require Markdown.Editor
//= require jquery.lightbox-0.5

$(document).ready(function(){
	var c = new Markdown.Converter();
	var e = new Markdown.Editor(c);
	e.run();
	$('.mappreview').click(function(){ $(this).fadeToggle() })
});

backToMap = function(id){
	if(confirm('Back to map without saving?')){
		window.location.replace('/maps/' + id + '/edit');
	}
}
