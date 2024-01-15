class ObjectSpikePrivateClass {
    constructor(spr,utils) {
        this.sprite = spr;
		
        spr.width = 40;
        spr.height = 32;
		
        this.triggered = false;
		this.triggeredForTails = false;
		
		this.moreUtils = utils;
    }
    tileUpdate(spr, util) {
        var gameUtil = util.gameUtil;
		
        var sonic = gameUtil.sonic;
		
        var collisionCheck = gameUtil.collisionCheck;
		
		var Sound = gameUtil.Sound;
		
		if (!sonic.inDebug) {
			if (collisionCheck(sonic, spr) && gameUtil.canGetHurt(sonic)) {
				if (!this.triggered) {
					this.triggered = true;
					
					var spikeSound = gameUtil.getSoundEffect("spike");
					
					var a = new Sound(spikeSound);
					
					a.setVolume(1);
					
					a.play();
					
					gameUtil.damageCharacter(sonic);
				}
			} else {
				this.triggered = false;
			}
		}
		
		if (gameUtil.tails) { //Make sure tails exists!
			
			//Make it fair for tails as well!
			
			var tails = gameUtil.tails;
			
			if (collisionCheck(tails, spr) && gameUtil.canGetHurt(tails)) {
				if (!this.triggeredForTails) {
					this.triggeredForTails = true;
					
					var spikeSound = gameUtil.getSoundEffect("spike");
					
					var a = new Sound(spikeSound);
					
					a.setVolume(1);
					
					a.play();
					
					gameUtil.damageCharacter(tails);
				}
			} else {
				this.triggeredForTails = false;
			}
			
		}
		spr.width = 40;
        spr.height = 32;
    }
}

tileBehavior.addTilePrivateClass("spikes", ObjectSpikePrivateClass);
