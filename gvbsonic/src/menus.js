//"PLAY" function moved to "level-handler.js"

function getIsElectron() {
    return window.isElectron;
}

if (!gvbsonicSaveData.data.options) {
	gvbsonicSaveData.data.options = {
		windowedMode:true,
		HDRendering: false
	};
}

var optionsData = gvbsonicSaveData.data.options;

function updateWindowedMode () {
	if (window.remote) {
		var thisWindow = window.currentWindow;
		thisWindow.setFullScreen(!optionsData.windowedMode);
    }
}

function updateHDRendering () {
	window.HDRendering = optionsData.HDRendering;
}

function updateSettings () {
	gvbsonicSaveData.save();
	updateWindowedMode();
	updateHDRendering();
}

updateSettings();
updateWindowedMode();

function createMenuTextSprite (text, font, menuNotSelectale) {
	var spr = new window.GRender.TextSprite(0, 0, null, 46, 15);
	spr.text = text;
	spr.font = font;
	spr.menuNotSelectale = menuNotSelectale;
	return spr;
}

window.doMenus = async function () {
    setTitleInfo("Main Menu");
    var isInMenu = true;
    window.curMenu = "main";
    window.SonicmenuMusic = null;
    function playmusic() {
        SonicmenuMusic = new window.AudioApiReplacement(window.files.menumusic.main);
        SonicmenuMusic.looped = true;
        SonicmenuMusic.setVolume(1);
        SonicmenuMusic.play();
        SonicmenuMusic.onended = playmusic;
    }
    playmusic();
    var mainMenuIndex = 0;
    var optionMenuIndex = 0;

    while (isInMenu) {
        switch (curMenu) {
        case 'main':
            var ElectronOnlyMenus = [
                new window.GRender.Sprite(0, 0, window.files.menuStuff.options, 87, 15)
            ];
            if (!(getIsElectron())) {
                ElectronOnlyMenus = [];
            }
            var devMenus = [
                new window.GRender.Sprite(0, 0, null, 41, 15) //it will be a hidden option
            ];
            if (!window.debugModeEnabled) {
                devMenus = [];
            }
            var selected = await runMenu([
                        new window.GRender.Sprite(0, 0, window.files.menuStuff.play, 46, 15),
                        new window.GRender.Sprite(0, 0, window.files.menuStuff.exit, 41, 15)
                    ].concat(ElectronOnlyMenus).concat(devMenus), true, mainMenuIndex,
					new window.GRender.Sprite(0, 0, window.files.menuStuff.mainMenuHeader, 272, 45));
            mainMenuIndex = selected;
            if (selected == 0) {
                isInMenu = false;
                window.transitionFadeIn();
                window.doCharacterSelect(window.doMenus,function () {
					window.runLevelsInOrder(window.doMenus);
				});
            }
            if (selected == 1) {
                isInMenu = false;
                (async function () {
                    await window.titleScreen();
                    window.doMenus();
                })();
            }
            if (selected == 2) {
                optionMenuIndex = 0;
                window.curMenu = "options";
            }
			if (selected == 3) {
                optionMenuIndex = 0;
                window.curMenu = "devloper";
            }
            break;
		case 'devloper':
			
			await window.tickAsync60FPSTimer();
			
			break;
        case 'options':
            if (window.remote) {
                var thisWindow = window.currentWindow;
            } else {
                window.alert("Im unable to find the remote access to the main process. :/\nsomething is not right!");
                window.close();
                break;
            }
            var fullscreenOption = new window.GRender.TextSprite(0, 0, null, 87, 15);
            fullscreenOption.color = "black";
            fullscreenOption.center = true;
            if (optionsData.windowedMode) {
                fullscreenOption.text = "Enter Fullscreen";
            } else {
                fullscreenOption.text = "Exit Fullscreen";
            }
			
			var hdOption = new window.GRender.TextSprite(0, 0, null, 87, 15);
            hdOption.color = "black";
            hdOption.center = true;
            if (optionsData.HDRendering) {
                hdOption.text = "Disable HD rendering. (Buggy)";
            } else {
                hdOption.text = "Enable HD rendering. (Buggy)";
            }

            var selected = await runMenu([
                        new window.GRender.Sprite(0, 0, window.files.menuStuff.back, 50, 15),
                        fullscreenOption,
						hdOption
                    ], true, optionMenuIndex,
					new window.GRender.Sprite(0, 0, window.files.menuStuff.optionsHeader, 231, 45));
            optionMenuIndex = selected;
            if (selected == 0) {
                window.curMenu = "main";
            }
            if (selected == 1) {
                optionsData.windowedMode = !optionsData.windowedMode;
                updateSettings();
            }
			if (selected == 2) {
                optionsData.HDRendering = !optionsData.HDRendering;
                updateSettings();
            }
            break;
        default:
			isInMenu = false;
			console.log("No menu found with ID "+window.curMenu);
			break;
        }
    }
    SonicmenuMusic.onended = () => {};
    SonicmenuMusic.pause();
}
