// LexCollect preview site: mobile menu, blog filters, demo forms, footer year.
(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  if (header && toggle) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) {
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // Blog category chips
  var chips = document.querySelectorAll('.chip[data-filter]');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
      document.querySelectorAll('[data-cat]').forEach(function (card) {
        card.hidden = !(f === 'all' || card.getAttribute('data-cat') === f);
      });
    });
  });

  // Preview-only forms: the live site uses the WordPress contact form instead.
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var status = form.querySelector('.form-status');
      if (status) {
        status.classList.add('is-visible');
        status.focus();
      }
    });
  });

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
