# TopFratmRanks → kit ScrollStudio: cosa riportare nell'hub

Nato dal redesign di TopFratmRanks (branch `redesign/scrollstudio`). Da portare in una chat su ScrollStudio: aggiungere al kit le ricette (`family.css`), le righe in `FAMILY-DESIGN.md` e un esempio nello `specimen.html`. Il CSS completo è in fondo a questo file, copiato dal blocco "TopFratmRanks additions" di `css/family.css`.

## Componenti nuovi

| ID | Classe | Perché serviva | Ricetta, in breve |
|---|---|---|---|
| N1 | `.ss-segmented--grid` | scegliere uno fra 10 (posizioni 1–10); il segmented regge 2–4 opzioni in riga | il segmented diventa una griglia di 5 colonne; contenitore `--radius` (una pillola su due righe non regge); opzioni alte `--control-h`, numeri `--fs-md` 300 |
| N2 | `.ss-clip--slot` (+ elementi, `.ss-clip--empty`, `.is-over`) | la lista clip dell'app ha più comandi della `.ss-clip` del kit: menu della posizione, etichetta, rimozioni, import da link, upload | griglia `auto auto 1fr auto`; il numero grande ospita un `<select>` trasparente (si vede "3", si apre "Posizione #1…#N", anello di focus sul numero con `:has(:focus-visible)`); seconda riga con campo + icone bare; scheda vuota compatta (numero · link · ×, poi *Importa* / *Carica file*); file trascinato sopra = luce di `.ss-drop:hover` |
| N3 | `.ss-words` + `.ss-word` | mostrare il colore scelto per ogni parola del titolo; il bianco di default sparirebbe se fosse il colore del testo | pillola `.ss-btn--sm` con un pallino 12px `background: var(--c)` e anello carta |
| N4 | `.ss-swatch-list` | un colore per posizione con la sua etichetta | flex-wrap gap `--s-3`; voce = swatch sopra, `--fs-xs` sotto |
| N6 | `.ss-progress--indeterminate` | import senza percentuale nota | riempimento largo un terzo, `ss-sweep` in `--dur-glide` `--ease-glide` alternato; con movimento ridotto pieno e fermo (la regola globale a 1ms farebbe sfarfallare un'animazione infinita) |
| N7 | `.ss-summary` | riepilogo chiave/valore in modale | `dl` a griglia `auto 1fr`, `dt` come `.ss-label`, `dd` `--ink-900` |
| N8 | `.ss-howto` | istruzioni numerate in verticale (wizard) | contatore `--fs-md` 300 come `.ss-steps`, contenuto in colonna 2 |
| N9 | `.ss-link--inline` | link dentro un paragrafo: `.ss-link` (ink-700, nessuna linea a riposo) sparisce nel testo ink-700 | `--ink-900` + sottolineatura `--track` sempre visibile, `currentColor` in hover, icona ↗ inline |
| N10 | `.ss-code`, `--block` | origini, nomi di file, suffissi | come `.ss-badge` ma `--radius-sm` (va a capo), Urbanist, `--fs-xs`; blocco copiabile con `user-select: all` |
| N11 | `.ss-modal--scroll` | modali lunghe su schermi bassi | `max-height: calc(100svh - 2 * var(--gutter))`, scorre dentro; con una `.ss-scrollbox` scorre solo quella |
| N12 | `.ss-scrollbox` | testo lungo (termini) | incassato come `.ss-textarea`, `flex: 1`, scorre da solo |
| N13 | `.ss-account` | canale collegato + disconnetti | avatar 22px con anello `--hairline` come `.ss-topbar__product`, nome con ellissi, `.ss-icon-btn--bare` |
| N14 | `.ss-check`, `.ss-check-label` | casella "accetto" (dichiarazione, non impostazione → non `.ss-switch`) | quadrato `--s-4`, `--radius-sm`, `--field` con anello `--track`; spuntato `--ink-900` con spunta carta (data-uri come il chevron di `.ss-select`) |

## Stati e casi che il kit non copre (N15)

| Caso | Proposta |
|---|---|
| App senza voci di menu | `.ss-topbar:not(:has(.ss-topbar__nav)) .ss-lang { margin-left: auto }`; su telefono, con il kit 1.1, `row-gap: var(--s-1)` (la seconda riga è lo switch del tema; prima era `padding-bottom: var(--s-6)`, se no il titolo finiva sotto il logo) |
| `.ss-swatch` e `.ss-switch` non hanno hover | swatch: anello `--ink-500`; switch: manopola con `--shadow-raise-hover` |
| `.ss-icon-btn` non ha stato disattivo | come `.ss-btn:disabled` |
| Timeline senza segmenti | lo scrub è alto 14px: banda invisibile di `--s-2` sopra e sotto (`.ss-timeline__lanes::before`) per arrivare a 28px; `cursor: grabbing` durante il trascinamento |
| Timeline senza controllo velocità | `.ss-time:last-child { margin-left: auto }` manda il tempo all'estremo destro; nello specimen sta accanto al Play perché dopo c'è la velocità → quando segue subito il Play, `margin-left: 0` |
| Segmented con icone (B/I) | `.ss-segmented__option` in `inline-flex` centrato |
| Evidenza nel testo | `.ss-hint b`, `.ss-note b`, `.ss-modal__body b/em`: `--ink-900`, peso e stile normali |
| Badge con icona | `.ss-badge:has(.ss-icon) { gap: var(--s-1) }` |
| `hidden` sui componenti | `.ss-note` è `display: flex` e vince sull'attributo `hidden`: nel kit serve `[hidden] { display: none !important }` (l'app l'ha in `style.css`) |
| **N17** Editor con l'anteprima al centro (sostituisce N16) | nel kit l'anteprima è al massimo 300px e ogni misura è in px fissi: su un 2560×1440 o un ultrawide anteprima e comandi restano minuscoli in mezzo alla parete. Ora l'anteprima prende l'altezza della finestra (`--stage-chrome` = quello che la divide con la cornice) e la timeline è larga quanto la cornice. Telefono: titolo, anteprima che riempie la prima schermata, poi i fogli; da 700px i due fogli affiancati sotto; orizzontale da 861px: titolo + foglio "make" (Clip, Titolo) \| stage; da 1200px: "make" \| stage \| foglio "finish" (Impostazioni, Pubblicazione, Esporta). Su schermi orizzontali grandi topbar, titolo, fogli, timeline, modali e footer sono ingranditi con `zoom: var(--k)`; lo stage no, perché `zoom` scala anche le unità viewport. Proposta per il kit: lo stesso principio della `u` dell'hub, applicato alle app |

## Token aggiunti

| Token | Valore | Motivo |
|---|---|---|
| `--panel-w` | 340px | un foglio di `.ss-editor` (×`--k`), usato anche per il foglio della landing; oggi nel kit è un numero dentro `minmax(280px, 340px)` |
| `--k` | 1 → 2.25 | scala dei comandi (N17): `min(larghezza/1440, altezza/900)` arrotondato all'ottavo, solo su schermi orizzontali; 1 su telefoni e tablet |

## Scelte di TopFratmRanks da valutare per tutta la famiglia

Decise dall'utente durante la Fase 3, perché i bottoni non si leggevano:

1. **Bottoni secondari e a icona in inchiostro** (`--ink-900`, testo `--on-ink`, hover `--ink-700`), opzione scelta del segmented uguale. Sulla carta del pannello i bottoni di carta si distinguevano solo per l'ombra.
2. **Disattivato leggibile**: fondo `--field`, testo `--ink-500` invece dell'opacità 0,4 (il corallo al 40% diventa rosa illeggibile).
3. **Meno testo**: le posizioni vuote non ripetono "Trascina qui una clip…" / "oppure" / formati; i formati vanno nel tooltip, il file si trascina su tutta la scheda.

Se l'hub li adotta, vanno spostati da "scelte dell'app" alle ricette di `.ss-btn`, `.ss-icon-btn`, `.ss-segmented__option`.

## Note sul kit emerse lavorando

- **`i18n.js` e i nodi creati dopo l'avvio.** I bottoni `[data-lang]` vengono collegati solo al caricamento: uno switch aggiunto dopo (la modale dei termini) deve chiamare `window.ssSetLanguage` e scrivere `scrollstudio-lang` da solo. Proposta: esporre una funzione per collegare nuovi switch e per salvare la scelta.
- **`hidden` sugli SVG.** `svg.hidden = true` non fa nulla (la proprietà esiste solo sugli elementi HTML): per alternare icone usare `toggleAttribute('hidden')`. Utile come nota nello specimen.
- **Ordine degli script.** Con `i18n.js` in `defer`, gli script dell'app partono prima: i testi creati dal JS devono partire in italiano e ridisegnarsi su `ss:lang`.
- **Testo minimo.** `--fs-xs` (11px) è sotto la soglia di 12px segnalata dagli strumenti di audit per il testo corrente; nel kit è riservato a etichette, meta e badge, ma conviene dirlo esplicitamente in `FAMILY-DESIGN.md`.
- **`i18n.js`: il primo `ss:lang` arriva prima di `window.ssLang`.** Con l'inglese salvato, `setLanguage('en')` parte (ed emette `ss:lang`) prima della riga `window.ssLang = () => lang`: chi ridisegna su `ss:lang` leggendo `ssLang()` trova ancora l'italiano, e i testi creati dal JS restano in italiano finché non si tocca lo switch. TopFratmRanks lo aggira in `js/strings.js` leggendo la lingua da `event.detail.lang`. Correzione nel kit: definire `window.ssLang` e `window.ssSetLanguage` **prima** di `if (saved === 'en') setLanguage('en')`.
- **Versione del kit e `grep -m1 "kit "`.** In TopFratmRanks con il kit 1.0 il comando di `THEME-ADOPTION.md` (punto 0) trovava il commento "not in the hub kit yet" delle aggiunte e sembrava una versione. Proposta: `grep -m1 "kit [0-9]" css/tokens.css`.

## Tema scuro (kit 1.1, adottato il 2026-10-18)

Seguito `THEME-ADOPTION.md` senza deviazioni: kit 1.1 copiato con le aggiunte in coda (parte del kit identica al kit), `js/theme.js` sincrono prima del primo foglio di stile, switch `.ss-theme` dopo `.ss-lang` e doppio wordmark (`.ss-only-light` / `.ss-only-dark`) in topbar e footer di `index.html` ed `editor.html`, appendice TopFratmRanks applicata. Nessun token nuovo dell'app; nella modale dei termini niente switch del tema (proposta della guida).

| Regola delle aggiunte | Prima | Dopo | Chiaro |
|---|---|---|---|
| N15 topbar senza nav, telefono | `padding-bottom: var(--s-6)` | `row-gap: var(--s-1)` (la seconda riga è lo switch, 4 + 28 = 32px) | titolo della pagina allo stesso posto |
| bottoni d'inchiostro, opzione scelta del segmented | `color: var(--paper)` | `color: var(--on-ink)` | `--on-ink` = `--paper` |
| N3 anello del pallino della parola | `var(--paper)` | `var(--on-ink)` | identico |
| N14 spunta della casella | data-URI con `%23FBFBFA` | `var(--check-mark)` | stesso data-URI |

Contrasti delle coppie usate dalle aggiunte (WCAG 2.x):

| Coppia | Chiaro | Scuro | Soglia |
|---|---|---|---|
| `--on-ink` su `--ink-900` (testo dei bottoni, opzione scelta, spunta) | 13,65 | 10,22 | 4,5 |
| `--on-ink` su `--ink-700` (hover dei bottoni) | 8,80 | 6,91 | 4,5 |
| `--ink-500` su `--field` (bottone disattivato) | 4,71 | 5,66 | 4,5 |
| `--ink-500` su `--paper` (hover dello swatch) | 5,52 | 4,71 | 3 |
| `--ink-700` su `--paper` (scheda vuota con un file sopra) | 8,80 | 6,91 | 3 |
| `--ink-500` su `--wall-top` / `--wall-bottom` (switch tema a riposo) | 4,71 / 3,94 | 5,36 / 6,18 | 3 |

**Bug nel kit 1.1: `assets/scrollstudio-wordmark-light.svg` non si apre.** Il commento in testa contiene `--ink-700`, e in XML `--` dentro un commento è un errore fatale: il browser scarta l'immagine (`naturalWidth` 0) e in tema scuro si vede il logo rotto. Stesso file nell'hub in `design-kit/assets/` e in `assets/logos/`. In TopFratmRanks la copia in `assets/` è corretta (`ink-700 token` nel commento); la copia del kit in `designScroll/` è lasciata com'è finché non si corregge l'hub.

Colori scritti a mano rimasti: ombre `rgb(var(--shadow-ink) / α)`; il ripiego `var(--c, var(--paper))` del pallino (il JS imposta sempre `--c`); nel JS solo contenuto (colori delle parole e dei numeri, canvas, nero dietro le miniature) e le bandiere.

## CSS (blocco "TopFratmRanks additions" di `css/family.css`)

```css
/* ==========================================================================
   TopFratmRanks additions (not in the hub kit yet)
   Derived with the "Componenti nuovi" procedure of FAMILY-DESIGN.md, tokens only.
   Listed in design/KIT-FEEDBACK.md to be brought back into the hub kit.
   ========================================================================== */

/* N15 Topbar without nav: an app with no menu still keeps the language switch on the right
   (the theme switch follows it, so both sit on the right together) */

.ss-topbar:not(:has(.ss-topbar__nav)) .ss-lang {
  margin-left: auto;
}

/* On phones the theme switch is the second row (kit 1.1): 4px row gap + the 28px switch
   give the same 32px of air the empty row used to need, so the page title doesn't move */
@media (max-width: 640px) {
  .ss-topbar:not(:has(.ss-topbar__nav)) {
    row-gap: var(--s-1);
  }
}

/* N15 Missing states: the kit gives no hover to the swatch and the switch.
   Hover = darker ink / one step up the shadow ladder, like every other control */

.ss-swatch {
  transition: box-shadow var(--dur-hover) ease-out;
}

.ss-swatch:hover {
  box-shadow:
    0 0 0 1px var(--ink-500),
    0 1px 3px rgb(var(--shadow-ink) / 0.12);
}

.ss-switch::after {
  transition:
    transform var(--dur-open) var(--ease-open),
    box-shadow var(--dur-hover) ease-out;
}

.ss-switch:hover::after {
  box-shadow: var(--shadow-raise-hover);
}

/* Icon buttons get the same disabled state as .ss-btn (Play with no clips loaded) */
.ss-icon-btn:disabled {
  opacity: 0.4;
  box-shadow: none;
  transform: none;
  pointer-events: none;
}

/* Timeline without clip segments: the lanes are only the 14px scrub, so an invisible
   band of --s-2 above and below makes the pointer target ≥ 28px. While dragging: grabbing */
.ss-timeline__lanes {
  cursor: pointer;
  touch-action: none;
}

.ss-timeline__lanes::before {
  content: "";
  position: absolute;
  inset: calc(-1 * var(--s-2)) 0;
}

.ss-timeline__lanes.scrubbing {
  cursor: grabbing;
}

/* No speed control after it: the time stays next to Play, as in the specimen */
.ss-timeline__bar > .ss-icon-btn + .ss-time:last-child {
  margin-left: 0;
}

/* N17 Preview-first editor (asked by the user, 2026-10-18; replaces N16). The preview is what
   you look at, so it takes the window's height and the rest sits next to it, at its scale:
   - phone: title, the preview filling the rest of the first screen, then the two sheets
   - from 700px (and portrait tablets): the same, with the two sheets side by side
   - landscape from 861px: title + sheet "make" (clips, video title) | stage
   - landscape from 1200px: title + sheet "make" | stage | sheet "finish" (settings, publishing, export)
   On landscape screens every control is zoomed by --k (tokens.css). The stage is not: its frame
   is sized on 100svh, and zoom scales viewport units too. --stage-chrome is what shares the
   window's height with the frame: topbar, title, gaps, timeline and a margin under it */

.ss-editor {
  --stage-chrome: 288px;
  --frame-w: min(100%, calc((100svh - var(--stage-chrome)) * 9 / 16));
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: "head" "stage" "make" "finish";
  gap: var(--s-5);
}

.ss-editor > .ss-head {
  grid-area: head;
  padding: var(--s-2) 0 0;
}

.ss-editor > .ss-stage {
  grid-area: stage;
  position: relative;
  top: auto;
}

.ss-editor__make {
  grid-area: make;
}

.ss-editor__finish {
  grid-area: finish;
}

/* The light behind the stage stays behind the sheets next to it */
.ss-editor > .ss-panel {
  position: relative;
  z-index: 1;
}

/* The timeline is as wide as the frame it plays */
.ss-editor .ss-frame,
.ss-editor .ss-timeline {
  width: var(--frame-w);
}

@media (min-width: 700px) {
  .ss-editor {
    --stage-chrome: 278px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-areas: "head head" "stage stage" "make finish";
  }
}

@media (orientation: landscape) and (min-width: 861px) {
  .ss-editor {
    --stage-chrome: calc(184px * var(--k));
    --frame-w: 100%; /* the stage column is already the frame's width */
    grid-template-columns:
      calc(var(--panel-w) * var(--k))
      minmax(0, calc((100svh - var(--stage-chrome)) * 9 / 16));
    grid-template-rows: auto auto auto 1fr;
    grid-template-areas: "head stage" "make stage" "finish stage" ". stage";
    justify-content: center;
    gap: calc(var(--s-5) * var(--k)) calc(var(--s-6) * var(--k));
    padding-top: calc(var(--s-2) * var(--k));
    padding-bottom: calc(var(--s-7) * var(--k));
  }

  .ss-editor > .ss-head {
    align-items: flex-start;
    padding: 0;
    text-align: left;
  }

  .ss-editor > .ss-stage {
    position: sticky;
    top: calc(var(--s-3) * var(--k));
    gap: calc(var(--s-5) * var(--k));
  }

  .ss-editor .ss-timeline {
    max-width: none;
  }

  .ss-topbar,
  .ss-head,
  .ss-panel,
  .ss-timeline,
  .ss-modal,
  .ss-footer {
    zoom: var(--k);
  }

  /* Inside a zoomed box the gutter (px and vw) is zoomed too: divided back, edges stay aligned */
  .ss-topbar,
  .ss-head,
  .ss-footer {
    padding-inline: calc(var(--gutter) / var(--k));
  }

  .ss-modal--scroll {
    max-height: calc((100svh - 2 * var(--gutter)) / var(--k));
  }
}

@media (orientation: landscape) and (min-width: 1200px) {
  .ss-editor {
    grid-template-columns:
      calc(var(--panel-w) * var(--k))
      minmax(0, calc((100svh - var(--stage-chrome)) * 9 / 16))
      calc(var(--panel-w) * var(--k));
    grid-template-rows: auto auto 1fr;
    grid-template-areas: "head stage finish" "make stage finish" ". stage finish";
  }
}

/* App choice (asked by the user, 2026-10-18; not in the hub kit): every button except the
   coral main action is ink with on-ink text, for contrast on paper. Same for the chosen
   segmented option. Hover goes one ink step lighter. Bare icon buttons stay bare */

.ss-btn:not(.ss-btn--primary),
.ss-icon-btn:not(.ss-icon-btn--bare):not(.ss-icon-btn--coral) {
  color: var(--on-ink);
  background: var(--ink-900);
  transition:
    transform var(--dur-hover) ease-out,
    box-shadow var(--dur-hover) ease-out,
    background-color var(--dur-hover) ease-out;
}

.ss-btn:not(.ss-btn--primary):hover,
.ss-icon-btn:not(.ss-icon-btn--bare):not(.ss-icon-btn--coral):hover {
  background: var(--ink-700);
}

.ss-segmented__option[aria-pressed="true"] {
  color: var(--on-ink);
  background: var(--ink-900);
}

/* Segmented options can hold an icon instead of a word (bold / italic) */

.ss-segmented__option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* N3 Word chip: a word of the user's title with the colour it gets in the video.
   A paper pill (.ss-btn--sm) led by a swatch dot: the colour is content, the word stays ink,
   so a white word still reads on paper. --c is set from JS */

.ss-words {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
}

.ss-word::before {
  content: "";
  width: 12px;
  height: 12px;
  flex: none;
  background: var(--c, var(--paper));
  border-radius: 50%;
  box-shadow: 0 0 0 1px var(--on-ink); /* ring in the on-ink colour: a dark word colour still shows on the ink chip */
}

/* N13 Account: the connected YouTube channel, avatar and name like the topbar product,
   with a bare close button to disconnect */

.ss-account {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  min-width: 0;
}

.ss-account__avatar {
  width: 22px;
  height: 22px;
  flex: none;
  border-radius: 50%;
  box-shadow: 0 0 0 1px var(--hairline);
}

.ss-account__name {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--ink-900);
}

/* Emphasis inside hints, notes and modal text: ink, never bold or italic */

.ss-hint b,
.ss-note b,
.ss-modal__body b,
.ss-modal__body em {
  font-weight: inherit;
  font-style: normal;
  color: var(--ink-900);
}

/* N7 Summary: key/value pairs (dl) in a modal. From .ss-row + .ss-label */

.ss-summary {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: baseline;
  gap: var(--s-2) var(--s-4);
  margin: 0;
}

.ss-summary dt {
  font-size: var(--fs-xs);
  letter-spacing: 0.02em;
  color: var(--ink-700);
}

.ss-summary dd {
  margin: 0;
  color: var(--ink-900);
  overflow-wrap: anywhere;
}

/* N8 How-to list: numbered instructions, light numbers like .ss-steps, stacked */

.ss-howto {
  display: grid;
  gap: var(--s-4);
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: ss-howto;
}

.ss-howto > li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: baseline;
  gap: var(--s-2) var(--s-3);
  counter-increment: ss-howto;
}

.ss-howto > li::before {
  content: counter(ss-howto);
  font-size: var(--fs-md);
  font-weight: var(--fw-light);
  line-height: var(--lh-tight);
  font-variant-numeric: tabular-nums;
  color: var(--ink-900);
}

.ss-howto > li > * {
  grid-column: 2;
}

/* N9 Inline link: a link inside running text. .ss-link is ink-700 with no line at rest,
   which would vanish in ink-700 text, so this one is ink-900 with a track-coloured line */

.ss-link--inline {
  padding: 0;
  color: var(--ink-900);
  text-decoration: underline;
  text-decoration-color: var(--track);
  text-underline-offset: var(--s-1);
  transition: text-decoration-color var(--dur-hover) ease-out;
}

.ss-link--inline::after {
  content: none;
}

.ss-link--inline:hover {
  text-decoration-color: currentColor;
}

.ss-link--inline .ss-icon {
  display: inline-block;
  margin-left: var(--s-1);
  vertical-align: text-bottom;
}

/* N10 Code: origins, file names, suffixes. A sunk field like .ss-badge, square-ish
   because it can wrap; Urbanist like everything else */

.ss-code {
  padding: 0 var(--s-1);
  font: inherit;
  font-size: var(--fs-xs);
  font-variant-numeric: tabular-nums;
  color: var(--ink-900);
  background: var(--field);
  border-radius: var(--radius-sm);
  overflow-wrap: anywhere;
}

.ss-code--block {
  display: block;
  padding: var(--s-2) var(--s-3);
  border-radius: var(--radius);
  user-select: all;
}

/* N11 Long modal: fits the wall and scrolls inside. With a .ss-scrollbox only that box scrolls */

.ss-modal--scroll {
  max-height: calc(100svh - 2 * var(--gutter));
  overflow-y: auto;
  overscroll-behavior: contain;
}

.ss-modal--scroll:has(.ss-scrollbox) {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ss-modal--scroll:has(.ss-scrollbox) .ss-modal__body {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
}

/* Badges can lead with an icon (play position) */

.ss-badge:has(.ss-icon) {
  gap: var(--s-1);
}

/* N2 Rank card: .ss-clip extended for the editor's ranks.
   Row 1 = the .ss-clip of the kit (big rank number, 9:16 thumb, name + duration, handle);
   row 2 (.ss-clip__body) = label field and remove links, aligned under the name.
   Empty ranks (.ss-clip--empty) show the rank title, the link import row and the drop zone */

.ss-clip--slot {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr) auto;
  align-items: center;
  column-gap: var(--s-3);
  row-gap: var(--s-2);
  padding: var(--s-2);
}

.ss-clip--slot[draggable="true"] {
  cursor: grab;
}

.ss-clip--slot[draggable="true"]:active {
  cursor: grabbing;
}

.ss-clip--slot .ss-clip__thumb,
.ss-clip--slot .ss-clip__meta {
  cursor: pointer;
}

/* The big number is also the rank menu: a native <select> laid over it */
.ss-clip--slot .ss-clip__rank {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--s-1);
  width: auto;
  border-radius: var(--radius-sm);
}

.ss-clip__rank-num {
  min-width: 2ch;
  text-align: center;
}

.ss-clip__rank-chev {
  color: var(--ink-500);
  transition: color var(--dur-hover) ease-out;
}

.ss-clip__rank > select {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  font: inherit;
  font-size: var(--fs-sm);
  opacity: 0;
  cursor: pointer;
}

.ss-clip__rank:hover .ss-clip__rank-chev {
  color: var(--ink-900);
}

.ss-clip__rank:has(select:focus-visible) {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}

.ss-clip__dur .ss-badge {
  margin-left: var(--s-2);
}

.ss-clip__body {
  grid-column: 3 / -1;
  display: grid;
  gap: var(--s-2);
  min-width: 0;
}

/* Loaded card, row 2: the label field with the remove icons (bare, tooltip) */
.ss-clip__label-row {
  display: flex;
  align-items: center;
  gap: var(--s-1);
}

.ss-clip__label-row > .ss-input {
  flex: 1;
  min-width: 0;
}

/* Empty rank, compact: number | link field + Import | remove; row 2: Upload file */
.ss-clip--empty {
  grid-template-columns: auto minmax(0, 1fr) auto;
}

.ss-clip--empty .ss-clip__rank {
  color: var(--ink-500);
}

.ss-clip--empty .ss-clip__rank-chev {
  visibility: hidden; /* keeps the number column as wide as on loaded cards */
}

.ss-clip--empty .ss-clip__body {
  grid-column: 2 / -1;
}

.ss-clip__link {
  display: flex;
  gap: var(--s-2);
  min-width: 0;
}

.ss-clip__link > .ss-input {
  flex: 1;
  min-width: 0;
}

.ss-clip__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
}

/* the label row starts under the thumb, so the field has room for its placeholder */
.ss-clip--slot:not(.ss-clip--empty) .ss-clip__body {
  grid-column: 2 / -1;
}

.ss-clip__status {
  min-width: 0;
  color: var(--ink-900);
}

/* A file dragged over an empty card: the light of .ss-drop:hover (wall glow + ink line) */
.ss-clip--empty.is-over {
  background: var(--wall-glow);
  box-shadow: inset 0 0 0 1px var(--ink-700);
}

/* N6 Indeterminate progress: a third of the track glides back and forth (link import) */

.ss-progress--indeterminate .ss-progress__fill {
  width: calc(100% / 3);
  animation: ss-sweep var(--dur-glide) var(--ease-glide) infinite alternate;
}

@keyframes ss-sweep {
  to { transform: translateX(200%); }
}

@media (prefers-reduced-motion: reduce) {
  .ss-progress--indeterminate .ss-progress__fill {
    width: 100%;
    animation: none;
  }
}

/* N4 Swatch list: one colour per item, its label underneath (colour per rank).
   From .ss-swatch + .ss-label */

.ss-swatch-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-3);
}

.ss-swatch-list__item {
  display: grid;
  justify-items: center;
  gap: var(--s-1);
  font-size: var(--fs-xs);
  font-variant-numeric: tabular-nums;
  color: var(--ink-700);
  cursor: pointer;
}

/* N1 Segmented grid: a choice among many (1–10 ranks on the landing).
   .ss-segmented laid out as a grid; two rows can't be a pill, so the sunk field takes
   --radius (a surface); numbers in --fs-md light */

.ss-segmented--grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  border-radius: var(--radius);
}

.ss-segmented--grid .ss-segmented__option {
  height: var(--control-h);
  font-size: var(--fs-md);
  font-weight: var(--fw-light);
  font-variant-numeric: tabular-nums;
}

/* N12 Scrollbox: long text sunk into the paper (terms), like .ss-textarea.
   Inside .ss-modal--scroll it takes the free height and scrolls on its own */

.ss-scrollbox {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: var(--s-3) var(--s-4);
  font-size: var(--fs-xs);
  color: var(--ink-700);
  background: var(--field);
  border-radius: var(--radius);
  overscroll-behavior: contain;
}

.ss-scrollbox h3 {
  margin: var(--s-4) 0 var(--s-1);
  font-size: var(--fs-sm);
  font-weight: var(--fw-regular);
  line-height: var(--lh-text);
  color: var(--ink-900);
}

.ss-scrollbox h3:first-child {
  margin-top: 0;
}

.ss-scrollbox p + p {
  margin-top: var(--s-2);
}

.ss-scrollbox b {
  font-weight: inherit;
  color: var(--ink-900);
}

/* N14 Check: a statement to accept (not a setting, so not .ss-switch).
   Sunk square on --field, ink-900 with a paper tick when checked */

.ss-check-label {
  display: flex;
  align-items: flex-start;
  gap: var(--s-2);
  color: var(--ink-700);
  cursor: pointer;
}

.ss-check {
  width: var(--s-4);
  height: var(--s-4);
  flex: none;
  margin: calc((var(--lh-text) * 1em - var(--s-4)) / 2) 0 0;
  background: var(--field) center / 12px no-repeat;
  border-radius: var(--radius-sm);
  box-shadow: inset 0 0 0 1px var(--track);
  cursor: pointer;
  transition:
    background-color var(--dur-hover) ease-out,
    box-shadow var(--dur-hover) ease-out;
  -webkit-appearance: none;
  appearance: none;
}

.ss-check:hover {
  box-shadow: inset 0 0 0 1px var(--ink-700);
}

.ss-check:checked {
  background-color: var(--ink-900);
  background-image: var(--check-mark);
  box-shadow: none;
}

.ss-check:focus-visible {
  outline-offset: 2px;
}

/* App choice (asked by the user, 2026-10-18): disabled buttons stay readable.
   The kit fades them to 40%, which leaves pale pink / grey text nobody can read;
   here they sink into the paper (--field) with --ink-500 text (4.7:1 light, 5.7:1 dark) */

.ss-btn:disabled,
.ss-btn[aria-disabled="true"],
.ss-icon-btn:not(.ss-icon-btn--bare):disabled {
  opacity: 1;
  color: var(--ink-500);
  background: var(--field);
}
```

In `css/tokens.css`, in coda:

```css
/* ==========================================================================
   TopFratmRanks additions (not in the hub kit yet, see design/KIT-FEEDBACK.md)
   ========================================================================== */

:root {
  --panel-w: 340px; /* one settings sheet: a column of .ss-editor in family.css; the landing uses the same sheet */
  --k: 1;           /* N17 control scale: the kit's px are drawn for a 1440×900 window */
}

/* N17 On big landscape screens the preview grows with the window, so the controls grow with it:
   --k = min(width / 1440, height / 900), rounded down to an eighth, from 1 to 2.25
   (the hub does the same with its "u"). Phones and tablets keep the kit's px */
@media (orientation: landscape) and (min-width: 1620px) and (min-height: 1013px) { :root { --k: 1.125; } }
@media (orientation: landscape) and (min-width: 1800px) and (min-height: 1125px) { :root { --k: 1.25; } }
@media (orientation: landscape) and (min-width: 1980px) and (min-height: 1238px) { :root { --k: 1.375; } }
@media (orientation: landscape) and (min-width: 2160px) and (min-height: 1350px) { :root { --k: 1.5; } }
@media (orientation: landscape) and (min-width: 2340px) and (min-height: 1463px) { :root { --k: 1.625; } }
@media (orientation: landscape) and (min-width: 2520px) and (min-height: 1575px) { :root { --k: 1.75; } }
@media (orientation: landscape) and (min-width: 2880px) and (min-height: 1800px) { :root { --k: 2; } }
@media (orientation: landscape) and (min-width: 3240px) and (min-height: 2025px) { :root { --k: 2.25; } }
```
