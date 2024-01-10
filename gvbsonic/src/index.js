window.MultiAPI = {};
window.MultiAPI.onMainGameSound = function () {};
window.gamelisteners = {
    levelLoaded: [],
    death: [],
    levelEnded: [],
    tiletick: [],
};
window.files = {};

window.gvbsonic = {
    events: {
        emit: function (name, ...values) {
            this[name].forEach((f) => {
                f.apply(window.gvbsonic, values);
            });
        },
        emitAsync: async function (name, ...values) {
            for (var f of this[name]) {
                await f.apply(window.gvbsonic, values);
            }
        },
        loadassets: [],
        afterloaded: [],
        enginetick: [],
        beforedraw: [],
        afterdraw: [],
        startgame: [],
        playlevelmusic: [],
        settitle: [],
        tileupdate: []
    },
    addEventListener: function (eventName, func) {
        if (this.events[eventName]) {
            this.events[eventName].push(func);
        }
    },
    removeEventListener: function (eventName, func) {
        if (this.events[eventName]) {

            var newEventArray = [];

            var removed = false;

            for (var event of this.events[eventName]) {
                if (removed) {
                    newEventArray.push(event);
                } else {
                    if (event !== func) {
                        newEventArray.push(event);
                        removed = true;
                    }
                }
            }

            this.events[eventName] = newEventArray;

        }
    },
    sound: window.AudioApiReplacement,
    sprite: window.GRender.Sprite,
    textSprite: window.GRender.TextSprite,
    squareSprite: window.GRender.SquareSprite,
    files: window.files,
    tileBehavior: window.tileBehavior,
    tileSystem: window.gvbsonicTileManager,
    characters: window.gvbsonicCharacters,
    importJSON: async function (j) {
        var a = await window.fetchFile(j);
        var b = await a.text();
        return JSON.parse(b);
    },
    importText: async function (j) {
        var a = await window.fetchFile(j);
        var b = await a.text();
        return b;
    },
    getSonic: function () {
        return window.sonic;
    },
    getTails: function () {
        return window.CPUTails;
    }
};

window.debugModeEnabled = false;
window.addGameListener = function () {};
window.filesloaded = 0;
var fps, fpsInterval, startTime, now, then, elapsed;
var sprites = [];
var bgsprite = null;
var sonic = null;
var level = null;
var uiSprites = [];
var tileSprites = [];
async function tickEngine() {
    var fps,
    fpsInterval,
    startTime,
    now,
    then,
    elapsed;
    function startAnimating(fps) {
        fpsInterval = 1000 / fps;
        then = Date.now();
        startTime = then;
        animate();
    }
    var collisiontestsprite = new window.GRender.Sprite(
            0,
            0,
            collisiontestcvs,
            600,
            360);
    function animate() {
        setTimeout(animate, 1);
        now = Date.now();
        elapsed = now - then;
        if (elapsed > fpsInterval) {
            then = now - (elapsed % fpsInterval);
            gvbsonic.events.emit("beforedraw");
            var debugSprites = [];
            if (window.debugModeEnabled) {
                debugSprites.push(collisiontestsprite);
            }
            window.renderer.drawSprites(
                debugSprites.concat(sprites).concat(uiSprites).concat(debugSprites));
            collisionctx.clearRect(0, 0, 600, 360);
            gvbsonic.events.emit("afterdraw");
        }
    }
    startAnimating(60);
}
function ScratchMod(a, b) {
    const n = a;
    const modulus = b;
    let result = n % modulus;
    if (result / modulus < 0)
        result += modulus;
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
    const radians = degrees_to_radians(90 - scr_wrap_angle(spr.direction));
    const dx = steps * Math.cos(radians);
    const dy = steps * Math.sin(radians);
    spr.x += dx;
    spr.y -= dy;
}
window.moveSteps = window.moveSteps;
function moveStepsInDirection(steps, spr, direction) {
    const radians = degrees_to_radians(90 - scr_wrap_angle(direction));
    const dx = steps * Math.cos(radians);
    const dy = steps * Math.sin(radians);
    spr.x += dx;
    spr.y -= dy;
}
window.moveStepsInDirection = window.moveStepsInDirection;
function moveStepsSpeed(steps, direction) {
    const radians = degrees_to_radians(90 - scr_wrap_angle(direction));
    const dx = steps * Math.cos(radians);
    const dy = steps * Math.sin(radians);
    return [dx, dy];
}
window.moveStepsSpeed = window.moveStepsSpeed;
var collisioncvs = document.createElement("canvas");
var cctx = collisioncvs.getContext("2d");
collisioncvs.width = 600;
collisioncvs.height = 360;
collisioncvs.style.background = "grey";
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
CollisionMask.prototype.collidesWith = function (other, dx, dy) {
    if (dx < 0) {
        return other.collidesWith(this, -dx, -dy);
    }
    if (dx > this.w)
        return false;
    var y1,
    y2;
    if (dy < 0) {
        if (other.h < -dy)
            return false;
        y1 = 0;
        y2 = Math.min(other.h + dy, this.h);
    } else {
        if (this.h < dy)
            return false;
        y1 = dy;
        y2 = Math.min(other.h + dy, this.h);
    }
    var x1 = dx;
    var x2 = Math.min(this.w, other.w + dx);
    const lshift = dx % 32;
    const rshift = 32 - lshift;
    const x1scaled = Math.floor(x1 / 32);
    const x2scaled = Math.ceil(x2 / 32);
    for (var y = y1; y < y2; ++y) {
        const trow = this.mask[y];
        const orow = other.mask[y - dy];
        for (var x = x1scaled; x < x2scaled; ++x) {
            var bits = trow[x] << lshift;
            bits |= trow[x + 1] >>> rshift;
            if (orow[x - x1scaled] & bits) {
                return true;
            }
        }
    }
};
window.getSpriteByName = function getSpriteByName(sprites, name) {
    for (var spr of sprites) {
        if (spr.name.toLowerCase() == name.toLowerCase()) {
            return spr;
        }
    }
    return null;
};
var previousInfo = {};
function getCollisionPixel(sx, sy, spr2) {
    var ax = window.renderer.xToLeft(spr2.x, spr2.width);
    var ay = window.renderer.yToTop(spr2.y, spr2.height);
    var x = window.renderer.xToLeft(sx, 2);
    var y = window.renderer.yToTop(sy, 2);
    var touching = false;
    if (
        !(
            previousInfo.width == spr2.width &&
            previousInfo.height == spr2.height &&
            previousInfo.x == spr2.ax &&
            previousInfo.y == spr2.ay &&
            previousInfo.image == spr2.image)) {
        cctx.clearRect(0, 0, 600, 360);
        cctx.drawImage(spr2.image, ax, ay, spr2.width, spr2.height);
        previousInfo.width = spr2.width;
        previousInfo.height = spr2.height;
        previousInfo.x = ax;
        previousInfo.y = ay;
        previousInfo.image = spr2.image;
    } else {}
    previousInfo.x = ax;
    previousInfo.y = ay;
    previousInfo.image = spr2.image;
    previousInfo.width = spr2.width;
    previousInfo.height = spr2.height;
    var data = cctx.getImageData(Math.round(x), Math.round(y), 2, 2).data;
    var i = 0;
    while (i < data.length) {
        i += 3;
        if (data[i - 1] > 200) {
            touching = true;
        }
    }
    return touching;
}
function roundCords(s) {
    s.x = Math.round(s.x);
    s.y = Math.round(s.y);
}
function getAngleFromCollision(spr, spr2, checkcollide, useSpeedVar) {
    if (true) {
        var speedlast = spr.speed;
        moveSteps(-speedlast, spr);
        roundCords(spr);
        var ogx = spr.x;
        var ogy = spr.y;
        roundCords(spr);
        if (spr.speed > spr.speedcap) {
            spr.speed = spr.speedcap;
        }
        if (spr.speed < -spr.speedcap) {
            spr.speed = -spr.speedcap;
        }
        var ogdir = spr.direction;
        var speedtmp = spr.speed;
        var angle = 90;
        var x = 0;
        var y = 0;
        var x2 = 0;
        var y2 = 0;
        spr.direction -= 90;
        moveSteps(0, spr);
        spr.direction += 90;
        var possave = {
            x: spr.x,
            y: spr.y,
            dir: spr.direction,
        };
        var check = 0;
        spr.x = possave.x;
        spr.y = possave.y;
        var force = true;
        var right = 0;

        roundCords(spr);
        var sprSpeedThing = Math.abs(spr.speed) * 7;
        if (true) {
            sprSpeedThing = 60;
        }
        var angleCheckWidth = 8;
        roundCords(spr);
        while (
            (check < sprSpeedThing && checkcollide(spr.x, spr.y, spr2)) ||
            force) {
            right += 1;
            force = false;
            spr.x = possave.x;
            spr.y = possave.y;
            moveSteps(angleCheckWidth, spr);
            roundCords(spr);
            spr.direction -= 1;
            check += 1;
            markSpritePos(spr, "purple");
        }
        check = 0;
        spr.x = possave.x;
        spr.y = possave.y;
        force = true;
        var left = 0;
        roundCords(spr);
        while (
            (check < sprSpeedThing && checkcollide(spr.x, spr.y, spr2)) ||
            force) {
            left += 1;
            force = false;
            spr.x = possave.x;
            spr.y = possave.y;
            moveSteps(-angleCheckWidth, spr);
            roundCords(spr);
            spr.direction += 1;
            check += 1;
            markSpritePos(spr, "purple");
        }
        spr.x = possave.x;
        spr.y = possave.y;
        function getSlopeAngle(s1, s2) {
            return (Math.atan((s2[1] - s1[1]) / (s2[0] - s1[0])) * 180) / Math.PI;
        }
        angle = spr.direction;
        spr.direction = possave.dir;
        spr.direction -= 90;
        moveSteps(0, spr);
        roundCords(spr);
        spr.direction += 90;
        function calculateAngle(x, y) {
            var radians = Math.atan2(y, x);
            var degrees = (radians / Math.PI) * 180;
            return degrees;
        }
        var outAngle =
            scr_wrap_angle(Math.round(ScratchMod(angle, 361) / 10) * 10 - 90) + 90;
        var snappedAngle = Math.round(scr_wrap_angle(outAngle - 90) + 90 / 45) * 45;
        spr.direction = ogdir;
        spr.x = ogx;
        spr.y = ogy;
        var a = ogdir;
        a -= right;
        a += left;
        a = scr_wrap_angle(a - 90) + 90;
        a = scr_wrap_angle(Math.round(ScratchMod(a, 361) / 2) * 2 - 90) + 90;
        var b = a - 90;
        if (b > -5 && b < 5) {
            a = 90;
        }
        if (a - 90 > -5 && a - 90 < 5) {
            a = 90;
        }
        moveSteps(speedlast, spr);
        roundCords(spr);
        var output2 = Math.round((scr_wrap_angle(a - 90) + 90) / 5) * 5;
        if (output2 == 88) {
            output2 = 90;
        }
        if (output2 == 89) {
            output2 = 90;
        }
        return output2;
    } else {
        return 90;
    }
}
async function isActuallyTouchingFloor(spr, spr2, checkcollide) {
    //This is to fix the wierd "stairway" issue with the engine, also fixes some other bugs too!

    spr.stickToFloorEnabled = false;

    var checkAmount = 25;

    while (checkAmount > 0) {

        spr.direction -= 90;
        moveSteps(-checkAmount, spr); //Still, just in case move down a bit, so the engine will actually make sure their is floor underneath.
        spr.direction += 90;

        moveSteps(spr.speed, spr); //Check in front, not where we are now!

        if (checkcollide(spr.x, spr.y, spr2)) {
            spr.stickToFloorEnabled = true;
        }

        //Move back to where we where
        moveSteps(-spr.speed, spr);

        spr.direction -= 90;
        moveSteps(checkAmount, spr);
        spr.direction += 90;

        checkAmount -= 1;
    }
}

