var mainmenuRunning = false;
var menumusic = null;
var menuIndex = 0;
var alphabetArray = null;
(async function () {
	alphabetArray = (
	await (
	await fetch("res/txt/alphabet.txt")
	).text()
	).replaceAll("\r","").split("\n");
})();
var framecount = 0;
//main menu
async function runMenu(menusprites) {
	window.sprites = [];
	mainmenuRunning = true;
	menumusic = null;
	
	var menuMoveSound = null;
	menuIndex = 0;
	var mainMenuBG = new window.GRender.SquareSprite(0, 0, null, 600, 360);
	mainMenuBG.color = "#ffcf21";
	window.sprites.push(mainMenuBG);
	var mcyan = new window.GRender.Sprite(0, 0, window.files.menuStuff.cyan, 232, 232);
	window.sprites.push(mcyan);
	var mred = new window.GRender.Sprite(0, 0, window.files.menuStuff.red, 274, 274);
	window.sprites.push(mred);
	var menuSprites = menusprites;
	for (var menuSprite of menuSprites) {
		window.sprites.push(menuSprite);
	}		
	document.onkeydown = function (e) {
		if (e.key == "ArrowUp") {
			menuIndex -= 1;
			if (menuMoveSound) {
				menuMoveSound.pause();
			}
			menuMoveSound = new window.AudioApiReplacement(window.files.sfx.menubleep);
			menuMoveSound.setVolume(1);
			menuMoveSound.play();
			if (menuIndex < 0) {
				menuIndex += 1;
			}
			return;
		}
		if (e.key == "ArrowDown") {
			menuIndex += 1;
			if (menuMoveSound) {
				menuMoveSound.pause();
			}
			menuMoveSound = new window.AudioApiReplacement(window.files.sfx.menubleep);
			menuMoveSound.setVolume(1);
			menuMoveSound.play();
			if (menuIndex > (menuSprites.length-1)) {
				menuIndex -= 1;
			}
			return;
		}
		if (e.key == "Enter") {
			menuMoveSound = new window.AudioApiReplacement(window.files.sfx.menuaccept);
			menuMoveSound.setVolume(1);
			menuMoveSound.play();
			document.onkeydown = null;
			mainmenuRunning = false;
			return;
		}
		if (e.key == "Backspace") {
			var menuspr = menuSprites[menuIndex];
			if (menuspr.type == "text") {
				menuspr.text = menuspr.text.slice(0,menuspr.text.length - 1);
			}
		}
		if (e.key == " ") {
			var menuspr = menuSprites[menuIndex];
			if (menuspr.type == "text") {
				menuspr.text += " ";
			}
		}
		if (alphabetArray.indexOf(e.key) > -1) {
			var menuspr = menuSprites[menuIndex];
			if (menuspr.type == "text") {
				menuspr.text += e.key;
			}
		}
	};
	var i = 0;
	while (i < menuSprites.length) {
		var menuSprite = menuSprites[i];
		menuSprite.y += (70*(menuIndex-i))*-1;
		menuSprite.x += (30*(menuIndex-i));
		menuSprite.scale = 2;
		menuSprite.center = true;
		if (!menuSprite.text) {
			menuSprite.text = "";
		}
		menuSprite.size = 32;
		menuSprite.font = "pixel";
		if (menuIndex-i == 0) {
			menuSprite.scale = 3;
		}
		i += 1;
	}
	while (mainmenuRunning) {
		//frame count
		framecount += 1;
		//menu sprite stuff
		var i = 0;
		while (i < menuSprites.length) {
			var menuSprite = menuSprites[i];
			menuSprite.y += (((70*(menuIndex-i))*-1)-menuSprite.y)/15;
			menuSprite.x += (((30*(menuIndex-i)))-menuSprite.x)/10;
			menuSprite.scale = 2;
			if (menuIndex-i == 0) {
				menuSprite.scale = 3;
			}
			if (menuSprite.type == "text") {
				menuSprite.scale = 1;
			}
			i += 1;
		}
		//the red and cyan thing
		mcyan.scale = 1.2+(Math.cos(framecount/150)*1);
		mred.scale = 1.2+(Math.sin(framecount/150)*1);
		await window.tickAsync();
	}
	//menumusic.onended = function(){};
	//menumusic.pause();
	window.sprites = [];
	return menuIndex;
}
async function mainMenu(aftercb) {
	var selected = await runMenu([
		new window.GRender.Sprite(0, 0, window.files.menuStuff.main, 105, 18),
		new window.GRender.Sprite(0, 0, window.files.menuStuff.multi, 106, 23),
		new window.GRender.Sprite(0, 0, window.files.menuStuff.exit, 36, 18)
	]);
	if (menuIndex == 0) {
		return "game";
	}
	if (menuIndex == 1) {
		return "multi";
	}
	if (menuIndex == 2) {
		return "exit";
	}
}
//mutilplayer menu
async function multiPlayerMenu() {
	var selected = await runMenu([
		new window.GRender.Sprite(0, 0, window.files.menuStuff.host, 102, 21),
		new window.GRender.Sprite(0, 0, window.files.menuStuff.multi, 44, 18),
		new window.GRender.Sprite(0, 0, window.files.menuStuff.multi, 45, 19)
	])
	return;
}