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
    }
    play(time) {
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
            this.gainNode.gain.value = value;
			this.startVol = value;
        } else {
            this.startVol = value;
        }
    }
    getVolume() {
        return this.gainNode.gain.value;
    }
}
window.AudioApiReplacement = AudioApiReplacement;
