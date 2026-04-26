import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  Mail, Lock, Eye, EyeOff, User, Phone, Coffee, Check,
  ArrowLeft, RefreshCw, ShieldCheck
} from 'lucide-react';
import './auth.css';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function SignupPage() {
  // ── Step management ──────────────────────────────────────────────
  const [step, setStep] = useState('form'); // 'form' | 'otp'

  // ── Form fields ──────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
  });
  const [showPassword, setShowPassword] = useState(false);

  // ── OTP state ────────────────────────────────────────────────────
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef([]);

  // ── Shared state ─────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signUp, verifyOtp, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect
  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  // ── Resend countdown ─────────────────────────────────────────────
  useEffect(() => {
    if (step !== 'otp') return;
    setResendTimer(RESEND_COOLDOWN);
    setCanResend(false);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // ── Auto-focus first OTP box when step changes ───────────────────
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    }
  }, [step]);

  // ── Helpers ───────────────────────────────────────────────────────
  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function getPasswordStrength() {
    const { password } = form;
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  }

  const passwordStrength = getPasswordStrength();
  const passwordsMatch = form.password && form.confirmPassword && form.password === form.confirmPassword;

  // ── OTP digit handlers ────────────────────────────────────────────
  function handleOtpChange(index, value) {
    // Only allow single digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setError('');

    // Auto-advance focus
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace') {
      if (otpDigits[index]) {
        // Clear current
        const newDigits = [...otpDigits];
        newDigits[index] = '';
        setOtpDigits(newDigits);
      } else if (index > 0) {
        // Move to previous
        otpRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      handleOtpSubmit(e);
    }
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newDigits = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((d, i) => { newDigits[i] = d; });
    setOtpDigits(newDigits);
    // Focus the next empty box or last box
    const nextEmpty = newDigits.findIndex(d => !d);
    const focusIdx = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
    otpRefs.current[focusIdx]?.focus();
  }

  // ── Form submit → trigger signUp → move to OTP step ──────────────
  async function handleFormSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const data = await signUp({
        email: form.email,
        password: form.password,
        name: form.name,
        role: form.role,
      });

      // Email confirmation is OFF in Supabase → session returned immediately → go to dashboard
      if (data.session) {
        navigate('/');
        return;
      }

      // User already exists but unconfirmed → treat as OTP sent
      if (data.user && !data.session) {
        setOtpDigits(Array(OTP_LENGTH).fill(''));
        setStep('otp');
        return;
      }

      // Fallback: go to OTP step
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setStep('otp');
    } catch (err) {
      console.error('Signup error:', err);
      const msg = err.message || '';
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setError('This email is already registered. Try logging in instead.');
      } else if (msg.includes('rate limit') || msg.includes('too many') || msg.includes('429')) {
        setError('Too many attempts. Please wait a few minutes and try again.');
      } else if (msg.includes('sending confirmation email') || msg.includes('Error sending')) {
        setError('Could not send OTP email. Please try again in a minute.');
      } else if (msg.includes('invalid email') || msg.includes('Invalid email')) {
        setError('Please enter a valid email address.');
      } else {
        setError(msg || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }


  // ── OTP submit → verify → navigate to dashboard ──────────────────
  async function handleOtpSubmit(e) {
    e?.preventDefault();
    const token = otpDigits.join('');
    if (token.length < OTP_LENGTH) {
      setError('Please enter all 6 digits');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await verifyOtp({
        email: form.email,
        token,
        name: form.name,
        role: form.role,
      });
      navigate('/');
    } catch (err) {
      console.error('OTP verify error:', err);
      if (err.message?.includes('expired') || err.message?.includes('invalid')) {
        setError('Invalid or expired code. Please try again or resend.');
      } else {
        setError(err.message || 'Verification failed. Please try again.');
      }
      // Shake + clear inputs on failure
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  }

  // ── Resend OTP ────────────────────────────────────────────────────
  async function handleResend() {
    if (!canResend) return;
    setError('');
    setLoading(true);
    try {
      await signUp({
        email: form.email,
        password: form.password,
        name: form.name,
        role: form.role,
      });
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setSuccess('A new code has been sent to your email.');
      setResendTimer(RESEND_COOLDOWN);
      setCanResend(false);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError('Failed to resend. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="auth-page auth-page-signup">
      {/* ── Left Panel — Form ── */}
      <div className="auth-form-panel">
        <div className="auth-form-container">

          {/* ━━━ STEP 1: Registration Form ━━━ */}
          <div className={`signup-step ${step === 'form' ? 'signup-step--active' : 'signup-step--exit-left'}`}>
            <div className="auth-form-header">
              <h2 className="auth-form-title">Create Account</h2>
              <p className="auth-form-subtitle">Set up your POS terminal access</p>
            </div>

            {error && step === 'form' && (
              <div className="auth-error animate-shake">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="auth-form">
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    id="signup-name"
                    type="text"
                    className="input-field"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="signup-email"
                    type="email"
                    className="input-field"
                    placeholder="john@cafe.com"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input
                    id="signup-phone"
                    type="tel"
                    className="input-field"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field"
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.password && (
                  <div className="password-strength">
                    {[1, 2, 3, 4].map(level => (
                      <div
                        key={level}
                        className={`password-strength-bar ${
                          passwordStrength >= level
                            ? passwordStrength <= 1 ? 'weak'
                            : passwordStrength <= 2 ? 'medium'
                            : 'strong'
                            : ''
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="signup-confirm-password"
                    type="password"
                    className="input-field"
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    required
                  />
                  {passwordsMatch && (
                    <span className="password-match-icon">
                      <Check size={18} />
                    </span>
                  )}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Role</label>
                <select
                  id="signup-role"
                  className="select-field"
                  value={form.role}
                  onChange={(e) => updateField('role', e.target.value)}
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
                disabled={loading}
                id="signup-submit"
              >
                {loading ? 'Sending Code...' : 'Continue →'}
              </button>
            </form>

            <p className="auth-footer-text">
              Already have an account? <Link to="/login" className="auth-link-bold">Sign In</Link>
            </p>
          </div>

          {/* ━━━ STEP 2: OTP Verification ━━━ */}
          <div className={`signup-step ${step === 'otp' ? 'signup-step--active' : 'signup-step--enter-right'}`}>
            {/* Back button */}
            <button
              type="button"
              className="otp-back-btn"
              onClick={() => { setStep('form'); setError(''); setSuccess(''); }}
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <div className="otp-header">
              <div className="otp-shield-icon">
                <ShieldCheck size={36} />
              </div>
              <h2 className="auth-form-title">Verify Your Email</h2>
              <p className="auth-form-subtitle">
                We sent a 6-digit code to<br />
                <strong className="otp-email-highlight">{form.email}</strong>
              </p>
            </div>

            {error && step === 'otp' && (
              <div className="auth-error animate-shake">
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="auth-success">
                <Check size={16} />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleOtpSubmit} className="auth-form">
              {/* OTP Digit Boxes */}
              <div className="otp-input-row">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => (otpRefs.current[index] = el)}
                    id={`otp-digit-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    className={`otp-box ${digit ? 'otp-box--filled' : ''}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={index === 0 ? handleOtpPaste : undefined}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              <button
                type="submit"
                className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
                disabled={loading || otpDigits.join('').length < OTP_LENGTH}
                id="otp-verify-submit"
              >
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
            </form>

            {/* Resend section */}
            <div className="otp-resend">
              {canResend ? (
                <button
                  type="button"
                  className="otp-resend-btn"
                  onClick={handleResend}
                  disabled={loading}
                >
                  <RefreshCw size={14} />
                  Resend Code
                </button>
              ) : (
                <p className="otp-resend-timer">
                  Resend code in <strong>{resendTimer}s</strong>
                </p>
              )}
            </div>

            <p className="otp-help-text">
              Didn't receive an email? Check your spam folder or go back to verify the address.
            </p>
          </div>

        </div>
      </div>

      {/* ── Right Panel — Hero ── */}
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
          <h1 className="auth-hero-title">Join the<br />Revolution.</h1>
          <p className="auth-hero-subtitle">
            Set up your premium POS system in minutes. Built for cafes that care about experience.
          </p>
        </div>
      </div>
    </div>
  );
}
