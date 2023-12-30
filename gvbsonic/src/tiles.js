function getNameIdThing(name, amount) {
    var i = 0;
    var names = [];
    while (i < amount) {
        names.push(name + i + ".png");
        i += 1;
    }
    return names;
}

async function createImagesFromPaths(paths) {
    var images = [];
    for (var id of paths) {
        images.push(await window.loadImage(id));
    }
    return images;
}
window.fetchJSON = async function fetchJSON(j,useUnmodified) {
    var a = await window.fetchFile(j,useUnmodified);
    var b = await a.text();
    return JSON.parse(b);
};
var tempTilesWOWThisIsSoLong = {};
window.disableTileCollisionTypes = {};
async function addTile(info) {
    if (info.disableCollision) {
        window.disableTileCollisionTypes[info.id] = true;
    }
    if (info.path) {
        tempTilesWOWThisIsSoLong[info.id] = await window.loadImage(info.path);
    } else {
        tempTilesWOWThisIsSoLong[info.id] = null; //used to fix some errors that null/undefined image paths cause.
    }
}
async function registerTileInfo(td) {
    try {
        if (td.addingMethod == "single") {
            //just add a singluar tile, used mostly for objects.
            await addTile(td.tile);
        }
        if (td.addingMethod == "multiple") {
            //use this for multiple files, saves a whole lot of time and effort.
            var count = 0;
            while (count < td.amount) {
                var num = count + td.startNum;
                var tilePath = td.pathStart + num + td.pathEnd;
                var id = td.idPrefix + num;
                await addTile({
                    id: id,
                    path: tilePath,
                    disableCollision: td.disableCollision
                });
                count += 1;
            }
        }
    } catch (e) {
        console.warn("Tile loading catched an error", e);
    }
}
window.loadTiles = async function () {
    try {
        //for beginers like macre. (my online friend!)
        //STOP, this is not the place anymore to add tiles into the game.
        //the correct way is to go to res/tiles.json, from there, you can
        //exactly remove tiles easily, while not interfering with other ones.

        //below is just to convert this json file into a array to load images.
		
		tempTilesWOWThisIsSoLong = {};
		
        var data = await window.fetchJSON("res/tiles.json", true); //force it to load unmodified tiles.
		
		if (await window.moddedFileExists("tiles.json")) {
			try{
				var modifiedData = await window.fetchJSON("tiles.json");
				//Now add on the modified tiles.
				for (var modTile of modifiedData) {
					data.push(modTile);
				}
			}catch(e){
				console.error("Unable to load tiles.",e);
			}
		}
        
        for (var td of data) {
            await registerTileInfo(td);
        }

        return tempTilesWOWThisIsSoLong;
    } catch (e) {
        window.alert(e);
    }
};

window.gvbsonicTileManager = {
	addTileset:async function (data) {
		for (var td of data) {
            await registerTileInfo(td);
        }
	},
	addTile:addTile
};