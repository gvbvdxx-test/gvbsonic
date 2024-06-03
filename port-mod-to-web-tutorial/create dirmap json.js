var fs = require("fs");
var path = require("path");

var dirMap = {};

function parsePath(path) {
	var a = path.replaceAll("\\","/").toLowerCase();
	if (a[0] == "." && a[1] == "/") {
		var i = 2;
		var parsedPath = "";
		while (i < a.length) {
			parsedPath += a[i];
			i += 1;
		}
	} else {
		var i = 0;
		var parsedPath = "";
		while (i < a.length) {
			parsedPath += a[i];
			i += 1;
		}
	}
	return parsedPath;
}

function loopThrough(dir) {
	var dirs = fs.readdirSync(dir);
	dirs.forEach((file) => {
		var absolute = path.join(dir,file);
		var isDir = fs.statSync(absolute).isDirectory();
		
		dirMap[parsePath(absolute)] = {
			name: file,
			isDir: isDir,
			absolute: parsePath(absolute),
			loadURL: parsePath(absolute)
		};
		
		if (isDir) {
			loopThrough(absolute);
		}
	})
}

var dir = "./";
loopThrough(dir,dirMap);

fs.writeFileSync("dirmap.json",JSON.stringify(dirMap,null,"\t"));