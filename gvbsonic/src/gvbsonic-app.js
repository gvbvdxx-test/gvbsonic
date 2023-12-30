window.runGvbsonic = async function () {
    sprites = []; //Clear all sprites on the screen.
	
    await window.titleScreen(); //this is for starting and waiting for the title screen to end.
	
    var isInMenu = true; //used to tell if the menu is currently open.
	
    window.curMenu = "main"; //main menu is default.
	
	
    window.SonicmenuMusic = null;
    
	function playmusic() {
        SonicmenuMusic = new window.AudioApiReplacement(window.files.menumusic.main);
        SonicmenuMusic.looped = true;
        SonicmenuMusic.setVolume(1);
        SonicmenuMusic.play();
        SonicmenuMusic.onended = playmusic; //just restart the music when it ends, simple enough.
    }
	
    playmusic();
	
	//runs the levels in the order there loaded.
	
    async function runLevelsInOrder() {
        for (var l of window.files.levelorder) {
            await dolevel(l);
        }
    }
	
	
    while (isInMenu) {
        switch (curMenu) {
        case 'main':
            //add your own menus if you like here.
			var selected = await runMenu([
					new window.GRender.Sprite(0, 0, window.files.menuStuff.main, 105, 18),
					new window.GRender.Sprite(0, 0, window.files.menuStuff.exit, 36, 18)
				]);
            if (selected == 0) {
                isInMenu = false; //tell the game that its not in the menu.
                runLevelsInOrder(); //you can change this to trigger something else besides loading levels, like a starting cutcene.
            }
            if (selected == 1) {
				//close the window to exit the game.
                window.close();
            }
            break;
        default:
			//Never used.
        }
    }
	
	//stop the music, also the onended gets called when its paused, so just do nothing when it ends.
    SonicmenuMusic.onended = () => {};
    SonicmenuMusic.pause();
};