
/* ═══════════════════════════════════════════════════════
   AVATAR PHOTOS (copyright-free via randomuser.me)
═══════════════════════════════════════════════════════ */
(function () {
  const photos = [
    'https://randomuser.me/api/portraits/women/44.jpg',
    'https://randomuser.me/api/portraits/men/32.jpg',
    'https://randomuser.me/api/portraits/women/68.jpg',
    'https://randomuser.me/api/portraits/men/75.jpg',
    'https://randomuser.me/api/portraits/women/12.jpg',
    'https://randomuser.me/api/portraits/men/54.jpg',
    'https://randomuser.me/api/portraits/women/28.jpg',
  ];
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav__avatar').forEach((av, i) => {
      av.style.backgroundImage = `url(${photos[i % photos.length]})`;
      av.classList.add('has-photo');
    });
  });
})();

// ─── Services fan → grid ──────────────────────────────
(function () {
  const list  = document.querySelector('.svc-grid__list');
  const closeBtn = document.querySelector('.svc-grid__close');
  if (!list) return;

  list.addEventListener('click', function openFan() {
    list.classList.add('open');
    if (closeBtn) closeBtn.hidden = false;
  }, { once: true });

  closeBtn?.addEventListener('click', () => {
    list.classList.remove('open');
    closeBtn.hidden = true;
    // re-enable the open click
    list.addEventListener('click', function openFan() {
      list.classList.add('open');
      closeBtn.hidden = false;
    }, { once: true });
  });
})();

// ─── Nav: stato iniziale prima del primo paint ───────
/* Il flash al caricamento (MENU e simbolo fucsia per un istante,
   poi bianchi) nasceva dal fatto che nav--on-dark veniva applicato
   solo al DOMContentLoaded: la nav aveva gia' dipinto un frame nel
   suo colore di default e la transition di 0.35s rendeva visibile
   il passaggio. Qui lo stato corretto viene calcolato subito —
   main.js sta dopo la hero, quindi la sezione sotto la nav esiste
   gia' — e le transizioni restano congelate per due frame. */
(function () {
  var navEl = document.querySelector('.nav');
  if (!navEl) return;
  navEl.classList.add('nav--boot');

  function bootTheme() {
    var navH = navEl.getBoundingClientRect().height || 80;
    var dark = false;
    document.querySelectorAll('[data-nav-theme="dark"]').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < navH && r.bottom > 0) dark = true;
    });
    navEl.classList.toggle('nav--on-dark', dark);
  }
  bootTheme();

  requestAnimationFrame(function () {
    /* seconda passata: se la hero ha appena preso la sua altezza
       definitiva la misura del primo frame poteva essere parziale */
    bootTheme();
    requestAnimationFrame(function () { navEl.classList.remove('nav--boot'); });
  });
})();
// ─── Nav auto-contrast (dark sections) ───────────────
// Su fondo scuro o fucsia "MENU" e il suo simbolo diventano bianchi:
// lo fa la classe nav--on-dark, che il foglio traduce in colore.
//
// Quali sezioni contano come scure: quelle che lo dichiarano nel
// markup (data-nav-theme="dark") piu' quelle che lo diventano a
// pagina caricata. Sulle pagine servizi il colore di fondo lo
// assegna uno script di alternanza, che aggiunge .svc-bg-dark
// dopo il load: se si osservassero solo le sezioni dichiarate, su
// quelle il MENU restava fucsia sopra il nero. Per questo l'insieme
// viene ricostruito al load, e la sezione fucsia e il footer
// entrano per classe.
document.addEventListener('DOMContentLoaded', function () {
  const navEl = document.querySelector('.nav');
  if (!navEl) return;

  /* Sezioni scure o fucsia. La sezione fucsia dei vantaggi su
     Social ADS resta fuori dall'alternanza degli sfondi, quindi non
     prende .svc-bg-dark: e' marcata nel markup, come tutte le altre
     sezioni che dichiarano il tema. .svc-process entra anche per
     classe perche' il suo fondo e' il fucsia di brand per disegno. */
  const DARK_SEL = '[data-nav-theme="dark"], main > section.svc-bg-dark,' +
                   'main > section.svc-process, .svc-caffe, footer.site-footer';

  // Insieme delle sezioni scure attualmente sotto la nav.
  // Un Set invece di un contatore: con il contatore le callback
  // iniziali "non interseca", che l'observer emette per ogni
  // elemento osservato, sottraevano da un totale già calcolato dal
  // check sincrono e lo mandavano fuori sincrono, lasciando la nav
  // nello stato sbagliato sopra le sezioni scure.
  const darkNow = new Set();
  let obs = null;

  function updateNav() {
    navEl.classList.toggle('nav--on-dark', darkNow.size > 0);
  }

  function makeObserver() {
    const navH = navEl.getBoundingClientRect().height || 80;
    const margin = Math.round(-(window.innerHeight - navH));
    return new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) darkNow.add(e.target);
        else darkNow.delete(e.target);
      });
      updateNav();
    }, {
      rootMargin: '0px 0px ' + margin + 'px 0px',
      threshold: 0,
    });
  }

  function setup() {
    const darkSections = document.querySelectorAll(DARK_SEL);
    if (obs) obs.disconnect();
    darkNow.clear();
    // Check sincrono: applica lo stato corretto prima del primo
    // frame (evita il flickering tra il colore di default e
    // nav--on-dark)
    const navH = navEl.getBoundingClientRect().height || 80;
    darkSections.forEach(function (el) {
      const r = el.getBoundingClientRect();
      if (r.top < navH && r.bottom > 0) darkNow.add(el);
    });
    updateNav();
    if (!darkSections.length) return;
    obs = makeObserver();
    darkSections.forEach(function (el) { obs.observe(el); });
  }

  setup();

  // L'alternanza degli sfondi gira al load: da lì in poi ci sono
  // sezioni scure in piu' da osservare.
  window.addEventListener('load', function () {
    setup();
    setTimeout(setup, 300);
  });
  window.addEventListener('resize', setup, { passive: true });
});

