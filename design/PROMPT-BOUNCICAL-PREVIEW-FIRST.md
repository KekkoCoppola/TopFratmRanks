# Prompt per la sessione Bouncical — editor con l'anteprima al centro (N17)

Copia tutto quello che sta sotto la riga nella sessione di Bouncical (`D:\PROGETTI\Bouncical`).

---

Voglio in Bouncical lo stesso lavoro fatto in TopFratmRanks: **una visualizzazione pensata per ogni viewport, con l'anteprima al centro**. L'anteprima è quello che si deve vedere in grande, e il resto lo ingrandiamo e lo teniamo vicino. Oggi su schermi grandi anteprima e tasti sono minuscoli in mezzo alla parete: è il problema da risolvere.

## Riferimento già fatto (leggilo prima di toccare qualcosa)

Repo `D:\PROGETTI\TopFratmRanks`, branch `redesign/scrollstudio`, commit `71a000d` ("feat: preview-first editor layout on every viewport"). File da leggere:

- `css/family.css`, blocco **N17** in coda ("TopFratmRanks additions"): griglia, `--stage-chrome`, `--frame-w`, zoom.
- `css/tokens.css`, in coda: `--k` e le sue media query a gradini.
- `editor.html`: struttura `main.ss-editor` = `.ss-head` + `aside.ss-panel.ss-editor__make` + `section.ss-stage` + `aside.ss-panel.ss-editor__finish`.
- `design/KIT-FEEDBACK.md`, riga **N17** e token `--k`.

Non copiare alla cieca: Bouncical è diverso (vedi "Differenze di Bouncical").

## Il layout da ottenere

| Formato | Disposizione |
|---|---|
| Telefono (<700px) | titolo, poi l'anteprima che riempie il resto della prima schermata (barra di controllo compresa), poi i due fogli |
| ≥700px e tablet verticali | come sopra, ma con i due fogli affiancati sotto lo stage |
| Orizzontale ≥861px | titolo + foglio "make" \| stage (2 colonne) |
| Orizzontale ≥1200px | titolo + foglio "make" \| stage \| foglio "finish" (3 colonne, gruppo centrato) |

- L'anteprima prende **l'altezza della finestra**: larghezza = `(100svh − --stage-chrome) × rapporto del formato`. `--stage-chrome` è tutto quello che divide l'altezza con la cornice: topbar, titolo (solo su telefono e tablet), gap, barra di controllo e 16–24px di margine sotto.
- Su desktop lo stage è `position: sticky`: i fogli scorrono e l'anteprima resta lì.
- **`--k`** = `min(larghezza/1440, altezza/900)` arrotondato all'ottavo, da 1 a 2.25, **solo con `orientation: landscape`**. Telefoni e tablet restano a 1. Con `zoom: var(--k)` crescono topbar, `.ss-head`, i fogli (`.ss-panel`), la barra sotto lo stage, modali e menu, footer. Le colonne dei fogli sono `calc(var(--panel-w) * var(--k))`.
- È lo stesso principio della "u" dell'hub (`HUB-DESIGN.md`, "Unità e layout"), applicato all'app.

## Cose già scoperte (non riscoprirle)

1. **`zoom` scala anche vw/svh** dentro l'elemento zoomato: in Chrome 152, `10vw` sotto `zoom: 2` è largo il doppio. Per questo **lo stage, la cornice e il canvas NON si zoomano**: la cornice è calcolata su `100svh`. Dentro un elemento zoomato ogni misura in vw/svh va divisa per `--k`:
   - topbar, head e footer: `padding-inline: calc(var(--gutter) / var(--k))`, perché il gutter contiene vw
   - `.ss-modal--scroll`: `max-height: calc((100svh - 2 * var(--gutter)) / var(--k))`
2. `getBoundingClientRect()` dentro un elemento zoomato restituisce px visivi, coerenti con `clientX`/`clientY`. Le percentuali (`width: 100%`) dentro un elemento zoomato si risolvono giuste.
3. Le tracce della griglia sono in px non zoomati: un foglio zoomato in una traccia da 340px diventa stretto, non grande. Per questo la traccia è `var(--panel-w) * var(--k)`.
4. Lo stage occupa tutte le righe della colonna centrale. Aggiungi una riga finale `1fr` (`grid-template-rows: auto auto auto 1fr` a 2 colonne, `auto auto 1fr` a 3), altrimenti l'altezza in più si spalma come gap tra titolo e foglio.
5. La luce dietro lo stage (`.ss-stage::before`) si disegnava sopra i fogli vicini. La correzione è `.ss-editor > .ss-panel { position: relative; z-index: 1 }`.
6. La regola del kit `@media (max-width: 860px) { .ss-frame { width: min(62vw, 300px, …) } }` va battuta con `.ss-editor .ss-frame` (specificità maggiore), non modificata nel kit.
7. Su telefono e tablet lo stage va `position: relative; top: auto`. Lo sticky solo da 861px in orizzontale, con `top: calc(var(--s-3) * var(--k))`.
8. `.ss-head` entra dentro `main` come primo figlio. Su desktop si allinea a sinistra nella colonna "make", con padding 0, così lo stage parte subito sotto la topbar: si guadagnano circa 120px di altezza.

