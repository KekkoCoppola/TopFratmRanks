# TopRankVids — TikTok Ranking Video Creator (Design Spec)

Data: 2026-07-05 · Stato: approvato dall'utente

## Obiettivo

App 100% browser (Chrome/Edge, Windows) per creare video "ranking" verticali 9:16 per TikTok:
l'utente sceglie quanti rank (1–10), carica una clip per ogni rank con un nome, personalizza il
titolo, e l'app genera un MP4 1080×1920 dove i nomi dei rank appaiono progressivamente man mano
che le clip vengono riprodotte.

## Vincoli

- Zero installazioni: niente Node, niente FFmpeg, niente build step. Si apre con doppio click su `index.html` (protocollo `file://`).
- Browser target: Chrome/Edge recenti su Windows.
- Nessuna dipendenza di rete obbligatoria a runtime, eccetto Google Fonts (con fallback a font di sistema).
- La libreria `mp4-muxer` è vendored localmente in `js/vendor/`.

## Architettura

Sito statico, JS puro (no framework, no moduli ES — script tag classici per compatibilità `file://`).

```
index.html          Landing: scelta numero rank (1–10) → editor.html?rank=N
editor.html         Editor: sidebar tool (sx) + preview canvas 9:16 (dx)
css/style.css       Stile dark, layout due colonne
js/app.js           Logica landing
js/state.js         Stato condiviso dell'editor (titolo, stile, clip, ordine)
js/renderer.js      Disegno di un frame sul canvas (usato SIA da preview SIA da export)
js/preview.js       Playback preview in tempo reale (video element + rAF)
js/exporter.js      Export WebCodecs→MP4 con fallback MediaRecorder→WebM
js/editor.js        Bootstrap editor, UI slot clip, playback order, wiring controlli
js/vendor/mp4-muxer.js   Libreria muxing MP4 (vendored)
```

Principio chiave: **preview ed export condividono `renderer.js`** — un'unica funzione
`drawFrame(ctx, state, playback)` che disegna sfondo, titolo, numeri rank, label rivelate e il
frame video corrente. Ciò garantisce che la preview sia identica al file esportato.

## Funzionalità

### Landing
- Griglia bottoni 1–10; "Start Creating" abilitato dopo la selezione; naviga a `editor.html?rank=N`.

### Editor — sidebar sinistra
1. **Titolo**: textbox; font (Anton, Bangers, Bebas Neue, Luckiest Guy, Oswald, Montserrat, Impact,
   Arial Black); dimensione (20–120px); bold/italic; stroke on/off + spessore + colore;
   **colore per parola**: le parole del titolo appaiono come chip cliccabili, click → color picker.
2. **Impostazioni generali**: colore sfondo; modalità colore numeri rank
   (auto-gradiente giallo→rosso / colore unico / personalizzato per rank).
3. **Slot clip** (N slot, uno per rank): drop-zone drag&drop + "Browse" (video/mp4, webm, mov);
   textbox nome (label che apparirà accanto al numero); thumbnail + durata dopo il caricamento;
   bottone rimuovi. Formato non decodificabile → errore mostrato sullo slot.
4. **Playback Order**: lista trascinabile delle clip caricate; default countdown #N → #1;
   l'ordine determina la sequenza di riproduzione. Quando parte la clip del rank #k, lo slot #k
   si riempie con il suo nome e resta visibile fino alla fine del video.

### Editor — preview destra
- Canvas 1080×1920 scalato a schermo; play/pausa; barra progresso cliccabile; tempo corrente/totale.
- Audio delle clip udibile in preview.

### Layout del frame video (come reference screenshot)
- Banda superiore: titolo centrato, auto-wrap su più righe, parole colorate singolarmente, stroke.
- Colonna sinistra: numeri `1.` … `N.` sempre visibili, in posizioni verticali fisse equidistanti
  nella zona sotto il titolo; numero già "rivelato" → colorato (secondo modalità scelta) con il
  nome accanto; non rivelato → bianco, senza nome.
- Clip corrente: disegnata a piena larghezza (fit width, centrata verticalmente nella zona clip),
  sopra lo sfondo, sotto il titolo. I numeri rank sono disegnati SOPRA la clip.

### Export
- Percorso primario: WebCodecs — `VideoEncoder` H.264 (avc1) 1080×1920 @30fps; audio: decodifica
  di tutte le tracce clip via `AudioContext.decodeOfflineAudioData`, concatenazione, `AudioEncoder`
  AAC; muxing con mp4-muxer → download `titolo.mp4`.
- Fallback automatico (se H.264/AAC non disponibili): `canvas.captureStream()` +
  `AudioContext` destination + `MediaRecorder` in tempo reale → download `.webm`.
- Barra di progresso e stato durante l'export; bottone disabilitato finché ogni slot non ha
  clip + l'export non richiede nome (nome vuoto = solo numero evidenziato).

## Gestione errori
- Clip non decodificabile → messaggio sullo slot, slot resta vuoto.
- Export fallito a metà → messaggio con motivo + suggerimento fallback.
- `file://` senza localStorage/sessionStorage → il rank passa via query string (nessuna dipendenza da storage).

## Test
- Verifica manuale end-to-end con browser (preview e export) su clip MP4 reali generate ad hoc.
- Casi: 1 rank, 3 rank, 10 rank; clip con risoluzioni/aspect diversi; titolo lungo multi-riga;
  riordino playback; rimozione e sostituzione clip.

## Fuori scope (YAGNI)
- Trim delle clip, volume per clip, caption/sottotitoli, link TikTok/YouTube/Instagram,
  salvataggio progetti, drag del titolo, emoji picker (le emoji si incollano nella textbox).
