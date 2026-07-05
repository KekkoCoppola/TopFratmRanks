// YouTube publishing module — everything Google-side, isolated.
// OAuth via Google Identity Services (token model, browser-only, no secret),
// channel lookup via YouTube Data API v3, upload via resumable protocol with
// XHR progress (multipart fallback). Requires TRV_CONFIG.googleClientId.
(function () {
  'use strict';

  var SCOPES = 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly';

  var accessToken = null;
  var expiresAt = 0;          // ms epoch
  var tokenClient = null;
  var channel = null;         // { title, thumb }
  var pendingAuth = null;     // { resolve, reject } for the in-flight token request

  function isConfigured() {
    return !!(window.TRV_CONFIG && TRV_CONFIG.googleClientId);
  }

  function isConnected() {
    return !!accessToken && Date.now() < expiresAt - 60000;
  }

  function getChannel() { return channel; }

  // Wait for the GIS script (loaded async in <head>) to be available.
  function waitForGis() {
    return new Promise(function (resolve, reject) {
      var waited = 0;
      (function check() {
        if (window.google && google.accounts && google.accounts.oauth2) return resolve();
        waited += 200;
        if (waited >= 10000) return reject(new Error('Google sign-in script failed to load. Check your connection or ad blocker.'));
        setTimeout(check, 200);
      })();
    });
  }

  function getTokenClient() {
    if (!tokenClient) {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: TRV_CONFIG.googleClientId,
        scope: SCOPES,
        callback: function (resp) {
          var p = pendingAuth;
          pendingAuth = null;
          if (!p) return;
          if (resp && resp.access_token) {
            accessToken = resp.access_token;
            expiresAt = Date.now() + (resp.expires_in ? resp.expires_in * 1000 : 3300000);
            p.resolve();
          } else {
            p.reject(new Error((resp && resp.error_description) || 'Google sign-in failed.'));
          }
        },
        error_callback: function (err) {
          var p = pendingAuth;
          pendingAuth = null;
          if (p) p.reject(new Error(err && err.message ? err.message : 'Google sign-in was cancelled.'));
        }
      });
    }
    return tokenClient;
  }

  // Request an access token. interactive=true forces the consent popup;
  // false attempts a silent grant (works if the user already consented).
  function requestToken(interactive) {
    if (!isConfigured()) return Promise.reject(new Error('Publishing is not configured (missing Google Client ID).'));
    return waitForGis().then(function () {
      return new Promise(function (resolve, reject) {
        if (pendingAuth) return reject(new Error('Another sign-in is already in progress.'));
        pendingAuth = { resolve: resolve, reject: reject };
        try {
          getTokenClient().requestAccessToken({ prompt: interactive ? 'consent' : '' });
        } catch (e) {
          pendingAuth = null;
          reject(e);
        }
      });
    });
  }

  function apiGet(url) {
    return fetch(url, { headers: { Authorization: 'Bearer ' + accessToken } }).then(function (r) {
      if (!r.ok) return r.json().catch(function () { return {}; }).then(function (j) {
        throw httpError(r.status, j);
      });
      return r.json();
    });
  }

  function httpError(status, body) {
    var reason = body && body.error && body.error.errors && body.error.errors[0] && body.error.errors[0].reason;
    var msg = (body && body.error && body.error.message) || ('HTTP ' + status);
    var e = new Error(msg);
    e.status = status;
    e.reason = reason;
    if (status === 403 && /quota/i.test(reason || msg)) {
      e.message = 'Daily YouTube upload quota reached — try again tomorrow.';
      e.quota = true;
    }
    return e;
  }

  function fetchChannel() {
    return apiGet('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true').then(function (j) {
      var item = j.items && j.items[0];
      if (!item) throw new Error('No YouTube channel found on this Google account.');
      channel = {
        title: item.snippet.title,
        thumb: item.snippet.thumbnails && item.snippet.thumbnails.default ? item.snippet.thumbnails.default.url : null
      };
      return channel;
    });
  }

  // connect(interactive) -> Promise<channel>
  function connect(interactive) {
    return requestToken(!!interactive).then(fetchChannel);
  }

  function disconnect() {
    if (accessToken && window.google && google.accounts && google.accounts.oauth2) {
      try { google.accounts.oauth2.revoke(accessToken, function () {}); } catch (e) {}
    }
    accessToken = null;
    expiresAt = 0;
    channel = null;
  }

  // Make sure we hold a fresh token; silently refresh if needed.
  function ensureToken() {
    if (isConnected()) return Promise.resolve();
    return requestToken(false);
  }

  /* ---------------- upload ---------------- */

  function buildMetadata(meta) {
    return {
      snippet: {
        title: meta.title,
        description: meta.description || '',
        categoryId: '24' // Entertainment
      },
      status: {
        privacyStatus: meta.privacyStatus || 'public',
        selfDeclaredMadeForKids: false
      }
    };
  }

  function xhrPut(url, blob, headers, onPct) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('PUT', url);
      Object.keys(headers || {}).forEach(function (k) { xhr.setRequestHeader(k, headers[k]); });
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable && onPct) onPct(e.loaded / e.total);
      };
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText)); }
          catch (e) { reject(new Error('Upload finished but the response could not be read.')); }
        } else {
          var body = null;
          try { body = JSON.parse(xhr.responseText); } catch (e) {}
          reject(httpError(xhr.status, body));
        }
      };
      xhr.onerror = function () { reject(new Error('Network error during upload.')); };
      xhr.send(blob);
    });
  }

  // Multipart fallback: metadata + media in a single XHR request.
  function uploadMultipart(blob, meta, onPct) {
    var boundary = 'trv' + Date.now();
    var head = '--' + boundary + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' +
               JSON.stringify(buildMetadata(meta)) + '\r\n' +
               '--' + boundary + '\r\nContent-Type: video/mp4\r\n\r\n';
    var tail = '\r\n--' + boundary + '--';
    var body = new Blob([head, blob, tail]);
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status');
      xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
      xhr.setRequestHeader('Content-Type', 'multipart/related; boundary=' + boundary);
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable && onPct) onPct(e.loaded / e.total);
      };
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText)); }
          catch (e) { reject(new Error('Upload finished but the response could not be read.')); }
        } else {
          var b = null;
          try { b = JSON.parse(xhr.responseText); } catch (e) {}
          reject(httpError(xhr.status, b));
        }
      };
      xhr.onerror = function () { reject(new Error('Network error during upload.')); };
      xhr.send(body);
    });
  }

  function doUpload(blob, meta, onProgress) {
    onProgress({ stage: 'Starting upload…', pct: 0 });
    // 1) resumable session
    return fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Length': String(blob.size),
        'X-Upload-Content-Type': 'video/mp4'
      },
      body: JSON.stringify(buildMetadata(meta))
    }).then(function (r) {
      if (!r.ok) return r.json().catch(function () { return {}; }).then(function (j) { throw httpError(r.status, j); });
      var loc = r.headers.get('Location') || r.headers.get('location');
      if (!loc) {
        // CORS did not expose the session URL — single-request fallback.
        onProgress({ stage: 'Uploading…', pct: 0 });
        return uploadMultipart(blob, meta, function (p) {
          onProgress({ stage: 'Uploading… ' + Math.round(p * 100) + '%', pct: p });
        });
      }
      // 2) upload the bytes
      return xhrPut(loc, blob, { 'Content-Type': 'video/mp4' }, function (p) {
        onProgress({ stage: 'Uploading… ' + Math.round(p * 100) + '%', pct: p });
      });
    }).then(function (json) {
      if (!json || !json.id) throw new Error('YouTube did not return a video id.');
      return { videoId: json.id, url: 'https://www.youtube.com/watch?v=' + json.id };
    });
  }

  // upload(blob, meta, onProgress) -> Promise<{videoId, url}>
  // Retries once with a silent re-login on 401.
  function upload(blob, meta, onProgress) {
    onProgress = onProgress || function () {};
    return ensureToken().then(function () {
      return doUpload(blob, meta, onProgress).catch(function (err) {
        if (err && err.status === 401) {
          onProgress({ stage: 'Session expired — signing in again…', pct: 0 });
          return requestToken(false).then(function () { return doUpload(blob, meta, onProgress); });
        }
        throw err;
      });
    });
  }

  TRV.youtube = {
    isConfigured: isConfigured,
    isConnected: isConnected,
    getChannel: getChannel,
    connect: connect,
    disconnect: disconnect,
    upload: upload
  };
})();
