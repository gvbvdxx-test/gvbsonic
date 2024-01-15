window.titleScreen = async function () {
    setTitleInfo("");
    window.transitionFadeOut();
	var starttext2 = new window.GRender.TextSprite(1, 181, null, 32, 40);
    var starttext = new window.GRender.TextSprite(0, 180, null, 32, 40);
    var titleMusic = new window.AudioApiReplacement(window.files.jingles.title);
    titleMusic.setVolume(1); //volume 100%
    titleMusic.play(); //play audio.


    var titlebg = new window.GRender.Sprite(0, -40, window.files.gvbsonicBG, 1280, 563);

    //flash thingy

    var flash = new window.GRender.SquareSprite(0, 0, null, 600, 360);

    flash.trs = 0; //dont show. like the ghosting effect in scratch. ranged from 0 to 1

    flash.color = "white";

    //sonic

    var titleSonic = new window.GRender.Sprite(0, -1000, window.files.gvbsonicLogo, 160, 196);

    titleSonic.imageLocation = getSpriteByName(window.files.gvbsonicLogoSpritesheet.sprites, "sonic.png");

    //goes behind sonic

    var emptyCircle = new window.GRender.Sprite(0, 0, window.files.gvbsonicLogo, 268, 266);

    emptyCircle.imageLocation = getSpriteByName(window.files.gvbsonicLogoSpritesheet.sprites, "circle.png");

    //goes in front of sonic

    var centerCircle = new window.GRender.Sprite(-2, 11, window.files.gvbsonicLogo, 438, 288);

    centerCircle.imageLocation = getSpriteByName(window.files.gvbsonicLogoSpritesheet.sprites, "title.png");

    starttext.center = true;
    starttext.color = "black";
    starttext.bold = true;
    starttext.font = "pixel";
    starttext.text = "Press <Enter> To Start";
	
	starttext2.center = true;
    starttext2.color = "white";
    starttext2.bold = true;
    starttext2.font = "pixel";
    starttext2.text = "Press <Enter> To Start";

    window.sprites = [
        titlebg,
        emptyCircle,
        titleSonic,
        centerCircle,
		starttext2,
        starttext,
        flash
    ];

    document.onkeydown = async function (event) {
        if (event.key == "Enter") {
            titleMusic.onended = function () {};
            titleshowing = false;
            document.onkeydown = null;
            menuMoveSound = new window.AudioApiReplacement(window.files.sfx.menuaccept);
            menuMoveSound.setVolume(1);
            menuMoveSound.play();
            var vol = 100;
            while (vol > 0) {
                await window.tickAsync60FPS();
                vol -= 2;
                if (0 > vol) {
                    vol = 0;
                }
                titleMusic.setVolume(vol / 100);
            }
            titleMusic.pause();
        }
    };
    var titleshowing = true;
    var y = 0;
    var frameCount = 1;
    titleSonic.y2 = -1000;

    emptyCircle.visible = false;

    centerCircle.visible = false;

    var y2 = 0;
    while (titleshowing) {
        await window.tickAsync60FPSTimer();
        y = Math.round(Math.cos(frameCount / 30) * 5);
        y2 = Math.round(Math.cos(frameCount / 13) * 15);
        titleSonic.y2 += ((-50) - titleSonic.y2) / 20;
        emptyCircle.y += ((y + 11) - emptyCircle.y) / 10;
        centerCircle.y += ((y + 11) - centerCircle.y) / 10;
        frameCount += 1;
        if (frameCount == 53) {
            flash.trs = 1; //display for a second
            emptyCircle.visible = true;
            centerCircle.visible = true;
        }
        if (frameCount > 53) {
            titleSonic.y = (y2) + titleSonic.y2;
        } else {
            titleSonic.y = titleSonic.y2;
			centerCircle.y = 300;
			emptyCircle.y = -300;
        }
        if (frameCount > 53) {
            titlebg.x -= 2;

            if (titlebg.x < -320) {
                titlebg.x = 320;
            }
        }

        flash.trs += (0 - flash.trs) / 30;
    }
    document.onkeydown = null;
    await window.transitionFadeIn();
    window.sprites = [];
    await window.waitAsync(0.3);
};