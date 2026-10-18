// Live preview: plays clips in playbackOrder on the canvas with audio,
// revealing rank labels as each clip starts. Idle mode shows everything revealed.
(function () {
  'use strict';

  var canvas = document.getElementById('preview-canvas');
  var ctx = canvas.getContext('2d');
  var playBtn = document.getElementById('btn-play');
  var playIcon = playBtn.querySelector('.play-icon');
  var pauseIcon = playBtn.querySelector('.pause-icon');
  var progressBar = document.getElementById('progress-bar');     // .ss-timeline__lanes: pointer target, holds --t
  var progressScrub = document.getElementById('progress-scrub'); // .ss-scrub: role=slider, keyboard
  var timeDisplay = document.getElementById('time-display');

  var playing = false;
  var started = false;       // false = idle preview (everything revealed)
  var segIndex = 0;
  var raf = 0;

  function getTimeline() {
    var segs = [];
    var acc = 0;
    TRV.state.playbackOrder.forEach(function (ri) {
      var clip = TRV.state.clips[ri];
      if (!clip) return;
      segs.push({ rankIndex: ri, clip: clip, start: acc, end: acc + clip.duration });
      acc += clip.duration;
    });
    return { segs: segs, total: acc };
  }

  function fmt(sec) {
    if (!isFinite(sec)) sec = 0;
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function currentTime(tl) {
    if (!tl.segs.length || segIndex >= tl.segs.length) return 0;
    var seg = tl.segs[segIndex];
    return seg.start + Math.min(seg.clip.video.currentTime, seg.clip.duration);
  }

  function revealedUpTo(tl, index) {
    var set = new Set();
    for (var i = 0; i <= index && i < tl.segs.length; i++) set.add(tl.segs[i].rankIndex);
    return set;
  }

  var barTime = 0; // last position shown on the bar (seconds), for keyboard seeking

  function updateBar(t, total) {
    var pct = total > 0 ? (t / total * 100) : 0;
    barTime = t;
    // the kit timeline draws the fill and the playhead from --t
    progressBar.style.setProperty('--t', pct + '%');
    timeDisplay.innerHTML = '<b>' + fmt(t) + '</b> / ' + fmt(total);
    progressScrub.setAttribute('aria-valuemax', String(Math.round(total * 10) / 10));
    progressScrub.setAttribute('aria-valuenow', String(Math.round(t * 10) / 10));
    progressScrub.setAttribute('aria-valuetext', fmt(t) + ' / ' + fmt(total));
  }

  // Play button: icon and label follow the state (labels in both languages)
  function setPlayIcon(isPlaying) {
    // SVG elements have no .hidden property: toggle the attribute
    playIcon.toggleAttribute('hidden', isPlaying);
    pauseIcon.toggleAttribute('hidden', !isPlaying);
    var label = TRV.t(isPlaying ? 'pause' : 'playPreview');
    playBtn.setAttribute('aria-label', label);
    playBtn.title = label;
  }

  // Idle: show the first frame of the first clip with ALL names revealed,
  // so the user sees the complete design while editing.
  function drawIdle() {
    var tl = getTimeline();
    var all = new Set();
    tl.segs.forEach(function (s) { all.add(s.rankIndex); });
    var v = tl.segs.length ? tl.segs[0].clip.video : null;
    TRV.renderer.drawFrame(ctx, TRV.state, { videoEl: v, revealedSet: all, activeRank: -1 });
    updateBar(0, tl.total);
  }

  function drawPlaying() {
    var tl = getTimeline();
    if (!tl.segs.length) { stop(); drawIdle(); return; }
    if (segIndex >= tl.segs.length) segIndex = tl.segs.length - 1;
    var seg = tl.segs[segIndex];
    TRV.renderer.drawFrame(ctx, TRV.state, {
      videoEl: seg.clip.video,
      revealedSet: revealedUpTo(tl, segIndex),
      activeRank: seg.rankIndex
    });
    updateBar(currentTime(tl), tl.total);
  }

  function tick() {
    if (!playing) return;
    var tl = getTimeline();
    if (!tl.segs.length) { stop(); drawIdle(); return; }
    var seg = tl.segs[segIndex];
    if (seg.clip.video.ended || seg.clip.video.currentTime >= seg.clip.duration - 0.02) {
      seg.clip.video.pause();
      if (segIndex + 1 < tl.segs.length) {
        segIndex++;
        startSegment(tl.segs[segIndex]);
      } else {
        // reached the end
        playing = false;
        setPlayIcon(false);
        drawPlaying();
        return;
      }
    }
    drawPlaying();
    raf = requestAnimationFrame(tick);
  }

  function startSegment(seg) {
    var v = seg.clip.video;
    v.muted = false;
    v.currentTime = 0;
    v.play().catch(function () { /* autoplay block should not happen after a click */ });
  }

  function pauseAll() {
    TRV.state.clips.forEach(function (c) { if (c) c.video.pause(); });
  }

  function play() {
    var tl = getTimeline();
    if (!tl.segs.length) return;
    if (!started || segIndex >= tl.segs.length) {
      started = true;
      segIndex = 0;
      startSegment(tl.segs[0]);
    } else {
      var seg = tl.segs[segIndex];
      seg.clip.video.muted = false;
      seg.clip.video.play();
    }
    playing = true;
    setPlayIcon(true);
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  }

  function pause() {
    playing = false;
    setPlayIcon(false);
    pauseAll();
    cancelAnimationFrame(raf);
  }

  function stop() {
    playing = false;
    started = false;
    segIndex = 0;
    setPlayIcon(false);
    pauseAll();
    cancelAnimationFrame(raf);
  }

  function seek(t) {
    var tl = getTimeline();
    if (!tl.segs.length) return;
    t = Math.max(0, Math.min(t, tl.total - 0.05));
    pauseAll();
    for (var i = 0; i < tl.segs.length; i++) {
      if (t < tl.segs[i].end || i === tl.segs.length - 1) {
        segIndex = i;
        started = true;
        var seg = tl.segs[i];
        seg.clip.video.currentTime = Math.max(0, t - seg.start);
        if (playing) {
          seg.clip.video.muted = false;
          seg.clip.video.play();
        } else {
          // draw once the seek lands
          seg.clip.video.addEventListener('seeked', function onSeeked() {
            seg.clip.video.removeEventListener('seeked', onSeeked);
            drawPlaying();
          });
        }
        updateBar(t, tl.total);
        break;
      }
    }
  }

  // Seek to the segment for a specific rank index (used by click-to-preview on clips)
  function seekToRank(rankIndex) {
    var tl = getTimeline();
    for (var i = 0; i < tl.segs.length; i++) {
      if (tl.segs[i].rankIndex === rankIndex) {
        var wasPlaying = playing;
        if (wasPlaying) pause();
        seek(tl.segs[i].start);
        return;
      }
    }
  }

  playBtn.addEventListener('click', function () {
    if (playing) pause(); else play();
  });

  /* ---------- Pointer-capture slider ---------- */
  var scrubbing = false;

  function getTimeFromPointer(e) {
    var rect = progressBar.getBoundingClientRect();
    var ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    var tl = getTimeline();
    return ratio * tl.total;
  }

  progressBar.addEventListener('pointerdown', function (e) {
    var tl = getTimeline();
    if (!tl.segs.length) return;
    e.preventDefault();
    scrubbing = true;
    progressBar.classList.add('scrubbing');
    progressBar.setPointerCapture(e.pointerId);
    // Pause playback while scrubbing
    if (playing) pause();
    seek(getTimeFromPointer(e));
  });

  progressBar.addEventListener('pointermove', function (e) {
    if (!scrubbing) return;
    e.preventDefault();
    seek(getTimeFromPointer(e));
  });

  progressBar.addEventListener('pointerup', function (e) {
    if (!scrubbing) return;
    scrubbing = false;
    progressBar.classList.remove('scrubbing');
    progressBar.releasePointerCapture(e.pointerId);
  });

  progressBar.addEventListener('pointercancel', function (e) {
    if (!scrubbing) return;
    scrubbing = false;
    progressBar.classList.remove('scrubbing');
  });

  // Keyboard on the slider: ←/→ one second, Home/End start/end
  progressScrub.addEventListener('keydown', function (e) {
    var tl = getTimeline();
    if (!tl.segs.length) return;
    var t = barTime;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') t -= 1;
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') t += 1;
    else if (e.key === 'Home') t = 0;
    else if (e.key === 'End') t = tl.total;
    else return;
    e.preventDefault();
    seek(Math.max(0, Math.min(t, tl.total)));
  });

  TRV.onLang(function () { setPlayIcon(playing); });

  // Redraw whenever the editor state changes (unless mid-playback: tick handles it).
  function redraw() {
    playBtn.disabled = TRV.loadedClipCount() === 0;
    if (playing) return;
    if (started) drawPlaying(); else drawIdle();
  }

  TRV.onChange(redraw);

  // When editing anything, drop back to idle mode so the user sees the full design.
  TRV.preview = {
    redraw: redraw,
    getTimeline: getTimeline,
    seekToRank: seekToRank,
    stop: function () { stop(); drawIdle(); },
    isPlaying: function () { return playing; }
  };

  // First paint + repaint once webfonts are in.
  redraw();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { redraw(); });
  }
})();
