window.doCharacterSelect = async function (backtomenu,next) {
	window.transitionFadeOut();
	
	var chars = window.gvbsonicCharacterSelect;
	
	var charInfo = window.gvbsonicCharacters;
	
	var aborted = false;
	
	var characterSelectOpen = true;
	
	var selected = 0;
	
	var characterChosen = false;
	
	var movesound = null;
	
	function movesoundplay () {
		if (movesound) {
			movesound.pause();
        }
        movesound = new window.AudioApiReplacement(window.files.sfx.menubleep);
        movesound.setVolume(1);
		movesound.play();
	}
	
	function replayAnimation () {
		if (charInfo[selectedID]) {
			characterView.currentAnimation = null;
			
			characterView.image = character.image;
			characterView.spritesheetData = character.spritesheet;
			characterView.animationData = character.animations;
			
			runAnimation(characterView, "stand");
		}
	}
	
	document.onkeydown = function (e) {
		if (!characterChosen) {
			if (e.key == "ArrowRight") {
				characterView.currentAnimation = null;
				
				selected += 1;
				
				if (selected > (chars.length-1)) {
					selected -= 1;
				}
				
				movesoundplay();
				
				replayAnimation();
			}
			if (e.key == "ArrowLeft") {
				characterView.currentAnimation = null;
				
				selected -= 1;
				
				if (selected < 0) {
					selected += 1;
				}
				
				movesoundplay();
				
				replayAnimation();
			}
			if (e.key == "Enter") {
				characterSelectOpen = false;
				characterChosen = true;
				
				if (movesound) {
					movesound.pause();
				}
				
				var selectSound = new window.AudioApiReplacement(window.files.sfx.menuaccept);
				selectSound.setVolume(1);
				selectSound.play();
			}
			if (e.key == "Escape") {
				aborted = true;
				characterSelectOpen = false;
			}
		}
		
	};
	
	var mus = null;
    function playmusic() {
        mus = new window.AudioApiReplacement(window.files.menumusic.character);
        mus.looped = true;
        mus.setVolume(1);
        mus.play();
        mus.onended = playmusic;
    }
	
	var menubg = new window.GRender.Sprite(0, 0, window.files.menuStuff.characterSelect, 600, 360);
	
	var characterView = new window.GRender.Sprite(0, 0, null, 32, 32);
	
	window.sprites = [
		menubg,
		characterView
	];
	
	if (window.gvbsonicUseCharacterSelect) {
		
		playmusic();
		
		replayAnimation();
		
		while (characterSelectOpen) {
			await window.tickAsync60FPSTimer();
			var selectedID = chars[selected];
			if (charInfo[selectedID]) {
				var character = charInfo[selectedID];
				characterView.scale = character.scale*2;
				
				characterView.image = character.image;
				characterView.spritesheetData = character.spritesheet;
				characterView.animationData = character.animations;
				
				window.gvbsonicUseTailsNPC = false;
				window.gvbsonicSelectedChar = selectedID;
				window.gvbsonicNPCCharacter = selectedID;
				
				replayAnimation();
			} else {
				//It's a diffrent configuration.
				
				characterView.scale = selectedID.scale*2;
				
				characterView.image = selectedID.image;
				characterView.width = selectedID.image.width;
				characterView.height = selectedID.image.height;
				
				characterView.currentAnimation = null;
				characterView.imageLocation = null;
				
				window.gvbsonicUseTailsNPC = selectedID.enableCPU;
				window.gvbsonicSelectedChar = selectedID.playerCharacter;
				window.gvbsonicNPCCharacter = selectedID.CPUCharacter;
			}
		}
	}
	mus.pause();
	mus.onended = function () {};
	
	document.onkeydown = null;
	
	await window.transitionFadeIn();
	
	characterView.currentAnimation = null;
	
	window.sprites = [];
	
	if (aborted) {
		backtomenu();
	} else {
		next();
	}
};