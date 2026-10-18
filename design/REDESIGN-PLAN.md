# TopFratmRanks → famiglia ScrollStudio: piano di redesign

Fase 1 (analisi). Nessun file dell'app è stato modificato. Branch `redesign/scrollstudio`, unico commit `473e42e` (kit in `designScroll/`).

## 0. Cosa ho letto e guardato

- **Kit** (`designScroll/design-kit/`): `FAMILY-DESIGN.md`, `README.md`, `PROMPT.md`, `tokens.css`, `family.css`, `i18n.js`, `specimen.html`, `assets/`. Il kit è identico a quello dell'hub (`diff -r` con `D:/PROGETTI/ScrollStudio/ScrollStudio/design-kit` vuoto).
- **`HUB-DESIGN.md` non c'è nel kit.** Ho letto l'originale, `D:/PROGETTI/ScrollStudio/ScrollStudio/DESIGN.md` (vedi domanda D11).
- **Riferimenti**: tutti e 7 i `reference/*.jpg` (hub desktop, hub con storia aperta, hub telefono, specimen desktop, specimen scrollato, specimen telefono, primitivi).
- **Card dell'hub per questo prodotto** (`ScrollStudio/index.html:80-98`): titolo "TopFratmRanks", sottotitolo "Crea video classifica" / "Ranking video maker", link `https://kekkocoppola.github.io/TopFratmRanks/`.
- **App**: `index.html`, `editor.html`, `css/style.css`, tutti i `js/*.js` (tranne `vendor/mp4-muxer.js`).

## 1. Screenshot "prima"

In `design/before/` ci sono 66 JPG: 33 scenari × 2 misure.

- Nome: `NN-scenario_1366x768.jpg` (DPR 1) e `NN-scenario_375x667.jpg` (DPR 2, emulazione telefono). I "dopo" useranno gli stessi nomi.
- Generati con Edge headless pilotato via DevTools Protocol (script nello scratchpad della sessione, vedi D12). Per avere stati realistici, le clip di prova sono MP4 generati nel browser con WebCodecs e con l'`mp4-muxer` dell'app.
- Scenari 05 e 14 a 375: pagina intera. Gli altri: viewport, scorsa fino alla parte interessata.
- **Console**: nessun errore dell'app. L'unico errore è quello provocato apposta nello scenario 23.
- **Stati simulati** (suffisso `-sim`): il testo o la classe è impostato da script perché il percorso reale richiede OAuth Google o un trascinamento vero. Sono 16 (trascinamento), 28–31 (passi della modale Pubblica) e 33 (account collegato).
- **Non catturati**: `window.confirm` e `alert` nativi (N1, N2), selettore file e selettore colore nativi, hover e focus. Hover e focus li documento nei "dopo", gruppo per gruppo.

| Scenario | Cosa mostra | Come |
|---|---|---|
| 01-landing-terms | prima visita: modale termini sulla landing | reale |
| 02-landing | landing, nessun numero scelto, "Start" disattivo | reale |
| 03-landing-selected | 5 scelto, "Start" attivo | reale |
| 04-editor-terms | modale termini sull'editor | reale |
| 05-editor-empty | editor vuoto (5 posizioni), sezioni aperte | reale |
| 06-editor-empty-clips | sezione Clips con posizioni vuote | reale |
| 07-editor-title-filled | titolo scritto, parole colorate, B attivo, contorno spento | reale |
| 08-editor-rank-color-single | colori numeri = unico | reale |
| 09-editor-rank-color-custom | colori numeri = per posizione | reale |
| 10-editor-collapsed | tutte le sezioni chiuse | reale |
| 11-editor-publish-setup | Publishing non configurato | reale |
| 12-editor-publish-configured | Publishing configurato, non collegato | reale |
| 13-editor-clips-partial | 2 clip su 5, badge ordine, "Generate (2/5…)" | reale |
| 14-editor-clips-full | 5 clip su 5, anteprima completa | reale |
| 15-editor-clip-active | clip selezionata (click) | reale |
| 16-editor-clip-dragging-sim | trascinamento + bersaglio | sim |
| 17-editor-slot-error | file non video → errore | reale |
| 18-editor-link-loading | import da link in corso | reale (rete bloccata) |
| 19-editor-link-error | link non TikTok → errore | reale |
| 20-editor-playing | anteprima in riproduzione | reale |
| 21-editor-export-progress | export in corso | reale |
| 22-editor-export-done | export finito | reale |
| 23-editor-export-error | export fallito | reale (WebCodecs e MediaRecorder tolti) |
| 24-editor-max-ranks | 10 posizioni, "Add Rank" disattivo | reale |
| 25-modal-setup | wizard setup YouTube | reale |
| 26-modal-setup-error | Client ID non valido | reale |
| 27-modal-publish-summary | riepilogo pubblicazione, non collegato | reale |
| 28-modal-publish-confirm-sim | conferma finale | sim |
| 29-modal-publish-progress-sim | caricamento al 40% | sim |
| 30-modal-publish-success-sim | pubblicato | sim |
| 31-modal-publish-error-sim | caricamento fallito | sim |
| 32-editor-generating-for-publish | "Publish" che genera prima | reale |
| 33-editor-yt-connected-sim | account YouTube collegato | sim |

## 2. Struttura dopo il redesign

```
index.html / editor.html
  header.ss-topbar      wordmark ScrollStudio → hub · / · avatar + TopFratmRanks → index.html · switch lingua
  div.ss-head           titolo pagina (+ descrizione)
  main                  landing: ss-panel centrato · editor: .ss-editor = .ss-panel + .ss-stage
  footer.ss-footer      wordmark + © 2026
  modali                .ss-overlay > .ss-modal
```

| File | Azione |
|---|---|
| `css/tokens.css`, `css/family.css`, `js/i18n.js` | copiati dal kit **senza modifiche**. Le aggiunte (componenti NUOVO) vanno in coda a `family.css`, sotto un commento |
| `css/style.css` | riscritto: solo la colla di pagina (colonna della landing, ecc.), con soli token |
| `js/strings.js` (nuovo) | dizionario `{ it, en }` per i testi creati dal JS, `TRV.t(chiave, parametri)`, lingua da `window.ssLang()` |
| `assets/scrollstudio-wordmark.svg`, `assets/topfratmranks-logo.svg` | copiati dal kit (topbar, footer, favicon) |
| `index.html`, `editor.html`, `js/app.js`, `editor.js`, `preview.js`, `publish-ui.js`, `terms.js` | markup e classi; il JS cambia solo dove legge o scrive classi, testi e icone (vedi §5) |
| `js/state.js`, `link-import.js`, `exporter.js`, `youtube.js` | solo i messaggi (§6), passano dal dizionario |
| `js/renderer.js`, `js/config.js`, `js/vendor/*`, `serve.ps1` | **non toccati**: `renderer.js` è il contenuto (canvas e video esportato) |

## 3. Inventario e mappa

Ricette del kit con il loro nome di classe. `NUOVO-Nx` rimanda alla derivazione in §4.

### 3.1 Schermate e overlay

| ID | Cosa | Dove | Screenshot |
|---|---|---|---|
| S1 | Landing: scelta posizioni 1–10 | `index.html:15-27`, `js/app.js:9-28` | 01–03 |
| S2 | Editor: pannello + anteprima | `editor.html:16-222` | 05–24, 32–33 |
| O1 | Modale Termini (entrambe le pagine, prima visita) | `js/terms.js:9-54` | 01, 04 |
| O2 | Modale Pubblica su YouTube, 4 passi | `editor.html:225-273`, `js/publish-ui.js:183-301` | 27–31 |
| O3 | Wizard setup YouTube | `editor.html:276-322`, `js/publish-ui.js:105-162` | 25–26 |
| N1 | `window.confirm` "Remove rank #N…" | `js/editor.js:537` | non catturabile |
| N2 | `alert` "YouTube sign-in failed" | `js/publish-ui.js:93` | non catturabile |

### 3.2 Globali e cornice

| # | Componente | Dove | Ricetta |
|---|---|---|---|
| G1 | `<html lang="en">` | `index.html:2`, `editor.html:2` | `lang="it"`, poi `i18n.js` |
| G2 | Font UI Montserrat | `index.html:10`, `editor.html:10`, `style.css:23` | Urbanist 300/400 (Google Fonts). **I font del contenuto restano** (`editor.html:10`: Anton, Bangers, Bebas Neue, Luckiest Guy, Oswald, Montserrat): li usa il canvas |
| G3 | Favicon emoji 🎬 | `index.html:12`, `editor.html:12` | `assets/topfratmranks-logo.svg` (kit: avatar = favicon) |
| G4 | Colori e sfondo globali scuri | `style.css:2-27` | `tokens.css` + `body` di `family.css` (parete) |
| G5 | Topbar (oggi assente; nell'editor c'è il logo che porta a `index.html`) | `editor.html:21-24` | `.ss-topbar`: `.ss-topbar__home` (wordmark → hub), `__sep`, `__product` (avatar + nome → `index.html`), `.ss-lang`. Senza nav: NUOVO-N15 |
| G6 | Titolo della pagina | landing `index.html:17-18`, editor assente | `.ss-head` (`__title`, `__lede`), vedi D3 |
| G7 | Footer (assente) | — | `.ss-footer` |
| G8 | "Ranking: Top 5" | `editor.html:23`, `editor.js:9` | `.ss-section__count` nel summary "Clip" (D3) |

