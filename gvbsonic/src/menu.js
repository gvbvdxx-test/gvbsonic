var mainmenuRunning = false;
var menumusic = null;
var menuIndex = 0;
var alphabetArray = null;
var framecount = 0;
async function runMenu(menusprites, scrolling, indexOfMenu) {
    window.transitionFadeOut();
    window.sprites = [];
    mainmenuRunning = true;
    menumusic = null;
    var menuMoveSound = null;
    menuIndex = 0;

    var mainMenuBG = new window.GRender.SquareSprite(0, 0, null, 600, 360);
    mainMenuBG.color = "#ffcf21";
    window.sprites.push(mainMenuBG);
    var menubg = new window.GRender.Sprite(0, 0, window.files.menuStuff.newmenubg, 600, 360);
    window.sprites.push(menubg);
    var menuSprites = menusprites;
    for (var menuSprite of menuSprites) {
        window.sprites.push(menuSprite);
    }
    var canMoveMenu = true;
    var itemSelected = false;
    document.onkeydown = async function (e) {
        if (canMoveMenu) {
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

                if (menuIndex > (menuSprites.length - 1)) {
                    menuIndex -= 1;
                }
                return;
            }
            if (e.key == "Enter") {
                menuMoveSound = new window.AudioApiReplacement(window.files.sfx.menuaccept);
                menuMoveSound.setVolume(1);
                menuMoveSound.play();
                canMoveMenu = false;
                itemSelected = true;
                await window.transitionFadeIn();
                document.onkeydown = null;
                mainmenuRunning = false;
            }
        }

        if (menuSprites[menuIndex].canedit) {
            if (e.key == "Backspace") {
                var menuspr = menuSprites[menuIndex];
                if (menuspr.type == "text") {
                    menuspr.text = menuspr.text.slice(0, menuspr.text.length - 1);
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
        }
    };
    var i = 0;
    while (i < menuSprites.length) {
        var menuSprite = menuSprites[i];
        menuSprite.y += (70 * (menuIndex - i)) * -1;
        menuSprite.x = 0;
        if (!scrolling) {
            menuSprite.y -= (70 * (menuSprites.length - 1)) / 2;
        }
        //menuSprite.x += (30 * (menuIndex - i));
        menuSprite.scale = 0;
        menuSprite.center = true;
        if (!menuSprite.text) {
            menuSprite.text = "";
        }
        menuSprite.size = 32;
        menuSprite.font = "pixel";
        if (menuIndex - i == 0) {
            menuSprite.scale = 0;
        }
        i += 1;
    }
    if (indexOfMenu) {
        menuIndex = indexOfMenu;
    }
    var selectedTimer = 3;
    while (mainmenuRunning) {
        framecount += 1;
        var i = 0;
        while (i < menuSprites.length) {
            var menuSprite = menuSprites[i];
            if (scrolling) {
                menuSprite.y += (((100 * (menuIndex - i)) * -1) - menuSprite.y) / 7;
                menuSprite.x += (((600 * (menuIndex - i)) * -1) - menuSprite.x) / 10;
            }
            var targetScale = 2;
            var targetTrs = 1;
            menuSprite.color = "black";
            if (itemSelected) {
                targetTrs = 0;
            }
            if (menuIndex - i == 0) {
                selectedTimer -= 0.01;
                targetScale = 4;
                menuSprite.color = "white";
                targetTrs = 1;
                if (selectedTimer < 2.5) {
                    selectedTimer = 3;
                }
                targetScale.scale += Math.cos(framecount / 15) * 2;
            } else {
			}
            if (menuSprite.type == "text") {
                targetScale = 1;
            }
            menuSprite.scale += (targetScale - menuSprite.scale) / 3;
            menuSprite.trs += ((targetTrs) - menuSprite.trs) / 3;
            i += 1;
        }
        await window.tickAsync60FPSTimer();
    }
    window.sprites = [];
    return menuIndex;
}
async function mainMenu(aftercb) {
    var selected = await runMenu([new window.GRender.Sprite(0, 0, window.files.menuStuff.main, 105, 18), new window.GRender.Sprite(0, 0, window.files.menuStuff.multi, 106, 23), new window.GRender.Sprite(0, 0, window.files.menuStuff.exit, 36, 18)]);
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
async function multiPlayerMenu() {
    var selected = await runMenu([new window.GRender.Sprite(0, 0, window.files.menuStuff.host, 102, 21), new window.GRender.Sprite(0, 0, window.files.menuStuff.multi, 44, 18), new window.GRender.Sprite(0, 0, window.files.menuStuff.multi, 45, 19)])
        return;
}