async function doPlayerLauncher(spr, spr2, checkcollide) {
    var ang =
        Math.round(
            ScratchMod(scr_wrap_angle(spr.lastGroundAngle - 90) + 90, 360) / 90) * 90;
    if (true) {
        spr.gravity =
            moveStepsSpeed(
                Math.abs(spr.speed),
                scr_wrap_angle(spr.lastGroundAngle - 90) + 90)[1] *
            0.6 *
            Math.sign(spr.speed);
        spr.speed =
            moveStepsSpeed(
                spr.speed,
                scr_wrap_angle(spr.lastGroundAngle - 90) + 90)[0] * 1;
    }
}

async function stickToFloor(spr, spr2, checkcollide, forceStick) {
    isActuallyTouchingFloor(spr, spr2, checkcollide);
    if (spr.onfloor && (spr.stickToFloorEnabled || forceStick)) {
        var check = 0;
        var checkamout = Math.abs(spr.speed) + 25;
        var felloff = false;
        while (!checkcollide(spr.x, spr.y, spr2)) {
            markSpritePos(spr, "yellow");
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
            moveSteps(checkamout - 1, spr);
            spr.direction += 90;
            markSpritePos(spr, "cyan");
            isActuallyTouchingFloor(spr, spr2, checkcollide);
        } else {
            spr.direction -= 90;
            moveSteps(0, spr);
            spr.direction += 90;
        }
    } else {
        if (spr.onfloor) {
            var safecheck = 0;
            while (checkcollide(spr.x, spr.y, spr2) && (safecheck < 50)) {
                spr.direction -= 90;
                moveSteps(1, spr);
                spr.direction += 90;

                safecheck += 1;
            }
            spr.direction -= 90;
            moveSteps(-1, spr);
            spr.direction += 90;

            if (!checkcollide(spr.x, spr.y, spr2)) {
                spr.direction -= 90;
                moveSteps(1, spr);
                spr.direction += 90;
                spr.onfloor = false;
                await doPlayerLauncher(spr, spr2, checkcollide);
                return;
            }
        }
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
            fpsMultiplier: 1,
        };
    }
    if (spr.animationData) {
        if (spr.animationData[name]) {
            spr.currentAnimation = name;
            var anim = spr.animationData[name];
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
                    if (frame) {
                        if (spr.spritesheetData) {
                            if (getSpriteByName(spr.spritesheetData, frame)) {
                                spr.imageLocation = getSpriteByName(spr.spritesheetData, frame);
                                spr.width =
                                    spr.imageLocation.width * optionsdata.resizeSpriteScale;
                                spr.height =
                                    spr.imageLocation.height * optionsdata.resizeSpriteScale;
                            } else {
                            }
                        } else {
                        }
                    }
                    animindex +=
                    (optionsdata.fpsMultiplier *
                        spr.animator.fpsMultiplier *
                        anim.fps) /
                    60;
                    await window.tickAsync60FPS();
                }
                await window.tickAsync60FPS();
                if (!anim.loop) {
                    return;
                }
            }
        } else {
            console.warn(
`Attempted to run animation "${name}" but the animationData does not exist.`);
        }
    } else {
        console.warn(
`Attempted to run animation "${name}" but the sprite does not have the animationData propertey.`);
    }
}

