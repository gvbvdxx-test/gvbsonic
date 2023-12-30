//Work in progress!

window.FX = {};
window.FX.invertImage = function (loadedImage, canvas) {
    if (loadedImage) {
        if (canvas) {
            var cvs = canvas;
        } else {
            var cvs = document.createElement("canvas");
        }
        var ctx = cvs.getContext("2d");

        cvs.width = loadedImage.width;
        cvs.height = loadedImage.height;

        ctx.drawImage(loadedImage, 0, 0, cvs.width, cvs.height);

        var imageData = ctx.getImageData(0, 0, cvs.width, cvs.height);

        var i = 0;

        var data = imageData.data;

        while (data.length > i) {
            var r = data[i];
            var g = data[i + 1];
            var b = data[i + 2];

            data[i] = b;
            data[i + 1] = g;
            data[i + 2] = r;

            i += 4;
        }

        ctx.putImageData(imageData, 0, 0);

        return cvs;
    } else {
        throw new Error("Argument 1 is reqired to use the \"invertImage\" function.");
    }
};

window.FX.glitchImage = function (loadedImage, canvas) {
    if (loadedImage) {
        if (canvas) {
            var cvs = canvas;
        } else {
            var cvs = document.createElement("canvas");
        }
        var ctx = cvs.getContext("2d");

        cvs.width = loadedImage.width;
        cvs.height = loadedImage.height;

        ctx.drawImage(loadedImage, 0, 0, cvs.width, cvs.height);

        var imageData = ctx.getImageData(0, 0, cvs.width, cvs.height);

        var i = 0;

        var data = imageData.data;

        while (data.length > i) {
            var r = data[i];
            var g = data[i + 1];
            var b = data[i + 2];

            if (Math.random() > 0.7) { //Random chance it will replace a pixel.
                data[i] = Math.random() * 256;
                data[i + 1] = Math.random() * 256;
                data[i + 2] = Math.random() * 256;

                data[i + 3] = 256;
            } else {
                if (Math.random() > 0.3) { //Higher chance it will invert a pixel
                    data[i] = data[i + 2];
                    data[i + 1] = data[i + 1];
                    data[i + 2] = data[i];
                } else {
                    //Otherwise, change a random pixel.
                    var randomIndex = Math.round((Math.random() * data.length) * 256);
                    data[randomIndex] = Math.random() * 256;
                    data[randomIndex + 1] = Math.random() * 256;
                    data[randomIndex + 2] = Math.random() * 256;

                    data[randomIndex + 3] = 256;
                }
            }
            i += 4;
        }

        ctx.putImageData(imageData, 0, 0);

        return cvs;
    } else {
        throw new Error("Argument 1 is reqired to use the \"brightenImage\" function.");
    }
};

window.FX.brightenImage = function (loadedImage, brightness, canvas) {
    if (loadedImage && ((typeof brightness) == "number")) {
        if (canvas) {
            var cvs = canvas;
        } else {
            var cvs = document.createElement("canvas");
        }
        var ctx = cvs.getContext("2d");

        cvs.width = loadedImage.width;
        cvs.height = loadedImage.height;

        ctx.drawImage(loadedImage, 0, 0, cvs.width, cvs.height);

        var imageData = ctx.getImageData(0, 0, cvs.width, cvs.height);

        var i = 0;

        var data = imageData.data;

        while (data.length > i) {
            var r = data[i];
            var g = data[i + 1];
            var b = data[i + 2];
			
			var rnew = r + brightness;
			var gnew = g + brightness;
			var bnew = b + brightness;
			
			if (rnew < 0) {
				rnew = 0;
			}
			if (rnew > 256) {
				rnew = 256;
			}
			
			if (gnew < 0) {
				gnew = 0;
			}
			if (gnew > 256) {
				gnew = 256;
			}
			
			if (bnew < 0) {
				bnew = 0;
			}
			if (bnew > 256) {
				bnew = 256;
			}
			
            data[i] = rnew;
            data[i + 1] = gnew;
            data[i + 2] = bnew;

            i += 4;
        }

        ctx.putImageData(imageData, 0, 0);

        return cvs;
    } else {
        throw new Error("Argument 1 and 2 is reqired to use the \"brightenImage\" function.");
    }
};

window.FX.removeTransparencyFromImage = function (loadedImage, canvas) {
    if (loadedImage && ((typeof brightness) == "number")) {
        if (canvas) {
            var cvs = canvas;
        } else {
            var cvs = document.createElement("canvas");
        }
        var ctx = cvs.getContext("2d");

        cvs.width = loadedImage.width;
        cvs.height = loadedImage.height;

        ctx.drawImage(loadedImage, 0, 0, cvs.width, cvs.height);

        var imageData = ctx.getImageData(0, 0, cvs.width, cvs.height);

        var i = 0;

        var data = imageData.data;

        while (data.length > i) {
			data[i + 3] = 256;
            i += 4;
        }

        ctx.putImageData(imageData, 0, 0);

        return cvs;
    } else {
        throw new Error("Argument 1 and 2 is reqired to use the \"brightenImage\" function.");
    }
};
