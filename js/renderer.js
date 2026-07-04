// Shared frame renderer: draws one full 1080x1920 frame from state + playback info.
// Used by BOTH the live preview and the exporter so output always matches preview.
(function () {
  'use strict';

  var W = 1080;
  var H = 1920;

  function titleFontString(state, size) {
    var t = state.title;
    return (t.italic ? 'italic ' : '') +
           (t.bold ? '900 ' : '400 ') +
           size + 'px "' + t.font + '", "Arial Black", sans-serif';
  }

  // Split title into centered lines that fit the canvas width, keeping word indexes
  // so per-word colors survive wrapping.
  function wrapTitle(ctx, state) {
    var words = TRV.titleWords();
    if (!words.length) return [];
    ctx.font = titleFontString(state, state.title.size);
    var spaceW = ctx.measureText(' ').width;
    var maxW = W - 80;
    var lines = [];
    var line = [];
    var lineW = 0;

    for (var i = 0; i < words.length; i++) {
      var wordW = ctx.measureText(words[i]).width;
      var addW = line.length ? spaceW + wordW : wordW;
      if (line.length && lineW + addW > maxW) {
        lines.push({ words: line, width: lineW });
        line = [];
        lineW = 0;
        addW = wordW;
      }
      line.push({ text: words[i], index: i, width: wordW });
      lineW += addW;
    }
    if (line.length) lines.push({ words: line, width: lineW });
    return lines;
  }

  // Compute title extent and the fixed positions of the rank numbers.
  function layout(ctx, state) {
    var size = state.title.size;
    var lines = wrapTitle(ctx, state);
    var lineH = Math.round(size * 1.18);
    var titleTop = 70;
    var titleBottomY = lines.length ? titleTop + lines.length * lineH + 44 : 60;

    var N = state.rankCount;
    var zoneTop = titleBottomY + 90;
    var zoneBottom = H - 170;
    var slotFont = Math.max(48, Math.min(88, Math.floor((zoneBottom - zoneTop) / N * 0.45)));

    var slots = [];
    for (var i = 0; i < N; i++) {
      var y = N === 1
        ? (zoneTop + zoneBottom) / 2
        : zoneTop + (zoneBottom - zoneTop) * (i / (N - 1));
      slots.push({ x: 56, y: y, fontSize: slotFont });
    }
    return { lines: lines, lineH: lineH, titleTop: titleTop, titleBottomY: titleBottomY, slots: slots };
  }

  function strokeAndFill(ctx, text, x, y, fillColor, strokeColor, strokeW) {
    if (strokeW > 0) {
      ctx.lineWidth = strokeW;
      ctx.strokeStyle = strokeColor;
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeText(text, x, y);
    }
    ctx.fillStyle = fillColor;
    ctx.fillText(text, x, y);
  }

  // playback: { videoEl: HTMLVideoElement|null, revealedSet: Set<rankIndex>, activeRank: number|-1 }
  function drawFrame(ctx, state, playback) {
    playback = playback || {};
    var revealed = playback.revealedSet || new Set();

    // background
    ctx.fillStyle = state.bgColor;
    ctx.fillRect(0, 0, W, H);

    var L = layout(ctx, state);

    // current clip frame (between title band and bottom)
    var v = playback.videoEl;
    if (v && v.videoWidth) {
      var zoneTop = L.titleBottomY;
      var availH = H - zoneTop;
      var fitWidthH = v.videoHeight * (W / v.videoWidth);
      var s = fitWidthH <= availH ? (W / v.videoWidth) : Math.min(W / v.videoWidth, availH / v.videoHeight);
      var dw = v.videoWidth * s;
      var dh = v.videoHeight * s;
      ctx.drawImage(v, (W - dw) / 2, zoneTop + (availH - dh) / 2, dw, dh);
    }

    // title
    var t = state.title;
    if (L.lines.length) {
      ctx.font = titleFontString(state, t.size);
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      var spaceW = ctx.measureText(' ').width;
      var strokeW = t.stroke.on ? t.stroke.width : 0;
      for (var li = 0; li < L.lines.length; li++) {
        var line = L.lines[li];
        var x = (W - line.width) / 2;
        var y = L.titleTop + li * L.lineH;
        for (var wi = 0; wi < line.words.length; wi++) {
          var w = line.words[wi];
          strokeAndFill(ctx, w.text, x, y, t.wordColors[w.index] || '#FFFFFF', t.stroke.color, strokeW);
          x += w.width + spaceW;
        }
      }
    }

    // rank numbers + revealed labels (always on top of the clip)
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    for (var i = 0; i < L.slots.length; i++) {
      var slot = L.slots[i];
      var isRevealed = revealed.has(i);
      var numText = (i + 1) + '.';
      var numFont = '400 ' + slot.fontSize + 'px "Luckiest Guy", "Arial Black", sans-serif';
      ctx.font = numFont;
      var numW = ctx.measureText(numText).width;
      var numStroke = Math.max(6, Math.round(slot.fontSize * 0.16));
      strokeAndFill(ctx, numText, slot.x, slot.y,
        isRevealed ? TRV.getRankColor(i) : '#FFFFFF', '#000000', numStroke);

      if (isRevealed) {
        var clip = state.clips[i];
        var label = clip && clip.name ? clip.name : '';
        if (label) {
          var labelSize = Math.round(slot.fontSize * 0.78);
          ctx.font = '700 ' + labelSize + 'px "' + t.font + '", "Arial Black", sans-serif';
          strokeAndFill(ctx, label, slot.x + numW + 18, slot.y,
            '#FFFFFF', '#000000', Math.max(5, Math.round(labelSize * 0.14)));
        }
      }
    }
  }

  TRV.renderer = {
    W: W,
    H: H,
    layout: layout,
    drawFrame: drawFrame
  };
})();
