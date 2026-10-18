// Landing page: pick how many ranks (1-10), then open the editor.
(function () {
  'use strict';

  var grid = document.getElementById('rank-grid');
  var startBtn = document.getElementById('btn-start');
  var selected = 0;

  for (var n = 1; n <= 10; n++) {
    (function (num) {
      var btn = document.createElement('button');
      btn.className = 'ss-segmented__option';
      btn.type = 'button';
      btn.textContent = num;
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', function () {
        selected = num;
        var all = grid.querySelectorAll('.ss-segmented__option');
        for (var i = 0; i < all.length; i++) all[i].setAttribute('aria-pressed', String(all[i] === btn));
        startBtn.disabled = false;
      });
      grid.appendChild(btn);
    })(n);
  }

  startBtn.addEventListener('click', function () {
    if (selected >= 1) location.href = 'editor.html?rank=' + selected;
  });
})();
