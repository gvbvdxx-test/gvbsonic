var fs = require("fs");
var path = require("path");
window.currentMods = [];
async function loadMods() {
	if (fs.existsSync("./mods")) {
		if (fs.statSync("./mods").isDirectory()) {
			for (var file of fs.readdirSync("./mods")) {
				if (file.split(".").pop().toLowerCase() == "gse") {
					
					window.alert("External .gse mods are no longer supported.");
					
					//var mod = new GSEMod(path.join("./mods",file));
					//await mod.load();
					//window.currentMods.push(mod);
				}
			}
		}
	}
}