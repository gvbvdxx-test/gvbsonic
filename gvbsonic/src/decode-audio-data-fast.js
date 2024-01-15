!function (e, t) {
    "object" == typeof exports && "undefined" != typeof module ? t(exports) : "function" == typeof define && define.amd ? define(["exports"], t) : t((e = "undefined" != typeof globalThis ? globalThis : e || self).DADF = {})
}
(this, (function (e) {
        "use strict";
        "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self && self;
        function t(e, t, r) {
            return e(r = {
                    path: t,
                    exports: {},
                    require: function (e, t) {
                        return function () {
                            throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")
                        }
                        (null == t && r.path)
                    }
                }, r.exports),
            r.exports
        }
        var r = t((function (e, t) {
                    !function (e) {
                        var t,
                        r = (t = [], function (e) {
                            return t[0] = 128 == (128 & e) ? "1" : "0",
                            t[1] = 64 == (64 & e) ? "1" : "0",
                            t[2] = 32 == (32 & e) ? "1" : "0",
                            t[3] = 16 == (16 & e) ? "1" : "0",
                            t[4] = 8 == (8 & e) ? "1" : "0",
                            t[5] = 4 == (4 & e) ? "1" : "0",
                            t[6] = 2 == (2 & e) ? "1" : "0",
                            t[7] = 1 == (1 & e) ? "1" : "0",
                            t.join("")
                        });
                        e.getFrameByteLength = function (t, r, n, i, a) {
                            var o = e.sampleLengthMap[i][a],
                            s = n ? "11" === a ? 4 : 1 : 0,
                            u = 1e3 * t / 8;
                            return Math.floor(o * u / r + s)
                        },
                        e.getXingOffset = function (e, t) {
                            var r = "11" === t;
                            return "11" === e ? r ? 21 : 36 : r ? 13 : 21
                        },
                        e.v1l1Bitrates = {
                            "0000": "free",
                            "0001": 32,
                            "0010": 64,
                            "0011": 96,
                            "0100": 128,
                            "0101": 160,
                            "0110": 192,
                            "0111": 224,
                            1e3: 256,
                            1001: 288,
                            1010: 320,
                            1011: 352,
                            1100: 384,
                            1101: 416,
                            1110: 448,
                            1111: "bad"
                        },
                        e.v1l2Bitrates = {
                            "0000": "free",
                            "0001": 32,
                            "0010": 48,
                            "0011": 56,
                            "0100": 64,
                            "0101": 80,
                            "0110": 96,
                            "0111": 112,
                            1e3: 128,
                            1001: 160,
                            1010: 192,
                            1011: 224,
                            1100: 256,
                            1101: 320,
                            1110: 384,
                            1111: "bad"
                        },
                        e.v1l3Bitrates = {
                            "0000": "free",
                            "0001": 32,
                            "0010": 40,
                            "0011": 48,
                            "0100": 56,
                            "0101": 64,
                            "0110": 80,
                            "0111": 96,
                            1e3: 112,
                            1001: 128,
                            1010: 160,
                            1011: 192,
                            1100: 224,
                            1101: 256,
                            1110: 320,
                            1111: "bad"
                        },
                        e.v2l1Bitrates = {
                            "0000": "free",
                            "0001": 32,
                            "0010": 48,
                            "0011": 56,
                            "0100": 64,
                            "0101": 80,
                            "0110": 96,
                            "0111": 112,
                            1e3: 128,
                            1001: 144,
                            1010: 160,
                            1011: 176,
                            1100: 192,
                            1101: 224,
                            1110: 256,
                            1111: "bad"
                        },
                        e.v2l2Bitrates = {
                            "0000": "free",
                            "0001": 8,
                            "0010": 16,
                            "0011": 24,
                            "0100": 32,
                            "0101": 40,
                            "0110": 48,
                            "0111": 56,
                            1e3: 64,
                            1001: 80,
                            1010: 96,
                            1011: 112,
                            1100: 128,
                            1101: 144,
                            1110: 160,
                            1111: "bad"
                        },
                        e.v2l3Bitrates = e.v2l2Bitrates,
                        e.v1SamplingRates = {
                            "00": 44100,
                            "01": 48e3,
                            10: 32e3,
                            11: "reserved"
                        },
                        e.v2SamplingRates = {
                            "00": 22050,
                            "01": 24e3,
                            10: 16e3,
                            11: "reserved"
                        },
                        e.v25SamplingRates = {
                            "00": 11025,
                            "01": 12e3,
                            10: 8e3,
                            11: "reserved"
                        },
                        e.channelModes = {
                            "00": "Stereo",
                            "01": "Joint stereo (Stereo)",
                            10: "Dual channel (Stereo)",
                            11: "Single channel (Mono)"
                        },
                        e.mpegVersionDescription = {
                            "00": "MPEG Version 2.5 (unofficial)",
                            "01": "reserved",
                            10: "MPEG Version 2 (ISO/IEC 13818-3)",
                            11: "MPEG Version 1 (ISO/IEC 11172-3)"
                        },
                        e.layerDescription = {
                            "00": "reserved",
                            "01": "Layer III",
                            10: "Layer II",
                            11: "Layer I"
                        },
                        e.bitrateMap = {
                            11: {
                                "01": e.v1l3Bitrates,
                                10: e.v1l2Bitrates,
                                11: e.v1l1Bitrates
                            },
                            10: {
                                "01": e.v2l3Bitrates,
                                10: e.v2l2Bitrates,
                                11: e.v2l1Bitrates
                            }
                        },
                        e.samplingRateMap = {
                            "00": e.v25SamplingRates,
                            10: e.v2SamplingRates,
                            11: e.v1SamplingRates
                        },
                        e.v1SampleLengths = {
                            "01": 1152,
                            10: 1152,
                            11: 384
                        },
                        e.v2SampleLengths = {
                            "01": 576,
                            10: 1152,
                            11: 384
                        },
                        e.sampleLengthMap = {
                            "01": e.v2SampleLengths,
                            10: e.v2SampleLengths,
                            11: e.v1SampleLengths
                        },
                        e.wordSeqFromStr = function (e) {
                            for (var t = e.length - 1, r = []; t >= 0; --t)
                                r[t] = e.charCodeAt(t);
                            return r
                        },
                        e.seq = {
                            id3: e.wordSeqFromStr("ID3"),
                            xing: e.wordSeqFromStr("Xing"),
                            info: e.wordSeqFromStr("Info")
                        },
                        e.noOp = function () {},
                        e.unsynchsafe = function (e) {
                            for (var t = 0, r = 2130706432; r; )
                                t >>= 1, t |= e & r, r >>= 8;
                            return t
                        },
                        e.isSeq = function (e, t, r) {
                            for (var n = e.length - 1; n >= 0; n--)
                                if (e[n] !== t.getUint8(r + n))
                                    return !1;
                            return !0
                        },
                        e.locateSeq = function (t, r, n, i) {
                            for (var a = 0, o = i - t.length + 1; a < o; ++a)
                                if (e.isSeq(t, r, n + a))
                                    return n + a;
                            return -1
                        },
                        e.locateStrTrm = {
                            iso: function (t, r, n) {
                                return e.locateSeq([0], t, r, n)
                            },
                            ucs: function (t, r, n) {
                                var i = e.locateSeq([0, 0], t, r, n);
                                return -1 === i ? -1 : ((i - r) % 2 != 0 && ++i, i)
                            }
                        },
                        e.readStr = {
                            iso: function (e, t, r) {
                                return String.fromCharCode.apply(null, new Uint8Array(e.buffer, t, r))
                            },
                            ucs: function (e, t, r) {
                                65534 !== e.getUint16(t) && 65279 !== e.getUint16(t) || (t += 2, r -= 2);
                                var n = e.buffer;
                                return t % 2 == 1 && (n = n.slice(t, t + r), t = 0),
                                String.fromCharCode.apply(null, new Uint16Array(n, t, r / 2))
                            }
                        },
                        e.readTrmStr = {
                            iso: function (t, r, n) {
                                var i = e.locateStrTrm.iso(t, r, n);
                                return -1 !== i && (n = i - r),
                                e.readStr.iso(t, r, n)
                            },
                            ucs: function (t, r, n) {
                                var i = e.locateStrTrm.ucs(t, r, n);
                                return -1 !== i && (n = i - r),
                                e.readStr.ucs(t, r, n)
                            }
                        },
                        e.readFrameHeader = function (t, n) {
                            if (n || (n = 0), t.byteLength - n <= 4)
                                return null;
                            if (255 !== t.getUint8(n))
                                return null;
                            var i = t.getUint8(n + 1);
                            if (i < 224)
                                return null;
                            var a = r(i).substr(3, 2),
                            o = r(i).substr(5, 2),
                            s = {
                                _section: {
                                    type: "frameHeader",
                                    byteLength: 4,
                                    offset: n
                                },
                                mpegAudioVersionBits: a,
                                mpegAudioVersion: e.mpegVersionDescription[a],
                                layerDescriptionBits: o,
                                layerDescription: e.layerDescription[o],
                                isProtected: 1 & i
                            };
                            if (s.protectionBit = s.isProtected ? "1" : "0", "reserved" === s.mpegAudioVersion)
                                return null;
                            if ("reserved" === s.layerDescription)
                                return null;
                            var u = t.getUint8(n + 2);
                            if (u = r(u), s.bitrateBits = u.substr(0, 4), s.bitrate = e.bitrateMap[a][o][s.bitrateBits], "bad" === s.bitrate)
                                return null;
                            if (s.samplingRateBits = u.substr(4, 2), s.samplingRate = e.samplingRateMap[a][s.samplingRateBits], "reserved" === s.samplingRate)
                                return null;
                            s.frameIsPaddedBit = u.substr(6, 1),
                            s.frameIsPadded = "1" === s.frameIsPaddedBit,
                            s.framePadding = s.frameIsPadded ? 1 : 0,
                            s.privateBit = u.substr(7, 1);
                            var d = t.getUint8(n + 3);
                            return s.channelModeBits = r(d).substr(0, 2),
                            s.channelMode = e.channelModes[s.channelModeBits],
                            s
                        },
                        e.readFrame = function (t, r, n) {
                            r || (r = 0);
                            var i = {
                                _section: {
                                    type: "frame",
                                    offset: r
                                },
                                header: e.readFrameHeader(t, r)
                            },
                            a = i.header;
                            if (!a)
                                return null;
                            i._section.sampleLength = e.sampleLengthMap[a.mpegAudioVersionBits][a.layerDescriptionBits],
                            i._section.byteLength = e.getFrameByteLength(a.bitrate, a.samplingRate, a.framePadding, a.mpegAudioVersionBits, a.layerDescriptionBits),
                            i._section.nextFrameIndex = r + i._section.byteLength;
                            var o = e.getXingOffset(a.mpegAudioVersionBits, a.channelModeBits);
                            return e.isSeq(e.seq.xing, t, r + o) || e.isSeq(e.seq.info, t, r + o) || n && !e.readFrameHeader(t, i._section.nextFrameIndex) ? null : i
                        }
                    }
                    (t)
                })),
        n = t((function (e, t) {
                    !function (e, t) {
                        var r = {
                            AENC: "Audio encryption",
                            APIC: "Attached picture",
                            CHAP: "Chapter",
                            COMM: "Comments",
                            COMR: "Commercial frame",
                            ENCR: "Encryption method registration",
                            EQUA: "Equalization",
                            ETCO: "Event timing codes",
                            GEOB: "General encapsulated object",
                            GRID: "Group identification registration",
                            IPLS: "Involved people list",
                            LINK: "Linked information",
                            MCDI: "Music CD identifier",
                            MLLT: "MPEG location lookup table",
                            OWNE: "Ownership frame",
                            PRIV: "Private frame",
                            PCNT: "Play counter",
                            POPM: "Popularimeter",
                            POSS: "Position synchronisation frame",
                            RBUF: "Recommended buffer size",
                            RVAD: "Relative volume adjustment",
                            RVRB: "Reverb",
                            SYLT: "Synchronized lyric/text",
                            SYTC: "Synchronized tempo codes",
                            TALB: "Album/Movie/Show title",
                            TBPM: "BPM (beats per minute)",
                            TCOM: "Composer",
                            TCON: "Content type",
                            TCOP: "Copyright message",
                            TDAT: "Date",
                            TDLY: "Playlist delay",
                            TENC: "Encoded by",
                            TEXT: "Lyricist/Text writer",
                            TFLT: "File type",
                            TIME: "Time",
                            TIT1: "Content group description",
                            TIT2: "Title/songname/content description",
                            TIT3: "Subtitle/Description refinement",
                            TKEY: "Initial key",
                            TLAN: "Language(s)",
                            TLEN: "Length",
                            TMED: "Media type",
                            TOAL: "Original album/movie/show title",
                            TOFN: "Original filename",
                            TOLY: "Original lyricist(s)/text writer(s)",
                            TOPE: "Original artist(s)/performer(s)",
                            TORY: "Original release year",
                            TOWN: "File owner/licensee",
                            TPE1: "Lead performer(s)/Soloist(s)",
                            TPE2: "Band/orchestra/accompaniment",
                            TPE3: "Conductor/performer refinement",
                            TPE4: "Interpreted, remixed, or otherwise modified by",
                            TPOS: "Part of a set",
                            TPUB: "Publisher",
                            TRCK: "Track number/Position in set",
                            TRDA: "Recording dates",
                            TRSN: "Internet radio station name",
                            TRSO: "Internet radio station owner",
                            TSIZ: "Size",
                            TSRC: "ISRC (international standard recording code)",
                            TSSE: "Software/Hardware and settings used for encoding",
                            TYER: "Year",
                            TXXX: "User defined text information frame",
                            UFID: "Unique file identifier",
                            USER: "Terms of use",
                            USLT: "Unsychronized lyric/text transcription",
                            WCOM: "Commercial information",
                            WCOP: "Copyright/Legal information",
                            WOAF: "Official audio file webpage",
                            WOAR: "Official artist/performer webpage",
                            WOAS: "Official audio source webpage",
                            WORS: "Official internet radio station homepage",
                            WPAY: "Payment",
                            WPUB: "Publishers official webpage",
                            WXXX: "User defined URL link frame"
                        },
                        n = {
                            T: function (e, r, n) {
                                var i = {
                                    encoding: e.getUint8(r)
                                };
                                return i.value = t.readStr[0 === i.encoding ? "iso" : "ucs"](e, r + 1, n - 1),
                                i
                            },
                            TXXX: function (e, r, n) {
                                var i = {
                                    encoding: e.getUint8(r)
                                };
                                if (n < 2)
                                    return i;
                                var a = 0 === i.encoding ? "iso" : "ucs",
                                o = r + 1,
                                s = t.locateStrTrm[a](e, o, n - 4);
                                return -1 === s || (i.description = t.readStr[a](e, o, s - o), s += "ucs" === a ? 2 : 1, i.value = t.readStr[a](e, s, r + n - s)),
                                i
                            },
                            W: function (e, r, n) {
                                return {
                                    value: t.readStr.iso(e, r, n)
                                }
                            },
                            WXXX: function (e, r, n) {
                                var i = {
                                    encoding: e.getUint8(r)
                                };
                                if (n < 2)
                                    return i;
                                var a = 0 === i.encoding ? "iso" : "ucs",
                                o = r + 1,
                                s = t.locateStrTrm[a](e, o, n - 4);
                                return -1 === s || (i.description = t.readStr[a](e, o, s - o), s += "ucs" === a ? 2 : 1, i.value = t.readStr.iso(e, s, r + n - s)),
                                i
                            },
                            COMM: function (e, r, n) {
                                var i = {
                                    encoding: e.getUint8(r)
                                };
                                if (n < 5)
                                    return i;
                                var a = 0 === i.encoding ? "iso" : "ucs",
                                o = r + 4;
                                i.language = t.readTrmStr.iso(e, r + 1, 3);
                                var s = t.locateStrTrm[a](e, o, n - 4);
                                return -1 === s || (i.description = t.readStr[a](e, o, s - o), s += "ucs" === a ? 2 : 1, i.text = t.readStr[a](e, s, r + n - s)),
                                i
                            },
                            UFID: function (e, r, n) {
                                var i = t.readTrmStr.iso(e, r, n);
                                return {
                                    ownerIdentifier: i,
                                    identifier: new DataView(e.buffer, r + i.length + 1, n - i.length - 1)
                                }
                            },
                            IPLS: function (e, r, n) {
                                for (var i, a = {
                                        encoding: e.getUint8(r),
                                        values: []
                                    }, o = 0 === a.encoding ? "iso" : "ucs", s = r + 1; s < r + n; )
                                     - 1 === (i = t.locateStrTrm[o](e, s, n - (s - r))) && (i = r + n), a.values.push(t.readStr[o](e, s, i - s)), s = i + ("ucs" === o ? 2 : 1);
                                return a
                            },
                            USER: function (e, r, n) {
                                var i = {
                                    encoding: e.getUint8(r)
                                };
                                if (n < 5)
                                    return i;
                                i.language = t.readTrmStr.iso(e, r + 1, 3);
                                var a = r + 4,
                                o = 0 === i.encoding ? "iso" : "ucs";
                                return i.text = t.readStr[o](e, a, r + n - a),
                                i
                            },
                            PRIV: function (e, r, n) {
                                var i = t.readTrmStr.iso(e, r, n);
                                return {
                                    ownerIdentifier: i,
                                    privateData: new DataView(e.buffer, r + i.length + 1, n - i.length - 1)
                                }
                            },
                            PCNT: function (e, t, r) {
                                return r < 4 ? {}
                                 : {
                                    counter: e.getUint32(t)
                                }
                            },
                            POPM: function (e, r, n) {
                                var i = {
                                    email: t.readTrmStr.iso(e, r, n)
                                };
                                return r += i.email.length + 1,
                                n < 6 || (i.rating = e.getUint8(r), i.counter = e.getUint32(r + 1)),
                                i
                            },
                            APIC: function (e, r, n) {
                                var i = {
                                    encoding: e.getUint8(r)
                                };
                                if (n < 4)
                                    return i;
                                var a,
                                o,
                                s = 0 === i.encoding ? "iso" : "ucs";
                                return a = r + 1,
                                -1 === (o = t.locateStrTrm.iso(e, a, n - 1)) || (i.mimeType = t.readStr.iso(e, a, o - a), a = o + 1, i.pictureType = e.getUint8(a), a += 1, -1 === (o = t.locateStrTrm[s](e, a, r + n - a)) || (i.description = t.readStr[s](e, a, o - a), a = o + ("ucs" === s ? 2 : 1), i.pictureData = new DataView(e.buffer, a, r + n - a))),
                                i
                            },
                            CHAP: function (r, n, i) {
                                var a = {
                                    encoding: r.getUint8(n)
                                },
                                o = t.locateStrTrm.iso(r, n, i - 1);
                                if (-1 === o)
                                    return a;
                                a.id = t.readStr.iso(r, n, o - n),
                                a.startTime = r.getUint32(o + 1),
                                a.endTime = r.getUint32(o + 5),
                                a.startOffset = r.getUint32(o + 9),
                                a.endOffset = r.getUint32(o + 13);
                                var s = o + 17;
                                for (a.frames = []; s < n + i; ) {
                                    var u = e.readId3v2TagFrame(r, s);
                                    a.frames.push(u),
                                    s += u.header.size + 10
                                }
                                return a
                            }
                        };
                        e.readId3v2TagFrame = function (e, i) {
                            var a = {
                                header: {
                                    id: t.readStr.iso(e, i, 4),
                                    size: e.getUint32(i + 4),
                                    flagsOctet1: e.getUint8(i + 8),
                                    flagsOctet2: e.getUint8(i + 9)
                                }
                            };
                            if (a.header.size < 1)
                                return a;
                            var o,
                            s,
                            u = (o = n, "TXXX" === (s = a.header.id) ? o.TXXX : "T" === s.charAt(0) ? o.T : "WXXX" === s ? o.WXXX : "W" === s.charAt(0) ? o.W : "COMM" === s || "USLT" === s ? o.COMM : o[s] || t.noOp);
                            return a.name = r[a.header.id],
                            a.content = u(e, i + 10, a.header.size),
                            a
                        },
                        e.readId3v2Tag = function (r, n) {
                            if (n || (n = 0), r.byteLength - n < 10)
                                return null;
                            if (!t.isSeq(t.seq.id3, r, n))
                                return null;
                            var i = r.getUint8(n + 5),
                            a = {
                                _section: {
                                    type: "ID3v2",
                                    offset: n
                                },
                                header: {
                                    majorVersion: r.getUint8(n + 3),
                                    minorRevision: r.getUint8(n + 4),
                                    flagsOctet: i,
                                    unsynchronisationFlag: 128 == (128 & i),
                                    extendedHeaderFlag: 64 == (64 & i),
                                    experimentalIndicatorFlag: 32 == (32 & i),
                                    size: t.unsynchsafe(r.getUint32(n + 6))
                                },
                                frames: []
                            };
                            a._section.byteLength = a.header.size + 10;
                            var o,
                            s = n + a._section.byteLength;
                            if (3 !== a.header.majorVersion)
                                return a;
                            for (n += 10; n < s && 0 !== r.getUint32(n) && (o = e.readId3v2TagFrame(r, n)); )
                                a.frames.push(o), n += o.header.size + 10;
                            return a
                        }
                    }
                    (t, r)
                })),
        i = t((function (e, t) {
                    !function (e, t) {
                        e.readXingTag = function (e, r) {
                            r || (r = 0);
                            var n = {
                                _section: {
                                    type: "Xing",
                                    offset: r
                                },
                                header: t.readFrameHeader(e, r)
                            },
                            i = n.header;
                            if (!i)
                                return null;
                            var a = r + t.getXingOffset(i.mpegAudioVersionBits, i.channelModeBits);
                            return e.byteLength < a + 4 ? null : (n.identifier = t.isSeq(t.seq.xing, e, a) ? "Xing" : t.isSeq(t.seq.info, e, a) && "Info", n.identifier ? (n._section.byteLength = t.getFrameByteLength(i.bitrate, i.samplingRate, i.framePadding, i.mpegAudioVersionBits, i.layerDescriptionBits), n._section.nextFrameIndex = r + n._section.byteLength, n) : null)
                        }
                    }
                    (t, r)
                })),
        a = t((function (e, t) {
                    !function (e, t, r, n) {
                        e.readFrameHeader = function (e, r) {
                            return t.readFrameHeader(e, r)
                        },
                        e.readFrame = function (e, r, n) {
                            return t.readFrame(e, r, n)
                        },
                        e.readLastFrame = function (t, r, n) {
                            r || (r = t.byteLength - 1);
                            for (var i = null; r >= 0; --r)
                                if (255 === t.getUint8(r) && (i = e.readFrame(t, r, n)))
                                    return i;
                            return null
                        },
                        e.readId3v2Tag = function (e, t) {
                            return r.readId3v2Tag(e, t)
                        },
                        e.readXingTag = function (e, t) {
                            return n.readXingTag(e, t)
                        },
                        e.readTags = function (t, r) {
                            r || (r = 0);
                            for (var n = [], i = null, a = !1, o = t.byteLength, s = [e.readId3v2Tag, e.readXingTag, e.readFrame], u = s.length; r < o && !a; ++r)
                                for (var d = 0; d < u; ++d)
                                    if (i = s[d](t, r)) {
                                        if (n.push(i), r += i._section.byteLength, "frame" === i._section.type) {
                                            a = !0;
                                            break
                                        }
                                        d = -1
                                    }
                            return n
                        }
                    }
                    (t, r, n, i)
                }));
        const o = ("undefined" != typeof navigator && navigator.hardwareConcurrency || 1) > 2 ? navigator.hardwareConcurrency : 4;
        function s(e, t, r) {
            return function (n) {
                e.push(function (e, t) {
                    const r = new Uint8Array(e.byteLength + t.byteLength);
                    return r.set(e, 0),
                    r.set(t, e.byteLength),
                    r.buffer
                }
                    (t, r.subarray(n.frames[0]._section.offset, n.frames[n.frames.length - 1]._section.offset + n.frames[n.frames.length - 1]._section.byteLength)))
            }
        }
        function u(e) {
            e.byteLength = 0,
            e.frames.length = 0
        }
        function d(e, t) {
            e.byteLength = e.byteLength + t._section.byteLength,
            e.frames.push(t)
        }
        const f = (e, t, r, n) => async() => {
            let i;
            for (; i = t.pop(); )
                n[e.get(i)] = await r(i)
        };
        function c(e, t) {
            return new Promise(e.decodeAudioData.bind(e, t))
        }
        e.getFileAudioBuffer = async function e(t, r, n = {}) {
            const {
                native: i = !1,
                concurrency: l = o
            } = n,
            g = await function (e) {
                return new Promise(t => {
                    let r = new FileReader;
                    r.onloadend = () => {
                        t(r.result)
                    },
                    r.readAsArrayBuffer(e)
                })
            }
            (t);
            if (i)
                return c(r, g);
            if (!!window.webkitAudioContext)
                return e(t, r, {
                    native: !0
                });
            const m = new DataView(g),
            p = a.readTags(m).pop(),
            h = new Uint8Array(g),
            v = [],
            T = s(v, h.subarray(0, p._section.offset), h);
            let y = {
                byteLength: 0,
                frames: []
            },
            S = p._section.offset + p._section.byteLength;
            for (; S; ) {
                const e = a.readFrame(m, S);
                if (S = e && e._section.nextFrameIndex, e) {
                    y && y.byteLength + e._section.byteLength >= 1e6 && (T(y), u(y)),
                    d(y, e)
                }
                !y || e && S || T(y)
            }
            const b = [],
            L = new Map(v.map((e, t) => [e, t])),
            P = new Array(v.length),
            I = c.bind(null, r);
            for (let e = 0; e < Math.min(l, L.size); e++)
                b.push(f(L, v, I, P)());
            await Promise.all(b);
            const {
                numberOfChannels: O,
                sampleRate: w
            } = P[0];
            let U = P.reduce((e, t) => e + t.length, 0);
            const B = r.createBuffer(O, U, w);
            for (let e = 0; e < O; e++) {
                const t = B.getChannelData(e);
                let r = 0;
                for (let n = 0; n < P.length; n++)
                    t.set(P[n].getChannelData(e), r), r += P[n].length
            }
            return B
        },
        Object.defineProperty(e, "__esModule", {
            value: !0
        })
    }));
