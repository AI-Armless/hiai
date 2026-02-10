/* ════════════════════════════════════════════════════════
   Main JS — Hi, AI!
   ════════════════════════════════════════════════════════ */

/* ── Scroll Reveal ── */

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('vis');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* ── Mobile Nav Toggle ── */

(function () {
  const burger = document.querySelector('.nav__burger');
  const mobile = document.querySelector('.nav__mobile');
  if (!burger || !mobile) return;

  burger.addEventListener('click', () => mobile.classList.toggle('open'));
  mobile.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobile.classList.remove('open'));
  });
})();


/* ── Animated Counters ── */

document.querySelectorAll('[data-count]').forEach(el => {
  const obs = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = +el.dataset.count;
          const suffix = el.dataset.suffix || '';
          const duration = 1800;
          let start = null;
          const emChild = el.querySelector('em');

          function tick(ts) {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3.5);
            const value = Math.round(eased * target) + suffix;

            if (emChild) {
              emChild.textContent = value;
            } else {
              el.textContent = value;
            }

            if (progress < 1) requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  obs.observe(el);
});


/* ── Product Tabs (index page — show/hide all) ── */

(function () {
  var section = document.getElementById('products');
  if (!section) return;
  var tabs = section.querySelectorAll('.ptab');
  var cards = section.querySelectorAll('.pcard');
  if (!tabs.length || !cards.length) return;

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var filter = tab.dataset.filter;
      cards.forEach(function (card) {
        card.style.display = filter === 'all' || card.dataset.type === filter ? '' : 'none';
      });
    });
  });
})();


/* ── Product Showcase (advertise page — paginated) ── */

(function () {
  var wrap = document.getElementById('advProducts');
  if (!wrap) return;

  var PER_PAGE = 6;
  var allCards = [].slice.call(wrap.querySelectorAll('.pcard'));
  var tabs = [].slice.call(wrap.querySelectorAll('.ptab'));
  var info = wrap.querySelector('.aud__pager-info');
  var btnPrev = wrap.querySelector('[data-dir="prev"]');
  var btnNext = wrap.querySelector('[data-dir="next"]');
  var filter = 'all';
  var page = 0;

  function getVisible() {
    return allCards.filter(function (c) {
      return filter === 'all' || c.dataset.type === filter;
    });
  }

  function render() {
    var vis = getVisible();
    var totalPages = Math.max(1, Math.ceil(vis.length / PER_PAGE));
    if (page >= totalPages) page = totalPages - 1;
    if (page < 0) page = 0;

    allCards.forEach(function (c) { c.style.display = 'none'; });
    vis.slice(page * PER_PAGE, (page + 1) * PER_PAGE).forEach(function (c) {
      c.style.display = '';
    });

    info.textContent = (page + 1) + ' / ' + totalPages;
    btnPrev.disabled = page === 0;
    btnNext.disabled = page >= totalPages - 1;
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      filter = t.dataset.filter;
      page = 0;
      render();
    });
  });

  btnPrev.addEventListener('click', function () { page--; render(); });
  btnNext.addEventListener('click', function () { page++; render(); });

  render();
})();


/* ── Nav Scroll (dark hero → solid) ── */

(function () {
  const nav = document.querySelector('.nav--dark');
  const hero = document.querySelector('.hero') || document.querySelector('.adv-hero');
  if (!nav || !hero) return;

  const obs = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        nav.classList.toggle('nav--solid', !entry.isIntersecting);
      });
    },
    { threshold: 0.05 }
  );
  obs.observe(hero);
})();


/* ── Contact Form (Formspree) ── */

(function () {
  const wrapper = document.getElementById('contactForm');
  const form = document.getElementById('contactFormForm');
  if (!wrapper || !form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var action = form.getAttribute('action') || '';
    if (action.indexOf('YOUR_FORMSPREE_FORM_ID') !== -1) {
      alert('Замените YOUR_FORMSPREE_FORM_ID в contact.html на ID формы с formspree.io (в настройках формы добавьте оба email для уведомлений).');
      return;
    }

    var submitBtn = form.querySelector('.form__submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправка…';
    }

    var payload = {
      name: (document.getElementById('name') && document.getElementById('name').value) || '',
      email: (document.getElementById('email') && document.getElementById('email').value) || '',
      company: (document.getElementById('company') && document.getElementById('company').value) || '',
      telegram: (document.getElementById('telegram') && document.getElementById('telegram').value) || '',
      budget: (document.getElementById('budget') && document.getElementById('budget').value) || '',
      message: (document.getElementById('message') && document.getElementById('message').value) || '',
      _subject: 'Новая заявка с сайта Hi, AI'
    };

    fetch(action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (res.ok) {
          wrapper.classList.add('form--sent');
        } else {
          throw new Error('Ошибка отправки');
        }
      })
      .catch(function () {
        alert('Не удалось отправить заявку. Попробуйте позже или напишите в Telegram.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Отправить заявку <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" width="16" height="16"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
        }
      });
  });
})();
