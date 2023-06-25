window.lowestLevelY = 0;
window.formatLevel = async function (level, images) {
  try {
    var sprites = [];
    var collisioncvs = document.createElement("canvas");
    var ctx = collisioncvs.getContext("2d");
    await window.waitAsync(0.5);
    window.lowestLevelY = 0;
    function addTile(tile) {
      try{
      var spr = new window.GRender.Sprite(
        tile.x,
        tile.y,
        images[tile.id],
        128,
        128
      );
      if (tile.layer) {
        spr.layer = tile.layer;
      } else {
        spr.layer = 0;
      }
      if (tile.dir) {
        spr.direction = tile.dir;
      } else {
        spr.direction = 90; //90 degrees is up right
      }
      if (tile.type) {
        spr.stype = tile.type;
        if (spr.stype == "s1" || spr.stype == "s2") {
          //spr.image = images[0];
        }
      } else {
        spr.stype = "tile";
      }
      if (window.files.tileScales[tile.id]) {
        ctx.canvas.width = 128 * window.files.tileScales[tile.id];
        ctx.canvas.height = 128 * window.files.tileScales[tile.id];
        ctx.drawImage(
          spr.image,
          0,
          0,
          128 * window.files.tileScales[tile.id],
          128 * window.files.tileScales[tile.id]
        );
      } else {
        if (false) {
          var info = {
            x: 198,
            y: 97,
            width: 56,
            height: 64,
            name: "normal.png",
          };
          ctx.canvas.width = info.width;
          ctx.canvas.height = info.height;
          ctx.drawImage(
            spr.image,
            info.x,
            info.y,
            info.width,
            info.height,
            0,
            0,
            info.width,
            info.height
          );
        } else {
          ctx.canvas.width = 128;
          ctx.canvas.height = 128;
          ctx.drawImage(spr.image, 0, 0, 128, 128);
        }
      }
      //document.body.append(collisioncvs);
      if (tile.text) {
        spr.stext = tile.text;
        spr.font = "arial";
      }
      /*if ((spr.stype == "tile")
         ) {*/
      if (true) {
        try {
          spr.mask = new window.CollisionMask(
            ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
          );
        } catch (e) {
          //window.alert(e);
        }
      }
      spr.sx = tile.x;
      spr.sid = tile.id;
      spr.sy = tile.y * -1;
      spr.istile = true;
      if (spr.stype == "motobug") {
        spr.sy += 50; //motobugs are like a tile, and have offset images in the editor, so offsetting the thing in the game.
      }
      if (spr.sy + 128 > window.lowestLevelY) {
        window.lowestLevelY = spr.sy + 128;
      }
      sprites.push(spr);
      }catch(e){
        window.alert(e);
      }
    }
    for (var tile of level.tiles) {
      if (tile.layer == 3) {
        addTile(tile);
      }
    }
    for (var tile of level.tiles) {
      if (tile.layer == 2 || tile.layer == 1 || tile.layer == 0) {
        addTile(tile);
      }
    }
    //window.alert(window.lowestLevelY);
  } catch (e) {
    window.alert(e);
  }
  return sprites;
};
