window.fetchJSON = async function fetchJSON(j, useUnmodified) {
    var a = await window.fetchFile(j, useUnmodified);
    var b = await a.text();
    return JSON.parse(b);
};
  window.levelMusicLoopNumbers = {};
window.loadLevels = async function () {
	await loadBackgroundAssets();
	var levels = await fetchJSON("res/levels.json");
	var bgms = await fetchJSON("res/bgm.json", true); //Require the unmodified files
	if (await window.moddedFileExists("bgm.json")) {
		try{
			//Now add on the modified tiles.
			var moddedBGMS = await window.fetchJSON("bgm.json");
			for (var bgmID of Object.keys(moddedBGMS)) {
				bgms[bgmID] = moddedBGMS[bgmID];
			}
		}catch(e){
			console.error("Unable to load BGMS.",e);
		}
	}
  window.files.levelMusic = []; //not even used anymore.
  window.files.levelBGMS = {};
  for (var bgmName of Object.keys(bgms)) {
	  if (bgms[bgmName].loop) {
		  levelMusicLoopNumbers[bgmName] = bgms[bgmName].loop;
	  }
	  window.files.levelBGMS[bgmName] = await window.loadAudioFile(bgms[bgmName].path);
  }
  window.files.levelBackgrounds = []; //not even used anymore.
  var i = 0;
  window.files.levelorder = [];
  while (i < levels.length) {
	window.files.levelorder.push(i);
	i += 1;
  }
  var reallevels = [];
  for (var levelpath of levels) {
	  reallevels.push(await fetchJSON(levelpath));
  }
  window.files.levels = reallevels;
}
