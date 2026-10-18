# ScrollStudio — Design system

Estratto dalla GIF di riferimento (800×600, 136 frame a 25 fps, loop 5,44 s).
I colori sono medie di aree: la GIF ha una palette ridotta con dithering, quindi i singoli pixel (e gli "aloni colorati" che si vedono in alcuni frame) non sono affidabili.
Tutti i token sono in [`css/tokens.css`](css/tokens.css).

## Design language

- **Galleria in una stanza.** Le storie sono quadri appesi a una parete grigio chiaro; subito sotto, una scena "habitat" (scrivania, sedia Eames, pianta) ancora la pagina al pavimento.
- **Silenzio cromatico.** Interfaccia quasi monocroma: il colore arriva dalle foto e dal solo "+" corallo.
- **Testo sottile e piccolo.** Font geometrico, peso light per i titoli, nessun grassetto.
- **Profondità morbida.** Card senza bordo, angoli 4px, ombra larga e diffusa verso il basso.
- **Le immagini escono dal quadro.** Soggetti scontornati possono sbordare dalla card (capelli di Milkbath, ombra del cono di Design).
- **Aprire una storia = entrarci.** La card si dissolve nella parete, il paesaggio si allarga oltre il bordo, compaiono i capitoli (Explorer, Base Camp) e il "+".

## Colori

| Token | Hex | Uso |
|---|---|---|
| `--wall-top` → `--wall-bottom` | `#E9E9E8` → `#D7D6D5` | parete, dall'alto verso il pavimento |
| `--wall-glow` | `#FAFAFA` (85%) | luce sulla parete dietro una storia aperta |
| `--card` | `#FBFBFA` | fondo card |
| `--ink-900` | `#2B2B2D` | titoli |
| `--ink-700` | `#48484B` | testo, nav, autori, footer |
| `--coral` | `#FD767E` | bottone "+" della storia aperta |

## Logo

Wordmark "Scroll / STUDIO" con le lettere tagliate in orizzontale, grigio `#424242` (vicino a `--ink-700`). Originali in `assets/logos/` (SVG, PNG con e senza fondo, JPG 2×).

| File | Dove |
|---|---|
| `assets/logos/scrollstudio-wordmark.svg` | header in alto a sinistra (link alla home, alto 34u, min 30px; 34px su telefono) e footer (26u, min 30px). È `ScrollStudioLogo.svg` con il viewBox stretto sul disegno |
| `assets/icons/favicon.svg` | favicon: la "S" del logo su fondo `#ECECEC` arrotondato |
| `assets/icons/apple-touch-icon.png` | icona iOS 180×180: wordmark su `#ECECEC`, da `ScrollStudioNOBG.png` |

Il logo non va sotto i ~30px di altezza: i tagli delle lettere spariscono.

## Tipografia

**Urbanist** (Google Fonts, 300/400) — sostituto libero di Gilroy/Sofia Pro, "a" a un piano come nell'originale.

| Ruolo | Dimensione (px del frame 800) | Peso |
|---|---|---|
| Nav (Home · Servizi · Abbonamento) / lingua | 9 | 400 |
| Titolo della pagina (hero, `h1`) | 26 (min 22px; 22px su telefono), `--ink-900` | 300 |
| Descrizione hero | 11 (min 13px), `--ink-700`, max 330u, `text-wrap: balance` | 400 |
| Titolo card | 17 | 300 |
| Autore card | 10.5 | 400 |
| Capitolo grande ("Explorer") | 26 | 300 |
| Capitolo piccolo ("Base Camp") | 16.5 | 300 |

## Unità e layout

- `1u` = 1px del frame 800×600. `1cu` = 1px di una card larga 175 (dentro la card tutto è in `cu`).
- La stanza è ancorata in alto come nella GIF: header `0–68u`, titolo della pagina (hero) da `78u`, card a `180u` (175×240u, passo 235u), scrivania a `433u`. La scena continua fino al pavimento (`803u`): la stanza intera, scrivania compresa, sta sempre nello schermo senza scroll; sotto c'è solo il footer. Rispetto alla GIF, card e scrivania sono scese di 73u per far posto all'hero.

| Formato | Scala | Note |
|---|---|---|
| Desktop e finestre orizzontali | `min(100vw/800, 100svh/803)` | la stanza (803u) entra in altezza; su schermi larghi le card si moltiplicano ai lati |
| Tablet verticale | `min(100vw/620, 100svh/813)` | card più grandi |
| Telefono ≤640px | card `min(58vw, 300px, 31.5svh − 68px)`, scrivania larga 2 card | header su due righe, poi titolo, card, scrivania: tutto nello schermo fino a 320×568 (verificato anche 375×667 e 390×844) |

## Motion (misurato dalla GIF)

| Movimento | Durata | Curva |
|---|---|---|
| Scorrimento di 1 card, lancio di più card, chiusura storia | 600 ms (chiusura 400 ms) | tabella `GLIDE_CURVE`: partenza quasi lineare, frenata morbida — identica a qualunque distanza |
| Apertura storia: la card va al centro | 600 ms | `GLIDE_CURVE`; il carosello resta fermo, si muove solo la card scelta |
| Le altre card all'apertura | spariscono in fade nel primo 2/3 dell'apertura, mentre si spostano di −160cu / +210cu | |
| Dettagli dentro la card (clip, glifo, avatar → "+") | 360 ms | `--ease-open` (curva di apertura misurata dalla GIF, parte veloce) |
| Fondo card / ombra all'apertura | 200 ms / 480 ms | |
| Capitoli e "+" | entrano dopo 120–220 ms | |

