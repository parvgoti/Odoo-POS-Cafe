/**
 * UI/UX Mastery — JavaScript Interaction Utilities
 * Scroll reveal, theme toggle, smooth counters, ripple effects
 */

// === SCROLL REVEAL (Intersection Observer) ===
function initScrollReveal(selector = '.scroll-reveal', options = {}) {
  const defaults = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
  const config = { ...defaults, ...options };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, config);

  document.querySelectorAll(selector).forEach(el => observer.observe(el));
  return observer;
}

// === DARK MODE TOGGLE ===
function initThemeToggle(toggleSelector = '#theme-toggle') {
  const toggle = document.querySelector(toggleSelector);
  const html = document.documentElement;

  // Check saved preference or system preference
  const saved = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (systemDark ? 'dark' : 'light');
  html.setAttribute('data-theme', initial);

  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      toggle.setAttribute('aria-label', `Switch to ${current} mode`);
    });
  }

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
}

// === SMOOTH COUNTER ANIMATION ===
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const startTime = performance.now();
  const format = element.dataset.format || 'number'; // number, currency, percent

  function formatValue(val) {
    switch (format) {
      case 'currency': return '$' + Math.round(val).toLocaleString();
      case 'percent':  return Math.round(val) + '%';
      default:         return Math.round(val).toLocaleString();
    }
  }

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic for natural deceleration
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * eased;
    element.textContent = formatValue(current);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// Auto-init counters on scroll
function initCounters(selector = '[data-counter]') {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.counter, 10);
        const duration = parseInt(entry.target.dataset.duration || '2000', 10);
        animateCounter(entry.target, target, duration);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll(selector).forEach(el => observer.observe(el));
}

// === RIPPLE EFFECT ===
function initRipple(selector = '.btn, .ripple') {
  document.querySelectorAll(selector).forEach(el => {
    el.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute; width: ${size}px; height: ${size}px;
        left: ${x}px; top: ${y}px; border-radius: 50%;
        background: hsla(0, 0%, 100%, 0.25);
        transform: scale(0); animation: ripple-expand 0.6s ease-out;
        pointer-events: none;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Inject ripple keyframes if not exists
  if (!document.querySelector('#ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes ripple-expand {
        to { transform: scale(4); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// === SMOOTH SCROLL TO ANCHOR ===
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update URL without jump
        history.pushState(null, '', this.getAttribute('href'));
      }
    });
  });
}

// === MAGNETIC BUTTON EFFECT ===
function initMagneticButtons(selector = '.btn-magnetic') {
  document.querySelectorAll(selector).forEach(btn => {
    btn.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      this.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    btn.addEventListener('mouseleave', function() {
      this.style.transform = 'translate(0, 0)';
      this.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });

    btn.addEventListener('mouseenter', function() {
      this.style.transition = 'none';
    });
  });
}

// === PARALLAX ON SCROLL ===
function initParallax(selector = '[data-parallax]') {
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  function update() {
    const scrollY = window.scrollY;
    elements.forEach(el => {
      const speed = parseFloat(el.dataset.parallax || '0.5');
      const rect = el.getBoundingClientRect();
      const offset = (rect.top + scrollY - window.innerHeight / 2) * speed;
      el.style.transform = `translateY(${offset}px)`;
    });
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// === INITIALIZE ALL ===
function initAllInteractions() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initScrollReveal();
    initThemeToggle();
    initCounters();
    initRipple();
    initSmoothScroll();
    initMagneticButtons();
    initParallax();
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initScrollReveal, initThemeToggle, animateCounter,
    initCounters, initRipple, initSmoothScroll,
    initMagneticButtons, initParallax, initAllInteractions,
  };
}
