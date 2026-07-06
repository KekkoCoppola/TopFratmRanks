// Editor UI: wires all controls to TRV.state and rebuilds dynamic lists.
(function () {
  'use strict';

  var state = TRV.state;

  /* ---------- header ---------- */
  document.getElementById('rank-display').textContent = 'Ranking: Top ' + state.rankCount;
  document.title = 'TopRankVids — Top ' + state.rankCount + ' Editor';

  /* ---------- collapsible sections ---------- */
  document.querySelectorAll('.section-header').forEach(function (header) {
    header.addEventListener('click', function () {
      header.parentElement.classList.toggle('collapsed');
    });
  });

  /* ---------- title controls ---------- */
  var titleInput = document.getElementById('title-input');
  var wordsContainer = document.getElementById('title-words');
  var hiddenPicker = document.getElementById('hidden-color-picker');
  var pickerTarget = null; // {kind:'word'|'rank', index}

  titleInput.addEventListener('input', function () {
    state.title.text = titleInput.value;
    // keep existing word colors by position; new words default to white
    var words = TRV.titleWords();
    state.title.wordColors = words.map(function (_, i) {
      return state.title.wordColors[i] || '#FFFFFF';
    });
    rebuildWordChips();
    TRV.emitChange();
  });

  function rebuildWordChips() {
    wordsContainer.innerHTML = '';
    var words = TRV.titleWords();
    if (!words.length) {
      var hint = document.createElement('span');
      hint.className = 'words-hint';
      hint.textContent = 'Type a title above to color each word';
      wordsContainer.appendChild(hint);
      return;
    }
    words.forEach(function (word, i) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'word-chip';
      chip.textContent = word;
      chip.style.color = state.title.wordColors[i] || '#FFFFFF';
      chip.title = 'Change color of "' + word + '"';
      chip.addEventListener('click', function () {
        pickerTarget = { kind: 'word', index: i };
        hiddenPicker.value = toHex(state.title.wordColors[i] || '#FFFFFF');
        hiddenPicker.click();
      });
      wordsContainer.appendChild(chip);
    });
  }

  hiddenPicker.addEventListener('input', function () {
    if (!pickerTarget) return;
    if (pickerTarget.kind === 'word') {
      state.title.wordColors[pickerTarget.index] = hiddenPicker.value;
      rebuildWordChips();
    } else if (pickerTarget.kind === 'rank') {
      state.rankCustomColors[pickerTarget.index] = hiddenPicker.value;
      rebuildRankCustomColors();
    }
    TRV.emitChange();
  });

  function toHex(color) {
    if (/^#[0-9a-f]{6}$/i.test(color)) return color;
    var c = document.createElement('canvas').getContext('2d');
    c.fillStyle = color;
    return c.fillStyle; // normalizes to #rrggbb
  }

  var fontSelect = document.getElementById('font-select');
  fontSelect.addEventListener('change', function () {
    state.title.font = fontSelect.value;
    loadFontThenRedraw(fontSelect.value);
  });

  function loadFontThenRedraw(family) {
    if (document.fonts && document.fonts.load) {
      Promise.all([
        document.fonts.load('400 40px "' + family + '"'),
        document.fonts.load('700 40px "' + family + '"')
      ]).then(function () { TRV.emitChange(); }).catch(function () { TRV.emitChange(); });
    } else {
      TRV.emitChange();
    }
  }

  var fontSize = document.getElementById('font-size');
  fontSize.addEventListener('input', function () {
    var v = parseInt(fontSize.value, 10);
    if (isFinite(v)) {
      state.title.size = Math.max(40, Math.min(160, v));
      TRV.emitChange();
    }
  });

  var boldBtn = document.getElementById('btn-bold');
  var italicBtn = document.getElementById('btn-italic');
  boldBtn.addEventListener('click', function () {
    state.title.bold = !state.title.bold;
    boldBtn.classList.toggle('active', state.title.bold);
    TRV.emitChange();
  });
  italicBtn.addEventListener('click', function () {
    state.title.italic = !state.title.italic;
    italicBtn.classList.toggle('active', state.title.italic);
    TRV.emitChange();
  });

  var strokeToggle = document.getElementById('stroke-toggle');
  var strokeWidth = document.getElementById('stroke-width');
  var strokeColor = document.getElementById('stroke-color');
  strokeToggle.addEventListener('click', function () {
    state.title.stroke.on = !state.title.stroke.on;
    strokeToggle.classList.toggle('active', state.title.stroke.on);
    TRV.emitChange();
  });
  strokeWidth.addEventListener('input', function () {
    var v = parseInt(strokeWidth.value, 10);
    if (isFinite(v)) { state.title.stroke.width = Math.max(0, Math.min(24, v)); TRV.emitChange(); }
  });
  strokeColor.addEventListener('input', function () {
    state.title.stroke.color = strokeColor.value;
    TRV.emitChange();
  });

  /* ---------- general settings ---------- */
  var bgColor = document.getElementById('bg-color');
  bgColor.addEventListener('input', function () {
    state.bgColor = bgColor.value;
    TRV.emitChange();
  });

  var clipFit = document.getElementById('clip-fit');
  clipFit.addEventListener('change', function () {
    state.clipFit = clipFit.value;
    TRV.emitChange();
  });

  var rankNumberSize = document.getElementById('rank-number-size');
  rankNumberSize.addEventListener('input', function () {
    var v = parseInt(rankNumberSize.value, 10);
    if (isFinite(v)) { state.rankNumberSize = Math.max(20, Math.min(200, v)); TRV.emitChange(); }
  });

  var rankNumberGap = document.getElementById('rank-number-gap');
  rankNumberGap.addEventListener('input', function () {
    var v = parseInt(rankNumberGap.value, 10);
    if (isFinite(v)) { state.rankNumberGap = Math.max(40, Math.min(500, v)); TRV.emitChange(); }
  });

  var rankColorMode = document.getElementById('rank-color-mode');
  var rankSingleRow = document.getElementById('rank-single-row');
  var rankCustomRow = document.getElementById('rank-custom-row');
  var rankSingleColor = document.getElementById('rank-single-color');
  var rankCustomColors = document.getElementById('rank-custom-colors');

  rankColorMode.addEventListener('change', function () {
    state.rankColorMode = rankColorMode.value;
    rankSingleRow.style.display = state.rankColorMode === 'single' ? '' : 'none';
    rankCustomRow.style.display = state.rankColorMode === 'custom' ? '' : 'none';
    if (state.rankColorMode === 'custom') rebuildRankCustomColors();
    TRV.emitChange();
  });

  rankSingleColor.addEventListener('input', function () {
    state.rankSingleColor = rankSingleColor.value;
    TRV.emitChange();
  });

  function rebuildRankCustomColors() {
    rankCustomColors.innerHTML = '';
    for (var i = 0; i < state.rankCount; i++) {
      (function (idx) {
        var item = document.createElement('div');
        item.className = 'rank-color-item';
        var input = document.createElement('input');
        input.type = 'color';
        input.value = toHex(state.rankCustomColors[idx]);
        input.addEventListener('input', function () {
          state.rankCustomColors[idx] = input.value;
          TRV.emitChange();
        });
        var label = document.createElement('span');
        label.textContent = '#' + (idx + 1);
        item.appendChild(input);
        item.appendChild(label);
        rankCustomColors.appendChild(item);
      })(i);
    }
  }

  /* ---------- clip slots ---------- */
  var slotsContainer = document.getElementById('clip-slots');
  var hiddenFileInput = document.getElementById('hidden-file-input');
  var fileTargetRank = -1;
  var slotErrors = {};   // rankIndex -> error message
  var slotLoading = {};  // rankIndex -> status string while importing from a link
  var dragFromPos = -1;  // playback position being dragged
  var activeClipRank = -1; // currently highlighted clip

  // Cards are listed in PLAY ORDER (drag to reorder); empty ranks follow below.
  function buildSlots() {
    slotsContainer.innerHTML = '';
    state.playbackOrder.forEach(function (rankIndex, pos) {
      if (state.clips[rankIndex]) buildSlot(rankIndex, pos);
    });
    for (var i = 0; i < state.rankCount; i++) {
      if (!state.clips[i]) buildSlot(i, -1);
    }
  }

  function buildSlot(rankIndex, playPos) {
    var clip = state.clips[rankIndex];
    var slot = document.createElement('div');
    slot.className = 'clip-slot';
    if (rankIndex === activeClipRank) slot.classList.add('clip-active');

    // Loaded cards drag to change the PLAY order (rank numbers stay put).
    if (clip) {
      slot.draggable = true;

      slot.addEventListener('dragstart', function (e) {
        dragFromPos = playPos;
        slot.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        // Set minimal drag data so the browser allows dragging
        e.dataTransfer.setData('text/plain', '' + playPos);
      });
      slot.addEventListener('dragend', function () {
        slot.classList.remove('dragging');
        dragFromPos = -1;
        slotsContainer.querySelectorAll('.drag-over').forEach(function (el) {
          el.classList.remove('drag-over');
        });
      });
      slot.addEventListener('dragover', function (e) {
        if (dragFromPos < 0 || dragFromPos === playPos) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        slot.classList.add('drag-over');
      });
      slot.addEventListener('dragleave', function () {
        slot.classList.remove('drag-over');
      });
      slot.addEventListener('drop', function (e) {
        e.preventDefault();
        slot.classList.remove('drag-over');
        if (dragFromPos < 0 || dragFromPos === playPos) return;
        TRV.movePlayback(dragFromPos, playPos);
        dragFromPos = -1;
        buildSlots();
        TRV.emitChange();
      });
    }

    var header = document.createElement('div');
    header.className = 'clip-slot-header';
    if (clip) {
      // Rank is chosen from a dropdown: pick 1..N, swaps with the occupant.
      var rankSelect = document.createElement('select');
      rankSelect.className = 'rank-select';
      rankSelect.title = 'Change the rank number of this clip';
      for (var r = 0; r < state.rankCount; r++) {
        var opt = document.createElement('option');
        opt.value = r;
        opt.textContent = 'Rank #' + (r + 1);
        rankSelect.appendChild(opt);
      }
      rankSelect.value = rankIndex;
      rankSelect.addEventListener('click', function (e) { e.stopPropagation(); });
      rankSelect.addEventListener('change', function () {
        var toRank = parseInt(rankSelect.value, 10);
        TRV.setClipRank(rankIndex, toRank);
        if (activeClipRank === rankIndex) activeClipRank = toRank;
        else if (activeClipRank === toRank) activeClipRank = rankIndex;
        buildSlots();
        TRV.emitChange();
      });
      header.appendChild(rankSelect);
    } else {
      var title = document.createElement('span');
      title.className = 'slot-title';
      title.innerHTML = 'Rank <span class="slot-num">#' + (rankIndex + 1) + '</span>';
      header.appendChild(title);
    }
    // Play-order badge: rank number and play position are two different things.
    if (clip && playPos !== -1) {
      var badge = document.createElement('span');
      badge.className = 'play-order-badge';
      badge.title = 'This clip plays ' + ordinal(playPos + 1) + ' in the video';
      badge.textContent = '▶ ' + ordinal(playPos + 1);
      header.appendChild(badge);
    }
    if (clip) {
      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'btn-icon';
      removeBtn.textContent = '🗑';
      removeBtn.title = 'Remove clip';
      removeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        TRV.removeClip(rankIndex);
        if (activeClipRank === rankIndex) activeClipRank = -1;
        buildSlots();
        TRV.emitChange();
      });
      header.appendChild(removeBtn);
    }
    slot.appendChild(header);

    if (!clip) {
      if (slotLoading[rankIndex]) {
        // Importing from a link — show a busy state instead of the drop zone.
        var busy = document.createElement('div');
        busy.className = 'drop-zone loading';
        busy.innerHTML = '<span class="spinner"></span>' +
          '<strong>' + escapeHtml(slotLoading[rankIndex]) + '</strong><br>' +
          '<span class="dz-sub">Importing clip for rank #' + (rankIndex + 1) + '</span>';
        slot.appendChild(busy);
        slotsContainer.appendChild(slot);
        return;
      }

      // --- Link import row ---
      var linkRow = document.createElement('div');
      linkRow.className = 'link-row';
      var linkInput = document.createElement('input');
      linkInput.type = 'text';
      linkInput.className = 'input link-input';
      linkInput.placeholder = 'Paste a TikTok link…';
      var linkBtn = document.createElement('button');
      linkBtn.type = 'button';
      linkBtn.className = 'btn-link';
      linkBtn.textContent = '⬇ Import';
      function submitLink() { handleLink(rankIndex, linkInput.value); }
      linkBtn.addEventListener('click', submitLink);
      linkInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); submitLink(); }
      });
      linkRow.appendChild(linkInput);
      linkRow.appendChild(linkBtn);
      slot.appendChild(linkRow);

      var orSep = document.createElement('div');
      orSep.className = 'or-sep';
      orSep.textContent = 'or';
      slot.appendChild(orSep);

      var dz = document.createElement('div');
      dz.className = 'drop-zone';
      dz.innerHTML = '<span class="dz-icon">📥</span>' +
        '<strong>Drop a clip here</strong> or click to browse<br>MP4 / WebM, the clip for rank #' + (rankIndex + 1) +
        (slotErrors[rankIndex] ? '<span class="dz-error">⚠ ' + escapeHtml(slotErrors[rankIndex]) + '</span>' : '');
      dz.addEventListener('click', function () {
        fileTargetRank = rankIndex;
        hiddenFileInput.value = '';
        hiddenFileInput.click();
      });
      dz.addEventListener('dragover', function (e) { e.preventDefault(); dz.classList.add('dragover'); });
      dz.addEventListener('dragleave', function () { dz.classList.remove('dragover'); });
      dz.addEventListener('drop', function (e) {
        e.preventDefault();
        dz.classList.remove('dragover');
        // Only handle file drops, not clip reorder drops
        var file = e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) handleFile(rankIndex, file);
      });
      slot.appendChild(dz);
    } else {
      var loaded = document.createElement('div');
      loaded.className = 'clip-loaded';

      // Click on clip -> preview that clip
      loaded.addEventListener('click', function () {
        activeClipRank = rankIndex;
        buildSlots();
        if (TRV.preview && TRV.preview.seekToRank) {
          TRV.preview.seekToRank(rankIndex);
        }
      });

      var thumb = document.createElement('canvas');
      thumb.className = 'clip-thumb';
      thumb.width = 64;
      thumb.height = 100;
      drawThumb(thumb, clip);

      var info = document.createElement('div');
      info.className = 'clip-info';
      var fname = document.createElement('div');
      fname.className = 'clip-filename';
      fname.textContent = clip.file.name + ' · ';
      var dur = document.createElement('span');
      dur.className = 'clip-duration';
      dur.textContent = clip.duration.toFixed(1) + 's';
      fname.appendChild(dur);

      var nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'input clip-name-input';
      nameInput.placeholder = 'Label shown next to #' + (rankIndex + 1) + ' (e.g. "Wow")';
      nameInput.value = clip.name;
      nameInput.addEventListener('click', function (e) { e.stopPropagation(); });
      nameInput.addEventListener('input', function () {
        clip.name = nameInput.value;
        TRV.emitChange();
      });

      info.appendChild(fname);
      info.appendChild(nameInput);
      loaded.appendChild(thumb);
      loaded.appendChild(info);
      slot.appendChild(loaded);
    }

    slotsContainer.appendChild(slot);
  }

  function drawThumb(thumbCanvas, clip) {
    var tctx = thumbCanvas.getContext('2d');
    var v = clip.video;
    function paint() {
      var s = Math.max(thumbCanvas.width / v.videoWidth, thumbCanvas.height / v.videoHeight);
      var dw = v.videoWidth * s, dh = v.videoHeight * s;
      tctx.fillStyle = '#000';
      tctx.fillRect(0, 0, thumbCanvas.width, thumbCanvas.height);
      tctx.drawImage(v, (thumbCanvas.width - dw) / 2, (thumbCanvas.height - dh) / 2, dw, dh);
    }
    if (v.readyState >= 2 && v.currentTime > 0.05) {
      paint();
    } else {
      v.addEventListener('seeked', function onSeeked() {
        v.removeEventListener('seeked', onSeeked);
        paint();
        TRV.emitChange(); // idle preview can now show a real frame
      });
      v.currentTime = Math.min(0.1, (clip.duration || 1) / 2);
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function handleFile(rankIndex, file) {
    delete slotErrors[rankIndex];
    if (!/^video\//.test(file.type) && !/\.(mp4|webm|mov|m4v)$/i.test(file.name)) {
      slotErrors[rankIndex] = 'Not a video file.';
      buildSlots();
      return;
    }
    TRV.loadClip(rankIndex, file).then(function () {
      buildSlots();
      TRV.emitChange();
    }).catch(function (err) {
      slotErrors[rankIndex] = err.message || 'Cannot load this clip.';
      buildSlots();
    });
  }

  // Import a clip from a pasted link (TikTok): download no-watermark, then reuse handleFile.
  function handleLink(rankIndex, url) {
    delete slotErrors[rankIndex];
    slotLoading[rankIndex] = 'Resolving link…';
    buildSlots();
    TRV.importFromLink(url, function (status) {
      slotLoading[rankIndex] = status;
      buildSlots();
    }).then(function (file) {
      delete slotLoading[rankIndex];
      handleFile(rankIndex, file);
    }).catch(function (err) {
      delete slotLoading[rankIndex];
      slotErrors[rankIndex] = err.message || 'Could not import from that link.';
      buildSlots();
    });
  }

  hiddenFileInput.addEventListener('change', function () {
    var file = hiddenFileInput.files && hiddenFileInput.files[0];
    if (file && fileTargetRank >= 0) handleFile(fileTargetRank, file);
  });

  /* ---------- play order: shuffle + reset ---------- */
  function ordinal(n) {
    var mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 13) return n + 'th';
    switch (n % 10) {
      case 1: return n + 'st';
      case 2: return n + 'nd';
      case 3: return n + 'rd';
      default: return n + 'th';
    }
  }

  var shuffleBtn = document.getElementById('btn-shuffle');
  shuffleBtn.addEventListener('click', function (e) {
    e.stopPropagation(); // don't toggle the collapsible section
    if (TRV.loadedClipCount() < 2) return;
    TRV.shufflePlaybackOrder();
    buildSlots(); // refresh the play-order badges
    TRV.emitChange();
  });

  var orderResetBtn = document.getElementById('btn-order-reset');
  orderResetBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    TRV.resetPlaybackOrder();
    buildSlots();
    TRV.emitChange();
  });

  /* ---------- export button state ---------- */
  var exportBtn = document.getElementById('btn-export');
  var exportProgress = document.getElementById('export-progress');
  var exportFill = document.getElementById('export-progress-fill');
  var exportStatus = document.getElementById('export-status');
  var exporting = false;

  function updateExportButton() {
    var allLoaded = TRV.loadedClipCount() === state.rankCount;
    exportBtn.disabled = exporting || !allLoaded;
    exportBtn.textContent = exporting ? '⏳ Generating…'
      : allLoaded ? '🚀 Generate Video Ranking'
      : '🚀 Generate (' + TRV.loadedClipCount() + '/' + state.rankCount + ' clips loaded)';
  }

  exportBtn.addEventListener('click', function () {
    if (exporting) return;
    exporting = true;
    if (TRV.preview.isPlaying()) TRV.preview.stop();
    updateExportButton();
    exportProgress.classList.add('visible');
    exportStatus.classList.remove('error');

    TRV.exportVideo(function (p) {
      exportFill.style.width = Math.round((p.pct || 0) * 100) + '%';
      exportStatus.textContent = p.stage || '';
    }).then(function (result) {
      exportFill.style.width = '100%';
      exportStatus.textContent = '✅ Done! Downloaded ' + result.filename;
    }).catch(function (err) {
      console.error(err);
      exportStatus.classList.add('error');
      exportStatus.textContent = '⚠ Export failed: ' + (err.message || err);
    }).finally(function () {
      exporting = false;
      updateExportButton();
    });
  });

  TRV.onChange(updateExportButton);

  /* ---------- boot ---------- */
  buildSlots();
  updateExportButton();
  loadFontThenRedraw(state.title.font);
})();