`GLIDE_CURVE` è in [`js/main.js`](js/main.js) e replicata in CSS come `linear()` (`--ease-glide`); `--ease-open` è solo in CSS.

## Interazioni

- Autoplay: un passo verso sinistra ogni 2,4 s. Si ferma su hover, focus, storia aperta, tab nascosta, `prefers-reduced-motion`, o col pulsante pausa (Tab per raggiungerlo).
- Trascina/swipe: sotto metà card torna indietro, oltre avanza; un lancio veloce scorre più card (max 4).
- Rotella orizzontale / trackpad / Shift+rotella → carosello. Rotella verticale → scroll della pagina.
- Click su una card → le altre spariscono in fade e la card scelta si porta al centro, con "Provalo" e la descrizione alla sua destra (la coppia è centrata, `OPEN_GROUP_CENTER`); su telefono va nel 1° slot. Click di nuovo, Esc o click sulla parete → si chiude e le altre ricompaiono.
- Frecce ←/→ con focus nel carosello.

## Lingue (IT / EN)

- Italiano di default. Lo switch in alto a destra (bandiera + sigla; su telefono nella prima riga) passa all'inglese e la scelta resta in `localStorage` (`scrollstudio-lang`).
- I testi italiani sono scritti nell'HTML; l'inglese sta accanto, sullo stesso elemento: `data-en="…"` per il testo, `data-en-aria-label`, `data-en-aria-roledescription`, `data-en-content` per gli attributi.
- Testo nuovo da tradurre = elemento con solo testo dentro (niente icone: avvolgi il testo in uno `<span>`) + `data-en`.
- Le etichette del pulsante pausa sono in `TOGGLE_LABELS` in [`js/main.js`](js/main.js).
- Lingua attiva: inchiostro `--ink-900` e bandiera a colori; l'altra: `--ink-700` e bandiera in grigio al 50%.

## Progetti (card video)

Il carosello mostra i progetti: Bouncical e TopFratmRanks. Ogni card è `class="story story--video"` con un `<video class="story__image">` al posto dell'immagine: riempie la card (`object-fit: cover`), testo chiaro e sfumatura scura in alto per il titolo.

| File | Uso | Formato |
|---|---|---|
| `assets/projects/<progetto>.mp4` | video della card, in loop e muto | H.264 verticale 9:16, 480px di larghezza, senza audio, `+faststart` |
| `assets/projects/<progetto>.jpg` | poster: primo frame, mostrato prima del play e con `prefers-reduced-motion` | JPG alla stessa risoluzione |
| `assets/projects/<progetto>-logo.svg` | logo nell'avatar in basso a sinistra (cerchio di 26cu, anello chiaro sul video) | SVG quadrato 128, contenuto entro il cerchio inscritto, niente scritte |

Loghi: `bouncical-logo.svg` è il marchio di `logo.png` del repo ridisegnato per l'avatar (senza scritta, linee e palline più spesse); `topfratmranks-logo.svg` è un podio tricolore con corona, provvisorio finché il progetto non ha un logo suo.

- Un solo `<video>` per progetto scarica e decodifica (`preload="none"`); le copie del carosello sono `<canvas>` che ne ricopiano i frame (stesso taglio di `object-fit: cover` e `object-position`). Così con 2 progetti restano 2 decodifiche e 2 download, qualunque sia la larghezza dello schermo.
- I video partono dopo l'evento `load` (prima pagina, poster e loghi), solo se una card del progetto è visibile, mai con `prefers-reduced-motion`. Logica in [`js/main.js`](js/main.js).
- Aperta la card: "Provalo" → sito live, "Codice" → repo GitHub, il bottone corallo (↗) apre il sito.
- Per aggiungere un progetto: copia una `<li class="carousel__slide">` di un progetto e cambia video, poster, testi (italiano e `data-en`) e link.

Ricodifica dal video sorgente:

```sh
ffmpeg -i sorgente.mp4 -vf "scale=480:-2,fps=30" -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -an -movflags +faststart assets/projects/nome.mp4
ffmpeg -i assets/projects/nome.mp4 -frames:v 1 -q:v 4 assets/projects/nome.jpg
```

## Card con immagine (placeholder)

Non più usate in `index.html`, ora occupato dai progetti. I file restano come riferimento per card con immagine, panorama o parti che escono dal quadro (le quattro storie di esempio sono nel primo commit).

| File | Uso | Formato consigliato |
|---|---|---|
| `assets/placeholders/story-01.svg`, `story-02.svg`, `story-04.svg` | immagine card (riempie la card) | JPG/WebP 700×960, zona alta chiara per il titolo |
| `assets/placeholders/story-03-pano.svg` | panorama di Apogee: la card ne mostra il centro, aprendo si vede tutto | PNG trasparente 880×400; box `--l:-80; --t:33; --w:440` (cu) |
| `assets/placeholders/pop-01-shadow.svg`, `pop-04-hair.svg` | parti che escono dalla card | PNG trasparente; posizione con `--l --t --w` |
| `assets/placeholders/avatar-0X.svg` | avatar autori | 128×128 |
| `assets/scene/desk-scene.svg` | scena scrivania | facoltativo: PNG trasparente 1380×1080 |

Per una card con panorama usa `class="story story--pano"` e `<img class="story__pano">` (vedi Apogee nel primo commit). Capitoli: ogni `<a class="point">` ha la posizione in cu (`--x --y`, e `--xs --ys` per il telefono).

`assets/extracted/` contiene ritagli dello screenshot originale solo come riferimento (bassa risoluzione, con dithering).