// ─── Nav .scrolled (logo black → color) ──────────────
(function () {
  const navEl = document.querySelector('.nav');
  if (!navEl) return;
  const hero = document.querySelector('.hero-svc-scene, .hero-video, .svc-hero, .d24-hero');
  if (hero) {
    const io = new IntersectionObserver(function (entries) {
      navEl.classList.toggle('scrolled', !entries[0].isIntersecting);
    }, { threshold: 0 });
    io.observe(hero);
  } else {
    navEl.classList.add('scrolled');
  }
})();

// ─── Scroll progress bar ──────────────────────────────
const progressBar = document.createElement('div');
progressBar.className = 'progress-bar';
document.body.prepend(progressBar);

const updateProgress = () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + '%';
};
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// ─── Mega menu toggle ─────────────────────────────────
const nav        = document.querySelector('.nav');
const menuBtn    = document.querySelector('.nav__menu-btn');
const megaWrapper = document.querySelector('.nav__mega-wrapper');
const overlay    = document.querySelector('.nav__overlay');

const openMega  = () => {
  nav.classList.add('menu-open');
  menuBtn.setAttribute('aria-expanded', 'true');
  megaWrapper.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};
const closeMega = () => {
  nav.classList.remove('menu-open');
  menuBtn.setAttribute('aria-expanded', 'false');
  megaWrapper.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

menuBtn?.addEventListener('click', () => {
  nav.classList.contains('menu-open') ? closeMega() : openMega();
});

overlay?.addEventListener('click', closeMega);

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMega(); });

megaWrapper?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMega));


// ─── Logo ticker — scroll continuo pixel-perfect ──────
(function () {
  const track = document.querySelector('.logo-ticker__track');
  if (!track) return;
  const original = track.querySelector('.logo-ticker__set');
  if (!original) return;

  // Clona finché il track è almeno 3x largo rispetto alla viewport
  while (track.offsetWidth < window.innerWidth * 3) {
    const clone = original.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  }

  const SPEED = 32; // px/s
  let pos = 0, raf, lastTime;

  function setW() { return original.offsetWidth; }

  function tick(ts) {
    if (lastTime === undefined) { lastTime = ts; }
    const dt = Math.min((ts - lastTime) / 1000, 0.05); // max 50ms per frame
    lastTime = ts;
    pos += SPEED * dt;
    if (pos >= setW()) pos -= setW(); // salta esattamente un set — nessun vuoto
    track.style.transform = `translateX(-${pos}px)`;
    raf = requestAnimationFrame(tick);
  }

  raf = requestAnimationFrame(tick);

  track.parentElement.addEventListener('mouseenter', () => {
    cancelAnimationFrame(raf); lastTime = undefined;
  });
  track.parentElement.addEventListener('mouseleave', () => {
    lastTime = undefined;
    raf = requestAnimationFrame(tick);
  });
})();


// About video scrub is handled inside scrollEffects()

// ─── Stat counter ─────────────────────────────────────
const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

