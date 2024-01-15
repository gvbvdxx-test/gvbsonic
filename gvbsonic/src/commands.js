window.getMods = function () {
	var text = "";
	text += "========================"+"\n";
	
	text += "Mod Path | Mod Name"+"\n";
	for (var a of window.currentMods) {
		text += a.path;
		text += " | ";
		text += a.data.name;
	}
	text += "\n"+"========================";
	return text;
};
window.enableDebug = function () {
	
	var a = new window.AudioApiReplacement(window.files.sfx.continue);
    a.setVolume(1);
    a.play();
	window.debugModeEnabled = true;
	return "Debug was successfully enabled!!";
};