window.lowestLevelY = 0;

//Might be better to store image data in memory, so if we need it again, we wont need to create another one.
window.tileIMGData = {};
window.tileCTXData = {};
window.tileCollisionMasks = {};

window.formatLevel = async function (level, images) {
    try {
        var sprites = [];
        window.levelinfo = {
            disableYLock: false,
            background: null,
            BGM: null,
            title: "",
            spawn: [0, 0]
        };

        await window.waitAsync(0.5);
        window.lowestLevelY = 0;
        if (level.disableYLock) {
            window.levelinfo.disableYLock = true;
        }
        if (level.title) {
            window.levelinfo.title = level.title;
        }
        if (level.BGM) {
            window.levelinfo.BGM = level.BGM;
        }
        if (level.background) {
            window.levelinfo.background = level.background;
        }
        async function addTile(tile) {
            try {
                var tilesize = [128, 128];

                if (images[tile.id]) {
                    tilesize[0] = images[tile.id].width;
                    tilesize[1] = images[tile.id].height;
                }

                var spr = new window.GRender.Sprite(
                        tile.x,
                        tile.y,
                        images[tile.id],
                        tilesize[0],
                        tilesize[1]);
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

                if (!window.tileIMGData[tile.id]) {
                    var collisioncvs = document.createElement("canvas");
                    var ctx = collisioncvs.getContext("2d", {
                        willReadFrequently: true
                    });
                    ctx.canvas.width = tilesize[0];
                    ctx.canvas.height = tilesize[1];
                    ctx.clearRect(0, 0, tilesize[0], tilesize[1]);
                    ctx.drawImage(spr.image, 0, 0, tilesize[0], tilesize[1]);
                    var imgdata = ctx.getImageData(
                            0,
                            0,
                            ctx.canvas.width,
                            ctx.canvas.height);
					window.tileCTXData[tile.id] = ctx;
                    window.tileIMGData[tile.id] = imgdata;
                } else {
                    var imgdata = window.tileIMGData[tile.id];
                    var ctx = window.tileCTXData[tile.id];
                }
                if (!window.disableTileCollisionTypes[tile.id]) {
					var msk = window.tileCollisionMasks[tile.id];
					if (!msk) {
						msk = new window.gvbvdxxsCollisionMask(ctx);
						window.tileCollisionMasks[tile.id] = msk;
					}
                    spr.mask = msk;
                }
                //document.body.append(collisioncvs);
                if (tile.text) {
                    spr.stext = tile.text;
                    spr.font = "arial";
                }
                /*if ((spr.stype == "tile")
                ) {*/
                if (true) {}
                spr.sx = tile.x;
                spr.sid = tile.id;
                spr.sy = tile.y * -1;
                spr.istile = true;
                if (spr.stype == "motobug") {
                    spr.sy += 50; //motobugs are like a tile, and have offset images in the editor, so we need to offset the thing in the game.
                }
                if (spr.sy + 128 > window.lowestLevelY) {
                    window.lowestLevelY = spr.sy + 128;
                }
                window.doTileBehaviorSpawn(spr);
                //This event is for when tiles get spawned.
                //Added this in so we don't have to "tap into" the
                //function to get access to the tile properties and set them.
                //Values: TileSprite, JSONTileProperties.
                await gvbsonic.events.emitAsync("loadtile", spr, tile);
                if (spr.stype == "spawn") {
                    window.levelinfo.spawn = [spr.sx, spr.sy];
                } else {
                    sprites.push(spr);
                }
            } catch (e) {
                console.error(e);
                //window.alert(e);
            }
        }
        for (var tile of level.tiles) {
            if (tile.layer == 3) {
                await addTile(tile);
            }
        }
        for (var tile of level.tiles) {
            if (tile.layer == 2 || tile.layer == 1 || tile.layer == 0) {
                await addTile(tile);
            }
        }
        //window.alert(window.lowestLevelY);
    } catch (e) {
        window.alert(e);
    }
    return sprites;
};
