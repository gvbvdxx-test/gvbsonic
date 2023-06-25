var renderer = new window.GRender.Render(
  document.getElementById("editor"),
  true
);
var TilesScale = {
  45: 2,
  46: 2,
  47: 2,
  48: 2,
  49: 2,
  50: 2,
  51: 2,
  52: 2,
  53: 2,
  54: 2
};
var ghzTiles = {};
async function loadGHZTiles() {
  ghzTiles = {
    45: await window.renderer.createImage("res/tiles/sonic1/tile-000.png"),
    46: await window.renderer.createImage("res/tiles/sonic1/tile-052.png"),
    47: await window.renderer.createImage("res/tiles/sonic1/tile-051.png"),
    48: await window.renderer.createImage("res/tiles/sonic1/tile-002.png"),
    49: await window.renderer.createImage("res/tiles/sonic1/tile-001.png"),
    49: await window.renderer.createImage("res/tiles/sonic1/tile-001.png"),
    50: await window.renderer.createImage("res/tiles/sonic1/tile-006.png"),
    51: await window.renderer.createImage("res/tiles/sonic1/tile-004.png"),
    52:await window.renderer.createImage("res/tiles/sonic1/tile-007.png"),
    53:await window.renderer.createImage("res/tiles/sonic1/tile-008.png"),
    54:await window.renderer.createImage("res/tiles/sonic1/tile-009.png")
  };
}
var editorc = document.getElementById("editor");
var loadingstat = document.getElementById("loadings");
var tileinfo = document.getElementById("tileinfo");
var dataout = document.getElementById("data");
var lfile = document.getElementById("lfile");
var save = document.getElementById("save");
var loadfromurl = document.getElementById("loadfromurl");
var url = document.getElementById("url");
var textvalue = document.getElementById("textvalue");
var savetext = document.getElementById("savetext");
var monitorTypes = {
  43: {
    type: "ring",
    spriteLocation: {
      x: 28,
      y: 97,
      width: 56,
      height: 64,
    },
  },
  44: {
    type: "eggman",
    spriteLocation: {
      x: 425,
      y: 0,
      width: 56,
      height: 64,
    },
  },
};
window.renderer = renderer;
var animationframe = [];
window.HDRendering = false;
// initialize the timer variables and start the animation
window.tickAsync = function () {
  return new Promise((a) => {
    setTimeout(a, 1);
    //setTimeout(a,1000 / 60);
  });
};
window.tickfastAsync = function () {
  return new Promise((a) => {
    setTimeout(a, 1);
  });
};
window.waitAsync = function (secs) {
  return new Promise((a) => {
    setTimeout(a, secs * 1000);
  });
};
var editorsprite = null;
var tiles = [];
var parts = [];
var levels = [];
var scroll = [0, 0];
var cr = window.renderer.createImage;
window.filesLoaded = 0;
window.renderer.createImage = async function (url) {
  try {
    var img = await cr(url);

    window.filesLoaded += 1;
    loadingstat.innerHTML = "Loading files... " + window.filesLoaded;
    return img;
  } catch (e) {
    window.alert(e);
  }
};
var enablekey = false;
var currenttile = 0;
var gridtoggle = true;
var selectedlayer = 0;
(async function () {
  try {
    editorc.onmouseover = function () {
      enablekey = true;
    };
    editorc.onmouseout = function () {
      enablekey = false;
    };
    tiles = await window.loadTiles();
    editorsprite = new window.GRender.Sprite(
      0,
      0,
      tiles[currenttile],
      128,
      128
    );
    await loadGHZTiles();
    var s1 = await renderer.createImage("editor/s1.png");
    var s2 = await renderer.createImage("editor/s2.png");
    editorsprite.trs = 0.5;
    function addTile(x, y, id, type, layer, t) {
      var widthheight = [1, 1];
      if (tiles[id]) {
        widthheight = [tiles[id].width, tiles[id].height];
      }
      var tile = new window.GRender.Sprite(
        0,
        0,
        tiles[id],
        widthheight[0],
        widthheight[1]
      );
      tile.sx = x;
      tile.sy = y;
      tile.stype = type;
      tile.sid = id;
      tile.slayer = layer;
      tile.stext = t;
      levels.push(tile);
    }
    function removeTile(x, y, layer) {
      var a = [];
      for (var t of levels) {
        if (
          !(
            Math.round(t.sx / 20) * 20 == Math.round(x / 20) * 20 &&
            Math.round(t.sy / 20) * 20 == Math.round(y / 20) * 20 &&
            t.slayer == layer
          )
        ) {
          a.push(t);
        }
      }
      levels = a;
    }
    parts = [];
    levels = [];
    loadingstat.hidden = true;
    renderer.mouseDetectionEnabled = true;
    window.loadLevel = function loadLevel(j) {
      levels = [];
      for (var obj of j.tiles) {
        addTile(obj.x, obj.y * -1, obj.id, obj.type, obj.layer, obj.text);
      }
    };
    loadfromurl.onclick = async function () {
      var j = JSON.parse(await (await fetch(url.value)).text());
      window.loadLevel(j);
    };
    lfile.onchange = function () {
      if (lfile.files[0]) {
        var r = new FileReader();
        r.onload = function () {
          try {
            var j = JSON.parse(r.result);
            window.loadLevel(j);
          } catch (e) {
            window.alert("Failed to load JSON. \n" + e);
          }
        };
        r.readAsText(lfile.files[0]);
      }
      lfile.value = "";
    };
    dataout.onchange = function () {};
    window.saveLevel = function () {
      var j = { tiles: [] };
      for (var l of levels) {
        j.tiles.push({
          x: l.sx,
          y: l.sy * -1,
          type: l.stype,
          id: l.sid,
          layer: l.slayer,
          text: l.stext,
        });
      }
      return j;
    };
    savetext.onclick = function () {
      document.getElementById("exporttext").value = JSON.stringify(
        window.saveLevel(),
        null,
        "\t"
      );
    };
    save.onclick = function () {
      var blob = new Blob([JSON.stringify(window.saveLevel(), null, "\t")], {
        type: "application/json",
      });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "gvbvdxx sonic engine level.json";
      a.click();
    };
    setInterval(() => {}, 10);
    window.onkeydown = function (e) {
      if (enablekey) {
        if (e.key == "z") {
          currenttile += 1;
          if (currenttile > tiles.length - 1) {
            currenttile = 0;
          }
          e.preventDefault();
        }
        if (e.key == "x") {
          currenttile -= 1;
          if (currenttile < 1) {
            currenttile = 0;
          }
          e.preventDefault();
        }
        if (e.key == "l") {
          selectedlayer += 1;
          if (selectedlayer > 3) {
            selectedlayer = 0;
          }
        }
        if (e.key == "ArrowLeft") {
          scroll[0] += 128;
          e.preventDefault();
        }
        if (e.key == "ArrowRight") {
          scroll[0] -= 128;
          e.preventDefault();
        }
        if (e.key == "ArrowUp") {
          scroll[1] += 128;
          e.preventDefault();
        }
        if (e.key == "ArrowDown") {
          scroll[1] -= 128;
          e.preventDefault();
        }
        if (e.key == " ") {
          //remember, the space bar is a whitespace of the event key value.
          try {
            addTile(
              editorsprite.sx,
              editorsprite.sy,
              editorsprite.sid,
              editorsprite.stype,
              selectedlayer,
              editorsprite.stext
            );
          } catch (e) {
            window.alert(e);
          }
          e.preventDefault();
        }
        if (e.key == "c") {
          removeTile(editorsprite.sx, editorsprite.sy, selectedlayer);
          e.preventDefault();
        }
      }
    };

    while (true) {
      await window.tickAsync();

      editorsprite.image = tiles[currenttile];
      editorsprite.sid = currenttile;
      if (editorsprite.image) {
        editorsprite.width = tiles[currenttile].width;
        editorsprite.height = tiles[currenttile].height;
      }
      gridtoggle = true;
      if (editorsprite.sid == 14) {
        gridtoggle = false;
      }
      if (editorsprite.sid == 12) {
        gridtoggle = false;
      }
      if (editorsprite.sid == 13) {
        gridtoggle = false;
      }
      if (editorsprite.sid == 41) {
        gridtoggle = false;
      }
      if (editorsprite.sid == 30) {
        gridtoggle = false;
      }
      if (editorsprite.sid == 15) {
        gridtoggle = false;
      }
      if (editorsprite.sid == 42) {
        gridtoggle = false;
      }
      if (monitorTypes[editorsprite.sid]) {
        gridtoggle = false;
      }
      if (gridtoggle) {
        editorsprite.sx =
          Math.round((renderer.mousePos[0] - scroll[0]) / 128) * 128;
        editorsprite.sy =
          Math.round((renderer.mousePos[1] - scroll[1]) / 128) * 128;
      } else {
        editorsprite.sx =
          Math.round((renderer.mousePos[0] - scroll[0]) / 5) * 5;
        editorsprite.sy =
          Math.round((renderer.mousePos[1] - scroll[1]) / 5) * 5;
      }

      function doRunSprite(s) {
        s.scale = 1;
        s.imageLocation = null;
        s.stype = "tile";
        s.type = "norm";
        if (s.sid == 30) {
          s.y += 50;
          s.stype = "motobug";
        }
        if (s.sid == 12) {
          s.stype = "s1";
          s.image = s1;
          s.width = 36;
          s.height = 36;
        }
        if (s.sid == 13) {
          s.stype = "s2";
          s.image = s2;
          s.width = 36;
          s.height = 36;
        }
        if (s.sid == 15) {
          s.stype = "sign";
        }
        if (s.sid == 42) {
          s.width = 28;
          s.height = 16;
          s.stype = "springRed";
          s.imageLocation = {
            x: 132,
            y: 0,
            width: 28,
            height: 16,
          };
        }
        if (s.sid == 41) {
          s.type = "text";
          s.stype = "text";
          s.color = "black";
          s.text = s.stext;
          s.size = 15;
          s.center = true;
          s.height = 15;
        }
        if (monitorTypes[s.sid]) {
          s.scale = 0.5;
          s.stype = "monitor-" + monitorTypes[s.sid].type;
          s.imageLocation = monitorTypes[s.sid].spriteLocation;
          s.width = 56;
          s.height = 64;
        }
        if (TilesScale[s.sid]) {
          s.scale = TilesScale[s.sid];
        }
        if (s.sid == 14) {
          s.stype = "ring";
          s.imageLocation = {
            x: 0,
            y: 0,
            width: 16,
            height: 16,
          };
          s.width = 16;
          s.height = 16;
        }
        if (ghzTiles[s.sid]) {
          s.width = 128;
          s.height = 128;
          s.image = ghzTiles[s.sid];
        }
        if (s.slayer == selectedlayer) {
          s.trs = 1;
        } else {
          s.trs = 0.6;
        }
      }
      editorsprite.x = scroll[0] + editorsprite.sx;
      editorsprite.y = scroll[1] + editorsprite.sy;
      if (textvalue.value.length > 0) {
        editorsprite.stext = textvalue.value;
      } else {
        editorsprite.stext = null;
      }
      tileinfo.innerHTML = `X: ${editorsprite.sx} Y: ${editorsprite.sy} ID: ${editorsprite.sid} Layer: ${selectedlayer}`;
      doRunSprite(editorsprite);
      var a = [];
      var b = [];
      for (var ti of levels) {
        if (ti.stype == "tile") {
          a.push(ti);
        } else {
          b.push(ti);
        }
      }
      for (var ti of b.concat(a)) {
        ti.x = scroll[0] + ti.sx;
        ti.y = scroll[1] + ti.sy;
        doRunSprite(ti);
      }
      renderer.drawSprites(levels.concat(editorsprite));
    }
  } catch (e) {
    window.alert(e);
  }
})();
