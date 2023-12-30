//Game function moved to "level-handler.js"

function getIsElectron() {
    return window.isElectron;
}

var windowedMode = true;

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
                    ].concat(ElectronOnlyMenus).concat(devMenus), false, mainMenuIndex);
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
            fullscreenOption.text = "Windowed Mode: ";
            if (windowedMode) {
                fullscreenOption.text += "Yes";
            } else {
                fullscreenOption.text += "No";
            }

            var selected = await runMenu([
                        new window.GRender.Sprite(0, 0, window.files.menuStuff.back, 50, 15),
                        fullscreenOption
                    ], true, optionMenuIndex);
            optionMenuIndex = selected;
            if (selected == 0) {
                window.curMenu = "main";
            }
            if (selected == 1) {
                windowedMode = !windowedMode;
                thisWindow.setFullScreen(!windowedMode);
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
