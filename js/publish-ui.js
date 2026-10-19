// Publishing UI: settings section, Publish button and the 2-step confirm modal.
// Consumes TRV.youtube (OAuth/upload) and TRV.lastExport (set by the exporter).
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  var notConfigured = $('publish-not-configured');
  var configured = $('publish-configured');
  var connectBtn = $('btn-yt-connect');
  var accountBox = $('yt-account');
  var ytTitle = $('yt-title');
  var ytDesc = $('yt-desc');
  var ytPrivacy = $('yt-privacy');
  var publishBtn = $('btn-publish');
  var publishBtnLabel = $('btn-publish-label');

  var modal = $('publish-modal');
  var steps = {
    summary: $('publish-step-summary'),
    confirm: $('publish-step-confirm'),
    progress: $('publish-step-progress'),
    result: $('publish-step-result')
  };

  var uploading = false;

  // Publishing switched off in config.js: shown as "coming soon", nothing to click
  var available = !!(window.TRV_CONFIG && TRV_CONFIG.publishing);
  $('youtube-soon').hidden = available;
  $('publish-soon').hidden = available;

  /* ---------- configured vs not ---------- */
  function renderConfigState() {
    var ok = TRV.youtube.isConfigured();
    notConfigured.style.display = available && !ok ? '' : 'none';
    configured.style.display = available && ok ? '' : 'none';
  }
  renderConfigState();

  /* ---------- metadata persistence ---------- */
  try {
    ytTitle.value = localStorage.getItem('trv_yt_title') || '';
    ytDesc.value = localStorage.getItem('trv_yt_desc') !== null ? localStorage.getItem('trv_yt_desc') : '#Shorts';
    ytPrivacy.value = localStorage.getItem('trv_yt_privacy') || 'public';
  } catch (e) {}

  ytTitle.addEventListener('input', function () { try { localStorage.setItem('trv_yt_title', ytTitle.value); } catch (e) {} });
  ytDesc.addEventListener('input', function () { try { localStorage.setItem('trv_yt_desc', ytDesc.value); } catch (e) {} });
  ytPrivacy.addEventListener('change', function () { try { localStorage.setItem('trv_yt_privacy', ytPrivacy.value); } catch (e) {} });

  // Effective YouTube title: explicit field, else ranking title + #Shorts.
  function effectiveTitle() {
    var t = ytTitle.value.trim();
    if (!t) {
      t = (TRV.state.title.text.trim() || 'My Ranking') + ' #Shorts';
    }
    return t.replace(/[<>]/g, '').slice(0, 100);
  }

  /* ---------- account ---------- */
  var ICON_CLOSE = '<svg class="ss-icon" viewBox="0 0 12 12" aria-hidden="true"><path d="m3 3 6 6M9 3 3 9"/></svg>';
  var connecting = false;

  function renderAccount() {
    accountBox.innerHTML = '';
    var ch = TRV.youtube.getChannel();
    if (ch) {
      var wrap = document.createElement('div');
      wrap.className = 'ss-account';
      if (ch.thumb) {
        var avatar = document.createElement('img');
        avatar.className = 'ss-account__avatar';
        avatar.src = ch.thumb;
        avatar.alt = '';
        wrap.appendChild(avatar);
      }
      var name = document.createElement('span');
      name.className = 'ss-account__name';
      name.textContent = ch.title;
      wrap.appendChild(name);
      var out = document.createElement('button');
      out.type = 'button';
      out.className = 'ss-icon-btn ss-icon-btn--bare';
      out.title = TRV.t('disconnect');
      out.setAttribute('aria-label', TRV.t('disconnect'));
      out.innerHTML = ICON_CLOSE;
      out.addEventListener('click', function () {
        TRV.youtube.disconnect();
        renderAccount();
      });
      wrap.appendChild(out);
      accountBox.appendChild(wrap);
    } else {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ss-btn ss-btn--sm yt-connect';
      btn.textContent = TRV.t(connecting ? 'connecting' : 'connectYouTube');
      btn.disabled = connecting;
      btn.addEventListener('click', doConnect);
      accountBox.appendChild(btn);
    }
  }

  // Sign-in failures are shown as an error note in the panel (and in the publish
  // modal when the sign-in started there), instead of a native alert.
  function showSignInError(message) {
    ['yt-error', 'ps-error'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.textContent = message ? TRV.t('signInFailed', { m: message }) : '';
      el.hidden = !message;
    });
  }

  function doConnect() {
    connecting = true;
    showSignInError(null);
    var btn = accountBox.querySelector('.yt-connect');
    if (btn) { btn.disabled = true; btn.textContent = TRV.t('connecting'); }
    return TRV.youtube.connect(true).then(function () {
      connecting = false;
      renderAccount();
      refreshSummary();
    }).catch(function (err) {
      connecting = false;
      renderAccount();
      showSignInError(err.message);
    });
  }

  if (connectBtn) connectBtn.addEventListener('click', doConnect);

  /* ---------- setup wizard ---------- */
  var setupModal = $('setup-modal');
  var setupInput = $('setup-client-id');
  var setupError = $('setup-error');
  var copyBtn = $('setup-copy-origin');

  function openSetup() {
    // Only a real web origin can be authorized on Google's side.
    $('setup-file-warning').style.display = location.protocol === 'file:' ? '' : 'none';
    $('setup-origin').textContent = location.protocol === 'file:' ? 'http://localhost:8123' : location.origin;
    setupInput.value = TRV.youtube.getClientId();
    setupError.style.display = 'none';
    setupModal.style.display = '';
    TRV.modal.open(setupModal, { onEscape: closeSetup, initialFocus: setupInput });
  }

  function closeSetup() {
    setupModal.style.display = 'none';
    TRV.modal.close(setupModal);
  }

  $('btn-setup-open').addEventListener('click', openSetup);
  $('btn-setup-edit').addEventListener('click', openSetup);
  $('setup-close').addEventListener('click', closeSetup);
  $('setup-cancel').addEventListener('click', closeSetup);
  setupModal.addEventListener('click', function (e) { if (e.target === setupModal) closeSetup(); });

  // Copy button: the copy icon turns into a check for a moment (label follows)
  function setCopied(done) {
    copyBtn.querySelector('.copy-icon').toggleAttribute('hidden', done);
    copyBtn.querySelector('.check-icon').toggleAttribute('hidden', !done);
    var label = TRV.t(done ? 'copied' : 'copy');
    copyBtn.setAttribute('aria-label', label);
    copyBtn.title = label;
  }

  copyBtn.addEventListener('click', function () {
    var text = $('setup-origin').textContent;
    function flash() {
      setCopied(true);
      setTimeout(function () { setCopied(false); }, 1200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(flash, flash);
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      ta.remove();
      flash();
    }
  });

  $('setup-save').addEventListener('click', function () {
    var id = setupInput.value.trim();
    if (!/^[\w-]+(\.[\w-]+)*\.apps\.googleusercontent\.com$/.test(id)) {
      setupError.textContent = TRV.t('errClientId');
      setupError.style.display = '';
      return;
    }
    TRV.youtube.setClientId(id);
    renderConfigState();
    renderAccount();
    updatePublishButton();
    closeSetup();
  });

  setupInput.addEventListener('input', function () { setupError.style.display = 'none'; });

  /* ---------- publish button state ---------- */
  var generatingForPublish = false;

  function updatePublishButton() {
    if (!available) {
      publishBtn.disabled = true;
      publishBtnLabel.textContent = TRV.t('publish');
      publishBtn.title = TRV.t('publishTitleSoon');
      return;
    }
    var hasVideo = !!TRV.lastExport;
    var confOk = TRV.youtube.isConfigured();
    var canGenerate = TRV.loadedClipCount() >= 1;
    var busy = uploading || generatingForPublish || (TRV.isGenerating && TRV.isGenerating());
    publishBtn.disabled = busy || !confOk || (!hasVideo && !canGenerate);
    publishBtnLabel.textContent = TRV.t(generatingForPublish ? 'generating' : 'publish');
    publishBtn.title = !confOk ? TRV.t('publishTitleSetup')
      : (!hasVideo && !canGenerate) ? TRV.t('publishTitleNoClip')
      : hasVideo ? TRV.t('publishTitleReady')
      : TRV.t('publishTitleGenerate');
  }

  TRV.onChange(updatePublishButton);

  // Language switch: re-render what this file builds in JS
  TRV.onLang(function () {
    renderAccount();
    updatePublishButton();
  });
  updatePublishButton();

  /* ---------- modal helpers ---------- */
  var dialog = modal.querySelector('.ss-modal');
  var modalOpen = false;

  function showStep(name) {
    Object.keys(steps).forEach(function (k) {
      steps[k].style.display = k === name ? '' : 'none';
    });
    var heading = steps[name].querySelector('.ss-modal__title');
    if (heading) dialog.setAttribute('aria-labelledby', heading.id);
    if (modalOpen) TRV.modal.focusIn(steps[name]);
  }

  function openModal() {
    modal.style.display = '';
    showSignInError(null);
    refreshSummary();
    showStep('summary');
    modalOpen = true;
    var primary = $('ps-continue').style.display === 'none' ? $('ps-connect') : $('ps-continue');
    TRV.modal.open(modal, { onEscape: closeModal, initialFocus: primary });
  }

  function closeModal() {
    if (uploading) return; // don't close mid-upload
    modal.style.display = 'none';
    modalOpen = false;
    TRV.modal.close(modal);
  }

  $('publish-close').addEventListener('click', closeModal);
  $('ps-cancel').addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

  function refreshSummary() {
    var exp = TRV.lastExport;
    $('ps-title').textContent = effectiveTitle();
    $('ps-privacy').textContent = ytPrivacy.options[ytPrivacy.selectedIndex].text;
    $('ps-file').textContent = exp ? (exp.filename + ' · ' + TRV.fileSize(exp.blob.size)) : '—';
    var ch = TRV.youtube.getChannel();
    $('ps-channel').textContent = ch ? ch.title : TRV.t('notConnected');
    $('ps-connect').style.display = ch ? 'none' : '';
    $('ps-continue').style.display = ch ? '' : 'none';
  }

  $('ps-connect').addEventListener('click', function () {
    doConnect().then(refreshSummary);
  });

  function confirmText() {
    var privacy = ytPrivacy.value;
    var ch = TRV.youtube.getChannel();
    var chName = ch ? ch.title : TRV.t('yourChannel');
    if (privacy === 'public') return TRV.t('confirmPublic', { c: chName });
    if (privacy === 'unlisted') return TRV.t('confirmUnlisted', { c: chName });
    return TRV.t('confirmPrivate', { c: chName });
  }

  $('ps-continue').addEventListener('click', function () {
    $('pc-text').textContent = confirmText();
    showStep('confirm');
  });

  // Language switch while the modal is open: re-render its JS-built text
  TRV.onLang(function () {
    if (!modalOpen) return;
    refreshSummary();
    if (steps.confirm.style.display !== 'none') $('pc-text').textContent = confirmText();
  });

  $('pc-back').addEventListener('click', function () { showStep('summary'); });

  /* ---------- upload ---------- */
  function startUpload() {
    var exp = TRV.lastExport;
    if (!exp) return;
    uploading = true;
    updatePublishButton();
    showStep('progress');
    $('pp-fill').style.width = '0%';
    $('pp-status').textContent = TRV.t('starting');

    TRV.youtube.upload(exp.blob, {
      title: effectiveTitle(),
      description: ytDesc.value,
      privacyStatus: ytPrivacy.value
    }, function (p) {
      $('pp-fill').style.width = Math.round((p.pct || 0) * 100) + '%';
      $('pp-status').textContent = p.stage || '';
    }).then(function (res) {
      uploading = false;
      updatePublishButton();
      $('pr-title').textContent = TRV.t('published');
      $('pr-text').textContent = TRV.t('publishedText');
      $('pr-retry').style.display = 'none';
      var link = $('pr-link');
      link.href = res.url;
      link.style.display = '';
      showStep('result');
    }).catch(function (err) {
      uploading = false;
      updatePublishButton();
      $('pr-title').textContent = TRV.t('uploadFailed');
      $('pr-text').textContent = err.message || String(err);
      $('pr-link').style.display = 'none';
      $('pr-retry').style.display = '';
      showStep('result');
    });
  }

  $('pc-publish').addEventListener('click', startUpload);
  $('pr-retry').addEventListener('click', startUpload);
  $('pr-close').addEventListener('click', closeModal);

  publishBtn.addEventListener('click', function () {
    if (publishBtn.disabled) return;
    if (TRV.lastExport) {
      openModal();
      return;
    }
    generatingForPublish = true;
    updatePublishButton();
    TRV.runGenerate().then(function () {
      generatingForPublish = false;
      updatePublishButton();
      openModal();
    }).catch(function () {
      generatingForPublish = false;
      updatePublishButton();
      // failure is already shown in the Generate progress area
    });
  });
})();
