// Editor UI: wires all controls to TRV.state and rebuilds dynamic lists.
(function () {
  'use strict';

  var state = TRV.state;
  var t = TRV.t;

  // Kit icons: 12-unit grid, 1px stroke, currentColor (see css/family.css .ss-icon)
  var ICONS = {
    chevron: '<svg class="ss-icon ss-clip__rank-chev" viewBox="0 0 12 12" aria-hidden="true"><path d="m3 4.5 3 3 3-3"/></svg>',
    play: '<svg class="ss-icon" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z"/></svg>',
    handle: '<svg class="ss-icon ss-clip__handle" viewBox="0 0 12 12" aria-hidden="true"><path d="M4.5 3h0M7.5 3h0M4.5 6h0M7.5 6h0M4.5 9h0M7.5 9h0" stroke-width="1.6"/></svg>',
    download: '<svg class="ss-icon" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 2v6M3.5 5.5 6 8l2.5-2.5M2 10h8"/></svg>',
    upload: '<svg class="ss-icon" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 8V2M3.5 4.5 6 2l2.5 2.5M2 10h8"/></svg>',
    trash: '<svg class="ss-icon" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 3.5h7M4.75 3.5V2h2.5v1.5M3.5 3.5l.5 6.5h4l.5-6.5"/></svg>',
    close: '<svg class="ss-icon" viewBox="0 0 12 12" aria-hidden="true"><path d="m3 3 6 6M9 3 3 9"/></svg>'
  };

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* ---------- header ---------- */
  function refreshRankHeader() {
    document.getElementById('rank-display').textContent = t('rankDisplay', { n: state.rankCount });
    document.title = t('editorTitle', { n: state.rankCount });
  }
  refreshRankHeader();
  TRV.onLang(refreshRankHeader);

  // Sections are <details>: the browser opens and closes them, no JS needed.

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
      wordsContainer.appendChild(el('span', 'ss-hint', t('wordsHint')));
      return;
    }
    words.forEach(function (word, i) {
      var chip = el('button', 'ss-btn ss-btn--sm ss-word', word);
      chip.type = 'button';
      chip.style.setProperty('--c', state.title.wordColors[i] || '#FFFFFF');
      chip.title = t('wordColorTitle', { w: word });
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
    boldBtn.setAttribute('aria-pressed', String(state.title.bold));
    TRV.emitChange();
  });
  italicBtn.addEventListener('click', function () {
    state.title.italic = !state.title.italic;
    italicBtn.setAttribute('aria-pressed', String(state.title.italic));
    TRV.emitChange();
  });

  var strokeToggle = document.getElementById('stroke-toggle'); // checkbox (.ss-switch)
  var strokeWidth = document.getElementById('stroke-width');
  var strokeColor = document.getElementById('stroke-color');
  strokeToggle.addEventListener('change', function () {
    state.title.stroke.on = strokeToggle.checked;
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
        var item = el('label', 'ss-swatch-list__item');
        var input = el('input', 'ss-swatch');
        input.type = 'color';
        input.setAttribute('aria-label', t('colorN', { n: idx + 1 }));
        input.value = toHex(state.rankCustomColors[idx]);
        input.addEventListener('input', function () {
          state.rankCustomColors[idx] = input.value;
          TRV.emitChange();
        });
        item.appendChild(input);
        item.appendChild(el('span', null, '#' + (idx + 1)));
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

  // One card per rank (.ss-clip.ss-clip--slot): big rank number, thumb, name + duration,
  // then a second row with the label field and the remove icons. Empty ranks get the
  // link import row and an "Upload file" button instead (files can be dropped on the card).
  function buildSlot(rankIndex, playPos) {
    var clip = state.clips[rankIndex];
    var slot = el('li', 'ss-clip ss-clip--slot' + (clip ? '' : ' ss-clip--empty'));
    if (rankIndex === activeClipRank) slot.classList.add('is-active');

    // Loaded cards drag to change the PLAY order (rank numbers stay put).
    if (clip) {
      slot.draggable = true;

      slot.addEventListener('dragstart', function (e) {
        dragFromPos = playPos;
        slot.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move';
        // Set minimal drag data so the browser allows dragging
        e.dataTransfer.setData('text/plain', '' + playPos);
      });
      slot.addEventListener('dragend', function () {
        slot.classList.remove('is-dragging');
        dragFromPos = -1;
        slotsContainer.querySelectorAll('.is-drop-target').forEach(function (node) {
          node.classList.remove('is-drop-target');
        });
      });
      slot.addEventListener('dragover', function (e) {
        if (dragFromPos < 0 || dragFromPos === playPos) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        slot.classList.add('is-drop-target');
      });
      slot.addEventListener('dragleave', function () {
        slot.classList.remove('is-drop-target');
      });
      slot.addEventListener('drop', function (e) {
        e.preventDefault();
        slot.classList.remove('is-drop-target');
        if (dragFromPos < 0 || dragFromPos === playPos) return;
        TRV.movePlayback(dragFromPos, playPos);
        dragFromPos = -1;
        buildSlots();
        TRV.emitChange();
      });
    }

    // Big rank number. On loaded cards it is also the rank menu: a native <select>
    // laid over the number (pick 1..N, swaps with the occupant).
    var rank = el(clip ? 'label' : 'span', 'ss-clip__rank');
    rank.appendChild(el('span', 'ss-clip__rank-num', String(rankIndex + 1)));
    rank.insertAdjacentHTML('beforeend', ICONS.chevron);
    if (clip) {
      var rankSelect = el('select', 'rank-select');
      rankSelect.title = t('rankSelectTitle');
      rankSelect.setAttribute('aria-label', t('rankSelectTitle'));
      for (var r = 0; r < state.rankCount; r++) {
        var opt = el('option', null, t('rankOption', { n: r + 1 }));
        opt.value = r;
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
      rank.appendChild(rankSelect);
    }
    slot.appendChild(rank);

    var body = el('div', 'ss-clip__body');

    if (clip) {
      // Thumb + name/duration: click -> preview that clip
      var thumb = el('canvas', 'ss-clip__thumb');
      thumb.width = 54;
      thumb.height = 96;
      drawThumb(thumb, clip);

      var meta = el('span', 'ss-clip__meta');
      meta.appendChild(el('span', 'ss-clip__name', clip.file.name));
      var dur = el('span', 'ss-clip__dur', TRV.seconds(clip.duration));
      // Play-order badge: rank number and play position are two different things.
      if (playPos !== -1) {
        var badge = el('span', 'ss-badge');
        badge.title = t('playsNth', { nth: TRV.ordinal(playPos + 1) });
        badge.innerHTML = ICONS.play;
        badge.appendChild(el('span', null, TRV.ordinal(playPos + 1)));
        dur.appendChild(badge);
      }
      meta.appendChild(dur);

      function previewThisClip() {
        activeClipRank = rankIndex;
        buildSlots();
        if (TRV.preview && TRV.preview.seekToRank) {
          TRV.preview.seekToRank(rankIndex);
        }
      }
      thumb.addEventListener('click', previewThisClip);
      meta.addEventListener('click', previewThisClip);

      slot.appendChild(thumb);
      slot.appendChild(meta);
      slot.insertAdjacentHTML('beforeend', ICONS.handle);

      var nameInput = el('input', 'ss-input');
      nameInput.type = 'text';
      nameInput.placeholder = t('labelPlaceholder', { n: rankIndex + 1 });
      nameInput.value = clip.name;
      nameInput.addEventListener('click', function (e) { e.stopPropagation(); });
      nameInput.addEventListener('input', function () {
        clip.name = nameInput.value;
        TRV.emitChange();
      });
      // Label + the two remove buttons (bare icons, the full wording in the tooltip)
      var labelRow = el('div', 'ss-clip__label-row');
      labelRow.appendChild(nameInput);
      var removeBtn = iconButton(ICONS.trash, t('removeClip'), 'ss-clip__remove-clip');
      removeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        TRV.removeClip(rankIndex);
        if (activeClipRank === rankIndex) activeClipRank = -1;
        buildSlots();
        TRV.emitChange();
      });
      labelRow.appendChild(removeBtn);
      if (state.rankCount > 1) labelRow.appendChild(removeRankButton(rankIndex));
      body.appendChild(labelRow);
    } else {
      // Empty rank, compact: link import + "Upload file". A file can also be dropped
      // anywhere on the card; the accepted formats are in the button's tooltip.
      if (slotLoading[rankIndex]) {
        // Importing from a link — status + indeterminate progress instead of the controls.
        var status = el('span', 'ss-clip__status', slotLoading[rankIndex]);
        status.setAttribute('role', 'status');
        slot.appendChild(status);
        body.insertAdjacentHTML('beforeend',
          '<div class="ss-progress ss-progress--indeterminate"><div class="ss-progress__track"><div class="ss-progress__fill"></div></div></div>');
      } else {
        // --- Link import row ---
        var linkRow = el('div', 'ss-clip__link');
        var linkInput = el('input', 'ss-input');
        linkInput.type = 'text';
        linkInput.placeholder = t('pasteLink');
        linkInput.setAttribute('aria-label', t('pasteLink'));
        var linkBtn = el('button', 'ss-btn ss-btn--sm');
        linkBtn.type = 'button';
        linkBtn.innerHTML = ICONS.download;
        linkBtn.appendChild(el('span', null, t('importBtn')));
        function submitLink() { handleLink(rankIndex, linkInput.value); }
        linkBtn.addEventListener('click', submitLink);
        linkInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { e.preventDefault(); submitLink(); }
        });
        linkRow.appendChild(linkInput);
        slot.appendChild(linkRow);

        // --- Row 2: Import (the link) and Upload a file ---
        var buttons = el('div', 'ss-clip__buttons');
        buttons.appendChild(linkBtn);
        var upload = el('button', 'ss-btn ss-btn--sm ss-clip__upload');
        upload.type = 'button';
        upload.title = t('dropHint', { n: rankIndex + 1 });
        upload.innerHTML = ICONS.upload;
        upload.appendChild(el('span', null, t('uploadFile')));
        upload.addEventListener('click', function () {
          fileTargetRank = rankIndex;
          hiddenFileInput.value = '';
          hiddenFileInput.click();
        });
        buttons.appendChild(upload);
        body.appendChild(buttons);

        if (slotErrors[rankIndex]) {
          var error = el('p', 'ss-note ss-note--error', slotErrors[rankIndex]);
          error.setAttribute('role', 'alert');
          body.appendChild(error);
        }

        // Files dropped anywhere on the empty card (clip reorder drags are not files)
        function hasFiles(e) {
          return !!e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types, 'Files') !== -1;
        }
        slot.addEventListener('dragover', function (e) {
          if (!hasFiles(e)) return;
          e.preventDefault();
          slot.classList.add('is-over');
        });
        slot.addEventListener('dragleave', function (e) {
          if (!slot.contains(e.relatedTarget)) slot.classList.remove('is-over');
        });
        slot.addEventListener('drop', function (e) {
          e.preventDefault();
          slot.classList.remove('is-over');
          var file = e.dataTransfer.files && e.dataTransfer.files[0];
          if (file) handleFile(rankIndex, file);
        });
      }
      if (state.rankCount > 1) slot.appendChild(removeRankButton(rankIndex));
    }

    slot.appendChild(body);
    slotsContainer.appendChild(slot);
  }

  // Small bare icon button with its label as tooltip and accessible name
  function iconButton(icon, label, className) {
    var btn = el('button', 'ss-icon-btn ss-icon-btn--bare ' + className);
    btn.type = 'button';
    btn.title = label;
    btn.setAttribute('aria-label', label);
    btn.innerHTML = icon;
    return btn;
  }

  function removeRankButton(rankIndex) {
    var btn = iconButton(ICONS.close, t('removeRankTitle'), 'ss-clip__remove-rank');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      removeRankUI(rankIndex);
    });
    return btn;
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
      slotErrors[rankIndex] = t('errNotVideo');
      buildSlots();
      return;
    }
    TRV.loadClip(rankIndex, file).then(function () {
      buildSlots();
      TRV.emitChange();
    }).catch(function (err) {
      slotErrors[rankIndex] = err.message || t('errCannotLoad');
      buildSlots();
    });
  }

  // Import a clip from a pasted link (TikTok): download no-watermark, then reuse handleFile.
  function handleLink(rankIndex, url) {
    delete slotErrors[rankIndex];
    slotLoading[rankIndex] = t('resolvingLink');
    buildSlots();
    TRV.importFromLink(url, function (status) {
      slotLoading[rankIndex] = status;
      buildSlots();
    }).then(function (file) {
      delete slotLoading[rankIndex];
      handleFile(rankIndex, file);
    }).catch(function (err) {
      delete slotLoading[rankIndex];
      slotErrors[rankIndex] = err.message || t('errImportLink');
      buildSlots();
    });
  }

  hiddenFileInput.addEventListener('change', function () {
    var file = hiddenFileInput.files && hiddenFileInput.files[0];
    if (file && fileTargetRank >= 0) handleFile(fileTargetRank, file);
  });

  /* ---------- add / remove whole rank slots ---------- */
  var addRankBtn = document.getElementById('btn-add-rank');

  function updateAddRankButton() {
    addRankBtn.disabled = state.rankCount >= TRV.MAX_RANKS;
    addRankBtn.title = addRankBtn.disabled ? t('maxRanks', { n: TRV.MAX_RANKS }) : '';
  }

  function afterRankStructureChange() {
    // Indexes shifted: stale per-slot UI state no longer maps to the right rank.
    slotErrors = {};
    slotLoading = {};
    refreshRankHeader();
    if (state.rankColorMode === 'custom') rebuildRankCustomColors();
    buildSlots();
    updateAddRankButton();
    TRV.emitChange();
  }

  addRankBtn.addEventListener('click', function () {
    if (TRV.addRank()) afterRankStructureChange();
  });

  function removeRankUI(rankIndex) {
    if (state.rankCount <= 1) return;
    var clip = state.clips[rankIndex];
    function doRemove() {
      if (activeClipRank === rankIndex) activeClipRank = -1;
      else if (activeClipRank > rankIndex) activeClipRank--;
      if (TRV.removeRank(rankIndex)) afterRankStructureChange();
    }
    if (!clip) { doRemove(); return; }
    // A rank with a loaded clip asks first, in a kit modal (was window.confirm)
    TRV.confirm({
      title: t('confirmRemoveRankTitle', { n: rankIndex + 1 }),
      body: t('confirmRemoveRankBody'),
      ok: t('remove'),
      cancel: t('cancel')
    }).then(function (ok) { if (ok) doRemove(); });
  }

  /* ---------- play order: shuffle + reset ---------- */
  var shuffleBtn = document.getElementById('btn-shuffle');
  shuffleBtn.addEventListener('click', function (e) {
    e.stopPropagation();
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
  var exportBtnLabel = document.getElementById('btn-export-label');
  var exportProgress = document.getElementById('export-progress');
  var exportFill = document.getElementById('export-progress-fill');
  var exportValue = document.getElementById('export-progress-value');
  var exportStatus = document.getElementById('export-status');
  var exporting = false;
  var finalStatus = null; // { key, params, error }: the done/failed line, re-rendered on language change

  function updateExportButton() {
    var loadedCount = TRV.loadedClipCount();
    var allLoaded = loadedCount === state.rankCount;
    var canExport = loadedCount >= 1;
    exportBtn.disabled = exporting || !canExport;
    exportBtnLabel.textContent = exporting ? t('generating')
      : allLoaded ? t('generate')
      : t('generatePartial', { l: loadedCount, n: state.rankCount });
  }

  function setProgress(pct) {
    var value = Math.round(pct * 100) + '%';
    exportFill.style.width = value;
    exportValue.textContent = value;
  }

  function setStatus(text, isError) {
    exportStatus.textContent = text;
    exportStatus.classList.toggle('ss-note--error', !!isError);
  }

  // Shared by the Generate button and the Publish button (which generates first
  // if there's no video yet). Rejects if a generation is already running.
  function runGenerate() {
    if (exporting) return Promise.reject(new Error(t('errBusy')));
    exporting = true;
    finalStatus = null;
    if (TRV.preview.isPlaying()) TRV.preview.stop();
    updateExportButton();
    exportProgress.classList.add('visible');
    setProgress(0);
    setStatus(t('preparing'), false);

    return TRV.exportVideo(function (p) {
      setProgress(p.pct || 0);
      setStatus(p.stage || '', false);
    }).then(function (result) {
      setProgress(1);
      finalStatus = { key: 'exportDone', params: { f: result.filename }, error: false };
      setStatus(t(finalStatus.key, finalStatus.params), false);
      exporting = false;
      updateExportButton();
      return result;
    }, function (err) {
      console.error(err);
      finalStatus = { key: 'exportFailed', params: { m: err.message || err }, error: true };
      setStatus(t(finalStatus.key, finalStatus.params), true);
      exporting = false;
      updateExportButton();
      throw err;
    });
  }

  exportBtn.addEventListener('click', function () {
    if (exporting) return;
    runGenerate().catch(function () { /* already surfaced in exportStatus */ });
  });

  TRV.runGenerate = runGenerate;
  TRV.isGenerating = function () { return exporting; };

  TRV.onChange(updateExportButton);

  /* ---------- language: re-render everything built in JS ---------- */
  TRV.onLang(function () {
    rebuildWordChips();
    if (state.rankColorMode === 'custom') rebuildRankCustomColors();
    buildSlots();
    updateExportButton();
    updateAddRankButton();
    if (finalStatus) setStatus(t(finalStatus.key, finalStatus.params), finalStatus.error);
  });

  /* ---------- boot ---------- */
  rebuildWordChips();
  buildSlots();
  updateExportButton();
  updateAddRankButton();
  loadFontThenRedraw(state.title.font);
})();
