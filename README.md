# TopRankVids 🎬

A lightweight, local, 100% client-side web application designed to help users generate vertical ranking videos (1080×1920) optimized for short-form social video platforms (such as TikTok, YouTube Shorts, and Instagram Reels) directly in the browser—with zero server installation.

The project is hosted and accessible directly via GitHub at [github.com/KekkoCoppola/TopFratmRanks](https://github.com/KekkoCoppola/TopFratmRanks).

---

## ⚠️ CRITICAL LEGAL DISCLAIMER & TERMS OF USE
**(Read carefully before deploying or using this application)**

1. **Illustrative & Mockup Simulation Purposes Only**:
This application is provided strictly as a **proof-of-concept prototype, mockup simulator, and for educational and illustrative purposes**. It is not designed or intended to be a commercial product, nor does it guarantee suitability for any specific professional or social media marketing use.

2. **No Warranty & Limitation of Liability**:
THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS, COPYRIGHT HOLDERS, OR DISTRIBUTORS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
By using this application, you agree that you do so at your own risk. The developers are not liable for any issues, data loss, social media account restrictions, or platform-related violations resulting from videos generated or uploaded using this software.

3. **Intellectual Property & Content Responsibility**:
- Users are **solely responsible** for ensuring they possess all necessary licenses, permissions, or ownership rights for any video clips, audio tracks, fonts, or text overlays used or imported.
- The application does not review, filter, or check uploaded assets for copyright compliance. The authors assume **absolutely no responsibility** for any copyright infringement or intellectual property disputes arising from content generated or shared by users.

4. **Third-Party Trademark Disclaimer**:
- **TikTok** (ByteDance Ltd.) and **YouTube** (Google LLC) are trademarks of their respective owners.
- This project is **entirely independent** and has no official association, endorsement, sponsorship, or affiliation with TikTok, Google, or any of their subsidiaries.

---

## 🔒 PRIVACY POLICY & DATA INTEGRITY
This application is designed with **Privacy by Design** principles, ensuring that your data stays under your control.

*   **100% Client-Side Processing**: Every video clip, title text, font, configuration, and final video rendering is processed **entirely within your browser's local sandbox**.
    *   No video or audio assets are uploaded to any external server during editing or rendering.
    *   No logs, analytics, or behavioral data are collected.
*   **Social Link Imports (TikTok)**:
    *   The "Import via Link" feature uses a public resolver API (`tikwm.com`) to extract the direct MP4 video link.
    *   Only the target TikTok URL is sent to the resolver API. No personal or browser data is shared.
    *   Once resolved, the raw video file is downloaded directly to your browser's local memory (`Blob`).
    *   Please note that `tikwm.com` is an independent third-party service. Use it at your own discretion.
*   **YouTube Integration & Google Sign-In**:
    *   If you configure a `googleClientId` (see configuration below) to enable direct publishing, Google's Identity Services OAuth 2.0 SDK is used.
    *   Your Google access token is stored **strictly in-memory** (in temporary JavaScript state). It is never saved to cookies, localStorage, or sent to any third-party server.
    *   The application calls the YouTube Data API directly from your browser to retrieve channel info and perform the upload.
*   **Browser Storage**:
    *   For your convenience, some metadata settings (such as default YouTube upload titles and descriptions) may be stored locally in your browser's `localStorage`. No private credentials or video files are ever saved in persistent local storage.

---

## 🚀 Key Features

*   **Zero Install**: Run directly from `index.html` in Chrome or Edge.
*   **Highly Customizable Video Title**: Change fonts, resize, apply bold/italic/outline, and customize color on a per-word basis.
*   **Dynamic Backgrounds & Numbers**: Configure custom colors, auto-gradients (Yellow to Red), number sizes, and vertical layout spacing.
*   **Visual Clip Editor**: Drag-and-drop local files (MP4/WebM) or load clean TikTok clips via link. Custom label editing for each rank.
*   **Custom Playback Sequence**: Drag and drop slots to organize the playback timeline. Choose from traditional countdowns, randomized shuffle, or bespoke order.
*   **Ultra-Fast Local Export**: Uses the browser's hardware-accelerated WebCodecs API (`VideoEncoder`/`AudioEncoder` + `mp4-muxer`) to export high-definition H.264 MP4 videos at 30fps with synchronized audio.
*   **Browser Recording Fallback**: Fallback to MediaRecorder (WebM) export if hardware-accelerated WebCodecs are not supported in your browser.

---

## 📖 How to Use

1.  **Launch the App**: Double-click `index.html` (Chrome or Edge recommended) or use a local static server.
2.  **Select Ranks**: Choose the number of items in your ranking (1 to 10) and click **✨ Start Creating**.
3.  **Configure Settings**:
    *   **Video Title**: Type the main title text. Click any word in the text preview box to assign a custom highlight color. Set styling options.
    *   **General Settings**: Set background colors, layout styles, and customize the color of each ranking badge/number.
    *   **Clips**: Upload local files or paste a TikTok URL. Add descriptions to be displayed next to each rank.
    *   **Playback Order**: Rearrange items to control the reveal sequence.
4.  **Preview**: Click **▶ Preview** to review the audio-video timeline on the interactive screen.
5.  **Export**: Click **🚀 Generate Video Ranking** to render and download your finalized MP4/WebM.
6.  *(Optional)* **Publish**: If Google Client ID is configured, connect your Google account and upload directly to YouTube as a draft, unlisted, or public video.

---

## 🛠️ Technical Details & Setup

*   **Architecture**: Static client-side app (Vanilla HTML5, CSS3, JavaScript ES6). No build step required.
*   **Libraries Used (Vendored in `js/vendor/`)**:
    *   [mp4-muxer](https://github.com/Vanilagy/mp4-muxer): Muxes raw video and audio streams directly into standard H.264/AAC MP4 files inside the browser.
*   **Browser Compatibility**: Requires a modern browser with `WebCodecs` support (Chrome, Edge, Opera, or chromium-based browsers). If missing, the app falls back to `MediaRecorder` generating WebM videos.
*   **YouTube Publishing Setup**:
    1.  Create a project on the [Google Cloud Console](https://console.cloud.google.com/).
    2.  Enable the **YouTube Data API v3**.
    3.  Create an **OAuth 2.0 Web Client ID** and set your authorized JavaScript origins (e.g., `http://localhost:8000` or `https://yourdomain.com`).
    4.  Copy the client ID and paste it in `js/config.js` (`googleClientId: 'YOUR_CLIENT_ID'`).
    5.  You can run a local development server by executing `serve.ps1` in PowerShell.
