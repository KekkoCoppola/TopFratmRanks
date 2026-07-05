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

  var modal = $('publish-modal');
  var steps = {
    summary: $('publish-step-summary'),
    confirm: $('publish-step-confirm'),
    progress: $('publish-step-progress'),
    result: $('publish-step-result')
  };

  var uploading = false;

  /* ---------- configured vs not ---------- */
  var ok = TRV.youtube.isConfigured();
  notConfigured.style.display = ok ? 'none' : '';
  configured.style.display = ok ? '' : 'none';

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
  function renderAccount() {
    accountBox.innerHTML = '';
    var ch = TRV.youtube.getChannel();
    if (ch) {
      var wrap = document.createElement('div');
      wrap.className = 'yt-connected';
      wrap.innerHTML = (ch.thumb ? '<img class="yt-avatar" src="' + ch.thumb + '" alt="">' : '') +
        '<span class="yt-name">' + escapeHtml(ch.title) + '</span>';
      var out = document.createElement('button');
      out.type = 'button';
      out.className = 'btn-icon';
      out.title = 'Disconnect';
      out.textContent = '✕';
      out.addEventListener('click', function () {
        TRV.youtube.disconnect();
        renderAccount();
      });
      wrap.appendChild(out);
      accountBox.appendChild(wrap);
    } else {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-connect';
      btn.textContent = 'Connect YouTube';
      btn.addEventListener('click', doConnect);
      accountBox.appendChild(btn);
    }
  }

  function doConnect() {
    var btn = accountBox.querySelector('.btn-connect');
    if (btn) { btn.disabled = true; btn.textContent = 'Connecting…'; }
    return TRV.youtube.connect(true).then(function () {
      renderAccount();
      refreshSummary();
    }).catch(function (err) {
      renderAccount();
      alert('YouTube sign-in failed: ' + err.message);
    });
  }

  if (connectBtn) connectBtn.addEventListener('click', doConnect);

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- publish button state ---------- */
  function updatePublishButton() {
    var hasVideo = !!TRV.lastExport;
    var confOk = TRV.youtube.isConfigured();
    publishBtn.disabled = uploading || !hasVideo || !confOk;
    publishBtn.title = !confOk ? 'Publishing not configured (docs/YOUTUBE_SETUP.md)'
      : !hasVideo ? 'Generate the video first'
      : 'Publish the generated video to YouTube';
  }

  TRV.onChange(updatePublishButton);
  updatePublishButton();

  /* ---------- modal helpers ---------- */
  function showStep(name) {
    Object.keys(steps).forEach(function (k) {
      steps[k].style.display = k === name ? '' : 'none';
    });
  }

  function openModal() {
    modal.style.display = '';
    refreshSummary();
    showStep('summary');
  }

  function closeModal() {
    if (uploading) return; // don't close mid-upload
    modal.style.display = 'none';
  }

  $('publish-close').addEventListener('click', closeModal);
  $('ps-cancel').addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

  function fmtSize(bytes) {
    return bytes > 1048576 ? (bytes / 1048576).toFixed(1) + ' MB' : Math.round(bytes / 1024) + ' KB';
  }

  function refreshSummary() {
    var exp = TRV.lastExport;
    $('ps-title').textContent = effectiveTitle();
    $('ps-privacy').textContent = ytPrivacy.options[ytPrivacy.selectedIndex].text;
    $('ps-file').textContent = exp ? (exp.filename + ' · ' + fmtSize(exp.blob.size)) : '—';
    var ch = TRV.youtube.getChannel();
    $('ps-channel').textContent = ch ? ch.title : 'Not connected';
    $('ps-connect').style.display = ch ? 'none' : '';
    $('ps-continue').style.display = ch ? '' : 'none';
  }

  $('ps-connect').addEventListener('click', function () {
    doConnect().then(refreshSummary);
  });

  $('ps-continue').addEventListener('click', function () {
    var privacy = ytPrivacy.value;
    var ch = TRV.youtube.getChannel();
    var chName = ch ? ch.title : 'your channel';
    var txt;
    if (privacy === 'public') {
      txt = 'The video will be PUBLIC immediately on the channel "' + chName + '". Everyone will be able to see it. Are you sure?';
    } else if (privacy === 'unlisted') {
      txt = 'The video will be uploaded as UNLISTED on "' + chName + '" — visible only to people with the link.';
    } else {
      txt = 'The video will be uploaded as PRIVATE on "' + chName + '" — visible only to you.';
    }
    $('pc-text').textContent = txt;
    showStep('confirm');
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
    $('pp-status').textContent = 'Starting…';

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
      $('pr-title').textContent = '✅ Published!';
      $('pr-text').textContent = 'Your video is on YouTube. Processing may take a minute before it appears.';
      $('pr-retry').style.display = 'none';
      var link = $('pr-link');
      link.href = res.url;
      link.style.display = '';
      showStep('result');
    }).catch(function (err) {
      uploading = false;
      updatePublishButton();
      $('pr-title').textContent = '⚠ Upload failed';
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
    openModal();
  });
})();
