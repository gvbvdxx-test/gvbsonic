/*
  This works very simular to the website audio api,
  you load the data, via arraybuffer.
  The reason i made this, is so there is no media gui when you start playing audio.
*/
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
	  console.log(`Loaded Sound Asset "${url}"`);
    window.fileloadedname = url;
    var shorten = "";
    var i = 0;
    while (i < 200) {
      if (url[i]) {
        shorten += url[i];
      }
      i += 1;
    }

    document.getElementById("fileinfo").innerHTML +=
      "<br>Loaded Audio " + shorten;
    document
      .getElementById("fileinfo")
      .scrollTo(0, document.getElementById("fileinfo").scrollHeight);
    try {
      var a = await fetch(url);
      var b = await a.arrayBuffer();
      var c = await decodeAsync(b);
    } catch (e) {
      window.alert(e);
    }
    window.filesloaded += 1;
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
  }
  play() {
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
          source.start(0);
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
          for (
            let channelI = 0;
            channelI < audioBuffer.numberOfChannels;
            ++channelI
          ) {
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
  onended() {
    /*Gets overwritten by the script.*/
  }
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
  setVolume(value) {
    if (this.source) {
      //console.log(value);
      this.gainNode.gain.value = value;
    } else {
      this.startVol = value;
    }
  }
  getVolume() {
    return this.gainNode.gain.value;
  }
}
window.AudioApiReplacement = AudioApiReplacement;