## Differenze di Bouncical (da gestire)

- **Un solo `aside` con 9 sezioni**: Strumenti, Scena e formato, Regole, Musica, Mondo (fisica), Effetti (FX), Scene virali, Forma selezionata, Registra ed esporta. Va diviso in due fogli (`.ss-editor__make` e `.ss-editor__finish`), ognuno con `aria-label` IT + `data-en-aria-label` EN. Proposta di partenza:
  - "make": cosa costruisci sulla scena (Strumenti, Forma selezionata, Scena e formato, Scene virali)
  - "finish": come si comporta, come suona, cosa esce (Regole, Mondo, Musica, Effetti, Registra ed esporta)

  Misura le altezze dei due fogli e bilanciale; Registra ed esporta resta l'ultima del foglio di destra. Ordine nel DOM: head, make, stage, finish (così il Tab segue l'ordine visivo su desktop). Gli `id` non cambiano.
- **Il formato non è sempre 9:16** (menu formato, `#format-menu`). Usa una variabile `--frame-ratio` (larghezza/altezza), impostata dal JS quando cambia il formato, al posto del `9 / 16` fisso. Controlla che con un formato orizzontale la colonna centrale non sfori: è `minmax(0, …)`, quindi si stringe e l'altezza segue l'`aspect-ratio`.
- **Canvas e coordinate**: `js/stage.js` dimensiona il canvas dal `getBoundingClientRect()` di `#stage-wrap` (con `devicePixelRatio`, tetto `stage.maxDpr`), e `toWorld()` converte `clientX`/`clientY` con il rect del canvas. Il canvas non è zoomato, quindi le coordinate restano giuste. Verifica però che:
  - il canvas venga ridimensionato quando la cornice cambia per `--k`, per una soglia di media query o per il cambio di formato (ResizeObserver o resize)
  - in 4K resti nitido
  - tocco e disegno cadano esattamente sotto il puntatore
- **Barra sotto lo stage**: è `.ss-stage-bar` con il solo Play (`.ss-btn--sm`), non `.ss-timeline`. Zoomala con `--k`, rendila larga quanto la cornice e misura la sua altezza reale per `--stage-chrome`.
- **`#format-menu` (`.ss-menu`) è flottante**: se viene posizionato dal rect di un bottone dentro un foglio zoomato, controlla che compaia attaccato al bottone (rect visivo + `position: fixed` fuori dallo zoom vanno bene; offsetTop/offsetLeft no). Zoomalo come le modali, così ha la stessa scala.
- **`style.css` in radice** ha le sue media query (`min-width: 861px`, `max-width: 860px`) e regole su `.ss-frame` e lo stage: riconciliale con N17, senza duplicati in conflitto. In `family.css` le aggiunte hanno un **N16** (`minmax(280px, var(--panel-w)) auto`) e `tokens.css` ha `--stage-w`: N17 li sostituisce. Togli `--stage-w` se non è più usato.

## Come calibrare `--stage-chrome`

Per ogni fascia (telefono, ≥700px, orizzontale ≥861px), dopo il primo giro misura con JS nel browser: `chrome = top della cornice + gap dello stage + altezza della barra + margine (16px)`. Poi metti quel valore. Su desktop esprimilo come `calc(Npx * var(--k))`.

In TopFratmRanks è venuto 288px / 278px / `184px × k`. In Bouncical la barra ha un'altezza diversa, quindi va rimisurato.

## Verifica (con screenshot e misure, non a occhio)

Viewport: 375×667, 390×844, 768×1024, 1024×768, 1440×900, 1920×960, 2560×1300, **3440×1300** (lo schermo dell'utente è un ultrawide 3440×1440 a DPR 1) e 3840×2050.

Per ognuno controlla:
- nessuno scroll orizzontale
- fondo dello stage (barra compresa) ≤ `innerHeight` al caricamento
- dimensioni della cornice e valore di `--k`

Poi, almeno su telefono e su 2560×1300:
- tocco sul canvas: la pallina cade sotto il dito
- disegno di una forma, Play, cambio formato (anche orizzontale), menu formato, una modale
- tema scuro, IT/EN
- console senza errori

Per gli schermi grandi usa l'emulazione del viewport del pannello browser o lo script CDP del progetto.

## Regole

- Parte kit di `tokens.css` e `family.css` invariata. Tutto va nelle aggiunte in coda, con commento N17 e "asked by the user".
- Testi invariati. Gli unici testi nuovi sono gli `aria-label` dei due fogli, IT + EN.
- Aggiorna `DESIGN.md` (riga Editor, schermata Editor, tabella componenti N17) e `design/KIT-FEEDBACK.md` (riga N17, token `--k`, copia del CSS).
- **Non committare**: mostrami gli screenshot prima/dopo e chiedimi tu.
