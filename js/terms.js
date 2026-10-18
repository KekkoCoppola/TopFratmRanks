// Terms & Conditions gate, shown until accepted (localStorage trv_terms_accepted).
// Kit modal (.ss-modal--scroll + .ss-scrollbox + .ss-check). Italian is the text,
// English sits in data-en like the rest of the page; the language switch is repeated
// inside the modal because on the first visit the modal covers the topbar.
(function () {
  'use strict';

  // [italiano, english]; { b: [...] } = emphasised words (ink, not bold)
  var TEXT = {
    title: ['Termini e condizioni', 'Terms & Conditions'],
    intro: ["Prima di usare l'applicazione, leggi e accetta i termini di servizio e l'informativa sulla privacy.",
      'Please read and accept the terms of service and privacy policy before using the application.'],
    sections: [
      {
        h: ['1. Solo a scopo illustrativo e di simulazione', '1. Illustrative & Mockup Simulation Purposes Only'],
        p: [[
          ['Questa applicazione è fornita esclusivamente come ', 'This application is provided strictly as a '],
          { b: ['prototipo dimostrativo, simulatore di mockup e per scopi didattici e illustrativi',
            'proof-of-concept prototype, mockup simulator, and for educational and illustrative purposes'] },
          [". Non è progettata né pensata come prodotto commerciale e non garantisce l'idoneità a specifici usi professionali o di marketing sui social media.",
            '. It is not designed or intended to be a commercial product, nor does it guarantee suitability for any specific professional or social media marketing use.']
        ]]
      },
      {
        h: ['2. Nessuna garanzia e limitazione di responsabilità', '2. No Warranty & Limitation of Liability'],
        p: [
          [[
            "Questo software è fornito \"così com'è\", senza garanzie di alcun tipo, esplicite o implicite. In nessun caso gli autori, i titolari del copyright o i distributori potranno essere ritenuti responsabili per reclami, danni o altre responsabilità, derivanti da contratto, illecito o altro, che nascano dal software, dal suo uso o da altre operazioni con esso.",
            'This software is provided "as is", without warranty of any kind, express or implied. In no event shall the authors, copyright holders, or distributors be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.'
          ]],
          [[
            "Usando questa applicazione accetti di farlo a tuo rischio. Gli sviluppatori non rispondono di problemi, perdite di dati, limitazioni degli account social o violazioni delle regole delle piattaforme derivanti dall'uso di questo software.",
            'By using this application, you agree that you do so at your own risk. The developers are not liable for any issues, data loss, social media account restrictions, or platform-related violations resulting from the use of this software.'
          ]]
        ]
      },
      {
        h: ['3. Proprietà intellettuale e responsabilità sui contenuti', '3. Intellectual Property & Content Responsibility'],
        p: [[
          ['Gli utenti sono ', 'Users are '],
          { b: ['gli unici responsabili', 'solely responsible'] },
          [" di avere tutte le licenze, i permessi o i diritti necessari per clip video, tracce audio, font o testi sovrapposti usati o importati. L'applicazione non controlla né verifica il rispetto del copyright e gli autori non si assumono alcuna responsabilità per eventuali violazioni.",
            ' for ensuring they possess all necessary licenses, permissions, or ownership rights for any video clips, audio tracks, fonts, or text overlays used or imported. The application does not review or verify copyright compliance, and the authors assume absolutely no responsibility for any infringement.']
        ]]
      },
      {
        h: ['4. Servizi di terze parti e marchi', '4. Third-Party Services & Trademarks'],
        p: [[[
          "TikTok e YouTube sono marchi dei rispettivi proprietari. Questo progetto è del tutto indipendente e non è approvato, sponsorizzato né affiliato a loro. L'importazione da link usa l'API pubblica di \"tikwm.com\", un servizio di terze parti indipendente e fuori dal nostro controllo.",
          'TikTok and YouTube are trademarks of their respective owners. This project is entirely independent and not endorsed, sponsored, or affiliated with them. Link imports utilize the public "tikwm.com" API, which is an independent third-party service outside our control.'
        ]]]
      },
      {
        h: ['5. Privacy e trattamento dei dati', '5. Privacy & Data Policy'],
        p: [[
          ['Rendering video, caricamento dei font, modifica delle impostazioni ed elaborazione audio avvengono ',
            'All video rendering, font loading, configuration editing, and audio processing occur '],
          { b: ['al 100% in locale, nella sandbox del tuo browser', '100% locally in your web browser sandbox'] },
          ['. Nessun file multimediale o titolo viene caricato su un server. I token OAuth per la pubblicazione su YouTube restano solo in memoria e non vengono mai salvati né trasmessi a terzi.',
            '. No media files or titles are uploaded to any server. OAuth tokens for YouTube publishing are kept strictly in-memory and are never stored or transmitted to third parties.']
        ]]
      }
    ],
    check: ["Ho letto, compreso e accetto tutti i termini, le condizioni e l'informativa sulla privacy.",
      'I have read, understood, and accept all the terms, conditions, and privacy policies.'],
    accept: ['Accetta e continua', 'Accept & Continue'],
    langGroup: ['Lingua', 'Language']
  };

  var FLAG_IT = '<svg class="ss-lang__flag" viewBox="0 0 3 2" preserveAspectRatio="none" aria-hidden="true"><path fill="#009246" d="M0 0h1v2H0z"/><path fill="#F4F5F0" d="M1 0h1v2H1z"/><path fill="#CE2B37" d="M2 0h1v2H2z"/></svg>';
  var FLAG_EN = '<svg class="ss-lang__flag" viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><clipPath id="terms-flag-uk-cross"><path d="M30 15h30v15zv15H0zH0V0zV0h30z"/></clipPath><path fill="#012169" d="M0 0h60v30H0z"/><path stroke="#FFF" stroke-width="6" d="m0 0 60 30m0-30L0 30"/><path stroke="#C8102E" stroke-width="4" clip-path="url(#terms-flag-uk-cross)" d="m0 0 60 30m0-30L0 30"/><path stroke="#FFF" stroke-width="10" d="M30 0v30M0 15h60"/><path stroke="#C8102E" stroke-width="6" d="M30 0v30M0 15h60"/></svg>';

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  // Element whose text is translated by i18n.js (Italian now, English in data-en)
  function tr(tag, pair, className) {
    var node = el(tag, className);
    node.textContent = pair[0];
    node.setAttribute('data-en', pair[1]);
    return node;
  }

  function paragraph(parts) {
    var p = el('p');
    parts.forEach(function (part) {
      p.appendChild(Array.isArray(part) ? tr('span', part) : tr('b', part.b));
    });
    return p;
  }

  function langButton(code, flag, label) {
    var btn = el('button', 'ss-lang__option');
    btn.type = 'button';
    btn.setAttribute('data-lang', code); // i18n.js keeps aria-pressed in sync
    btn.setAttribute('aria-pressed', String((window.ssLang ? window.ssLang() : 'it') === code));
    btn.innerHTML = flag;
    btn.appendChild(document.createTextNode(label));
    btn.addEventListener('click', function () {
      if (window.ssSetLanguage) window.ssSetLanguage(code);
      try { localStorage.setItem('scrollstudio-lang', code); } catch (e) { /* this visit only */ }
    });
    return btn;
  }

  function initTerms() {
    if (localStorage.getItem('trv_terms_accepted') === 'true') {
      return; // Already accepted
    }

    var overlay = el('div', 'ss-overlay');
    overlay.id = 'terms-overlay';
    var dialog = el('div', 'ss-modal ss-modal--scroll');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'terms-title');

    var head = el('div', 'terms-head');
    var title = tr('h2', TEXT.title, 'ss-modal__title');
    title.id = 'terms-title';
    var lang = el('div', 'ss-lang');
    lang.setAttribute('role', 'group');
    lang.setAttribute('aria-label', TEXT.langGroup[0]);
    lang.setAttribute('data-en-aria-label', TEXT.langGroup[1]);
    lang.appendChild(langButton('it', FLAG_IT, 'IT'));
    lang.appendChild(langButton('en', FLAG_EN, 'EN'));
    head.appendChild(title);
    head.appendChild(lang);

    var body = el('div', 'ss-modal__body');
    body.appendChild(tr('p', TEXT.intro));
    var box = el('div', 'ss-scrollbox');
    box.tabIndex = 0; // scrollable from the keyboard
    box.setAttribute('role', 'region');
    box.setAttribute('aria-labelledby', 'terms-title');
    TEXT.sections.forEach(function (section) {
      box.appendChild(tr('h3', section.h));
      section.p.forEach(function (parts) { box.appendChild(paragraph(parts)); });
    });
    body.appendChild(box);

    var check = el('label', 'ss-check-label');
    var checkbox = el('input', 'ss-check');
    checkbox.type = 'checkbox';
    checkbox.id = 'terms-checkbox';
    check.appendChild(checkbox);
    check.appendChild(tr('span', TEXT.check));
    body.appendChild(check);

    var actions = el('div', 'ss-modal__actions');
    var acceptBtn = tr('button', TEXT.accept, 'ss-btn ss-btn--primary ss-btn--block');
    acceptBtn.type = 'button';
    acceptBtn.id = 'terms-accept-btn';
    acceptBtn.disabled = true;
    actions.appendChild(acceptBtn);

    dialog.appendChild(head);
    dialog.appendChild(body);
    dialog.appendChild(actions);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // i18n.js ran before this node existed: apply the current language to it
    if (window.ssSetLanguage && window.ssLang) window.ssSetLanguage(window.ssLang());
    // Focus stays inside; there is no Esc: the terms must be accepted
    if (window.TRV && TRV.modal) TRV.modal.open(overlay, { initialFocus: checkbox });

    checkbox.addEventListener('change', function () {
      acceptBtn.disabled = !checkbox.checked;
    });

    acceptBtn.addEventListener('click', function () {
      if (checkbox.checked) {
        localStorage.setItem('trv_terms_accepted', 'true');
        if (window.TRV && TRV.modal) TRV.modal.close(overlay);
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
