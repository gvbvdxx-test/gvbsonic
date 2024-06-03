//Virtual FS module for gvbsonic.
//This is used to emulate what it's like when playing the game with mods.
//This solution to running mods online is not perfect, but it works for now.
//NOTE: C:/ and other stuff may not work on the file system, best works when using ./ and ../ instead.
//Use dirmap.js to create a dirmap JSON for this.
//"Just" enough to get mod support working, this only supports mods that don't use "require".
//ANOTHER NOTE: Only supports sync actions, path can only support join function (with "./" and "../" included).
try {
    (function () {
        if (!window.require) {
            //This was used from https://friday-night-gvbvdxxin-engine.glitch.me/ since it works the best here.
            //Strips down the path to make doing things easier.
            function makePathEasyToProcess(path) {
                var a = path.replaceAll("\\", "/").toLowerCase();
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

            var dirMapLocalStorage = {};
            var dirMap = {};
            var fileMap = {};

            function parsePathArray(path) {
                var text = makePathEasyToProcess(path);
                var array = text.split("/");
                var fixedArray = []; //Cuts out empty "parts" of the array.
                for (var part of array) {
                    if (part.length > 0) {
                        fixedArray.push(part);
                    }
                }
                return fixedArray;
            }

            function parsePath(p) {
                return parsePathArray(p).join("/");
            }

            function joinArray(...paths) {
                var outArray = [];
                for (var path of paths) {
                    var array = parsePathArray(path);

                    for (var part of array) {
                        outArray.push(part);
                        if (part == "..") {
                            //Doing this twice because it pushed it to the end.
                            outArray.pop();
                            outArray.pop();
                        }
                        if (part == ".") {
                            outArray.pop();
                        }

                    }
                }
                return parsePath(outArray.join("/"));
            }
            function getFile(path) {
				var out = null;
				function checkFile (file) {
					if (parsePath(name) == parsePath(path)) {
						if (!out) {
							out = file
						}
                    }
				}
				//Read dir map from local storage first, then read the mods dirmap.
				for (var name of Object.keys(dirMapLocalStorage)) {
                    var file = dirMapLocalStorage[name];
					checkFile(file);
                }
                for (var name of Object.keys(dirMap)) {
                    var file = dirMap[name];
					checkFile(file);
                }
                return out;
            }

            function doesExist(path) {
				if (parsePath(path) == "") {
					return true; //Root directory always exists.
				}					
                if (getFile(path)) {
                    return true;
                } else {
                    return false;
                }
            }

            function dirList(path) {
                var list = [];
                var pathArray = parsePathArray(path);
				function scanFile(file) {
                    var array = parsePathArray(name);
                    var i = 0;
                    var equals = 0;
                    while (i < pathArray.length) {
                        if (pathArray[i] == array[i]) {
                            equals += 1;
                        }
                        i += 1;
                    }
                    if (equals == pathArray.length) {
                        if (pathArray[i] !== array[i]) {
                            if (list.indexOf(array[i]) < 0) {
								list.push(array[i]);
							}
                        }
                    }
				}
                for (var name of Object.keys(dirMap)) {
                    var file = dirMap[name];
                    scanFile(file);
                }
                for (var name of Object.keys(dirMapLocalStorage)) {
                    var file = dirMapLocalStorage[name];
                    scanFile(file);
                }
				return list;
            }

            function textToArray(text) {
                var array = [];
                for (var char of text) {
                    if (typeof char == "string") {
                        array.push(char.charCodeAt());
                    } else {
                        array.push(char);
                    }
                }
                return array;
            }

            function arrayToText(array) {
                var text = [];
                for (var code of array) {
                    text += String.fromCharCode(code);
                }
                return text;
            }
			
			function getDirname (p) {
				var path = parsePath(p);
				return path.split("/").slice(0,-1).join("/");;
			}
			
			function createDirMapDirectories(easyProcessPath,dirs) {
				var easyProcessArray = parsePathArray(parsePath(easyProcessPath)); 
				var dir = [];
				for (var item of easyProcessArray) {
					dir.push(item);
					dirs[dir.join("/")] = true;
					dirMap[dir.join("/")] = {
						name: item,
						isDir: true
					};
				}
			}

            window.Buffer = {
                from: function (a) {
                    return textToArray(a);
                },
                concat: function (a, b) {
                    return textToArray(a).concat(textToArray(b));
                }
            };

            class VirtualFS {
                constructor() {
                    this.existsSync = doesExist;
                }
				
				mkdirSync (path) {
					var dirs = {};
					createDirMapDirectories(getDirname(path),dirs);
				}

                statSync(path) {
                    var file = getFile(path);
                    if (file) {
                        return {
                            isDirectory: function () {
                                return file.isDir;
                            },
                            isFile: function () {
                                return !file.isDir;
                            }
                        }
                    } else {
                        throw new Error(`File ${path} does not exist!`);
                    }
                }

                readdirSync(dir) {
					if (!this.existsSync(dir)) {
						throw new Error(`Directory ${dir} does not exist!`);
					}
                    return dirList(dir);
                }

                readFileSync(path, options) {
					if (!this.existsSync(path)) {
						throw new Error(`File ${path} does not exist!`);
					}
                    var file = getFile(path);
                    if (options) {
                        if (options.encoding.toLowerCase() == "base64") {
                            return file.base64;
                        }
                        if (options.encoding.toLowerCase() == "utf-8") {
                            return atob(file.base64);
                        }
                    }
                    return textToArray(atob(file.base64));
                }

                writeFileSync(path, data) {
					var textdata = data;
                    if (typeof data == "object") {
                        textdata = arrayToText(data);
                    }
                    var pathFixed = joinArray(path);
                    var f = {
                        "name": pathFixed.split("/").pop(),
                        "isDir": false,
                        "absolute": pathFixed,
                        "base64": btoa(textdata)
                    };
                    dirMap[pathFixed] = f;
                    dirMapLocalStorage[pathFixed] = f;

                    localStorage.setItem("virtualfs", btoa(JSON.stringify(dirMapLocalStorage)));
                }
            }

            class VirtualPath {
                constructor() {
                    this.join = joinArray;
                }
            }

            class FakeWindow {
                constructor() {}
                setFullScreen(f) {
                    if (document.webkitIsFullScreen !== f) {
                        if (f) {
                            document.body.requestFullscreen();
                        } else {
                            document.exitFullscreen();
                        }
                    }
                }
                getFullScreen() {
                    return document.webkitIsFullScreen;
                }
            }

            function blobToURL(b) {
                return new Promise(async(a) => {
                    var reader = new FileReader();
                    reader.onload = function () {
                        a(this.result.split(",").pop())
                    }; // <--- `this.result` contains a base64 data URI
                    reader.readAsDataURL(b);
                })
            }
            function blobToText(b) {
                return new Promise(async(a) => {
                    var reader = new FileReader();
                    reader.onload = function () {
                        a(this.result.split(",").pop())
                    }; // <--- `this.result` contains a base64 data URI
                    reader.readAsText(b);
                })
            }

            //So mods can tell that if they are being "emulated" under the standard web browser and not ElectronJS.
            window.virtualFSUsed = true;
            window.require = function (m) {
                if (m == "path") {
                    return new VirtualPath();
                }
                if (m == "fs") {
                    return new VirtualFS();
                }
                if (m == "os") {
                    return {
                        homedir: function () {
                            return "/user/";
                        }
                    };
                }
                if (m == "@electron/remote") {
                    return {
                        app: {
							isEmulatingApp: true,
                            getVersion: function () {
                                return "0.0.0";
                            }
                        },
                        getCurrentWindow: function () {
                            return new FakeWindow();
                        }
                    };
                }
                throw Error(`"${m}" is not a proper module or virtual FS does not support this module.`);
            };
			
			function cleanUpDirs () {
				var dirs = {};
				for (var fileName of Object.keys(dirMap)) {
					var file = dirMap[fileName];
					if (!file.isDir) {
						createDirMapDirectories(getDirname(fileName),dirs);
					}
				}
			}
			
            //This is going to be used to load data.
            window.loadVirtualModules = async function (json,onasset,joindir) {
				var call = function () {};
				if (onasset) {
					call = onasset;
				}
				var amountToLoad = 0;
				for (var fileName of Object.keys(json)) {
                    var file = json[fileName];
                    if (!file.isDir) {
                        amountToLoad += 1;
                    }
                }
				call(0,amountToLoad);
				var loaded = 0;
                for (var fileName of Object.keys(json)) {
                    var file = json[fileName];
					var loadurl = file.loadURL;
					if (joindir) {
						if (loadurl) {
							loadurl = joinArray(joindir,file.loadURL);
						}
						dirMap[joinArray(joindir,fileName)] = file;
					} else {
						dirMap[joinArray(fileName)] = file;
					}
                    if (!file.isDir) {
                        var a = await fetch(loadurl);
                        var b = await a.blob();
                        var c = await blobToURL(b);

                        var base64 = c.split(",").pop();
                        file.base64 = base64;
						loaded += 1;
						call(loaded,amountToLoad);
                    }
                }
				cleanUpDirs();
				createDirMapDirectories("/user/",{});
            };
			window.createVirtualMapDirectories = function () {
				cleanUpDirs();
			};
            //Load data from localStorage.
            var lsdata = localStorage.getItem("virtualfs");
            if (lsdata) {
                dirMapLocalStorage = JSON.parse(atob(lsdata));
            }
        }
    })();
} catch (e) {
    console.warn("Failed to load virtual FS: ", e);
};
