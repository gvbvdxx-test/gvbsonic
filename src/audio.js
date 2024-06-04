var audioCTX = new AudioContext();
setInterval(() => {
    if (!(audioCTX.state == "running")) {
        audioCTX = new AudioContext();
    }
}, 1);
function cloneAudioBuffer(fromAudioBuffer) {
    const audioBuffer = new AudioBuffer({
        length: fromAudioBuffer.length,
        numberOfChannels: fromAudioBuffer.numberOfChannels,
        sampleRate: fromAudioBuffer.sampleRate,
    });
    for (let channelI = 0; channelI < audioBuffer.numberOfChannels; ++channelI) {
        const samples = fromAudioBuffer.getChannelData(channelI);
        audioBuffer.copyToChannel(samples, channelI);
    }
    return audioBuffer;
}
function decodeAsync(d) {
    return new Promise((a) => {
        try {
            audioCTX.decodeAudioData(d, a);
        } catch (e) {
            a(null);
        }
    });
}
window.loadSoundURL = async function loadSoundURL(url) {
    try {
        try {
            var a = await fetch(url);
            var b = await a.arrayBuffer();
            var c = await decodeAsync(b);
        } catch (e) {
            window.alert(e);
        }
        return c;
    } catch (e) {
        window.alert(e);
    }
};
window.soundSystem = {
	events: {
        emit: function (name, ...values) {
            this[name].forEach((f) => {
                f.apply(window.soundSystem, values);
            });
        },
        emitAsync: async function (name, ...values) {
            for (var f of this[name]) {
                await f.apply(window.soundSystem, values);
            }
        },
		_volumechanged: [],
        volumechanged: [],
		soundcreated: [],
		soundplayed: [],
		soundpaused: []
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
    }
};
window.soundSystem.volumeMultiplier = 1;
window.soundSystem.setVolumeMultiplier = function (volume) {
	window.soundSystem.volumeMultiplier = volume;
	window.soundSystem.events.emit("_volumechanged");
	window.soundSystem.events.emit("volumechanged",volume);
};
var preload = {};
class AudioApiReplacement {
    constructor(data) {
        function loadSample(url) {
            return fetch(url).then((response) => response.arrayBuffer());
        }
        this.data = data;
        this.source = null;
        this.playbackRate = 1;
        this.looped = false;
		this.startVol = 1;
		this.volume = 1;
		var me = this;
		window.soundSystem.addEventListener("_volumechanged", function () {
			me.setVolume(me.volume);
		});
		me.setVolume(me.volume);
		window.soundSystem.events.emit("soundcreated",this);
    }
    play(time) {
		window.soundSystem.events.emit("soundplayed",this,time);
        if (this.data) {
            if (!this.source) {
                function loadSample(url) {
                    return fetch(url).then((response) => response.arrayBuffer());
                }
                const source = audioCTX.createBufferSource();
                function copy(src) {
                    var dst = new ArrayBuffer(src.byteLength);
                    new Uint8Array(dst).set(new Uint8Array(src));
                    return dst;
                }
                this.gainNode = audioCTX.createGain();
                function decodeAudioData(data, out) {
                    try {
                        out(window.DADF.getFileAudioBuffer(data, audioCTX));
                    } catch (e) {
                        window.alert(e);
                    }
                }
                var t = this;
                function play(buffer) {
                    source.buffer = buffer;
                    source.playbackRate.value = t.playbackRate;
                    source.connect(t.gainNode);
                    t.gainNode.connect(audioCTX.destination);
                    t.gainNode.gain.value = t.startVol;
                    source.looped = t.looped;
					if (time) {
						source.start(0,time);
					} else {
						source.start(0);
					}
                    t.source = source;
                    var s = t;
                    source.onended = function () {
                        s.onended();
                        s.source = null;
                    };
                }
                function cloneAudioBuffer(fromAudioBuffer) {
                    const audioBuffer = new AudioBuffer({
                        length: fromAudioBuffer.length,
                        numberOfChannels: fromAudioBuffer.numberOfChannels,
                        sampleRate: fromAudioBuffer.sampleRate,
                    });
                    for (let channelI = 0; channelI < audioBuffer.numberOfChannels; ++channelI) {
                        const samples = fromAudioBuffer.getChannelData(channelI);
                        audioBuffer.copyToChannel(samples, channelI);
                    }
                    return audioBuffer;
                }
                try {
                    play(cloneAudioBuffer(this.data));
                } catch (e) {
                    window.alert(e);
                }
            }
        }
    }
    onended() {}
    pause() {
        if (this.source) {
            this.source.stop();
            this.source = null;
            this.gainNode = null;
        }
		window.soundSystem.events.emit("soundpaused",this);
    }
    remove() {
        delete this;
    }
	setPlaybackRate(value) {
        if (this.source) {
            this.source.playbackRate.value = value;
			this.playbackRate = value;
        } else {
            this.playbackRate = value;
        }
    }
	
	getPlaybackRate(value) {
        return this.playbackRate;
    }
	
    setVolume(value) {
        if (this.source) {
            this.gainNode.gain.value = value*window.soundSystem.volumeMultiplier;
			this.startVol = value*window.soundSystem.volumeMultiplier;
        } else {
            this.startVol = value*window.soundSystem.volumeMultiplier;
        }
		this.volume = value;
    }
    getVolume() {
        return this.volume;
    }
}
window.AudioApiReplacement = AudioApiReplacement;
