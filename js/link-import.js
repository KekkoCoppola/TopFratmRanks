// Import a clip from a social link (currently TikTok) as a no-watermark File,
// entirely client-side. Resolves the download URL through a public API, then
// fetches the media into a same-origin blob so it can be drawn to canvas and
// exported without tainting. Providers are isolated so they can be swapped if
// one goes down.
(function () {
  'use strict';

  function isTikTok(url) {
    return /(^|\.)tiktok\.com\//i.test(url) || /(^|\.)vm\.tiktok\.com\//i.test(url) ||
           /douyin\.com\//i.test(url);
  }

  // Resolve a TikTok URL to a direct, watermark-free MP4 URL via the tikwm API.
  function resolveTikTok(url) {
    var api = 'https://tikwm.com/api/?hd=1&url=' + encodeURIComponent(url);
    return fetch(api).then(function (r) {
      if (!r.ok) throw new Error('Download service returned HTTP ' + r.status + '.');
      return r.json();
    }).then(function (j) {
      if (!j || j.code !== 0 || !j.data) {
        throw new Error((j && j.msg) ? j.msg : 'Could not read this TikTok link.');
      }
      var play = j.data.hdplay || j.data.play || j.data.wmplay;
      if (!play) throw new Error('No downloadable video found for this link.');
      // tikwm sometimes returns a relative path on its own domain
      if (play.charAt(0) === '/') play = 'https://tikwm.com' + play;
      return { mediaUrl: play, title: j.data.title || '' };
    });
  }

  // Public: importFromLink(url, onStatus) -> Promise<File>
  function importFromLink(url, onStatus) {
    onStatus = onStatus || function () {};
    url = (url || '').trim();
    if (!url) return Promise.reject(new Error('Paste a link first.'));
    if (!/^https?:\/\//i.test(url)) return Promise.reject(new Error('That does not look like a valid link.'));
    if (!isTikTok(url)) return Promise.reject(new Error('Only TikTok links are supported for now.'));

    onStatus('Resolving link…');
    return resolveTikTok(url).then(function (info) {
      onStatus('Downloading (no watermark)…');
      return fetch(info.mediaUrl).then(function (r) {
        if (!r.ok) throw new Error('Failed to download the video (HTTP ' + r.status + ').');
        return r.blob();
      }).then(function (blob) {
        if (!blob.size) throw new Error('Downloaded an empty file — try again.');
        var type = blob.type && /video\//.test(blob.type) ? blob.type : 'video/mp4';
        var name = 'tiktok-' + Date.now() + '.mp4';
        return new File([blob], name, { type: type });
      });
    });
  }

  window.TRV = window.TRV || {};
  window.TRV.importFromLink = importFromLink;
  window.TRV.isSupportedLink = isTikTok;
})();
