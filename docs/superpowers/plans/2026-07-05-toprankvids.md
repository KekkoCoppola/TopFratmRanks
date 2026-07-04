# TopRankVids Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** App statica browser-only per creare video ranking verticali 1080×1920 per TikTok con export MP4 (WebCodecs) e fallback WebM (MediaRecorder).

**Architecture:** Sito statico senza build: HTML + CSS + JS con script tag classici (compatibile `file://`). Un modulo `renderer.js` disegna ogni frame ed è condiviso da preview ed export. Stato centralizzato in `state.js` (oggetto globale `TRV`).

**Tech Stack:** Vanilla JS, Canvas 2D, WebCodecs (VideoEncoder/AudioEncoder), mp4-muxer (vendored), MediaRecorder fallback, Google Fonts.

## Global Constraints

- Zero installazioni: nessun Node/FFmpeg/build; l'app si apre con doppio click su `index.html` (`file://`).
- No moduli ES: solo `<script src>` classici; namespace globale `window.TRV`.
- Browser target: Chrome/Edge recenti su Windows.
- Output primario: MP4 H.264 + AAC, 1080×1920, 30fps. Fallback: WebM via MediaRecorder.
- Verifica: manuale via browser (nessun test runner disponibile senza Node). Ogni task termina con una verifica browser esplicita e un commit.
- Lingua UI: inglese (come scaffold originale). Codice e commenti: inglese.

---

### Task 1: Struttura statica + landing page

**Files:**
- Create: `index.html`, `css/style.css`, `js/app.js`

**Interfaces:**
- Produces: navigazione a `editor.html?rank=N` (N ∈ 1..10).

