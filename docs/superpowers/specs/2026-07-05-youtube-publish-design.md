# TopRankVids — Publish su YouTube Shorts (Design Spec)

Data: 2026-07-05 · Stato: approvato dall'utente

## Obiettivo

Tasto **Publish** accanto a *Generate*: carica l'ultimo video generato direttamente sul canale
YouTube dell'utente loggato, come Short (i video sono 1080×1920, quindi la classificazione è
automatica). TikTok e Instagram restano feature future (richiedono backend + review delle
rispettive piattaforme) e appaiono come "Coming soon".

## Vincoli

- L'app resta statica su GitHub Pages: nessun backend. OAuth e upload avvengono interamente
  nel browser (Google Identity Services + YouTube Data API v3, entrambi CORS-enabled).
- Multi-utente by design: chi apre l'app fa login col **proprio** account Google e pubblica sul
  **proprio** canale. La disponibilità effettiva dipende dallo stato del progetto Google del
  proprietario: in *testing mode* solo i test user registrati (max 100); per il pubblico serve la
  verifica Google (processo amministrativo, zero cambi al codice).
- Quota YouTube: `videos.insert` costa 1600 unità su 10.000/giorno **per progetto** → ~6 upload
  al giorno totali fra tutti gli utenti dello stesso Client ID.
- Il Client ID non è un segreto: sta in `js/config.js`. Finché è vuoto, la feature si presenta
  come "non configurata" e rimanda alla guida di setup.

## Architettura

```
js/config.js       TRV_CONFIG = { googleClientId: '' }  (compilato dal proprietario)
js/youtube.js      Lato Google isolato: login GIS, info canale, upload resumable con progress,
                   refresh token scaduto. API: TRV.youtube.{isConfigured,connect,disconnect,
                   getChannel,upload(blob, meta, onProgress)}
js/publish-ui.js   Sezione settings "Publishing", bottone Publish, modale a 2 step, progress,
                   risultato/errori. Legge TRV.lastExport.
js/exporter.js     (ritocco) al termine di un export riuscito salva
                   TRV.lastExport = { blob, filename } ed emette change.
editor.html        Script GIS (https://accounts.google.com/gsi/client), sezione Publishing,
                   bottone Publish accanto a Generate, markup del modale.
```

## Funzionalità

### Sezione settings "📤 Publishing"
- **Account**: "Connect YouTube" → popup Google (scope `youtube.upload` + `youtube.readonly`)
  → "Connected: <nome canale>" + Disconnect. Il token vive in memoria (~1h); se scade, il
  publish lo rinnova in automatico (prompt silenzioso).
- **YouTube Title**: testo; vuoto ⇒ usa il titolo del ranking + `#Shorts` (max 100 char,
  sanitizzato).
- **Description**: textarea; default `#Shorts`.
- **Privacy**: select Public (default) / Unlisted / Private.
- Titolo/descrizione/privacy persistiti in localStorage.
- TikTok e Instagram: righe disabilitate con badge "Coming soon".
- Se `googleClientId` è vuoto: la sezione mostra "Publishing not configured" con rimando a
  `docs/YOUTUBE_SETUP.md`.

### Bottone Publish
- Accanto a Generate; abilitato solo se esiste `TRV.lastExport` (un video generato in questa
  sessione) e il Client ID è configurato. Tooltip esplicativo quando disabilitato.

### Flusso di pubblicazione (doppia conferma)
1. **Step 1 — riepilogo**: titolo effettivo, privacy, dimensione file, account di destinazione
   (con bottone di login inline se non connesso). → Continue
2. **Step 2 — conferma finale**: avviso "sarà PUBBLICO immediatamente sul canale <X>"
   (testo adattato per Unlisted/Private) → bottone rosso "Publish now".
3. **Upload**: resumable (POST metadata → PUT blob via XHR con onprogress); barra + percentuale.
   Fallback automatico a upload multipart singolo se l'header `Location` non è leggibile.
4. **Esito**: successo → link diretto al video; errore → messaggio chiaro (quota esaurita,
   login negato/scaduto, upload fallito) con bottone "Retry" che riusa lo stesso blob.

## Gestione errori
- Client ID vuoto → feature visibile ma disabilitata con guida.
- GIS non caricato (offline/adblock) → errore nel modale.
- `403 quotaExceeded` → "Limite giornaliero di upload raggiunto, riprova domani."
- `401` → re-login silenzioso automatico, poi retry; se fallisce, chiedi login.
- Upload interrotto → Retry senza rigenerare il video.

## Test
- Senza Client ID reale: stato non configurato; con Client ID fittizio: UI completa, modale,
  validazioni, upload simulato mockando `TRV.youtube`.
- Test end-to-end reale (login + upload): richiede il Client ID del proprietario → guida
  `docs/YOUTUBE_SETUP.md` (creazione progetto, API, consent screen, test user, origins
  `https://<utente>.github.io` + `http://localhost:8123`).

## Fuori scope (YAGNI)
- TikTok/Instagram publishing; scheduling; thumbnail custom; playlist; gestione multi-canale;
  persistenza del token oltre la sessione; verifica Google (amministrativa, non tecnica).
