var assetTypes = {
	"svg":"image/svg+xml",
	"png":"image/png",
	"mp3":"audio/mpeg",
	"wav":"audio/wav",
	"ogg":"audio/ogg",
	"json":"application/json"
};
function getDataURLFromBase64 (base64,ext) {
	return "data:"+assetTypes[ext]+";base64,"+base64;
}
function blobToURL (blob) {
	return new Promise((accept,reject) => {
		var reader = new FileReader();
		reader.onload = function () {
			accept(reader.result);
		};
		reader.onerror = function () {
			reject("Unable to convert Blob to Data URL.");
		};
		reader.readAsDataURL(blob);
	});
}

window.setTimeoutAsync = async function () {
	return new Promise((resolve) => {
		setTimeout(resolve,1);
	})
};

window.getAssetURL = async function (targetURL, dontUseModifiedFiles) {
	var getIsElectronSupported = false;
	var electronMode = false;
	if (window.require) {
		getIsElectronSupported = true;
		electronMode = true;
	}
	if (electronMode) {
		if (!dontUseModifiedFiles) {
			var fs = require("fs");
			var path = require("path");
			
			var filepath = path.join("./mods/",path.join(targetURL.replace("res","")));
			
			if (fs.existsSync(filepath)) {
							
				var base64 = fs.readFileSync(filepath,{encoding:"base64"});
				
				var base64URL = await getDataURLFromBase64(base64,targetURL.split(".").pop());
				
				return base64URL;
			}
		}
	}
	var response = await fetch(targetURL);
	var blob = await response.blob();
	var dataUrl = await blobToURL(blob);
	return dataUrl;
};

window.moddedFileExists = async function (targetURL) {
	var getIsElectronSupported = false;
	var electronMode = false;
	if (window.require) {
		getIsElectronSupported = true;
		electronMode = true;
	}
	if (electronMode) {
		var fs = require("fs");
		var path = require("path");
		
		var filepath = path.join("./mods/",path.join(targetURL.replace("res","")));
		
		if (fs.existsSync(filepath)) {
			return true;
		}
	}
	
	return false;
};

window.waitForAssetsFinished = 0;

window.doAssetLoadStuff = async function () {
	window.waitForAssetsFinished += 1;
	setTimeout(() => {
		window.waitForAssetsFinished -= 1;
	},100);
	if (window.fastAssetsMode) {
		while (window.waitForAssetsFinished > 0) {
			await window.setTimeoutAsync();
		}
	}
};

window.loadImage = async function (img,requireUnmodified) {
	await window.doAssetLoadStuff();
	return await window.renderer.createImage(await window.getAssetURL(img,requireUnmodified));
};
window.fetchFile = async function (file,requireUnmodified) {
	await window.doAssetLoadStuff();
	return await fetch(await window.getAssetURL(file,requireUnmodified));
};
window.loadAudioFile = async function (file,requireUnmodified) {
	await window.doAssetLoadStuff();
	return await window.loadSoundURL(await window.getAssetURL(file,requireUnmodified));
};

window.allowSeparateAssets = false; //WORK IN PROGRESS! BE CAREFULL!!!

//This is controlled over assets.js, DO NOT MODIFY THE STUFF BELOW, this wont work in the editor if modified.

//Basicly holds the async promises (waiting for file loads), then releases them all when all loading requests are done.
window.fastAssetsMode = false; 