- [ ] Landing con logo "TopRankVids", griglia bottoni 1–10, bottone "Start Creating" disabilitato finché non si sceglie un numero; click → `location.href = 'editor.html?rank=' + n`.
- [ ] Stile dark (sfondo #0d1117-ish, accenti blu/viola), card centrata.
- [ ] Verifica: aprire `index.html` nel browser, selezionare 5, verificare navigazione a `editor.html?rank=5`.
- [ ] Commit: `feat: landing page with rank selector`

### Task 2: Stato editor + layout editor

**Files:**
- Create: `editor.html`, `js/state.js`, `js/editor.js`
- Modify: `css/style.css`

**Interfaces:**
- Produces: `TRV.state` con forma:

```js
TRV.state = {
  rankCount: 5,                       // da query string, clamp 1..10
  title: { text: '', font: 'Anton', size: 64, bold: true, italic: false,
           stroke: { on: true, width: 8, color: '#000000' },
           wordColors: [] },          // colore per parola, parallelo a text.split(/\s+/)
  bgColor: '#000000',
  rankColorMode: 'auto',              // 'auto' | 'single' | 'custom'
  rankSingleColor: '#FFD700',
  rankCustomColors: [],               // [rankIndex] -> css color
  clips: [],                          // [rankIndex] -> {file, url, name, duration, width, height, video} | null
  playbackOrder: [],                  // array di rankIndex nell'ordine di riproduzione (default N-1..0)
};
TRV.getRankColor(i)                   // colore del numero rank i secondo la modalità
TRV.onStateChange(fn) / TRV.emitChange()  // pub/sub per ridisegnare preview
```

- [ ] `editor.html`: layout 2 colonne (sidebar sinistra scrollabile, preview destra), sezioni collassabili: Video Title, General Settings, Clips, Playback Order; footer sidebar con bottone export + progress.
- [ ] `state.js`: stato + helpers sopra; `rankCount` letto da `?rank=`.
- [ ] `editor.js`: bootstrap, sezioni collassabili, wiring iniziale.
- [ ] Verifica: `editor.html?rank=5` mostra layout senza errori console.
- [ ] Commit: `feat: editor layout and shared state`

### Task 3: Renderer condiviso

**Files:**
- Create: `js/renderer.js`
- Test: verifica visiva via preview (Task 4)

**Interfaces:**
- Produces:

```js
TRV.renderer.W = 1080; TRV.renderer.H = 1920;
// playback = { videoEl|null, revealedSet:Set<rankIndex>, activeRank:number|-1 }
TRV.renderer.drawFrame(ctx, state, playback)
TRV.renderer.layout(state) // -> { titleBottomY, rankSlots: [{x, y, fontSize}] }
```

- [ ] Sfondo pieno `bgColor`; banda superiore nera con titolo multi-linea word-wrapped centrato, parole colorate da `wordColors`, stroke.
- [ ] Zona clip: video disegnato fit-width, centrato verticalmente tra fine titolo e fondo.
- [ ] Colonna numeri: `1.`…`N.` a sinistra (x≈60), equidistanti nella zona clip; numero rivelato → colore `getRankColor(i)` + nome clip accanto; non rivelato → bianco. Stroke nero sempre. Numeri disegnati sopra il video.
- [ ] Commit: `feat: shared frame renderer`

### Task 4: Controlli titolo + preview statica

**Files:**
- Create: `js/preview.js`
- Modify: `js/editor.js`, `editor.html`, `css/style.css`

**Interfaces:**
- Consumes: `TRV.renderer.drawFrame`, `TRV.state`.
- Produces: `TRV.preview.redraw()`, `TRV.preview.play()/pause()/seek(t)`, `TRV.preview.getTimeline()`.

- [ ] Sezione titolo: input testo, select font (Anton, Bangers, Bebas Neue, Luckiest Guy, Oswald, Montserrat, Impact, Arial Black — Google Fonts link nell'HTML), number size, toggle B/I, stroke on/off+width+color.
- [ ] Chip per parola: container che mostra ogni parola col suo colore, click apre `<input type=color>` nascosto.
- [ ] General settings: bg color, rank color mode + input relativi.
- [ ] Ogni change → `TRV.emitChange()` → `preview.redraw()` (canvas statico: frame a t=0 con tutti i rank non rivelati... mostrare invece TUTTI i nomi rivelati in modalità "idle" per dare anteprima completa).
- [ ] Verifica browser: cambiare titolo/colori/font si riflette subito nel canvas.
- [ ] Commit: `feat: title and settings controls with live static preview`

### Task 5: Slot clip con drag&drop

**Files:**
- Modify: `js/editor.js`, `css/style.css`, `js/state.js`

**Interfaces:**
- Produces: `TRV.loadClip(rankIndex, file)` async → popola `state.clips[i]` con `{file, url: URL.createObjectURL, name:'', duration, width, height, video: HTMLVideoElement precaricato}`; errori → `state.clips[i]=null` + messaggio slot.

- [ ] Un card per rank: header "Rank #i", drop-zone (dragover/drop + input file), input nome, dopo il load: thumbnail (frame a 0.1s su mini-canvas), durata, bottone ✕ rimuovi.
- [ ] `playbackOrder` aggiornato automaticamente: contiene solo rank con clip, default ordine countdown (rank più alto prima).
- [ ] Verifica browser: drop di un MP4 → thumbnail e durata; file non video → messaggio errore.
- [ ] Commit: `feat: clip slots with drag and drop`

### Task 6: Playback order + preview animata

**Files:**
- Modify: `js/editor.js`, `js/preview.js`, `css/style.css`

**Interfaces:**
- Consumes: `state.playbackOrder`, `state.clips`.
- Produces: `TRV.preview.getTimeline()` → `[{rankIndex, start, end}]` cumulativo secondo playbackOrder.

- [ ] Lista Playback Order: un item per clip caricata ("pos) #rank — nome"), drag per riordinare (HTML5 DnD), aggiorna `state.playbackOrder`.
- [ ] Preview play: riproduce le clip in sequenza (un `<video>` per clip, play + audio), rAF che chiama `drawFrame` con `revealedSet` = rank delle clip già iniziate; barra progresso e time display; pause/seek.
- [ ] Verifica browser: 3 clip, play → clip in sequenza, nomi appaiono al momento giusto, audio udibile.
- [ ] Commit: `feat: playback order and animated preview`

### Task 7: Export MP4 (WebCodecs) + fallback WebM

**Files:**
- Create: `js/exporter.js`, `js/vendor/mp4-muxer.js` (vendored, UMD/IIFE build)
- Modify: `js/editor.js`, `editor.html`

**Interfaces:**
- Consumes: `TRV.renderer.drawFrame`, `TRV.preview.getTimeline()`.
- Produces: `TRV.exportVideo(onProgress)` → scarica file; abilitazione bottone quando tutte le clip presenti.

- [ ] Vendor mp4-muxer: scaricare build IIFE da CDN (jsdelivr) e salvarla in `js/vendor/mp4-muxer.js` (esporta global `Mp4Muxer`).
- [ ] Percorso WebCodecs: per ogni clip in ordine: seek video element a step 1/30s, `drawFrame` su canvas offscreen 1080×1920, `new VideoFrame(canvas)` → `VideoEncoder` (avc1.640033, bitrate ~8Mbps). Audio: `fetch(url) → arrayBuffer → OfflineAudioContext.decodeAudioData`, resample/concat a 44100Hz stereo, chunk in `AudioData` → `AudioEncoder` (mp4a.40.2, 128kbps). Mux con mp4-muxer → Blob → download `<slug(title)>.mp4`.
- [ ] Check supporto: `VideoEncoder.isConfigSupported` + `AudioEncoder.isConfigSupported`; se KO → fallback: riproduzione realtime silente su canvas + `canvas.captureStream(30)` + audio via `MediaElementSource`→`MediaStreamDestination`, `MediaRecorder` webm → download `.webm`.
- [ ] Progress bar + stato ("Rendering clip 2/5…", "Encoding audio…", "Done!").
- [ ] Verifica browser: export con 2-3 clip corte → file scaricato, riproducibile, audio ok, overlay corretti.
- [ ] Commit: `feat: MP4 export via WebCodecs with WebM fallback`

### Task 8: Rifiniture + verifica end-to-end

**Files:**
- Modify: tutti secondo necessità

- [ ] Edge case: 1 rank, 10 rank (font numeri ridotto), titolo lunghissimo (wrap 3+ righe), clip verticali e orizzontali.
- [ ] Messaggi errore export; disabilitazioni bottoni coerenti.
- [ ] Verifica end-to-end completa con clip di test generate ad hoc.
- [ ] Commit: `polish: edge cases and final QA`
