import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Mail, Lock, Eye, EyeOff, Coffee } from 'lucide-react';
import './auth.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn({ email, password });
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    setError('');
    setLoading(true);
    try {
      // First try to sign in with demo credentials
      try {
        await signIn({ email: 'admin@odoo-cafe.com', password: 'admin123' });
        navigate('/');
        return;
      } catch {
        // If login fails, create the demo account first
      }

      // Create demo account, then sign in
      try {
        await signUp({
          email: 'admin@odoo-cafe.com',
          password: 'admin123',
          name: 'Admin User',
          role: 'admin',
        });
        // signUp auto-sets the user if session is available
        navigate('/');
      } catch (signUpErr) {
        // If signup also fails (already exists but wrong password), show error
        setError('Could not auto-create demo account. Try signing up manually.');
        console.error('Demo login error:', signUpErr);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Left Panel — Hero Image */}
      <div className="auth-hero">
        <div className="auth-hero-overlay" />
        <div className="auth-hero-bg" />
        
        {/* Steam Particles */}
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
          <h1 className="auth-hero-title">Serve Smarter.<br />Manage Effortlessly.</h1>
          <p className="auth-hero-subtitle">
            Experience the digital sommelier of point-of-sale systems, designed for the modern craft cafe.
          </p>
          <div className="auth-hero-stats">
            <div className="auth-stat">
              <span className="auth-stat-value">99.9%</span>
              <span className="auth-stat-label">UPTIME</span>
            </div>
            <div className="auth-stat-divider" />
            <div className="auth-stat">
              <span className="auth-stat-value">150+</span>
              <span className="auth-stat-label">INTEGRATIONS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Welcome Back</h2>
            <p className="auth-form-subtitle">Sign in to your terminal to start serving</p>
          </div>

          {error && (
            <div className="auth-error animate-shake">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="input-field"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="input-group">
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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
            </div>

            <div className="auth-options">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark" />
                <span>Remember me</span>
              </label>
              <a href="#" className="auth-link">Forgot Password?</a>
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
              disabled={loading}
              id="login-submit"
            >
              {loading ? 'Signing In...' : 'Sign In →'}
            </button>
          </form>

          <div className="divider">or</div>

          {/* Quick Demo Login */}
          <button
            type="button"
            className="btn btn-secondary btn-full demo-login-btn"
            onClick={handleDemoLogin}
            disabled={loading}
            id="demo-login"
          >
            <Coffee size={16} />
            Quick Demo Login (Admin)
          </button>

          <p className="auth-footer-text">
            Don't have an account? <Link to="/signup" className="auth-link-bold">Sign Up</Link>
          </p>

          {/* Terminal Status */}
          <div className="terminal-status">
            <div className="terminal-status-dot" />
            <div>
              <span className="terminal-status-label">TERMINAL STATUS</span>
              <span className="terminal-status-value">Secure & Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
