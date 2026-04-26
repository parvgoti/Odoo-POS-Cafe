/**
 * Frontend Mastery - React Components Cheatsheet (2026)
 * =====================================================
 * Modern React 19 component patterns. Copy-paste ready.
 */

// ============================================
// 1. BUTTON COMPONENT
// ============================================
/*
import { forwardRef } from 'react';

const Button = forwardRef(({
  children,
  variant = 'primary',        // primary | secondary | ghost | outline | danger
  size = 'md',                // sm | md | lg | xl
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}, ref) => {
  const baseClass = 'btn';
  const classes = [
    baseClass,
    `btn-${variant}`,
    size !== 'md' ? `btn-${size}` : '',
    loading ? 'btn-loading' : '',
    fullWidth ? 'btn-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
*/


// ============================================
// 2. INPUT COMPONENT
// ============================================
/*
import { forwardRef, useId } from 'react';

const Input = forwardRef(({
  label,
  error,
  hint,
  required = false,
  className = '',
  ...props
}, ref) => {
  const id = useId();

  return (
    <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className={`input-label ${required ? 'input-label-required' : ''}`}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`input-field ${error ? 'error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      />
      {hint && !error && <p id={`${id}-hint`} className="input-hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="input-error-text" role="alert">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
*/


// ============================================
// 3. CARD COMPONENT
// ============================================
/*
export function Card({
  children,
  variant = 'default',  // default | glass | interactive
  hover = false,
  className = '',
  ...props
}) {
  const classes = [
    variant === 'glass' ? 'glass-card' : 'card',
    hover ? 'card-hover' : '',
    variant === 'interactive' ? 'card-interactive' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
*/


// ============================================
// 4. useTheme HOOK
// ============================================
/*
import { useState, useEffect, useCallback } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  return { theme, setTheme, toggle, isDark: theme === 'dark' };
}
*/


// ============================================
// 5. useScrollReveal HOOK
// ============================================
/*
import { useEffect, useRef } from 'react';

export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px', ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

// Usage: <div ref={useScrollReveal()} className="reveal">Content</div>
*/


// ============================================
// 6. useMediaQuery HOOK
// ============================================
/*
import { useState, useEffect } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = (e) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// Usage: const isMobile = useMediaQuery('(max-width: 768px)');
*/


// ============================================
// 7. useClickOutside HOOK
// ============================================
/*
import { useEffect, useRef } from 'react';

export function useClickOutside(callback) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [callback]);

  return ref;
}
*/

console.log('React components cheatsheet loaded — see file comments for patterns.');
