window.titleScreen = async function () {
  var titleMusic = new window.AudioApiReplacement(window.files.jingles.title);
  titleMusic.setVolume(1);
  titleMusic.play();
  var logo = new window.GRender.Sprite(0,0,window.files.logo,window.files.logo.width,window.files.logo.height);
  var titlebg = new window.GRender.Sprite(0,0,window.files.titlebg,window.files.titlebg.width,window.files.titlebg.height);
  var titlebg2 = new window.GRender.Sprite(0,0,window.files.titlebg,window.files.titlebg.width,window.files.titlebg.height);
  var starttext = new window.GRender.TextSprite(0, 150, null, 32, 40);
  window.sprites = [];
  window.sprites.push(titlebg); //add the bg to the screen
  window.sprites.push(titlebg2);
  window.sprites.push(logo); //add the logo to the screen
  window.sprites.push(starttext); //add the text to the screen
  
  var titleshowing = true;
  var f = 0;
  titleMusic.onended = function () {
    titleshowing = false;
  };
  starttext.center = true;
  starttext.color = "white";
  starttext.bold = true;
  starttext.font = "pixel";
  starttext.text = "Press <Enter> To Start";
  document.onkeydown = function (event) {
    if (event.key == "Enter") {
      titleMusic.pause();
      titleMusic.onended = function(){};
      titleshowing = false;
    }
  };
  while (titleshowing) {
    await window.tickAsync(); //gives it a break every frame, so it won't crash.
    f += 1;
    logo.y = Math.cos(f/60)*10;
    logo.y = 0;
    
    //titlebg.x = Math.sin(f/1000)*300;
    titlebg.x -= 1;
    if (titlebg.x < -510) {
      titlebg.x = 0;
    }
    titlebg2.x = titlebg.x+1020;
  }
  document.onkeydown = null;
  window.sprites = [];
  titleMusic.pause();
  setInterval(() => {
    titleMusic.onended = function () {};
    titleMusic.pause();
  },1);
  await window.waitAsync(0.3);
};
