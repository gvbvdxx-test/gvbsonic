window.fetchJSON = async function fetchJSON(j) {
    var a = await fetch(j);
    var b = await a.text();
    return JSON.parse(b);
  }
window.loadLevels = async function () {
  window.files.levelMusic = [
    null,
    null,
    null,
    await window.loadSoundURL("res/music/level/GardianPalace3.mp3"),
    await window.loadSoundURL("res/music/sonic1/GreenHillZone.mp3")
  ];
  window.files.levelorder = [3, 1, 2];
  
  window.files.levels = [
    await fetchJSON("res/levels/level1.json"),
    await fetchJSON("res/levels/level2.json"),
    await fetchJSON("res/levels/level3.json"),
    await fetchJSON("res/levels/fast.json"),
    await fetchJSON("res/levels/ghz.json"),
	await fetchJSON("res/levels/multiplayer/multizone.json")
  ];
}
