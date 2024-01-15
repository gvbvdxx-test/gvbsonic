async function initCharData() {
	
	window.gvbsonicCharacterSelect = [
		{
			image: await window.loadImage("res/character-select/sonicandtails.png"),
			scale: 1,
			
			enableCPU:true,
			CPUCharacter:"s3tails",
			
			playerCharacter:"s3sonic"
		},
		"s3sonic",
		"s3tails",
		"maniaSonic"
	];
	
	window.gvbsonicCharacters = {
		//sonic 3 sonic
		"s3sonic": {
			name:"Sonic",
			fullname:"Sonic",
			scale:1,
			angle:45,
			smoothAngles:true,
			image: await window.loadImage("res/characters/sonic.png"),
			spritesheet:window.files.sonicspritesheet.sprites,
			animations:window.files.sonic3anims,
			signpostid:"sonic",
			hudicon: await window.loadImage("res/hud/icons/sonic.png"),
			abilites: [
				"spindash",
				"peelout",
				"roll"
			]
		},
		//sonic 3 tails (I think)
		"s3tails": {
			name:"Tails",
			fullname:"Tails",
			scale:1,
			angle:45,
			smoothAngles:true,
			image: await window.loadImage("res/characters/tailss3.png"),
			spritesheet:window.files.tailsS3Spritesheet.sprites,
			animations:window.files.tailsS3anims,
			signpostid:"tails",
			hudicon: await window.loadImage("res/hud/icons/tails.png"),
			abilites: [
				"spindash",
				"peelout",
				"roll",
				"flight"
			]
		},
		//mania sonic
		"maniaSonic": {
			name:"Sonic",
			fullname:"Mania Sonic",
			scale:1,
			angle:1,
			smoothAngles:true,
			spindashOffset: -19,
			image: await window.loadImage("res/characters/maniasonic.png"),
			spritesheet:window.files.maniaSonicSpritehseet.sprites,
			animations:window.files.maniaSonicAnimations,
			signpostid:"msonic",
			hudicon: await window.loadImage("res/hud/icons/msonic.png"),
			abilites: [
				"spindash",
				"peelout",
				"roll"
			]
		},
		//Super sonic
		"superSonic": {
			name:"Super sonic",
			fullname:"Super Sonic",
			scale:1,
			angle:45,
			smoothAngles:true,
			image:window.files.superSonic,
			spritesheet:window.files.superSonicSpriteSheet.sprites,
			animations:window.files.superSonicAnimations,
			signpostid:"sonic",
			hudicon: await window.loadImage("res/hud/icons/sonic.png"),
			abilites: [
				"spindash",
				"peelout",
				"roll"
			]
		}
	};
	
	window.gvbsonicNPCCharacter = "s3tails"; //Default NPC character selected, Sonic 3 Tails.
	window.gvbsonicSelectedChar = "s3sonic"; //Default character selected, Sonic 3 Sonic.
	window.gvbsonicUseTailsNPC = true; //Use the tails CPU?
	
	window.gvbsonicUseCharacterSelect = true; //Use the character select screen?
	
	window.gvbsonic.characters = window.gvbsonicCharacters;
	window.gvbsonic.characterSelect = window.gvbsonicCharacterSelect;
	
	window.gvbsonic.setUseCharacterSelect = function (id) {
		window.gvbsonicUseCharacterSelect = id;
	};
	window.gvbsonic.getUseCharacterSelect = function () {
		return window.gvbsonicUseCharacterSelect;
	};
	
	window.gvbsonic.setPlayerCharacter = function (id) {
		window.gvbsonicSelectedChar = id;
	};
	window.gvbsonic.getPlayerCharacter = function () {
		return window.gvbsonicSelectedChar;
	};
	
	window.gvbsonic.setCPUCharacter = function (id) {
		window.gvbsonicNPCCharacter = id;
	};
	window.gvbsonic.getCPUCharacter = function () {
		return window.gvbsonicNPCCharacter;
	};
	
	window.gvbsonic.setSpawnCPU = function (bool) {
		window.gvbsonicUseTailsNPC = bool;
	};
	window.gvbsonic.getSpawnCPU = function () {
		return window.gvbsonicUseTailsNPC;
	};
	
	window.gvbsonic.cleanCharacterList = function (id) {
		window.gvbsonicCharacterSelect = [];
	};
	
	window.gvbsonic.addCharacterToList = function (id) {
		window.gvbsonicCharacterSelect.push(id);
	};
	
	window.gvbsonic.removeCharacterFromList = function (id) {
		var newlist = [];
		for (var item of window.gvbsonicCharacterSelect) {
			if (id !== item) {
				newlist.push(item);
			}
		}
		window.gvbsonicCharacterSelect = item;
	};
	
	window.gvbsonic.addCharacter = function (id,info) {
		window.gvbsonicCharacters[id] = info;
	};
}