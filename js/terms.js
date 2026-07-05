(function () {
  'use strict';

  function initTerms() {
    if (localStorage.getItem('trv_terms_accepted') === 'true') {
      return; // Already accepted
    }

    var html = 
      '<div class="terms-overlay" id="terms-overlay">' +
      '  <div class="terms-card">' +
      '    <h2>⚠️ Terms & Conditions</h2>' +
      '    <p class="terms-intro">Please read and accept the terms of service and privacy policy before using the application.</p>' +
      '    <div class="terms-scrollbox">' +
      '      <h3>1. Illustrative & Mockup Simulation Purposes Only</h3>' +
      '      <p>This application is provided strictly as a <strong>proof-of-concept prototype, mockup simulator, and for educational and illustrative purposes</strong>. It is not designed or intended to be a commercial product, nor does it guarantee suitability for any specific professional or social media marketing use.</p>' +
      '      <h3>2. No Warranty & Limitation of Liability</h3>' +
      '      <p>THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. IN NO EVENT SHALL THE AUTHORS, COPYRIGHT HOLDERS, OR DISTRIBUTORS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>' +
      '      <p>By using this application, you agree that you do so at your own risk. The developers are not liable for any issues, data loss, social media account restrictions, or platform-related violations resulting from the use of this software.</p>' +
      '      <h3>3. Intellectual Property & Content Responsibility</h3>' +
      '      <p>Users are <strong>solely responsible</strong> for ensuring they possess all necessary licenses, permissions, or ownership rights for any video clips, audio tracks, fonts, or text overlays used or imported. The application does not review or verify copyright compliance, and the authors assume absolutely no responsibility for any infringement.</p>' +
      '      <h3>4. Third-Party Services & Trademarks</h3>' +
      '      <p>TikTok and YouTube are trademarks of their respective owners. This project is entirely independent and not endorsed, sponsored, or affiliated with them. Link imports utilize the public "tikwm.com" API, which is an independent third-party service outside our control.</p>' +
      '      <h3>5. Privacy & Data Policy</h3>' +
      '      <p>All video rendering, font loading, configuration editing, and audio processing occur <strong>100% locally in your web browser sandbox</strong>. No media files or titles are uploaded to any server. OAuth tokens for YouTube publishing are kept strictly in-memory and are never stored or transmitted to third parties.</p>' +
      '    </div>' +
      '    <label class="terms-checkbox-label">' +
      '      <input type="checkbox" id="terms-checkbox">' +
      '      <span>I have read, understood, and accept all the terms, conditions, and privacy policies.</span>' +
      '    </label>' +
      '    <div class="terms-btn-container">' +
      '      <button class="btn btn-primary terms-btn" id="terms-accept-btn" disabled>Accept & Continue</button>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    var container = document.createElement('div');
    container.innerHTML = html;
    var overlay = container.firstChild;
    document.body.appendChild(overlay);

    var checkbox = document.getElementById('terms-checkbox');
    var acceptBtn = document.getElementById('terms-accept-btn');

    checkbox.addEventListener('change', function () {
      acceptBtn.disabled = !checkbox.checked;
    });

    acceptBtn.addEventListener('click', function () {
      if (checkbox.checked) {
        localStorage.setItem('trv_terms_accepted', 'true');
        overlay.parentNode.removeChild(overlay);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTerms);
  } else {
    initTerms();
  }
})();
