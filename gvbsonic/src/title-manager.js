var appName = "Gvbvdxx Sonic Engine";
var versionOfApp = "(Unknown Version)";
var currentTitleInfo = "";
function setTitleInfo (data) {
	
	currentTitleInfo = data;
	
	gvbsonic.events.emit("settitle",data);
	
	//If possible, try to set the title with the version name.
	var versionName = "";
	if (window.remote) {
		var ver = window.remote.app.getVersion();
		versionName = " V"+ver;
		versionOfApp = ver;
	}
	if (data.length > 0) {
		document.title = `${appName}${versionName} - ${data}`;
	} else {
		document.title = appName+versionName;
	}
}

window.gvbsonic.setAppName = function (newName) {
	appName = newName;
	setTitleInfo(currentTitleInfo);
};
window.gvbsonic.getAppName = function (newName) {
	appName = newName;
	setTitleInfo(currentTitleInfo);
};