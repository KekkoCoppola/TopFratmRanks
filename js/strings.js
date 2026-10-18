// UI strings for text built in JS. Italian is the default, English sits next to it
// (static text lives in the HTML with data-en, handled by i18n.js).
// Language comes from i18n.js (window.ssLang); listen with TRV.onLang to re-render.
// Load after state.js: state.js replaces window.TRV.
(function () {
  'use strict';

  var STRINGS = {
    /* header */
    rankDisplay: { it: 'Classifica: Top {n}', en: 'Ranking: Top {n}' },
    editorTitle: { it: 'TopFratmRanks — Editor Top {n}', en: 'TopFratmRanks — Top {n} Editor' },

    /* title section */
    wordsHint: { it: 'Scrivi un titolo qui sopra per colorare ogni parola', en: 'Type a title above to color each word' },
    wordColorTitle: { it: 'Cambia il colore di "{w}"', en: 'Change color of "{w}"' },
    colorN: { it: 'Colore #{n}', en: 'Color #{n}' },

    /* clip slots */
    rankOption: { it: 'Posizione #{n}', en: 'Rank #{n}' },
    rankSelectTitle: { it: 'Cambia il numero di posizione di questa clip', en: 'Change the rank number of this clip' },
    playsNth: { it: 'Nel video questa clip è la {nth}', en: 'This clip plays {nth} in the video' },
    removeClip: { it: 'Rimuovi clip', en: 'Remove clip' },
    removeRankTitle: { it: 'Rimuovi del tutto questa posizione', en: 'Remove this rank entirely' },
    pasteLink: { it: 'Incolla un link TikTok…', en: 'Paste a TikTok link…' },
    importBtn: { it: 'Importa', en: 'Import' },
    uploadFile: { it: 'Carica file', en: 'Upload file' },
    dropHint: { it: 'MP4 / WebM, la clip per la posizione #{n}', en: 'MP4 / WebM, the clip for rank #{n}' },
    labelPlaceholder: { it: 'Etichetta accanto al #{n} (es. "Wow")', en: 'Label shown next to #{n} (e.g. "Wow")' },
    errNotVideo: { it: 'Non è un file video.', en: 'Not a video file.' },
    errCannotLoad: { it: 'Impossibile caricare questa clip.', en: 'Cannot load this clip.' },
    resolvingLink: { it: 'Risoluzione del link…', en: 'Resolving link…' },
    errImportLink: { it: 'Impossibile importare da quel link.', en: 'Could not import from that link.' },
    maxRanks: { it: 'Massimo {n} posizioni', en: 'Maximum of {n} ranks' },
    confirmRemoveRankTitle: { it: 'Rimuovere la posizione #{n} e la sua clip?', en: 'Remove rank #{n} and its loaded clip?' },
    confirmRemoveRankBody: { it: 'Non si può annullare.', en: 'This cannot be undone.' },
    remove: { it: 'Rimuovi', en: 'Remove' },
    cancel: { it: 'Annulla', en: 'Cancel' },

    /* export */
    generate: { it: 'Genera il video classifica', en: 'Generate Video Ranking' },
    generatePartial: { it: 'Genera ({l}/{n} clip caricate)', en: 'Generate ({l}/{n} clips loaded)' },
    generating: { it: 'Generazione…', en: 'Generating…' },
    errBusy: { it: 'È già in corso una generazione.', en: 'A generation is already in progress.' },
    exportDone: { it: 'Fatto! Scaricato {f}', en: 'Done! Downloaded {f}' },
    exportFailed: { it: 'Export non riuscito: {m}', en: 'Export failed: {m}' },
    preparing: { it: 'Preparazione…', en: 'Preparing…' },

    /* preview */
    playPreview: { it: 'Riproduci anteprima', en: 'Play preview' },
    pause: { it: 'Metti in pausa', en: 'Pause' },

    /* publishing */
    connectYouTube: { it: 'Collega YouTube', en: 'Connect YouTube' },
    connecting: { it: 'Collegamento…', en: 'Connecting…' },
    disconnect: { it: 'Disconnetti', en: 'Disconnect' },
    signInFailed: { it: 'Accesso a YouTube non riuscito: {m}', en: 'YouTube sign-in failed: {m}' },
    copy: { it: 'Copia', en: 'Copy' },
    copied: { it: 'Copiato', en: 'Copied' },
    errClientId: {
      it: 'Non sembra un Client ID: deve finire con ".apps.googleusercontent.com".',
      en: 'That does not look like a Client ID — it must end with ".apps.googleusercontent.com".'
    },
    publish: { it: 'Pubblica', en: 'Publish' },
    publishTitleSetup: {
      it: 'Prima configura la pubblicazione (sezione Pubblicazione nel pannello)',
      en: 'Set up publishing first (Publishing section in the panel)'
    },
    publishTitleNoClip: { it: 'Prima carica almeno una clip', en: 'Load at least one clip first' },
    publishTitleSoon: { it: 'La pubblicazione non è ancora disponibile', en: 'Publishing is not available yet' },
    publishTitleReady: { it: 'Pubblica su YouTube il video generato', en: 'Publish the generated video to YouTube' },
    publishTitleGenerate: { it: 'Genera il video, poi lo pubblica su YouTube', en: 'Generates the video, then publishes it to YouTube' },
    notConnected: { it: 'Non collegato', en: 'Not connected' },
    yourChannel: { it: 'il tuo canale', en: 'your channel' },
    confirmPublic: {
      it: 'Il video sarà subito pubblico sul canale "{c}". Tutti potranno vederlo. Confermi?',
      en: 'The video will be public immediately on the channel "{c}". Everyone will be able to see it. Are you sure?'
    },
    confirmUnlisted: {
      it: 'Il video verrà caricato come non in elenco su "{c}": visibile solo a chi ha il link.',
      en: 'The video will be uploaded as unlisted on "{c}" — visible only to people with the link.'
    },
    confirmPrivate: {
      it: 'Il video verrà caricato come privato su "{c}": visibile solo a te.',
      en: 'The video will be uploaded as private on "{c}" — visible only to you.'
    },
    starting: { it: 'Avvio…', en: 'Starting…' },
    published: { it: 'Pubblicato!', en: 'Published!' },
    publishedText: {
      it: 'Il tuo video è su YouTube. Può servire un minuto di elaborazione prima che compaia.',
      en: 'Your video is on YouTube. Processing may take a minute before it appears.'
    },
    uploadFailed: { it: 'Caricamento non riuscito', en: 'Upload failed' },

    /* state.js */
    errNoVideoTrack: { it: 'Questo file non ha una traccia video leggibile.', en: 'This file has no readable video track.' },
    errDecode: { it: 'Impossibile decodificare questo video. Usa MP4 (H.264) o WebM.', en: 'Cannot decode this video. Use MP4 (H.264) or WebM.' },

    /* link-import.js */
    errHttpService: { it: 'Il servizio di download ha risposto HTTP {s}.', en: 'Download service returned HTTP {s}.' },
    errReadTikTok: { it: 'Impossibile leggere questo link TikTok.', en: 'Could not read this TikTok link.' },
    errNoDownload: { it: 'Nessun video scaricabile per questo link.', en: 'No downloadable video found for this link.' },
    errPasteFirst: { it: 'Prima incolla un link.', en: 'Paste a link first.' },
    errBadLink: { it: 'Non sembra un link valido.', en: 'That does not look like a valid link.' },
    errOnlyTikTok: { it: 'Per ora sono supportati solo i link TikTok.', en: 'Only TikTok links are supported for now.' },
    downloading: { it: 'Download (senza filigrana)…', en: 'Downloading (no watermark)…' },
    errDownloadHttp: { it: 'Download del video non riuscito (HTTP {s}).', en: 'Failed to download the video (HTTP {s}).' },
    errEmptyFile: { it: 'Il file scaricato è vuoto: riprova.', en: 'Downloaded an empty file — try again.' },

    /* exporter.js */
    errSeek: { it: 'Tempo scaduto durante la lettura di una clip.', en: 'Seek timed out while reading a clip.' },
    errNoH264: { it: 'Codifica H.264 non supportata qui.', en: 'H.264 encoding not supported here.' },
    prepAudio: { it: 'Preparazione dell\'audio…', en: 'Preparing audio…' },
    renderingFrame: { it: 'Rendering clip {s}/{n}, fotogramma {f}/{total}', en: 'Rendering clip {s}/{n} — frame {f}/{total}' },
    encodingAudio: { it: 'Codifica dell\'audio…', en: 'Encoding audio…' },
    finalizing: { it: 'Finalizzazione MP4…', en: 'Finalizing MP4…' },
    errNoRecorder: { it: 'Nessun formato di registrazione supportato in questo browser.', en: 'No supported recording format in this browser.' },
    errRecording: { it: 'Registrazione non riuscita.', en: 'Recording failed.' },
    recordingRealtime: { it: 'Registrazione in tempo reale… {t} s / {total} s', en: 'Recording in realtime… {t}s / {total}s' },
    errLoadClipFirst: { it: 'Prima carica almeno una clip.', en: 'Load at least one clip first.' },
    fastUnavailable: { it: 'Export rapido non disponibile: registro in tempo reale…', en: 'Fast export unavailable — recording in realtime instead…' },

    /* youtube.js */
    errGisLoad: {
      it: 'Lo script di accesso Google non si è caricato. Controlla la connessione o l\'ad blocker.',
      en: 'Google sign-in script failed to load. Check your connection or ad blocker.'
    },
    errSignIn: { it: 'Accesso con Google non riuscito.', en: 'Google sign-in failed.' },
    errSignInCancelled: { it: 'Accesso con Google annullato.', en: 'Google sign-in was cancelled.' },
    errNotConfigured: { it: 'La pubblicazione non è configurata (manca il Client ID Google).', en: 'Publishing is not configured (missing Google Client ID).' },
    errSignInBusy: { it: 'È già in corso un altro accesso.', en: 'Another sign-in is already in progress.' },
    errQuota: { it: 'Raggiunta la quota giornaliera di caricamenti YouTube: riprova domani.', en: 'Daily YouTube upload quota reached — try again tomorrow.' },
    errNoChannel: { it: 'Nessun canale YouTube su questo account Google.', en: 'No YouTube channel found on this Google account.' },
    errUploadResponse: { it: 'Caricamento finito, ma la risposta non è leggibile.', en: 'Upload finished but the response could not be read.' },
    errNetwork: { it: 'Errore di rete durante il caricamento.', en: 'Network error during upload.' },
    startingUpload: { it: 'Avvio del caricamento…', en: 'Starting upload…' },
    uploading: { it: 'Caricamento…', en: 'Uploading…' },
    uploadingPct: { it: 'Caricamento… {p}%', en: 'Uploading… {p}%' },
    errNoVideoId: { it: 'YouTube non ha restituito l\'ID del video.', en: 'YouTube did not return a video id.' },
    sessionExpired: { it: 'Sessione scaduta: nuovo accesso…', en: 'Session expired — signing in again…' }
  };

  // i18n.js sends its first "ss:lang" (saved English) before it defines window.ssLang,
  // so keep the event's language too: this listener is the first one, it runs before the re-renders
  var current = 'it';
  document.addEventListener('ss:lang', function (e) { current = e.detail.lang; });

  function lang() {
    return window.ssLang ? window.ssLang() : current;
  }

  // t('rankDisplay', { n: 5 }) -> "Classifica: Top 5"
  function t(key, params) {
    var entry = STRINGS[key];
    if (!entry) return key;
    var s = entry[lang()] || entry.it;
    if (params) {
      Object.keys(params).forEach(function (k) {
        s = s.split('{' + k + '}').join(params[k]);
      });
    }
    return s;
  }

  function onLang(fn) {
    document.addEventListener('ss:lang', function () { fn(lang()); });
  }

  // Decimal number with the language's separator: 3.2 -> "3,2" in Italian
  function num(value, digits) {
    var s = value.toFixed(digits);
    return lang() === 'it' ? s.replace('.', ',') : s;
  }

  // Clip duration in the list: "3,2 s" / "3.2s"
  function seconds(value) {
    return lang() === 'it' ? num(value, 1) + ' s' : num(value, 1) + 's';
  }

  // Play position: "1ª" (la clip) / "1st"
  function ordinal(n) {
    if (lang() === 'it') return n + 'ª';
    var mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 13) return n + 'th';
    switch (n % 10) {
      case 1: return n + 'st';
      case 2: return n + 'nd';
      case 3: return n + 'rd';
      default: return n + 'th';
    }
  }

  function fileSize(bytes) {
    return bytes > 1048576 ? num(bytes / 1048576, 1) + ' MB' : Math.round(bytes / 1024) + ' KB';
  }

  window.TRV = window.TRV || {};
  window.TRV.t = t;
  window.TRV.lang = lang;
  window.TRV.onLang = onLang;
  window.TRV.num = num;
  window.TRV.seconds = seconds;
  window.TRV.ordinal = ordinal;
  window.TRV.fileSize = fileSize;
  window.TRV.STRINGS = STRINGS;
})();
