import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Phone, Coffee, Check } from 'lucide-react';
import './auth.css';

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect
  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

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

  async function handleSubmit(e) {
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

      // If session returned (email confirmation disabled), go to dashboard
      if (data.session) {
        navigate('/');
      } else {
        // Email confirmation required
        setSuccess('Account created! Please check your email to confirm, then log in.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      if (err.message?.includes('already registered')) {
        setError('This email is already registered. Try logging in instead.');
      } else {
        setError(err.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page auth-page-signup">
      {/* Left Panel — Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Create Account</h2>
            <p className="auth-form-subtitle">Set up your POS terminal access</p>
          </div>

          {error && (
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

          <form onSubmit={handleSubmit} className="auth-form">
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login" className="auth-link-bold">Sign In</Link>
          </p>
        </div>
      </div>

      {/* Right Panel — Hero */}
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
