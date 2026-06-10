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

// ─── Dropdown ─────────────────────────────────────────
document.querySelectorAll('.nav__dropdown').forEach(dropdown => {
  const toggle = dropdown.querySelector('.nav__dropdown-toggle');
  const menu   = dropdown.querySelector('.nav__dropdown-menu');

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = dropdown.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
  });

  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });

  dropdown.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      dropdown.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });
});

// ─── Nav scroll ───────────────────────────────────────
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ─── Hero title reveal ────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    document.querySelectorAll('.hero__title .line-inner, .hero-home__title .line-inner').forEach(el => {
      el.classList.add('visible');
    });
  });
});

// ─── Reveal on scroll ─────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

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

// ─── Mobile menu ──────────────────────────────────────
const hamburger   = document.querySelector('.nav__hamburger');
const mobileMenu  = document.querySelector('.nav__mobile');
const mobileClose = document.querySelector('.nav__mobile-close');

const openMenu  = () => { mobileMenu.classList.add('open'); mobileMenu.setAttribute('aria-hidden','false'); document.body.style.overflow = 'hidden'; hamburger.setAttribute('aria-expanded','true'); };
const closeMenu = () => { mobileMenu.classList.remove('open'); mobileMenu.setAttribute('aria-hidden','true'); document.body.style.overflow = ''; hamburger.setAttribute('aria-expanded','false'); };

hamburger?.addEventListener('click', openMenu);
mobileClose?.addEventListener('click', closeMenu);
document.querySelectorAll('.nav__mobile-link').forEach(l => l.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

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
if (window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches) {
  const glow = document.createElement('div');
  Object.assign(glow.style, {
    position: 'fixed', pointerEvents: 'none', zIndex: '9999',
    width: '420px', height: '420px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(219,0,90,0.04) 0%, transparent 65%)',
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
