//Some basic fade transitions, just to make transitions smoother to look at.
var transitioning = false;
var transitionIn = true;
window.transitionFadeIn = async function (cb) {
	transitioning = true;
	renderer.blackScreenAlpha = 0;
	renderer.blackScreen = true;
	transitionIn = true;
	var alpha = 0;
	while (transitioning) {
		if (transitioning && transitionIn) {
			alpha += 0.03;
			renderer.blackScreenAlpha = alpha;
		}
		if (alpha > 1) {
			transitioning = false;
			renderer.blackScreenAlpha = 1;
		}
		await window.tickAsync60FPS();
	}
	if (cb) {cb();}
};
window.transitionFadeOut = async function (cb) {
	transitioning = true;
	renderer.blackScreenAlpha = 1;
	renderer.blackScreen = true;
	transitionIn = false;
	var alpha = 1;
	while (transitioning) {
		if (transitioning && (!transitionIn)) {
			alpha -= 0.03;
			renderer.blackScreenAlpha = alpha;
		}
		if (alpha < 0) {
			transitioning = false;
			renderer.blackScreenAlpha = 0;
		}
		await window.tickAsync60FPS();
	}
	if (cb) {cb();}
};
window.transitionStopInstant = async function () {
	renderer.blackScreenAlpha = 1;
	renderer.blackScreen = false;
	transitioning = false;
};