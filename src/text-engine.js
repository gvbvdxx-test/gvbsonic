(function () {
	async function readJSON(j) {
        var a = await window.fetchFile(j);
        var b = await a.text();
        return JSON.parse(b);
    }
    function getSpriteByName(sprites, name) {
        for (var spr of sprites) {
            if (spr.name.toLowerCase() == name.toLowerCase()) {
                return spr;
            }
        }
        return null;
    }
	async function loadFont (name) {
		var pathMain = `res/spritesheet_fonts/${name}/`
		return {
			image: await window.loadImage(pathMain+"font.png"),
			sheetmap: await readJSON(pathMain+"font.json"),
			map: await readJSON(pathMain+"mapping.json"),
		};
	}
	function getMapThing (map,char) {
		//This checks for normal character, 
		//then uppercase if that does not exist,
		//then checks in lowercase if uppercase check fails,
		//if that fails then undefined.
		if (typeof map[char] == "string") {
			return map[char.toLowerCase()];
		}
		if (typeof map[char.toLowerCase()] == "string") {
			return map[char.toLowerCase()];
		}
		if (typeof map[char.toUpperCase()] == "string") {
			return map[char.toUpperCase()];
		}
		return undefined;
	}
    function makeText(ctxOrCvs, contents, fnt) {
		var image = fnt.image;
		var sprites = fnt.sheetmap.sprites;
		var map = fnt.map;
        var text = contents.toString(); //Verify we are using a string.
        var cvs = ctxOrCvs.canvas; //Get the canvas.
		var ctx = ctxOrCvs;
		if (!ctxOrCvs.canvas) {
			cvs = ctxOrCvs;
			ctx = ctxOrCvs.getContext("2d");
		}
		ctx.imageSmoothingEnabled = false;

        //calculate the size.
        //This just figures out how tall and wide
        //the canvas needs to be in pixels.

        var width = 0;
        var height = 0;
        for (var char of text) {
            if (typeof getMapThing(map,char) == "string") {
                var spr = getSpriteByName(sprites, getMapThing(map,char));
                if (height < spr.height) {
                    height = spr.height;
                }
                width += spr.width;
            }
			if (char == " ") {
				width += 14;
			}
        }

        //Set canvas sizes.
        cvs.width = width;
        cvs.height = height;

        //Render it onto the canvas.
        var x = 0;
        for (var char of text) {
            if (typeof getMapThing(map,char) == "string") {
                var c = getSpriteByName(sprites, getMapThing(map,char));
                ctx.drawImage(
                    image,
                    c.x,
                    c.y,
                    c.width,
                    c.height,
                    x,
                    0,
                    c.width,
                    c.height);
				x += c.width;
            }
			if (char == " ") {
				x += 14;
			}
        }
    }
	
	//Make things global.
	window.loadFont = loadFont;
	window.drawFont = makeText;
})();
