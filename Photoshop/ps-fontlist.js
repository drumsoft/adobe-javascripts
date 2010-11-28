//list all font names (for scripting)

var s = new Array(app.fonts.length);

for(var i=0,l=app.fonts.length; i<l; i++) {
//	s[i] = "- " + app.fonts[i].name;
	s[i] = "- " + app.fonts[i].postScriptName;
}

alert(s.join("\n"));

