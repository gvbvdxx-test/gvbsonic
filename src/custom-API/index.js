//basicly a whole libary of custom api support

window.gvbsonic = {
	
	playerExists: function () {
		if (window.sonic) {
			return true;
		} else {
			return false;
		}
	},
	getPlayer: function () {
		return window.sonic;
	},
	
	events:{
		keydown:[],
		keyup:[],
		playerspawns:[],
		playerdies:[],
		screenupdate:[]
	},
	
	setPlayerCharacter: function (charID) {
		window.gvbsonicSelectedChar = charID;
	},
	
	getPlayerCharacter: function () {
		return window.gvbsonicSelectedChar;
	},
	
	getAllSpritesOnScreen: function () {
		return window.sprites;	
	},
	
	addEventListener: function (ev,func) {
		this.events[ev.toLowerCase()].push(func);
	},
	
	fireEvent: function (ev,vals) {
		this.events[ev.toLowerCase()].forEach((func) => {
			func(vals);
		});
	},
	
	changePlayerVelocity: function (x,y) {
		if (this.playerExists()) {
			var playerspr = this.getPlayer();
			playerspr.speed += x;
			playerspr.gravity += y;
		}
	},
	
	setPlayerVelocity: function (x,y) {
		if (this.playerExists()) {
			var playerspr = this.getPlayer();
			playerspr.speed = x;
			playerspr.gravity = y;
		}
	}
};

async function INITScripts () {
	var scripts = JSON.parse(await (await fetch("res/scripts.json")).text());
	for (var script of scripts) {
		var content = await (await fetch(script)).text();
		eval("(function () {"+"\n"+content+"\n"+"})();");
	}
}