const animateCounter = (el) => {
  const raw    = el.textContent.trim();
  const suffix = raw.replace(/[0-9]/g, '');
  const target = parseInt(raw, 10);
  if (isNaN(target)) return;

  const duration = 1200;
  const start    = performance.now();

  const tick = (now) => {
    const elapsed  = Math.min(now - start, duration);
    const progress = easeOutQuart(elapsed / duration);
    el.textContent = Math.round(target * progress) + suffix;
    if (elapsed < duration) requestAnimationFrame(tick);
    else el.textContent = raw;
  };

  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat__number').forEach(el => counterObserver.observe(el));


// ─── Hero gradient parallax (desktop) ─────────────────
const heroGradient = document.querySelector('.hero__gradient');
if (heroGradient && window.matchMedia('(pointer: fine)').matches) {
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

  window.addEventListener('mousemove', e => {
    targetX = (e.clientX / window.innerWidth  - 0.5) * 28;
    targetY = (e.clientY / window.innerHeight - 0.5) * 18;
  }, { passive: true });

  const animParallax = () => {
    currentX += (targetX - currentX) * 0.055;
    currentY += (targetY - currentY) * 0.055;
    heroGradient.style.transform = `translate(${currentX}px, ${currentY}px)`;
    requestAnimationFrame(animParallax);
  };
  animParallax();
}

// ─── Magnetic buttons (desktop) ───────────────────────
if (window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches) {
  document.querySelectorAll('.btn--primary, .nav__cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const dx = (e.clientX - cx) * 0.28;
      const dy = (e.clientY - cy) * 0.28;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// ─── Cursor glow (desktop) ────────────────────────────
// In modalità capture non va creato: è un layer fisso di 600px che
// finirebbe nello screenshot come un alone fuori contesto.
if (!window.__STATIC_CAPTURE__ &&
    window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches) {
  const glow = document.createElement('div');
  Object.assign(glow.style, {
    position: 'fixed', pointerEvents: 'none', zIndex: '9999',
    width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(219,0,90,0.07) 0%, rgba(219,0,90,0.022) 40%, transparent 70%)',
    transform: 'translate(-50%,-50%)', top: '0', left: '0',
    transition: 'opacity 0.3s',
  });
  document.body.appendChild(glow);

  let mx = 0, my = 0, gx = 0, gy = 0;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  const tick = () => {
    gx += (mx - gx) * 0.07;
    gy += (my - gy) * 0.07;
    glow.style.left = gx + 'px';
    glow.style.top  = gy + 'px';
    requestAnimationFrame(tick);
  };
  tick();
}

// ─── Clients filter ───────────────────────────────────
(function () {
  const filters = document.querySelectorAll('.clients__filter');
  const logos   = document.querySelectorAll('.client-logo[data-category]');
  if (!filters.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.filter;
      logos.forEach(logo => {
        const match = cat === 'all' || logo.dataset.category === cat;
        if (match) {
          logo.classList.remove('hidden');
          logo.classList.add('visible');
        } else {
          logo.classList.add('hidden');
          logo.classList.remove('visible');
        }
      });
    });
  });
})();

// ─── Accordion produzione contenuti ──────────────────────────
(function () {
  document.querySelectorAll('.svc-acc').forEach(function (acc) {
    acc.querySelectorAll('.svc-acc__trigger').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.svc-acc__item');
        var isOpen = item.classList.contains('is-open');
        // chiudi tutti nella stessa lista
        acc.querySelectorAll('.svc-acc__item.is-open').forEach(function (open) {
          open.classList.remove('is-open');
          open.querySelector('.svc-acc__trigger').setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });
})();

// ─── Zampa caffè: gestita dal RAF scroll-driven ──────────────

// ─── Coda fucsia: slide-in da sinistra ────────────────────────
(function () {
  const tail = document.querySelector('.about-section__tail');
  if (!tail) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced) {
    tail.style.transform = 'translateX(-150%) scaleX(-1) scaleY(-1)';
    tail.style.opacity = '0';
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        tail.style.transform = '';
        tail.style.opacity = '';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  io.observe(tail);
})();

// (Video about gestito dal blocco scroll-scrubbed sopra)

// ─── Nav: scompare sul footer, riappare su scroll-up ─────────
(function () {
  var navEl    = document.querySelector('.nav');
  var footerEl = document.querySelector('.site-footer');
  if (!navEl || !footerEl) return;

  var footerVisible = false;
  var lastY = window.scrollY;
  var scrollingUp = false;

  var io = new IntersectionObserver(function (entries) {
    footerVisible = entries[0].isIntersecting;
    update();
  }, { threshold: 0 });
  io.observe(footerEl);

  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    scrollingUp = y < lastY;
    lastY = y;
    update();
  }, { passive: true });

  function update() {
    var menuOpen = navEl.classList.contains('menu-open');
    navEl.classList.toggle('nav--footer-hidden', footerVisible && !scrollingUp && !menuOpen);
  }

  /* re-evaluate whenever menu opens or closes */
  new MutationObserver(update).observe(navEl, { attributes: true, attributeFilter: ['class'] });
})();



