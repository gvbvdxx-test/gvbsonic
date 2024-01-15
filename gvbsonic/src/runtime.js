/*
  Im using my custom libary for rendering.
  This is because I used it for many other games and programs (not including ggm1 and ggm2).
  Check out my github for some of these games: https://github.com/gvbvdxx
  It supports HD rendering and anti-anilasting.
*/
window.getDistance = function (x1, y1, x2, y2){
    var y = x2 - x1;
    var x = y2 - y1;
    
    return Math.sqrt(x * x + y * y);
};
var renderer = new window.GRender.Render(
  document.getElementById("canvas"),
  true
);
window.renderer = renderer;
var animationframe = [];
window.HDRendering = false;
// initialize the timer variables and start the animation
window.tickAsync = function () {
  return new Promise((a) => {
    setTimeout(a, 1);
    //setTimeout(a,1000 / 60);
  });
};
window.tickAsync60FPSTimer = async function () {
    return new Promise((accept) => {
		var fps,
		fpsInterval,
		startTime,
		now,
		then,
		elapsed;
		var timeoutAnimate = null;
		function startAnimating(fps) {
			fpsInterval = 1000 / fps;
			then = Date.now();
			startTime = then;
			animate();
		}
		var animate = function () {
			timeoutAnimate = setTimeout(animate, 1);
			now = Date.now();
			elapsed = now - then;
			if (elapsed > fpsInterval) {
				then = now - (elapsed % fpsInterval);
				clearTimeout(timeoutAnimate);
				accept();
				animate = function(){};
			}
		}
		startAnimating(60);
	});
}
window.tickfastAsync = function () {
  return new Promise((a) => {
    setTimeout(a, 1);
  });
};
window.tickAsync60FPS = function () {
  return window.tickAsync60FPSTimer();
};
window.waitAsync = function (secs) {
  return new Promise((a) => {
    setTimeout(a, secs * 1000);
  });
};
var otherscale = null;
var cvs = renderer.canvas;
var lasthd = window.HDRendering;
setInterval(() => {
  var scale = window.innerHeight / 360;
  if (scale > (window.innerWidth / 600)) {
	  scale = window.innerWidth / 600;
  }
  //scale = 1;
  if (!(otherscale == scale) || !(window.HDRendering == lasthd)) {
    lasthd = window.HDRendering;
    cvs.style.imageRendering = "pixelated";
    cvs.style.width = scale * renderer.gameScreenWidth + "px";
    cvs.style.height = scale * renderer.gameScreenHeight + "px";
    cvs.style.marginLeft = (scale * renderer.gameScreenWidth) / -2 + "px";
	cvs.style.marginTop = (scale * renderer.gameScreenHeight) / -2 + "px";

    if (window.HDRendering) {
      renderer.scaleX = scale;
      renderer.scaleY = scale;
      cvs.width = scale * renderer.gameScreenWidth;
      cvs.height = scale * renderer.gameScreenHeight;
    } else {
      renderer.scaleX = 1;
      renderer.scaleY = 1;
      cvs.width = 1 * renderer.gameScreenWidth;
      cvs.height = 1 * renderer.gameScreenHeight;
    }
	if (window.redrawFrame) {
		window.redrawFrame();
	}
    otherscale = scale;
  }
  //document.body.onclick = function () {document.body.children[0].requestFullscreen();};
}, 1000/60);
