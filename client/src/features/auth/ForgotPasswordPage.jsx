import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Mail, Coffee, ArrowLeft, CheckCircle } from 'lucide-react';
import './auth.css';

export default function ForgotPasswordPage() {
  const [email, setSEmail]     = useState('');
  const [loading, setLoading]  = useState(false);
  const [sent, setSent]        = useState(false);
  const [error, setError]      = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: sbErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (sbErr) throw sbErr;
      setSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
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
          <h1 className="auth-hero-title">Reset Your<br />Password</h1>
          <p className="auth-hero-subtitle">
            Enter the email associated with your account and we'll send you a secure reset link.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">

          {!sent ? (
            <>
              <div className="auth-form-header">
                <h2 className="auth-form-title">Forgot Password?</h2>
                <p className="auth-form-subtitle">
                  No worries — we'll email you a reset link
                </p>
              </div>

              {error && (
                <div className="auth-error animate-shake">
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="input-icon" />
                    <input
                      id="forgot-email"
                      type="email"
                      className="input-field"
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setSEmail(e.target.value)}
                      required
                      autoFocus
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
                  disabled={loading || !email}
                  id="forgot-submit"
                >
                  {loading ? 'Sending…' : 'Send Reset Link →'}
                </button>
              </form>
            </>
          ) : (
            /* ── Success state ── */
            <div className="auth-form-header" style={{ textAlign: 'center', paddingTop: 24 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(34,197,94,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <CheckCircle size={32} style={{ color: '#22c55e' }} />
              </div>
              <h2 className="auth-form-title">Check your inbox!</h2>
              <p className="auth-form-subtitle" style={{ marginTop: 8, lineHeight: 1.7 }}>
                We sent a password reset link to<br />
                <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 16 }}>
                Didn't receive it? Check spam or&nbsp;
                <button
                  onClick={() => setSent(false)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-primary)', fontWeight: 600, fontSize: 12,
                    textDecoration: 'underline',
                  }}
                >
                  try again
                </button>
              </p>
            </div>
          )}

          <p className="auth-footer-text" style={{ marginTop: 24 }}>
            <Link to="/login" className="auth-link-bold" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </p>

          <div className="terminal-status">
            <div className="terminal-status-dot" />
            <div>
              <span className="terminal-status-label">TERMINAL STATUS</span>
              <span className="terminal-status-value">Secure &amp; Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
