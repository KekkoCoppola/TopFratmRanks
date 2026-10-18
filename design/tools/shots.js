// Screenshot scenarios for TopFratmRanks (injected into every page by cdp-shoot.ps1).
// Each scenario: url, localStorage to seed, setup() to reach the state, scroll target,
// optional hover/focus target, full-page flag.
// 01–33 are the "before/after" set (same names in design/before and design/after);
// gN-* are the per-group state shots of Fase 3.
// "sim" = state reached by setting DOM/text directly because the real path needs OAuth or a real drag.
(() => {
  'use strict';
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  async function until(fn, t = 20000) {
    const s = Date.now();
    while (!fn()) {
      if (Date.now() - s > t) throw new Error('timeout waiting for ' + fn);
      await sleep(50);
    }
  }
  const ACCEPTED = { trv_terms_accepted: 'true' };
  const CONFIGURED = { trv_terms_accepted: 'true', trv_google_client_id: '1234567890-demo.apps.googleusercontent.com' };

  /* ---------- test clips: encoded in-page (WebCodecs + the app's Mp4Muxer) ---------- */
  let img = null;
  async function loadImg() {
    if (img) return img;
    const b = await (await fetch('designScroll/design-kit/assets/topfratmranks.jpg')).blob();
    img = await createImageBitmap(b);
    return img;
  }
  async function pickCodec(W, H) {
    const cands = [['avc1.42001f', 'avc'], ['avc1.4d001f', 'avc'], ['vp09.00.10.08', 'vp9']];
    for (const [codec, mux] of cands) {
      try {
        const r = await VideoEncoder.isConfigSupported({ codec, width: W, height: H, bitrate: 1e6, framerate: 30 });
        if (r.supported) return { codec, mux };
      } catch (e) { /* next */ }
    }
    throw new Error('no encoder for test clips');
  }
  async function makeClip(n, seconds) {
    const W = 540, H = 960, fps = 30;
    const im = await loadImg();
    const { codec, mux } = await pickCodec(W, H);
    const cv = new OffscreenCanvas(W, H);
    const ctx = cv.getContext('2d');
    const muxer = new Mp4Muxer.Muxer({ target: new Mp4Muxer.ArrayBufferTarget(), video: { codec: mux, width: W, height: H }, fastStart: 'in-memory' });
    let err = null;
    const enc = new VideoEncoder({ output: (c, m) => muxer.addVideoChunk(c, m), error: (e) => { err = e; } });
    enc.configure({ codec, width: W, height: H, bitrate: 1e6, framerate: fps });
    const frames = Math.round(seconds * fps);
    // only the photo below the ranking overlay baked into the poster
    const sx = 60, sy = 478, sw = 376, sh = 372;
    for (let f = 0; f < frames; f++) {
      const s = Math.max(W / sw, H / sh) * (1 + 0.15 * f / frames);
      ctx.filter = 'hue-rotate(' + (n * 70) + 'deg)';
      ctx.drawImage(im, sx, sy, sw, sh, (W - sw * s) / 2, (H - sh * s) / 2, sw * s, sh * s);
      ctx.filter = 'none';
      ctx.fillStyle = 'rgba(0,0,0,.45)';
      ctx.fillRect(0, H - 140, W, 140);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 56px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Clip ' + n, W / 2, H - 55);
      const vf = new VideoFrame(cv, { timestamp: Math.round(f * 1e6 / fps), duration: Math.round(1e6 / fps) });
      enc.encode(vf, { keyFrame: f % 30 === 0 });
      vf.close();
      if (err) throw err;
    }
    await enc.flush();
    enc.close();
    muxer.finalize();
    return new File([muxer.target.buffer], 'clip-' + n + '.mp4', { type: 'video/mp4' });
  }

  /* ---------- editor helpers (drive the real UI; old and new markup) ---------- */
  function emptySlot(rank) {
    const fresh = $$('.ss-clip--empty').find((s) => s.querySelector('.ss-clip__rank').textContent.trim() === String(rank + 1));
    if (fresh) return fresh;
    return $$('.clip-slot').find((s) => {
      const n = s.querySelector('.slot-num');
      return n && n.textContent === '#' + (rank + 1);
    });
  }
  function loadedSlot(rank) {
    return $$('.ss-clip, .clip-slot').find((s) => {
      const sel = s.querySelector('.rank-select');
      return sel && Number(sel.value) === rank;
    });
  }
  function dropFile(rank, file) {
    const slot = emptySlot(rank);
    const dz = slot.classList.contains('ss-clip--empty') ? slot : slot.querySelector('.ss-drop, .drop-zone');
    const dt = new DataTransfer();
    dt.items.add(file);
    dz.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
  }
  function linkParts(rank) {
    const slot = emptySlot(rank);
    return {
      input: slot.querySelector('.ss-clip__link input, .link-input'),
      button: slot.querySelector('.ss-clip__buttons .ss-btn, .btn-link')
    };
  }
  const NAMES = ['Long run', 'Wow', '', 'Ouch', 'Epic'];
  async function loadClips(ranks) {
    const files = await Promise.all(ranks.map((r) => makeClip(r + 1, 2 + 0.6 * (r % 3))));
    for (let i = 0; i < ranks.length; i++) {
      const r = ranks[i];
      dropFile(r, files[i]);
      await until(() => TRV.state.clips[r] && loadedSlot(r));
      await sleep(250);
      const name = NAMES[r] || '';
      if (name) {
        const input = loadedSlot(r).querySelector('input[type="text"]');
        input.value = name;
        input.dispatchEvent(new Event('input'));
      }
    }
    await sleep(400);
  }
  function typeTitle(text) {
    const ti = $('#title-input');
    ti.value = text;
    ti.dispatchEvent(new Event('input'));
  }
  function colorWord(i, hex) {
    $$('#title-words button')[i].click(); // sets the picker target
    const p = $('#hidden-color-picker');
    p.value = hex;
    p.dispatchEvent(new Event('input'));
  }
  async function title() {
    typeTitle('Ranking Top 5 Best Falling Moments');
    colorWord(4, '#ff2a2a');
    colorWord(5, '#22dd44');
    await sleep(100);
  }
  function setSelect(sel, value) {
    const el = $(sel);
    el.value = value;
    el.dispatchEvent(new Event('change'));
  }
  function showPublishStep(name) {
    ['summary', 'confirm', 'progress', 'result'].forEach((k) => {
      $('#publish-step-' + k).style.display = k === name ? '' : 'none';
    });
  }
  function fakeExport() {
    TRV.lastExport = { blob: new Blob([new Uint8Array(4404019)]), filename: 'ranking-top-5-best-falling-moments.mp4' };
    TRV.emitChange();
  }
  const T = (key, params) => (window.TRV && TRV.t ? TRV.t(key, params) : key);
  // Same markup renderAccount() builds once a channel is connected (the real path needs OAuth)
  function connectedSim() {
    $('#yt-account').innerHTML =
      '<div class="ss-account"><img class="ss-account__avatar" src="assets/topfratmranks-logo.svg" alt="">' +
      '<span class="ss-account__name">TopFratmRanks</span>' +
      '<button type="button" class="ss-icon-btn ss-icon-btn--bare" aria-label="' + T('disconnect') + '" title="' + T('disconnect') + '">' +
      '<svg class="ss-icon" viewBox="0 0 12 12" aria-hidden="true"><path d="m3 3 6 6M9 3 3 9"/></svg></button></div>';
  }
  const DONE = /Fatto|Done|non riuscito|failed/;

  const E = 'editor.html?rank=5';
  const S = {
    /* ===== before / after set ===== */
    '01-landing-terms': { url: 'index.html', ls: {} },
    '02-landing': { url: 'index.html', ls: ACCEPTED },
    '03-landing-selected': { url: 'index.html', ls: ACCEPTED, setup: async () => { $$('#rank-grid button')[4].click(); } },

    '04-editor-terms': { url: E, ls: {} },
    '05-editor-empty': { url: E, ls: ACCEPTED, full: true },
    '06-editor-empty-clips': { url: E, ls: ACCEPTED, scroll: '#section-clips' },
    '07-editor-title-filled': {
      url: E, ls: ACCEPTED, scroll: '#section-title',
      setup: async () => { await title(); $('#btn-bold').click(); $('#stroke-toggle').click(); }
    },
    '08-editor-rank-color-single': { url: E, ls: ACCEPTED, scroll: '#section-settings', setup: async () => setSelect('#rank-color-mode', 'single') },
    '09-editor-rank-color-custom': { url: E, ls: ACCEPTED, scroll: '#section-settings', setup: async () => setSelect('#rank-color-mode', 'custom') },
    '10-editor-collapsed': {
      url: E, ls: ACCEPTED,
      setup: async () => {
        const details = $$('details.ss-section');
        if (details.length) details.forEach((d) => { d.open = false; });
        else $$('.section-header').forEach((h) => h.click());
      }
    },
    '11-editor-publish-setup': { url: E, ls: ACCEPTED, scroll: '#section-publish' },
    '12-editor-publish-configured': { url: E, ls: CONFIGURED, scroll: '#section-publish' },
    '13-editor-clips-partial': {
      url: E, ls: ACCEPTED, scroll: '#section-clips',
      setup: async () => { await title(); await loadClips([0, 2]); }
    },
    '14-editor-clips-full': {
      url: E, ls: ACCEPTED, scroll: '#section-clips', full: true,
      setup: async () => { await title(); await loadClips([0, 1, 2, 3, 4]); }
    },
    '15-editor-clip-active': {
      url: E, ls: ACCEPTED, scroll: '#section-clips',
      setup: async () => {
        await title(); await loadClips([0, 1, 2]);
        loadedSlot(1).querySelector('.ss-clip__thumb, .clip-loaded').click();
        await sleep(500);
      }
    },
    '16-editor-clip-dragging-sim': {
      url: E, ls: ACCEPTED, scroll: '#section-clips',
      setup: async () => {
        await title(); await loadClips([0, 1, 2]);
        const fresh = $$('.ss-clip[draggable="true"]');
        if (fresh.length) {
          fresh[0].classList.add('is-dragging');
          fresh[2].classList.add('is-drop-target');
        } else {
          const slots = $$('.clip-slot[draggable="true"]');
          slots[0].classList.add('dragging');
          slots[2].classList.add('drag-over');
        }
      }
    },
    '17-editor-slot-error': {
      url: E, ls: ACCEPTED, scroll: '#section-clips',
      setup: async () => { dropFile(0, new File(['hello'], 'notes.txt', { type: 'text/plain' })); await sleep(200); }
    },
    '18-editor-link-loading': {
      url: E, ls: ACCEPTED, scroll: '#section-clips',
      setup: async () => {
        window.fetch = () => new Promise(() => {}); // keep the import pending, no network
        const p = linkParts(0);
        p.input.value = 'https://www.tiktok.com/@user/video/7300000000000000000';
        p.button.click();
        await sleep(200);
      }
    },
    '19-editor-link-error': {
      url: E, ls: ACCEPTED, scroll: '#section-clips',
      setup: async () => {
        const p = linkParts(0);
        p.input.value = 'https://example.com/video.mp4';
        p.button.click();
        await sleep(200);
      }
    },
    '20-editor-playing': {
      url: E, ls: ACCEPTED, scroll: '.ss-stage',
      setup: async () => { await title(); await loadClips([0, 1, 2, 3, 4]); $('#btn-play').click(); await sleep(1500); }
    },
    '21-editor-export-progress': {
      url: E, ls: ACCEPTED, scroll: '#section-export',
      setup: async () => {
        await title(); await loadClips([0, 1, 2, 3, 4]);
        $('#btn-export').click();
        await until(() => /Rendering clip 2/.test($('#export-status').textContent), 120000);
      }
    },
    '22-editor-export-done': {
      url: E, ls: ACCEPTED, scroll: '#section-export',
      setup: async () => {
        await title(); await loadClips([0, 1, 2]);
        $('#btn-export').click();
        await until(() => DONE.test($('#export-status').textContent), 240000);
      }
    },
    '23-editor-export-error': {
      url: E, ls: ACCEPTED, scroll: '#section-export',
      setup: async () => {
        await title(); await loadClips([0, 1]);
        window.VideoEncoder = undefined; // real error path: no WebCodecs and no MediaRecorder
        window.MediaRecorder = undefined;
        $('#btn-export').click();
        await until(() => /non riuscito|failed/.test($('#export-status').textContent));
      }
    },
    '24-editor-max-ranks': { url: 'editor.html?rank=10', ls: ACCEPTED, scroll: '#btn-add-rank' },
    '25-modal-setup': { url: E, ls: ACCEPTED, setup: async () => { $('#btn-setup-open').click(); await sleep(100); } },
    '26-modal-setup-error': {
      url: E, ls: ACCEPTED,
      setup: async () => {
        $('#btn-setup-open').click();
        $('#setup-client-id').value = 'not-a-client-id';
        $('#setup-save').click();
        await sleep(100);
      }
    },
    '27-modal-publish-summary': {
      url: E, ls: CONFIGURED,
      setup: async () => { await title(); await loadClips([0, 1]); fakeExport(); $('#btn-publish').click(); await sleep(200); }
    },
    '28-modal-publish-confirm-sim': {
      url: E, ls: CONFIGURED,
      setup: async () => {
        await title(); await loadClips([0, 1]); fakeExport(); $('#btn-publish').click();
        $('#pc-text').textContent = T('confirmPublic', { c: 'TopFratmRanks' });
        showPublishStep('confirm');
      }
    },
    '29-modal-publish-progress-sim': {
      url: E, ls: CONFIGURED,
      setup: async () => {
        await title(); await loadClips([0, 1]); fakeExport(); $('#btn-publish').click();
        $('#pp-fill').style.width = '40%';
        $('#pp-status').textContent = T('uploadingPct', { p: 40 });
        showPublishStep('progress');
      }
    },
    '30-modal-publish-success-sim': {
      url: E, ls: CONFIGURED,
      setup: async () => {
        await title(); await loadClips([0, 1]); fakeExport(); $('#btn-publish').click();
        $('#pr-title').textContent = T('published');
        $('#pr-text').textContent = T('publishedText');
        $('#pr-retry').style.display = 'none';
        $('#pr-link').style.display = '';
        showPublishStep('result');
      }
    },
    '31-modal-publish-error-sim': {
      url: E, ls: CONFIGURED,
      setup: async () => {
        await title(); await loadClips([0, 1]); fakeExport(); $('#btn-publish').click();
        $('#pr-title').textContent = T('uploadFailed');
        $('#pr-text').textContent = T('errQuota');
        $('#pr-link').style.display = 'none';
        $('#pr-retry').style.display = '';
        showPublishStep('result');
      }
    },
    '32-editor-generating-for-publish': {
      url: E, ls: CONFIGURED, scroll: '#section-export',
      setup: async () => {
        await title(); await loadClips([0, 1, 2, 3, 4]);
        $('#btn-publish').click();
        await until(() => /Rendering clip 2/.test($('#export-status').textContent), 120000);
      }
    },
    '33-editor-yt-connected-sim': {
      url: E, ls: CONFIGURED, scroll: '#section-publish',
      setup: async () => { connectedSim(); }
    },

    /* ===== Fase 3, group 1: fields ===== */
    'g1-title-rest': { url: E, ls: ACCEPTED, scroll: '#section-title', setup: async () => { await title(); } },
    'g1-input-hover': { url: E, ls: ACCEPTED, scroll: '#section-title', hover: '#title-input', setup: async () => { await title(); } },
    'g1-input-focus': { url: E, ls: ACCEPTED, scroll: '#section-title', focus: '#title-input', setup: async () => { await title(); } },
    'g1-select-focus': { url: E, ls: ACCEPTED, scroll: '#section-settings', focus: '#clip-fit' },
    'g1-num-focus': { url: E, ls: ACCEPTED, scroll: '#section-settings', focus: '#rank-number-size' },
    'g1-swatch-hover': { url: E, ls: ACCEPTED, scroll: '#section-settings', hover: '#bg-color' },
    'g1-custom-colors-focus': {
      url: E, ls: ACCEPTED, scroll: '#section-settings', focus: '#rank-custom-colors .ss-swatch',
      setup: async () => setSelect('#rank-color-mode', 'custom')
    },
    'g1-publish-setup': { url: E, ls: ACCEPTED, scroll: '#section-publish' },
    'g1-publish-configured': { url: E, ls: CONFIGURED, scroll: '#section-publish' },
    'g1-textarea-focus': { url: E, ls: CONFIGURED, scroll: '#section-publish', focus: '#yt-desc' },

    /* ===== Fase 3, group 2: buttons and toggles ===== */
    'g2-toggles-rest': { url: E, ls: ACCEPTED, scroll: '#section-title', setup: async () => { await title(); $('#btn-bold').click(); } },
    'g2-toggle-hover': { url: E, ls: ACCEPTED, scroll: '#section-title', hover: '#btn-italic', setup: async () => { await title(); $('#btn-bold').click(); } },
    'g2-toggle-focus': { url: E, ls: ACCEPTED, scroll: '#section-title', focus: '#btn-bold', setup: async () => { await title(); } },
    'g2-switch-off-hover': { url: E, ls: ACCEPTED, scroll: '#section-title', hover: '#stroke-toggle', setup: async () => { await title(); $('#stroke-toggle').click(); } },
    'g2-switch-focus': { url: E, ls: ACCEPTED, scroll: '#section-title', focus: '#stroke-toggle', setup: async () => { await title(); } },
    'g2-word-hover': { url: E, ls: ACCEPTED, scroll: '#section-title', hover: '#title-words button:nth-child(5)', setup: async () => { await title(); } },
    'g2-word-focus': { url: E, ls: ACCEPTED, scroll: '#section-title', focus: '#title-words button:nth-child(6)', setup: async () => { await title(); } },
    'g2-tools-hover': { url: E, ls: ACCEPTED, scroll: '#section-clips', hover: '#btn-shuffle' },
    'g2-tools-focus': { url: E, ls: ACCEPTED, scroll: '#section-clips', focus: '#btn-order-reset' },
    'g2-addrank-disabled': { url: 'editor.html?rank=10', ls: ACCEPTED, scroll: '#btn-add-rank' },
    'g2-addrank-hover': { url: E, ls: ACCEPTED, hover: '#btn-add-rank' },
    'g2-setup-hover': { url: E, ls: ACCEPTED, scroll: '#section-publish', hover: '#btn-setup-open' },
    'g2-connect-focus': { url: E, ls: CONFIGURED, scroll: '#section-publish', focus: '#btn-yt-connect' },
    'g2-link-hover': { url: E, ls: CONFIGURED, scroll: '#section-publish', hover: '#btn-setup-edit' },
    'g2-account-sim': { url: E, ls: CONFIGURED, scroll: '#section-publish', setup: async () => { connectedSim(); } },
    /* ===== Fase 3, group 3: clip list (plus 06, 13–19 of the before/after set) ===== */
    'g3-card-hover': {
      url: E, ls: ACCEPTED, scroll: '#section-clips', hover: '#clip-slots .ss-clip__meta',
      setup: async () => { await title(); await loadClips([0, 1, 2]); }
    },
    'g3-rank-focus': {
      url: E, ls: ACCEPTED, scroll: '#section-clips', focus: '#clip-slots .rank-select',
      setup: async () => { await title(); await loadClips([0, 1, 2]); }
    },
    'g3-remove-hover': {
      url: E, ls: ACCEPTED, scroll: '#section-clips', hover: '#clip-slots .ss-clip__remove-clip',
      setup: async () => { await title(); await loadClips([0, 1, 2]); }
    },
    'g3-drop-hover': { url: E, ls: ACCEPTED, scroll: '#section-clips', hover: '#clip-slots .ss-clip__upload' },
    'g3-drop-focus': { url: E, ls: ACCEPTED, scroll: '#section-clips', focus: '#clip-slots .ss-clip__upload' },
    'g3-drop-over-sim': {
      url: E, ls: ACCEPTED, scroll: '#section-clips',
      setup: async () => { $('#clip-slots .ss-clip--empty').classList.add('is-over'); }
    },
    'g3-import-hover': { url: E, ls: ACCEPTED, scroll: '#section-clips', hover: '#clip-slots .ss-clip__buttons .ss-btn' },
    'g3-link-focus': { url: E, ls: ACCEPTED, scroll: '#section-clips', focus: '#clip-slots .ss-clip__link .ss-input' },

    /* ===== Fase 3, group 4: stage and timeline (plus 20 of the before/after set) ===== */
    'g4-play-disabled': { url: E, ls: ACCEPTED },
    'g4-play-hover': {
      url: E, ls: ACCEPTED, hover: '#btn-play',
      setup: async () => { await title(); await loadClips([0, 1, 2]); }
    },
    'g4-play-focus': {
      url: E, ls: ACCEPTED, focus: '#btn-play',
      setup: async () => { await title(); await loadClips([0, 1, 2]); }
    },
    'g4-scrub-keyboard': {
      url: E, ls: ACCEPTED, focus: '#progress-scrub',
      setup: async () => {
        await title(); await loadClips([0, 1, 2]);
        const s = $('#progress-scrub');
        for (let i = 0; i < 4; i++) s.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await sleep(600);
      }
    },
    'g4-scrubbing-sim': {
      url: E, ls: ACCEPTED, hover: '#progress-scrub',
      setup: async () => {
        await title(); await loadClips([0, 1, 2]);
        $('#progress-scrub').dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
        await sleep(400);
        $('#progress-bar').classList.add('scrubbing');
      }
    },

    /* ===== Fase 3, group 5: modals (plus 25–31 of the before/after set) ===== */
    'g5-confirm-remove': {
      url: E, ls: ACCEPTED, scroll: '#section-clips',
      setup: async () => {
        await title(); await loadClips([0, 1, 2]);
        $('#clip-slots .ss-clip__remove-rank').click(); // "Rimuovi posizione" on a loaded card
        await sleep(300);
      }
    },
    'g5-confirm-focus': {
      url: E, ls: ACCEPTED, scroll: '#section-clips', focus: '.ss-overlay [data-act="cancel"]',
      setup: async () => {
        await title(); await loadClips([0, 1, 2]);
        $('#clip-slots .ss-clip__remove-rank').click();
        await sleep(300);
      }
    },
    'g5-setup-esc-closes': {
      url: E, ls: ACCEPTED, scroll: '#section-publish',
      setup: async () => {
        $('#btn-setup-open').click();
        await sleep(200);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await sleep(200);
      }
    },
    'g5-setup-copied': {
      url: E, ls: ACCEPTED,
      setup: async () => { $('#btn-setup-open').click(); await sleep(100); $('#setup-copy-origin').click(); await sleep(150); }
    },
    'g5-setup-link-hover': {
      url: E, ls: ACCEPTED, hover: '#setup-modal .ss-link--inline',
      setup: async () => { $('#btn-setup-open').click(); await sleep(100); }
    },
    'g5-close-hover': {
      url: E, ls: ACCEPTED, hover: '#setup-close',
      setup: async () => { $('#btn-setup-open').click(); await sleep(100); }
    },
    'g5-publish-signin-error-sim': {
      url: E, ls: CONFIGURED,
      setup: async () => {
        await title(); await loadClips([0, 1]); fakeExport(); $('#btn-publish').click(); await sleep(200);
        const el = $('#ps-error');
        el.textContent = T('signInFailed', { m: T('errSignInCancelled') });
        el.hidden = false;
      }
    },

    /* ===== Fase 3, group 6: export (plus 21–23 and 32 of the before/after set) ===== */
    'g6-export-disabled': { url: E, ls: ACCEPTED, scroll: '#section-export' },
    'g6-export-partial-hover': {
      url: E, ls: CONFIGURED, scroll: '#section-export', hover: '#btn-export',
      setup: async () => { await title(); await loadClips([0, 1]); }
    },
    'g6-export-ready-focus': {
      url: E, ls: CONFIGURED, scroll: '#section-export', focus: '#btn-export',
      setup: async () => { await title(); await loadClips([0, 1, 2, 3, 4]); }
    },
    'g6-publish-hover': {
      url: E, ls: CONFIGURED, scroll: '#section-export', hover: '#btn-publish',
      setup: async () => { await title(); await loadClips([0, 1]); }
    },

    /* ===== Fase 3, group 7: landing and terms (plus 01–04 of the before/after set) ===== */
    'g7-landing-option-hover': { url: 'index.html', ls: ACCEPTED, hover: '#rank-grid button:nth-child(7)', setup: async () => { $$('#rank-grid button')[4].click(); } },
    'g7-landing-option-focus': { url: 'index.html', ls: ACCEPTED, focus: '#rank-grid button:nth-child(3)' },
    'g7-landing-start-focus': { url: 'index.html', ls: ACCEPTED, focus: '#btn-start', setup: async () => { $$('#rank-grid button')[4].click(); } },
    'g7-terms-check-hover': { url: 'index.html', ls: {}, hover: '#terms-checkbox' },
    'g7-terms-checked': { url: 'index.html', ls: {}, setup: async () => { $('#terms-checkbox').click(); } },
    'g7-terms-en-switch': {
      url: 'index.html', ls: {},
      setup: async () => { $('#terms-overlay [data-lang="en"]').click(); await sleep(150); }
    },
    'g7-terms-scrollbox-focus': { url: 'index.html', ls: {}, focus: '#terms-overlay .ss-scrollbox' },

    /* ===== Fase 4: functional checks, results printed on the page ===== */
    'qa-flows': {
      url: E, ls: ACCEPTED,
      setup: async () => {
        await title(); await loadClips([0, 2]);
        const out = {};
        const ok = (name, value) => { out[name] = value; };
        ok('orderBefore', [...TRV.state.playbackOrder]);
        // real drag events between the two loaded cards (play order)
        let cards = $$('#clip-slots .ss-clip[draggable="true"]');
        const dt = new DataTransfer();
        cards[0].dispatchEvent(new DragEvent('dragstart', { dataTransfer: dt, bubbles: true }));
        cards[1].dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true, cancelable: true }));
        ok('dropTargetShown', cards[1].classList.contains('is-drop-target'));
        cards[1].dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
        cards[0].dispatchEvent(new DragEvent('dragend', { dataTransfer: dt, bubbles: true }));
        ok('orderAfterDrag', [...TRV.state.playbackOrder]);
        // rank menu on the big number: clip of rank 1 -> rank 2
        const sel = $$('#clip-slots .rank-select').find((s) => s.value === '0');
        sel.value = '1'; sel.dispatchEvent(new Event('change'));
        ok('clipsAfterRankMenu', TRV.state.clips.map((c) => (c ? c.file.name : null)));
        // shuffle / reset
        $('#btn-order-reset').click();
        ok('orderAfterReset', [...TRV.state.playbackOrder]);
        // remove a rank with a clip: kit modal, Esc cancels, OK removes
        $('#clip-slots .ss-clip__remove-rank').click(); await sleep(100);
        ok('confirmOpen', !!$('[role="alertdialog"]'));
        ok('focusOnCancel', document.activeElement && document.activeElement.dataset.act === 'cancel');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await sleep(50);
        ok('closedByEsc', !$('[role="alertdialog"]') && TRV.state.rankCount === 5);
        $('#clip-slots .ss-clip__remove-rank').click(); await sleep(100);
        $('[role="alertdialog"] [data-act="ok"]').click(); await sleep(100);
        ok('rankCountAfterOk', TRV.state.rankCount);
        // add rank back
        $('#btn-add-rank').click();
        ok('rankCountAfterAdd', TRV.state.rankCount);
        // keyboard on the timeline
        const scrub = $('#progress-scrub');
        scrub.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true })); await sleep(300);
        ok('sliderEnd', scrub.getAttribute('aria-valuetext'));
        scrub.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true })); await sleep(300);
        ok('sliderHome', scrub.getAttribute('aria-valuetext'));
        // play / pause label
        $('#btn-play').click(); await sleep(400);
        ok('playingLabel', $('#btn-play').getAttribute('aria-label'));
        $('#btn-play').click(); await sleep(100);
        ok('pausedLabel', $('#btn-play').getAttribute('aria-label'));
        // setup wizard: Esc closes and focus returns
        $('#btn-setup-open').click(); await sleep(100);
        ok('setupFocusOnInput', document.activeElement && document.activeElement.id);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await sleep(50);
        ok('setupClosedByEsc', $('#setup-modal').style.display === 'none');
        ok('focusBackTo', document.activeElement && document.activeElement.id);
        // language: everything built in JS follows
        window.ssSetLanguage('en'); await sleep(100);
        ok('en', [$('#rank-display').textContent, $('#btn-export-label').textContent, document.title,
          $('#clip-slots .ss-clip__upload span') && $('#clip-slots .ss-clip__upload span').textContent,
          $('#clip-slots .ss-clip__dur') && $('#clip-slots .ss-clip__dur').firstChild.textContent]);
        window.ssSetLanguage('it'); await sleep(100);
        ok('it', [$('#rank-display').textContent, $('#btn-export-label').textContent, document.title]);
        const pre = document.createElement('pre');
        pre.textContent = JSON.stringify(out, null, 1);
        pre.style.cssText = 'position:fixed;inset:0;z-index:999;margin:0;padding:16px;background:#fff;color:#000;font:12px/1.4 monospace;overflow:auto';
        document.body.appendChild(pre);
      }
    },

    'g2-signin-error-sim': {
      url: E, ls: CONFIGURED, scroll: '#section-publish',
      setup: async () => {
        const el = $('#yt-error');
        el.textContent = T('signInFailed', { m: T('errSignInCancelled') });
        el.hidden = false;
      }
    }
  };

  window.__S = {
    list: () => Object.keys(S).map((name) => ({ name, url: S[name].url, full: !!S[name].full })),
    prepare: (name, lang) => {
      localStorage.clear();
      Object.entries(S[name].ls || {}).forEach(([k, v]) => localStorage.setItem(k, v));
      if (lang === 'en') localStorage.setItem('scrollstudio-lang', 'en');
      return true;
    },
    setup: async (name) => {
      await document.fonts.ready;
      await sleep(150);
      const sc = S[name];
      if (sc.setup) await sc.setup();
      if (sc.scroll) {
        const el = $(sc.scroll);
        if (el) el.scrollIntoView({ block: 'start' });
      } else {
        window.scrollTo(0, 0);
      }
      await sleep(350);
      if (sc.focus) {
        const el = $(sc.focus);
        el.scrollIntoView({ block: 'center' });
        el.focus({ focusVisible: true });
        await sleep(450);
      }
      if (sc.hover) {
        const el = $(sc.hover);
        el.scrollIntoView({ block: 'center' });
        await sleep(100);
        const r = el.getBoundingClientRect();
        return { hover: [r.left + r.width / 2, r.top + r.height / 2] };
      }
      return true;
    }
  };
})();
