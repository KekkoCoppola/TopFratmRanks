// Video export.
// Primary path: WebCodecs (H.264 + AAC/Opus) muxed to MP4 with mp4-muxer — faster
// than realtime and frame accurate. Fallback: realtime capture via MediaRecorder (WebM).
(function () {
  'use strict';

  var FPS = 30;
  var W = TRV.renderer.W;
  var H = TRV.renderer.H;

  function slugify(text) {
    var s = (text || 'ranking').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return s || 'ranking';
  }

  function download(blob, filename) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 10000);
  }

  function seekTo(video, t) {
    return new Promise(function (resolve, reject) {
      t = Math.max(0, Math.min(t, video.duration - 0.001));
      if (Math.abs(video.currentTime - t) < 0.0005 && video.readyState >= 2) {
        resolve();
        return;
      }
      var timer = setTimeout(function () {
        video.removeEventListener('seeked', onSeeked);
        reject(new Error('Seek timed out while reading a clip.'));
      }, 10000);
      function onSeeked() {
        clearTimeout(timer);
        video.removeEventListener('seeked', onSeeked);
        resolve();
      }
      video.addEventListener('seeked', onSeeked);
      video.currentTime = t;
    });
  }

  /* ================= WebCodecs + mp4-muxer path ================= */

  function pickVideoConfig() {
    var candidates = ['avc1.640028', 'avc1.4d0028', 'avc1.420028', 'avc1.640032'];
    var base = { width: W, height: H, bitrate: 8000000, framerate: FPS };
    var chain = Promise.resolve(null);
    candidates.forEach(function (codec) {
      chain = chain.then(function (found) {
        if (found) return found;
        var cfg = Object.assign({ codec: codec }, base);
        return VideoEncoder.isConfigSupported(cfg).then(function (res) {
          return res.supported ? cfg : null;
        }).catch(function () { return null; });
      });
    });
    return chain;
  }

  function pickAudioConfig() {
    var candidates = [
      { codec: 'mp4a.40.2', muxCodec: 'aac' },
      { codec: 'opus', muxCodec: 'opus' }
    ];
    var base = { sampleRate: 44100, numberOfChannels: 2, bitrate: 128000 };
    if (typeof AudioEncoder === 'undefined') return Promise.resolve(null);
    var chain = Promise.resolve(null);
    candidates.forEach(function (c) {
      chain = chain.then(function (found) {
        if (found) return found;
        var cfg = Object.assign({ codec: c.codec }, base);
        return AudioEncoder.isConfigSupported(cfg).then(function (res) {
          return res.supported ? { config: cfg, muxCodec: c.muxCodec } : null;
        }).catch(function () { return null; });
      });
    });
    return chain;
  }

  // Mix all clip audio tracks into one 44.1kHz stereo buffer laid out on the timeline.
  async function renderAudioTimeline(tl) {
    var sampleRate = 44100;
    var length = Math.max(1, Math.ceil(tl.total * sampleRate));
    var octx = new OfflineAudioContext(2, length, sampleRate);
    var hasAudio = false;
    for (var i = 0; i < tl.segs.length; i++) {
      var seg = tl.segs[i];
      try {
        var ab = await seg.clip.file.arrayBuffer();
        var buf = await octx.decodeAudioData(ab);
        var src = octx.createBufferSource();
        src.buffer = buf;
        src.connect(octx.destination);
        src.start(seg.start, 0, Math.min(buf.duration, seg.clip.duration));
        hasAudio = true;
      } catch (e) {
        // clip without a decodable audio track -> silence for this segment
      }
    }
    if (!hasAudio) return null;
    return octx.startRendering();
  }

  async function exportMp4(tl, onProgress) {
    var videoCfg = await pickVideoConfig();
    if (!videoCfg) throw new Error('H.264 encoding not supported here.');

    onProgress({ stage: 'Preparing audio…', pct: 0.02 });
    var audioPick = await pickAudioConfig();
    var audioBuffer = audioPick ? await renderAudioTimeline(tl) : null;

    var muxer = new Mp4Muxer.Muxer({
      target: new Mp4Muxer.ArrayBufferTarget(),
      video: { codec: 'avc', width: W, height: H },
      audio: (audioPick && audioBuffer)
        ? { codec: audioPick.muxCodec, sampleRate: 44100, numberOfChannels: 2 }
        : undefined,
      fastStart: 'in-memory'
    });

    var encodeError = null;

    var videoEncoder = new VideoEncoder({
      output: function (chunk, meta) { muxer.addVideoChunk(chunk, meta); },
      error: function (e) { encodeError = e; }
    });
    videoEncoder.configure(videoCfg);

    // --- video frames: step through the timeline, seeking each clip frame by frame ---
    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');

    var totalFrames = Math.max(1, Math.round(tl.total * FPS));
    var frame = 0;
    var revealedSet = new Set();

    for (var s = 0; s < tl.segs.length; s++) {
      var seg = tl.segs[s];
      var video = seg.clip.video;
      video.pause();
      video.muted = true;
      revealedSet.add(seg.rankIndex);

      var segFrames = Math.round(seg.clip.duration * FPS);
      for (var f = 0; f < segFrames && frame < totalFrames; f++, frame++) {
        if (encodeError) throw encodeError;
        var localT = f / FPS;
        await seekTo(video, localT);
        TRV.renderer.drawFrame(ctx, TRV.state, {
          videoEl: video,
          revealedSet: revealedSet,
          activeRank: seg.rankIndex
        });
        var vf = new VideoFrame(canvas, {
          timestamp: Math.round(frame / FPS * 1e6),
          duration: Math.round(1e6 / FPS)
        });
        videoEncoder.encode(vf, { keyFrame: frame % 150 === 0 });
        vf.close();
        while (videoEncoder.encodeQueueSize > 8) {
          await new Promise(function (r) { setTimeout(r, 5); });
        }
        if (frame % 10 === 0) {
          onProgress({
            stage: 'Rendering clip ' + (s + 1) + '/' + tl.segs.length +
                   ' — frame ' + (frame + 1) + '/' + totalFrames,
            pct: 0.05 + 0.8 * (frame / totalFrames)
          });
        }
      }
    }
    await videoEncoder.flush();
    videoEncoder.close();
    if (encodeError) throw encodeError;

    // --- audio ---
    if (audioPick && audioBuffer) {
      onProgress({ stage: 'Encoding audio…', pct: 0.88 });
      var audioError = null;
      var audioEncoder = new AudioEncoder({
        output: function (chunk, meta) { muxer.addAudioChunk(chunk, meta); },
        error: function (e) { audioError = e; }
      });
      audioEncoder.configure(audioPick.config);

      var chunkSize = 4410; // 100 ms
      var len = audioBuffer.length;
      var ch0 = audioBuffer.getChannelData(0);
      var ch1 = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : ch0;
      for (var off = 0; off < len; off += chunkSize) {
        if (audioError) throw audioError;
        var n = Math.min(chunkSize, len - off);
        var data = new Float32Array(n * 2);
        data.set(ch0.subarray(off, off + n), 0);
        data.set(ch1.subarray(off, off + n), n);
        var ad = new AudioData({
          format: 'f32-planar',
          sampleRate: 44100,
          numberOfFrames: n,
          numberOfChannels: 2,
          timestamp: Math.round(off / 44100 * 1e6),
          data: data
        });
        audioEncoder.encode(ad);
        ad.close();
        while (audioEncoder.encodeQueueSize > 8) {
          await new Promise(function (r) { setTimeout(r, 5); });
        }
      }
      await audioEncoder.flush();
      audioEncoder.close();
      if (audioError) throw audioError;
    }

    onProgress({ stage: 'Finalizing MP4…', pct: 0.97 });
    muxer.finalize();
    var blob = new Blob([muxer.target.buffer], { type: 'video/mp4' });
    var filename = slugify(TRV.state.title.text) + '.mp4';
    download(blob, filename);
    return { filename: filename };
  }

  /* ================= MediaRecorder realtime fallback ================= */

  function pickRecorderMime() {
    var candidates = [
      'video/mp4;codecs="avc1.640028,mp4a.40.2"',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm'
    ];
    for (var i = 0; i < candidates.length; i++) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(candidates[i])) return candidates[i];
    }
    return null;
  }

  function exportRealtime(tl, onProgress) {
    return new Promise(function (resolve, reject) {
      var mime = pickRecorderMime();
      if (!mime) { reject(new Error('No supported recording format in this browser.')); return; }
      var isMp4 = mime.indexOf('mp4') !== -1;

      var canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      var ctx = canvas.getContext('2d');

      // Fresh, muted-to-speakers video elements: audio is routed into the recording
      // through an AudioContext instead of the speakers.
      var actx = new AudioContext();
      var dest = actx.createMediaStreamDestination();
      var players = tl.segs.map(function (seg) {
        var v = document.createElement('video');
        v.src = seg.clip.url;
        v.preload = 'auto';
        try {
          var src = actx.createMediaElementSource(v);
          src.connect(dest);
        } catch (e) { /* clip without audio still plays fine */ }
        return v;
      });

      var stream = canvas.captureStream(FPS);
      dest.stream.getAudioTracks().forEach(function (t) { stream.addTrack(t); });

      var recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8000000 });
      var parts = [];
      recorder.ondataavailable = function (e) { if (e.data.size) parts.push(e.data); };
      recorder.onstop = function () {
        actx.close();
        var ext = isMp4 ? '.mp4' : '.webm';
        var blob = new Blob(parts, { type: mime.split(';')[0] });
        var filename = slugify(TRV.state.title.text) + ext;
        download(blob, filename);
        resolve({ filename: filename });
      };
      recorder.onerror = function (e) { reject(e.error || new Error('Recording failed.')); };

      var segIndex = 0;
      var revealedSet = new Set();
      var stopped = false;

      function drawLoop() {
        if (stopped) return;
        var seg = tl.segs[segIndex];
        TRV.renderer.drawFrame(ctx, TRV.state, {
          videoEl: players[segIndex],
          revealedSet: revealedSet,
          activeRank: seg ? seg.rankIndex : -1
        });
        var t = seg ? seg.start + players[segIndex].currentTime : tl.total;
        onProgress({
          stage: 'Recording in realtime… ' + Math.round(t) + 's / ' + Math.round(tl.total) + 's',
          pct: Math.min(0.98, t / tl.total)
        });
        requestAnimationFrame(drawLoop);
      }

      function playSegment(i) {
        if (i >= tl.segs.length) {
          stopped = true;
          recorder.stop();
          return;
        }
        segIndex = i;
        revealedSet.add(tl.segs[i].rankIndex);
        var v = players[i];
        v.onended = function () { playSegment(i + 1); };
        v.play().catch(function (err) { reject(err); });
      }

      recorder.start(500);
      playSegment(0);
      requestAnimationFrame(drawLoop);
    });
  }

  /* ================= public API ================= */

  TRV.exportVideo = async function (onProgress) {
    onProgress = onProgress || function () {};
    var tl = TRV.preview.getTimeline();
    if (!tl.segs.length) throw new Error('Load at least one clip first.');

    var canWebCodecs = typeof VideoEncoder !== 'undefined' && typeof Mp4Muxer !== 'undefined';
    if (canWebCodecs) {
      try {
        return await exportMp4(tl, onProgress);
      } catch (e) {
        console.warn('WebCodecs export failed, falling back to realtime recording:', e);
        onProgress({ stage: 'Fast export unavailable — recording in realtime instead…', pct: 0 });
      }
    }
    return exportRealtime(tl, onProgress);
  };
})();
