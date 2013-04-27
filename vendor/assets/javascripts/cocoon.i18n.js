/*
 * Piero Bozzolo - Javascript tiny i18n Utils
 * Relased under the GNU/GPL * 
 * 
 * https://bitbucket.org/petecocoon/cocoonjs/
 */
if(typeof CocoonJS == 'undefined') CocoonJS = {};

CocoonJS.i18n = function(){
	if(arguments[0].defaultLang){
		this.defaultLang = arguments[0].defaultLang;	
	}else{
		this.defaultLang = 'en-US';
	}
	this.i18n_messages = {};
	if(arguments[0].i18n_messages){
		this.i18n_messages[this.defaultLang] = arguments[0].i18n_messages;	
	}	
	this._ = function(){
		var message = arguments[0];
		var lang = arguments[1];
		if(!lang) lang = this.defaultLang;
		if(this.i18n_messages[lang] && (typeof this.i18n_messages[lang] == 'object') && this.i18n_messages[lang][message]){
			return this.i18n_messages[lang][message];
		}
		return message;
	}
	this.addMessages = function(lang, messages){
		this.i18n_messages[lang] = messages;
	}
	this.addMessage = function(lang, message, translation){
		if(typeof this.i18n_messages[lang] == 'undefined'){
			this.i18n_messages[lang] = {};
		}
		this.i18n_messages[lang][message] = translation;
	}
};