// Shared editor state + clip loading. Exposed as the global TRV namespace.
(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  var rankCount = parseInt(params.get('rank'), 10);
  if (!isFinite(rankCount)) rankCount = 5;
  rankCount = Math.max(1, Math.min(10, rankCount));

  var state = {
    rankCount: rankCount,
    title: {
      text: '',
      font: 'Anton',
      size: 88,
      bold: false,
      italic: false,
      stroke: { on: true, width: 8, color: '#000000' },
      wordColors: [] // parallel to title words; missing entries default to white
    },
    bgColor: '#000000',
    clipFit: 'fit',             // 'fit' = whole clip visible | 'fill' = full width, cropped
    rankNumberSize: 72,         // rank number font size (px on the 1080x1920 canvas)
    rankNumberGap: 150,         // vertical distance between consecutive rank numbers (px)
    rankColorMode: 'auto',      // 'auto' | 'single' | 'custom'
    rankSingleColor: '#FFD700',
    rankCustomColors: [],       // [rankIndex] -> css color
    clips: [],                  // [rankIndex] -> clip object | null
    playbackOrder: [],          // rankIndexes in play order
    orderCustomized: false      // true once the user drags the order manually
  };

  for (var i = 0; i < rankCount; i++) {
    state.clips.push(null);
    state.rankCustomColors.push('#FFD700');
  }

  var listeners = [];

  function onChange(fn) { listeners.push(fn); }

  function emitChange() {
    for (var j = 0; j < listeners.length; j++) listeners[j]();
  }

  function titleWords() {
    return state.title.text.split(/\s+/).filter(function (w) { return w.length; });
  }

  function getRankColor(rankIndex) {
    if (state.rankColorMode === 'single') return state.rankSingleColor;
    if (state.rankColorMode === 'custom') return state.rankCustomColors[rankIndex] || '#FFD700';
    // auto: yellow (#1) -> red (#N)
    var n = Math.max(1, state.rankCount - 1);
    var hue = Math.round(52 * (1 - rankIndex / n));
    return 'hsl(' + hue + ', 100%, 55%)';
  }

  // Keep playbackOrder consistent with loaded clips.
  // Until the user reorders manually, default to countdown (#N first, #1 last).
  function syncPlaybackOrder() {
    var loaded = [];
    for (var i = state.rankCount - 1; i >= 0; i--) {
      if (state.clips[i]) loaded.push(i);
    }
    if (!state.orderCustomized) {
      state.playbackOrder = loaded;
      return;
    }
    var loadedSet = {};
    loaded.forEach(function (i) { loadedSet[i] = true; });
    state.playbackOrder = state.playbackOrder.filter(function (i) { return loadedSet[i]; });
    loaded.forEach(function (i) {
      if (state.playbackOrder.indexOf(i) === -1) state.playbackOrder.push(i);
    });
  }

  // Load a video file into a rank slot. Resolves with the clip, rejects if not decodable.
  function loadClip(rankIndex, file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var video = document.createElement('video');
      video.preload = 'auto';
      video.src = url;

      video.onloadedmetadata = function () {
        if (!video.videoWidth || !video.duration || !isFinite(video.duration)) {
          URL.revokeObjectURL(url);
          reject(new Error('This file has no readable video track.'));
          return;
        }
        var previous = state.clips[rankIndex];
        var clip = {
          file: file,
          url: url,
          name: previous ? previous.name : '',
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          video: video
        };
        if (previous) URL.revokeObjectURL(previous.url);
        state.clips[rankIndex] = clip;
        syncPlaybackOrder();
        resolve(clip);
      };

      video.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('Cannot decode this video. Use MP4 (H.264) or WebM.'));
      };
    });
  }

  function removeClip(rankIndex) {
    var clip = state.clips[rankIndex];
    if (clip) {
      clip.video.pause();
      URL.revokeObjectURL(clip.url);
      state.clips[rankIndex] = null;
      syncPlaybackOrder();
    }
  }

  function loadedClipCount() {
    return state.clips.filter(function (c) { return !!c; }).length;
  }

  var MAX_RANKS = 10;

  // Append a new empty rank slot at the end. Returns false if already at the cap.
  function addRank() {
    if (state.rankCount >= MAX_RANKS) return false;
    state.clips.push(null);
    state.rankCustomColors.push('#FFD700');
    state.rankCount++;
    syncPlaybackOrder();
    return true;
  }

  // Remove a rank slot entirely (not just its clip), compacting the ranks above it
  // down by one so numbering stays contiguous. Returns false if it's the last rank.
  function removeRank(rankIndex) {
    if (state.rankCount <= 1) return false;
    var clip = state.clips[rankIndex];
    if (clip) {
      clip.video.pause();
      URL.revokeObjectURL(clip.url);
    }
    state.clips.splice(rankIndex, 1);
    state.rankCustomColors.splice(rankIndex, 1);
    state.rankCount--;
    state.playbackOrder = state.playbackOrder
      .filter(function (ri) { return ri !== rankIndex; })
      .map(function (ri) { return ri > rankIndex ? ri - 1 : ri; });
    return true;
  }

  // Reassign a clip to a different rank number (the label/number it reveals).
  // If the target rank is occupied the two clips swap ranks.
  // Play positions are preserved: only the rank indexes are remapped.
  function setClipRank(fromRank, toRank) {
    if (fromRank === toRank || !state.clips[fromRank]) return;
    var moving = state.clips[fromRank];
    state.clips[fromRank] = state.clips[toRank] || null;
    state.clips[toRank] = moving;
    state.playbackOrder = state.playbackOrder.map(function (ri) {
      if (ri === fromRank) return toRank;
      if (ri === toRank) return fromRank;
      return ri;
    });
  }

  // Move a clip within the play sequence (drag & drop of the clip cards).
  function movePlayback(fromPos, toPos) {
    if (fromPos === toPos || fromPos < 0 || toPos < 0 ||
        fromPos >= state.playbackOrder.length || toPos >= state.playbackOrder.length) return;
    var moved = state.playbackOrder.splice(fromPos, 1)[0];
    state.playbackOrder.splice(toPos, 0, moved);
    state.orderCustomized = true;
  }

  // Shuffle playbackOrder (Fisher-Yates) among loaded clips.
  function shufflePlaybackOrder() {
    var loaded = [];
    for (var i = 0; i < state.rankCount; i++) {
      if (state.clips[i]) loaded.push(i);
    }
    for (var j = loaded.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = loaded[j];
      loaded[j] = loaded[k];
      loaded[k] = tmp;
    }
    state.playbackOrder = loaded;
    state.orderCustomized = true;
  }

  // Back to the default countdown order (#N first, #1 last).
  function resetPlaybackOrder() {
    state.orderCustomized = false;
    syncPlaybackOrder();
  }

  window.TRV = {
    state: state,
    onChange: onChange,
    emitChange: emitChange,
    titleWords: titleWords,
    getRankColor: getRankColor,
    syncPlaybackOrder: syncPlaybackOrder,
    shufflePlaybackOrder: shufflePlaybackOrder,
    setClipRank: setClipRank,
    movePlayback: movePlayback,
    resetPlaybackOrder: resetPlaybackOrder,
    loadClip: loadClip,
    removeClip: removeClip,
    loadedClipCount: loadedClipCount,
    addRank: addRank,
    removeRank: removeRank,
    MAX_RANKS: MAX_RANKS
  };
})();
