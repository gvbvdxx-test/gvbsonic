function loadDataSystem (rewriteData) {
	var encoderList = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()~`-_=+{[}]|;\",./1234567890\\?><|";

	function encodeSomewhat(string) {
		var base64 = btoa(string);
		
		var identifier = Math.round(Math.random()*30)+2;
		
		var array = [identifier];
		
		for (var chr of base64) {
			array.push(encoderList.indexOf(chr)+identifier);
		}
		
		return array;
	}

	function decodeSomewhat(data) {
		var array = Array.from(data);
		var base64 = "";
		var id = array[0];
		
		var i = 1;
		while (i < array.length) {
			var ind = array[i];
			base64 += encoderList[ind-id];
			i += 1;
		}
				
		return atob(base64);
	}

	try{

	(function () {
		var fileMode = window.require;
		if (fileMode) {
			var fs = require("fs");
			var os = require("os");
			var path = require("path");
			
			var dataPath = path.join(os.homedir(),"gvbsonic-data.dta");
			
			if ((!fs.existsSync(dataPath)) || rewriteData) {
				console.log("[GVBSONIC]: Save Data - Creating new save data. (Using file data)");
				fs.writeFileSync(dataPath, Buffer.from(encodeSomewhat("{}")), {encoding:"buffer"});
			}
			
			var bin = fs.readFileSync(dataPath);
			var decoded = decodeSomewhat(bin);
			var data = JSON.parse(decoded);
		} else {
			var dataName = "gvbsonic-data";
			if ((!window.localStorage.getItem(dataName)) || rewriteData) {
				console.log("[GVBSONIC]: Save Data - Creating new save data. (Using local storage)");
				window.localStorage.setItem(dataName,JSON.stringify(encodeSomewhat("{}")));
			}
			
			var bin = JSON.parse(window.localStorage.getItem(dataName));
			var decoded = decodeSomewhat(bin);
			var data = JSON.parse(decoded);
		}
		
		window.gvbsonicSaveData = {
			data:data,
			save: function () {
				var text = JSON.stringify(window.gvbsonicSaveData.data,null,"\t");
				if (fileMode) {
					fs.writeFileSync(dataPath, Buffer.from(encodeSomewhat(text)), {encoding:"buffer"});
				} else {
					window.localStorage.setItem(dataName,JSON.stringify(encodeSomewhat(text)));
				}
			}
		};
	})();

	}catch(e) {
		console.error(e);
		window.alert("Your save data was deleted because it was corrupted.");
		loadDataSystem(true);
	}
}
loadDataSystem();