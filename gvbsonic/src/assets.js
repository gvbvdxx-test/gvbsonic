var level = null;
window.filesloaded = 0;
(async function () {
  var text = document.getElementById("loadingtext");
  var cr = window.renderer.createImage;
  var loadang = 0;
  window.renderer.createImage=async function(url){
    try{
		console.log(`Loaded Image/Sprite Asset "${url}"`);
      window.fileloadedname = url;
      var shorten = "";
      var i = 0;
      while (i < 200) {
        if (url[i]) {
          shorten += url[i];
        }
        i += 1;
      }
      document.getElementById("fileinfo").innerHTML += "<br>Loaded Image "+shorten;
      document.getElementById("fileinfo").scrollTo(0, document.getElementById("fileinfo").scrollHeight);
      var img = await cr(url);
      window.filesloaded+=1;
      return img;
    }catch(e){window.alert(e);}
  };
  text.hidden = false;
  //Load files
  try {
	window.files.mutliConnecting = await window.renderer.createImage(
      "res/multiplayer/connecting.png"
    );
    window.files.sonic = await window.renderer.createImage(
      "res/characters/sonic.png"
    );
    window.files.tails = await window.renderer.createImage(
      "res/characters/tails.png"
    );
    window.files.newsonic = await window.renderer.createImage(
      "res/characters/newsonic.png"
    );
    window.files.maniaSonic = await window.renderer.createImage(
      "res/characters/maniasonic.png"
    );
	window.files.menuStuff ={
		multi:await window.renderer.createImage(
		  "res/menu/multi.png"
		),
		main:await window.renderer.createImage(
		  "res/menu/main.png"
		),
		exit:await window.renderer.createImage(
		  "res/menu/exit.png"
		),
		cyan:await window.renderer.createImage(
		  "res/menu/cyan.png"
		),
		red:await window.renderer.createImage(
		  "res/menu/red.png"
		),
		host:await window.renderer.createImage(
		  "res/menu/multiplayer/host.png"
		),
		join:await window.renderer.createImage(
		  "res/menu/multiplayer/join.png"
		),
		back:await window.renderer.createImage(
		  "res/menu/back.png"
		)
	}
    window.files.jingles = {
      levelClear: await window.loadSoundURL("res/music/jingles/EndJingle.mp3"),
      title: await window.loadSoundURL("res/music/sonic2/title-screen.mp3")
    };
    window.files.tileScales = {
      45:2,
      46:2,
      47:2,
      48:2,
      49:2,
      50:2,
      51:2,
      52:2,
      53:2,
      54:2
    };
    window.files.springspritesheet = JSON.parse(await(await fetch("res/items/spring/red.json")).text());
    window.files.monitorSpriteSheet = JSON.parse(await(await fetch("res/items/monitor/monitor.json")).text());
    window.files.monitor = await window.renderer.createImage("res/items/monitor/monitor.png");
    window.files.logo = await window.renderer.createImage("res/title/sonicandtails.png");
    window.files.titlebg = await window.renderer.createImage("res/title/ehzbg.png");
    window.files.ring = await window.renderer.createImage("res/items/ring.png");
    window.files.sonic1Tiles = {
      45:await window.renderer.createImage("res/tiles/sonic1/tile-000.png"),
      46:await window.renderer.createImage("res/tiles/sonic1/tile-052.png"),
      47:await window.renderer.createImage("res/tiles/sonic1/tile-051.png"),
      48:await window.renderer.createImage("res/tiles/sonic1/tile-002.png"),
      49:await window.renderer.createImage("res/tiles/sonic1/tile-001.png"),
      50:await window.renderer.createImage("res/tiles/sonic1/tile-006.png"),
      51:await window.renderer.createImage("res/tiles/sonic1/tile-004.png"),
      52:await window.renderer.createImage("res/tiles/sonic1/tile-007.png"),
      53:await window.renderer.createImage("res/tiles/sonic1/tile-008.png"),
      54:await window.renderer.createImage("res/tiles/sonic1/tile-009.png")
    };
    var sfxpcharge = await window.loadSoundURL("res/sfx/PeelCharge.wav")
	window.files.menumusic={
      main:await window.loadSoundURL("res/music/menu/MainMenu.mp3")
    };
	window.files.music={
      SHZ:await window.loadSoundURL("res/music/multiplayer/SHZ.mp3"),
	  COZ:await window.loadSoundURL("res/music/multiplayer/COZ.mp3")
    };
    window.files.sfx={
      jump:await window.loadSoundURL("res/sfx/jump.wav"),
      spin:sfxpcharge,
      spindash:await window.loadSoundURL("res/sfx/spindash.wav"),
      spindashRelease:await window.loadSoundURL("res/sfx/release.wav"),
      ring:await window.loadSoundURL("res/sfx/ring.wav"),
      looseRings:await window.loadSoundURL("res/sfx/looseRings.wav"),
      destory:await window.loadSoundURL("res/sfx/Explosion.wav"),
      death:await window.loadSoundURL("res/sfx/death.wav"),
      spring:await window.loadSoundURL("res/sfx/spring.wav"),
	  menubleep:await window.loadSoundURL("res/sfx/MenuBleep.wav"),
	  menuaccept:await window.loadSoundURL("res/sfx/MenuAccept.wav")
    };
    try {
    } catch (e) {
      window.alert(e);
    }
    var urlfont = (
      "res/fonts/slkscr.ttf"
    );
    async function loadFonts() {
  const font = new FontFace("pixel", `url(${urlfont})`, {
    style: "normal",
    weight: "100",
    stretch: "condensed",
  });
  // wait for font to be loaded
  await font.load();
  // add font to document
  document.fonts.add(font);
  // enable font with CSS class
  document.body.classList.add("fonts-loaded");
}
    await loadFonts();
    try {
      await window.loadLevels();
      window.files.tiles = await window.loadTiles();
      
    } catch (e) {
      window.alert("failed to load tile files: " + e);
    }
    //window.alert(window.files.tiles.length);
    //window.alert("tiles loaded!");
    try {
      /*var levelurl = await window.formatLevel(
        window.files.levels[0],
        window.files.tiles
      );*/
    } catch (e) {
      window.alert("failed to load level " + e);
    }
    try {
      //window.files.level = levelurl;
      window.levelspr = new window.GRender.Sprite(0, 0, null, 32, 32);
      window.files.pointurl =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAAXNSR0IArs4c6QAAABNJREFUGFdjZGBg+M+ABBhJFwAAmlQEAdOfvDwAAAAASUVORK5CYII=";
      window.files.pointimg = await window.renderer.createImage(
        window.files.pointurl
      );
      var collisioncvs = document.createElement("canvas");
      var ctx = collisioncvs.getContext("2d");
      collisioncvs.width = 3;
      collisioncvs.height = 3;
      ctx.drawImage(window.files.pointimg, 0, 0, 1, 1);
      window.files.pointcollision = new window.CollisionMask(
        ctx.getImageData(0, 0, 3, 3)
      );
    } catch (e) {
      window.alert(e);
    }
    var loading = document.getElementById("loading");
    var app = document.getElementById("app");
	loading.hidden = true;
    document.onclick = null;
    app.hidden = false;
    await window.startGame();
  } catch (e) {
    window.alert(e);
  }
})();
