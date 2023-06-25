//for the multiplayer api
window.MultiAPI = {};
//handles when a sound is played, but also calls it with an string for the sound id
window.MultiAPI.onMainGameSound = function(){};
	
	
	
  window.filesloaded = 0;
  var fps, fpsInterval, startTime, now, then, elapsed;
  window.files = {};
  var sprites = [];
  var bgsprite = null;
  var sonic = null;
  var level = null;
  var uiSprites = [];
  var tileSprites = [];
  async function tickEngine() {
    while (true) {
      await window.tickfastAsync();
      window.renderer.drawSprites(sprites.concat(uiSprites));
    }
  }
  function ScratchMod(a, b) {
    const n = a;
    const modulus = b;
    let result = n % modulus;
    // Scratch mod uses floored division instead of truncated division.
    if (result / modulus < 0) result += modulus;
    return result;
  }
  function fixDirAngle(a) {
    return ScratchMod(a + 90, 360) - 90;
  }
  function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
  }
  function moveSteps(steps, spr) {
    const radians = degrees_to_radians(90 - fixDirAngle(spr.direction));
    const dx = steps * Math.cos(radians);
    const dy = steps * Math.sin(radians);
    spr.x += dx;
    spr.y -= dy;
  }
  function moveStepsSpeed(steps, direction) {
    const radians = degrees_to_radians(90 - fixDirAngle(direction));
    const dx = steps * Math.cos(radians);
    const dy = steps * Math.sin(radians);
    return [dx, dy];
  }
  var collisioncvs = document.createElement("canvas");
  var cctx = collisioncvs.getContext("2d");
  collisioncvs.width = 600;
  collisioncvs.height = 360;
  //document.body.append(collisioncvs);
  collisioncvs.style.background = "grey";

  //THIS COLLISION SCRIPT IS BY tfry-git
  function CollisionMask(data) {
    this.w = data.width;
    this.h = data.height;
    this.mask = [];
    for (var y = 0; y < this.h; ++y) {
      this.mask[y] = new Uint32Array(Math.ceil(this.w / 32));
      for (var x = 0; x < this.w; x += 32) {
        var bits = 0;
        for (var bit = 0; bit < 32; ++bit) {
          bits = bits << 1;
          if (x + bit < this.w) {
            if (data.data[(y * data.width + x + bit) * 4 + 3] > 5) {
              bits += 1;
            }
          }
        }
        this.mask[y][Math.floor(x / 32)] = bits;
      }
    }
  }

  /** Test if this CollisionMask-objects collides with the given other collision mask object. dx and dy specify the
screen coordinates of the other object, relative to this one. Note that this function performs rectangle intersection
check before going into the more expensive pixel-based collision detection, so there is no need to do this, yourself. */
  CollisionMask.prototype.collidesWith = function (other, dx, dy) {
    // make sure, this object is the left one of the two
    if (dx < 0) {
      // console.log("swapping");
      return other.collidesWith(this, -dx, -dy);
    }

    // determine collision rectangle (if any) in terms of coordinates of this
    if (dx > this.w) return false;
    var y1, y2;
    if (dy < 0) {
      // other is above
      if (other.h < -dy) return false;
      y1 = 0;
      y2 = Math.min(other.h + dy, this.h);
    } else {
      // other is below
      if (this.h < dy) return false;
      y1 = dy;
      y2 = Math.min(other.h + dy, this.h);
    }

    var x1 = dx;
    var x2 = Math.min(this.w, other.w + dx);
    //console.log("recthit " + x1 + "," + y1 + " - " + x2 + "," + y2);

    const lshift = dx % 32;
    const rshift = 32 - lshift;
    const x1scaled = Math.floor(x1 / 32);
    const x2scaled = Math.ceil(x2 / 32);
    for (var y = y1; y < y2; ++y) {
      const trow = this.mask[y];
      const orow = other.mask[y - dy];
      for (var x = x1scaled; x < x2scaled; ++x) {
        var bits = trow[x] << lshift;
        bits |= trow[x + 1] >>> rshift; // Note: zero-fill rshift

        // since other is known to be to the right of this, its mask is always left-aligned.
        if (orow[x - x1scaled] & bits) {
          //console.log("collision at line " + y + "!");
          return true;
        }
      }
    }
  };
  //end collison script.
  window.getSpriteByName = function getSpriteByName(sprites, name) {
    for (var spr of sprites) {
      if (spr.name.toLowerCase() == name.toLowerCase()) {
        return spr;
      }
    }
    return null;
  }
  var previousInfo = {};
  function getCollisionPixel(sx, sy, spr2) {
    //i don't use this method anymore, its SO SLOW!!
    try {
      var ax = window.renderer.xToLeft(spr2.x, spr2.width);
      var ay = window.renderer.yToTop(spr2.y, spr2.height);
      var x = window.renderer.xToLeft(sx, 2);
      var y = window.renderer.yToTop(sy, 2);
      var touching = false;
      //window.alert(ax);
      if (
        !(
          previousInfo.width == spr2.width &&
          previousInfo.height == spr2.height &&
          previousInfo.x == spr2.ax &&
          previousInfo.y == spr2.ay &&
          previousInfo.image == spr2.image
        )
      ) {
        cctx.clearRect(0, 0, 600, 360);
        cctx.drawImage(spr2.image, ax, ay, spr2.width, spr2.height);
        previousInfo.width = spr2.width;
        previousInfo.height = spr2.height;
        previousInfo.x = ax;
        previousInfo.y = ay;
        previousInfo.image = spr2.image;
      } else {
        //window.alert("test");
      }
      previousInfo.x = ax;
      previousInfo.y = ay;
      previousInfo.image = spr2.image;
      previousInfo.width = spr2.width;
      previousInfo.height = spr2.height;
      var data = cctx.getImageData(Math.round(x), Math.round(y), 2, 2).data;
      //window.alert(data);
      var i = 0;
      while (i < data.length) {
        i += 3;
        if (data[i - 1] > 200) {
          touching = true;
        }
      }
      return touching;
    } catch (e) {
      window.alert(e);
    }
  }
  //this calculates the angle from the pixel perfect collision detection.
  //this script runs simular to my scratch engines.
  function getAngleFromCollision(spr, spr2, checkcollide) {
    if (true) {
      try {
        var angle = 90;
        var x = 0;
        var y = 0;
        var x2 = 0;
        var y2 = 0;
        spr.direction -= 90;
        moveSteps(0, spr);
        spr.direction += 90;
        var possave = { x: spr.x, y: spr.y, dir: spr.direction };

        var check = 0;
        //if (spr.speed > 0){
        spr.x = possave.x;
        spr.y = possave.y;
        moveSteps(10, spr);
        while (check < 900 && checkcollide(spr.x, spr.y, spr2)) {
          spr.x = possave.x;
          spr.y = possave.y;
          moveSteps(10, spr);
          spr.direction -= 10;

          check += 1;
        }
        //} else {
        check = 0;
        spr.x = possave.x;
        spr.y = possave.y;
        moveSteps(-10, spr);
        while (check < 900 && checkcollide(spr.x, spr.y, spr2)) {
          spr.x = possave.x;
          spr.y = possave.y;
          moveSteps(-10, spr);
          spr.direction += 10;

          check += 1;
        }
        //}
        spr.x = possave.x;
        spr.y = possave.y;

        function getSlopeAngle(s1, s2) {
          return (Math.atan((s2[1] - s1[1]) / (s2[0] - s1[0])) * 180) / Math.PI;
        }
        //var angle = getSlopeAngle([x,y],[x2,y2]);
        //window.alert(angle);
        angle = spr.direction;
        spr.direction = possave.dir;
        spr.direction -= 90;
        moveSteps(0, spr);
        spr.direction += 90;
        //angle += 5;
        //angle = Math.round(ScratchMod(angle, 360) / 22.5) * 22.5;
        var ang = Math.round(ScratchMod(angle, 361) / 22.5) * 22.5;

        if (ang == 90) {
          angle = 90;
        }
        if (ang == -90) {
          angle = -90;
        }
        if (ang == 0) {
          angle = 0;
        }
        if (ang == -180) {
          angle = -180;
        }
        if (ang == 180) {
          angle = 180;
        }
        if (ang == 360) {
          angle = 360;
        }
        if (ang == -360) {
          angle = 360;
        }
        if (ang == 270) {
          //angle = -90;
        }
        angle = Math.round(ScratchMod(angle, 361) / 10) * 10;
        if (angle > 360) {
          window.alert(angle);
        }
        return fixDirAngle(angle, 361); //due to the fact that when the number gets over 360degress its harder to calculate the direction.
      } catch (e) {
        window.alert("Check angle error! " + e);
      }
    } else {
      return 90;
    }
  }

  async function stickToFloor(spr, spr2, checkcollide) {
    try {
      if (spr.onfloor) {
        var check = 0;
        var checkamout = Math.abs(spr.speed) + 50;
        var felloff = false;
        while (!checkcollide(spr.x, spr.y, spr2)) {
          spr.direction -= 90;
          moveSteps(-1, spr);
          spr.direction += 90;
          check += 1;
          if (check > checkamout) {
            felloff = true;
            break;
          }
        }
        if (felloff) {
          spr.direction -= 90;
          moveSteps(checkamout, spr);
          spr.direction += 90;

          var ang = Math.round(fixDirAngle(spr.direction, 361) / 90) * 90;
          if (ang == 0 || ang == 180) {
            //if (true) {
            spr.gravity = Math.abs(
              // Math.abs(spr.speed)*0.65;
              moveStepsSpeed(Math.abs(spr.speed), spr.direction)[1] * 0.65
            );
            spr.speed =
              moveStepsSpeed(Math.abs(spr.speed), spr.direction)[0] * 0.65;
            //spr.speed = 0;
          }
          spr.onfloor = false;
        } else {
          spr.direction -= 90;
          moveSteps(0, spr);
          spr.direction += 90;
        }
      }
    } catch (e) {
      window.alert("Stick to floor error! " + e);
    }
  }
  async function runAnimation(spr, name, options) {
    var optionsdata = {
      fpsMultiplier: 1,
      resizeSpriteScale: 1,
    };
    if (options) {
      if (options.fpsMultiplier) {
        optionsdata = options.fpsMultiplier;
      }
      if (options.resizeSpriteScale) {
        optionsdata = options.resizeSpriteScale;
      }
    }
    if (!spr.animator) {
      spr.animator = {
        fpsMultiplier:1
      };
    }
    if (spr.animationData) {
      if (spr.animationData[name]) {
        spr.currentAnimation = name;
        var anim = spr.animationData[name];
       
        //console.log(name);
        while (true) {
          var animindex = 0;
          if (!(spr.currentAnimation == name)) {
              return;
            }
          while (Math.round(animindex) < anim.frames.length) {
            if (!(spr.currentAnimation == name)) {
              return;
            }
            var frame = anim.frames[Math.round(animindex)];
            //console.log(frame);
            if (frame) {
             
             
              if (spr.spritesheetData) {
                if (getSpriteByName(spr.spritesheetData, frame)) {
                  spr.imageLocation = getSpriteByName(
                    spr.spritesheetData,
                    frame
                  );
                  spr.width =
                    spr.imageLocation.width * optionsdata.resizeSpriteScale;
                  spr.height =
                    spr.imageLocation.height * optionsdata.resizeSpriteScale;
                } else {
                  console.warn(
                    `Sprite does not have spritesheet image "${frame}"`
                  );
                }
              } else {
                console.warn(`Sprite does not have any spritesheet data`);
              }
            }

            animindex += (optionsdata.fpsMultiplier* spr.animator.fpsMultiplier * anim.fps) / 60;
            await window.tickAsync60FPS();
          }
          //console.log("Animation ended");
          await window.tickAsync60FPS();
          if (!anim.loop) {
            return;
          }
        }
      } else {
        console.warn(
          `Attempted to run animation "${name}" but the animationData does not exist.`
        );
      }
    } else {
      console.warn(
        `Attempted to run animation "${name}" but the sprite does not have the animationData propertey.`
      );
    }
  }
  async function waitfor(f) {
    while (true) {
      await window.tickAsync();
      if (f()) {
        break;
      }
    }
  }
  async function doPeeloutAttack(spr, spr2, checkcollide, soundplay) {
    spr.freezemovement = false;
    while (spr.running) {
      await window.tickAsync();
      if (
        spr.up &&
        spr.jump &&
        Math.abs(spr.speed) < 1.5 &&
        Math.round(spr.direction / 45) * 45 == 90 &&
        spr.onfloor
      ) {
        spr.freezemovement = true;
        spr.peelout = true;
        soundplay("peelout");
        spr.peelpower = 0.5;
        while (spr.up) {
          await window.tickAsync();
          spr.peelpower += 0.5;
          if (spr.peelpower > 45) {
            spr.peelpower = 45;
          }
        }
        soundplay("peelout-release");
        spr.freezemovement = false;
        if (spr.flipX) {
          spr.speed = -spr.peelpower;
        } else {
          spr.speed = spr.peelpower;
        }

        getAngleFromCollision(spr, spr2, checkcollide);
        spr.peelout = false;
      }
    }
  }
  async function doSpindashAttack(spr, spr2, checkcollide, soundplay) {
    spr.freezemovement = false;
    while (spr.running) {
      await window.tickAsync();
      if (
        spr.down &&
        spr.jump &&
        Math.abs(spr.speed) < 1.5 &&
        Math.round(spr.direction / 45) * 45 == 90 &&
        spr.onfloor
      ) {
        spr.freezemovement = true;
        spr.spindash = true;

        spr.spindashpower = 0;
        while (spr.down) {
          await window.tickAsync();
          if (spr.jump) {
            soundplay("spindash", spr.spindashpower / 45 + 1);

            spr.spindashpower += 5;

            if (spr.spindashpower > 45) {
              spr.spindashpower = 45;
            }
            await waitfor(() => {
              return !spr.jump;
            });
          }
        }
        soundplay("spindash-release");
        spr.freezemovement = false;
        spr.rolling = true;
        if (spr.flipX) {
          spr.speed = -spr.spindashpower;
        } else {
          spr.speed = spr.spindashpower;
        }
        getAngleFromCollision(spr, spr2, checkcollide);
        spr.spindash = false;
      }
    }
  }
  async function lrcheck(spr, spr2, checkcollide, h) {
    var s = Math.abs(spr.speed) / 2.5;
    if (spr.onfloor) {
      //s = Math.abs(spr.speed*0.6);
    }
    var check = 0;
    var height = 48;
    var extend = 16; //+Math.abs(spr.speed);

    spr.direction -= 90;
    moveSteps(height + s, spr);
    spr.direction += 90;
    moveSteps(extend, spr);
    check = 0;
    moveSteps(2, spr);
    if (checkcollide(spr.x, spr.y, spr2)) {
      if (spr.right) {
        spr.pushing = true;
      }
    }
    moveSteps(-2, spr);
    if (checkcollide(spr.x, spr.y, spr2)) {
      if (spr.left || spr.right) {
        spr.pushing = true;
      }
      while (checkcollide(spr.x, spr.y, spr2)) {
        moveSteps(-1, spr);
        check += 1;
        if (check > 300) {
          break;
        }
      }
      spr.speed = 0;
    } else {
    }

    moveSteps(-extend, spr);

    moveSteps(-extend, spr);
    check = 0;
    moveSteps(-2, spr);
    if (checkcollide(spr.x, spr.y, spr2)) {
      if (spr.left) {
        spr.pushing = true;
      }
    }
    moveSteps(2, spr);
    if (checkcollide(spr.x, spr.y, spr2)) {
      if (spr.left || spr.right) {
        spr.pushing = true;
      }
      while (checkcollide(spr.x, spr.y, spr2)) {
        moveSteps(1, spr);
        check += 1;
        if (check > 300) {
          break;
        }
      }
      spr.speed = 0;
    } else {
    }

    moveSteps(extend, spr);
    spr.direction -= 90;
    moveSteps(-height - s, spr);
    spr.direction += 90;
  }
  async function doFloorDirectionCheck(spr, spr2, checkcollide) {
    if (!spr.onfloor) {
      spr.direction = 90;
    } else {
      spr.direction = getAngleFromCollision(spr, spr2, checkcollide);
      if (spr.peelout) {
        spr.savespeed = spr.peelpower;
      } else {
        spr.savespeed = spr.speed;
      }
      spr.jumping = false;
    }
  }
  async function doHurtScript(spr, spr2) {
    spr.htimeout = false;
    spr.hurtanim = false;
    spr.trs = 1;
    while (spr.running) {
      await window.tickAsync();
      if (!spr.htimeout && spr.hurt) {
        if (spr.rings > 0) {
          if (spr.onhurt) {
            spr.onhurt(spr.rings);
          }
          spr.rings = 0;
          spr.hurtanim = true;

          spr.gravity = 7;
          if (spr.flipX) {
            spr.speed = 7;
          } else {
            spr.speed = -7;
          }
          spr.onfloor = false;
          spr.htimeout = true;
          await window.waitAsync(0.05);
          while (!spr.onfloor) {
            await window.waitAsync(0.05);
          }
          spr.trs = 0.5;
          spr.hurtanim = false;
          //i did put the hurt to false thing here, but it makes it so if you fall and touch an enime, you die even if you get away
          await window.waitAsync(3.5);
          spr.htimeout = false;
          spr.hurt = false;
          spr.trs = 1;
        } else {
          spr.dead = true;
        }
      }
    }
  }
  async function movementEngine(
    spr,
    spr2,
    sprites,
    doscroll,
    scrollpos,
    checkcollide,
    soundplay
  ) {
    spr.rings = 0;
    spr.left = false;
    spr.right = false;
    spr.up = false;
    spr.down = false;
    spr.jump = false;
    spr.gravity = 0;
    spr.rolling = false;
    spr.onfloor = false;
    spr.speed = 0;
    spr.jumping = false;
    spr.engineAngle = 90;
    spr.animationIndex = 0;
    spr.smoothrot = 90;
    spr.savespeed = 0;
    spr.spindashing = false;
    spr.peelout = false;
    spr.freezemovement = false;
    spr2.x = scrollpos[0];
    spr2.y = scrollpos[1];
    spr.worldx = 0;
    spr.running = true;
    spr.worldy = 0;
    spr.rings = 0;
    spr.xVelocity = 0;
    spr.yVelocity = 0;
    spr.scrollLimit = true;
    spr.fps = 60;
    spr.dead = false;
    spr.canscroll = true;
    spr.hurt = false;
    spr.skidding = false;
    spr.onframeupdate = function () {};
    doSpindashAttack(spr, spr2, checkcollide, soundplay);
    doPeeloutAttack(spr, spr2, checkcollide, soundplay);
    doHurtScript(spr, spr2);
    spr.engineOffset = -21;
    spr.spring = false;
      spr.animator = {
        fpsMultiplier:1
      };
    spr.runtimei = setInterval(async () => {
      try {
        if (true) {
          if (!spr.dead) {
            if (spr.spindash) {
              spr.engineOffset = -13;
            } else {
              if (spr.rolling) {
                spr.engineOffset = -17;
              } else {
                spr.engineOffset = -21;
              }
            }
            var check = 0;
            spr._worldx = spr.x;
            spr._worldy = spr.y;
            spr.direction = spr.engineAngle;
            spr.direction -= 90;
            moveSteps(spr.engineOffset, spr);
            spr.direction += 90;
            spr.animator.fpsMultiplier = 1;
            //window.alert("test");
            if (
              !spr.freezemovement &&
              spr.onfloor &&
              spr.down &&
              Math.abs(spr.speed) > 1.5
            ) {
              if (!spr.rolling) {
                soundplay("roll");
              }
              spr.rolling = true;
            }
            if (Math.abs(spr.speed) < 1.5) {
              spr.rolling = false;
            }
            
            if (spr.hurtanim) {
              if (!(spr.currentAnimation == "hurt")) {
                          runAnimation(spr,"hurt");
                        }
            } else {
              if (spr.spring) {
                if (!(spr.currentAnimation == "spring")) {
                          runAnimation(spr,"spring");
                        }
              } else {
            if (spr.skidding) {
              if (!(spr.currentAnimation == "skid")) {
                          runAnimation(spr,"skid");
                        }
              
            }  else {
            if (spr.spindash) {
              if (!(spr.currentAnimation == "spindash")) {
                  runAnimation(spr,"spindash");
                }
                    var speed = (Math.abs(spr.spindashpower)*20);
                    spr.animator.fpsMultiplier = speed/60;
            } else {
              if (spr.jumping || spr.rolling) {
                if (!(spr.currentAnimation == "roll")) {
                  runAnimation(spr,"roll");
                }
              } else {
                if (Math.abs(spr.savespeed * 5) > 4) {
                  if (Math.abs(spr.savespeed * 5) > 50) {
                    if (!(spr.currentAnimation == "run")) {
                      runAnimation(spr,"run");
                    }
                  } else {
                    if (!(spr.currentAnimation == "walk")) {
                      runAnimation(spr,"walk");
                    }
                    var speed = (Math.abs(spr.savespeed)*20);
                    spr.animator.fpsMultiplier = speed/60;
                  }
                } else {
                  if (spr.pushing) {
                    if (!(spr.currentAnimation == "push")) {
                      runAnimation(spr,"push");
                    }
                  } else {
                    if (spr.up) {
                      if (!(spr.currentAnimation == "lookup")) {
                        runAnimation(spr,"lookup");
                      }
                    } else {
                      if (spr.down) {
                        if (!(spr.currentAnimation == "duck")) {
                          runAnimation(spr,"duck");
                        }
                      } else {
                        if (!(spr.currentAnimation == "stand")) {
                          runAnimation(spr,"stand");
                        }
                      }
                    }
                  }
                }
              }
            }
              }
            }
          }

            spr.pushing = false;
            
            if (spr.onfloor) {
              spr.spring = false;
            }
            if (spr.imageLocation) {
              spr.width = spr.imageLocation.width;
              spr.height = spr.imageLocation.height;
            }
            spr.skidding = false;
            if (spr.rolling) {
              if (spr.hurtanim) {
                if (spr.left && !spr.freezemovement) {
                  spr.speed -= 0.02;
                  spr.flipX = true;
                }
                if (spr.right && !spr.freezemovement) {
                  spr.speed += 0.02;
                  spr.flipX = false;
                }
              }
              spr.speed += spr.speed / -80;
              //spr.speed += (spr.direction - 90) / 200;
            } else {
              if (!spr.hurtanim) {
                if (spr.left && !spr.freezemovement) {
                  spr.speed -= 0.046875 * 2.0;
                  spr.flipX = true;
                  if (spr.onfloor) {
                    if (spr.speed > 0.5) {
                      spr.skidding = true;
                      spr.flipX = false;
                    }
                  }
                }

                if (spr.right && !spr.freezemovement) {
                  spr.speed += 0.046875 * 2.0;
                  spr.flipX = false;
                  if (spr.onfloor) {
                    if (spr.speed < -0.5) {
                      spr.skidding = true;
                      spr.flipX = true;
                    }
                  }
                }
              }
              if (!(spr.left || spr.right)) {
                spr.speed += spr.speed / -30;
              } else {
                if (Math.abs(spr.speed) > 13) {
                  spr.speed += spr.speed / -95;
                }
              }
            }
            if (
              !spr.hurtanim &&
              spr.onfloor &&
              spr.jump &&
              !spr.freezemovement
            ) {
              spr.direction -= 90;
              moveSteps(2, spr);
              spr.direction += 90;
              spr.gravity = moveStepsSpeed(8, spr.direction - 90)[1];
              spr.speed += moveStepsSpeed(8, spr.direction - 90)[0];
              spr.onfloor = false;
              spr.jumping = true;
              spr.rolling = false;
              soundplay("jump");
            }
            spr.speed += (spr.direction - 90) / 3000;
            if (spr.speed > 29) {
              spr.speed = 29;
            }
            if (spr.speed < -29) {
              spr.speed = -29;
            }
            //await stickToFloor(spr, spr2, checkcollide);
            moveSteps(Math.round(spr.speed), spr, checkcollide);
            //await stickToFloor(spr, spr2, checkcollide);
            //doFloorDirectionCheck(spr, spr2, checkcollide);
            lrcheck(spr, spr2, checkcollide, 50);
            spr.gravity += -0.3; //0.09375 was original

            spr.direction -= 90;
            moveSteps(Math.round(spr.gravity), spr);
            spr.direction += 90;
            await stickToFloor(spr, spr2, checkcollide);
            check = 0;
            if (checkcollide(spr.x, spr.y, spr2)) {
              while (checkcollide(spr.x, spr.y, spr2)) {
                /*if (spr.gravity < 0) {
                spr.direction -= 90;
                moveSteps(1, spr);
                spr.direction += 90;
              } else {*/
                spr.direction -= 90;
                moveSteps(1, spr);
                spr.direction += 90;
                /*}*/
                check += 1;
                if (check > 300) {
                  break;
                }
              }
              if (spr.gravity < 0) {
                if (!spr.onfloor) {
                  spr.onfloor = true;
                  await stickToFloor(spr, spr2, checkcollide);
                  doFloorDirectionCheck(spr, spr2, checkcollide);
                  var ang = Math.round(spr.direction / 45) * 45;
                  if (!(Math.round(ang / 30) * 30 == 90)) {
                    spr.speed += ((ang - 90) / 30) * Math.abs(spr.gravity);
                  }
                } else {
                  spr.onfloor = true;
                }
              }
              spr.gravity = 0;
              //spr.y = Math.round(spr.y);
            } else {
              spr.onfloor = false;
            }
            //lrcheck(spr,spr2,checkcollide);
            //await stickToFloor(spr, spr2, checkcollide);
            spr.direction -= 90;
            moveSteps(60, spr);
            spr.direction += 90;
            check = 0;
            if (checkcollide(spr.x, spr.y, spr2)) {
              while (checkcollide(spr.x, spr.y, spr2)) {
                spr.direction -= 90;
                moveSteps(-1, spr);
                spr.direction += 90;
                check += 1;
                if (check > 300) {
                  break;
                }
              }
              spr.gravity = 0;
              //spr.y = Math.round(spr.y);
            } else {
            }

            spr.direction -= 90;
            moveSteps(-60, spr);
            spr.direction += 90;
            doFloorDirectionCheck(spr, spr2, checkcollide);
            //await stickToFloor(spr, spr2, checkcollide);
            lrcheck(spr, spr2, checkcollide, 50);
            var s = Math.round(fixDirAngle(spr.direction, 361) / 90) * 90;
            var s2 = Math.round(fixDirAngle(spr.direction, 361) / 45) * 45;
            spr.direction -= 90;
            moveSteps(0, spr);
            spr.direction += 90;
            //await stickToFloor(spr, spr2, checkcollide);
            spr.direction -= 90;
            moveSteps(-spr.engineOffset, spr);
            spr.direction += 90;

            if (
              Math.abs(spr.speed) < 2 &&
              (s == 270 ||
                s == -90 ||
                s == 0 ||
                s == 180 ||
                s == -180 ||
                s == 360) &&
              spr.onfloor
            ) {
              spr.direction -= 90;
              moveSteps(2, spr);
              spr.direction += 90;
              spr.direction = 90;
              spr.onfloor = false;
              spr.speed = 0;
            }
            if (s2 == 135) {
              spr.speed += 0.1;
            }
            if (s2 == 45) {
              spr.speed -= 0.1;
            }
            if (s2 == 135) {
              spr.speed += 0.1;
            }
            if (s2 == 180) {
              spr.speed += 0.2;
            }
            if (s2 == 0) {
              spr.speed -= 0.2;
            }
            //if (spr.down) {window.alert(s2);}

            spr.engineAngle = fixDirAngle(spr.direction, 361);
            //smooth rotate.
            s = Math.round(fixDirAngle(spr.engineAngle, 361) / 90) * 90;
            var ang = spr.engineAngle;
            if (spr.onfloor) {
              //spr.smoothrot = ang;
              if (130 > ang && ang > 40) {
                if (spr.smoothrot < 100 && spr.smoothrot > 80) {
                  spr.smoothrot += (90 - spr.smoothrot) * 0.9;
                } else {
                  spr.smoothrot +=
                    (((90 - spr.smoothrot) * 0.3) /
                      Math.abs((90 - spr.smoothrot) * 0.3)) *
                    5;
                }
              } else {
                if (
                  (spr.smoothrot > 0 && ang > 0) ||
                  (0 > spr.smoothrot && 0 > ang)
                ) {
                  spr.smoothrot +=
                    (Math.round(ang / 20) * 20 - spr.smoothrot) * (0.65 / 2);
                } else {
                  spr.smoothrot = Math.round(ang);
                }
              }
            } else {
              if (true) {
                //spr.smoothrot += (spr.engineAngle - spr.smoothrot) / 15;
                if (spr.smoothrot < 100 && spr.smoothrot > 80) {
                  spr.smoothrot += (90 - spr.smoothrot) * 0.9;
                } else {
                  spr.smoothrot +=
                    (((90 - spr.smoothrot) * 0.3) /
                      Math.abs((90 - spr.smoothrot) * 0.3)) *
                    5;
                }
              }
            }
            if (spr.onfloor) {
              //spr.smoothrot = spr.engineAngle;
            }
            if (spr.spindash || spr.rolling || spr.jumping) {
              spr.smoothrot = 90;
            }
            if (spr.onfloor) {
              if (Math.abs(spr.speed) < 1) {
                spr.smoothrot = 90;
              }
            }

            //end smooth rotate.

            spr.direction =
              Math.round(fixDirAngle(Math.round(spr.smoothrot), 361) / 5) * 5;
            var angleRound = 22.5;
            if (
              Math.round(
                fixDirAngle(Math.round(spr.direction), 361) / angleRound
              ) *
                angleRound ==
              0
            ) {
              spr.direction = 0;
            }
            if (
              Math.round(
                fixDirAngle(Math.round(spr.direction), 361) / angleRound
              ) *
                angleRound ==
              90
            ) {
              spr.direction = 90;
            }
            if (
              Math.round(
                fixDirAngle(Math.round(spr.direction), 361) / angleRound
              ) *
                angleRound ==
              180
            ) {
              spr.direction = 180;
            }
            if (
              Math.round(
                fixDirAngle(Math.round(spr.direction), 361) / angleRound
              ) *
                angleRound ==
              -90
            ) {
              spr.direction = -90;
            }

            //save world position
            if (doscroll) {
              spr.worldx = spr.x - spr2.x;
              spr.worldy = spr.y - spr2.y;
            }
            spr.xVelocity = (spr._worldx - spr.x) * -1;
            spr.yVelocity = (spr._worldy - spr.y) * -1;
            if (!doscroll) {
              spr.worldx += spr.xVelocity;
              spr.worldy += spr.yVelocity;
            }
            //if(spr.down){window.alert(`X:${spr.worldx} Y:${spr.worldy}`);}
            //scroll
            if (doscroll && spr.canscroll) {
              if (spr.y < -35) {
                spr2.y = -spr.worldy - 35;
              }
              if (spr.y > 10) {
                spr2.y = -spr.worldy - -10;
              }
              if (spr.x < -35) {
                spr2.x = -spr.worldx - 35;
              }
              if (spr.x > 0) {
                spr2.x = -spr.worldx;
              }

              if (spr2.x > 0) {
                spr2.x = 0;
              }

              spr.x = spr2.x + spr.worldx;
              spr.y = spr2.y + spr.worldy;
            } else {
            }
          } else {
            if (!spr.deathgravity) {
              spr.deathgravity = 6;
            }
            if (!spr.firedeath) {
              spr.firedeath = true;
             
              if (spr.ondeath) {
                spr.ondeath();
              }
            }
             if (!(spr.currentAnimation == "died")) {
              runAnimation(spr,"died");
              }
            if (spr.y > 360) {
              if (!spr.deathAnimationPlayed) {
                spr.deathAnimationPlayed = true;
                spr.stop();
              }
            }
            spr.y -= spr.deathgravity;
            spr.deathgravity -= 0.2;
            if (spr.imageLocation) {
              spr.width = spr.imageLocation.width;
              spr.height = spr.imageLocation.height;
            }
            spr.direction = 90;
          }
          spr.onframeupdate(spr2.x, spr2.y);
        }
      } catch (e) {
        window.alert("Engine error! " + e);
      }
    }, 1000 / 60);
    try {
      spr.stopped = false;
      spr.stop = async function () {
        if (!spr.stopped) {
          clearInterval(this.runtimei);
          spr.running = false;
          await window.waitAsync(0.2);
          if (spr.onstop) {
            spr.onstop();
          }
        }
      };
    } catch (e) {
      window.alert(e);
    }
  }
  function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    animate();
  }
  function animate() {
    // request another frame

    requestAnimationFrame(animate);

    // calc elapsed time since last loop

    now = Date.now();
    elapsed = now - then;

    // if enough time has elapsed, draw the next frame

    if (elapsed > fpsInterval) {
      // Get ready for next frame by setting then=now, but also adjust for your
      // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
      then = now - (elapsed % fpsInterval);

      // Put your drawing code here
    }
  }
  var sonic2 = null;
  var layer = 1;
  window.rings = 0;
  window.overEngineSprites = [];
  window.startEngine = async function startEngine(
    levelmus,
    exitedlevel,
    tails
  ) {
    var engineRunning = true;
    var retval = "unknownexit";
    var collisiontest = new window.GRender.TextSprite(-275, -40, null, 32, 40);
    collisiontest.color = "white";
    collisiontest.bold = true;
    window.rings = 0;
    collisiontest.font = "arial";
    layer = 1;
    var onscreensprites = [];
    var smallrangesprites = [];
    //window.alert(filejump.data);
    var mus = null;
    function playmusic() {
      mus = new window.AudioApiReplacement(levelmus);
      mus.looped = true;
      mus.setVolume(1);
      mus.play();
      mus.onended = playmusic;
    }
    playmusic();
    var spindashsound = null;
    var ringsound = null;
	var jumpsoundthing = null
    async function playSound(name, speed, emitevents) {
	if (!emitevents) {
		window.MultiAPI.onMainGameSound(name,speed);
	}
      if (name == "jump") {
		if (jumpsoundthing) {
			jumpsoundthing.pause();
		}
        var a = new window.AudioApiReplacement(window.files.sfx.jump);
		jumpsoundthing = a;
        a.setVolume(1);
        a.play();
      }
      if (name == "roll") {
        var a = new window.AudioApiReplacement(window.files.sfx.spin);
        a.setVolume(1);
        a.play();
      }
      if (name == "spindash") {
        if (spindashsound) {
          spindashsound.pause();
          spindashsound.setVolume(1);
        }

        var a = new window.AudioApiReplacement(window.files.sfx.spindash);
        a.playbackRate = speed;
        a.setVolume(1);
        a.play();
        spindashsound = a;
      }
      if (name == "spindash-release") {
        if (spindashsound) {
          spindashsound.pause();
          spindashsound.setVolume(1);
        }

        var a = new window.AudioApiReplacement(
          window.files.sfx.spindashRelease
        );
        //a.playbackRate = speed;
        a.setVolume(1);
        a.play();
        spindashsound = a;
      }

      if (name == "peelout") {
        var a = new window.AudioApiReplacement(window.files.sfx.spindash);
        a.setVolume(1);
        a.play();
      }
      if (name == "peelout-release") {
        if (spindashsound) {
          spindashsound.pause();
          spindashsound.setVolume(1);
        }

        var a = new window.AudioApiReplacement(
          window.files.sfx.spindashRelease
        );
        //a.playbackRate = speed;
        a.setVolume(1);
        a.play();
        spindashsound = a;
      }
	  if (name == "spring") {
		
		var a = new window.AudioApiReplacement(window.files.sfx.spring);
        a.setVolume(1);
        a.play();
	  }
    }
	window.handlePlaySound = playSound;
    function checkCollisionPointCheck(x, y, istails) {
      if (!istails) {
        if (x < -300) {
          return true;
        }
        if (x > 300) {
          return true;
        }
      }
      var collidecount = 0;
      for (var spr of onscreensprites) {
        //if (Math.abs(spr.x) > 180 || Math.abs(spr.y) > 180) {
        //window.alert(spr.mask);
        try {
          if (spr.stype == "tile" || spr.collideable) {
            try {
              var sx =
                window.renderer.xToLeft(x, 4) -
                window.renderer.xToLeft(spr.x, spr.width * spr.scale);
            } catch (e) {
              window.alert("failed to get sx");
            }
            try {
              var sy =
                window.renderer.yToTop(y, 4) -
                window.renderer.yToTop(spr.y, spr.height * spr.scale);
              //collisiontest.text = `${sx} ${sy}`;
            } catch (e) {
              window.alert("failed to get sy");
            }
            //window.alert(sx);
            //window.alert(sy);

            if (spr.mask) {
            } else {
            }
            function checkboxcollision(rect1, rect2) {
              if (
                rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y
              ) {
                return true;
              }
              return false;
            }
            /*if (spr.stype == "monitor-ring") {
              if (checkboxcollision({
                x:window.renderer.xToLeft(spr.x, spr.width * spr.scale),
                y:window.renderer.yToTop(spr.y, spr.height * spr.scale),
                width:spr.width * spr.scale,
                height:spr.height * spr.scale
              },{
                x:window.renderer.xToLeft(x, 4),
                y:window.renderer.yToTop(y, 4),
                width:4,
                height:4
              })) {
                collidecount += 1;
                return true;
              }
            }*/
            //it seems like decimal values glitch the collidesWith function, so rounding them is our best fix.

            if (
              spr.mask.collidesWith(
                window.files.pointcollision,
                Math.round(sx),
                Math.round(sy)
              )
            ) {
              //window.alert("yes");

              if (spr.stype == "tile") {
                if (layer == spr.layer || spr.layer == 0) {
                  collidecount += 1;
                  return true;
                }
              } else {
                if (spr.collideable) {
                  //collidecount += 1;
                  //return true;
                }
              }
            }
          }
        } catch (e) {
          //window.alert(spr.stype);
          //window.alert(spr.x);
          //window.alert(spr.y);
          //window.alert(spr.layer);
          //window.alert(spr.mask);
          //window.alert(sx);
          //window.alert(sy);
          //document.body.innerHTML = e;
          console.warn(`Found Sprite With Collision Error: ${e}`, spr);
        }
        //}
      }
      return collidecount > 0;
    }
    function spriteCollisonCheck(checksprite) {
      for (var spr of onscreensprites) {
        spr.x = window.levelspr.x + spr.sx;
        spr.y = window.levelspr.y + spr.sy;
        /*if (spr.stype == "tile") {
          var sx =
            window.renderer.xToLeft(checksprite.x, 4) -
            window.renderer.xToLeft(spr.x, 128);
          var sy =
            window.renderer.yToTop(checksprite.y, 4) -
            window.renderer.yToTop(spr.y, 128);
          //window.alert(sx);
          //window.alert(sy);
          if (spr.mask) {
            if (spr.layer == 0) {
              if (spr.mask.collidesWith(window.files.pointcollision, sx, sy)) {
                return true;
              }
            }
          }
        }*/
      }
      return checkCollisionPointCheck(checksprite.x, checksprite.y, true);
    }
    function checkCollisionPoint(x, y) {
      return checkCollisionPointCheck(x, y, false);
    }
    function checkCollisionPointTails(x, y) {
      return checkCollisionPointCheck(x, y, true);
    }
    async function tilebehavior(ts) {
      try {
        if (ts.stype == "text") {
          ts.type = "text";
          ts.color = "black";
          ts.text = ts.stext;
          ts.size = 15;
          ts.center = true;
          ts.height = 15;
        }
        function monitorScript(mtype, ts, cb) {
          if (!ts.broken) {
            ts.scale = 0.5;
            ts.width = 56;
            ts.height = 64;
            ts.imageLocation = getSpriteByName(
              window.files.monitorSpriteSheet.sprites,
              mtype + ".png"
            );

            if (sonic.rolling || sonic.jumping || sonic.spindash) {
              ts.collideable = false;
            } else {
              ts.collideable = true;
            }
            if (window.renderer.checkSpriteCollision(ts, sonic)) {
              if (sonic.rolling || sonic.jumping || sonic.spindash) {
                var a = new window.AudioApiReplacement(
                  window.files.sfx.destory
                );
                a.setVolume(1);
                a.play();
                //ts.visible = false;
                ts.broken = true;
                sonic.gravity = sonic.gravity * -1;
                ts.imageLocation = getSpriteByName(
                  window.files.monitorSpriteSheet.sprites,
                  "broken.png"
                );
                ts.collideable = false;
                setTimeout(() => {
                  cb();
                }, 500);
              } else {
              }
            }
          }
        }
        if (ts.stype == "monitor-eggman") {
          monitorScript("eggman", ts, () => {
            sonic.hurt = true;
          });
        }
        if (ts.stype == "monitor-ring") {
          monitorScript("ring", ts, () => {
            sonic.rings += 10;
            if (ringsound) {
              ringsound.pause();
              ringsound.setVolume(1);
            }

            var a = new window.AudioApiReplacement(window.files.sfx.ring);
            //a.playbackRate = speed;
            a.setVolume(1);
            a.play();
            ringsound = a;
          });
        }
        if (ts.stype == "springRed") {
          if (!ts.springi) {
            ts.springi = 0;
          } else {
            if (ts.springi > 0) {
              ts.springi -= 0.1;
            } else {
              ts.springi = 0;
            }
          }
          ts.imageLocation = getSpriteByName(
            window.files.springspritesheet.sprites,
            "spring" + Math.round(ts.springi + 1) + ".png"
          );
          ts.width = ts.imageLocation.width;
          ts.height = ts.imageLocation.height;
          if (!sonic.hurtanim) {
            if (window.renderer.checkSpriteCollision(ts, sonic)) {
              sonic.gravity = 15;
              sonic.onfloor = false;
              sonic.jumping = false;
              sonic.spring = true;
              ts.springi = 2;
              if (!ts.springsoundplayed) {
                playSound("spring");
                ts.springsoundplayed = true;
              }
            } else {
              ts.springsoundplayed = false;
            }
          }
        }
        if (ts.stype == "ring") {
          if (window.renderer.checkSpriteCollision(ts, sonic)) {
            if (ts.visible) {
              sonic.rings += 1;
              if (ringsound) {
                ringsound.pause();
                ringsound.setVolume(1);
              }

              var a = new window.AudioApiReplacement(window.files.sfx.ring);
              //a.playbackRate = speed;
              a.setVolume(1);
              a.play();
              ringsound = a;
            }
            ts.visible = false;
          }
          if (!ts.ringanim) {
            ts.ringanim = 0;
          }
          ts.ringanim += 0.05;
          if (ts.ringanim > 3.5) {
            ts.ringanim = 0;
          }
          ts.scale = 0.13;
          ts.imageLocation = {
            x: Math.round(ts.ringanim) * 16,
            y: 0,
            width: 16,
            height: 16,
          };
        }
        if (ts.stype == "scatterring") {
          //ts.image = window.files.ring;

          if (!ts.collectabletimer) {
            ts.collectabletimer = 0;
          }
          ts.collectabletimer += 0.7;
          ts.sy -= ts.my;
          ts.my -= 0.08;

          ts.x = window.levelspr.x + ts.sx;
          ts.y = window.levelspr.y + ts.sy;
          ts.y += 16;
          if (spriteCollisonCheck(ts)) {
            ts.sy += ts.my;
            ts.my = ts.my * -0.8;
          }
          ts.y -= 16;
          ts.sx += ts.mx;
          ts.mx = ts.mx * 0.99;
          ts.x = window.levelspr.x + ts.sx;
          ts.y = window.levelspr.y + ts.sy;
          ts.y += 16;
          if (spriteCollisonCheck(ts)) {
            ts.sx -= ts.mx;
            ts.mx = ts.mx * -0.8;
          }
          ts.y -= 16;
          if (ts.collectabletimer > 60) {
            if (window.renderer.checkSpriteCollision(ts, sonic)) {
              if (ts.visible) {
                sonic.rings += 1;
                if (ringsound) {
                  ringsound.pause();
                  ringsound.setVolume(1);
                }

                var a = new window.AudioApiReplacement(window.files.sfx.ring);
                //a.playbackRate = speed;
                a.setVolume(1);
                a.play();
                ringsound = a;
              }
              ts.visible = false;
            }
          }
          if (!ts.ringanim) {
            ts.ringanim = 0;
          }
          ts.ringanim += 0.05;
          if (ts.ringanim > 3.5) {
            ts.ringanim = 0;
          }
          ts.scale = 0.13;
          ts.imageLocation = {
            x: Math.round(ts.ringanim) * 16,
            y: 0,
            width: 16,
            height: 16,
          };
        }
        if (ts.stype == "s1") {
          ts.width = 64;
          ts.height = 128;
          ts.type = "square"; //change the sprite to an square
          ts.image = null; //square sprites dont need an image.
          ts.color = "red";
          ts.visible = false;
          if (window.renderer.checkSpriteCollision(ts, sonic)) {
            layer = 1;
          }
        }
        if (ts.stype == "s2") {
          ts.width = 64;
          ts.height = 128;
          ts.type = "square"; //change the sprite to an square
          ts.image = null; //square sprites dont need an image.
          ts.color = "blue";
          ts.visible = false;
          if (window.renderer.checkSpriteCollision(ts, sonic)) {
            layer = 2;
          }
        }
        if (ts.stype == "motobug") {
          if (ts.visible) {
            if (!ts.timer) {
              ts.timer = 1;
            }
            if (!ts.move) {
              ts.move = 1;
            }
            if (ts.timer > 3) {
              ts.timer = 0;
              ts.move = ts.move * -1;
            }
            if (ts.move < 0) {
              ts.flipX = false;
            } else {
              ts.flipX = true;
            }
            ts.timer += 0.01;
            ts.width = 40;
            ts.height = 29;
            ts.sx += ts.move * 0.7;
            if (window.renderer.checkSpriteCollision(ts, sonic)) {
              if (sonic.rolling || sonic.jumping || sonic.spindash) {
                var a = new window.AudioApiReplacement(
                  window.files.sfx.destory
                );
                a.setVolume(1);
                a.play();
                ts.visible = false;
                sonic.gravity = sonic.gravity * -1;
              } else {
                ts.visible = true;
                sonic.hurt = true;
              }
            }
          }
        }
        if (window.files.sonic1Tiles[ts.sid]) {
          ts.image = window.files.sonic1Tiles[ts.sid];
        }
        if (window.files.tileScales[ts.sid]) {
          ts.scale = window.files.tileScales[ts.sid];
        }
        if (ts.stype == "sign") {
          if (sonic.canscroll) {
            ts.scale = 0.5;
            if (sonic.x > ts.x) {
              sonic.canscroll = false;
              retval = "clear";
              window.levelspr.x = -ts.sx;
              window.levelspr.y = -ts.sy;
              sonic.x = sonic.worldx + window.levelspr.x;
              sonic.y = sonic.worldy + window.levelspr.y;
              tailshud.text = "";
              mus.onended = function () {};
              mus.pause();
              var clear = new window.AudioApiReplacement(
                window.files.jingles.levelClear
              );
              clear.looped = false;
              clear.setVolume(1);
              clear.play();

              clear.onended = async function () {
                await sonic.stop();
                if (sonic2) {
                  await sonic2.stop();
                }
                engineRunning = false;
                //window.renderer.blackScreen = true;
                sprites = [];
                await window.waitAsync(0.5);
              };
            }
          }
        }
      } catch (e) {
        window.alert(e);
      }
    }
    collisiontest.text = "Test";
    var _fpstick = 0;
    var fps = 60;
    /*setInterval(() => {
      fps = _fpstick;
      _fpstick = 0;
    }, 1000);
    setInterval(() => {
      _fpstick += 1;
    }, 1000 / 60);*/
    bgsprite = new window.GRender.SquareSprite(0, 0, null, 600, 360);
    bgsprite.isbg = true;
    sonic = new window.GRender.Sprite(-200, 0, window.files.maniaSonic, 32, 40);

    test = new window.GRender.TextSprite(0, 0, null, 32, 40);
    test.color = "black";
    test.text = "hi";

    var hudrings = new window.GRender.TextSprite(-275, -140, null, 32, 40);
    hudrings.color = "yellow";
    hudrings.bold = true;
    hudrings.font = "pixel";
    hudrings.text = "RINGS: 0";

    var debug1 = new window.GRender.TextSprite(-275, -120, null, 32, 40);
    debug1.color = "white";
    debug1.bold = true;
    debug1.font = "arial";
    var debug2 = new window.GRender.TextSprite(-275, -100, null, 32, 40);
    debug2.color = "white";
    debug2.bold = true;
    debug2.font = "arial";
    var speedhud = new window.GRender.TextSprite(-275, -80, null, 32, 40);
    speedhud.color = "white";
    speedhud.bold = true;
    speedhud.font = "arial";
    var tailshud = new window.GRender.TextSprite(-275, 180, null, 32, 40);
    tailshud.color = "orange";
    tailshud.bold = true;
    tailshud.font = "pixel";
    tailshud.text = "";
    //tailshud.text = "Press T For tails!";

    bgsprite.color = "#00a2ff";
    sprites.push(bgsprite);
    //sprites.push(level);
    sprites.push(sonic);
    //sprites.push(speedhud);
    sprites.push(hudrings);
    //sprites.push(debug2);
    //sprites.push(debug1);
    //sprites.push(collisiontest);
    sonic.onstop = async function () {
      //await sonic.stop();
      setInterval(() => {
        mus.onended = function () {};
        mus.pause();
      }, 1);
      if (sonic2) {
        await sonic2.stop();
      }
      engineRunning = false;
      //window.renderer.blackScreen = true;
      sprites = [];
      await window.waitAsync(0.5);
    };
    if (!tails) {
      sprites.push(tailshud);
    }
    //sprites.push(test); test is unused, as it name says.
    var scrollStart = [
      0, //X scroll
      0, //Y scroll
    ];
    sonic.spritesheetData = window.files.maniaSonicSpritehseet.sprites;
    sonic.animationData = window.files.maniaSonicAnimations;
    movementEngine(
      sonic,
      window.levelspr,
      window.files.maniaSonicSpritehseet.sprites,
      true,
      scrollStart,
      checkCollisionPoint,
      playSound
    );
    
    //change scale for sonic
    sonic.scale = 0.5;

    sonic.ondeath = function () {
      var a = new window.AudioApiReplacement(window.files.sfx.death);

      a.setVolume(1.7);
      a.play();
    };
    var scatteredrings = [];
    sonic.onhurt = async function (r) {
      var a = new window.AudioApiReplacement(window.files.sfx.looseRings);
      a.setVolume(1);
      a.play();
      scatteredrings = [];
      //window.alert("sonic hit!");
      var i = 0;
      while (i < r) {
        var spr = new window.GRender.Sprite(0, 0, window.files.ring, 128, 128);
        spr.stype = "scatterring";
        spr.sx = sonic.worldx;
        spr.sy = sonic.worldy;
        spr.layer = 0;
        spr.visible = true;
        spr.mx = Math.random() * 10 - 5;
        spr.my = Math.random() * 10 - 5;
        scatteredrings.push(spr);
        if (i > 100) {
          break;
        }
        i += 1;
      }

      //window.alert(scatteredrings.length);
      await window.waitAsync(5);
      scatteredrings = [];
    };
    async function spawnTails() {
      sonic2 = new window.GRender.Sprite(0, 0, window.files.tails, 32, 40);
      sprites.push(sonic2);
      setInterval(() => {
        if (moveStepsSpeed(sonic.x - sonic2.x, sonic2.direction)[0] > 25) {
          sonic2.right = true;
        } else {
          sonic2.right = false;
        }
        if (moveStepsSpeed(sonic.x - sonic2.x, sonic2.direction)[0] < -25) {
          sonic2.left = true;
        } else {
          sonic2.left = false;
        }
        if (sonic2.spindash || sonic2.peelout || sonic2.down || sonic2.up) {
          sonic2.jump = sonic.jump; //copy the players jump key down input.
        } else {
          if (sonic.jump) {
            //moveStepsSpeed(sonic2.y - sonic.y, sonic.direction)[0] > 25
            sonic2.jump = true;
          } else {
            sonic2.jump = false;
          }
        }
        if (sonic.down) {
          sonic2.down = true;
        } else {
          sonic2.down = false;
        }
        if (sonic.up) {
          sonic2.up = true;
        } else {
          sonic2.up = false;
        }
      }, 1);
      movementEngine(
        sonic2,
        window.levelspr,
        window.files.tailsspritesheet.sprites,
        false,
        scrollStart,
        checkCollisionPointTails,
        playSound
      );
      while (engineRunning) {
        await window.tickAsync();
        try {
          sonic2.scale = 0.5; //tails scale is 0.5 bc I got the sprites in scratch.
          if (
            sonic2.y > 370 ||
            sonic2.y < -370 ||
            sonic2.x > 350 ||
            sonic2.x < -350
          ) {
            sonic2.visible = false;
            sonic2.x = sonic.x - 40;
            sonic2.y = sonic.y;
            sonic2.worldx = sonic.worldx;
            sonic2.worldy = sonic.worldy - 40;
            await sonic2.stop();
            sonic2.x = sonic.x - 40;
            sonic2.y = sonic.y;
            sonic2.worldx = sonic.worldx;
            sonic2.worldy = sonic.worldy - 40;
            await window.tickAsync(0.7);
            sonic2.visible = true;
            //window.alert("sonic cpu died!");
            try {
              sonic2.x = sonic.x - 40;
              sonic2.y = sonic.y;
              sonic2.worldx = sonic.worldx;
              sonic2.direction = 90;
              sonic2.worldy = sonic.worldy - 40;
              sonic2.gravity = 0;
              sonic2.speed = 0;
              sonic2.engineAngle = 90;
              sonic2.smoothrot = 90;

              movementEngine(
                sonic2,
                window.levelspr,
                window.files.tailsspritesheet.sprites,
                false,
                [window.levelspr.x, window.levelspr.y],
                checkCollisionPointTails,
                playSound
              );
              sonic2.x = sonic.x - 40;
              sonic2.y = sonic.y;
              sonic2.worldx = sonic.worldx;
              sonic2.worldy = sonic.worldy - 40;
            } catch (e) {
              window.alert("Tails Respawn Error! " + e);
            }
          }
          sonic2.x = sonic2.worldx + window.levelspr.x;
          sonic2.y = sonic2.worldy + window.levelspr.y;
        } catch (e) {
          window.alert("Tails Respawn Error! " + e);
        }
      }
    }
    if (tails) {
      spawnTails();
    }
    document.onkeydown = function (e) {
      if (e.key == "ArrowLeft") {
        sonic.left = true;
      }
      if (e.key == "ArrowRight") {
        sonic.right = true;
      }
      if (e.key == "ArrowDown") {
        sonic.down = true;
      }
      if (e.key == "ArrowUp") {
        sonic.up = true;
      }
      if (e.key.toLowerCase() == "z") {
        sonic.jump = true;
      }
      if (e.key.toLowerCase() == "h") {
        window.HDRendering = !window.HDRendering;
      }
      if (e.key.toLowerCase() == "t") {
        if (!tails) {
          if (!(tailshud.text == "")) {
            tailshud.text = "";
            spawnTails();
          }
        }
      }
    };
    document.onkeyup = function (e) {
      if (e.key == "ArrowLeft") {
        sonic.left = false;
      }
      if (e.key == "ArrowRight") {
        sonic.right = false;
      }
      if (e.key == "ArrowDown") {
        sonic.down = false;
      }
      if (e.key == "ArrowUp") {
        sonic.up = false;
      }
      if (e.key.toLowerCase() == "z") {
        sonic.jump = false;
      }
    };
    var ringanimation = 0;
    var enimies = [];
    var sprs = [];
    while (engineRunning) {
      debug2.text = `ENGINE ANGLE: ${sonic.engineAngle}`;
      debug1.text = `ANGLE: ${sonic.smoothrot}`;
      speedhud.text = `SPEED: ${sonic.xVelocity},${sonic.yVelocity}`;
      onscreensprites = [];
      if (sonic.worldy > window.lowestLevelY) {
        sonic.dead = true;
      }
      smallrangesprites = [];
      if (sonic.rings < 1) {
        if (ringanimation > 100) {
          ringanimation = 0;
        }
        ringanimation += 10;
        if (ringanimation > 50) {
          hudrings.color = "red";
        } else {
          hudrings.color = "yellow";
        }
      } else {
        hudrings.color = "yellow";
      }
      hudrings.text = `RINGS: ${sonic.rings}`;
      enimies = [];
      enimies.length = 0;
      //sprs = window.files.level;
      //seems like when the scatterring sprites get deleted in the array, they still do not get deleted on the screen sprites.
      //so to fix this, remove all the scatterring sprites on the screen, then add them back from the scatterring sprites array.
      //they also cause minor lag if this script is not there, as they get put on the screen multiple times.
      var newsprites = [];
      for (var spr of sprites) {
        if (!(spr.stype == "scatterring")) {
          newsprites.push(spr);
        }
      }
      sprites = newsprites;
      //im not sure this is the fastest way, but it seems pretty fast on most normal pc's (including school chromebooks).
      for (var ts of window.files.level) {
        ts.x = window.levelspr.x + ts.sx; //set the x position.
        ts.y = window.levelspr.y + ts.sy; //set the y position.
        if (
          Math.abs(ts.x) > 360 + (ts.width * ts.scale) / 2 ||
          Math.abs(ts.y) > 400 + (ts.height * ts.scale) / 2
        ) {
        } else {
          tilebehavior(ts); //this gives the tiles, and entities, a behavior (if it has one)
          if (!(ts.stype == "tile")) {
            enimies.push(ts); //enimie array is not all enimies (rings, springs, scattered rings, etc.), i just called it that.
          } else {
            onscreensprites.push(ts);
          }
        }
        if (Math.abs(ts.x) > 110 || Math.abs(ts.y) > 110) {
        } else {
          if (smallrangesprites.length < 4) {
            smallrangesprites.push(ts);
          }
        }
      }
      //put the scatterring sprites on the screen.
      for (var ts of scatteredrings) {
        //scatter rings are added entities, they use the same code as the rings, but with some physic scripts.
        //most of this code is borrowed from the tile/entites script above.
        ts.x = window.levelspr.x + ts.sx;
        ts.y = window.levelspr.y + ts.sy;
        tilebehavior(ts);
        enimies.push(ts);
      }
      var ns = [];
      for (var spr of sprites) {
        if (!spr.istile) {
          if (!spr.isbg) {
            ns.push(spr);
          }
        }
      }
      sprites = [];

      sprites.push(bgsprite);
      sprites = sprites.concat(onscreensprites);
      sprites = sprites.concat(enimies);
      sprites = sprites.concat(ns);
	  var nspr = [];
	  for (var spr of sprites) {
		  if (!(spr.SDATAID == "____CUSTOM_____")) {
			  nspr.push(spr);
		  }
	  }
	  sprites = nspr;
	  for (var ospr of window.overEngineSprites) {
		  if (ospr) {
			ospr.SDATAID = "____CUSTOM_____";
			sprites.push(ospr);
		  }
	  }
      await window.tickAsync();
    }
    await window.waitAsync(0.5);
    window.renderer.drawSprites([]);
    sprites = [];
    await window.waitAsync(0.3);
    exitedlevel(retval);
  };
  async function loadLevelData(data,music) {
    var loadingtext = new window.GRender.TextSprite(260, 180, null, 32, 40);
    loadingtext.color = "white";
    loadingtext.bold = true;
    loadingtext.font = "pixel";
    loadingtext.text = "loading...";
    loadingtext.center = true;
    sprites = [loadingtext];
    var levelurl = await window.formatLevel(
      data,
      window.files.tiles
    );
    window.files.level = levelurl;
    sprites = [];
    return new Promise((a) => {
      window.startEngine(
        music, //level number.
        (e) => {
          //exit function.
          a(e);
        },
        false //has tails, false if not. (tails AI is still WIP)
      );
    });
  }
  var WSserverURL = new window.GRender.TextSprite(0, 0, null, 45, 19);
  WSserverURL.text = "localhost:5824";
  async function loadLevel(number) {
    await loadLevelData(window.files.levels[number],window.files.levelMusic[number]);
  }
  async function dolevel(num) {
    try {
      var levelrunning = true;
      while (levelrunning) {
        var report = await loadLevel(num);
        if (report == "clear") {
          levelrunning = false;
        }
      }
    } catch (e) {
      window.alert(e);
    }
  }
  window.startGame = async function startGame() {
    try {
      setInterval(() => {
        try {
          //window.renderer.canvas.requestFullscreen();
        } catch (e) {}
      }, 1);
      tickEngine();
      var vid = document.createElement("video");
      vid.src = "res/videos/sega.webm";
      vid.play();
      sprites = [new window.GRender.Sprite(0, 0, vid, 600, 360)];
      async function start() {
        sprites = [];

        await window.titleScreen();
		var isInMenu = true;
		window.curMenu = "main";
		window.SonicmenuMusic = null;
		function playmusic() {
		  SonicmenuMusic = new window.AudioApiReplacement(window.files.menumusic.main);
		  SonicmenuMusic.looped = true;
		  SonicmenuMusic.setVolume(1);
		  SonicmenuMusic.play();
		  SonicmenuMusic.onended = playmusic;
		}
		playmusic();
		async function runLevelsInOrder() {
			for (var l of window.files.levelorder) {
					  await dolevel(l); //the first level is number 0, the second is 1
					}
		}
		while (isInMenu) {
			switch (curMenu) {
			  case 'main':
				
				var selected = await runMenu([
					new window.GRender.Sprite(0, 0, window.files.menuStuff.main, 105, 18),
					new window.GRender.Sprite(0, 0, window.files.menuStuff.multi, 106, 23),
					new window.GRender.Sprite(0, 0, window.files.menuStuff.exit, 36, 18)
				]);
				console.log(selected);
				if (selected == 0) {
					isInMenu = false;
					runLevelsInOrder();
				}
				if (selected == 1) {
					curMenu = "multi";
				}
				
				break;
			  case 'multi':
			  
				var selected = await runMenu([
					WSserverURL,
					new window.GRender.Sprite(0, 0, window.files.menuStuff.join, 44, 18),
					new window.GRender.Sprite(0, 0, window.files.menuStuff.host, 102, 21),
					new window.GRender.Sprite(0, 0, window.files.menuStuff.back, 45, 19)
				]);
				if (selected == 1) {
					isInMenu = false;
					runMultiPLayerLoop("JOIN",WSserverURL.text);
				}
				if (selected == 2) {
					isInMenu = false;
					runMultiPLayerLoop("HOST");
				}
				if (selected == 3) {
					curMenu = "main";
				}
				break;
			  default:
				
			}
		}
		SonicmenuMusic.onended = ()=>{};
		SonicmenuMusic.pause();
		
      }
      document.onkeydown = function (e) {
        if (e.key == "Enter") {
          vid.pause();
          document.onkeydown = null;
          start();
          vid.onended = "";
          vid.src = "";
        }
      };
      vid.onended = async function () {
        vid.pause();
        document.onkeydown = null;
        start();
      };
    } catch (e) {
      window.alert(e);
    }
  };
