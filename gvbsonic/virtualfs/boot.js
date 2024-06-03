(function () {
    var allowLoadingFromURLS = true;

    function loadScript(src) {
        return new Promise((a) => {
            var s = document.createElement("script");
            s.src = src;
            s.onload = a;
            document.body.appendChild(s);
        });
    }

    var virtualFS = document.getElementById("virtualFS");
    var virtualFSProgress = document.getElementById("virtualFSProgress");

    async function injectScripts() {
        virtualFS.hidden = true;
        await loadScript("src/asset-manager.js?n=1");
        await loadScript("src/startup-check.js?n=1");
    }

    if (window.virtualFSUsed) {
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
        function progress(value, max) {
            virtualFSProgress.value = value;
            virtualFSProgress.max = max;
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
        async function loadNormal() {
            try {
                var json = await(await fetch("mods/dirmap.json")).json();
				virtualFS.hidden = false;
                await window.loadVirtualModules(json, progress, "/mods");
                injectScripts();
            } catch (e) {
                console.warn("Failed to load custom dirmap: ", e);
                injectScripts();
            }
        }
		var mimeTypes = {
			  "aac": "audio/aac",
			  "abw": "application/x-abiword",
			  "ai": "application/postscript",
			  "arc": "application/octet-stream",
			  "avi": "video/x-msvideo",
			  "azw": "application/vnd.amazon.ebook",
			  "bin": "application/octet-stream",
			  "bz": "application/x-bzip",
			  "bz2": "application/x-bzip2",
			  "csh": "application/x-csh",
			  "css": "text/css",
			  "csv": "text/csv",
			  "doc": "application/msword",
			  "dll": "application/octet-stream",
			  "eot": "application/vnd.ms-fontobject",
			  "epub": "application/epub+zip",
			  "gif": "image/gif",
			  "htm": "text/html",
			  "html": "text/html",
			  "ico": "image/x-icon",
			  "ics": "text/calendar",
			  "jar": "application/java-archive",
			  "jpeg": "image/jpeg",
			  "jpg": "image/jpeg",
			  "js": "application/javascript",
			  "json": "application/json",
			  "mid": "audio/midi",
			  "midi": "audio/midi",
			  "mp2": "audio/mpeg",
			  "mp3": "audio/mpeg",
			  "mp4": "video/mp4",
			  "mpa": "video/mpeg",
			  "mpe": "video/mpeg",
			  "mpeg": "video/mpeg",
			  "mpkg": "application/vnd.apple.installer+xml",
			  "odp": "application/vnd.oasis.opendocument.presentation",
			  "ods": "application/vnd.oasis.opendocument.spreadsheet",
			  "odt": "application/vnd.oasis.opendocument.text",
			  "oga": "audio/ogg",
			  "ogv": "video/ogg",
			  "ogx": "application/ogg",
			  "otf": "font/otf",
			  "png": "image/png",
			  "pdf": "application/pdf",
			  "ppt": "application/vnd.ms-powerpoint",
			  "rar": "application/x-rar-compressed",
			  "rtf": "application/rtf",
			  "sh": "application/x-sh",
			  "svg": "image/svg+xml",
			  "swf": "application/x-shockwave-flash",
			  "tar": "application/x-tar",
			  "tif": "image/tiff",
			  "tiff": "image/tiff",
			  "ts": "application/typescript",
			  "ttf": "font/ttf",
			  "txt": "text/plain",
			  "vsd": "application/vnd.visio",
			  "wav": "audio/x-wav",
			  "weba": "audio/webm",
			  "webm": "video/webm",
			  "webp": "image/webp",
			  "woff": "font/woff",
			  "woff2": "font/woff2",
			  "xhtml": "application/xhtml+xml",
			  "xls": "application/vnd.ms-excel",
			  "xlsx": "application/vnd.ms-excel",
			  "xlsx_OLD": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			  "xml": "application/xml",
			  "xul": "application/vnd.mozilla.xul+xml",
			  "zip": "application/zip",
			  "3gp": "video/3gpp",
			  "3gp_DOES_NOT_CONTAIN_VIDEO": "audio/3gpp",
			  "3gp2": "video/3gpp2",
			  "3gp2_DOES_NOT_CONTAIN_VIDEO": "audio/3gpp2",
			  "7z": "application/x-7z-compressed"
			};
        async function loadMod(url) {
            virtualFS.hidden = false;
            try {
                var request = await fetch(url);
                var arrayBuffer = await request.arrayBuffer();
                var zip = await JSZip.loadAsync(arrayBuffer);
            } catch (e) {
                console.error(e);
                window.alert("Failed to load mod from zip: " + e);
                return;
            }

            var dirMap = {};
			var array = Object.keys(zip.files);
			var amount = 0;
			var length = array.length;
			var dirs = {};
            for (var path of Object.keys(zip.files)) {
                var f = {};
				var easyProcessPath = makePathEasyToProcess(path);
                var file = zip.files[path];
                f.isDir = file.dir;
                f.name = easyProcessPath.split("/").pop();
                if (!file.dir) {
					var base64 = await file.async("base64");
					var type = mimeTypes[easyProcessPath.split(".").pop()];
					if (!type) {
						type = "text/plain";
					}
					var url = "data:"+type+";base64,"+base64;
					f.loadURL = url;
				}
				if (!dirs[easyProcessPath]) {
					dirs[easyProcessPath] = true;
					var easyProcessArray = parsePathArray(easyProcessPath); 
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
				dirMap[easyProcessPath] = f;
				amount += 1;
				progress(amount,length);
            }
			console.log(dirMap);
			await window.loadVirtualModules(dirMap, progress);
			injectScripts();
        }
        (async function () {
            if (allowLoadingFromURLS) {
                var urlParams = new URLSearchParams(window.location.search);
                var modURL = urlParams.get("mod");

                if (modURL) {
                    loadMod(modURL);
                } else {
                    loadNormal();
                }

            } else {
                loadNormal();
            }
        })();
    } else {
        virtualFS.hidden = true;
        injectScripts();
    }
})();
