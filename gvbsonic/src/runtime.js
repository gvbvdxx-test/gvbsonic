/*
  Im using my custom libary for rendering.
  This is because I used it for many other games and programs (not including ggm1 and ggm2).
  Check out my github for some of these games: https://github.com/jasonglenevans
  It supports HD rendering and smooth rendering.
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
window.tickfastAsync = function () {
  return new Promise((a) => {
    setTimeout(a, 1);
  });
};
window.tickAsync60FPS = function () {
  return new Promise((a) => {
    setTimeout(a, 1000 / 60);
  });
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
  //scale = 1;
  if (!(otherscale == scale) || !(window.HDRendering == lasthd)) {
    lasthd = window.HDRendering;
    cvs.style.imageRendering = "pixelated";
    cvs.style.width = scale * 600 + "px";
    cvs.style.height = scale * 360 + "px";
    cvs.style.marginLeft = (scale * 600) / -2 + "px";

    if (window.HDRendering) {
      renderer.scaleX = scale;
      renderer.scaleY = scale;
      cvs.width = scale * 600;
      cvs.height = scale * 360;
    } else {
      renderer.scaleX = 1;
      renderer.scaleY = 1;
      cvs.width = 1 * 600;
      cvs.height = 1 * 360;
    }
    otherscale = scale;
  }
  //document.body.onclick = function () {document.body.children[0].requestFullscreen();};
}, 10);
