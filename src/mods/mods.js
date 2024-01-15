window.GetRingCount = () => {
	if (window.sonic) {
		return window.sonic.rings;
	} else {
		return 0;
	}
};
window.SetRingCount = (r) => {
	if (window.sonic) {
		window.sonic.rings = r;
	}
};
window.GetPlayer = () => {
	if (window.sonic) {
		return window.sonic;
	} else {
		return null;
	}
};
window.modMessages = {}; //DO NOT USE IN YOUR GSE MOD FILE, USE AddModListener
window.AddModListener = (listenerName, funct) => { //use this function to add a mod listener.
	if (!window.modMessages[listenerName]) {
		window.modMessages[listenerName] = [];
	}
	window.modMessages[listenerName].push(funct);
};
window.FireModMessage = (listenerName,jsonValues) => {
	//DO NOT USE IN YOUR GSE MOD FILE, ONLY USE IN GAME SOURCE.
	if (window.modMessages[listenerName]) {
		window.modMessages[listenerName].forEach((funct) => {
			funct(name);
		})
	}
};
window.FireModMessageAsync = async (listenerName,jsonValues) => {
	//DO NOT USE IN YOUR GSE MOD FILE, ONLY USE IN GAME SOURCE.
	if (window.modMessages[listenerName]) {
		for (var funct of window.modMessages[listenerName]) {
			await funct(jsonValues);
		}
	}
};

window.modStuff = {
	levels:[]
};

try{
var fs = require("fs");
class GSEMod {
	constructor (file) {
		this.path = file;
		this.scripts = [];
		this.data = {
			name:"unknown mod",
			icon:null
		};
	}
	async getData () {
		if (this.zip.files["mod.json"]) {
			try{
				var json = JSON.parse(await this.zip.files["mod.json"].async("text"));
				for (var jsonthingy of Object.keys(json)) {
					this.data[jsonthingy] = json[jsonthingy];
				}
			}catch(e){
				process.stdout.write(`Mod Parsing JSON Error: ${e}`+"\n");
			}
		}
	}
	async load () {
		this.zip = await JSZip.loadAsync(fs.readFileSync(this.path,{encoding:"binary"}));
		try{
			process.stdout.write(`Loading gse mod from "${this.path}"`+"\n");
		}catch(e){}
		this.getData();
		for (var file of Object.keys(this.zip.files)) {
			var dirextract = file.split("/");
			if (dirextract[0].toLowerCase() == "scripts") {
				
				if (!this.zip.files[file].dir) {
					var t = this.zip.files[file];
					console.log("loading script \""+file+"\"");
					console.log(this.zip.files[file])
					this.scripts.push(await t.async("text"));
				}
			}
		}
		this.runScripts();
	}
	getLevelClass (obj) {
		class Level { 
			constructor (levelname) {
				this.levelname = levelname;
			}
			async addLevel (properties) {
				try{
					process.stdout.write(`"${this.properties}"`+"\n");
				}catch(e){}
				try{
					process.stdout.write(`"${this.levelname}"`+"\n");
				}catch(e){}
				var data = await obj.zip.files["levels/"+this.levelname+".json"].async("text");
				var realProps = {
					name:"Unknown Level",
					music:null
				};
				if (properties.name) {
					realProps.name = properties.name;
				}
				if (properties.music) {
					realProps.music = properties.music;
				}
				window.modStuff.levels.push({
					data:data,
					info:realProps
				});
			}
		}
		return Level;
	}
	getAudioClass (obj) {
		class Audio {
			constructor (filename) {
				this.filename = filename;
			}
			async load () {
				var data = await obj.zip.files["audio/"+this.filename].async("arraybuffer");
				this.audiodata = await decodeAsync(data);
			}
		}
		return Audio;
	}
	getModCodeRun(code) {
		return `
		var t = this;
		(async function () {
			console.log('script running');
			var Level = t.getLevelClass(t);
			var Audio = t.getAudioClass(t);
			
			t = null;
			`+code+`
		})();
		`;
	}
	async runScripts() {
		for (var s of this.scripts) {
			eval(this.getModCodeRun(s));
		}
	}
}
window.GSEMod = GSEMod;
}catch(e){
	console.warn("For some reason, the mod engine is failing to load!\nMaybe, its running in a static build.");
}