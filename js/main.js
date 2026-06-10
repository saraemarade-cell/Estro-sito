// ─── Dropdown ─────────────────────────────────────────
document.querySelectorAll('.nav__dropdown').forEach(dropdown => {
  const toggle = dropdown.querySelector('.nav__dropdown-toggle');
  const menu   = dropdown.querySelector('.nav__dropdown-menu');

  // open/close on click (touch + keyboard users)
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = dropdown.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
  });

  // close when clicking outside
  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });

  // close on Escape
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
    document.querySelectorAll('.hero__title .line-inner').forEach(el => {
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

// ─── Mobile menu ──────────────────────────────────────
const hamburger  = document.querySelector('.nav__hamburger');
const mobileMenu = document.querySelector('.nav__mobile');
const mobileClose = document.querySelector('.nav__mobile-close');

const openMenu  = () => { mobileMenu.classList.add('open'); mobileMenu.setAttribute('aria-hidden','false'); document.body.style.overflow = 'hidden'; hamburger.setAttribute('aria-expanded','true'); };
const closeMenu = () => { mobileMenu.classList.remove('open'); mobileMenu.setAttribute('aria-hidden','true'); document.body.style.overflow = ''; hamburger.setAttribute('aria-expanded','false'); };

hamburger?.addEventListener('click', openMenu);
mobileClose?.addEventListener('click', closeMenu);
document.querySelectorAll('.nav__mobile-link').forEach(l => l.addEventListener('click', closeMenu));

// close on Escape
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

// ─── Cursor glow (desktop) ────────────────────────────
if (window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches) {
  const glow = document.createElement('div');
  Object.assign(glow.style, {
    position: 'fixed', pointerEvents: 'none', zIndex: '9999',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,255,127,0.035) 0%, transparent 65%)',
    transform: 'translate(-50%,-50%)', top: '0', left: '0',
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