// ─── Icon grid produzione contenuti ──────────────────────────
(function () {
  document.querySelectorAll('.svc-icons-grid').forEach(function (grid) {
    grid.querySelectorAll('.svc-icon-card').forEach(function (card) {
      var btn = card.querySelector('.svc-icon-card__btn');
      if (!btn) return;
      btn.addEventListener('click', function () {
        var isOpen = card.classList.contains('is-open');
        // chiudi tutti nella stessa griglia
        grid.querySelectorAll('.svc-icon-card.is-open').forEach(function (c) {
          c.classList.remove('is-open');
        });
        if (!isOpen) card.classList.add('is-open');
      });
    });
  });
})();

// ─── About video: play quando visibile ───────────────────────────────────
(function () {
  const vid = document.querySelector('#chi-siamo .about-section__cat');
  if (!vid) return;
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { vid.play().catch(() => {}); }
    else { vid.pause(); }
  }, { threshold: 0.1 });
  io.observe(vid);
}());

/* ═══════════════════════════════════════════════════════
   PAGE FAQ — titolo animato (parola per parola)
═══════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════
   PAGE FAQ — accordion
═══════════════════════════════════════════════════════ */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.page-faq__list').forEach(function (list) {
      var first = list.querySelector('.page-faq__item');
      if (first) {
        first.classList.add('open');
        first.querySelector('.page-faq__question').setAttribute('aria-expanded', 'true');
      }
    });
    var EYE_OPEN = '<svg class="eye-open" viewBox="0 0 56 52" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 26C10 13 20 8 28 8C36 8 46 13 52 26C46 39 36 44 28 44C20 44 10 39 4 26Z"/><circle cx="28" cy="26" r="9"/><circle cx="28" cy="26" r="4"/><line x1="10" y1="15" x2="7" y2="7"/><line x1="19" y1="9" x2="18" y2="1"/><line x1="28" y1="8" x2="28" y2="0"/><line x1="37" y1="9" x2="38" y2="1"/><line x1="46" y1="15" x2="49" y2="7"/><line x1="10" y1="37" x2="7" y2="45"/><line x1="19" y1="43" x2="18" y2="51"/><line x1="28" y1="44" x2="28" y2="52"/><line x1="37" y1="43" x2="38" y2="51"/><line x1="46" y1="37" x2="49" y2="45"/></svg>';
    var EYE_CLOSED = '<svg class="eye-closed" viewBox="0 0 56 52" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 26C10 39 20 44 28 44C36 44 46 39 52 26"/><line x1="10" y1="37" x2="7" y2="45"/><line x1="19" y1="43" x2="18" y2="51"/><line x1="28" y1="44" x2="28" y2="52"/><line x1="37" y1="43" x2="38" y2="51"/><line x1="46" y1="37" x2="49" y2="45"/></svg>';

    document.querySelectorAll('.page-faq__question').forEach(function (btn) {
      var icon = document.createElement('span');
      icon.className = 'page-faq__eye';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = EYE_OPEN + EYE_CLOSED;
      btn.appendChild(icon);

      btn.addEventListener('click', function () {
        var item = btn.closest('.page-faq__item');
        var isOpen = item.classList.contains('open');
        item.closest('.page-faq__list').querySelectorAll('.page-faq__item.open').forEach(function (el) {
          el.classList.remove('open');
          el.querySelector('.page-faq__question').setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
      });
    });
  });
}());

/* ── Case Studies tabs ─────────────────────────────── */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var tabs   = document.querySelectorAll('.cst-tab');
    var panels = document.querySelectorAll('.cst-panel');
    if (!tabs.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var key = tab.getAttribute('data-cst');
        tabs.forEach(function (t) {
          t.classList.remove('on');
          t.setAttribute('aria-selected', 'false');
        });
        panels.forEach(function (p) { p.classList.remove('on'); });
        tab.classList.add('on');
        tab.setAttribute('aria-selected', 'true');
        var panel = document.querySelector('[data-cst-panel="' + key + '"]');
        if (panel) panel.classList.add('on');
      });
    });
  });
}());

