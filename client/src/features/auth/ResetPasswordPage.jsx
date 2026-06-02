import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Lock, Eye, EyeOff, Coffee, CheckCircle, AlertCircle } from 'lucide-react';
import './auth.css';

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirm]     = useState('');
  const [showPassword, setShowPw]         = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [loading, setLoading]             = useState(false);
  const [done, setDone]                   = useState(false);
  const [error, setError]                 = useState('');
  const [sessionReady, setSessionReady]   = useState(false);

  // Supabase sends the recovery token in the URL hash.
  // The JS client parses it automatically and fires PASSWORD_RECOVERY.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
      if (event === 'SIGNED_IN' && window.location.hash.includes('type=recovery')) {
        setSessionReady(true);
      }
    });

    // Also check if already in a recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  function getPasswordStrength(pw) {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8)                       score++;
    if (/[A-Z]/.test(pw))                     score++;
    if (/[0-9]/.test(pw))                     score++;
    if (/[^A-Za-z0-9]/.test(pw))             score++;
    if (score <= 1) return { label: 'Weak',   color: '#ef4444', width: '25%' };
    if (score === 2) return { label: 'Fair',   color: '#f97316', width: '50%' };
    if (score === 3) return { label: 'Good',   color: '#eab308', width: '75%' };
    return              { label: 'Strong', color: '#22c55e', width: '100%' };
  }

  const strength = getPasswordStrength(password);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      const { error: sbErr } = await supabase.auth.updateUser({ password });
      if (sbErr) throw sbErr;
      setDone(true);
      // Auto-redirect to login after 3 s
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Left Panel — Hero */}
      <div className="auth-hero">
        <div className="auth-hero-overlay" />
        <div className="auth-hero-bg" />
        <div className="steam-container">
          <div className="steam steam-1" />
          <div className="steam steam-2" />
          <div className="steam steam-3" />
        </div>
        <div className="auth-hero-content">
          <div className="auth-logo">
            <Coffee size={32} />
            <span>Odoo POS Cafe</span>
          </div>
          <h1 className="auth-hero-title">Create New<br />Password</h1>
          <p className="auth-hero-subtitle">
            Choose a strong password you haven't used before.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">

          {done ? (
            /* ── Success ── */
            <div className="auth-form-header" style={{ textAlign: 'center', paddingTop: 24 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(34,197,94,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <CheckCircle size={32} style={{ color: '#22c55e' }} />
              </div>
              <h2 className="auth-form-title">Password Updated!</h2>
              <p className="auth-form-subtitle" style={{ marginTop: 8 }}>
                Your password has been changed successfully.
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 12 }}>
                Redirecting to login in 3 seconds…
              </p>
              <Link to="/login" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
                Go to Sign In →
              </Link>
            </div>
          ) : !sessionReady ? (
            /* ── Waiting for token ── */
            <div className="auth-form-header" style={{ textAlign: 'center', paddingTop: 24 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(239,68,68,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <AlertCircle size={32} style={{ color: '#ef4444' }} />
              </div>
              <h2 className="auth-form-title">Invalid Link</h2>
              <p className="auth-form-subtitle" style={{ marginTop: 8, lineHeight: 1.7 }}>
                This password reset link has expired or is invalid.<br />
                Please request a new one.
              </p>
              <Link to="/forgot-password" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
                Request New Link →
              </Link>
            </div>
          ) : (
            /* ── Reset form ── */
            <>
              <div className="auth-form-header">
                <h2 className="auth-form-title">Set New Password</h2>
                <p className="auth-form-subtitle">Must be at least 8 characters</p>
              </div>

              {error && (
                <div className="auth-error animate-shake">
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">

                {/* New Password */}
                <div className="input-group">
                  <label className="input-label">New Password</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="reset-password"
                      type={showPassword ? 'text' : 'password'}
                      className="input-field"
                      placeholder="New password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoFocus
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPw(v => !v)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {strength && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{
                        height: 4, borderRadius: 999,
                        background: 'var(--border-default)',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: strength.width,
                          background: strength.color,
                          borderRadius: 999,
                          transition: 'width 0.3s, background 0.3s',
                        }} />
                      </div>
                      <p style={{ fontSize: 11, marginTop: 4, color: strength.color, fontWeight: 600 }}>
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="input-group">
                  <label className="input-label">Confirm New Password</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="reset-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      className="input-field"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={e => setConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                      style={{
                        borderColor: confirmPassword && confirmPassword !== password
                          ? '#ef4444' : undefined,
                      }}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirm(v => !v)}
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4, fontWeight: 500 }}>
                      Passwords don't match
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
                  disabled={loading || !password || !confirmPassword}
                  id="reset-submit"
                >
                  {loading ? 'Updating…' : 'Update Password →'}
                </button>
              </form>
            </>
          )}

          <p className="auth-footer-text" style={{ marginTop: 20 }}>
            <Link to="/login" className="auth-link-bold">← Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
