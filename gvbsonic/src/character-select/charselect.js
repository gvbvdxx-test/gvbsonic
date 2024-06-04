window.doCharacterSelect = async function (backtomenu, next) {
    window.transitionFadeOut();

    var chars = window.gvbsonicCharacterSelect;
    var charInfo = window.gvbsonicCharacters;
    var aborted = false;
    var characterSelectOpen = true;
    var selected = 0;
    var characterChosen = false;
    var movesound = null;
    var arrowPos = 300 - 64; //Screen width - Arrow width.

    function movesoundplay() {
        if (movesound) {
            movesound.pause();
        }
        movesound = new window.AudioApiReplacement(window.files.sfx.menubleep);
        movesound.setVolume(1);
        movesound.play();
    }

    function replayAnimation(spr, charIndex) {
        var selectedID = chars[charIndex];
        if (charInfo[selectedID]) {
            var character = charInfo[selectedID];

            spr.currentAnimation = null;

            spr.image = character.image;
            spr.spritesheetData = character.spritesheet;
            spr.animationData = character.animations;
            if (spr.animationData) {
                if (spr.animationData["stand"]) {
                    var anim = spr.animationData["stand"];
                    spr.imageLocation = getSpriteByName(spr.spritesheetData, anim.frames[0]);
                    spr.width = spr.imageLocation.width;
                    spr.height = spr.imageLocation.height;
                }
            }
        }
    }

    gvbsonic.handleKeyDown = function (e) {
        if (!characterChosen) {
            if (e.key == "ArrowRight") {
                characterView.currentAnimation = null;

                selected += 1;
                if (selected > (chars.length - 1)) {
                    selected -= 1;
                }

                arrowRight.x = arrowPos + 20;

                movesoundplay();
            }
            if (e.key == "ArrowLeft") {
                characterView.currentAnimation = null;

                selected -= 1;

                if (selected < 0) {
                    selected += 1;
                }

                arrowLeft.x = -arrowPos - 20;

                movesoundplay();
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

    var menubg = new window.GRender.Sprite(0, 0, window.files.menuStuff.characterSelect.bg, 600, 360);
    var text = new window.GRender.Sprite(0, 0, window.files.menuStuff.characterSelect.text, 600, 360);

    var arrowSize = 32;

    var arrowLeft = new window.GRender.Sprite(0, 0, window.files.menuStuff.characterSelect.arrow, arrowSize, arrowSize);
    arrowLeft.flipX = true;
    var arrowRight = new window.GRender.Sprite(0, 0, window.files.menuStuff.characterSelect.arrow, arrowSize, arrowSize);
    arrowRight.flipX = false;

    var characterView = new window.GRender.Sprite(0, 0, null, 32, 32);

    function setupCharacterSprite(spr, index) {
        var selectedID = chars[index];
        if (charInfo[selectedID]) {
            var character = charInfo[selectedID];
            spr.scale = character.scale * 2;

            spr.image = character.image;
            spr.spritesheetData = character.spritesheet;
            spr.animationData = character.animations;

            window.gvbsonicUseTailsNPC = false;
            window.gvbsonicSelectedChar = selectedID;
            window.gvbsonicNPCCharacter = selectedID;

            if (typeof character.characterSelectYOffset == "number") {
                spr.y += character.characterSelectYOffset;
            }
            if (typeof character.characterSelectXOffset == "number") {
                spr.x += character.characterSelectXOffset;
            }

            replayAnimation(spr, index);
        } else {
            //It's a configuration for a secific character select.

            if (typeof selectedID.yOffset == "number") {
                spr.y += selectedID.yOffset;
            }
            if (typeof selectedID.xOffset == "number") {
                spr.x += selectedID.xOffset;
            }

            spr.scale = selectedID.scale * 2;

            spr.image = selectedID.image;
            spr.width = selectedID.image.width;
            spr.height = selectedID.image.height;

            spr.currentAnimation = null;
            spr.imageLocation = null;

            window.gvbsonicUseTailsNPC = selectedID.enableCPU;
            window.gvbsonicSelectedChar = selectedID.playerCharacter;
            window.gvbsonicNPCCharacter = selectedID.CPUCharacter;
        }
        spr.ogscale = spr.scale;
        spr.ogy = spr.y;
        spr.ogx = spr.x;
    }

    function moveSprToSelected(spr, index, direct) {
        if (direct) {
            spr.x = (index - selected) * 210;
            spr.x += spr.ogx * (spr.scale / spr.ogscale);
        } else {
            var targetx = (index - selected) * 210;
            targetx += spr.ogx * (spr.scale / spr.ogscale);
            spr.x += (targetx - spr.x) / 7;
        }
        spr.y = spr.ogy * (spr.scale / spr.ogscale);
    }

    var charSprites = [];

    for (var index in Object.keys(chars)) {
        var spr = new window.GRender.Sprite(0, 0, null, 32, 32);
        setupCharacterSprite(spr, index);
        moveSprToSelected(spr, index, true);
        charSprites.push(spr);
    }
    window.sprites = [menubg]
    .concat(charSprites)
    .concat([
            text,
            arrowLeft,
            arrowRight
        ]);

    if (window.gvbsonicUseCharacterSelect) {

        //playmusic();

        replayAnimation();

        arrowRight.x = arrowPos;
        arrowLeft.x = -arrowPos;

        while (characterSelectOpen) {
            await window.tickAsync60FPSTimer();
            /*var selectedID = chars[selected];
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
            characterView.x += (0 - characterView.x) / 10;
            characterView.scale = characterView.scale * 2;
             */
            var i = 0;
            for (var spr of charSprites) {
                spr.trs = 1 - Math.abs(spr.x / 200);
                if (spr.trs < 0) {
                    spr.trs = 0;
                }
                spr.scale = spr.ogscale * 2;
                moveSprToSelected(spr, i, false);
                i += 1;
            }

            var selectedID = chars[index];
            if (charInfo[selectedID]) {
                window.gvbsonicUseTailsNPC = false;
                window.gvbsonicSelectedChar = selectedID;
                window.gvbsonicNPCCharacter = selectedID;
            } else {
                window.gvbsonicUseTailsNPC = selectedID.enableCPU;
                window.gvbsonicSelectedChar = selectedID.playerCharacter;
                window.gvbsonicNPCCharacter = selectedID.CPUCharacter;
            }

            arrowRight.x += (arrowPos - arrowRight.x) / 7;
            arrowLeft.x += ((arrowPos * -1) - arrowLeft.x) / 7;
			
			arrowRight.x += Math.cos(Date.now()/600)*2;
			arrowLeft.x -= Math.cos(Date.now()/600)*2;
        }
    }
    //mus.pause();
    //mus.onended = function () {};

    gvbsonic.handleKeyDown = null;

    await window.transitionFadeIn();

    characterView.currentAnimation = null;

    window.sprites = [];

    if (aborted) {
        backtomenu();
    } else {
        next();
    }
};
