//Here is where you can add your own coding to objects!
//More code can be found in index.js,
//for more variable access to the games variables,
//you can add to index.js code.

//this stuff is for the api:

window.tileBehavior = {
    addTileBehaviorClass: function (type, cl) {
        this.classes[type] = new cl(type);
    },
    addTilePrivateClass: function (type, cl) {
        this.privateClasses[type] = cl;
    },
    privateClasses: {},
    classes: {}
};
window.doTileBehaviorTick = function (tileSprite, gameUtil) {
    if (tileBehavior.classes[tileSprite.stype]) {
        var cl = tileBehavior.classes[tileSprite.stype];
        if (cl.tileUpdate) {
            cl.tileUpdate(tileSprite, {
                gameUtil: gameUtil
            });
        }
    }
    if (tileSprite.tilePrivateClass) {
        var pCl = tileSprite.tilePrivateClass;
        if (pCl.tileUpdate) {
            pCl.tileUpdate(tileSprite, {
                gameUtil: gameUtil
            });
        }
    }
};
window.doTileBehaviorSpawn = function (tileSprite) {
    if (tileBehavior.classes[tileSprite.stype]) {
        var cl = tileBehavior.classes[tileSprite.stype];
        if (cl.tileSpawn) {
            cl.tileSpawn(tileSprite, {
                appendPrivateClass: function (pcl) {
                    tileSprite.tilePrivateClass = new pcl(tileSprite);
                }
            });
        }
    }
    if (tileBehavior.privateClasses[tileSprite.stype]) {
        var pCl = tileBehavior.privateClasses[tileSprite.stype];
        tileSprite.tilePrivateClass = new pCl(tileSprite,window.tileAPI);
    }
};

window.tileAPI = {
	moveSteps:window.moveSteps,
	moveStepsSpeed:window.moveStepsSpeed,
	moveStepsInDirection:window.moveStepsInDirection,
	markSpritePos:window.markSpritePos
};