### 3.3 Landing

| # | Componente | Dove | Ricetta |
|---|---|---|---|
| L1 | Card centrale | `index.html:16`, `style.css:41-50` | `.ss-panel` in colonna centrata larga quanto il pannello editor (340px, dal kit `.ss-editor`) |
| L2 | "How many items…" | `index.html:20` | titolo sezione: `--fs-md` 300 `--ink-900` |
| L3 | Griglia 1–10 | `app.js:11-21`, `style.css:66-88` | NUOVO-N1 `.ss-segmented--grid` |
| L4 | "Start Creating" | `index.html:23-25` | `.ss-btn.ss-btn--primary.ss-btn--block` (unica azione corallo) |

### 3.4 Editor: pannello

| # | Componente | Dove | Ricetta |
|---|---|---|---|
| E1 | Sidebar | `editor.html:19,26`, `style.css:118-149` | `.ss-panel` dentro `.ss-editor` |
| E2 | Sezioni richiudibili + chevron | `editor.html:29-33,80-84,125-129,168-176`, `editor.js:15-19`, `style.css:152-176` | `details.ss-section[open]` > `summary` (+ `.ss-section__chev` SVG) + `.ss-section__body` |
| **Titolo** | | | |
| E3 | Testo del titolo | `editor.html:35-40` | `.ss-field` > `.ss-label` + `.ss-input` |
| E4 | Colori delle parole + suggerimento | `editor.html:42-47`, `editor.js:38-62` | `.ss-field` > `.ss-label` + NUOVO-N3 `.ss-word` (×N) / `.ss-hint` |
| E5 | Font | `editor.html:52-61` | `.ss-select` |
| E6 | Dimensione font | `editor.html:62` | `.ss-input.ss-input--num` |
| E7 | B / I | `editor.html:63-64`, `editor.js:109-120`, `style.css:210-220` | `.ss-segmented` con 2 opzioni a icona SVG, `aria-pressed` indipendenti (R9) |
| E8 | Interruttore contorno | `editor.html:71`, `editor.js:122-129`, `style.css:253-272` | `.ss-switch` (`input type=checkbox`) |
| E9 | Spessore contorno | `editor.html:72` | `.ss-input--num` |
| E10 | Colore contorno | `editor.html:73` | `.ss-swatch` |
| **Impostazioni** | | | |
| E11 | Colore sfondo | `editor.html:86-89` | `.ss-row` > `.ss-row__label` + `.ss-swatch` |
| E12 | Dimensione clip | `editor.html:90-96` | `.ss-field` + `.ss-select` (opzioni lunghe) |
| E13 | Dimensione e spaziatura numeri | `editor.html:97-104` | `.ss-row` + `.ss-input--num` |
| E14 | Modalità colori numeri | `editor.html:105-112` | `.ss-field` + `.ss-select` |
| E15 | Colore unico | `editor.html:113-116` | `.ss-row` + `.ss-swatch` |
| E16 | Colore per posizione | `editor.html:117-120`, `editor.js:183-203` | NUOVO-N4 `.ss-swatch-list` |
| **Pubblicazione** | | | |
| E17 | Avviso "needs a one-time setup" | `editor.html:132-134` | `.ss-note` |
| E18 | "Set up YouTube publishing" | `editor.html:135` | `.ss-btn.ss-btn--block` (secondario) |
| E19 | Account YouTube: "Connect" / collegato | `editor.html:138-143`, `publish-ui.js:56-83` | `.ss-row` + `.ss-btn--sm`; collegato: NUOVO-N13 `.ss-account` |
| E20 | Titolo YouTube + nota "(empty = …)" | `editor.html:144-147` | `.ss-field` > `.ss-label` + `.ss-input` + `.ss-hint` |
| E21 | Descrizione | `editor.html:148-151` | `.ss-field` + `.ss-textarea` |
| E22 | Privacy | `editor.html:152-159` | `.ss-field` + `.ss-select` |
| E23 | "Change Google Client ID" | `editor.html:160` | `.ss-link` |
| E24 | TikTok / Instagram "Coming soon" | `editor.html:162-163` | `.ss-row` + `.ss-badge` |
| **Clip** | | | |
| E25 | Shuffle / Reset (oggi dentro l'intestazione) | `editor.html:172-173`, `editor.js:557-572` | `.ss-btn.ss-btn--sm` con icona, in una riga in cima al corpo della sezione (R5) |
| E26 | Suggerimento ordine di riproduzione | `editor.html:178` | `.ss-hint`; parole evidenziate in `--ink-900`, non in grassetto |
| E27 | Lista posizioni `#clip-slots` | `editor.html:179` | `ol.ss-list` |
| E28 | Scheda con clip: select "Rank #", badge "▶ 1st", 🗑, ✕, miniatura, nome file, durata, etichetta, trascinamento, attiva | `editor.js:225-334,394-439` | `.ss-clip` + NUOVO-N2 |
| E29 | Scheda vuota: "Rank #N", riga link + Import, "or", drop zone, errore | `editor.js:293-298,336-393` | NUOVO-N2 `.ss-clip--empty`: `.ss-input` + `.ss-btn--sm`, NUOVO-N5 `.ss-or`, `.ss-drop` (diventa `button`), `.ss-note--error` |
| E30 | Import da link in corso (spinner) | `editor.js:337-347`, `style.css:405-414` | `.ss-drop` + NUOVO-N6 `.ss-progress--indeterminate` |
| E31 | "+ Add Rank" (attivo/disattivo) | `editor.html:180`, `editor.js:512-517` | `.ss-btn.ss-btn--sm` + icona "+" |
| **Esporta** | | | |
| E32 | Blocco export fisso in fondo alla sidebar | `editor.html:189-200`, `style.css:665-717` | ultima `details.ss-section` "Esporta" (D5) |
| E33 | Generate (testo che cambia) | `editor.html:191`, `editor.js:581-589` | `.ss-btn.ss-btn--primary.ss-btn--block` + icona download (corallo dell'editor) |
| E34 | Publish | `editor.html:192`, `publish-ui.js:167-178` | `.ss-btn` secondario |
| E35 | Avanzamento + stato / errore | `editor.html:194-199`, `editor.js:593-618` | `.ss-progress` (D6) + `.ss-note` / `.ss-note--error` |

### 3.5 Editor: anteprima

| # | Componente | Dove | Ricetta |
|---|---|---|---|
| P1 | Pannello e canvas 1080×1920 | `editor.html:204-208`, `style.css:720-755` | `.ss-stage` > `.ss-frame` > `canvas` (R4) |
| P2 | Play / pausa (▶/⏸ come testo) | `editor.html:210`, `preview.js:94,127,134,143,235` | `.ss-icon-btn` con SVG play/pausa + `aria-label`; disattivo: NUOVO-N15 |
| P3 | Barra di avanzamento + manopola | `editor.html:211-216`, `preview.js:50-55,192-231` | `.ss-timeline__lanes` (`#progress-bar`) > `.ss-scrub` (`role=slider`) + `.ss-scrub__fill` + `.ss-playhead`. Senza segmenti né velocità: nell'app non ci sono |
| P4 | Tempo "0:00 / 0:00" | `editor.html:217`, `preview.js:54` | `.ss-time` (tempo corrente in `<b>` `--ink-900`) dentro `.ss-timeline__bar` |
| P5 | Helper nascosti (colore, file) | `editor.html:325-326` | invariati |

### 3.6 Modali

| # | Componente | Dove | Ricetta |
|---|---|---|---|
| M1 | Overlay + card | `editor.html:225-226,276-277`, `style.css:584-605` | `.ss-overlay` > `.ss-modal` |
| M2 | Chiudi ✕ | `editor.html:227,278` | `.ss-icon-btn.ss-icon-btn--bare.ss-modal__close` + SVG |
| M3 | Titoli dei passi | `editor.html:231,247,257,264,279` | `.ss-modal__title` |
| M4 | Riepilogo `dl` | `editor.html:232-237` | NUOVO-N7 `.ss-summary` |
| M5 | Azioni (Cancel, Sign in, Continue, Back, Publish now, Close, Retry, Open video) | `editor.html:238-242,249-252,266-270` | `.ss-modal__actions`: secondarie `.ss-btn`, la conferma del passo `.ss-btn--primary` (anche `<a>` "Apri il video"). `.btn-danger` rosso → corallo |
| M6 | Testo conferma / risultato | `editor.html:248,265` | `.ss-modal__body` > `p` |
| M7 | Caricamento in corso | `editor.html:258-259` | `.ss-progress` + `.ss-hint` |
| M8 | Wizard: intro, avviso `file://` | `editor.html:280-284` | `.ss-modal__body` > `p` + `.ss-note` |
| M9 | Wizard: 5 passi con link esterni, `code` e origine da copiare | `editor.html:286-314` | NUOVO-N8 `.ss-howto` + N9 `.ss-link--inline` + N10 `.ss-code` + `.ss-icon-btn` (copia/fatto) |
| M10 | Wizard: Client ID + errore | `editor.html:310-312` | `.ss-input` + `.ss-note--error` |
| M11 | Wizard: nota finale | `editor.html:320` | `.ss-hint` |
| M12 | Modali lunghe (wizard, termini) | `style.css:537,853` | NUOVO-N11 `.ss-modal--scroll` |
| M13 | Termini: titolo, intro, testo scorrevole, checkbox, Accept | `terms.js:9-35`, `style.css:830-941` | `.ss-modal__title`, `p`, NUOVO-N12 `.ss-scrollbox`, NUOVO-N14 `.ss-check`, `.ss-btn--primary.ss-btn--block` |
| M14 | Conferma nativa rimozione posizione, alert accesso | `editor.js:537`, `publish-ui.js:93` | D7 |

### 3.7 Icone

Le emoji usate come icone (✨ 🎯 ⚙️ 📤 🎬 🔀 ↺ 🚀 ⏳ ✅ ⚠ 📥 ⬇ 🗑 ✕ ▶ ⏸ ✎ ⚙ 📋 ✓ ↗ → ←) spariscono:

- **Diventano SVG** sulla griglia di 12, tratto 1, `currentColor`, fuori dallo `<span>` del testo: play, pausa, chevron, download, upload, +, ×, mescola, ripristina, ←, →, ↗, copia, fatto, maniglia, B, I. Play, chevron, download, upload, +, ×, ↗ e maniglia sono i tracciati dello specimen; le altre le disegno io sulla stessa griglia.
- **Diventano il pallino di `.ss-note`**: ⚠ e ✅.
- **Spariscono senza sostituto**: le emoji solo decorative (titoli di sezione, ✨, 🚀, ⏳).

## 4. Componenti NUOVO: derivazione

Tutte le ricette vanno in coda a `family.css` con prefisso `ss-`, e ognuna ha una riga nella tabella componenti del `DESIGN.md` del progetto. Valori solo da `tokens.css`. Dove riuso una misura di una ricetta del kit (es. 2px/3px del segmented), lo dichiaro.

**N1 `.ss-segmented--grid`: scelta del numero di posizioni (1–10).**
- *Ruolo*: comando, scelta di uno fra 10.
- *Vicino*: `.ss-segmented` (pillola incassata `--field`, l'opzione scelta sale come carta).
- *Cambia*: è una griglia di 5 colonne su 2 righe. Il contenitore prende raggio `--radius`, perché una pillola su due righe non regge (4px = superficie). Le opzioni sono alte `--control-h`, con numero in `--fs-md` 300.
- *Primitivi*: `--field`, `--paper`, `--shadow-raise`, `--radius`, `--radius-pill`, gap 2px e padding 3px dalla ricetta del segmented.
- *Stati*: riposo `--ink-700`; hover `--ink-900`; scelto `[aria-pressed=true]` carta + `--shadow-raise` + `--ink-900`; focus anello `--focus`.
- *Grigio*: la scelta si riconosce dalla carta rialzata.
- *JS*: `app.js` passa da `.selected` a `aria-pressed`.

**N2 Scheda posizione (`.ss-clip` esteso).**
- *Ruolo*: contenuto (miniatura) più comandi della posizione.
- *Vicino*: `.ss-clip` dello specimen (numero grande, miniatura 9:16, nome, durata, maniglia, stati `is-active` / `is-dragging` / `is-drop-target`).
- *Aggiunte*:
  - `.ss-clip__rank` contiene il `<select class="rank-select">` trasparente sopra il numero. Si vede "3" in `--fs-lg` 300 come nello specimen, con un chevron 12px `--ink-500`. Il click apre il menu nativo "Posizione #1…#N" e lo scambio funziona come oggi. Il focus disegna l'anello sul numero (`:has(:focus-visible)`).
  - `.ss-clip__body`: seconda riga sotto i meta, con l'etichetta (`.ss-input`) e i link distruttivi "Rimuovi clip · Rimuovi posizione" (`.ss-link`, `--fs-xs`, D16).
  - Badge ordine di riproduzione: `.ss-badge` con icona play, accanto alla durata.
  - Maniglia SVG solo sulle schede con clip (sono le uniche trascinabili).
  - `.ss-clip--empty`: numero in `--ink-500`, titolo "Posizione #N", corpo con riga link, "oppure" e `.ss-drop`.
- *Primitivi*: quelli di `.ss-clip` (`--paper`, ombra 1px della ricetta, `--radius`, `--radius-sm` sulla miniatura), inchiostri, `--fs-lg` / `--fs-sm` / `--fs-xs`, spazi `--s-2` / `--s-3`.
- *Stati*: come `.ss-clip`. Hover sale di 2px con `--shadow-raise`; attiva ha l'anello interno di 1px `--ink-900`; trascinata sale di 3px con `--shadow-paper`; bersaglio ha la linea di 2px `--ink-900`. Vuota: numero `--ink-500`. Errore: `.ss-note--error` nel corpo.
- *Grigio*: tutto è inchiostro; il colore viene solo dalla miniatura.
- *Miniatura*: il canvas passa da 64×100 a 54×96 (9:16, 2× del 27×48 del kit) in `editor.js:409-410`, così non si deforma.

**N3 `.ss-word`: parola del titolo con il suo colore.**
- *Ruolo*: comando (apre il selettore colore) che mostra un colore scelto dall'utente.
- *Vicino*: `.ss-btn--sm` (pillola di carta) + `.ss-swatch` (cerchio con anello sottile).
- *Ricetta*: pillola carta alta `--control-h-sm`, parola in `--ink-900`, `--fs-xs`. Davanti c'è un pallino di 12px (misura di `.ss-icon`) con `background: var(--c)` e l'anello di `.ss-swatch`.
- *Perché*: oggi la parola è scritta nel suo colore su fondo scuro. Sulla carta il bianco di default sparirebbe; il pallino passa il test in grigio.
- *Stati*: quelli di `.ss-btn`.
- *JS*: `editor.js:51-53` scrive `--c` al posto di `style.color`.

**N4 `.ss-swatch-list`: colore per posizione.**
- *Ruolo*: colori dell'utente.
- *Vicino*: `.ss-swatch` + `.ss-label`.
- *Ricetta*: `flex-wrap`, gap `--s-3`; ogni voce è una colonna centrata con gap `--s-1`, swatch sopra ed etichetta "#N" `--fs-xs` `--ink-700` sotto.
- *Stati*: quelli di `.ss-swatch` più l'anello di focus.
- *JS*: classi e `aria-label` in `editor.js:187-199`.

**N5 `.ss-or`: separatore "oppure".**
- *Ruolo*: divisore.
- *Vicino*: la linea `--hairline` tra le `.ss-section` + `.ss-hint`.
- *Ricetta*: flex centrato, gap `--s-3`; `::before` e `::after` con `flex: 1`, alti 1px, in `--hairline`; testo `--fs-xs` `--ink-500`, minuscolo (oggi è maiuscolo).

**N6 `.ss-progress--indeterminate`: import da link in corso.**
- *Ruolo*: stato.
- *Vicino*: `.ss-progress` (traccia 2px `--track`, riempimento `--ink-900`).
- *Ricetta*: il riempimento è largo un terzo della traccia e va avanti e indietro con `var(--dur-glide) var(--ease-glide) infinite alternate`.
- *Movimento ridotto*: con `prefers-reduced-motion` l'animazione si ferma e il riempimento resta pieno. La regola globale del kit a 1ms farebbe sfarfallare un'animazione infinita.
- *Sostituisce*: lo spinner rotante.

**N7 `.ss-summary`: riepilogo chiave/valore (`dl`).**
- *Ruolo*: testo.
- *Vicino*: `.ss-row` (etichetta a sinistra, valore a destra) + `.ss-label`.
- *Ricetta*: griglia `auto 1fr`, gap `--s-2` `--s-3`; `dt` come `.ss-label`; `dd` `--fs-sm` `--ink-900`, `overflow-wrap: anywhere`. Niente maiuscolo (oggi `dt` è uppercase).

**N8 `.ss-howto`: istruzioni numerate del wizard.**
- *Ruolo*: testo.
- *Vicino*: `ol.ss-steps` (numeri light con `counter`), ma in verticale e senza passo corrente.
- *Ricetta*: griglia con gap `--s-3`; ogni `li` su due colonne `auto 1fr`; contatore `--fs-md` 300 `--ink-900`; testo `--fs-sm` `--ink-700`.
- *Evidenza*: `strong` ed `em` diventano `--ink-900`, senza grassetto né corsivo.

**N9 `.ss-link--inline`: link esterni dentro un paragrafo.**
- *Ruolo*: comando.
- *Vicino*: `.ss-link`.
- *Differenza*: `.ss-link` è `--ink-700` senza linea a riposo, quindi in un paragrafo `--ink-700` non si distinguerebbe dal testo. Qui il link è `--ink-900` con sottolineatura sempre visibile in `--track` e `text-underline-offset: var(--s-1)`; in hover la linea diventa `currentColor` (`--dur-hover`, ease-out). Dopo il testo, icona ↗ SVG.

**N10 `.ss-code`: origine, nomi di file, suffisso Client ID.**
- *Ruolo*: contenuto tecnico.
- *Vicino*: `.ss-badge` (pillola incassata `--field`, `--fs-xs`).
- *Ricetta*: raggio `--radius-sm` perché il testo va a capo; Urbanist (il kit vieta altri font); `--ink-900`. In linea: padding `0 var(--s-1)`. Origine copiabile (`#setup-origin`): padding `--s-2` `--s-3`, `--radius`, `user-select: all`, `overflow-wrap: anywhere`.

**N11 `.ss-modal--scroll`: modali lunghe (wizard e termini).**
- *Vicino*: `.ss-modal`.
- *Ricetta*: `max-height: calc(100svh - 2 * var(--gutter))`, `overflow-y: auto`, `overscroll-behavior: contain`. Con dentro uno `.ss-scrollbox` diventa una colonna flex e scorre solo il riquadro, così checkbox e bottone restano visibili come oggi.
- *Larghezza*: resta quella del kit (420px). Oggi il wizard è largo 540px; con 420px diventa solo più alto.

**N12 `.ss-scrollbox`: testo dei termini.**
- *Ruolo*: superficie incassata con testo lungo.
- *Vicino*: `.ss-textarea` (`--field`, `--radius`).
- *Ricetta*: padding `--s-3` `--s-4`, `flex: 1`, `min-height: 0`, `overflow: auto`. Testo `--fs-xs` `--ink-700`; sottotitoli `--fs-sm` 400 `--ink-900`, senza la linea sotto che c'è oggi.

**N13 `.ss-account`: account YouTube collegato.**
- *Ruolo*: identità (l'avatar è contenuto) più comando "disconnetti".
- *Vicino*: `.ss-topbar__product` (avatar 22px tondo con anello `--hairline` + nome) + `.ss-icon-btn--bare` (×).
- *Ricetta*: nome `--fs-sm` `--ink-900` con ellissi. Oggi il nome è verde, diventa inchiostro.

**N14 `.ss-check`: checkbox di accettazione dei termini.**
- *Ruolo*: comando on/off.
- *Vicino*: `.ss-switch` (input nativo con `appearance: none`, `--track` → `--ink-900` quando attivo).
- *Ricetta*: quadrato `--s-4`, `--radius-sm`, `--field` con `inset 0 0 0 1px var(--track)`. Spuntato: `--ink-900` con segno di spunta in carta (SVG data-uri, come il chevron di `.ss-select`). Hover: anello `--ink-700`. Focus: anello `--focus` scostato di 2px (come i campi).
- *Perché non `.ss-switch`*: "accetto i termini" è una dichiarazione, non un'impostazione.

**N15 Stati e casi mancanti nel kit.**
- `.ss-icon-btn:disabled`: stessa regola di `.ss-btn:disabled` (opacità 0,4, niente ombra né movimento). Serve per il Play quando non ci sono clip.
- Topbar senza nav: l'app non ha voci di menu, e senza `.ss-topbar__nav` lo switch lingua non va a destra. Regola: `.ss-topbar:not(:has(.ss-topbar__nav)) .ss-lang { margin-left: auto; }`. Non serve una classe nuova; su telefono non resta una riga vuota.

**Componenti del kit non usati perché l'app non ha la funzione**: segmenti della timeline, velocità 0,5×/1×, `.ss-steps` (wizard a passi), `.ss-toast`.

## 5. Dipendenze JS (classi, ID e attributi toccati)

Regola: tutti gli **ID restano**. Le classi che il JS legge o crea cambiano insieme al JS, nello stesso passo. Gli elementi il cui testo è scritto dal JS **non** ricevono `data-en` (altrimenti `i18n.js` lo sovrascrive): `#rank-display`, `#export-status`, `#btn-export` / `#btn-publish` (lo span interno), `#time-display`, `#setup-error`, `#ps-*`, `#pc-text`, `#pp-status`, `#pr-title`, `#pr-text`.

| File:righe | Oggi | Dopo |
|---|---|---|
| `app.js:5-6` | `#rank-grid`, `#btn-start` | invariati |
| `app.js:12,17-19` | crea `.rank-btn`, alterna `.selected` | `.ss-segmented__option` + `aria-pressed` |
| `editor.js:8-11` | `#rank-display` testo, `document.title` | testo da dizionario; ridisegno su `ss:lang` |
| `editor.js:15-19` | click su `.section-header` → `.collapsed` | **rimosso**: `<details>` apre e chiude da solo |
| `editor.js:41-45` | crea `.words-hint` | `.ss-hint` |
| `editor.js:48-60` | crea `.word-chip` con `style.color`, `title` | `.ss-word` con `--c`, testo in `span`, `title` dal dizionario |
| `editor.js:109-120` | `#btn-bold` / `#btn-italic` `.active` | `aria-pressed` |
| `editor.js:122-129` | `#stroke-toggle` (button) click + `.active` | `input.ss-switch`: evento `change`, legge `checked` |
| `editor.js:170-176` | `#rank-single-row` / `#rank-custom-row` `style.display` | invariato (vale anche su `.ss-row` / `.ss-field`) |
| `editor.js:183-203` | crea `.rank-color-item` + `input` + `span` | `.ss-swatch-list__item`, `.ss-swatch`, `.ss-label`, `aria-label` |
| `editor.js:206,216,225-228` | `#clip-slots`, crea `div.clip-slot` | `ol.ss-list`, crea `li.ss-clip` |
| `editor.js:229,237,243-260` | `.clip-active`, `.dragging`, `.drag-over` | `.is-active`, `.is-dragging`, `.is-drop-target` |
| `editor.js:269-334` | `.clip-slot-header`, `select.rank-select`, `.slot-title` / `.slot-num`, `.play-order-badge`, `.btn-icon` ×2 | struttura N2; `.rank-select` resta dentro `.ss-clip__rank`; badge `.ss-badge`; rimozioni `.ss-link` |
| `editor.js:339-344` | `.drop-zone.loading` + `.spinner` + `.dz-sub` | `.ss-drop.is-busy` + N6 |
| `editor.js:350-372` | `.link-row`, `.input.link-input`, `.btn-link`, `.or-sep` | `.ss-clip__link`, `.ss-input`, `.ss-btn.ss-btn--sm`, `.ss-or` |
| `editor.js:374-393` | `div.drop-zone` con `innerHTML` (📥, `.dz-error`), `.dragover` | `button.ss-drop` (si usa da tastiera), icona SVG, `.ss-note--error`, `.is-over` |
| `editor.js:395-439` | `.clip-loaded`, `canvas.clip-thumb` 64×100, `.clip-info` / `-filename` / `-duration`, `.clip-name-input` | `.ss-clip__thumb` 54×96, `.ss-clip__meta` / `__name` / `__dur`, `.ss-input` |
| `editor.js:537` | `window.confirm` | D7 |
| `editor.js:557-572` | `#btn-shuffle`, `#btn-order-reset` | invariati; escono dal summary, lo `stopPropagation` resta innocuo |
| `editor.js:575-618` | `#btn-export` `textContent`, `#export-progress.visible`, `#export-progress-fill` `style.width`, `#export-status` (+ `.error`) | testo nello `span` del bottone; `.visible` mantenuto come hook; `.ss-progress__fill` (`style.width` funziona ancora); stato `.ss-note` / `.ss-note--error` |
| `preview.js:8-12` | `#btn-play` `textContent` ▶/⏸, `#progress-bar` (pointer, rect, `.scrubbing`), `#progress-fill` `width`, `#progress-thumb` `left`, `#time-display` testo | icone + `aria-label`; `#progress-bar` = `.ss-timeline__lanes` (stessi eventi); fill e playhead continuano a ricevere `width` / `left` inline; tempo con `<b>` |
| `publish-ui.js:56-87` | `#yt-account` `innerHTML` (`.yt-connected`, `.yt-avatar`, `.yt-name`, `.btn-icon`, `.btn-connect`); `querySelector('.btn-connect')` | N13 + `.ss-btn--sm`; selettore aggiornato |
| `publish-ui.js:110-126,190-203` | `#setup-modal`, `#publish-modal` con `style.display` `''` / `'none'` e click sull'overlay | invariato (`''` torna al `display: grid` di `.ss-overlay`) |
| `publish-ui.js:128-146` | `#setup-copy-origin` testo ✓ / 📋 | scambio icona + `aria-label` |
| `publish-ui.js:151-152` | `#setup-error` | `.ss-note--error` |
| `publish-ui.js:167-178` | `#btn-publish` `textContent` / `title` | `span` interno + dizionario |
| `publish-ui.js:209-276` | `#ps-*`, `#pc-text`, `#pp-fill`, `#pp-status`, `#pr-*` | stessi ID; testi dal dizionario, senza emoji |
| `terms.js:9-35` | markup in stringa (`.terms-*`, `#terms-overlay`, `#terms-checkbox`, `#terms-accept-btn`) | classi del kit + N11 / N12 / N14; ID invariati; testi IT / EN |
| tutti | — | ascolto di `ss:lang` per ridisegnare i testi dinamici (`editor.js`, `publish-ui.js`, `preview.js`, `terms.js`) |

**Ordine di caricamento.** `i18n.js` va caricato con `defer`, come chiede il kit, quindi parte **dopo** gli script classici dell'app. Il dizionario parte in italiano e, se la scelta salvata è EN, `i18n.js` emette `ss:lang` e l'app ridisegna i testi.

## 6. Testi IT / EN

L'app oggi è solo in inglese. Colonne: **EN attuale** (com'è oggi), **IT** (nuovo default, traduzione mia), **EN dopo** (cambia solo dove indicato: emoji tolte, nome prodotto, maiuscolo).

### 6.1 Landing (`index.html`)

| Dove | EN attuale | IT | EN dopo |
|---|---|---|---|
| :7 `<title>` | TopRankVids — TikTok Ranking Video Creator | TopFratmRanks — Crea video classifica TikTok | TopFratmRanks — TikTok Ranking Video Creator (D1) |
| :6 meta | TopRankVids — Create TikTok ranking videos in your browser. Choose a rank, add clips, customize the title, export to MP4. | TopFratmRanks — Crea video classifica TikTok nel browser. Scegli le posizioni, aggiungi le clip, personalizza il titolo, esporta in MP4. | TopFratmRanks — … (D1) |
| :17 | TopRankVids | → nome in topbar: TopFratmRanks | TopFratmRanks (D1) |
| :18 | Create TikTok ranking videos in seconds | Crea video classifica TikTok in pochi secondi | = (diventa il titolo `.ss-head`) |
| :20 | How many items in your ranking? | Quante posizioni nella tua classifica? | = |
| :24 | ✨ Start Creating | Inizia a creare | Start Creating |

### 6.2 Editor statico (`editor.html`)

| Dove | EN attuale | IT | EN dopo |
|---|---|---|---|
| :6 meta | TopRankVids Editor — Compose your TikTok ranking video with custom title, clips and colors. | Editor di TopFratmRanks — Componi il tuo video classifica TikTok con titolo, clip e colori personalizzati. | TopFratmRanks Editor — … (D1) |
| :23 | Ranking: — | Classifica: — | = |
| :31 | 🎯 Video Title | Titolo del video | Video Title |
| :36 | Title Text | Testo del titolo | = |
| :38 placeholder | e.g. Ranking Most Humiliating Ankle Breaker | es. Classifica degli ankle breaker più umilianti | = |
| :43 | Word Colors (click a word to change) | Colori delle parole (clicca una parola per cambiarlo) | = |
| :45 | Type a title above to color each word | Scrivi un titolo qui sopra per colorare ogni parola | = |
| :50 | Font & Style | Font e stile | = |
| :62 title | Font size (px) | Dimensione del font (px) | = |
| :63 | B · title "Bold" | icona · aria-label "Grassetto" | icona · "Bold" |
| :64 | I · title "Italic" | icona · aria-label "Corsivo" | icona · "Italic" |
| :69 | Text Stroke | Contorno del testo | = |
| :71 title | Toggle stroke | Attiva o disattiva il contorno | = |
| :72 title | Stroke width | Spessore del contorno | = |
| :73 title | Stroke color | Colore del contorno | = |
| :82 | ⚙️ General Settings | Impostazioni generali | General Settings |
| :87 | Background Color | Colore di sfondo | = |
| :91 | Clip Size | Dimensione clip | = |
| :93 | Fit — show the whole clip | Adatta — mostra tutta la clip | = |
| :94 | Fill — full width, cropped | Riempi — tutta la larghezza, ritagliata | = |
| :98 | Rank Number Size | Dimensione dei numeri | = |
| :102 | Rank Number Spacing | Spaziatura dei numeri | = |
| :106 | Rank Number Colors | Colori dei numeri | = |
| :108 | Auto Gradient (Yellow→Red) | Sfumatura automatica (giallo→rosso) | = |
| :109 | Single Color | Colore unico | = |
| :110 | Custom Per Rank | Personalizzato per posizione | = |
| :114 | Rank Color | Colore dei numeri | = |
| :118 | Color Per Rank | Colore per posizione | = |
| :127 | 📤 Publishing | Pubblicazione | Publishing |
| :133 | ⚠ Publishing needs a one-time setup (free Google Client ID, ~15 min). | La pubblicazione richiede una configurazione una tantum (Client ID Google gratuito, ~15 min). | senza ⚠ |
| :135 | ⚙ Set up YouTube publishing | Configura la pubblicazione su YouTube | senza ⚙ |
| :139 | YouTube Account | Account YouTube | = |
| :141 | Connect YouTube | Collega YouTube | = |
| :145 | YouTube Title · (empty = ranking title + #Shorts) | Titolo YouTube · (vuoto = titolo della classifica + #Shorts) | = |
| :146 placeholder | Uses the ranking title if empty | Se vuoto usa il titolo della classifica | = |
| :149 | Description | Descrizione | = |
| :150 valore | #Shorts | #Shorts (contenuto, invariato) | = |
| :153 | Privacy | Privacy | = |
| :155-157 | Public / Unlisted / Private | Pubblico / Non in elenco / Privato | = |
| :160 | ✎ Change Google Client ID | Cambia Client ID Google | senza ✎ |
| :162-163 | Coming soon | Presto | = |
| :170 | 🎬 Clips | Clip | Clips |
| :172 | 🔀 Shuffle | Mescola | Shuffle |
| :172 title | Shuffle the play order (rank numbers stay put) | Mescola l'ordine di riproduzione (i numeri restano al loro posto) | = |
| :173 | ↺ Reset | Ripristina | Reset |
| :173 title | Restore the default play order: last place first, #1 last | Ripristina l'ordine predefinito: prima l'ultima posizione, il #1 per ultimo | = |
| :178 | Cards are in **play order** — drag them to change it. Use the **Rank #** menu on a card to change which number it reveals. | Le schede sono in **ordine di riproduzione**: trascinale per cambiarlo. Usa il menu **Posizione #** di una scheda per cambiare il numero che rivela. | = (evidenza con inchiostro, non grassetto) |
| :180 | + Add Rank | Aggiungi posizione | Add Rank |
| :191 | 🚀 Generate Video Ranking | Genera il video classifica | Generate Video Ranking |
| :192 | 📤 Publish | Pubblica | Publish |
| :192 title | Generate the video first | Prima genera il video | = |
| :198 | Preparing… | Preparazione… | = |
| :210 | ▶ · title "Play preview" | icona · aria-label "Riproduci anteprima" | icona · "Play preview" |
| :227, :278 | ✕ · title "Close" | icona · aria-label "Chiudi" | icona · "Close" |
| :231 | 📤 Publish to YouTube | Pubblica su YouTube | Publish to YouTube |
| :233-236 | Title / Privacy / File / Channel | Titolo / Privacy / File / Canale | = |
| :239, :317 | Cancel | Annulla | = |
| :240 | Sign in with Google | Accedi con Google | = |
| :241 | Continue → | Continua (+ icona) | Continue |
| :247 | ⚠ Final confirmation | Conferma finale | Final confirmation |
| :248 | The video will be published… | Il video verrà pubblicato… | = |
| :250 | ← Back | Indietro (+ icona) | Back |
| :251 | Publish now | Pubblica ora | = |
| :257 | Uploading… | Caricamento… | = |
| :259 | Starting… | Avvio… | = |
| :264 | Done | Fatto | = |
| :267 | Close | Chiudi | = |
| :268 | Retry | Riprova | = |
| :269 | Open video ↗ | Apri il video (+ icona) | Open video |
| :279 | ⚙ YouTube publishing setup | Configurazione della pubblicazione su YouTube | YouTube publishing setup |
| :280 | One-time, free, ~15 minutes. The Client ID is a **public** identifier — no secret involved. | Una tantum, gratis, ~15 minuti. Il Client ID è un identificativo **pubblico**: nessun segreto in gioco. | = |
| :282-283 | ⚠ You opened the app from a local file (`file://`). Google sign-in only works from a real web address — use the GitHub Pages site or a local server (`serve.ps1`). | Hai aperto l'app da un file locale (`file://`). L'accesso con Google funziona solo da un vero indirizzo web: usa il sito su GitHub Pages o un server locale (`serve.ps1`). | senza ⚠ |
| :288-289 | Open the Google Cloud Console ↗ and create a project (any name, e.g. *TopRankVids*). | Apri la Google Cloud Console e crea un progetto (nome qualsiasi, es. *TopFratmRanks*). | … e.g. *TopFratmRanks* (D1) |
| :292 | Enable the YouTube Data API v3 ↗. | Attiva la YouTube Data API v3. | = |
| :295-297 | In OAuth consent screen ↗: choose **External**, fill the minimum fields, then under **Test users** add the Google account(s) that will publish (your own email). | In Schermata consenso OAuth scegli **Esterno**, compila i campi minimi, poi in **Utenti di test** aggiungi gli account Google che pubblicheranno (la tua email). | = (D13) |
| :300-302 | In Credentials ↗: *Create Credentials → OAuth client ID → Web application*. Under **Authorized JavaScript origins** add exactly: | In Credenziali: *Crea credenziali → ID client OAuth → Applicazione web*. In **Origini JavaScript autorizzate** aggiungi esattamente: | = (D13) |
| :305 | 📋 · title "Copy" | icona · aria-label "Copia" | icona · "Copy" |
| :309 | Copy the generated **Client ID** (ends in `.apps.googleusercontent.com`) and paste it here: | Copia il **Client ID** generato (finisce con `.apps.googleusercontent.com`) e incollalo qui: | = |
| :318 | Save & enable | Salva e attiva | = |
| :320 | Full guide with troubleshooting: **docs/YOUTUBE_SETUP.md** in the repository. | Guida completa con soluzione dei problemi: **docs/YOUTUBE_SETUP.md** nel repository. | = |

### 6.3 Testi creati dal JS

| Dove | EN attuale | IT | EN dopo |
|---|---|---|---|
| `editor.js:9` | Ranking: Top N | Classifica: Top N | = |
| `editor.js:10` (titolo scheda) | TopRankVids — Top N Editor | TopFratmRanks — Editor Top N | TopFratmRanks — Top N Editor (D1) |
| `editor.js:54` title | Change color of "w" | Cambia il colore di "w" | = |
| `editor.js:275` title | Change the rank number of this clip | Cambia il numero di posizione di questa clip | = (è anche l'`aria-label` del select) |
| `editor.js:279`, `:296` | Rank #N | Posizione #N | = |
| `editor.js:303` title | This clip plays 1st in the video | Nel video questa clip è la 1ª | = |
| `editor.js:304` + `ordinal()` :546-555 | ▶ 1st / 2nd / 3rd / Nth | 1ª / 2ª / 3ª / Nª (+ icona) | 1st… (+ icona) |
| `editor.js:311-312` | 🗑 · title "Remove clip" | link "Rimuovi clip" | "Remove clip" (D16) |
| `editor.js:326-327` | ✕ · title "Remove this rank entirely" | link "Rimuovi posizione" · title "Rimuovi del tutto questa posizione" | "Remove rank" · title invariato (D16) |
| `editor.js:343` | Importing clip for rank #N | Importazione della clip per la posizione #N | = |
| `editor.js:355` | Paste a TikTok link… | Incolla un link TikTok… | = |
| `editor.js:359` | ⬇ Import | Importa | Import |
| `editor.js:371` | or | oppure | = |
| `editor.js:377` | **Drop a clip here** or click to browse · MP4 / WebM, the clip for rank #N | **Trascina qui una clip** o clicca per sfogliare · MP4 / WebM, la clip per la posizione #N | = |
| `editor.js:378` | ⚠ + errore | pallino corallo + errore | senza ⚠ |
| `editor.js:420` | 3.2s | 3,2 s | 3.2s |
| `editor.js:426` | Label shown next to #N (e.g. "Wow") | Etichetta accanto al #N (es. "Wow") | = |
| `editor.js:475` | Not a video file. | Non è un file video. | = |
| `editor.js:483` | Cannot load this clip. | Impossibile caricare questa clip. | = |
| `editor.js:491` | Resolving link… | Risoluzione del link… | = |
| `editor.js:501` | Could not import from that link. | Impossibile importare da quel link. | = |
| `editor.js:516` | Maximum of N ranks | Massimo N posizioni | = |
| `editor.js:537` | Remove rank #N and its loaded clip? This cannot be undone. | Rimuovere la posizione #N e la sua clip? Non si può annullare. | = (D7) |
| `editor.js:586` | ⏳ Generating… | Generazione… | Generating… |
| `editor.js:587` | 🚀 Generate Video Ranking | Genera il video classifica | Generate Video Ranking |
| `editor.js:588` | 🚀 Generate (L/N clips loaded) | Genera (L/N clip caricate) | Generate (L/N clips loaded) |
| `editor.js:594` | A generation is already in progress. | È già in corso una generazione. | = |
| `editor.js:606` | ✅ Done! Downloaded F | Fatto! Scaricato F | Done! Downloaded F |
| `editor.js:613` | ⚠ Export failed: … | Export non riuscito: … | Export failed: … |
| `preview.js:94,127,134,143` | ▶ / ⏸ | icone · aria-label "Riproduci anteprima" / "Metti in pausa" | "Play preview" / "Pause" (nuovo, §6.6) |
| `publish-ui.js:67` | ✕ · title "Disconnect" | icona · "Disconnetti" | icona · "Disconnect" |
| `publish-ui.js:79` | Connect YouTube | Collega YouTube | = |
| `publish-ui.js:87` | Connecting… | Collegamento… | = |
| `publish-ui.js:93` | YouTube sign-in failed: … | Accesso a YouTube non riuscito: … | = (D7) |
| `publish-ui.js:132-133` | ✓ / 📋 | icone · "Copiato" / "Copia" | "Copied" / "Copy" |
| `publish-ui.js:151` | That does not look like a Client ID — it must end with ".apps.googleusercontent.com". | Non sembra un Client ID: deve finire con ".apps.googleusercontent.com". | = |
| `publish-ui.js:173` | ⏳ Generating… / 📤 Publish | Generazione… / Pubblica | Generating… / Publish |
| `publish-ui.js:174` | Set up publishing first (📤 Publishing section in the sidebar) | Prima configura la pubblicazione (sezione Pubblicazione nel pannello) | Set up publishing first (Publishing section in the panel): "sidebar" → "panel", perché su telefono non è una barra laterale |
| `publish-ui.js:175` | Load at least one clip first | Prima carica almeno una clip | = |
| `publish-ui.js:176` | Publish the generated video to YouTube | Pubblica su YouTube il video generato | = |
| `publish-ui.js:177` | Generates the video, then publishes it to YouTube | Genera il video, poi lo pubblica su YouTube | = |
| `publish-ui.js:215` | Not connected | Non collegato | = |
| `publish-ui.js:227` | your channel | il tuo canale | = |
| `publish-ui.js:230` | The video will be PUBLIC immediately on the channel "X". Everyone will be able to see it. Are you sure? | Il video sarà subito pubblico sul canale "X". Tutti potranno vederlo. Confermi? | … will be public immediately… (D9) |
| `publish-ui.js:232` | The video will be uploaded as UNLISTED on "X" — visible only to people with the link. | Il video verrà caricato come non in elenco su "X": visibile solo a chi ha il link. | … as unlisted… (D9) |
| `publish-ui.js:234` | The video will be uploaded as PRIVATE on "X" — visible only to you. | Il video verrà caricato come privato su "X": visibile solo a te. | … as private… (D9) |
| `publish-ui.js:250` | Starting… | Avvio… | = |
| `publish-ui.js:262` | ✅ Published! | Pubblicato! | Published! |
| `publish-ui.js:263` | Your video is on YouTube. Processing may take a minute before it appears. | Il tuo video è su YouTube. Può servire un minuto di elaborazione prima che compaia. | = |
| `publish-ui.js:272` | ⚠ Upload failed | Caricamento non riuscito | Upload failed |
| `publish-ui.js:50` | My Ranking (titolo YouTube di riserva) | **invariato**: è il titolo del video pubblicato, cioè contenuto | = |

### 6.4 Messaggi di stato ed errore

| Dove | EN attuale | IT |
|---|---|---|
| `state.js:89` | This file has no readable video track. | Questo file non ha una traccia video leggibile. |
| `state.js:110` | Cannot decode this video. Use MP4 (H.264) or WebM. | Impossibile decodificare questo video. Usa MP4 (H.264) o WebM. |
| `link-import.js:18` | Download service returned HTTP N. | Il servizio di download ha risposto HTTP N. |
| `link-import.js:22` | Could not read this TikTok link. | Impossibile leggere questo link TikTok. |
| `link-import.js:25` | No downloadable video found for this link. | Nessun video scaricabile per questo link. |
| `link-import.js:36` | Paste a link first. | Prima incolla un link. |
| `link-import.js:37` | That does not look like a valid link. | Non sembra un link valido. |
| `link-import.js:38` | Only TikTok links are supported for now. | Per ora sono supportati solo i link TikTok. |
| `link-import.js:40` | Resolving link… | Risoluzione del link… |
| `link-import.js:42` | Downloading (no watermark)… | Download (senza filigrana)… |
| `link-import.js:44` | Failed to download the video (HTTP N). | Download del video non riuscito (HTTP N). |
| `link-import.js:47` | Downloaded an empty file — try again. | Il file scaricato è vuoto: riprova. |
| `exporter.js:35` | Seek timed out while reading a clip. | Tempo scaduto durante la lettura di una clip. |
| `exporter.js:111` | H.264 encoding not supported here. | Codifica H.264 non supportata qui. |
| `exporter.js:113` | Preparing audio… | Preparazione dell'audio… |
| `exporter.js:172-173` | Rendering clip X/Y — frame A/B | Rendering clip X/Y, fotogramma A/B |
| `exporter.js:185` | Encoding audio… | Codifica dell'audio… |
| `exporter.js:222` | Finalizing MP4… | Finalizzazione MP4… |
| `exporter.js:250` | No supported recording format in this browser. | Nessun formato di registrazione supportato in questo browser. |
| `exporter.js:289` | Recording failed. | Registrazione non riuscita. |
| `exporter.js:305` | Recording in realtime… Xs / Ys | Registrazione in tempo reale… X s / Y s |
| `exporter.js:335` | Load at least one clip first. | Prima carica almeno una clip. |
| `exporter.js:343` | Fast export unavailable — recording in realtime instead… | Export rapido non disponibile: registro in tempo reale… |
| `youtube.js:50` | Google sign-in script failed to load. Check your connection or ad blocker. | Lo script di accesso Google non si è caricato. Controlla la connessione o l'ad blocker. |
| `youtube.js:76` | Google sign-in failed. | Accesso con Google non riuscito. |
| `youtube.js:82` | Google sign-in was cancelled. | Accesso con Google annullato. |
| `youtube.js:92` | Publishing is not configured (missing Google Client ID). | La pubblicazione non è configurata (manca il Client ID Google). |
| `youtube.js:95` | Another sign-in is already in progress. | È già in corso un altro accesso. |
| `youtube.js:123` | Daily YouTube upload quota reached — try again tomorrow. | Raggiunta la quota giornaliera di caricamenti YouTube: riprova domani. |
| `youtube.js:132` | No YouTube channel found on this Google account. | Nessun canale YouTube su questo account Google. |
| `youtube.js:188,218` | Upload finished but the response could not be read. | Caricamento finito, ma la risposta non è leggibile. |
| `youtube.js:195,226` | Network error during upload. | Errore di rete durante il caricamento. |
| `youtube.js:232` | Starting upload… | Avvio del caricamento… |
| `youtube.js:248` | Uploading… | Caricamento… |
| `youtube.js:250,255` | Uploading… N% | Caricamento… N% |
| `youtube.js:258` | YouTube did not return a video id. | YouTube non ha restituito l'ID del video. |
| `youtube.js:270` | Session expired — signing in again… | Sessione scaduta: nuovo accesso… |

In inglese i messaggi restano uguali. Non posso tradurre i messaggi che arrivano da servizi esterni (`j.msg` di tikwm, `error.message` di Google): restano come arrivano (R7).

### 6.5 Termini e condizioni (`terms.js`)

| Dove | EN attuale | IT |
|---|---|---|
| :12 | ⚠️ Terms & Conditions | Termini e condizioni |
| :13 | Please read and accept the terms of service and privacy policy before using the application. | Prima di usare l'applicazione, leggi e accetta i termini di servizio e l'informativa sulla privacy. |
| :15 | 1. Illustrative & Mockup Simulation Purposes Only | 1. Solo a scopo illustrativo e di simulazione |
| :16 | This application is provided strictly as a **proof-of-concept prototype, mockup simulator, and for educational and illustrative purposes**. It is not designed or intended to be a commercial product, nor does it guarantee suitability for any specific professional or social media marketing use. | Questa applicazione è fornita esclusivamente come **prototipo dimostrativo, simulatore di mockup e per scopi didattici e illustrativi**. Non è progettata né pensata come prodotto commerciale e non garantisce l'idoneità a specifici usi professionali o di marketing sui social media. |
| :17 | 2. No Warranty & Limitation of Liability | 2. Nessuna garanzia e limitazione di responsabilità |
| :18 | THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. IN NO EVENT SHALL THE AUTHORS, COPYRIGHT HOLDERS, OR DISTRIBUTORS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. | Questo software è fornito "così com'è", senza garanzie di alcun tipo, esplicite o implicite. In nessun caso gli autori, i titolari del copyright o i distributori potranno essere ritenuti responsabili per reclami, danni o altre responsabilità, derivanti da contratto, illecito o altro, che nascano dal software, dal suo uso o da altre operazioni con esso. (D9: EN in minuscolo normale?) |
| :19 | By using this application, you agree that you do so at your own risk. The developers are not liable for any issues, data loss, social media account restrictions, or platform-related violations resulting from the use of this software. | Usando questa applicazione accetti di farlo a tuo rischio. Gli sviluppatori non rispondono di problemi, perdite di dati, limitazioni degli account social o violazioni delle regole delle piattaforme derivanti dall'uso di questo software. |
| :20 | 3. Intellectual Property & Content Responsibility | 3. Proprietà intellettuale e responsabilità sui contenuti |
| :21 | Users are **solely responsible** for ensuring they possess all necessary licenses, permissions, or ownership rights for any video clips, audio tracks, fonts, or text overlays used or imported. The application does not review or verify copyright compliance, and the authors assume absolutely no responsibility for any infringement. | Gli utenti sono **gli unici responsabili** di avere tutte le licenze, i permessi o i diritti necessari per clip video, tracce audio, font o testi sovrapposti usati o importati. L'applicazione non controlla né verifica il rispetto del copyright e gli autori non si assumono alcuna responsabilità per eventuali violazioni. |
| :22 | 4. Third-Party Services & Trademarks | 4. Servizi di terze parti e marchi |
| :23 | TikTok and YouTube are trademarks of their respective owners. This project is entirely independent and not endorsed, sponsored, or affiliated with them. Link imports utilize the public "tikwm.com" API, which is an independent third-party service outside our control. | TikTok e YouTube sono marchi dei rispettivi proprietari. Questo progetto è del tutto indipendente e non è approvato, sponsorizzato né affiliato a loro. L'importazione da link usa l'API pubblica di "tikwm.com", un servizio di terze parti indipendente e fuori dal nostro controllo. |
| :24 | 5. Privacy & Data Policy | 5. Privacy e trattamento dei dati |
| :25 | All video rendering, font loading, configuration editing, and audio processing occur **100% locally in your web browser sandbox**. No media files or titles are uploaded to any server. OAuth tokens for YouTube publishing are kept strictly in-memory and are never stored or transmitted to third parties. | Rendering video, caricamento dei font, modifica delle impostazioni ed elaborazione audio avvengono **al 100% in locale, nella sandbox del tuo browser**. Nessun file multimediale o titolo viene caricato su un server. I token OAuth per la pubblicazione su YouTube restano solo in memoria e non vengono mai salvati né trasmessi a terzi. |
| :29 | I have read, understood, and accept all the terms, conditions, and privacy policies. | Ho letto, compreso e accetto tutti i termini, le condizioni e l'informativa sulla privacy. |
| :32 | Accept & Continue | Accetta e continua |

### 6.6 Testi nuovi (servono per il kit o l'accessibilità): da approvare

| Dove | IT | EN | Perché |
|---|---|---|---|
| `.ss-head` editor, titolo | Crea la tua classifica | Build your ranking | dallo specimen (D3) |
| `.ss-head` editor, descrizione | Scegli quante posizioni, carica le clip e monta la tua top in pochi secondi. | Pick how many spots, load your clips and build your top list in seconds. | dallo specimen (D3) |
| summary sezione export | Esporta | Export | dallo specimen (D5) |
| wordmark, aria-label | ScrollStudio, torna all'hub | ScrollStudio, back to the hub | dallo specimen |
| switch lingua, aria-label | Lingua | Language | come nello specimen; bottoni "IT" / "EN" |
| pannello / stage, aria-label | Impostazioni / Anteprima | Settings / Preview | dallo specimen |
| scrubber, aria-label | Avanzamento | Playback position | `role=slider`. Lo specimen usa "Posizione", che qui si confonde con le posizioni della classifica |
| play in riproduzione, aria-label | Metti in pausa | Pause | oggi il pulsante resta "Play preview" anche in pausa |
| colore per posizione, aria-label | Colore #N | Color #N | gli `input` oggi non hanno nome |
| copia riuscita, aria-label | Copiato | Copied | oggi il segnale è solo il glifo ✓ |
| link rimozione posizione | Rimuovi posizione | Remove rank | versione corta del title esistente (D16) |
| modale rimozione (se D7 = sì) | titolo "Rimuovere la posizione #N e la sua clip?", testo "Non si può annullare.", bottoni "Annulla" / "Rimuovi" | "Remove rank #N and its loaded clip?" · "This cannot be undone." · "Cancel" / "Remove" | sostituisce `confirm()` |
| footer | © 2026 | © 2026 | identità di famiglia |

## 7. Rischi

- **R1 · Font del contenuto.** "Togli i vecchi font" vale solo per l'interfaccia. Anton, Bangers, Bebas Neue, Luckiest Guy, Oswald e Montserrat restano caricati in `editor.html`, perché li usa il canvas (`renderer.js:13,136,148`).
- **R2 · Lingua e ordine degli script.** `i18n.js` (`defer`) parte dopo gli script dell'app. I testi dinamici partono in IT e si ridisegnano su `ss:lang`. Gli elementi scritti dal JS non hanno `data-en`. Chi non ha scelto una lingua vede l'italiano; la scelta è condivisa con l'hub (`scrollstudio-lang`).
- **R3 · Layout desktop.** Oggi editor e anteprima occupano esattamente lo schermo (100vh) e scorre solo la sidebar. Col kit scorre la pagina, l'anteprima resta ferma (sticky) e l'export finisce in fondo al pannello (D5).
- **R4 · Anteprima più piccola.** `.ss-frame` è al massimo 300px e si adatta all'altezza dello schermo: a 1366×768 viene circa 263×468, contro i circa 356×632 di oggi. È la regola del kit.
- **R5 · Shuffle e Ripristina.** Escono dall'intestazione della sezione: dei bottoni dentro un `<summary>` sono controlli annidati in un altro controllo, un problema di accessibilità.
- **R6 · Miniature.** Il canvas della miniatura passa a 54×96 (oggi 64×100, deformato dentro un riquadro 27×48).
- **R7 · Messaggi esterni.** Gli errori dei servizi esterni non si traducono. Anche un errore già mostrato resta nella lingua in cui è comparso finché non si ripete l'azione.
- **R8 · Select del numero di posizione.** È un `<select>` invisibile sopra il numero grande (N2). Funziona con mouse, tastiera e lettore di schermo. Se non ti convince, l'alternativa è un `.ss-select` piccolo nella seconda riga della scheda.
- **R9 · B e I.** Uso `.ss-segmented` come gruppo di due interruttori indipendenti, non come scelta esclusiva. L'aspetto è del kit, la semantica è `aria-pressed` su ciascuno.
- **R10 · Coerenza degli screenshot.** I "dopo" useranno gli stessi scenari aggiornati alle nuove classi. Gli stati `-sim` restano simulati anche nei "dopo".
- **R11 · Colore delle parole.** Sui chip il colore scelto non è più il colore del testo ma un pallino (N3): con il bianco di default, testo bianco su carta non si leggerebbe.

## 8. Domande

Per ognuna indico la mia raccomandazione: se va bene, basta "ok" sul numero.

- **D1 · Nome del prodotto.** L'interfaccia oggi dice "TopRankVids"; hub, specimen e repo dicono "TopFratmRanks". Uso TopFratmRanks ovunque (topbar, `<title>`, meta, esempio nel wizard)? *Consiglio: sì.*
- **D2 · Link del wordmark verso l'hub.** Che URL? Dal repo `KekkoCoppola/ScrollStudio` deduco `https://kekkocoppola.github.io/ScrollStudio/`. *Da confermare.*
- **D3 · Titolo della pagina editor.**
  - (a) Testi dello specimen ("Crea la tua classifica" + descrizione) e "Classifica: Top 5" come conteggio accanto a "Clip" nel summary. *Consigliata.*
  - (b) Nessun testo nuovo: titolo = "Classifica: Top 5".
  - In entrambi i casi il titolo della landing è il suo slogan attuale.
- **D4 · Ordine delle sezioni.**
  - (a) Come lo specimen: Clip, Titolo, Impostazioni, Pubblicazione, Esporta. *Consigliata.*
  - (b) Ordine attuale: Titolo, Impostazioni, Pubblicazione, Clip, Esporta.
- **D5 · Export.** Diventa l'ultima sezione del pannello, con titolo "Esporta" come nello specimen, e non è più fissa in fondo e sempre visibile. *Consiglio: sì.*
- **D6 · Percentuale grande nell'export** (`.ss-progress__value`). Oggi c'è solo barra + testo. Il valore è già calcolato e la ricetta del kit lo mostra. *Consiglio: sì.*
- **D7 · `confirm()` e `alert()` nativi.**
  - Confirm di rimozione posizione → `.ss-modal` con Annulla / Rimuovi.
  - Alert di accesso fallito → `.ss-note--error` nella sezione Pubblicazione.
  - Il flusso resta lo stesso, ma la conferma diventa asincrona. *Consiglio: sì.*
- **D8 · Accessibilità richiesta dal kit, oggi assente.**
  - Esc e focus intrappolato nelle modali.
  - Scrubber con `role=slider`, `aria-value*` e frecce ←/→ (±1 s), Home/Fine.
  - `aria-pressed` sui toggle.
  - È comportamento nuovo. *Consiglio: sì.*
- **D9 · Maiuscolo.** Il kit vieta il testo tutto maiuscolo. Riguarda il paragrafo legale (`terms.js:18`) e PUBLIC / UNLISTED / PRIVATE nella conferma. *Consiglio: minuscolo normale in IT ed EN.*
- **D10 · Lingua nella modale dei termini.** Alla prima visita la modale copre la topbar, quindi non si può cambiare lingua prima di accettare. Metto `.ss-lang` anche nella modale? Stesso componente, nessun testo nuovo. *Consiglio: sì.*
- **D11 · `HUB-DESIGN.md` mancante.** Lo copio dall'hub in `designScroll/design-kit/HUB-DESIGN.md`? *Consiglio: sì, in Fase 2.*
- **D12 · Script degli screenshot.** Oggi è nello scratchpad della sessione. Lo metto in `design/tools/` per i "dopo", per i prossimi giri e per Bouncical? *Consiglio: sì.*
- **D13 · Wizard YouTube in italiano.** Ho tradotto i nomi delle voci della Google Cloud Console come li mostra la console italiana ("Schermata consenso OAuth", "Credenziali", "Origini JavaScript autorizzate"…). Controlla che coincidano con quello che vedi tu, oppure lascio i nomi inglesi tra parentesi.
- **D14 · Testo legale.** La traduzione dei termini (§6.5) è mia: rileggila. Non sostituisce un parere legale.
- **D15 · Flussi non verificabili da me in Fase 4.**
  - **Import da link TikTok reale**: chiama tikwm.com, un servizio esterno. Mi dai un link da usare, o lo verifico solo con link non validi (senza rete)?
  - **Pubblicazione YouTube reale**: serve il tuo Client ID e il tuo account. La verifico solo con stati simulati.
- **D16 · Rimozioni.** 🗑 e ✕ diventano link di testo "Rimuovi clip · Rimuovi posizione", come vuole il kit per le azioni distruttive. In inglese "Remove rank" accorcia il title "Remove this rank entirely", che resta come tooltip. *Consiglio: sì.*

## 9. Dopo l'approvazione

- **Fase 2**: fondamenta + cornice. Screenshot affiancati a `hub-desktop.jpg` e `specimen-desktop.jpg`, poi STOP.
- **Fase 3**, un gruppo alla volta, con una riga di resoconto per ciascuno:
  1. campi
  2. bottoni e toggle
  3. lista clip (N2–N6)
  4. stage e timeline
  5. modali (N7–N14)
  6. export
  7. landing e termini
