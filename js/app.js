// Landing page: pick how many ranks (1-10), then open the editor.
(function () {
  'use strict';

  var grid = document.getElementById('rank-grid');
  var startBtn = document.getElementById('btn-start');
  var selected = 0;

  for (var n = 1; n <= 10; n++) {
    (function (num) {
      var btn = document.createElement('button');
      btn.className = 'rank-btn';
      btn.type = 'button';
      btn.textContent = num;
      btn.addEventListener('click', function () {
        selected = num;
        var all = grid.querySelectorAll('.rank-btn');
        for (var i = 0; i < all.length; i++) all[i].classList.remove('selected');
        btn.classList.add('selected');
        startBtn.disabled = false;
      });
      grid.appendChild(btn);
    })(n);
  }

  startBtn.addEventListener('click', function () {
    if (selected >= 1) location.href = 'editor.html?rank=' + selected;
  });
})();
