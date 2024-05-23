(function () {
	
	//This is MOSTLY done by assets loader, this only executes any scripts to support mods.
	
	var fs = require("fs");
	var path = require("path");
	
	
	
	function loadScript(src) {
		return new Promise((a) => {
			var s = document.createElement("script");
			s.src = src;
			s.onload = a;
			document.body.appendChild(s);
		});
	}
	
	function scanAndLoad (directory) {
		fs.readdirSync(directory).forEach((file) => {
			var absolute = path.join(directory,file);
			if (fs.statSync(absolute).isDirectory()) {
				scanAndLoad(absolute);
			} else {
				try{
					eval(fs.readFileSync(absolute,{encoding:"UTF-8"}));
				}catch(e){
					console.error("Unable to load \""+absolute+"\".",e);
					window.alert("Unable to load \""+absolute+"\". For more info, restart this game with the --devmode tag using your command prompt.");
				}
			}
		})
	}
	
	async function preloadModScripts () {
		if (fs.existsSync("./mods/editorScripts")) {
			scanAndLoad("./mods/editorScripts")
		}
	}
	
	window.preloadModScripts = preloadModScripts;

})();