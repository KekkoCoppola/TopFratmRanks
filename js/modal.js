// Keyboard behaviour for .ss-overlay dialogs (kit: "modale con Esc e focus intrappolato"):
// Esc closes, Tab stays inside, focus goes back where it was on close.
// Showing and hiding stays with the caller (style.display); call open/close around it.
// Also TRV.confirm(): a kit modal in place of window.confirm().
(function () {
  'use strict';

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
    'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  var stack = []; // open dialogs, last = on top

  function isShown(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  function focusables(root) {
    return Array.prototype.filter.call(root.querySelectorAll(FOCUSABLE), isShown);
  }

  // Move focus to the first control inside root (e.g. after a step change)
  function focusIn(root) {
    var first = focusables(root)[0];
    if (first) first.focus();
  }

  function open(overlay, opts) {
    opts = opts || {};
    close(overlay, true);
    stack.push({ overlay: overlay, opts: opts, returnTo: document.activeElement });
    var target = opts.initialFocus && isShown(opts.initialFocus) ? opts.initialFocus : focusables(overlay)[0];
    if (target) target.focus();
  }

  function close(overlay, keepFocus) {
    for (var i = stack.length - 1; i >= 0; i--) {
      if (stack[i].overlay === overlay) {
        var entry = stack.splice(i, 1)[0];
        if (!keepFocus && entry.returnTo && document.contains(entry.returnTo)) entry.returnTo.focus();
        return;
      }
    }
  }

  document.addEventListener('keydown', function (e) {
    var top = stack[stack.length - 1];
    if (!top) return;
    if (e.key === 'Escape') {
      if (top.opts.onEscape) {
        e.preventDefault();
        top.opts.onEscape();
      }
      return;
    }
    if (e.key !== 'Tab') return;
    var items = focusables(top.overlay);
    if (!items.length) { e.preventDefault(); return; }
    var first = items[0];
    var last = items[items.length - 1];
    if (!top.overlay.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // confirm({ title, body, ok, cancel }) -> Promise<boolean>. Focus starts on Cancel.
  function confirmDialog(o) {
    return new Promise(function (resolve) {
      var overlay = document.createElement('div');
      overlay.className = 'ss-overlay';
      overlay.innerHTML =
        '<div class="ss-modal" role="alertdialog" aria-modal="true" aria-labelledby="ss-confirm-title" aria-describedby="ss-confirm-body">' +
        '<h2 class="ss-modal__title" id="ss-confirm-title"></h2>' +
        '<div class="ss-modal__body"><p id="ss-confirm-body"></p></div>' +
        '<div class="ss-modal__actions">' +
        '<button class="ss-btn" type="button" data-act="cancel"></button>' +
        '<button class="ss-btn ss-btn--primary" type="button" data-act="ok"></button>' +
        '</div></div>';
      overlay.querySelector('#ss-confirm-title').textContent = o.title;
      overlay.querySelector('#ss-confirm-body').textContent = o.body;
      var cancelBtn = overlay.querySelector('[data-act="cancel"]');
      var okBtn = overlay.querySelector('[data-act="ok"]');
      cancelBtn.textContent = o.cancel;
      okBtn.textContent = o.ok;

      function done(value) {
        close(overlay);
        overlay.remove();
        resolve(value);
      }
      cancelBtn.addEventListener('click', function () { done(false); });
      okBtn.addEventListener('click', function () { done(true); });
      overlay.addEventListener('click', function (e) { if (e.target === overlay) done(false); });

      document.body.appendChild(overlay);
      open(overlay, { onEscape: function () { done(false); }, initialFocus: cancelBtn });
    });
  }

  window.TRV = window.TRV || {};
  window.TRV.modal = { open: open, close: close, focusIn: focusIn };
  window.TRV.confirm = confirmDialog;
})();
