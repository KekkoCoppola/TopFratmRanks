# TopFratmRanks — Design system

App figlia di **ScrollStudio**: un'altra stanza della stessa casa. Parete, topbar, tipografia, ombre e componenti vengono dal kit di famiglia (`designScroll/design-kit/`, regole in `FAMILY-DESIGN.md`, origine in `HUB-DESIGN.md`). Qui ci sono le scelte e le aggiunte di questa app.

File di stile, nell'ordine di caricamento:

| File | Cosa |
|---|---|
| `css/tokens.css` | token del kit, invariati; in coda i token aggiunti dall'app |
| `css/family.css` | componenti del kit, invariati; in coda i componenti nuovi dell'app (prefisso `ss-`) e le scelte dell'app |
| `css/style.css` | solo colla di pagina (landing, righe di campi, wizard), con soli token |

Il kit copiato è il **kit 1.1** (temi): `js/theme.js` del kit va nel `<head>` prima di ogni foglio di stile.

## Design language

- **Galleria in una stanza.** La pagina è la parete grigio chiaro dell'hub; l'anteprima del video è un quadro 9:16 appeso alla parete (`.ss-stage` + `.ss-frame`), con la luce chiara dietro. I comandi stanno su un foglio di carta (`.ss-panel`).
- **Silenzio cromatico.** L'interfaccia è inchiostro su carta. Il colore arriva dal contenuto (video, miniature, colori scelti per titolo e numeri) e dal **corallo**, una sola azione per vista: *Genera il video classifica*, *Inizia a creare*, la conferma nelle modali.
- **Contrasto dei comandi (scelta dell'app).** Tutti gli altri bottoni sono inchiostro (`--ink-900`) con testo `--on-ink`: si leggono bene sulla carta del pannello, e al buio diventano pillole chiare con testo scuro. I bottoni disattivati affondano nella carta (`--field`, testo `--ink-500`) invece di sbiadire.
- **Testo sottile e piccolo.** Urbanist 300 per titoli e numeri, 400 per il resto; mai grassetto, l'evidenza è inchiostro più scuro.
- **Poche parole.** Ogni scheda dice solo quello che serve; i dettagli (formati accettati, cosa fa un bottone) stanno nei tooltip.

## Cornice

| Elemento | Ricetta | Note |
|---|---|---|
| Parete | `body` di `family.css` | il `body` è una colonna: sulle pagine corte il footer resta in fondo alla parete |
| Topbar | `.ss-topbar`: wordmark ScrollStudio (doppio, `.ss-only-light` / `.ss-only-dark`) → `https://kekkocoppola.github.io/ScrollStudio/`, barra obliqua, avatar + **TopFratmRanks** → `index.html`, switch lingua, switch tema `.ss-theme` | niente nav: i due switch vanno a destra (N15); su telefono lo switch tema è la seconda riga, a destra |
| Titolo pagina | `.ss-head` | landing: "Crea video classifica TikTok in pochi secondi"; editor: "Crea la tua classifica" + descrizione |
| Editor | `.ss-editor` = `.ss-panel` + `.ss-stage` | sotto 860px lo stage va sopra il pannello |
| Footer | `.ss-footer` | wordmark (doppio, come in topbar) + © 2026 |
| Favicon | `assets/topfratmranks-logo.svg` | lo stesso avatar della card dell'hub |

## Schermate

| Schermata | Struttura |
|---|---|
| Landing (`index.html`) | titolo, foglio largo come il pannello editor (`--panel-w`) con la domanda, la griglia 1–10 (N1) e *Inizia a creare* |
| Editor (`editor.html`) | pannello con le sezioni richiudibili (`details.ss-section`) **Clip · Titolo del video · Impostazioni generali · Pubblicazione · Esporta**; stage con anteprima e timeline |
| Modali | Pubblica su YouTube (4 passi), Configurazione YouTube, conferma rimozione posizione, Termini e condizioni (prima visita) |

## Tipografia

Urbanist 300/400 da Google Fonts. I font **del contenuto** (Anton, Bangers, Bebas Neue, Luckiest Guy, Oswald, Montserrat) restano caricati in `editor.html`: li usa il canvas e il video esportato, non l'interfaccia.

| Ruolo | Taglia | Peso | Inchiostro |
|---|---|---|---|
| Titolo pagina | `--fs-xl` | 300 | 900 |
| Titolo modale, numero di posizione, percentuale export | `--fs-lg` | 300 | 900 |
| Titolo sezione, domanda della landing, numeri 1–10 | `--fs-md` | 300 | 900 / 700 |
| Testo, comandi, nomi file | `--fs-sm` | 400 | 700 / 900 |
| Etichette, durate, badge, tooltip, testi legali | `--fs-xs` | 400 | 700 / 500 |

## Componenti

Ricette del kit usate così come sono: `.ss-btn` (+ `--primary`, `--sm`, `--block`), `.ss-icon-btn` (+ `--bare`), `.ss-link`, `.ss-field`, `.ss-label`, `.ss-input` (+ `--num`), `.ss-select`, `.ss-textarea`, `.ss-hint`, `.ss-swatch`, `.ss-row`, `.ss-switch`, `.ss-segmented`, `.ss-panel`, `.ss-section`, `.ss-editor`, `.ss-stage`, `.ss-frame`, `.ss-timeline` (senza segmenti né velocità), `.ss-list`, `.ss-clip`, `.ss-progress`, `.ss-badge`, `.ss-note`, `.ss-overlay`, `.ss-modal`, `.ss-lang`, `.ss-theme`, `.ss-only-light` / `.ss-only-dark`, `.ss-topbar`, `.ss-head`, `.ss-footer`.

### Componenti nuovi (non ancora nel kit)

Ricette in coda a `css/family.css`, valori solo da `css/tokens.css`. Derivati con la procedura "Componenti nuovi" di `FAMILY-DESIGN.md`; da riportare nel kit dell'hub (`design/KIT-FEEDBACK.md`).

| ID | Classe | Ruolo | Derivato da | Dove |
|---|---|---|---|---|
| N1 | `.ss-segmented--grid` | scelta fra molti (1–10 posizioni), griglia 5×2 | `.ss-segmented` | Landing |
| N2 | `.ss-clip.ss-clip--slot` (`__rank-num`, `__rank-chev`, `__body`, `__label-row`, `__link`, `__buttons`, `__upload`, `__status`; `.ss-clip--empty`, `.is-over`) | scheda di una posizione. Piena: numero grande che apre il menu della posizione (`<select>` trasparente sopra il numero), miniatura, nome, durata, ordine di riproduzione, etichetta, cestino e × come icone. Vuota e compatta: numero, link TikTok, *Importa*, *Carica file*, ×; un file si può trascinare su tutta la scheda | `.ss-clip` | Clip |
| N3 | `.ss-words` > `.ss-btn.ss-btn--sm.ss-word` (`--c`) | parola del titolo con il colore che avrà nel video (pallino con anello carta) | `.ss-btn--sm` + `.ss-swatch` | Titolo → Colori delle parole |
| N4 | `.ss-swatch-list` + `__item` | colori dell'utente, uno per posizione, con etichetta | `.ss-swatch` + `.ss-label` | Impostazioni → Colore per posizione |
| N6 | `.ss-progress--indeterminate` | avanzamento senza percentuale (import da link); fermo con movimento ridotto | `.ss-progress` | Clip, import in corso |
| N7 | `.ss-summary` (`dl`) | riepilogo chiave/valore | `.ss-row` + `.ss-label` | Pubblica su YouTube |
| N8 | `ol.ss-howto` | istruzioni numerate | `.ss-steps` | Configurazione YouTube |
| N9 | `.ss-link--inline` | link esterno dentro un paragrafo (`--ink-900`, linea `--track` sempre visibile) | `.ss-link` | Configurazione YouTube |
| N10 | `.ss-code`, `.ss-code--block` | origine, nomi di file, suffissi (Urbanist su `--field`) | `.ss-badge` | Configurazione YouTube |
| N11 | `.ss-modal--scroll` | modale lunga: sta nello schermo e scorre dentro | `.ss-modal` | Configurazione, Termini |
| N12 | `.ss-scrollbox` | testo lungo incassato (termini) | `.ss-textarea` | Termini |
| N13 | `.ss-account` (`__avatar`, `__name`) + `.ss-icon-btn--bare` | canale YouTube collegato, con "Disconnetti" | `.ss-topbar__product` | Pubblicazione |
| N14 | `.ss-check`, `.ss-check-label` | casella "ho letto e accetto" (dichiarazione, non impostazione) | `.ss-switch` | Termini |
| N15 | stati e casi mancanti | topbar senza nav; hover di swatch e switch; `.ss-icon-btn:disabled`; area cliccabile di 30px della timeline senza segmenti; tempo accanto al Play senza velocità; opzioni del segmented con icona (B/I); evidenza con inchiostro in hint, note e modali; badge con icona | componenti del kit | varie |

### Scelte dell'app che si discostano dal kit (decise dall'utente)

| Regola | Kit | App | Perché |
|---|---|---|---|
| Bottoni secondari e a icona | carta con testo `--ink-900` | `--ink-900` con testo `--on-ink`; hover `--ink-700`; opzione scelta del segmented uguale | sulla carta del pannello i bottoni di carta non si distinguevano |
| Bottoni disattivati | opacità 0,4 | fondo `--field`, testo `--ink-500` (4,7:1 in chiaro, 5,7:1 in scuro) | il rosa e il grigio sbiaditi non si leggevano |

Le altre regole del kit restano: una sola azione corallo per vista, rimozioni senza bottoni rossi (icone bare + conferma in modale), niente bordi su pannelli e card, raggi 4 / 2 / pillola / cerchio.

## Tema (chiaro / scuro)

Quello del kit 1.1, senza variazioni (`FAMILY-DESIGN.md`, sezione "Temi"; procedura in `THEME-ADOPTION.md`).

- `js/theme.js` scrive `data-theme="light|dark"` su `<html>` prima dei CSS, così la pagina non lampeggia. La scelta resta in `localStorage` `scrollstudio-theme`, condivisa con l'hub e con le altre app (stesso origin su GitHub Pages); senza scelta segue il sistema.
- Switch `.ss-theme` (sole, luna) subito dopo lo switch lingua, in topbar. Nella modale dei termini c'è solo lo switch lingua: il tema non impedisce di leggere.
- Il tema scuro ridefinisce solo i token; le aggiunte dell'app usano i token di ruolo del kit: `--on-ink` per testo e icone sui bottoni d'inchiostro e per l'anello del pallino delle parole, `--check-mark` per la spunta dei termini. Nessun token nuovo dell'app.
- Restano uguali in tutti e due i temi: canvas e video esportato, colori scelti dall'utente, miniature, bandiere, avatar.
- Contrasti delle aggiunte nei due temi: `design/KIT-FEEDBACK.md`, sezione "Tema scuro".

## Icone

Niente emoji. Icone SVG inline sulla griglia di 12, tratto 1, `currentColor` (`.ss-icon`), nello stile delle icone a tratto sottile; il kit vieta i set pieni o spessi. In uso: play, pausa, chevron, download, upload, +, ×, cestino, mescola, ripristina, frecce ← → ↗, copia, spunta, maniglia, B, I.

## Movimento

Quello del kit: hover 400ms ease-out, aperture 360ms `--ease-open`, scorrimenti 600ms `--ease-glide`. L'import da link usa N6 (avanti e indietro in `--dur-glide`); con `prefers-reduced-motion` la barra resta piena e ferma.

## Lingue (IT / EN)

- Italiano di default, inglese con lo switch della topbar (e nella modale dei termini, che alla prima visita copre la topbar). La scelta resta in `localStorage` `scrollstudio-lang`, condivisa con l'hub.
- Testi statici: italiano nell'HTML, inglese in `data-en` / `data-en-<attributo>` (`js/i18n.js` del kit). Un elemento tradotto contiene solo testo.
- Testi creati dal JS: dizionario `js/strings.js` (`TRV.t(chiave, parametri)`), numeri con la virgola in italiano (`TRV.num`, `TRV.seconds`, `TRV.fileSize`), ordinali "1ª" / "1st". Ogni script ridisegna i suoi testi su `ss:lang` (`TRV.onLang`).
- I messaggi che arrivano da servizi esterni (tikwm, Google) restano come arrivano.

## Accessibilità

- Contrasto: testo ≥ 4,5:1 in tutti e due i temi (su corallo il testo è `--on-coral`; sui bottoni d'inchiostro è `--on-ink`, 13,7:1 in chiaro e 10,2:1 in scuro); comandi ≥ 3:1.
- Focus sempre visibile (anello `--focus`). Modali: Esc chiude (tranne i termini, che vanno accettati), Tab resta dentro, il focus torna dov'era (`js/modal.js`). La conferma di rimozione apre col focus su *Annulla*.
- Timeline: `role="slider"` con `aria-value*`, frecce ←/→ (±1 s), Home/Fine.
- `aria-pressed` su B/I e sui numeri 1–10; `aria-label` su ogni bottone solo icona; la drop zone è un bottone (*Carica file*).

## Strumenti

- Screenshot: `design/tools/cdp-shoot.ps1` + `design/tools/shots.js` (Edge headless via DevTools Protocol, niente Node/Python). Gli scenari 01–33 producono `design/before/` e `design/after/` con gli stessi nomi; `gN-*` sono gli stati dei gruppi della Fase 3 (`design/fase3/`).
- Server di sviluppo: `serve.ps1` (porta 8123).
