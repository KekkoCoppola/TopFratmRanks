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
  var rankNumberSizeVal = document.getElementById('rank-number-size-val');
  rankNumberSize.addEventListener('input', function () {
    state.rankNumberSize = parseInt(rankNumberSize.value, 10);
    rankNumberSizeVal.textContent = rankNumberSize.value;
    TRV.emitChange();
  });

  var rankNumberGap = document.getElementById('rank-number-gap');
  var rankNumberGapVal = document.getElementById('rank-number-gap-val');
  rankNumberGap.addEventListener('input', function () {
    state.rankNumberGap = parseInt(rankNumberGap.value, 10);
    rankNumberGapVal.textContent = rankNumberGap.value;
    TRV.emitChange();
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
  var slotErrors = {}; // rankIndex -> message
  var dragFromRank = -1;
  var activeClipRank = -1; // currently highlighted clip

  function buildSlots() {
    slotsContainer.innerHTML = '';
    for (var i = 0; i < state.rankCount; i++) buildSlot(i);
  }

  function buildSlot(rankIndex) {
    var clip = state.clips[rankIndex];
    var slot = document.createElement('div');
    slot.className = 'clip-slot';
    if (rankIndex === activeClipRank) slot.classList.add('clip-active');

    // Make loaded clips draggable for reordering
    if (clip) {
      slot.draggable = true;
      slot.dataset.rank = rankIndex;

      slot.addEventListener('dragstart', function (e) {
        dragFromRank = rankIndex;
        slot.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        // Set minimal drag data so the browser allows dragging
        e.dataTransfer.setData('text/plain', '' + rankIndex);
      });
      slot.addEventListener('dragend', function () {
        slot.classList.remove('dragging');
        dragFromRank = -1;
        // Clean up all drag-over states
        slotsContainer.querySelectorAll('.drag-over').forEach(function (el) {
          el.classList.remove('drag-over');
        });
      });
    }

    // All slots (even empty) can be drop targets
    slot.addEventListener('dragover', function (e) {
      if (dragFromRank < 0 || dragFromRank === rankIndex) return;
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
      if (dragFromRank < 0 || dragFromRank === rankIndex) return;
      // Swap the two clips
      var tmp = state.clips[dragFromRank];
      state.clips[dragFromRank] = state.clips[rankIndex];
      state.clips[rankIndex] = tmp;
      // Swap custom colors too
      var tmpColor = state.rankCustomColors[dragFromRank];
      state.rankCustomColors[dragFromRank] = state.rankCustomColors[rankIndex];
      state.rankCustomColors[rankIndex] = tmpColor;
      // Swap slot errors
      var tmpErr = slotErrors[dragFromRank];
      slotErrors[dragFromRank] = slotErrors[rankIndex];
      slotErrors[rankIndex] = tmpErr;
      TRV.syncPlaybackOrder();
      dragFromRank = -1;
      buildSlots();
      TRV.emitChange();
    });

    var header = document.createElement('div');
    header.className = 'clip-slot-header';
    var title = document.createElement('span');
    title.className = 'slot-title';
    title.innerHTML = 'Rank <span class="slot-num">#' + (rankIndex + 1) + '</span>';
    header.appendChild(title);
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
      var dz = document.createElement('div');
      dz.className = 'drop-zone';
      dz.innerHTML = '<span class="dz-icon">📥</span>' +
        '<strong>Drop a clip here</strong> or click to browse<br>MP4 / WebM, the clip for rank #' + (rankIndex + 1) +
        (slotErrors[rankIndex] ? '<span class="dz-error">⚠ ' + slotErrors[rankIndex] + '</span>' : '');
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

  hiddenFileInput.addEventListener('change', function () {
    var file = hiddenFileInput.files && hiddenFileInput.files[0];
    if (file && fileTargetRank >= 0) handleFile(fileTargetRank, file);
  });

  /* ---------- shuffle button ---------- */
  var shuffleBtn = document.getElementById('btn-shuffle');
  shuffleBtn.addEventListener('click', function (e) {
    e.stopPropagation(); // don't toggle the collapsible section
    if (TRV.loadedClipCount() < 2) return;
    TRV.shufflePlaybackOrder();
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