window.runAnimation = runAnimation;

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
    spr.maxPeeloutPower = 45;
    while (spr.running) {
        await window.tickAsync();
        if (!spr.inDebug) {
            if (spr.character.abilites.indexOf("peelout") > -1) {
                if (
                    spr.up &&
                    spr.jump &&
                    Math.abs(spr.speed) < 1.5 &&
                    Math.round(spr.direction / 45) * 45 == 90 &&
                    spr.onfloor &&
                    !spr.spindash) {
                    spr.freezemovement = true;
                    spr.peelout = true;
                    soundplay("peelout");
                    spr.peelpower = 0.5;
                    while (spr.up) {
                        if (spr.character.abilites.indexOf("peelout") > -1) {
                            await window.tickAsync();
                            spr.peelpower += 0.5;
                            if (spr.peelpower > spr.speedcap) {
                                spr.peelpower = spr.speedcap;
                            }
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
    }
}
async function doSpindashAttack(spr, spr2, checkcollide, soundplay) {
    spr.freezemovement = false;
    spr.maxSpindashPower = 45;
    var spindashInterval = null;
    while (spr.running) {
        await window.tickAsync();
        if (!spr.inDebug) {
            if (spr.character.abilites.indexOf("spindash") > -1) {
                if (
                    spr.down &&
                    spr.jump &&
                    Math.abs(spr.speed) < 1.5 &&
                    Math.round(spr.direction / 45) * 45 == 90 &&
                    spr.onfloor &&
                    !spr.peelout) {
                    spr.freezemovement = true;
                    spr.spindash = true;
                    spr.spindashpower = 0;
                    spindashInterval = setInterval(() => {
                        spr.spindashpower -= 0.5;
                        if (spr.spindashpower < 5) {
                            spr.spindashpower = 5;
                        }
                    }, 65);
                    while (spr.down) {
                        await window.tickAsync();
                        if (spr.character.abilites.indexOf("spindash") > -1) {
                            if (spr.jump) {
                                soundplay("spindash", ((spr.spindashpower / spr.speedcap) * 1.6) + 1);
                                spr.spindashpower += 5;
                                if (spr.spindashpower > spr.speedcap) {
                                    spr.spindashpower = spr.speedcap;
                                }
                                await waitfor(() => {
                                    return !spr.jump;
                                });
                            }
                        }
                    }
                    if (spindashInterval) {
                        clearInterval(spindashInterval);
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
    }
    if (spindashInterval) {
        clearInterval(spindashInterval);
    }
}
var collisiontestcvs = document.createElement("canvas");
collisiontestcvs.width = 600;
collisiontestcvs.height = 360;
var collisionctx = collisiontestcvs.getContext("2d");
function markSpritePos(spr, color, useSize) {
    collisionctx.fillStyle = color;
    collisionctx.globalAlpha = 0.5;
    var width = 4;
    var height = 4;
    if (useSize) {
        width = spr.width;
        height = spr.height;
    }
    collisionctx.fillRect(spr.x + (600 / 2) - (width / 2), spr.y + (360 / 2) - (height / 2), width, height);
}
window.markSpritePos = markSpritePos;
async function lrcheck(spr, spr2, checkcollide, h, heightOfLRCheck) {
    if (spr.speed > spr.speedcap) {
        spr.speed = spr.speedcap;
        markSpritePos(spr, "orange");
    }
    if (spr.speed < -spr.speedcap) {
        spr.speed = -spr.speedcap;
        markSpritePos(spr, "orange");
    }

    var spd = 0;
    moveSteps(spd, spr);
    doFloorDirectionCheck(spr, spr2, checkcollide);
    var s = 0;
    if (spr.onfloor) {}
    var check = 0;
    var height = 40;
    if (heightOfLRCheck) {
        height = heightOfLRCheck;
    }
    var extend = 20;
    spr.direction -= 90;
    moveSteps(height + s, spr);
    spr.direction += 90;
    moveSteps(extend, spr);
    check = 0;
    moveSteps(1, spr);
    if (checkcollide(spr.x, spr.y, spr2)) {
        if (spr.right) {
            spr.pushing = true;
            markSpritePos(spr, "green");
        }
    }
    var speedPrevious = spr.speed;
    moveSteps(-1, spr);
    if (speedPrevious > 0) {
        if (checkcollide(spr.x, spr.y, spr2)) {
            if (spr.left || spr.right) {
                spr.pushing = true;
            }
            while (checkcollide(spr.x, spr.y, spr2)) {
                markSpritePos(spr, "blue");
                moveSteps(-1, spr);
                check += 1;
                if (check > 300) {
                    break;
                }
            }
            spr.speed = 0;
        } else {}
    }
    moveSteps(-extend, spr);
    moveSteps(-extend, spr);
    check = 0;
    moveSteps(-1, spr);
    if (checkcollide(spr.x, spr.y, spr2)) {
        if (spr.left) {
            spr.pushing = true;
            markSpritePos(spr, "green");
        }
    }
    moveSteps(1, spr);
    if (speedPrevious < 0) {
        if (checkcollide(spr.x, spr.y, spr2)) {
            if (spr.left || spr.right) {
                spr.pushing = true;
            }
            while (checkcollide(spr.x, spr.y, spr2)) {
                markSpritePos(spr, "blue");
                moveSteps(1, spr);
                check += 1;
                if (check > 300) {
                    break;
                }
            }
            spr.speed = 0;
        } else {}
    }
    moveSteps(extend, spr);
    spr.direction -= 90;
    moveSteps(-height - s, spr);
    spr.direction += 90;
    moveSteps(spd * -1, spr);
}
async function topCheckThing(spr, spr2, checkcollide, extraChecks) {
    if (extraChecks) {
        var h = 14;
        while (h < 44) {
            spr.direction -= 90;
            moveSteps(h, spr);
            spr.direction += 90;
            check = 0;
            markSpritePos(spr, "yellow");
            if (spr.checkCollideBoth(spr.x, spr.y, spr2)) {
                markSpritePos(spr, "green");
                while (spr.checkCollideBoth(spr.x, spr.y, spr2)) {
                    spr.direction -= 90;
                    moveSteps(-1, spr);
                    spr.direction += 90;
                    check += 1;
                    if (check > 300) {
                        break;
                    }
                }
                spr.gravity = 0;
            } else {}
            spr.direction -= 90;
            moveSteps(-h, spr);
            spr.direction += 90;
            h += 1;
        }
    } else {
        spr.direction -= 90;
        moveSteps(44, spr);
        spr.direction += 90;
        check = 0;
        markSpritePos(spr, "yellow");
        if (spr.checkCollideBoth(spr.x, spr.y, spr2)) {
            markSpritePos(spr, "green");
            while (spr.checkCollideBoth(spr.x, spr.y, spr2)) {
                spr.direction -= 90;
                moveSteps(-1, spr);
                spr.direction += 90;
                check += 1;
                if (check > 300) {
                    break;
                }
            }
            spr.gravity = 0;
        } else {}
        spr.direction -= 90;
        moveSteps(-44, spr);
        spr.direction += 90;
    }
}
async function doFloorDirectionCheck(spr, spr2, checkcollide, sprspeed) {
    if (!spr.onfloor) {
        spr.direction = 90;
    } else {
        spr.angleDir = getAngleFromCollision(spr, spr2, checkcollide, sprspeed);
        spr.direction = spr.angleDir;
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
        if (!spr.inDebug) {
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
                    await window.waitAsync(8.5);
                    spr.htimeout = false;
                    spr.hurt = false;
                    spr.trs = 1;
                } else {
                    spr.dead = true;
                }
            }
        }
    }
}
window.debugObjects = [
    "Ring",
    "Level exit",
    "Ring Monitor",
    "Eggman Monitor",
    "Switch layer to 1",
    "Switch layer to 2",
    "Spring",
    "Motobug",
];
async function changeSpriteStyle(s, isCreatingTile) {
    if (true) {
        var monitorTypes = {
            "Ring Monitor": {
                type: "ring",
                spriteLocation: {
                    x: 28,
                    y: 97,
                    width: 56,
                    height: 64,
                },
            },
            "Eggman Monitor": {
                type: "eggman",
                spriteLocation: {
                    x: 425,
                    y: 0,
                    width: 56,
                    height: 64,
                },
            },
        };
        if (s.sid == "Motobug") {
            s.stype = "motobug";
        }
        if (s.sid == "Switch layer to 1") {
            s.stype = "s1";
            s.width = 36;
            s.color = "red";
            s.type = "square";
            s.height = 36;
        }
        if (s.sid == "Switch layer to 2") {
            s.stype = "s2";
            s.width = 36;
            s.type = "square";
            s.color = "blue";
            s.height = 36;
        }
        if (s.sid == "Level exit") {
            s.stype = "sign";
            s.scale = 1;
            s.image =
                window.files.signposts[
                    window.gvbsonicCharacters[window.gvbsonicSelectedChar].signpostid
                ];
            s.width = s.image.width;
            s.height = s.image.height;
        }
        if (s.sid == "Spring") {
            s.width = 28;
            s.height = 16;
            s.stype = "springRed";
            s.imageLocation = {
                x: 132,
                y: 0,
                width: 28,
                height: 16,
            };
        }
        if (monitorTypes[s.sid]) {
            s.scale = 0.5;
            s.stype = "monitor-" + monitorTypes[s.sid].type;
            s.imageLocation = monitorTypes[s.sid].spriteLocation;
            s.width = 56;
            s.height = 64;
        }
        if (s.sid == "Ring") {
            s.stype = "ring";
            s.imageLocation = {
                x: 0,
                y: 0,
                width: 16,
                height: 16,
            };
            s.width = 16;
            s.height = 16;
        }
        if (isCreatingTile) {}
    }
}
async function doFlight(spr, spr2, checkcollide, soundplay) {
    spr.freezemovement = false;
    spr.flightPower = 3;
    spr.flying = false;
    spr.maxFlightPresses = 17; //so you can press the jump button that many times before tails gets "tired".
    spr.flightPresses = 0;
    spr.wantsToFly = true;
    var checkfly = false;
    function getFlightCheckThingy(val) {
        if (val) {
            return true;
        }
        if (spr.onfloor) {
            return true;
        }
        if (!spr.character.abilites.indexOf("flight")) {
            return true;
        }
        if (spr.hurtanim) {
            return true;
        }
        if (spr.flightTimerGone) {
            return true;
        }
        if (!spr.running) {
            return true;
        }
        if (!spr.wantsToFly) {
            return true;
        }
    }
    function getTiredCheckThingy() {
        if (spr.onfloor) {
            return true;
        }
        if (!spr.character.abilites.indexOf("flight")) {
            return true;
        }
        if (spr.hurtanim) {
            return true;
        }
        if (!spr.running) {
            return true;
        }
        if (!spr.wantsToFly) {
            return true;
        }
    }
    spr.flightTimerGone = false;
    spr.tired = false;
    while (spr.running) {
        await window.tickAsync();
        soundplay("end-flying");
        soundplay("end-tired");
        if (!spr.inDebug) {
            if (spr.character.abilites.indexOf("flight") > -1) {
                if (spr.maxFlightPresses) {
                    if (spr.onfloor) {
                        checkfly = true;
                        spr.flightTimerGone = false;
                        spr.tired = false;
                    } else {
                        if (spr.jumping && spr.jump) {
                            await waitfor(() => {
                                return !spr.jump;
                            });
                            await waitfor(() => {
                                return spr.jump;
                            });
                            if (!getFlightCheckThingy(false)) {
                                var timerGone = false;
                                var timeout = setTimeout(() => {
                                    spr.flightTimerGone = true;
                                    timerGone = true;
                                }, 5000); //1000 ms is the same as 1 second.
                                if (!spr.onfloor) {
                                    //means that if we are NOT on the floor.
                                    spr.jumping = false;
                                    soundplay("start-flying"); //this will start the flying sound, as its configured to loop when this is called.
                                    spr.flightPresses = 0;
                                    spr.flying = true;
                                    spr.gravity = spr.gravity / 3;
                                    while (
                                        spr.flying &&
                                        spr.character.abilites.indexOf("flight") > -1 &&
                                        !spr.onfloor) {
                                        if (!getFlightCheckThingy(false)) {
                                            //we can handle it and prevent the character from breaking.
                                            if (spr.flightPresses < spr.maxFlightPresses) {
                                                spr.gravity += 1.25;
                                                await waitfor(() => {
                                                    return getFlightCheckThingy(!spr.jump);
                                                });
                                                await waitfor(() => {
                                                    return getFlightCheckThingy(spr.jump);
                                                });
                                            } else {
                                                break;
                                            }
                                        } else {
                                            break;
                                        }
                                    }

                                    clearTimeout(timeout);
                                    soundplay("end-flying"); //this will end the flying sound effect.
                                    if (timerGone) {
                                        spr.tired = true;
                                        soundplay("tired");
                                        await waitfor(() => {
                                            return getTiredCheckThingy(spr.onfloor);
                                        });
                                        soundplay("end-tired");
                                        spr.tired = false;
                                    }
                                    spr.flying = false;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
function scr_wrap_angle(argument0) {
    /* Wrap the Angle */
    var temp;
    temp = argument0;
    while (temp < 0.0)
        temp += 360;
    while (temp >= 360.0)
        temp -= 360;
    return temp;
}
function scr_player_rotate_toward(argument0, argument1, argument2) {
    var angle_difference;
    angle_difference = argument0 - argument1;

    // -------------------------------------------------------------------------------------
    if (angle_difference == 0)
        return argument0;

    if (Math.abs(angle_difference) < 180) {
        if (angle_difference < 0) {
            argument1 -= argument2;
            if (argument1 <= argument0)
                argument1 = argument0;
        } else {
            argument1 += argument2;
            if (argument1 >= argument0)
                argument1 = argument0;
        }
    } else {
        if (angle_difference < 0)
            argument1 += argument2;
        else
            argument1 -= argument2;
    }
    return scr_wrap_angle(argument1);
}
async function resetEngineValues(
    spr,
    spr2,
    sprites,
    doscroll,
    scrollpos,
    checkcollide,
    soundplay,
    characterdata,
    checkobjectcollide) {
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
    spr.angleDir = 90;
    if (doscroll) {
        spr2.x = scrollpos[0];
        spr2.y = scrollpos[1];
        spr.doscroll = true;
    }
	
    spr.worldx = scrollpos[0];
	spr.worldy = scrollpos[1];
	
	spr.x = spr2.x + spr.worldx;
    spr.y = spr2.y + spr.worldy;
	
    spr.running = true;
    spr.rings = 0;
    spr.xVelocity = 0;
    spr.speedcap = 27;
    spr.yVelocity = 0;
    spr.scrollLimit = true;
    spr.inDebug = false;
    spr.fps = 60;
    spr.dead = false;
    spr.canscroll = true;
    spr.hurt = false;
    spr.skidding = false;
    spr.onframeupdate = function () {};
    doSpindashAttack(spr, spr2, checkcollide, soundplay);
    doPeeloutAttack(spr, spr2, checkcollide, soundplay);
    doHurtScript(spr, spr2);
    doFlight(spr, spr2, checkcollide, soundplay);
    spr.engineOffset = -21;
    spr.spring = false;
    spr.debugObjectIndex = 0;
    spr.debugYVelocity = 0;
    spr.switchDebug = false;
    spr.debugXVelocity = 0;

    spr.controlLockTimer = 1;

    spr.character = characterdata;

    spr.flightPower = 0.1;

    //jumping power, how much to increase the velocity.
    spr.jumppower = 7.5;
    //the actual gravity, how strong you want gravity to be.
    spr.gravityPower = 0.21875;
    //uncomment this to make jumping power more accurate.
    //spr.jumppower = 6.5;

    //camrea offsets.

    spr.camX = 0;
    spr.camY = 0;

    //timers for when you crouch and lookup.
    //when the time is up, the camrea pans to the direction it needs to.

    spr.crouchTimer = 0;
    spr.lookupTimer = 0;

    //pause thingy idk.

    spr.paused = false;

    //animation data.

    spr.animator = {
        fpsMultiplier: 1,
    };

    //empty out the death animation values.

    spr.deathgravity = null;
    spr.deathAnimationPlayed = null;

    //try to stop all flight sounds.

    soundplay("end-tired");
    soundplay("end-flying");

    //this is for the ai, to know if we are an engine type of sprite, or not.

    spr.isEngineSprite = true;

    //used for the "flying in air" effect when you run from the side of a slope.

    spr.lastGroundAngle = 90;

    //Used to get if the engine is on the floor, or on a collidible object.

    spr.checkCollideBoth = function (x, y, sprthing) {
        var objectCollide = checkobjectcollide(x, y, sprthing);
        var levelCollide = checkcollide(x, y, sprthing);
        if (objectCollide) {
            return true;
        }
        if (levelCollide) {
            return true;
        }
        return false;
    };
}
async function fixSprSpeed(spr) {
    //Basicly just remove some unessasary decimals from the speed variable
    spr.speed = Math.round(spr.speed * 1000) / 1000;

    spr.gravity = Math.round(spr.gravity * 1000) / 1000;
}
async function movementEngine(
    spr,
    spr2,
    sprites,
    doscroll,
    scrollpos,
    checkcollide,
    soundplay,
    characterdata,
    checkobjectcollide) {
    await resetEngineValues(
        spr,
        spr2,
        sprites,
        doscroll,
        scrollpos,
        checkcollide,
        soundplay,
        characterdata,
        checkobjectcollide);
    spr.resetData = async function () {
        await resetEngineValues(
            spr,
            spr2,
            sprites,
            doscroll,
            scrollpos,
            checkcollide,
            soundplay,
            characterdata,
            checkobjectcollide);
    };
    spr.runtimei = setInterval(async() => {
		if (spr.onbeforedraw) {
			spr.onbeforedraw();
		}
        if (!spr.paused) {
            if (!spr.inDebug) {
                spr.type = "norm";
                spr.image = spr.charaterImage;
                spr.scale = spr.characterScale;
                spr.characterScale = spr.character.scale;
                spr.charaterImage = spr.character.image;
                spr.spritesheetData = spr.character.spritesheet;
                spr.animationData = spr.character.animations;
                if (true) {
                    if (!spr.dead) {
                        if (spr.spindash) {
                            spr.engineOffset = -12; //hight during spindash attack
							if (spr.character.spindashOffset) {
								spr.engineOffset = spr.character.spindashOffset;
							}
                        } else {
                            if (spr.rolling) {
                                spr.engineOffset = -19; //height during rolling
								if (spr.character.rollOffset) {
									spr.engineOffset = spr.character.rollOffset;
								}
                            } else {
                                spr.engineOffset = -19; //normal height
								if (spr.character.normalOffset) {
									spr.engineOffset = spr.character.normalOffset;
								}
                            }
                        }
                        if (!spr.onfloor) {
                            spr.rolling = false;
                        }
                        if (spr.onfloor) {
                            spr.lastGroundAngle = spr.engineAngle;
                        }

                        var check = 0;
                        spr._worldx = spr.x;
                        spr._worldy = spr.y;
                        spr.direction = spr.engineAngle;
                        spr.direction -= 90;
                        moveSteps(spr.engineOffset, spr);
                        spr.direction += 90;
                        spr.animator.fpsMultiplier = 1;
                        if (
                            !spr.freezemovement &&
                            spr.onfloor &&
                            spr.down &&
                            Math.abs(spr.speed) > 3) {
                            if (spr.character.abilites.indexOf("roll") > -1) {
                                if (!spr.rolling) {
                                    soundplay("roll");
                                }
                                spr.rolling = true;
                            }
                        }
                        if (Math.abs(spr.speed) < 1.5) {
                            spr.rolling = false;
                        }
                        if (spr.tired) {
                            if (!(spr.currentAnimation == "fly-tired")) {
                                runAnimation(spr, "fly-tired");
                            }
                            spr.crouchTimer = 0;
                            spr.lookupTimer = 0;
                            spr.animator.fpsMultiplier = 1;
                        } else {
                            if (spr.flying) {
                                if (!(spr.currentAnimation == "fly")) {
                                    runAnimation(spr, "fly");
                                }
                                spr.crouchTimer = 0;
                                spr.lookupTimer = 0;
                                spr.animator.fpsMultiplier = 1;
                            } else {
                                if (spr.hurtanim) {
                                    if (!(spr.currentAnimation == "hurt")) {
                                        runAnimation(spr, "hurt");
                                    }
                                    spr.crouchTimer = 0;
                                    spr.lookupTimer = 0;
                                    spr.animator.fpsMultiplier = 1;
                                } else {
                                    if (spr.spring) {
                                        if (!(spr.currentAnimation == "spring")) {
                                            runAnimation(spr, "spring");
                                        }
                                        spr.crouchTimer = 0;
                                        spr.lookupTimer = 0;
                                    } else {
                                        if (spr.skidding) {
                                            if (!(spr.currentAnimation == "skid")) {
                                                runAnimation(spr, "skid");
                                            }
                                            spr.crouchTimer = 0;
                                            spr.lookupTimer = 0;
                                            soundplay("skid");
                                        } else {
                                            if (spr.spindash) {
                                                if (!(spr.currentAnimation == "spindash")) {
                                                    runAnimation(spr, "spindash");
                                                }
                                                spr.crouchTimer = 0;
                                                spr.lookupTimer = 0;
                                                spr.animator.fpsMultiplier = 1;
                                            } else {
                                                if (spr.jumping || spr.rolling) {
                                                    if (!(spr.currentAnimation == "roll")) {
                                                        runAnimation(spr, "roll");
                                                    }
                                                    spr.crouchTimer = 0;
                                                    spr.lookupTimer = 0;
                                                    spr.animator.fpsMultiplier = 1;
                                                } else {
                                                    if (Math.abs(spr.savespeed) > 0.5) {
                                                        spr.crouchTimer = 0;
                                                        spr.lookupTimer = 0;
                                                        if (Math.abs(spr.savespeed * 5) > 73) {
                                                            if (!(spr.currentAnimation == "runfastest")) {
                                                                runAnimation(spr, "runfastest");
                                                            }
                                                            spr.animator.fpsMultiplier = 1;
                                                        } else {
                                                            if (Math.abs(spr.savespeed * 1) > 8) {
                                                                if (!(spr.currentAnimation == "run")) {
                                                                    runAnimation(spr, "run");
                                                                }
                                                                spr.animator.fpsMultiplier = 1;
                                                            } else {
                                                                if (Math.abs(spr.savespeed * 1) > 5) {
                                                                    if (!(spr.currentAnimation == "jog")) {
                                                                        runAnimation(spr, "jog");
                                                                    }
                                                                    spr.animator.fpsMultiplier =
                                                                        Math.abs(spr.savespeed) / 7.4;
                                                                } else {
                                                                    if (!(spr.currentAnimation == "walk")) {
                                                                        runAnimation(spr, "walk");
                                                                    }
                                                                    spr.animator.fpsMultiplier =
                                                                        Math.abs(spr.savespeed) / 7.4;
                                                                }
                                                            }
                                                        }
                                                    } else {
                                                        if (spr.pushing) {
                                                            if (!(spr.currentAnimation == "push")) {
                                                                runAnimation(spr, "push");
                                                            }
                                                            spr.crouchTimer = 0;
                                                            spr.lookupTimer = 0;
                                                            spr.animator.fpsMultiplier = 1;
                                                        } else {
                                                            if (spr.up) {
                                                                if (!(spr.currentAnimation == "lookup")) {
                                                                    runAnimation(spr, "lookup");
                                                                }
                                                                spr.animator.fpsMultiplier = 1;
                                                                spr.speed = 0;
                                                                spr.crouchTimer = 0;
                                                                spr.lookupTimer += 1;
                                                                if (spr.lookupTimer > 150) {
                                                                    spr.camY += (150 - spr.camY) / 15;
                                                                } else {
                                                                    spr.camY += (0 - spr.camY) / 15;
                                                                }
                                                            } else {
                                                                if (spr.down) {
                                                                    if (!(spr.currentAnimation == "duck")) {
                                                                        runAnimation(spr, "duck");
                                                                    }
                                                                    spr.animator.fpsMultiplier = 1;
                                                                    spr.speed = 0;
                                                                    spr.crouchTimer += 1;
                                                                    spr.lookupTimer = 0;
                                                                    if (spr.crouchTimer > 150) {
                                                                        spr.camY += (-150 - spr.camY) / 15;
                                                                    } else {
                                                                        spr.camY += (0 - spr.camY) / 15;
                                                                    }
                                                                } else {
                                                                    if (!(spr.currentAnimation == "stand")) {
                                                                        runAnimation(spr, "stand");
                                                                    }
                                                                    spr.crouchTimer = 0;
                                                                    spr.lookupTimer = 0;
                                                                    spr.animator.fpsMultiplier = 1;
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
                        }
                        if (!(spr.lookupTimer > 0 || spr.crouchTimer > 0)) {
                            spr.camY += (0 - spr.camY) / 15;
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
                            if (spr.controlLockTimer == 0) {
                                if (!spr.hurtanim) {
                                    if (spr.left && !spr.freezemovement) {
                                        spr.speed -= 0.02;
                                        spr.flipX = true;
                                    }
                                    if (spr.right && !spr.freezemovement) {
                                        spr.speed += 0.02;
                                        spr.flipX = false;
                                    }
                                }
                            }
                            spr.speed += spr.speed / -130;
                        } else {
                            if (spr.controlLockTimer == 0) {
                                if (!spr.hurtanim) {
                                    var movementCheck = true;
									//TODO: Simplify this.
                                    if ((!spr.onfloor) && (spr.gravity > 0) && (!spr.jumping) && (!spr.spring) && (!spr.flying)) {
                                        movementCheck = false;
                                    }
                                    if (movementCheck) {
                                        if (spr.left && !spr.freezemovement) {
                                            if (
                                                spr.flying ||
                                                spr.spring ||
                                                spr.onfloor ||
                                                spr.gravity < 0 ||
                                                spr.jumping) {
                                                if (Math.round(Math.abs(spr.speed)) < 0.5) {
                                                    spr.speed -= 0.1;
                                                }
                                                spr.speed -= 0.046875;
                                                spr.flipX = true;
                                            }
                                            if (spr.onfloor) {
                                                if (spr.speed > 0.5) {
                                                    if (Math.abs(spr.speed) > 4) {
                                                        spr.skidding = true;
                                                        spr.flipX = false;
                                                    }
                                                    spr.speed -= 0.1;
                                                }
                                            }
                                            if (spr.right) {
                                                if (Math.abs(spr.speed) < 1) {
                                                    spr.speed += 0.3;
                                                }
                                            } else {
                                                if (Math.abs(spr.speed) < 1) {
                                                    spr.speed -= 0.3;
                                                }
                                            }
                                        }
                                        if (spr.right && !spr.freezemovement) {
                                            if (
                                                spr.flying ||
                                                spr.spring ||
                                                spr.onfloor ||
                                                spr.gravity < 0 ||
                                                spr.jumping) {
                                                if (Math.round(Math.abs(spr.speed)) < 0.5) {
                                                    spr.speed += 0.1;
                                                }
                                                spr.speed += 0.046875;
                                                spr.flipX = false;
                                            }
                                            if (spr.onfloor) {
                                                if (spr.speed < -0.5) {
                                                    if (Math.abs(spr.speed) > 4) {
                                                        spr.skidding = true;
                                                        spr.flipX = true;
                                                    }
                                                    spr.speed += 0.1;
                                                }
                                            }
                                            if (spr.right) {
                                                if (Math.abs(spr.speed) < 1) {
                                                    spr.speed += 0.3;
                                                }
                                            } else {
                                                if (Math.abs(spr.speed) < 1) {
                                                    spr.speed -= 0.3;
                                                }
                                            }
                                        }
                                    }

                                }
                            }
                            if (!(spr.left || spr.right)) {
								spr.speed += spr.speed / -28;
                                if (spr.onfloor) {
									if (Math.round(spr.engineAngle) == 90) {
										if (Math.abs(spr.speed) < 1) {
											if ((Math.round(spr.engineAngle / 90) * 90) == 90) {
												spr.speed = (spr.engineAngle - 90) / 35;
											}
										}
									} else {
										if ((Math.round(spr.engineAngle / 90) * 90) == 90) {
											if ((Math.round(spr.engineAngle / 45) * 45) == 45) {
												spr.speed -= 0.3;
											}
											if ((Math.round(spr.engineAngle / 45) * 45) == 135) {
												spr.speed += 0.3;
											}
										}
									}
                                } else {
                                    if (Math.abs(spr.speed) < 1) {
                                        spr.speed = 0;
                                    }
                                }
                            } else {
                                if (Math.abs(spr.speed) > 9.5) {
                                    spr.speed += spr.speed / -80;
                                }
                            }
                        }
                        if (
                            !spr.hurtanim &&
                            spr.onfloor &&
                            spr.jump &&
                            !spr.freezemovement) {
                            soundplay("jump");

                            spr.direction -= 90;
                            moveSteps(spr.speedcap / 2, spr);
                            spr.direction += 90;

                            spr.direction = 90;
                            spr.engineAngle = 90;

                            spr.gravity = moveStepsSpeed(spr.jumppower, spr.direction - 90)[1];
							spr.speed += moveStepsSpeed(spr.jumppower, spr.direction - 90)[0];

                            spr.onfloor = false;
                            spr.grounded = false;
                            spr.jumping = true;
                            spr.rolling = false;

                            topCheckThing(spr, spr2, checkcollide, true);
                        }
                        //spr.speed += (spr.direction - 90) / 3000;
                        if (spr.speed > spr.speedcap) {
                            spr.speed = spr.speedcap;
                        }
                        if (spr.speed < -spr.speedcap) {
                            spr.speed = -spr.speedcap;
                        }
                        fixSprSpeed(spr);
                        moveSteps(Math.round(spr.speed / 1) * 1, spr, spr.checkCollideBoth);
                        fixSprSpeed(spr);
                        lrcheck(spr, spr2, checkcollide, 50, 40);
                        fixSprSpeed(spr);
                        lrcheck(spr, spr2, checkobjectcollide, 50, 30);
                        fixSprSpeed(spr);
                        fixSprSpeed(spr);
                        if (spr.flying) {
                            spr.gravity +=  - (spr.gravityPower / 2.2);
                        } else {
                            spr.gravity += -spr.gravityPower;
                        }
                        spr.direction -= 90;
                        moveSteps(Math.round(spr.gravity), spr);
                        spr.direction += 90;
                        await stickToFloor(spr, spr2, spr.checkCollideBoth);
                        await stickToFloor(spr, spr2, spr.checkCollideBoth);
                        check = 0;
                        fixSprSpeed(spr);
                        if (spr.checkCollideBoth(spr.x, spr.y, spr2)) {
                            while (spr.checkCollideBoth(spr.x, spr.y, spr2)) {
                                spr.direction -= 90;
                                moveSteps(1, spr);
                                spr.direction += 90;
                                check += 1;
                                if (check > 300) {
                                    break;
                                }
                            }
                            if (spr.gravity < 0) {
                                if (!spr.onfloor) {
                                    spr.onfloor = true;
                                    await stickToFloor(spr, spr2, spr.checkCollideBoth, true);
                                    doFloorDirectionCheck(spr, spr2, checkcollide, true);
                                    var ang = Math.round(spr.direction / 45) * 45;
                                    if (!(Math.round(ang / 30) * 30 == 90)) {
                                        spr.speed +=
                                        ((fixDirAngle(ang) - 90) / 30) * Math.abs(spr.gravity);
                                    }
                                } else {
                                    spr.onfloor = true;
                                }
                            }
                            spr.gravity = 0;
                        } else {
                            spr.onfloor = false;
                        }

                        topCheckThing(spr, spr2, checkcollide);

                        doFloorDirectionCheck(spr, spr2, checkcollide);
                        lrcheck(spr, spr2, checkcollide, 50);
                        var s =
                            Math.round(fixDirAngle(scr_wrap_angle(spr.direction), 361) / 90) *
                            90;
                        var s2 =
                            Math.round(fixDirAngle(scr_wrap_angle(spr.direction), 361) / 45) *
                            45;
                        spr.direction -= 90;
                        moveSteps(0, spr);
                        spr.direction += 90;
                        spr.direction -= 90;
                        moveSteps(-spr.engineOffset, spr);
                        spr.direction += 90;
                        /*if (
                        Math.abs(spr.speed) < 0.2 &&
                        (s == 270 ||
                        s == -90 ||
                        s == 0 ||
                        s == 180 ||
                        s == -180 ||
                        s == 360) &&
                        spr.onfloor) {
                        spr.direction -= 90;
                        moveSteps(2, spr);
                        spr.direction += 90;
                        spr.direction = 90;
                        spr.onfloor = false;
                        spr.speed = 0;
                        }*/
                        if (s2 == 45) {
                            spr.speed -= 0.07;
                        }
                        if (s2 == 135) {
                            spr.speed += 0.07;
                        }
                        if (s2 == 180) {
                            spr.speed += 0.2;
                        }
                        if (s2 == 0) {
                            spr.speed -= 0.2;
                        }

                        var realAngle = scr_wrap_angle(spr.engineAngle - 90);
                        function sin(number) {
                            return Math.sin(number * (Math.PI / 180));
                        }
                        if (realAngle >= 135 && realAngle <= 225) {}
                        else {
                            if (spr.rolling) {
                                if (
                                    Math.sign(spr.speed) ==
                                    Math.sign(Math.sin(spr.engineAngle - 90))) {
                                    spr.speed += 0.078125 * sin(spr.engineAngle - 90);
                                } else {
                                    spr.speed += 0.3125 * sin(spr.engineAngle - 90);
                                }
                            } else {
                                //spr.speed += (0.125 * sin(spr.engineAngle - 90)) / 2;
                            }
                        }

                        ////////////////////////////////////////////////////////////////

                        var x = spr.direction - 90;

                        // Code used https://info.sonicretro.org/Sonic_Physics_Guide without permission,
                        // modified to work in javascript.
                        // Is player grounded?
                        if (spr.onfloor) {
                            if (spr.controlLockTimer == 0) {
                                // Should player slip and fall?
                                if (
                                    Math.abs(spr.speed) < 2.5 &&
                                    x >= 35 &&
                                    x <= 326 &&
                                    x >= 69 &&
                                    x <= 293) {
                                    // Detach (fall)
                                    spr.onfloor = false;

                                    // Lock controls (slip)
                                    spr.speed = 0;

                                    spr.controlLockTimer = 30;

                                    /////////////////////////////////////////////////////////////

                                    //This part is by me.

                                    //Adding this in to make the engine not glitch
                                    spr.direction -= 90;
                                    //moveSteps(spr.speedcap / 3, spr);
                                    spr.direction += 90;

                                    spr.direction = 90;
                                    spr.engineAngle = 90;
									
									topCheckThing(spr, spr2, checkcollide, true);

                                    //This is less accurate, but it comes with a cost,
                                    //this fixes a weird issue where if the player spindashes, peelouts,
                                    //or runs into a wall on the left side, the players character loses control.

                                    //I'm just decreasing this to 5 frames, cause idk if it can be used for 0 frames.

                                    spr.controlLockTimer = 5;

                                    /////////////////////////////////////////////////////////////
                                }
                            } else {
                                // Tick down timer
                                spr.controlLockTimer -= 1;
                            }
                        }

                        //////////////////////////////////////////////////////////////////

                        spr.engineAngle = scr_wrap_angle(spr.direction, 361);
                        s = Math.round(scr_wrap_angle(spr.engineAngle, 361) / 90) * 90;
                        var ang = spr.engineAngle;
                        if (false) {
                            if (spr.onfloor) {
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
                                        (0 > spr.smoothrot && 0 > ang)) {
                                        spr.smoothrot +=
                                        (Math.round(ang / 20) * 20 - spr.smoothrot) * (0.65 / 2);
                                    } else {
                                        spr.smoothrot = Math.round(ang);
                                    }
                                }
                            } else {
                                if (true) {
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
                        } else {
                            var fakeAngle = ang;
                            fakeAngle -= 90;
                            var fakeSmoothRot = spr.smoothrot;
                            fakeSmoothRot -= 90;
                            if (Math.abs(spr.speed) > 12) {
                                //Make sure we catch up with the character's real angle.
                                spr.smoothrot =
                                    scr_player_rotate_toward(
                                        scr_wrap_angle(fakeAngle),
                                        scr_wrap_angle(fakeSmoothRot),
                                        10) + 90;
                            } else {
                                spr.smoothrot =
                                    scr_player_rotate_toward(
                                        scr_wrap_angle(fakeAngle),
                                        scr_wrap_angle(fakeSmoothRot),
                                        5) + 90;
                            }
                        }
                        if (spr.onfloor) {}
                        if (!spr.character.smoothAngles) {
                            spr.smoothrot = ang;
                        }
                        if (spr.spindash || spr.rolling || spr.jumping) {
                            spr.smoothrot = 90;
                        }
                        if (spr.onfloor) {
                            if (Math.abs(spr.speed) < 1) {
                                spr.smoothrot = 90;
                            }
                        }
                        spr.direction =
                            Math.round(
                                scr_wrap_angle(Math.round(spr.smoothrot), 361) /
                                spr.character.angle) * spr.character.angle;
                        var angleRound = 22.5;
                        if (
                            Math.round(
                                fixDirAngle(Math.round(spr.direction), 361) / angleRound) *
                            angleRound ==
                            0) {
                            spr.direction = 0;
                        }
                        if (
                            Math.round(
                                fixDirAngle(Math.round(spr.direction), 361) / angleRound) *
                            angleRound ==
                            90) {
                            spr.direction = 90;
                        }
                        if (
                            Math.round(
                                fixDirAngle(Math.round(spr.direction), 361) / angleRound) *
                            angleRound ==
                            180) {
                            spr.direction = 180;
                        }
                        if (
                            Math.round(
                                fixDirAngle(Math.round(spr.direction), 361) / angleRound) *
                            angleRound ==
                            -90) {
                            spr.direction = -90;
                        }
                        if (spr.doscroll) {
                            spr.worldx = spr.x - spr2.x;
                            spr.worldy = spr.y - spr2.y;
                        }
                        spr.xVelocity = (spr._worldx - spr.x) * -1;
                        spr.yVelocity = (spr._worldy - spr.y) * -1;
                        if (!spr.doscroll) {
                            spr.worldx += spr.xVelocity;
                            spr.worldy += spr.yVelocity;
                        }
                        if (spr.doscroll && spr.canscroll) {
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
                            if (!levelinfo.disableYLock) {
                                if (spr2.y < 0) {
                                    spr2.y = 0;
                                }
                            }
                            spr.x = spr2.x + spr.worldx;
                            spr.y = spr2.y + spr.worldy;
                        }
                    } else {
                        if (!spr.deathgravity) {
                            spr.deathgravity = 10;
                        }
                        if (!spr.firedeath) {
                            spr.firedeath = true;
                            if (spr.ondeath) {
                                spr.ondeath();
                            }
                        }
                        if (!(spr.currentAnimation == "died")) {
                            runAnimation(spr, "died");
                        }
                        spr.flipX = false;
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
                    fixSprSpeed(spr);
                    spr.onframeupdate(spr2.x, spr2.y);
                }
            } else {
                spr._worldx = spr.x;
                spr._worldy = spr.y;
                spr.flipX = false;
                spr.speed = 0;
                spr.rolling = false;
                spr.hurt = false;
                spr.deathgravity = null;
                spr.firedeath = null;
                spr.spindashing = false;
                spr.peelout = false;
                spr.gravity = 0;
                spr.engineAngle = 90;
                spr.smoothrot = 90;
                spr.scale = 1;
                spr.currentAnimation = null;
                spr.imageLocation = null;
                spr.dead = false;
                spr.jumping = false;
                var objid = window.debugObjects[spr.debugObjectIndex];
                if (spr.switchDebug) {
                    if (!spr.debugSwitchButton) {
                        spr.debugSwitchButton = true;
                        spr.debugObjectIndex += 1;
                        if (!window.debugObjects[spr.debugObjectIndex]) {
                            spr.debugObjectIndex = 0;
                        }
                    }
                } else {
                    spr.debugSwitchButton = false;
                }
                if (spr.jump) {
                    if (!spr.placeDebug) {
                        spr.placeDebug = true;
                        var levelspr = new window.GRender.Sprite(
                                0,
                                0,
                                window.files.tiles[objid],
                                128,
                                128);
                        levelspr.image = window.files.tiles[objid];
                        levelspr.sid = objid;
                        levelspr.layer = 0;
                        levelspr.scale = 1;
                        levelspr.isDebugModeCreated = true;
                        levelspr.type = "norm";
                        levelspr.sx = spr.x - spr2.x;
                        levelspr.sy = spr.y - spr2.y;
                        levelspr.stype = spr.stype;
                        window.files.level.push(levelspr);
                    }
                } else {
                    spr.placeDebug = false;
                }
                spr.x += spr.debugXVelocity;
                spr.y += spr.debugYVelocity;
                spr.direction = 90;
                if (spr.down) {
                    spr.debugYVelocity += 0.3;
                } else {
                    if (spr.up) {
                        spr.debugYVelocity -= 0.3;
                    } else {
                        spr.debugYVelocity = 0;
                    }
                }
                if (spr.left) {
                    spr.debugXVelocity -= 0.3;
                } else {
                    if (spr.right) {
                        spr.debugXVelocity += 0.3;
                    } else {
                        spr.debugXVelocity = 0;
                    }
                }
                spr.image = window.files.tiles[objid];
                if (spr.image) {
                    spr.width = spr.image.width;
                    spr.height = spr.image.height;
                }
                spr.sid = objid;
                spr.type = "norm";
                spr.sx = spr.x - spr2.x;
                spr.sy = spr.y - spr2.y;
                changeSpriteStyle(spr, false);
                if (spr.doscroll) {
                    spr.worldx = spr.x - spr2.x;
                    spr.worldy = spr.y - spr2.y;
                }
                spr.xVelocity = (spr._worldx - spr.x) * -1;
                spr.yVelocity = (spr._worldy - spr.y) * -1;
                if (!spr.doscroll) {
                    spr.worldx += spr.xVelocity;
                    spr.worldy += spr.yVelocity;
                }
                if (spr.doscroll && spr.canscroll) {
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
                    if (!levelinfo.disableYLock) {
                        if (spr2.y < 0) {
                            spr2.y = 0;
                        }
                    }
                    spr.x = spr2.x + spr.worldx;
                    spr.y = spr2.y + spr.worldy;
                } else {}
            }
        }
        if (spr.onredraw) {
            spr.onredraw();
        }

        gvbsonic.events.emit("enginetick", spr, spr2, checkcollide);
    }, 1000 / 60);
    spr.stopped = false;
    spr.stop = async function () {
        soundplay("end-tired");
        soundplay("end-flying");
        if (!spr.stopped) {
            clearInterval(this.runtimei);
            spr.running = false;
            await window.waitAsync(0.3);
            if (spr.onstop) {
                spr.onstop();
            }
        }
    };
}
function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    animate();
}
function animate() {
    requestAnimationFrame(animate);
    now = Date.now();
    elapsed = now - then;
    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
    }
}
var sonic2 = null;
var layer = 1;
window.rings = 0;
window.overEngineSprites = [];
window.startEngine = async function startEngine(
    levelmus,
    exitedlevel,
    tails,
    bgdata,
    musicLoopTime,
    lvlTitle,
    lvlMusicID,
	spawnpoint) {
    setTitleInfo(lvlTitle);
    var dontExitTwoTimes = false;
    window.bgSprites = await createBGSprites(bgdata);
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
    var mus = null;
    function playmusic() {
        mus = new window.AudioApiReplacement(levelmus);
        mus.looped = true;
        mus.setVolume(1);
        var loopTime = null;
        if (window.funnyMusic) {
            loopTime = musicLoopTime;
            mus.play(musicLoopTime);
        } else {
            mus.play();
        }
        gvbsonic.events.emit("playlevelmusic", mus, lvlMusicID, loopTime);
        mus.onended = playmusic;
        window.funnyMusic = mus;
    }
    window.funnyMusic = null;
    playmusic();
    var spindashsound = null;
    var ringsound = null;
    var jumpsoundthing = null;
    var skidsoundthing = null;
    var flightSound = new window.AudioApiReplacement(window.files.sfx.fly);
    function startFlightSound() {
        flightSound = new window.AudioApiReplacement(window.files.sfx.fly);
        flightSound.setVolume(1);
        flightSound.play();
        flightSound.looped = true;
        flightSound.onended = startFlightSound;
    }
    function stopFlightSound() {
        flightSound.onended = function () {};
        flightSound.pause();
    }
    var tiredSound = new window.AudioApiReplacement(window.files.sfx.flyTired);
    function startTiredSound() {
        tiredSound = new window.AudioApiReplacement(window.files.sfx.flyTired);
        tiredSound.setVolume(1);
        tiredSound.play();
        tiredSound.looped = true;
        tiredSound.onended = startTiredSound;
    }
    function stopTiredSound() {
        tiredSound.onended = function () {};
        tiredSound.pause();
    }

    async function playSound(name, speed, emitevents) {
        if (!emitevents) {
            window.MultiAPI.onMainGameSound(name, speed);
        } else {}
        if (name == "tired") {
            startTiredSound();
        }
        if (name == "end-tired") {
            stopTiredSound();
        }
        if (name == "start-flying") {
            startFlightSound();
        }
        if (name == "end-flying") {
            stopFlightSound();
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
        if (name == "skid") {
            if (skidsoundthing) {
                skidsoundthing.pause();
            }
            var a = new window.AudioApiReplacement(window.files.sfx.skid);
            skidsoundthing = a;
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
            var a = new window.AudioApiReplacement(window.files.sfx.spindashRelease);
            a.setVolume(1);
            a.play();
            spindashsound = a;
        }
        if (name == "peelout") {
            var a = new window.AudioApiReplacement(window.files.sfx.peelCharge);
            a.setVolume(1);
            a.play();
        }
        if (name == "peelout-release") {
            if (spindashsound) {
                spindashsound.pause();
                spindashsound.setVolume(1);
            }
            var a = new window.AudioApiReplacement(window.files.sfx.peelRelease);
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
    function checkObjectCollide(x, y) {
        for (var spr of enimies) { //any object exept a regular tile.
            if (spr.solid) {
                //console.log(spr);
                var sx =
                    window.renderer.xToLeft(x, 4) -
                    window.renderer.xToLeft(spr.x, spr.width * spr.scale);
                var sy =
                    window.renderer.yToTop(y, 4) -
                    window.renderer.yToTop(spr.y, spr.height * spr.scale);
                if (spr.mask) {}
                else {}
                function checkboxcollision(rect1, rect2) {
                    if (
                        rect1.x < rect2.x + rect2.width &&
                        rect1.x + rect1.width > rect2.x &&
                        rect1.y < rect2.y + rect2.height &&
                        rect1.y + rect1.height > rect2.y) {
                        return true;
                    }
                    return false;
                }
                var playerCollision = {
                    x: window.renderer.xToLeft(x, 4),
                    y: window.renderer.yToTop(y, 4),
                    width: 4,
                    height: 4
                };
                var objectCollision = {
                    x: window.renderer.xToLeft(spr.x, spr.width * spr.scale),
                    y: window.renderer.yToTop(spr.y, spr.height * spr.scale),
                    width: spr.width * spr.scale,
                    height: spr.height * spr.scale
                };
                if (checkboxcollision(playerCollision, objectCollision)) {
                    return true;
                }
            }
        }
    }
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
            if (spr.mask) {
                if (spr.stype == "tile") {
                    //This may save some CPU stuff.
                    //So basicly, first do a box check,
                    //and then preform a mask check if the box check returns true.
                    function checkboxcollision(rect1, rect2) {
                        if (
                            rect1.x < rect2.x + rect2.width &&
                            rect1.x + rect1.width > rect2.x &&
                            rect1.y < rect2.y + rect2.height &&
                            rect1.y + rect1.height > rect2.y) {
                            return true;
                        }
                        return false;
                    }
                    var playerCollision = {
                        x: window.renderer.xToLeft(x, 4),
                        y: window.renderer.yToTop(y, 4),
                        width: 4,
                        height: 4
                    };
                    var objectCollision = {
                        x: window.renderer.xToLeft(spr.x, spr.width * spr.scale),
                        y: window.renderer.yToTop(spr.y, spr.height * spr.scale),
                        width: spr.width * spr.scale,
                        height: spr.height * spr.scale
                    };
                    if (checkboxcollision(playerCollision, objectCollision)) {
                        //markSpritePos(spr,"red",true);
                        var sx =
                            window.renderer.xToLeft(x, 4) -
                            window.renderer.xToLeft(spr.x, spr.width * spr.scale);
                        var sy =
                            window.renderer.yToTop(y, 4) -
                            window.renderer.yToTop(spr.y, spr.height * spr.scale);
                        if (spr.mask) {}
                        else {}
                        if (
                            spr.mask.collidesWith(
                                window.files.pointcollision,
                                Math.round(sx),
                                Math.round(sy))) {
                            if (spr.stype == "tile") {
                                if ((layer == spr.layer || spr.layer == 0) && ((!istails) || (spr.layer == 0))) {
                                    //markSpritePos(spr,"green",true);
                                    collidecount += 1;
                                    return true;
                                }
                            } else {
                                if (spr.collideable) {}
                            }
                        }
                    }
                }
            }
        }
        return collidecount > 0;
    }
    function spriteCollisonCheck(checksprite) {
        for (var spr of onscreensprites) {
            spr.x = window.levelspr.x + spr.sx;
            spr.y = window.levelspr.y + spr.sy;
        }
        return checkCollisionPointCheck(checksprite.x, checksprite.y, true);
    }
    function checkCollisionPoint(x, y) {
        return checkCollisionPointCheck(x, y, false);
    }
    function checkCollisionPointTails(x, y) {
        return checkCollisionPointCheck(x, y, true);
    }
    var leavingLevel = false;
    async function leaveTheLevel() {
        if (!dontExitTwoTimes) {
            dontExitTwoTimes = true;
            leavingLevel = true;
            mus.onended = function () {};
            mus.pause();
            await window.transitionFadeIn();
            sonic.onstop = function () {};
            await sonic.stop();
            if (window.CPUTails) {
                if (window.CPUTails.stop) {
                    await window.CPUTails.stop();
                }
            }
            sprites = [];
            engineRunning = false;
            await window.waitAsync(0.5);
        } else {
            console.warn("[GVBSONIC] WARNING: The level is trying to be exited multiple times, make sure your code is correct.");
        }
    }
    async function tilebehavior(ts) {
        if (!sonic.dead) {
            //Below are older stuff like monitors and stuff, you can use the new tile-behavior file for newer objects.
            //if you need more access to open varaibles, you can still use this any time.
            function monitorScript(mtype, ts, cb) {
                if (!ts.broken) {
                    ts.scale = 1;
                    ts.width = 56 / 2;
                    ts.height = 64 / 2;
                    ts.imageLocation = getSpriteByName(
                            window.files.monitorSpriteSheet.sprites,
                            mtype + ".png");
                    if (sonic.rolling || sonic.jumping) {
                        ts.solid = false;
                    } else {
                        ts.solid = true;
                    }
                    if (!sonic.inDebug) {
                        if (window.renderer.checkSpriteCollision(ts, sonic)) {
                            if (sonic.rolling || sonic.jumping || sonic.spindash) {
                                var a = new window.AudioApiReplacement(
                                        window.files.sfx.destory);
                                a.setVolume(1);
                                a.play();
                                ts.broken = true;
                                sonic.gravity = sonic.gravity * -1;
                                ts.imageLocation = getSpriteByName(
                                        window.files.monitorSpriteSheet.sprites,
                                        "broken.png");
                                ts.solid = false;
                                setTimeout(() => {
                                    cb(sonic);
                                }, 500);
                            } else {}
                        }
                    }
                    if (!CPUTails.inDebug) {
                        if (window.renderer.checkSpriteCollision(ts, CPUTails)) {
                            if (CPUTails.rolling || CPUTails.jumping) {
                                var a = new window.AudioApiReplacement(
                                        window.files.sfx.destory);
                                a.setVolume(1);
                                a.play();
                                ts.broken = true;
                                CPUTails.gravity = CPUTails.gravity * -1;
                                ts.imageLocation = getSpriteByName(
                                        window.files.monitorSpriteSheet.sprites,
                                        "broken.png");
                                ts.solid = false;
                                setTimeout(() => {
                                    cb(CPUTails);
                                }, 500);
                            } else {}
                        }
                    }
                }
            }
            if (ts.stype == "text") {
                ts.type = "text";
                ts.color = "black";
                ts.text = ts.stext;
                ts.size = 15;
                ts.center = true;
                ts.height = 15;
            }

            if (ts.stype == "monitor-eggman") {
                monitorScript("eggman", ts, (player) => {
                    player.hurt = true; //use player for things, like damaging the player who hit it.
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
                    a.setVolume(1);
                    a.play();
                    ringsound = a;
                });
            }
            if (ts.sid) {
                if (ts.sid.startsWith("Collision Tile ")) {
                    ts.trs = 0;
                }
            }
            if (ts.stype == "springRed") {
                if (!ts.springi) {
                    ts.springi = 0;
                } else {
                    if (ts.springi > 0) {
                        ts.springi -= 0.5;
                    } else {
                        ts.springi = 0;
                    }
                }
                ts.imageLocation = {
					width:32,
					height:32,
					x:Math.round(ts.springi)*32,
					y:0
				};
                ts.width = ts.imageLocation.width;
                ts.height = ts.imageLocation.height;
                if (!sonic.inDebug) {
                    if (!sonic.hurtanim) {
                        if (window.renderer.checkSpriteCollision(ts, sonic)) {
                            sonic.onfloor = false;
                            sonic.jumping = false;
                            sonic.spring = true;
                            ts.springi = (ts.image.width/32)-1;
                            if (!ts.springsoundplayed) {
                                playSound("spring");
                                ts.springsoundplayed = true;
								
								sonic.speed = moveStepsSpeed(15.5, ts.direction - 90)[0];
								sonic.gravity = moveStepsSpeed(15.5, ts.direction - 90)[1];
                            }
                        } else {
                            ts.springsoundplayed = false;
                        }
                    }
                }
                if (!CPUTails.inDebug) {
                    if (!CPUTails.hurtanim) {
                        if (window.renderer.checkSpriteCollision(ts, CPUTails)) {
                            CPUTails.onfloor = false;
                            CPUTails.jumping = false;
                            CPUTails.spring = true;
                            ts.springi = (ts.image.width/32)-1;
                            if (!ts.springsoundplayedtails) {
                                playSound("spring");
                                ts.springsoundplayedtails = true;
								
								CPUTails.speed = moveStepsSpeed(15.5, ts.direction - 90)[0];
								CPUTails.gravity = moveStepsSpeed(15.5, ts.direction - 90)[1];
                            }
                        } else {
                            ts.springsoundplayedtails = false;
                        }
                    }
                }
            }
			if (ts.stype == "springYellow") {
                if (!ts.springi) {
                    ts.springi = 0;
                } else {
                    if (ts.springi > 0) {
                        ts.springi -= 0.5;
                    } else {
                        ts.springi = 0;
                    }
                }
                ts.imageLocation = {
					width:32,
					height:32,
					x:Math.round(ts.springi)*32,
					y:0
				};
                ts.width = ts.imageLocation.width;
                ts.height = ts.imageLocation.height;
                if (!sonic.inDebug) {
                    if (!sonic.hurtanim) {
                        if (window.renderer.checkSpriteCollision(ts, sonic)) {
                            sonic.onfloor = false;
                            sonic.jumping = false;
                            sonic.spring = true;
                            ts.springi = (ts.image.width/32)-1;
                            if (!ts.springsoundplayed) {
                                playSound("spring");
                                ts.springsoundplayed = true;
								
								sonic.speed = moveStepsSpeed(10.5, ts.direction - 90)[0];
								sonic.gravity = moveStepsSpeed(10.5, ts.direction - 90)[1];
                            }
                        } else {
                            ts.springsoundplayed = false;
                        }
                    }
                }
                if (!CPUTails.inDebug) {
                    if (!CPUTails.hurtanim) {
                        if (window.renderer.checkSpriteCollision(ts, CPUTails)) {
                            CPUTails.onfloor = false;
                            CPUTails.jumping = false;
                            CPUTails.spring = true;
                            ts.springi = (ts.image.width/32)-1;
                            if (!ts.springsoundplayedtails) {
                                playSound("spring");
                                ts.springsoundplayedtails = true;
								
								CPUTails.speed = moveStepsSpeed(10.5, ts.direction - 90)[0];
								CPUTails.gravity = moveStepsSpeed(10.5, ts.direction - 90)[1];
                            }
                        } else {
                            ts.springsoundplayedtails = false;
                        }
                    }
                }
            }
            if (ts.stype == "ring") {
                ts.width = 16;
                ts.height = 16;
                if (!sonic.inDebug) {
                    if (window.renderer.checkSpriteCollision(ts, sonic)) {
                        if (ts.visible) {
                            sonic.rings += 1;
                            if (ringsound) {
                                ringsound.pause();
                                ringsound.setVolume(1);
                            }
                            var a = new window.AudioApiReplacement(window.files.sfx.ring);
                            a.setVolume(1);
                            a.play();
                            ringsound = a;
                        }
                        ts.visible = false;
                    }
                }
                if (!CPUTails.inDebug) {
                    if (window.renderer.checkSpriteCollision(ts, CPUTails)) {
                        if (ts.visible) {
                            sonic.rings += 1;
                            if (ringsound) {
                                ringsound.pause();
                                ringsound.setVolume(1);
                            }
                            var a = new window.AudioApiReplacement(window.files.sfx.ring);
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
                ts.ringanim += 0.5;
                if ((Math.round(ts.ringanim) * 16) >= ts.image.width) {
                    ts.ringanim = 0;
                }
                ts.scale = 1;
                ts.imageLocation = {
                    x: Math.round(ts.ringanim) * 16,
                    y: 0,
                    width: 16,
                    height: 16,
                };
            }
            if (ts.stype == "scatterring") {
                ts.width = 16;
                ts.height = 16;
                if (!ts.collectabletimer) {
                    ts.collectabletimer = 0;
                }
                ts.collectabletimer += 1;
                ts.sy -= ts.my;
                ts.my -= 0.5;
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
                if (ts.collectabletimer > 63) {
                    if (!sonic.inDebug) {
                        if (window.renderer.checkSpriteCollision(ts, sonic)) {
                            if (ts.visible) {
                                sonic.rings += 1;
                                if (ringsound) {
                                    ringsound.pause();
                                    ringsound.setVolume(1);
                                }
                                var a = new window.AudioApiReplacement(window.files.sfx.ring);
                                a.setVolume(1);
                                a.play();
                                ringsound = a;
                            }
                            ts.visible = false;
                        }
                    }
                }
                if (ts.collectabletimer > 60) {
                    if (!CPUTails.inDebug) {
                        if (window.renderer.checkSpriteCollision(ts, CPUTails)) {
                            if (ts.visible) {
                                sonic.rings += 1;
                                if (ringsound) {
                                    ringsound.pause();
                                    ringsound.setVolume(1);
                                }
                                var a = new window.AudioApiReplacement(window.files.sfx.ring);
                                a.setVolume(1);
                                a.play();
                                ringsound = a;
                            }
                            ts.visible = false;
                        }
                    }
                }
                if (!ts.ringanim) {
                    ts.ringanim = 0;
                }
                ts.ringanim += 0.5;
                if ((Math.round(ts.ringanim) * 16) >= ts.image.width) {
                    ts.ringanim = 0;
                }
                ts.scale = 1;
                ts.imageLocation = {
                    x: Math.round(ts.ringanim) * 16,
                    y: 0,
                    width: 16,
                    height: 16,
                };
            }
            if (ts.stype == "s1") {
                ts.width = 36;
                ts.height = 36;
                ts.type = "square";
                ts.image = null;
                ts.color = "red";
                ts.trs = 0;
                ts.visible = false;
                if (sonic.inDebug) {
                    ts.visible = true;
                    ts.trs = 1;
                }
                if (window.renderer.checkSpriteCollision(ts, sonic)) {
                    layer = 1;
                }
            }
            if (ts.stype == "s2") {
                ts.width = 36;
                ts.height = 36;
                ts.type = "square";
                ts.image = null;
                ts.color = "blue";
                ts.visible = false;
                if (sonic.inDebug) {
                    ts.visible = true;
                    ts.trs = 1;
                }
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
                    ts.timer += 0.02;
                    ts.width = 40;
                    ts.height = 29;
                    ts.sx += ts.move * 1.7;
                    if (window.renderer.checkSpriteCollision(ts, sonic)) {
                        if (sonic.rolling || sonic.jumping || sonic.spindash) {
                            var a = new window.AudioApiReplacement(window.files.sfx.destory);
                            a.setVolume(1);
                            a.play();
                            ts.visible = false;
                            sonic.gravity = sonic.gravity * -1;
                        } else {
                            ts.visible = true;
                            sonic.hurt = true;
                        }
                    }
                    if (window.renderer.checkSpriteCollision(ts, CPUTails)) {
                        if (CPUTails.rolling || CPUTails.jumping || CPUTails.spindash) {
                            var a = new window.AudioApiReplacement(window.files.sfx.destory);
                            a.setVolume(1);
                            a.play();
                            ts.visible = false;
                            CPUTails.gravity = CPUTails.gravity * -1;
                        } else {
                            ts.visible = true;
                            CPUTails.hurt = true;
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
                ts.image =
                    window.files.signposts[
                        window.gvbsonicCharacters[window.gvbsonicSelectedChar].signpostid
                    ];
                ts.scale = 1;
                ts.width = ts.image.width;
                ts.height = ts.image.height;
                if (sonic.canscroll) {
                    if (!sonic.inDebug) {
                        if (sonic.x > ts.x) {
                            sonic.canscroll = false;

                            window.levelspr.x = -ts.sx;
                            window.levelspr.y = -ts.sy;
                            if (window.levelspr.x > 0) {
                                window.levelspr.x = 0;
                            }
                            if (!levelinfo.disableYLock) {
                                if (window.levelspr.y < 0) {
                                    window.levelspr.y = 0;
                                }
                            }
                            sonic.x = sonic.worldx + window.levelspr.x;
                            sonic.y = sonic.worldy + window.levelspr.y;
                            tailshud.text = "";
                            mus.onended = function () {};
                            mus.pause();
                            var clear = new window.AudioApiReplacement(
                                    window.files.jingles.levelClear);
                            clear.looped = false;
                            clear.setVolume(1);
                            clear.play();
                            clear.onended = async function () {
                                retval = "clear";
                                leavingLevel = true;
                                leaveTheLevel();
                            };
                        }
                    }
                }
            }

            window.doTileBehaviorTick(ts, {
                monitorScript: monitorScript,
                sonic: sonic,
                tails: CPUTails,
                scrollData: window.levelspr,
                collisionCheck: function (a, b) {
                    return window.renderer.checkSpriteCollision(a, b);
                },
                setX: function (spr, x) {
                    spr.sx = x;
                },
                setY: function (spr, y) {
                    spr.sx = y;
                },
                getX: function (spr) {
                    return spr.sx;
                },
                getY: function (spr) {
                    return spr.sy;
                },
                pixelCollisionCheck: spriteCollisonCheck,
                damageCharacter: function (plr) {
                    plr.hurt = true;
                },
                instantkillCharacter: function (plr) {
                    plr.dead = true;
                },
                canGetHurt: function (plr) {
                    if (plr.hurt) {
                        return false;
                    } else {
                        return true;
                    }
                },
                exitLevel: function (reason) {
                    retval = reason;
                    leavingLevel = true;
                    leaveTheLevel();
                },
                shakeScreen: function (power, lengthSeconds) {
                    window.renderer.doScreenRumble(power, lengthSeconds);
                },
                getSoundEffect: function (id) {
                    return window.files.sfx[id];
                },
                Sound: window.AudioApiReplacement,
                getGroundLayer: function () {
                    return layer;
                },
                setGroundLayer: function (v) {
                    layer = v;
                }
            });
        }
    }
    collisiontest.text = "Test";
    var _fpstick = 0;
    var fps = 60;
    bgsprite = new window.GRender.SquareSprite(0, 0, null, 600, 360);
    bgsprite.isbg = true;
    sonic = new window.GRender.Sprite(
            -200,
            0,
            window.gvbsonicCharacters[window.gvbsonicSelectedChar].image,
            32,
            40);
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
    debug1.font = "pixel";
    var debug2 = new window.GRender.TextSprite(-275, -100, null, 32, 40);
    debug2.color = "white";
    debug2.bold = true;
    debug2.font = "pixel";
    var speedhud = new window.GRender.TextSprite(-275, -80, null, 32, 40);
    speedhud.color = "white";
    speedhud.bold = true;
    speedhud.font = "pixel";
    var debug3 = new window.GRender.TextSprite(-275, -60, null, 32, 40);
    debug3.color = "white";
    debug3.bold = true;
    debug3.font = "pixel";
    var tailshud = new window.GRender.TextSprite(-275, 180, null, 32, 40);
    tailshud.color = "black";
    tailshud.bold = true;
    tailshud.font = "pixel";
    tailshud.text = "";
    bgsprite.color = "#00a2ff";
    sprites.push(bgsprite);
    sprites.push(sonic);
    sprites.push(hudrings);

    sprites.push(debug1);
    sprites.push(debug2);
    sprites.push(speedhud);

    sonic.onstop = async function () {
        leaveTheLevel();
    };
    if (!tails) {
        sprites.push(tailshud);
    }
    var scrollStart = [spawnpoint[0], spawnpoint[1]];
    movementEngine(
        sonic,
        window.levelspr,
        window.files.maniaSonicSpritehseet.sprites,
        true,
        scrollStart,
        checkCollisionPoint,
        playSound,
        window.gvbsonicCharacters[window.gvbsonicSelectedChar],
        checkObjectCollide);
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
        var i = 0;
        while (i < r) {
            var spr = new window.GRender.Sprite(0, 0, window.files.ring, 128, 128);
            spr.stype = "scatterring";
            spr.sx = sonic.worldx;
            spr.sy = sonic.worldy;
            spr.layer = 0;
            spr.visible = true;
            spr.mx = Math.random() * 20 - 5;
            spr.my = Math.random() * 20 - 5;
            scatteredrings.push(spr);
            if (i > 100) {
                break;
            }
            i += 1;
        }
        await window.waitAsync(8);
        scatteredrings = [];
    };
    window.CPUTails = new window.GRender.Sprite(
            -99999,
            -99999,
            null,
            0,
            0);

    async function spawnTails(rangeoftails) {
        window.CPUTails = null;
        window.ai = new TailsCPUAI();

        CPUTails = new window.GRender.Sprite(0, 0, window.files.tails, 32, 40);
        function createTails() {
			if (!leavingLevel) {
				window.ai = new TailsCPUAI();
				movementEngine(
					CPUTails,
					window.levelspr,
					window.gvbsonicCharacters[window.gvbsonicNPCCharacter].spritesheet,
					false,
					scrollStart,
					checkCollisionPointTails,
					playSound,
					window.gvbsonicCharacters[window.gvbsonicNPCCharacter],
					checkObjectCollide);
			} else {
				console.warn("[GVBSONIC]: Prevented CPU from respawning while leaving level.");
			}
        }
        createTails();
        CPUTails.worldx = -200;
        CPUTails.y = 0;
        sprites.push(CPUTails);
        CPUTails.x = scrollStart[0];
        CPUTails.y = scrollStart[1];
        CPUTails.worldx = scrollStart[0];
        CPUTails.worldy = scrollStart[1];
        ai.state = "respawn";
        while (engineRunning) {
            await window.tickAsync60FPS();
            while (engineRunning) {
                await window.tickAsync60FPS();
                if (!sonic.paused) {
                    ai.player = CPUTails;
                    ai.target = sonic;
                    if (CPUTails) {
                        ai.onscreensprites = onscreensprites;
                        if (!leavingLevel) {
                            ai.frame();
                        } else {
                            ai.getReadyToLeaveLevel();
                        }
                    }
                }
                if (!sonic.paused) {
                    CPUTails.character =
                        window.gvbsonicCharacters[window.gvbsonicNPCCharacter];
                    if ((CPUTails.x > rangeoftails.x) || (CPUTails.x < -rangeoftails.x) || (CPUTails.y > rangeoftails.y) || (CPUTails.y < -rangeoftails.y)) { //Oops... The CPU is out of range.
                        CPUTails.visible = false;
                        CPUTails.x = CPUTails.x - 40;
                        CPUTails.y = CPUTails.y;
                        CPUTails.worldx = CPUTails.worldx;
                        CPUTails.worldy = CPUTails.worldy - 40;
                        await CPUTails.stop();
                        CPUTails.x = CPUTails.x - 40;
                        CPUTails.y = CPUTails.y;
                        CPUTails.worldx = CPUTails.worldx;
                        CPUTails.worldy = CPUTails.worldy - 40;
                        await window.tickAsync(0.7);
                        await CPUTails.resetData();
                        createTails();
                        CPUTails.visible = true;
                        CPUTails.x = sonic.x - 40;
                        CPUTails.y = sonic.y + 170;
                        CPUTails.worldx = sonic.worldx;
                        CPUTails.worldy = sonic.worldy - 170;
                        CPUTails.onfloor = false;
                        CPUTails.x = Math.round(CPUTails.worldx + window.levelspr.x);
                        CPUTails.y = Math.round(CPUTails.worldy + window.levelspr.y);
                        ai.state = "respawn";
                    }
                    CPUTails.rings = 50;
                    CPUTails.onframeupdate = function () {
                        if (!CPUTails.dead) {
                            CPUTails.x = Math.round(CPUTails.worldx + window.levelspr.x);
                            CPUTails.y = Math.round(CPUTails.worldy + window.levelspr.y);
                        }
                    };
                }
            }
        }
    }

    document.onkeydown = async function (e) {
        if (!leavingLevel) {
            if (e.key == "ArrowLeft") {
                sonic.left = true;
            }
            if (e.key.toLowerCase() == "d") {
                if (window.debugModeEnabled) {
                    sonic.inDebug = !sonic.inDebug;
                }
            }
            if (e.key.toLowerCase() == "x") {
                sonic.switchDebug = true;
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
            if (e.key.toLowerCase() == "escape") {
                retval = "exitLevel";
                leaveTheLevel();
            }
        }
    };
    document.onkeyup = function (e) {
        if (e.key == "ArrowLeft") {
            sonic.left = false;
        }
        if (e.key.toLowerCase() == "x") {
            sonic.switchDebug = false;
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
    window.rangeOfOnScreenSprites = {
        x: 1000,
        y: 300,
    };
    for (var ts of window.files.level) {
        ts.x = Math.round(window.levelspr.x + ts.sx);
        ts.y = Math.round(window.levelspr.y + ts.sy);
    }
    if (tails) {
        spawnTails(window.rangeOfOnScreenSprites);
    }
    while (engineRunning) {
        if (!sonic.paused) {
            if (leavingLevel) {
                sonic.jump = false;
                sonic.up = false;
                sonic.down = false;
                sonic.right = false;
                sonic.switchDebug = false;
                sonic.left = false;
            }
            sonic.character = window.gvbsonicCharacters[window.gvbsonicSelectedChar];
            debug2.text = `ENGINE ANGLE: ${sonic.engineAngle}`;
            debug1.text = `ANGLE: ${sonic.smoothrot}`;
            speedhud.text = `SPEED: ${sonic.speed}`;

            if (window.debugModeEnabled) {
                debug2.visible = true;
                debug1.visible = true;
                speedhud.visible = true;
            } else {
                debug2.visible = false;
                debug1.visible = false;
                speedhud.visible = false;
            }

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
            var nobgsprites = [];
            for (var spr of sprites) {
                if (!spr.isBGSprite) {
                    nobgsprites.push(spr);
                }
            }
            sprites = nobgsprites;
            var newsprites = [];
            for (var spr of sprites) {
                if (!(spr.stype == "scatterring")) {
                    newsprites.push(spr);
                }
            }
            sprites = newsprites;
            var nodebugsprites = [];
            for (var spr of sprites) {
                if (!spr.isDebugModeCreated) {
                    nodebugsprites.push(spr);
                }
            }
            sprites = nodebugsprites;

            sonic.onredraw = function () {
                for (var ts of window.files.level) {
                    ts.x = Math.round(window.levelspr.x + ts.sx);
                    ts.y = Math.round(window.levelspr.y + ts.sy);
                    gvbsonic.events.emit("tileupdate", ts);
                }
                if (!sonic.dead) {
                    sonic.x = window.levelspr.x + sonic.worldx;
                    sonic.y = window.levelspr.y + sonic.worldy;
                }
            };
			sonic.onbeforedraw = function () {
                for (var ts of window.files.level) {
                    ts.x = Math.round(window.levelspr.x + ts.sx);
                    ts.y = Math.round(window.levelspr.y + ts.sy);
                    gvbsonic.events.emit("tileupdate", ts);
                }
                if (!sonic.dead) {
                    sonic.x = window.levelspr.x + sonic.worldx;
                    sonic.y = window.levelspr.y + sonic.worldy;
                }
            };

            for (var ts of window.files.level) {
                if (
                    Math.abs(ts.x) >
                    rangeOfOnScreenSprites.x + (ts.width * ts.scale) / 2 ||
                    Math.abs(ts.y) > rangeOfOnScreenSprites.y + (ts.height * ts.scale) / 2) {}
                else {
                    tilebehavior(ts);
                    if (!(ts.stype == "tile")) {
                        enimies.push(ts);
                    } else {
                        onscreensprites.push(ts);
                    }
                }
                if (Math.abs(ts.x) > 110 || Math.abs(ts.y) > 110) {}
                else {
                    if (smallrangesprites.length < 4) {
                        smallrangesprites.push(ts);
                    }
                }
            }
            for (var ts of scatteredrings) {
                ts.x = Math.round(window.levelspr.x + ts.sx);
                ts.y = Math.round(window.levelspr.y + ts.sy);
                tilebehavior(ts);
                enimies.push(ts);
            }
            var nspr = [];
            for (var spr of sprites) {
                if (!(spr.SDATAID == "____CUSTOM_____")) {
                    nspr.push(spr);
                }
            }
            sprites = nspr;
            var ns = [];
            for (var spr of sprites) {
                if (!spr.istile) {
                    if (!spr.isbg) {
                        ns.push(spr);
                    }
                }
            }
            for (var bgspr of bgSprites) {
                bgspr.x = bgspr.bgpos[0];
                bgspr.y = Math.round(window.levelspr.y) * bgspr.bgmult + bgspr.bgpos[1];
                if (bgspr.bgRenderer) {
                    bgspr.image = bgspr.bgRenderer.renderer([
                                Math.round(window.levelspr.x),
                                Math.round(window.levelspr.y),
                            ]);
                }
            }
            sprites = [];
            sprites.push(bgsprite);
            sprites = sprites.concat(bgSprites);
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
            await window.tickAsync60FPS();
        } else {
            await window.tickAsync60FPS();
        }
    }
    await window.waitAsync(0.5);
    window.renderer.drawSprites([]);
    sprites = [];
    await window.waitAsync(0.3);
    exitedlevel(retval);
};
async function loadLevelData(data, music, bgdata, useTails) {
    await window.transitionStopInstant();
    var loadingtext = new window.GRender.TextSprite(260, 180, null, 32, 40);
    loadingtext.color = "white";
    loadingtext.bold = true;
    loadingtext.font = "pixel";
    loadingtext.text = "loading...";
    loadingtext.center = true;
    sprites = [loadingtext];
    var levelurl = await window.formatLevel(data, window.files.tiles);
    window.files.level = levelurl;
    sprites = [];
    return new Promise((a) => {
        window.transitionFadeOut();
        window.startEngine(
            window.files.levelBGMS[window.levelinfo.BGM],
            (e) => {
            a(e);
        },
            useTails,
            window.files.bgAssets[window.levelinfo.background],
            window.levelMusicLoopNumbers[window.levelinfo.BGM],
            window.levelinfo.title,
            window.levelinfo.BGM,
			window.levelinfo.spawn);
    });
}
var WSserverURL = new window.GRender.TextSprite(0, 0, null, 45, 19);
WSserverURL.text = "localhost:5824";
async function loadLevel(number, useTails) {
    return await loadLevelData(
        window.files.levels[number],
        window.files.levelMusic[number],
        window.files.levelBackgrounds[number],
        useTails);
}
async function dolevel(num, useTails) {
    var levelrunning = true;
    var result = "";
    while (levelrunning) {
        var report = await loadLevel(num, useTails);
        if (report == "clear") {
            levelrunning = false;
            result = "next";
        }
        if (report == "exitLevel") {
            levelrunning = false;
            result = "exit";
        }
    }
    return result;
}
window.startGame = async function startGame() {
    await gvbsonic.events.emitAsync("startgame", window.files);
    setTitleInfo("");
    gameUICode();
};
