/**
 * Frontend Mastery - JavaScript Utilities (2026)
 * ================================================
 * Drop-in utility functions for premium web experiences.
 * Import what you need, tree-shake the rest.
 */

// ============================================
// THEME MANAGEMENT
// ============================================

/**
 * Initialize theme from localStorage or system preference.
 * Call once on page load.
 */
export function initTheme() {
  const stored = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (systemPrefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
}

/**
 * Toggle between light/dark themes with optional View Transitions API.
 */
export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';

  if (document.startViewTransition) {
    document.startViewTransition(() => {
      document.documentElement.setAttribute('data-theme', next);
    });
  } else {
    document.documentElement.setAttribute('data-theme', next);
  }

  localStorage.setItem('theme', next);
  return next;
}


// ============================================
// SCROLL ANIMATIONS
// ============================================

/**
 * Initialize scroll-triggered reveal animations.
 * Elements with .reveal class will animate in when scrolled into view.
 */
export function initScrollReveal(options = {}) {
  const {
    selector = '.reveal, .reveal-left, .reveal-right, .reveal-scale',
    threshold = 0.15,
    rootMargin = '0px 0px -50px 0px',
    once = true
  } = options;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          if (once) observer.unobserve(entry.target);
        }
      });
    },
    { threshold, rootMargin }
  );

  document.querySelectorAll(selector).forEach(el => observer.observe(el));
  return observer;
}


// ============================================
// COUNTER ANIMATION
// ============================================

/**
 * Animate a number counting up from 0 to target.
 * @param {HTMLElement} element - Element to update
 * @param {number} target - Target number
 * @param {number} duration - Animation duration in ms
 * @param {string} suffix - Optional suffix (e.g., '%', '+', 'K')
 */
export function animateCounter(element, target, duration = 2000, suffix = '') {
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.floor(eased * target);

    element.textContent = current.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target.toLocaleString() + suffix;
    }
  }

  requestAnimationFrame(update);
}

/**
 * Auto-init counters when they scroll into view.
 * Elements should have data-target="1000" and optionally data-suffix="+".
 */
export function initCounters(selector = '[data-counter]') {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target || el.dataset.counter, 10);
          const suffix = el.dataset.suffix || '';
          const duration = parseInt(el.dataset.duration || '2000', 10);
          animateCounter(el, target, duration, suffix);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll(selector).forEach(el => observer.observe(el));
}


// ============================================
// SMOOTH SCROLL
// ============================================

/**
 * Smooth scroll to a target element.
 */
export function scrollTo(target, offset = 0) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}

/**
 * Init smooth scroll for all anchor links.
 */
export function initSmoothScroll(offset = 80) {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) scrollTo(target, offset);
    });
  });
}


// ============================================
// DEBOUNCE & THROTTLE
// ============================================

export function debounce(fn, delay = 150) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle(fn, limit = 150) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}


// ============================================
// COPY TO CLIPBOARD
// ============================================

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
}


// ============================================
// TOAST NOTIFICATIONS
// ============================================

let toastContainer = null;

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed; top: 1rem; right: 1rem; z-index: 600;
      display: flex; flex-direction: column; gap: 0.75rem;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

/**
 * Show a toast notification.
 * @param {string} message - Toast message
 * @param {'success'|'error'|'warning'|'info'} type - Toast type
 * @param {number} duration - Auto-dismiss in ms (0 = manual)
 */
export function showToast(message, type = 'info', duration = 4000) {
  const container = getToastContainer();

  const icons = {
    success: '✓', error: '✕', warning: '⚠', info: 'ℹ'
  };

  const toast = document.createElement('div');
  toast.style.cssText = `
    pointer-events: all;
    background: var(--surface-elevated, #fff);
    border: 1px solid var(--border-default, #e2e8f0);
    border-radius: 1rem;
    padding: 1rem 1.25rem;
    box-shadow: 0 20px 25px rgba(0,0,0,0.1);
    display: flex; align-items: center; gap: 0.75rem;
    min-width: 320px; max-width: 420px;
    animation: slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    font-family: var(--font-sans, system-ui);
    font-size: 0.875rem;
    color: var(--text-primary, #1a1a2e);
  `;

  toast.innerHTML = `
    <span style="font-size:1.1rem">${icons[type]}</span>
    <span style="flex:1">${message}</span>
    <button onclick="this.parentElement.remove()" style="cursor:pointer;opacity:0.5;background:none;border:none;font-size:1rem;color:inherit">✕</button>
  `;

  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  return toast;
}


// ============================================
// TYPEWRITER EFFECT
// ============================================

/**
 * Typewriter effect for text elements.
 */
export function typewriter(element, text, speed = 50) {
  return new Promise((resolve) => {
    let i = 0;
    element.textContent = '';

    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        resolve();
      }
    }

    type();
  });
}


// ============================================
// PARALLAX
// ============================================

/**
 * Simple scroll-based parallax for background elements.
 */
export function initParallax(selector = '[data-parallax]') {
  const elements = document.querySelectorAll(selector);

  function update() {
    const scrollY = window.scrollY;
    elements.forEach(el => {
      const speed = parseFloat(el.dataset.parallax || '0.5');
      const yPos = -(scrollY * speed);
      el.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
  }

  window.addEventListener('scroll', throttle(update, 16), { passive: true });
  update();
}


// ============================================
// MASTER INIT
// ============================================

/**
 * Initialize all utilities. Call once on DOMContentLoaded.
 */
export function initAll() {
  initTheme();
  initScrollReveal();
  initCounters();
  initSmoothScroll();
  initParallax();
}

// Auto-init when used as a script tag
if (typeof window !== 'undefined' && !window.__FM_INIT) {
  window.__FM_INIT = true;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
}
