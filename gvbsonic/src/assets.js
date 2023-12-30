var level = null;
window.filesloaded = 0;
var loaderListeners = [];
var addloaderlistener = function (func) {
    loaderListeners.push(func);
};

async function loadEverythingAtOnce() {
    async function timeout() {
        return new Promise((resolve) => {
            setTimeout(resolve, 1);
        })
    };
    var asyncFunctionsLeft = 0;
    loaderListeners.forEach(async function (f) {
        asyncFunctionsLeft += 1;
        await f();
        asyncFunctionsLeft -= 1;
    });
	await timeout();
    while (asyncFunctionsLeft > 0) {
        await timeout();
    }
	await timeout();
	await timeout();
	await timeout();
}

async function loadAssets() {
    window.fastAssetsMode = false;
    var text = document.getElementById("loadingtext");
    var loadang = 0;
    text.hidden = false;
	if (window.preloadModScripts) {
		await window.preloadModScripts();
	}
	await gvbsonic.events.emitAsync("loadassets",window.files);
	
    addloaderlistener(async function () {
        window.files.mutliConnecting = await window.loadImage(
                "res/multiplayer/connecting.png");
    });
    addloaderlistener(async function () {
        window.files.sonic = await window.loadImage(
                "res/characters/sonic.png");
    });
    addloaderlistener(async function () {
        window.files.tails = await window.loadImage(
                "res/characters/tails.png");
    });
    addloaderlistener(async function () {
        window.files.newsonic = await window.loadImage(
                "res/characters/newsonic.png");
    });
    addloaderlistener(async function () {
        window.files.maniaSonic = await window.loadImage(
                "res/characters/maniasonic.png");
    });
    addloaderlistener(async function () {
        window.files.tailss3 = await window.loadImage(
                "res/characters/tailss3.png");
    });
    addloaderlistener(async function () {
        window.files.superSonic = await window.loadImage(
                "res/characters/supersonic.png");
    });
    addloaderlistener(async function () {
        window.files.menuStuff = {
            //menu backgrounds.

            newmenubg: await window.loadImage("res/menu/latest/newmenubg.png"),
			
			characterSelect: await window.loadImage("res/menu/character-select.png"),

            //main menu items.

            exit: await window.loadImage("res/menu/latest/exit.png"),
            options: await window.loadImage("res/menu/latest/options.png"),
            play: await window.loadImage("res/menu/latest/play.png"),
            credits: await window.loadImage("res/menu/latest/credits.png"),

            //misc menu items.
            back: await window.loadImage("res/menu/latest/back.png")
        };
    });
    addloaderlistener(async function () {
        window.files.signposts = {
            sonic: await window.loadImage(
                "res/items/goals/signpost-sonic.png"),
            msonic: await window.loadImage(
                "res/items/goals/signpost-msonic.png"),
            tails: await window.loadImage(
                "res/items/goals/signpost-tails.png"),
        };
    });
    addloaderlistener(async function () {
        window.files.jingles = {
            levelClear: await window.loadAudioFile("res/music/jingles/StageClear.ogg"),
            title: await window.loadAudioFile("res/music/jingles/TitleScreen.wav"),
        };
    });
    addloaderlistener(async function () {
        window.files.tileScales = {};
        window.files.springspritesheet = JSON.parse(
                await(await fetch("res/items/spring/red.json")).text());
        window.files.monitorSpriteSheet = JSON.parse(
                await(await fetch("res/items/monitor/monitor.json")).text());
        window.files.gvbsonicLogoSpritesheet = JSON.parse(
                await(await fetch("res/title/gvbsonic.json")).text());
        window.files.gvbsonicLogo = await window.loadImage(
                "res/title/gvbsonic.png");
        window.files.gvbsonicBG = await window.loadImage(
                "res/title/gvbsonic-bg.png");
        window.files.monitor = await window.loadImage(
                "res/items/monitor/monitor.png");
        window.files.logo = await window.loadImage(
                "res/title/sonicandtails.png");
        window.files.titlebg = await window.loadImage(
                "res/title/ehzbg.png");
    });
    addloaderlistener(async function () {
        window.files.ring = await window.loadImage("res/items/ring.png");
        window.files.sonic1Tiles = {};
        window.files.menumusic = {
            main: await window.loadAudioFile("res/music/menu/MainMenu.wav"),
			character: await window.loadAudioFile("res/music/menu/character.wav"),
        };
    });
    addloaderlistener(async function () {
        var sfxpcharge = await window.loadAudioFile("res/sfx/PeelCharge.wav");
        window.files.music = {};
        window.files.sfx = {
            flyTired: await window.loadAudioFile("res/sfx/Tired.wav"),
            fly: await window.loadAudioFile("res/sfx/Flying.wav"),
            skid: await window.loadAudioFile("res/sfx/Skidding.wav"),
            jump: await window.loadAudioFile("res/sfx/Jump.wav"),
            spike: await window.loadAudioFile("res/sfx/Spike.wav"),
            spin: sfxpcharge,
            spindash: await window.loadAudioFile("res/sfx/Charge.wav"),
            spindashRelease: await window.loadAudioFile("res/sfx/Release.wav"),
            ring: await window.loadAudioFile("res/sfx/Ring.wav"),
            looseRings: await window.loadAudioFile("res/sfx/LoseRings.wav"),
            destory: await window.loadAudioFile("res/sfx/Destroy.wav"),
            death: await window.loadAudioFile("res/sfx/Hurt.wav"),
            spring: await window.loadAudioFile("res/sfx/Spring.wav"),
            menubleep: await window.loadAudioFile("res/sfx/MenuBleep.wav"),
            menuaccept: await window.loadAudioFile("res/sfx/MenuAccept.wav"),
            peelCharge: await window.loadAudioFile("res/sfx/PeelCharge.wav"),
            peelRelease: await window.loadAudioFile("res/sfx/PeelRelease.wav"),
            continue: await window.loadAudioFile("res/sfx/Continue.wav"),
        };
    });
    try {}
    catch (e) {
        window.alert(e);
    }
    addloaderlistener(async function () {
        var urlfont = await window.getAssetURL("res/fonts/pixel.ttf");
        async function loadFonts() {
            var font = new FontFace("pixel", `url(${urlfont})`, {
                style: "normal",
                weight: "100",
                stretch: "condensed",
            });
            await font.load();
            document.fonts.add(font);
            document.body.classList.add("fonts-loaded");
        }
        await loadFonts();
        await window.initCharData();
        try {
            await window.loadLevels();
            window.files.tiles = await window.loadTiles();
        } catch (e) {
            window.alert("failed to load tile files: " + e);
        }
        try {}
        catch (e) {
            window.alert("failed to load level " + e);
        }
    });
    addloaderlistener(async function () {
        try {
            window.levelspr = new window.GRender.Sprite(0, 0, null, 32, 32);
            var collisioncvs = document.createElement("canvas");
            var ctx = collisioncvs.getContext("2d");
            collisioncvs.width = 3;
            collisioncvs.height = 3;
            ctx.fillRect(0, 0, 3, 3);
            window.files.pointcollision = new window.CollisionMask(
                    ctx.getImageData(0, 0, 3, 3));
        } catch (e) {
            window.alert(e);
        }
    });
	
    await loadEverythingAtOnce();
	
	await gvbsonic.events.emitAsync("afterloaded",window.files);

    var loading = document.getElementById("loading");
    var app = document.getElementById("app");
    loading.hidden = true;
    document.onclick = null;
    app.hidden = false;
    await window.startGame();
}
