//Insert required scripts here.
//This will work both on static release
//and electron versions.

/*
NOTICE:
If there is an error loading one of the scripts. The loading will be
stopped, and might make your game NOT even load at all.

These are added by URLS, like in a browser.
 */
////////////////////////////////////////////////////////////////////

var scripts = [

    ////////////////////////////////////////////////////////////////////
    //Here are some libaries you need to load the game,
    //most of them are made by me:

    "src/gvbvdxx-renderer.js?n=1",
    "src/audio.js?n=1",

    ////////////////////////////////////////////////////////////////////
	
	//Used to change palletes, might make this less CPU intensive sometime.
	
	"src/effect-system/effects.js?n=1",
	
	////////////////////////////////////////////////////////////////////
	
    //If you need some bg renderering scripts, you can put them here.

    "src/bgs/grey-grid-renderer.js?n=1",

    ////////////////////////////////////////////////////////////////////

    //Utility scripts.

    //This is more like a utility script than any thing else.
    //Provides a async api, including properly resizing the game screen.

    "src/runtime.js?n=1",

    ////////////////////////////////////////////////////////////////////

    //UI and Menus.

    "src/fade-transition.js?n=1", //EDIT THIS!!! If your wanting to change the transition, well this is what your exactly looking for.

    "src/game-ui.js?n=1", //this is what the game calls on when its loaded up (and clicked on if your using a Static website version).

    "src/title.js?n=1", //EDIT THIS!!! This is the Title Screen. Change this!!! Do whatever you want with this, I do not care!

    "src/menu.js?n=1", //This is more loader like. this is used both for options and loading

	"src/level-handler.js", //Does most of the level managment (Running levels in order)
	
    "src/menus.js?n=1",  //The main menu and other menus are in this script.

    ////////////////////////////////////////////////////////////////////

    //Loaders.

    //These are scripts that load stuff into the game.
    //Its that simple.

    "src/tiles.js?n=1",

    //NOTE: you don't need to edit the code file to actually add tiles,
    //they are added in tiles.json, located in the resources folder (res).

    "src/level.js?n=1", //Loads the level data into sprites that the game can use.

    "src/levels.js?n=1", //This loads the "levels.json" file located in the resources (res) folder.

    "res/characters.js?n=1", //EDIT THIS!!! Add your own characters in this file.

    "src/backgrounds.js?n=1", //EDIT THIS!!! Add your own backgrounds in this file.

    "src/assets.js?n=1", //EDIT THIS!!! Add your own assets if nessasary, remove assets here also.

    ////////////////////////////////////////////////////////////////////

    //AI.

    //Tails's AI, to make him follow sonic and do stuff.

    "src/tails-npc.js?n=1",

    ////////////////////////////////////////////////////////////////////
	
	//Object scripting.

    //To code objects or "tiles", in the game.

    "src/tile-behavior.js?n=1", //manager for all the tiles.

    "src/objects/spikes.js?n=1", //for the spikes object.
	
	////////////////////////////////////////////////////////////////////

    //Character Select

    "src/character-select/charselect.js?n=1", //Character select code.

    ////////////////////////////////////////////////////////////////////

    //The engine and game.

    "src/index.js?n=1",

    ////////////////////////////////////////////////////////////////////

    //Characters.

    "res/characters/sonic.js?n=1", //Sonic 3 Sonic's sprite sheet data.
    "res/characters/sonic-anim.js?n=1", //Sonic 3 Sonic's animations.

    "res/characters/tailss3.js?n=1", //Tails's sprite sheet data.
    "res/characters/tailss3-anim.js?n=1", //Tails's animations.

    "res/characters/maniasonic.js?n=1", //Mania Sonic's sprite sheet data.
    "res/characters/maniasonicanim.js?n=1", //Mania Sonic's animation data.

    "res/characters/supersonic.js?n=1", //Super Sonic's sprite sheet data.
    "res/characters/supersonic-anim.js?n=1", //Super Sonic's animation data.
	
	////////////////////////////////////////////////////////////////////
	
	//Title Manager
	
	"src/title-manager.js?n=1", //EDIT THIS!!! This is used to change the title of the window. Change this to add an custom title!!!

    ////////////////////////////////////////////////////////////////////
	
	//Mod support!
	
	"src/mod-support-new.js?n=1"
	
	////////////////////////////////////////////////////////////////////
];

////////////////////////////////////////////////////////////////////

/*
This does a basic check to see if its running under Electron JS, and if
not, put the click to play screen. This is due to browsers not allowing audio
to play unless the page has been interacted with. Electron JS does not have that
issue so, therefore is no need of a click to play screen.

And there are more posiblities with Electron JS, since it allows you to do some crazy
and insane stuff with it.
 */

function checkForElectron() {
    try {
        if (window.require("@electron/remote")) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
}

////////////////////////////////////////////////////////////////////

window.isElectron = checkForElectron();

////////////////////////////////////////////////////////////////////

function loadScript(src) {
    return new Promise((a) => {
        var s = document.createElement("script");
        s.src = src;
        s.onload = a;
        document.body.appendChild(s);
    });
}

////////////////////////////////////////////////////////////////////

async function startGameScripts() {
    for (var script of scripts) {
        await loadScript(script);
    }

    //Start the asset loading.
    loadAssets();
}

////////////////////////////////////////////////////////////////////

var gvbsonicGame = document.getElementById("gvbsonicgame");

var clicktostart = document.getElementById("clicktostart");

if (isElectron) { //This is what happens when you start the game in Electron JS.
    window.remote = window.require("@electron/remote");
    window.currentWindow = window.remote.getCurrentWindow();
    startGameScripts();
    clicktostart.hidden = true;
    gvbsonicGame.hidden = false;
} else { //This is what happens if you load the game in a browser.
    clicktostart.hidden = false;
    document.body.style.cursor = "pointer";
    document.onclick = function () {
        document.body.style.cursor = "default";
        clicktostart.hidden = true;
        gvbsonicGame.hidden = false;
        document.onclick = null;
        setTimeout(() => {
            startGameScripts();
        }, 1);
    };
}

//Just used to load the image for the loading screen.
(async function () {
    document.getElementById("loadingtext").src = await window.getAssetURL("res/loadingscreen/loading.png");
})();
