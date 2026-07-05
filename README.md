# TopRankVids 🎬

Crea video "ranking" verticali (1080×1920) per TikTok direttamente nel browser — zero installazioni.

## Come si usa

1. **Apri `index.html`** con doppio click (Chrome o Edge).
2. Scegli **quanti rank** vuoi (1–10) e premi *Start Creating*.
3. Nell'editor:
   - **Video Title** — scrivi il titolo; clicca su una parola per cambiarle colore; scegli font, dimensione, grassetto/corsivo e contorno.
   - **General Settings** — colore sfondo e colore dei numeri (gradiente giallo→rosso automatico, colore unico, o personalizzato per rank).
   - **Clips** — trascina una clip video (MP4/WebM) in ogni slot e dalle un nome: è la scritta che apparirà accanto al numero.
   - **Playback Order** — trascina per decidere l'ordine di riproduzione. Default: countdown (ultimo posto per primo, #1 per ultimo). Quando parte la clip del rank #k, il suo nome si rivela accanto al numero e resta fino alla fine.
4. Premi **▶** per l'anteprima (con audio).
5. Premi **🚀 Generate Video Ranking** → scarichi un **MP4 pronto per TikTok** (H.264 + audio originale delle clip).

Se il browser non supporta l'encoding veloce (WebCodecs), l'app registra il video in tempo reale e scarica un WebM (accettato dall'upload web di TikTok).

## Note tecniche

- App 100% statica: HTML + CSS + JS vanilla, nessuna build, nessun server necessario.
- Export primario: WebCodecs (`VideoEncoder` H.264, `AudioEncoder` AAC/Opus) + [mp4-muxer](https://github.com/Vanilagy/mp4-muxer) (vendored in `js/vendor/`).
- La preview e l'export condividono lo stesso renderer (`js/renderer.js`): quello che vedi è quello che scarichi.
- `serve.ps1` è un mini server statico PowerShell opzionale (`powershell -File serve.ps1`), utile solo per sviluppo.
