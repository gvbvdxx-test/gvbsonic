var mainmenuRunning = false;
var menumusic = null;
var menuIndex = 0;
var alphabetArray = null; //Was used originally for text, but it was unessasary so its just null for now.
var framecount = 0;

window.gvbsonicMenuMusic = null;

function stopMenuMusic () {
	var music = window.gvbsonicMenuMusic;
	if (music) {
		music.onended = function () {};
		music.pause();
	}
	window.gvbsonicMenuMusic = null;
}

function playMenuMusic () {
	if (!window.gvbsonicMenuMusic) {
		var music = null;
		function playmusic() {
			music = new window.AudioApiReplacement(window.files.menumusicarray[optionsData.menuMusic]);
			music.looped = true;
			music.setVolume(1);
			music.play();
			music.onended = playmusic;
			window.gvbsonicMenuMusic = music;
		}
		playmusic();
	}
}

async function runMenu(menusprites, scrolling, indexOfMenu, headerSpr) {
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
    gvbsonic.handleKeyDown = async function (e) {
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
			var mspr = menuSprites[menuIndex];
			if (!mspr.menuNotSelectale) {
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
        }

        if (menuSprites[menuIndex].canEditText) {
            if (e.key == "Backspace") {
                var menuspr = menuSprites[menuIndex];
                if (menuspr.type == "text") {
                    menuspr.text = menuspr.text.slice(0, menuspr.text.length - 1);
                }
				return;
            }
            if (e.key == " ") {
                var menuspr = menuSprites[menuIndex];
                if (menuspr.type == "text") {
                    menuspr.text += " ";
                }
				return;
            }
			if (e.key.length < 2) {
				var menuspr = menuSprites[menuIndex];
				if (menuspr.type == "text") {
					menuspr.text += e.key;
				}
			}
        }
    };
	if (indexOfMenu) {
        menuIndex = indexOfMenu;
    }
    var i = 0;
    while (i < menuSprites.length) {
        var menuSprite = menuSprites[i];
        menuSprite.x = 0;
        
		if (!scrolling) {
			menuSprite.y = (100 * (0 - i)) * -1;
			menuSprite.y -= (100 * (0 - menuSprites.length/2)) * -1;
			menuSprite.y += 50;
		} else {
			menuSprite.y = (100 * (menuIndex - i)) * -1;
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
    
	headerSpr.y = -150;
	headerSpr.x = 0;
	
	window.sprites.push(headerSpr);
	
    var selectedTimer = 3;
    while (mainmenuRunning) {
        framecount += 1;
        var i = 0;
        while (i < menuSprites.length) {
            var menuSprite = menuSprites[i];
            if (scrolling) {
                menuSprite.y += Math.sign((((100 * (menuIndex - i)) * -1) - menuSprite.y) / 15) * 10;
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
                targetScale += Math.cos(framecount / 15) * 0.1;
            } else {
				if (itemSelected) {
					menuSprite.x -= 0.5;
				}
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
