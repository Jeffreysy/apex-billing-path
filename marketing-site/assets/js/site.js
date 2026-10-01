// LexCollect preview site: mobile menu, blog filters, demo forms, footer year.
(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  if (header && toggle) {
    var closeMenu = function () {
      header.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) {
        closeMenu();
        toggle.focus();
      }
    });
    // In-page links (#contact etc.) don't navigate away, so close the menu ourselves.
    header.querySelectorAll('.nav a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    // Don't leave the menu open behind the desktop nav (matches the 860px breakpoint in styles.css).
    var desktop = window.matchMedia('(min-width: 861px)');
    var onChange = function (mq) { if (mq.matches) closeMenu(); };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
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
        // A plain div can't take focus without tabindex, so the confirmation was never announced.
        if (!status.hasAttribute('tabindex')) status.setAttribute('tabindex', '-1');
        status.focus();
      }
    });
  });

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
