async function loadBackgroundAssets() {
    window.files.bgAssets = {
        defaultBlueBG: [],
        templateGreen: [{
                position: [0, 0],
                size: [600, 360],
                multiplier: 0,
                image: await window.loadImage("res/backgrounds/template-green/solid.png")
            }, {
                position: [0, 0],
                size: [600, 360],
                multiplier: 0.17,
                image: await window.loadImage("res/backgrounds/template-green/back.png")
            }, {
                position: [0, 0],
                size: [600, 360],
                multiplier: 0.3,
                image: await window.loadImage("res/backgrounds/template-green/front.png")
            }
        ],
		greyGrid: [
			//Use a renderer to draw the cool looking grid.
			{
				position: [0, 0],
                size: [600, 360],
                multiplier: 0,
				renderer: window.GreyGridRendererClass //Gvbsonic's Level Editor will not support this, it will just be a blank sprite.
			}
		],
        templateRed: [{
                position: [0, 0],
                size: [600, 360],
                multiplier: 0,
                image: await window.loadImage("res/backgrounds/template-red/bgred.png")
            }, {
                position: [0, 0],
                size: [600 * 3, 360 * 3],
                multiplier: 0.0888,
                image: await window.loadImage("res/backgrounds/template-red/bgred.png")
            }, {
                position: [0, 0],
                size: [600, 360],
                multiplier: 0.17,
                image: await window.loadImage("res/backgrounds/template-red/red1.png")
            }, {
                position: [0, 80],
                size: [600, 360],
                multiplier: 0.3,
                image: await window.loadImage("res/backgrounds/template-red/red2.png")
            }
        ]
    };
}
async function createBGSprites(bgdata) {
    var sprs = [];
    if (bgdata) {
        for (var bg of bgdata) {
            var spr = new window.GRender.Sprite(0, 0, null, 600, 360);
			if (bg.renderer) {
				spr.bgRenderer = new bg.renderer(spr);
			} else {
				spr.image = bg.image;
			}
            spr.bgpos = bg.position;
            spr.width = bg.size[0];
            spr.height = bg.size[1];
            spr.bgmult = bg.multiplier;
            spr.isBGSprite = true;
            sprs.push(spr);
        }
    }
    return sprs;
}
