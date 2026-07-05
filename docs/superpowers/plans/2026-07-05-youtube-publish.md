# YouTube Shorts Publish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tasto Publish che carica l'ultimo MP4 generato sul canale YouTube dell'utente loggato (Short automatico), interamente browser-side, con doppia conferma e progress.

**Architecture:** Moduli isolati: `config.js` (Client ID), `youtube.js` (OAuth GIS + upload resumable), `publish-ui.js` (settings, bottone, modale 2 step). `exporter.js` conserva l'ultimo blob. Nessun backend.

**Tech Stack:** Google Identity Services (token model), YouTube Data API v3 (`videos.insert` resumable, `channels.list`), XHR per upload progress, localStorage per i metadati.

## Global Constraints

- App statica GitHub Pages: script tag classici, namespace `TRV`, no moduli ES, no backend.
- Client ID pubblico in `js/config.js`; feature degradata con guida se vuoto.
- Scope OAuth: `https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly`.
- Verifica browser manuale (nessun test runner). Commit a fine task.

---

### Task 1: Conservare l'ultimo export + config

**Files:**
- Create: `js/config.js`
- Modify: `js/exporter.js`, `editor.html`

**Interfaces:**
- Produces: `window.TRV_CONFIG = { googleClientId: '' }`; `TRV.lastExport = { blob, filename } | null`, aggiornato a ogni export riuscito (entrambi i percorsi MP4 e WebM), seguito da `TRV.emitChange()`.

- [ ] `js/config.js` con `TRV_CONFIG` commentato (dove trovare il Client ID).
- [ ] In `exporter.js`: in `exportMp4` e `exportRealtime`, prima del `download(...)`, settare `TRV.lastExport = { blob: blob, filename: filename }`; dopo il download `TRV.emitChange()`.
- [ ] `editor.html`: `<script src="js/config.js">` prima di state.js; `<script src="https://accounts.google.com/gsi/client" async defer>` nell'head.
- [ ] Verifica: export di prova → `TRV.lastExport.blob.size > 0`.
- [ ] Commit: `feat: config module and last-export retention`

### Task 2: Modulo youtube.js (OAuth + upload)

**Files:**
- Create: `js/youtube.js`
- Modify: `editor.html` (script tag prima di publish-ui)

**Interfaces:**
- Produces `TRV.youtube`:

```js
TRV.youtube.isConfigured()            // -> bool (Client ID presente)
TRV.youtube.isConnected()             // -> bool (token valido in memoria)
TRV.youtube.getChannel()              // -> {title, thumb} | null (cache post-login)
TRV.youtube.connect(interactive)      // -> Promise<channel>  (GIS token + channels.list)
TRV.youtube.disconnect()              // revoca token, pulisce stato
TRV.youtube.upload(blob, meta, onProgress) // -> Promise<{videoId, url}>
// meta = { title, description, privacyStatus }
// onProgress({stage, pct})
```

- [ ] Attesa caricamento GIS (`window.google` polling con timeout 10s → errore chiaro).
- [ ] `connect`: `initTokenClient` + `requestAccessToken({prompt: interactive ? 'consent' : ''})`; al token, GET `youtube/v3/channels?part=snippet&mine=true` → nome canale.
- [ ] `ensureToken()`: se scaduto (`expiresAt - 60s`), tenta refresh silenzioso prima dell'upload.
- [ ] `upload`: POST resumable (`uploadType=resumable&part=snippet,status`, body snippet/status, `categoryId:'24'`, `selfDeclaredMadeForKids:false`) → leggi header `Location`; PUT del blob via XHR con `upload.onprogress`. Se `Location` illeggibile (CORS) → fallback `uploadType=multipart` in un solo XHR.
- [ ] Mappatura errori: 401 → re-login silenzioso e un retry; 403 `quotaExceeded` → messaggio quota; altri → messaggio con status.
- [ ] Commit: `feat: youtube oauth and resumable upload module`

### Task 3: UI — sezione Publishing + bottone + modale

**Files:**
- Create: `js/publish-ui.js`
- Modify: `editor.html`, `css/style.css`

**Interfaces:**
- Consumes: `TRV.youtube`, `TRV.lastExport`, `TRV.state.title.text`, `TRV.onChange`.
- Produces: sezione `#section-publish`, bottone `#btn-publish`, modale `#publish-modal`.

- [ ] `editor.html`: sezione collassabile "📤 Publishing" dopo General Settings (stato account, YouTube Title, Description, Privacy select, righe TikTok/Instagram "Coming soon"); bottone `#btn-publish` accanto a `#btn-export` (riga flex); markup modale overlay con step summary / confirm / progress / result.
- [ ] Se `!TRV.youtube.isConfigured()`: nella sezione un avviso "Publishing not configured — see docs/YOUTUBE_SETUP.md"; bottone Publish sempre disabilitato.
- [ ] Metadati: input con persistenza localStorage (`trv_yt_title`, `trv_yt_desc`, `trv_yt_privacy`); titolo effettivo = campo ‖ `<titolo ranking> #Shorts`, troncato a 100 char.
- [ ] Bottone Publish: abilitato solo con `TRV.lastExport` presente e config ok (aggiornato in `TRV.onChange`); tooltip quando disabilitato.
- [ ] Modale step 1 (riepilogo + login inline se serve) → step 2 (conferma "PUBBLICO immediatamente…" adattata alla privacy, bottone rosso) → progress (barra %) → risultato (link video) o errore (+ Retry).
- [ ] CSS: `.modal-overlay`, `.modal-card`, step, bottoni, badge "Coming soon", riga doppio bottone export/publish.
- [ ] Commit: `feat: publishing settings section, publish button and 2-step modal`

### Task 4: Verifica browser + guida setup

**Files:**
- Create: `docs/YOUTUBE_SETUP.md`
- Modify: `README.md` (paragrafo Publish)

- [ ] Con Client ID vuoto: sezione mostra avviso, Publish disabilitato.
- [ ] Con Client ID fittizio in config: sezione attiva; genera video di test → Publish si abilita; modale step 1→2; mock `TRV.youtube.upload` → progress → risultato con link; mock errore quota → messaggio + Retry.
- [ ] `docs/YOUTUBE_SETUP.md`: passi Google Cloud Console (progetto, YouTube Data API v3, consent screen external+testing, test user, Client ID web con origins GitHub Pages e `http://localhost:8123`), dove incollare il Client ID, limiti quota, percorso verifica Google per uso pubblico.
- [ ] Commit: `docs: YouTube publishing setup guide + QA`
